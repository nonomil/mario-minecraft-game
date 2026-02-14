/**
 * 06-biome.js - 生物群系与天气系统
 * 从 main.js 拆分 (原始行 1102-1243)
 */
function normalizeBiomeBundle(raw) {
    const out = raw && typeof raw === "object" ? raw : {};
    const switchCfg = out.switch && typeof out.switch === "object" ? out.switch : (out._switch && typeof out._switch === "object" ? out._switch : {});
    let biomes = out.biomes && typeof out.biomes === "object" ? out.biomes : out;
    if (biomes.switch) {
        const { switch: _ignored, ...rest } = biomes;
        biomes = rest;
    }
    if (!biomes || typeof biomes !== "object" || !biomes.forest) {
        return { biomes: JSON.parse(JSON.stringify(DEFAULT_BIOME_CONFIGS)), switch: JSON.parse(JSON.stringify(DEFAULT_BIOME_SWITCH)) };
    }
    return { biomes, switch: mergeDeep(DEFAULT_BIOME_SWITCH, switchCfg) };
}

function getBiomeById(id) {
    return biomeConfigs[id] || biomeConfigs.forest;
}

function getBiomeSwitchConfig() {
    const cfg = biomeSwitchConfig && typeof biomeSwitchConfig === "object" ? biomeSwitchConfig : DEFAULT_BIOME_SWITCH;
    const stepFromSettings = Number(settings?.biomeSwitchStepScore);
    const stepScore = isFinite(stepFromSettings) && stepFromSettings >= 50 ? stepFromSettings : (Number(cfg.stepScore) || 200);
    return { ...cfg, stepScore };
}

function getBiomeIdForScore(scoreValue) {
    const cfg = getBiomeSwitchConfig();
    const step = Math.max(1, Number(cfg.stepScore) || 200);
    const cycle = Math.floor((Number(scoreValue) || 0) / step);
    const order = (cfg.order || []).filter(id => biomeConfigs[id]);
    const baseOrder = order.length ? order : Object.keys(biomeConfigs);
    if (!baseOrder.length) return "forest";
    const unlock = cfg.unlockScore || {};
    const unlocked = baseOrder.filter(id => (Number(scoreValue) || 0) >= (Number(unlock[id]) || 0));
    const eligible = unlocked.length ? unlocked : [baseOrder[0]];
    return eligible[cycle % eligible.length];
}

function selectBiome(x, scoreValue) {
    let available = Object.values(biomeConfigs).filter(b => scoreValue >= b.spawnWeight.min && scoreValue <= b.spawnWeight.max);
    if (available.length < 2) {
        available = Object.values(biomeConfigs);
    }
    if (!available.length) return biomeConfigs.forest;
    const biomeLength = 2000 * worldScale.x;
    const idx = Math.floor(x / biomeLength) % available.length;
    return available[idx];
}

function updateCurrentBiome() {
    const nextBiome = getBiomeById(getBiomeIdForScore(getProgressScore()));
    if (nextBiome.id !== currentBiome) {
        currentBiome = nextBiome.id;
        biomeTransitionX = player.x;
        showToast(`🌍 进入${nextBiome.name}群系`);
        updateWeatherForBiome(nextBiome);
        const info = document.getElementById("level-info");
        if (info) info.innerText = `生态: ${nextBiome.name}`;
        if (currentBiome === "nether" && netherEntryPenaltyArmed) {
            playerHp = Math.max(0, playerHp - 1);
            updateHpUI();
            showFloatingText("🔥 -1❤️", player.x, player.y - 20);
            netherEntryPenaltyArmed = false;
            if (playerHp <= 0) {
                paused = true;
                showToast("💀 生命耗尽");
                setOverlay(true, "pause");
            }
        }
        if (currentBiome !== "nether") {
            netherEntryPenaltyArmed = true;
        }
    }
}

function updateWeatherForBiome(biome) {
    const options = biome.effects?.weather || ["clear"];
    weatherState.type = options[Math.floor(Math.random() * options.length)];
    weatherState.timer = 600 + Math.floor(Math.random() * 600);
}

function applyBiomeEffectsToPlayer() {
    const biome = getBiomeById(currentBiome);
    const speedMult = biome.effects?.speedMultiplier || 1;
    let nextSpeed = player.baseSpeed * speedMult;
    if (biome.effects?.waterLevel && player.y + player.height > biome.effects.waterLevel) {
        nextSpeed *= 0.65;
    }
    player.speed = nextSpeed;
    if (biome.effects?.damage && !biome.effects.onEnterOnly) {
        if (gameFrame % 90 === 0) {
            damagePlayer(biome.effects.damage, player.x, 30);
        }
    }
    // 地狱环境效果
    if (currentBiome === 'nether') updateNetherEnvironment();
    // 灵魂沙减速
    if (currentBiome === 'nether') checkSoulSandEffect();
    // 末地低重力
    if (currentBiome === 'end') updateEndEnvironment();
}

// ============ 地狱环境增强 ============
let netherHeatTimer = 0;
let netherMushrooms = [];
let fragilePlatforms = [];

function updateNetherEnvironment() {
    // 持续高温伤害（每10秒-0.5心）
    // 穿下界合金盔甲免疫
    if (playerEquipment && playerEquipment.armor === 'netherite') {
        netherHeatTimer = 0;
        return;
    }
    netherHeatTimer++;
    if (netherHeatTimer >= 600) {
        netherHeatTimer = 0;
        damagePlayer(0.5, player.x, 30);
        showFloatingText('🔥 环境太热了!', player.x + player.width / 2, player.y - 30, '#FF4500');
    }
}

function checkSoulSandEffect() {
    // 灵魂沙装饰物减速
    decorations.forEach(d => {
        if (d.type !== 'soul_sand') return;
        if (rectIntersect(player.x, player.y, player.width, player.height, d.x, d.y, d.width, d.height)) {
            player.velX *= 0.5;
        }
    });
}

function renderNetherHeatEffect(ctx) {
    if (currentBiome !== 'nether') return;
    // 屏幕边缘红色渐变
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    gradient.addColorStop(0, 'rgba(255,0,0,0)');
    gradient.addColorStop(1, 'rgba(255,0,0,0.15)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 岩浆池碰撞检测（掉落即死）
function checkLavaCollision() {
    if (currentBiome !== 'nether') return;
    decorations.forEach(d => {
        if (d.type !== 'lava_pool') return;
        if (rectIntersect(player.x, player.y + player.height - 5, player.width, 5, d.x, d.y, d.width, d.height)) {
            playerHp = 0;
            updateHpUI();
            showFloatingText('💀 掉进了岩浆!', player.x + player.width / 2, player.y - 30, '#FF0000');
            paused = true;
            showToast('💀 生命耗尽');
            setOverlay(true, 'pause');
        }
    });
}

// 红色蘑菇生成与采集
function spawnNetherMushrooms() {
    if (currentBiome !== 'nether' || netherMushrooms.length > 0) return;
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
        netherMushrooms.push({
            x: player.x + (Math.random() - 0.3) * 500,
            y: groundY - 16,
            width: 16, height: 16,
            collected: false
        });
    }
}

function updateNetherMushrooms() {
    if (currentBiome !== 'nether') { netherMushrooms = []; return; }
    spawnNetherMushrooms();
    netherMushrooms.forEach(m => {
        if (m.collected) return;
        if (rectIntersect(player.x, player.y, player.width, player.height, m.x, m.y, m.width, m.height)) {
            m.collected = true;
            playerHp = Math.min(playerHp + 1, playerMaxHp);
            updateHpUI();
            showFloatingText('+1 ❤️ 🍄', m.x, m.y - 10, '#FF4444');
        }
    });
}

function renderNetherMushrooms(ctx, camX) {
    netherMushrooms.forEach(m => {
        if (m.collected) return;
        const dx = m.x - camX;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(dx, m.y, m.width, m.height * 0.6);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(dx + 3, m.y + 2, 4, 4);
        ctx.fillRect(dx + 9, m.y + 4, 3, 3);
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(dx + 5, m.y + m.height * 0.6, 6, m.height * 0.4);
    });
}

function tickWeather() {
    weatherState.timer--;
    if (weatherState.timer <= 0) {
        updateWeatherForBiome(getBiomeById(currentBiome));
    }
}

function spawnBiomeParticles() {
    const biome = getBiomeById(currentBiome);
    const baseX = cameraX + Math.random() * canvas.width;
    if (biome.effects?.particles === "snowflakes" && Math.random() < 0.2) {
        particles.push(new Snowflake(baseX, -10));
    } else if (biome.effects?.particles === "leaves" && Math.random() < 0.15) {
        particles.push(new LeafParticle(baseX, -10));
    } else if (biome.effects?.particles === "dust" && Math.random() < 0.2) {
        particles.push(new DustParticle(baseX, Math.random() * canvas.height));
    } else if (biome.effects?.particles === "flames" && Math.random() < 0.2) {
        particles.push(new EmberParticle(baseX, canvas.height - 50));
    } else if (biome.effects?.particles === "bubbles" && Math.random() < 0.2) {
        particles.push(new BubbleParticle(baseX, canvas.height - 20));
    } else if (biome.effects?.particles === "sparkle" && Math.random() < 0.15) {
        particles.push(new SparkleParticle(baseX, Math.random() * canvas.height));
    } else if (biome.effects?.particles === "end_particles" && Math.random() < 0.18) {
        particles.push(new EndParticle(baseX, Math.random() * canvas.height));
    }

    if (weatherState.type === "rain" && Math.random() < 0.4) {
        particles.push(new RainParticle(baseX, -10));
    }
    if (weatherState.type === "snow" && Math.random() < 0.3) {
        particles.push(new Snowflake(baseX, -10));
    }
    if (weatherState.type === "sandstorm" && Math.random() < 0.35) {
        particles.push(new DustParticle(baseX, Math.random() * canvas.height));
    }
}

// 海洋环境渲染增强
function renderOceanEnvironment(ctx) {
    if (currentBiome !== 'ocean') return;
    // 深蓝色渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1E90FF');
    gradient.addColorStop(0.3, '#1565C0');
    gradient.addColorStop(1, '#0D2137');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 水面波纹
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += 4) {
        const y = 20 + Math.sin(x / 30 + Date.now() / 500) * 5;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    // 光束效果
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 3; i++) {
        const lx = canvas.width * (0.2 + i * 0.3) + Math.sin(Date.now() / 2000 + i) * 20;
        ctx.beginPath();
        ctx.moveTo(lx - 5, 0);
        ctx.lineTo(lx + 5, 0);
        ctx.lineTo(lx + 30, canvas.height);
        ctx.lineTo(lx - 30, canvas.height);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// 渲染气泡粒子（水下）
function renderSwimBubbles(ctx, camX) {
    if (currentBiome !== 'ocean') return;
    particles.forEach(p => {
        if (p.type !== 'bubble') return;
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        p.life -= 0.01;
        p.size = (p.size || 3) * 1.002;
        ctx.globalAlpha = p.life * 0.6;
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x - camX, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
    });
    ctx.globalAlpha = 1;
}

// ============ 末地环境 ============
let endPortals = [];
let endCrystals = [];
let endCreatures = [];
let endSpeedBuff = { active: false, timer: 0, multiplier: 1.4 };

function updateEndEnvironment() {
    // 低重力效果
    const biome = getBiomeById('end');
    const gravMult = biome.effects?.gravityMultiplier || 0.65;
    const jumpMult = biome.effects?.jumpMultiplier || 1.5;
    player.velY *= gravMult + (1 - gravMult) * 0.5; // 缓降
    // 速度buff
    if (endSpeedBuff.active) {
        endSpeedBuff.timer--;
        player.speed = player.baseSpeed * endSpeedBuff.multiplier;
        if (endSpeedBuff.timer <= 0) {
            endSpeedBuff.active = false;
            player.speed = player.baseSpeed;
        }
    }
    // 生成末地实体
    spawnEndEntities();
    updateEndPortals();
    updateEndCreatures();
    updateEndCrystals();
}

function spawnEndEntities() {
    // 传送门
    if (endPortals.length === 0) {
        for (let i = 0; i < 2; i++) {
            endPortals.push({
                x: player.x + 200 + Math.random() * 400,
                y: groundY - 60,
                width: 40, height: 60,
                cooldown: 0, animFrame: 0
            });
        }
    }
    // 紫水晶
    if (endCrystals.length === 0) {
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            endCrystals.push({
                x: player.x + 100 + Math.random() * 500,
                y: groundY - 20,
                width: 16, height: 20,
                collected: false
            });
        }
    }
    // 末地生物
    if (endCreatures.length === 0) {
        // 末影螨
        for (let i = 0; i < 2; i++) {
            endCreatures.push(new Endermite(
                player.x + 150 + Math.random() * 400,
                groundY - 80 - Math.random() * 100
            ));
        }
        // 潜影贝
        endCreatures.push(new ShulkerTurret(
            player.x + 300 + Math.random() * 300,
            groundY - 40
        ));
    }
}

// 传送门
function updateEndPortals() {
    endPortals.forEach(p => {
        p.animFrame++;
        if (p.cooldown > 0) { p.cooldown--; return; }
        if (rectIntersect(player.x, player.y, player.width, player.height, p.x, p.y, p.width, p.height)) {
            // 传送到随机安全平台
            const safePlatforms = platforms.filter(pl => pl.x > cameraX && pl.x < cameraX + canvas.width * 2);
            if (safePlatforms.length > 0) {
                const target = safePlatforms[Math.floor(Math.random() * safePlatforms.length)];
                player.x = target.x + target.width / 2;
                player.y = target.y - player.height - 10;
                player.velY = 0;
                showFloatingText('🌀 传送!', player.x, player.y - 20, '#9C27B0');
            }
            p.cooldown = 180; // 3秒冷却
        }
    });
}

// 紫水晶采集
function updateEndCrystals() {
    endCrystals.forEach(c => {
        if (c.collected) return;
        if (rectIntersect(player.x, player.y, player.width, player.height, c.x, c.y, c.width, c.height)) {
            c.collected = true;
            endSpeedBuff.active = true;
            endSpeedBuff.timer = 300; // 5秒
            showFloatingText('⚡ 加速!', c.x, c.y - 15, '#E040FB');
        }
    });
}

// 末地生物更新
function updateEndCreatures() {
    endCreatures.forEach(c => c.update());
    endCreatures = endCreatures.filter(c => c.alive);
}

// 末地环境渲染
function renderEndEnvironment(ctx) {
    if (currentBiome !== 'end') return;
    // 深紫色虚空背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0D0015');
    gradient.addColorStop(0.5, '#1A0A2E');
    gradient.addColorStop(1, '#2D1B4E');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 星星
    ctx.fillStyle = 'rgba(200,180,255,0.6)';
    for (let i = 0; i < 30; i++) {
        const sx = (i * 137 + Math.sin(Date.now() / 3000 + i) * 5) % canvas.width;
        const sy = (i * 89 + Math.cos(Date.now() / 4000 + i) * 3) % (canvas.height * 0.6);
        ctx.fillRect(sx, sy, 2, 2);
    }
}

// 末地实体渲染（世界坐标内）
function renderEndEntities(ctx, camX) {
    if (currentBiome !== 'end') return;
    // 传送门
    endPortals.forEach(p => {
        const dx = p.x - camX;
        const pulse = Math.sin(p.animFrame * 0.05) * 0.2 + 0.8;
        ctx.globalAlpha = p.cooldown > 0 ? 0.3 : pulse;
        // 外框
        ctx.fillStyle = '#4A148C';
        ctx.fillRect(dx - 2, p.y - 2, p.width + 4, p.height + 4);
        // 内部漩涡
        const grad = ctx.createLinearGradient(dx, p.y, dx + p.width, p.y + p.height);
        grad.addColorStop(0, '#7B1FA2');
        grad.addColorStop(0.5, '#E040FB');
        grad.addColorStop(1, '#7B1FA2');
        ctx.fillStyle = grad;
        ctx.fillRect(dx, p.y, p.width, p.height);
        // 漩涡纹理
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const cy = p.y + p.height / 2 + Math.sin(p.animFrame * 0.08 + i * 2) * (p.height * 0.3);
            ctx.beginPath();
            ctx.arc(dx + p.width / 2, cy, 8 + i * 4, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    });
    // 紫水晶
    endCrystals.forEach(c => {
        if (c.collected) return;
        const dx = c.x - camX;
        const bob = Math.sin(Date.now() / 400) * 3;
        ctx.fillStyle = '#CE93D8';
        // 菱形
        ctx.beginPath();
        ctx.moveTo(dx + c.width / 2, c.y - 4 + bob);
        ctx.lineTo(dx + c.width, c.y + c.height / 2 + bob);
        ctx.lineTo(dx + c.width / 2, c.y + c.height + bob);
        ctx.lineTo(dx, c.y + c.height / 2 + bob);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.moveTo(dx + c.width / 2, c.y - 2 + bob);
        ctx.lineTo(dx + c.width * 0.7, c.y + c.height * 0.3 + bob);
        ctx.lineTo(dx + c.width / 2, c.y + c.height * 0.5 + bob);
        ctx.closePath();
        ctx.fill();
    });
    // 末地生物
    endCreatures.forEach(c => c.render(ctx, camX));
}

// 末地速度buff UI
function renderEndSpeedBuff(ctx) {
    if (!endSpeedBuff.active) return;
    ctx.fillStyle = 'rgba(156,39,176,0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#E040FB';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ 加速中 ${Math.ceil(endSpeedBuff.timer / 60)}s`, canvas.width / 2, canvas.height - 30);
    ctx.textAlign = 'left';
}

// 离开末地时清理
function clearEndEntities() {
    endPortals = [];
    endCrystals = [];
    endCreatures = [];
    endSpeedBuff.active = false;
}

let baseCanvasSize = null;
let baseGameConfig = null;
let baseEnemyStats = null;
let baseWeapons = null;
let baseBiomeConfigs = null;
let baseCloudPlatformConfig = null;
let worldScale = { x: 1, y: 1, unit: 1 };
let lastViewport = { width: 0, height: 0 };
// Mobile browsers often change the visual viewport (URL bar show/hide) right after first interaction.
// If we pause+reset immediately, the start overlay can appear "unclickable". We ignore viewport changes briefly.
let viewportIgnoreUntilMs = 0;
