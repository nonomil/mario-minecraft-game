/**
 * 21-decorations-new.js - 新群系装饰实体 (v1.7.0)
 * 樱花丛林、蘑菇岛、火山、深暗之域、天空之城专用装饰
 */

// ============ 樱花丛林装饰 ============

class CherryTree extends Tree {
    constructor(x, y) {
        super(x, y, "cherry");
        this.reset(x, y);
    }

    reset(x, y) {
        this.resetBase(x, y, "cherry", "cherry_grove");
        this.width = blockSize * 1.8;
        this.height = blockSize * 3.0;
        this.hp = 6;
        this.biome = "cherry_grove";
        this.petals = 0;
        this.maxPetals = 5 + Math.floor(Math.random() * 6);
        const blossomCount = 15 + Math.floor(Math.random() * 6);
        this.blossomOffsets = Array.from({ length: blossomCount }, () => ({
            x: (Math.random() - 0.5) * this.width * 0.6,
            y: (Math.random() - 0.5) * this.height * 0.42,
            size: 5 + Math.random() * 2,
            color: ["#FF69B4", "#FFB7C5", "#FFC0CB"][Math.floor(Math.random() * 3)]
        }));
        this.branchOffsets = Array.from({ length: 3 }, (_, idx) => ({
            x: (idx - 1) * (this.width * 0.18),
            y: this.height * (0.58 - idx * 0.05),
            len: 10 + Math.random() * 6
        }));
    }

    hit() {
        this.hp--;
        this.shake = 8;
        if (this.hp <= 0) {
            this.remove = true;
            dropItem("stick", this.x + this.width / 2, this.y + this.height - blockSize * 0.4);
            dropItem("flower", this.x + this.width / 2, this.y + this.height - blockSize * 0.4);
        } else {
            // 樱花树被击中时掉落花瓣
            if (this.petals < this.maxPetals && Math.random() < 0.3) {
                this.petals++;
                // 触发樱花花瓣交互链
                if (typeof incrementChainProgress === 'function') {
                    incrementChainProgress('cherry_grove', 'petal');
                }
            }
        }
    }
}

class FlowerCluster extends Decoration {
    constructor(x, y) {
        super(x, y, "flower_cluster", "cherry_grove");
        this.reset(x, y);
    }

    reset(x, y) {
        this.resetBase(x, y, "flower_cluster", "cherry_grove");
        this.width = 24;
        this.height = 20;
        this.collectible = true;
        this.color = ["#FFB7C5", "#FFC0CB", "#FFE4E1"][Math.floor(Math.random() * 3)];
        this.petalCount = 1 + Math.floor(Math.random() * 2);
    }

    interact() {
        // 樱花花簇交互链
        if (typeof incrementChainProgress === 'function') {
            for (let i = 0; i < this.petalCount; i++) {
                incrementChainProgress('cherry_grove', 'petal');
            }
        }
        this.remove = true;
        showFloatingText(`🌸 +${this.petalCount}`, this.x, this.y, "#FFB7C5");
    }
}

class ButterflyDecor extends Decoration {
    constructor(x, y) {
        super(x, y, "butterfly", "cherry_grove");
        this.reset(x, y);
    }

    reset(x, y) {
        this.resetBase(x, y, "butterfly", "cherry_grove");
        this.width = 12;
        this.height = 10;
        this.animated = true;
        this.flightOffset = Math.random() * Math.PI * 2;
        this.flightSpeed = 0.02 + Math.random() * 0.02;
        this.hoverY = y;
        this.startX = x;
        this.flightRange = 40 + Math.random() * 30;
    }

    update() {
        super.update();
        // 蝴蝶飞行动画
        this.flightOffset += this.flightSpeed;
        this.x = this.startX + Math.sin(this.flightOffset) * this.flightRange;
        this.y = this.hoverY + Math.cos(this.flightOffset * 1.3) * 8;
    }
}

class SmallStreamDecor extends Decoration {
    constructor(x, y) {
        super(x, y, "small_stream", "cherry_grove");
        this.reset(x, y);
    }

    reset(x, y) {
        this.resetBase(x, y, "small_stream", "cherry_grove");
        this.width = 60 + Math.random() * 40;
        this.height = 12;
        this.interactive = true;
        this.animated = true;
    }

    onCollision(entity) {
        if (entity === player && entity.grounded) {
            entity.velX *= 0.85; // 水流减速
        }
    }
}

// ============ 蘑菇岛装饰 ============

class GiantMushroom extends Tree {
    constructor(x, y) {
        super(x, y, "giant_mushroom");
        this.reset(x, y);
    }

    reset(x, y) {
        this.resetBase(x, y, "giant_mushroom", "mushroom_island");
        this.width = blockSize * 3.0;
        this.height = blockSize * 2.8;
        this.hp = 8;
        this.biome = "mushroom_island";
        this.mushroomType = Math.random() < 0.5 ? "brown" : "red";
        this.bounceFactor = 1.5;
        this.capSpots = Array.from({ length: 5 + Math.floor(Math.random() * 4) }, () => ({
            x: (Math.random() - 0.5) * this.width * 0.5,
            y: (Math.random() - 0.5) * this.height * 0.28,
            r: 2.5 + Math.random() * 2
        }));
        this.capFloatPhase = Math.random() * Math.PI * 2;
    }

    hit() {
        this.hp--;
        this.shake = 8;
        if (this.hp <= 0) {
            this.remove = true;
            dropItem("mushroom", this.x + this.width / 2, this.y + this.height - blockSize * 0.4);
            dropItem("mushroom", this.x + this.width / 2, this.y + this.height - blockSize * 0.4);
        }
    }

    onCollision(entity) {
        if (entity === player) {
            // 蘑菇岛弹跳效果
            const bounceVelocity = -8 * (typeof gameConfig !== 'undefined' ? gameConfig.physics.gravity * 20 : 0.8);
            if (entity.velY > 0 && entity.y + entity.height > this.y + this.height * 0.7) {
                entity.velY = bounceVelocity * this.bounceFactor;
                showFloatingText("🍄 弹跳!", entity.x, entity.y - 30, "#BA55D3");

                // 触发蘑菇岛弹跳连击交互链
                if (typeof incrementMushroomBounce === 'function') {
                    const bounceChain = incrementMushroomBounce(this.y);
                    if (bounceChain && bounceChain.bounceMultiplier) {
                        entity.velY = bounceVelocity * bounceChain.bounceMultiplier;
                    }
                }
            }
        }
    }
}

class GlowMushroom extends Decoration {
    constructor(x, y) {
        super(x, y, "glow_mushroom", "mushroom_island");
        this.reset(x, y);
    }

    reset(x, y) {
        this.resetBase(x, y, "glow_mushroom", "mushroom_island");
        this.width = 16;
        this.height = 18;
        this.collectible = true;
        this.animated = true;
        this.glowIntensity = 0.5 + Math.random() * 0.5;
        this.glowPhase = Math.random() * Math.PI * 2;
    }

    update() {
        super.update();
        this.glowPhase += 0.05;
    }

    interact() {
        inventory.mushroom = (inventory.mushroom || 0) + 1;
        this.remove = true;
        showFloatingText("✨ +1 蘑菇", this.x, this.y, "#BA55D3");
        updateInventoryUI();
    }
}

class MushroomCow extends Decoration {
    constructor(x, y) {
        super(x, y, "mushroom_cow", "mushroom_island");
        this.reset(x, y);
    }

    reset(x, y) {
        this.resetBase(x, y, "mushroom_cow", "mushroom_island");
        this.width = 32;
        this.height = 24;
        this.animated = true;
        this.walkOffset = Math.random() * Math.PI * 2;
        this.startX = x;
        this.walkRange = 50 + Math.random() * 50;
    }

    update() {
        super.update();
        this.walkOffset += 0.01;
        this.x = this.startX + Math.sin(this.walkOffset) * this.walkRange;
    }
}

// ============ 火山装饰 ============

class MagmaCrack extends Decoration {
    constructor(x, y, width) {
        super(x, y, "magma_crack", "volcano");
        this.reset(x, y, width);
    }

    reset(x, y, width) {
        this.resetBase(x, y, "magma_crack", "volcano");
        this.width = width || (30 + Math.random() * 50);
        this.height = 8;
        this.harmful = true;
        this.damage = 4;
        this.animated = true;
        this.glowPhase = Math.random() * Math.PI * 2;
    }

    update() {
        super.update();
        this.glowPhase += 0.08;
        // 随机喷发
        if (Math.random() < 0.005) {
            showFloatingText("🔥", this.x + Math.random() * this.width, this.y, "#FF4500");
        }
    }

    onCollision() {
        if (this.harmful) {
            damagePlayer(this.damage, this.x, 30);
        }
    }
}

class HotSpring extends Decoration {
    constructor(x, y) {
        super(x, y, "hot_spring", "volcano");
        this.reset(x, y);
    }

    reset(x, y) {
        this.resetBase(x, y, "hot_spring", "volcano");
        this.width = 50 + Math.random() * 30;
        this.height = 16;
        this.interactive = true;
        this.healAmount = 2;
        this.healCooldown = 60;
        this.steamParticles = [];
    }

    update() {
        super.update();
        if (this.healCooldown > 0) this.healCooldown--;

        // 生成蒸汽粒子
        if (Math.random() < 0.1) {
            this.steamParticles.push({
                x: this.x + Math.random() * this.width,
                y: this.y,
                vy: -1 - Math.random() * 0.5,
                life: 60,
                maxLife: 60
            });
        }

        // 更新蒸汽粒子
        this.steamParticles = this.steamParticles.filter(p => {
            p.y += p.vy;
            p.life--;
            return p.life > 0;
        });
    }

    onCollision(entity) {
        if (entity === player && this.healCooldown === 0) {
            healPlayer(this.healAmount);
            this.healCooldown = 120;
            showFloatingText("♨️ 温泉!", this.x, this.y - 20, "#FF6347");
        }
    }
}

class ObsidianPillar extends Decoration {
    constructor(x, y, height) {
        super(x, y, "obsidian_pillar", "volcano");
        this.reset(x, y, height);
    }

    reset(x, y, height) {
        this.resetBase(x, y, "obsidian_pillar", "volcano");
        this.width = 20 + Math.random() * 10;
        this.height = height || (60 + Math.random() * 80);
        this.interactive = true;
    }

    onCollision(entity) {
        if (entity === player && entity.grounded) {
            entity.velX *= 0.8; // 黑曜石柱减速
        }
    }
}

// ============ 深暗之域装饰 ============

class SculkSensor extends Decoration {
    constructor(x, y) {
        super(x, y, "sculk_sensor", "deep_dark");
        this.reset(x, y);
    }

    reset(x, y) {
        this.resetBase(x, y, "sculk_sensor", "deep_dark");
        this.width = 20;
        this.height = 24;
        this.animated = true;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.activationRange = 120;
        this.activated = false;
    }

    update() {
        super.update();
        this.pulsePhase += 0.05;

        // 检测玩家距离
        if (typeof player !== 'undefined') {
            const dist = Math.abs(this.x - player.x);
            const wasActivated = this.activated;
            this.activated = dist < this.activationRange;

            if (!wasActivated && this.activated) {
                showFloatingText("👁️ 幽匿感知", this.x, this.y - 20, "#008080");
                if (typeof addDeepDarkNoise === "function") addDeepDarkNoise(20);
            }
        }
    }
}

class SoulLantern extends Decoration {
    constructor(x, y) {
        super(x, y, "soul_lantern", "deep_dark");
        this.reset(x, y);
    }

    reset(x, y) {
        this.resetBase(x, y, "soul_lantern", "deep_dark");
        this.width = 12;
        this.height = 18;
        this.animated = true;
        this.flickerPhase = Math.random() * Math.PI * 2;
    }

    update() {
        super.update();
        this.flickerPhase += 0.15;
    }
}

// ============ 天空之城装饰 ============

class AncientPillarDecor extends Decoration {
    constructor(x, y) {
        super(x, y, "ancient_pillar", "deep_dark");
        this.reset(x, y);
    }

    reset(x, y) {
        this.resetBase(x, y, "ancient_pillar", "deep_dark");
        this.width = 20;
        this.height = 60;
    }
}

class SculkVeinDecor extends Decoration {
    constructor(x, y) {
        super(x, y, "sculk_vein_patch", "deep_dark");
        this.reset(x, y);
    }

    reset(x, y) {
        this.resetBase(x, y, "sculk_vein_patch", "deep_dark");
        this.width = 48 + Math.random() * 34;
        this.height = 10 + Math.random() * 8;
    }
}

class CloudPlatform extends Platform {
    constructor(x, y, width) {
        super(x, y, width || (80 + Math.random() * 60), 20);
        this.type = "cloud";
        this.biome = "sky_dimension";
        this.animated = true;
        this.driftOffset = Math.random() * Math.PI * 2;
        this.driftSpeed = 0.005 + Math.random() * 0.01;
        this.startX = x;
        this.driftRange = 30 + Math.random() * 20;
    }

    update() {
        this.driftOffset += this.driftSpeed;
        this.x = this.startX + Math.sin(this.driftOffset) * this.driftRange;
    }
}

// ============ 新群系装饰工厂 ============
function spawnBiomeDecoration(biomeId, x, y, groundY) {
    let decor = null;

    switch (biomeId) {
        case "cherry_grove":
            decor = spawnCherryGroveDecoration(x, y, groundY);
            break;
        case "mushroom_island":
            decor = spawnMushroomIslandDecoration(x, y, groundY);
            break;
        case "volcano":
            decor = spawnVolcanoDecoration(x, y, groundY);
            break;
        case "deep_dark":
            decor = spawnDeepDarkDecoration(x, y, groundY);
            break;
        case "sky_dimension":
            decor = spawnSkyDimensionDecoration(x, y, groundY);
            break;
    }

    return decor;
}

function spawnCherryGroveDecoration(x, y, groundY) {
    const roll = Math.random();

    if (roll < 0.25) {
        spawnDecoration("cherry_tree",
            (d) => d.reset(x, groundY),
            () => new CherryTree(x, groundY)
        );
    } else if (roll < 0.5) {
        spawnDecoration("flower_cluster",
            (d) => d.reset(x, groundY - 20),
            () => new FlowerCluster(x, groundY - 20)
        );
    } else if (roll < 0.7) {
        spawnDecoration("butterfly",
            (d) => d.reset(x, groundY - 30 - Math.random() * 40),
            () => new ButterflyDecor(x, groundY - 30 - Math.random() * 40)
        );
    } else if (roll < 0.85) {
        spawnDecoration("small_stream",
            (d) => d.reset(x, groundY - 6),
            () => new SmallStreamDecor(x, groundY - 6)
        );
    }
}

function spawnMushroomIslandDecoration(x, y, groundY) {
    const roll = Math.random();

    if (roll < 0.35) {
        spawnDecoration("giant_mushroom",
            (d) => d.reset(x, groundY),
            () => new GiantMushroom(x, groundY)
        );
    } else if (roll < 0.65) {
        spawnDecoration("glow_mushroom",
            (d) => d.reset(x, groundY - 18),
            () => new GlowMushroom(x, groundY - 18)
        );
    } else if (roll < 0.8) {
        spawnDecoration("mushroom_cow",
            (d) => d.reset(x, groundY - 24),
            () => new MushroomCow(x, groundY - 24)
        );
    }
}

function spawnVolcanoDecoration(x, y, groundY) {
    const roll = Math.random();

    if (roll < 0.3) {
        spawnDecoration("magma_crack",
            (d) => d.reset(x, groundY - 4, 30 + Math.random() * 50),
            () => new MagmaCrack(x, groundY - 4, 30 + Math.random() * 50)
        );
    } else if (roll < 0.5) {
        spawnDecoration("hot_spring",
            (d) => d.reset(x, groundY - 8),
            () => new HotSpring(x, groundY - 8)
        );
    } else if (roll < 0.7) {
        spawnDecoration("obsidian_pillar",
            (d) => d.reset(x, groundY, 60 + Math.random() * 80),
            () => new ObsidianPillar(x, groundY, 60 + Math.random() * 80)
        );
    }
}

function spawnDeepDarkDecoration(x, y, groundY) {
    const roll = Math.random();

    if (roll < 0.32) {
        spawnDecoration("sculk_sensor",
            (d) => d.reset(x, groundY - 24),
            () => new SculkSensor(x, groundY - 24)
        );
    } else if (roll < 0.56) {
        spawnDecoration("soul_lantern",
            (d) => d.reset(x, groundY - 18),
            () => new SoulLantern(x, groundY - 18)
        );
    } else if (roll < 0.78) {
        spawnDecoration("ancient_pillar",
            (d) => d.reset(x, groundY - 60),
            () => new AncientPillarDecor(x, groundY - 60)
        );
    } else if (roll < 0.98) {
        spawnDecoration("sculk_vein_patch",
            (d) => d.reset(x, groundY - 8),
            () => new SculkVeinDecor(x, groundY - 8)
        );
    }
}

function spawnSkyDimensionDecoration(x, y, groundY) {
    // 云端平台作为特殊平台生成
    if (Math.random() < 0.4) {
        const cloudY = groundY - 80 - Math.random() * 60;
        const cloud = new CloudPlatform(x, cloudY, 80 + Math.random() * 60);
        platforms.push(cloud);
    }
}

const cherryPetalParticles = [];
const mushroomSporeParticles = [];

function updateAndRenderCherryPetals(ctx, camX) {
    for (const petal of cherryPetalParticles) {
        petal.life--;
        petal.x += petal.vx + Math.sin((gameFrame + petal.phase) * 0.05) * 0.22;
        petal.y += petal.vy;
        if (petal.life <= 0 || petal.y > groundY + 90) {
            petal.remove = true;
            continue;
        }
        const alpha = Math.max(0.12, petal.life / petal.maxLife);
        ctx.fillStyle = `rgba(255, 184, 197, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(petal.x - camX, petal.y, petal.size, petal.size * 0.68, petal.rot, 0, Math.PI * 2);
        ctx.fill();
        petal.rot += 0.03;
    }
    for (let idx = cherryPetalParticles.length - 1; idx >= 0; idx--) {
        if (cherryPetalParticles[idx].remove) cherryPetalParticles.splice(idx, 1);
    }
}

function updateAndRenderMushroomSpores(ctx, camX) {
    for (const spore of mushroomSporeParticles) {
        spore.life--;
        spore.x += spore.vx;
        spore.y += spore.vy;
        if (spore.life <= 0 || spore.y < -20) {
            spore.remove = true;
            continue;
        }
        const alpha = Math.max(0.1, spore.life / spore.maxLife);
        ctx.fillStyle = `rgba(216, 198, 250, ${alpha})`;
        ctx.beginPath();
        ctx.arc(spore.x - camX, spore.y, spore.size, 0, Math.PI * 2);
        ctx.fill();
    }
    for (let idx = mushroomSporeParticles.length - 1; idx >= 0; idx--) {
        if (mushroomSporeParticles[idx].remove) mushroomSporeParticles.splice(idx, 1);
    }
}

// ============ 渲染扩展 ============
function renderNewBiomeDecorations(ctx, camX, renderCamX = camX) {
    decorations.forEach(d => {
        if (d.remove) return;
        if (d.x + d.width < camX || d.x > camX + canvas.width) return;

        // 渲染新装饰类型
        switch (d.type) {
            case "cherry":
                renderCherryTree(ctx, d, renderCamX);
                break;
            case "flower_cluster":
                renderFlowerCluster(ctx, d, renderCamX);
                break;
            case "butterfly":
                renderButterfly(ctx, d, renderCamX);
                break;
            case "small_stream":
                renderSmallStream(ctx, d, renderCamX);
                break;
            case "giant_mushroom":
                renderGiantMushroom(ctx, d, renderCamX);
                break;
            case "glow_mushroom":
                renderGlowMushroom(ctx, d, renderCamX);
                break;
            case "mushroom_cow":
                renderMushroomCow(ctx, d, renderCamX);
                break;
            case "magma_crack":
                renderMagmaCrack(ctx, d, renderCamX);
                break;
            case "hot_spring":
                renderHotSpring(ctx, d, renderCamX);
                break;
            case "obsidian_pillar":
                renderObsidianPillar(ctx, d, renderCamX);
                break;
            case "sculk_sensor":
                renderSculkSensor(ctx, d, renderCamX);
                break;
            case "soul_lantern":
                renderSoulLantern(ctx, d, renderCamX);
                break;
            case "ancient_pillar":
                renderAncientPillar(ctx, d, renderCamX);
                break;
            case "sculk_vein_patch":
                renderSculkVeinPatch(ctx, d, renderCamX);
                break;
            case "cloud_platform":
                renderCloudPlatform(ctx, d, renderCamX);
                break;
        }
    });
    updateAndRenderCherryPetals(ctx, renderCamX);
    updateAndRenderMushroomSpores(ctx, renderCamX);
}

// ============ 装饰渲染函数 ============
function renderCherryTree(ctx, d, camX) {
    const dx = d.x - camX;
    // 树干
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(dx + d.width * 0.4, d.y + d.height * 0.5, d.width * 0.2, d.height * 0.5);

    // 树冠基底（绿色）
    ctx.fillStyle = "#5A8F3C";
    ctx.beginPath();
    ctx.arc(dx + d.width / 2, d.y + d.height * 0.3, d.width * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 樱花覆盖层（半透明）
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = "#FFB7C5";
    ctx.beginPath();
    ctx.arc(dx + d.width / 2, d.y + d.height * 0.3, d.width * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // 树干花枝细节
    ctx.strokeStyle = "#8D6E63";
    ctx.lineWidth = 2;
    const branchOffsets = Array.isArray(d.branchOffsets) ? d.branchOffsets : [];
    for (const branch of branchOffsets) {
        const startX = dx + d.width * 0.5;
        const startY = d.y + branch.y;
        const endX = startX + branch.x;
        const endY = startY - branch.len * 0.55;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.fillStyle = "#FFC0CB";
        ctx.beginPath();
        ctx.arc(endX, endY, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // 多色花瓣点缀
    const blossomOffsets = Array.isArray(d.blossomOffsets) ? d.blossomOffsets : [];
    for (const spot of blossomOffsets) {
        const ox = spot.x;
        const oy = spot.y;
        const size = spot.size || 4;
        ctx.fillStyle = spot.color || "#FFC0CB";
        ctx.beginPath();
        ctx.arc(dx + d.width / 2 + ox, d.y + d.height * 0.3 + oy, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 花瓣飘落
    if (Math.random() < 0.02 && cherryPetalParticles.length < 120) {
        cherryPetalParticles.push({
            x: d.x + d.width * (0.25 + Math.random() * 0.5),
            y: d.y + d.height * (0.15 + Math.random() * 0.25),
            vx: (Math.random() - 0.5) * 0.45,
            vy: 0.35 + Math.random() * 0.3,
            phase: Math.random() * Math.PI * 2,
            size: 2.5 + Math.random() * 1.8,
            rot: Math.random() * Math.PI,
            life: 150 + Math.floor(Math.random() * 80),
            maxLife: 220
        });
    }
}

function renderFlowerCluster(ctx, d, camX) {
    const dx = d.x - camX;
    ctx.fillStyle = d.color;
    for (let i = 0; i < 3; i++) {
        const ox = i * 6;
        ctx.beginPath();
        ctx.arc(dx + ox, d.y + 8, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    // 茎
    ctx.strokeStyle = "#228B22";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dx + 6, d.y + 12);
    ctx.lineTo(dx + 6, d.y + d.height);
    ctx.stroke();
}

function renderButterfly(ctx, d, camX) {
    const dx = d.x - camX;
    ctx.fillStyle = "#FFB7C5";
    // 翅膀
    ctx.beginPath();
    ctx.ellipse(dx - 3, d.y + 5, 4, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(dx + 3, d.y + 5, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // 身体
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.ellipse(dx, d.y + 5, 1, 3, 0, 0, Math.PI * 2);
    ctx.fill();
}

function renderSmallStream(ctx, d, camX) {
    const dx = d.x - camX;
    const gradient = ctx.createLinearGradient(dx, d.y, dx + d.width, d.y);
    gradient.addColorStop(0, "rgba(135, 206, 235, 0.6)");
    gradient.addColorStop(0.5, "rgba(135, 206, 235, 0.8)");
    gradient.addColorStop(1, "rgba(135, 206, 235, 0.6)");
    ctx.fillStyle = gradient;
    ctx.fillRect(dx, d.y, d.width, d.height);
}

function renderGiantMushroom(ctx, d, camX) {
    const dx = d.x - camX;
    const capYOffset = Math.sin(gameFrame * 0.02 + (d.capFloatPhase || 0)) * 2;
    // 菌柄
    ctx.fillStyle = d.mushroomType === "brown" ? "#8B4513" : "#F5F5DC";
    ctx.fillRect(dx + d.width * 0.36, d.y + d.height * 0.56, d.width * 0.28, d.height * 0.44);
    ctx.fillStyle = "rgba(120, 95, 75, 0.28)";
    for (let line = 0; line < 3; line++) {
        const lineX = dx + d.width * (0.4 + line * 0.08);
        ctx.fillRect(lineX, d.y + d.height * 0.58, 1.5, d.height * 0.4);
    }
    // 菌盖
    ctx.fillStyle = d.mushroomType === "brown" ? "#D2691E" : "#FF6347";
    ctx.beginPath();
    ctx.ellipse(dx + d.width / 2, d.y + d.height * 0.35 + capYOffset, d.width * 0.47, d.height * 0.33, 0, 0, Math.PI * 2);
    ctx.fill();
    // 斑点
    ctx.fillStyle = d.mushroomType === "brown" ? "#F5F5DC" : "#FFFFFF";
    const capSpots = Array.isArray(d.capSpots) ? d.capSpots : [];
    for (const spot of capSpots) {
        const ox = spot.x;
        const oy = spot.y;
        const radius = spot.r || 3;
        ctx.beginPath();
        ctx.arc(dx + d.width / 2 + ox, d.y + d.height * 0.35 + capYOffset + oy, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // 伞盖下孢子粒子
    if (Math.random() < 0.06 && mushroomSporeParticles.length < 160) {
        mushroomSporeParticles.push({
            x: d.x + d.width * (0.3 + Math.random() * 0.4),
            y: d.y + d.height * 0.48 + capYOffset,
            vx: (Math.random() - 0.5) * 0.25,
            vy: -(0.25 + Math.random() * 0.3),
            size: 1.2 + Math.random() * 1.4,
            life: 90 + Math.floor(Math.random() * 60),
            maxLife: 150
        });
    }
}

function renderGlowMushroom(ctx, d, camX) {
    const dx = d.x - camX;
    // 发光效果
    const glowAlpha = 0.3 + Math.sin(d.glowPhase) * 0.2;
    ctx.fillStyle = `rgba(186, 85, 211, ${glowAlpha})`;
    ctx.beginPath();
    ctx.arc(dx + d.width / 2, d.y + d.height / 2, 12, 0, Math.PI * 2);
    ctx.fill();
    // 蘑菇
    ctx.fillStyle = "#9370DB";
    ctx.beginPath();
    ctx.ellipse(dx + d.width / 2, d.y + d.height * 0.4, d.width * 0.4, d.height * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
}

function renderMushroomCow(ctx, d, camX) {
    const dx = d.x - camX;
    // 身体
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(dx + 4, d.y + 8, d.width - 8, d.height - 8);
    // 蘑菇斑点
    ctx.fillStyle = "#BA55D3";
    ctx.beginPath();
    ctx.arc(dx + 8, d.y + 12, 3, 0, Math.PI * 2);
    ctx.arc(dx + d.width - 8, d.y + 14, 3, 0, Math.PI * 2);
    ctx.fill();
    // 头
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(dx + d.width / 2 - 4, d.y, 8, 8);
}

function renderMagmaCrack(ctx, d, camX) {
    const dx = d.x - camX;
    // 熔岩发光
    const glowAlpha = 0.6 + Math.sin(d.glowPhase) * 0.3;
    ctx.fillStyle = `rgba(255, 69, 0, ${glowAlpha})`;
    ctx.fillRect(dx, d.y, d.width, d.height);
    // 边缘
    ctx.strokeStyle = "#8B0000";
    ctx.lineWidth = 2;
    ctx.strokeRect(dx, d.y, d.width, d.height);
}

function renderHotSpring(ctx, d, camX) {
    const dx = d.x - camX;
    // 水面
    ctx.fillStyle = "rgba(135, 206, 235, 0.7)";
    ctx.fillRect(dx, d.y, d.width, d.height);
    // 蒸汽粒子
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    d.steamParticles.forEach(p => {
        const alpha = p.life / p.maxLife * 0.5;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(d.x + p.x - camX, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function renderObsidianPillar(ctx, d, camX) {
    const dx = d.x - camX;
    // 柱身
    const gradient = ctx.createLinearGradient(dx, d.y, dx + d.width, d.y);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.5, "#16213e");
    gradient.addColorStop(1, "#1a1a2e");
    ctx.fillStyle = gradient;
    ctx.fillRect(dx, d.y, d.width, d.height);
    // 纹理
    ctx.strokeStyle = "#0f0f1a";
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const lx = dx + d.width * (0.25 + i * 0.25);
        ctx.beginPath();
        ctx.moveTo(lx, d.y);
        ctx.lineTo(lx, d.y + d.height);
        ctx.stroke();
    }
}

function renderSculkSensor(ctx, d, camX) {
    const dx = d.x - camX;
    // 激活状态
    const pulseAlpha = d.activated ? 0.8 + Math.sin(d.pulsePhase) * 0.2 : 0.3;
    ctx.fillStyle = `rgba(0, 128, 128, ${pulseAlpha})`;
    // 基座
    ctx.fillRect(dx + 2, d.y + d.height * 0.7, d.width - 4, d.height * 0.3);
    // 触角
    ctx.beginPath();
    ctx.moveTo(dx + d.width / 2, d.y + d.height * 0.7);
    ctx.lineTo(dx + 2, d.y);
    ctx.lineTo(dx + d.width - 2, d.y);
    ctx.fill();
}

function renderSoulLantern(ctx, d, camX) {
    const dx = d.x - camX;
    // 火焰闪烁
    const flameAlpha = 0.6 + Math.sin(d.flickerPhase) * 0.4;
    ctx.fillStyle = `rgba(255, 200, 100, ${flameAlpha})`;
    ctx.beginPath();
    ctx.ellipse(dx + d.width / 2, d.y + d.height * 0.4, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // 灯笼框架
    ctx.strokeStyle = "#4a4a4a";
    ctx.lineWidth = 2;
    ctx.strokeRect(dx + 2, d.y, d.width - 4, d.height);
}

function renderAncientPillar(ctx, d, camX) {
    const dx = d.x - camX;
    const gradient = ctx.createLinearGradient(dx, d.y, dx + d.width, d.y);
    gradient.addColorStop(0, "#1B1F2C");
    gradient.addColorStop(0.5, "#24354A");
    gradient.addColorStop(1, "#1B1F2C");
    ctx.fillStyle = gradient;
    ctx.fillRect(dx, d.y, d.width, d.height);
    ctx.fillStyle = "rgba(120, 220, 210, 0.35)";
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(dx + 4 + i * 5, d.y + 10 + i * 13, 6, 3);
    }
}

function renderSculkVeinPatch(ctx, d, camX) {
    const dx = d.x - camX;
    ctx.fillStyle = "rgba(25, 80, 96, 0.85)";
    ctx.fillRect(dx, d.y, d.width, d.height);
    ctx.strokeStyle = "rgba(110, 225, 220, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dx + 4, d.y + d.height * 0.5);
    ctx.lineTo(dx + d.width * 0.45, d.y + d.height * 0.25);
    ctx.lineTo(dx + d.width - 6, d.y + d.height * 0.6);
    ctx.stroke();
}

function renderCloudPlatform(ctx, d, camX) {
    const dx = d.x - camX;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    // 云朵形状
    ctx.beginPath();
    ctx.arc(dx + d.width * 0.2, d.y + d.height * 0.6, d.height * 0.4, 0, Math.PI * 2);
    ctx.arc(dx + d.width * 0.4, d.y + d.height * 0.4, d.height * 0.5, 0, Math.PI * 2);
    ctx.arc(dx + d.width * 0.6, d.y + d.height * 0.4, d.height * 0.5, 0, Math.PI * 2);
    ctx.arc(dx + d.width * 0.8, d.y + d.height * 0.6, d.height * 0.4, 0, Math.PI * 2);
    ctx.fill();
}
