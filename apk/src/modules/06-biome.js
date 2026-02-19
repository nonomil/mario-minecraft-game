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
    const stepScore = isFinite(stepFromSettings) && stepFromSettings >= 150 ? stepFromSettings : (Number(cfg.stepScore) || 300);
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
    const progressScore = getProgressScore();
    const nextBiome = getBiomeById(getBiomeIdForScore(progressScore));
    const hasFireResistance = typeof hasVillageBuff === "function" && hasVillageBuff("fireResistance");
    refreshBiomeGateState();
    if (nextBiome.id !== currentBiome) {
        // P1-2: 最小停留守卫
        if (currentBiome && !canLeaveBiome(progressScore)) return;
        if (biomeGateState.gateActive) return;
        if (shouldTriggerBiomeGate(currentBiome, nextBiome.id)) {
            if (startBiomeGate(currentBiome, nextBiome.id)) return;
        }
        applyBiomeTransition(nextBiome, progressScore, hasFireResistance);
    }
}

function applyBiomeTransition(nextBiome, progressScore, hasFireResistance) {
    if (!nextBiome || !nextBiome.id) return;
    const prevBiome = currentBiome;
    recordBiomeStay(prevBiome, progressScore);
    currentBiome = nextBiome.id;
    biomeVisitCount[currentBiome] = (biomeVisitCount[currentBiome] || 0) + 1;
    biomeEntryScore = progressScore;
    biomeEntryTime = Date.now();
    biomeTransitionX = player.x;
    showToast(BIOME_MESSAGES.enter(nextBiome.name));
    updateWeatherForBiome(nextBiome);
    const info = document.getElementById("level-info");
    if (info) info.innerText = `生态: ${nextBiome.name}`;
    if (currentBiome === "nether" && netherEntryPenaltyArmed && !hasFireResistance) {
        playerHp = Math.max(0, playerHp - 1);
        updateHpUI();
        showFloatingText(BIOME_MESSAGES.hpDrain, player.x, player.y - 20);
        netherEntryPenaltyArmed = false;
        if (playerHp <= 0) {
            paused = true;
            showToast(BIOME_MESSAGES.heatDeath);
            setOverlay(true, "pause");
        }
    }
    if (currentBiome !== "nether") {
        netherEntryPenaltyArmed = true;
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
    const useSlowHeatDot = currentBiome === "nether" || currentBiome === "volcano";
    if (!useSlowHeatDot && biome.effects?.damage && !biome.effects.onEnterOnly) {
        if (gameFrame % 90 === 0) {
            damagePlayer(biome.effects.damage, player.x, 30);
        }
    }
    // 火山/地狱统一环境掉血：每分钟掉半格
    updateExtremeHeatEnvironment();
    // 灵魂沙减速
    if (currentBiome === 'nether') checkSoulSandEffect();
    // 末地低重力
    if (currentBiome === 'end') updateEndEnvironment();
    // 天空之城风场
    if (typeof updateSkyWindSystem === "function") updateSkyWindSystem();
}

// ============ 群系轮次追踪（P1-1） ============
let biomeVisitCount = {};

function getBiomeVisitRound(biomeId) {
    return biomeVisitCount[biomeId] || 1;
}

function resetBiomeVisitCount() {
    biomeVisitCount = {};
}

function setBiomeVisitRound(biomeId, roundValue) {
    if (!biomeId) return;
    const normalized = Math.max(1, Math.floor(Number(roundValue) || 1));
    biomeVisitCount[biomeId] = normalized;
}

function getBiomeVisitCountSnapshot() {
    return { ...biomeVisitCount };
}

// ============ 群系最小停留追踪（P1-2） ============
let biomeEntryScore = 0;
let biomeEntryTime = 0;
let biomeStayStats = Object.create(null);
let biomeGateState = {
    pendingFromBiome: null,
    pendingToBiome: null,
    gateActive: false,
    clearedMap: Object.create(null),
    lockedBiome: null,
    gateStartedAtMs: 0,
    stallWarned: false
};

function resetBiomeGateState() {
    biomeGateState.pendingFromBiome = null;
    biomeGateState.pendingToBiome = null;
    biomeGateState.gateActive = false;
    biomeGateState.clearedMap = Object.create(null);
    biomeGateState.lockedBiome = null;
    biomeGateState.gateStartedAtMs = 0;
    biomeGateState.stallWarned = false;
}

function getBiomeGateConfig() {
    const cfg = getBiomeSwitchConfig();
    const gateBoss = cfg && cfg.gateBoss && typeof cfg.gateBoss === "object" ? cfg.gateBoss : {};
    const exemptRaw = Array.isArray(gateBoss.gateExempt)
        ? gateBoss.gateExempt
        : (Array.isArray(gateBoss.exemptFromBiomes) ? gateBoss.exemptFromBiomes : []);
    const exemptSet = new Set(
        exemptRaw
            .map(v => String(v || "").trim())
            .filter(Boolean)
    );
    return {
        enabled: gateBoss.enabled !== false,
        perBiomeOnce: gateBoss.perBiomeOnce !== false,
        exemptSet
    };
}

function shouldTriggerBiomeGate(fromBiomeId, toBiomeId) {
    if (!fromBiomeId || !toBiomeId || fromBiomeId === toBiomeId) return false;
    const gateCfg = getBiomeGateConfig();
    if (!gateCfg.enabled) return false;
    if (gateCfg.exemptSet && gateCfg.exemptSet.has(fromBiomeId)) return false;
    if (biomeGateState.gateActive) return false;
    if (gateCfg.perBiomeOnce && biomeGateState.clearedMap[fromBiomeId]) return false;
    return true;
}

function startBiomeGate(fromBiomeId, toBiomeId) {
    if (!fromBiomeId || !toBiomeId) return false;
    if (typeof bossArena === "undefined" || !bossArena || typeof bossArena.enterBiomeGate !== "function") {
        return false;
    }
    if (bossArena.active) return false;
    biomeGateState.pendingFromBiome = fromBiomeId;
    biomeGateState.pendingToBiome = toBiomeId;
    biomeGateState.gateActive = true;
    biomeGateState.lockedBiome = fromBiomeId;
    biomeGateState.gateStartedAtMs = Date.now();
    biomeGateState.stallWarned = false;
    bossArena.enterBiomeGate(fromBiomeId, toBiomeId, {
        onVictory: payload => handleBiomeGateVictory(payload)
    });
    return true;
}

function handleBiomeGateVictory(payload) {
    const gateCfg = getBiomeGateConfig();
    const fromBiome = payload?.fromBiome || biomeGateState.pendingFromBiome;
    const toBiome = payload?.toBiome || biomeGateState.pendingToBiome;
    if (gateCfg.perBiomeOnce && fromBiome) {
        biomeGateState.clearedMap[fromBiome] = true;
    }
    biomeGateState.gateActive = false;
    biomeGateState.lockedBiome = null;
    biomeGateState.pendingFromBiome = null;
    biomeGateState.pendingToBiome = null;
    biomeGateState.gateStartedAtMs = 0;
    biomeGateState.stallWarned = false;
    if (!toBiome || toBiome === currentBiome) return;
    const nextBiome = getBiomeById(toBiome);
    const progressScore = getProgressScore();
    const hasFireResistance = typeof hasVillageBuff === "function" && hasVillageBuff("fireResistance");
    applyBiomeTransition(nextBiome, progressScore, hasFireResistance);
}

function refreshBiomeGateState() {
    if (!biomeGateState.gateActive) return;
    if (typeof bossArena !== "undefined" && bossArena && bossArena.active) {
        const elapsedMs = Math.max(0, Date.now() - (biomeGateState.gateStartedAtMs || 0));
        if (!biomeGateState.stallWarned && elapsedMs >= 90000) {
            biomeGateState.stallWarned = true;
            console.warn(`[BiomeGate] gate still active after ${elapsedMs}ms: ${biomeGateState.pendingFromBiome || "?"} -> ${biomeGateState.pendingToBiome || "?"}`);
        }
        return;
    }
    // Intentionally clear pending transition when arena is no longer active without onVictory.
    // This avoids auto-transition after abnormal exits (e.g. death/reset/forced exit).
    biomeGateState.gateActive = false;
    biomeGateState.pendingFromBiome = null;
    biomeGateState.pendingToBiome = null;
    biomeGateState.lockedBiome = null;
    biomeGateState.gateStartedAtMs = 0;
    biomeGateState.stallWarned = false;
}

function getBiomeGateStateSnapshot() {
    return {
        pendingFromBiome: biomeGateState.pendingFromBiome || null,
        pendingToBiome: biomeGateState.pendingToBiome || null,
        gateActive: !!biomeGateState.gateActive,
        lockedBiome: biomeGateState.lockedBiome || null,
        gateStartedAtMs: Number(biomeGateState.gateStartedAtMs || 0),
        stallWarned: !!biomeGateState.stallWarned,
        clearedMap: { ...(biomeGateState.clearedMap || {}) }
    };
}

function canLeaveBiome(currentScore) {
    const cfg = getBiomeSwitchConfig();
    const minStay = cfg.minStay && cfg.minStay[currentBiome];
    if (!minStay) return true;
    const scoreInBiome = currentScore - biomeEntryScore;
    const timeInBiome = (Date.now() - biomeEntryTime) / 1000;
    const minScore = minStay.score || 100;
    const minTime = minStay.timeSec || 20;
    return scoreInBiome >= minScore && timeInBiome >= minTime;
}

function getBiomeStayDebugInfo(scoreValue = getProgressScore()) {
    const cfg = getBiomeSwitchConfig();
    const minStay = cfg.minStay && currentBiome ? cfg.minStay[currentBiome] : null;
    const scoreInBiome = (Number(scoreValue) || 0) - biomeEntryScore;
    const timeInBiomeSec = biomeEntryTime > 0 ? Math.max(0, (Date.now() - biomeEntryTime) / 1000) : 0;
    return {
        biomeId: currentBiome || null,
        biomeEntryScore,
        biomeEntryTime,
        scoreInBiome,
        timeInBiomeSec,
        minScore: Number(minStay?.score || 0),
        minTimeSec: Number(minStay?.timeSec || 0),
        canLeave: canLeaveBiome(Number(scoreValue) || 0),
        gateActive: !!biomeGateState.gateActive,
        gatePendingFrom: biomeGateState.pendingFromBiome || null,
        gatePendingTo: biomeGateState.pendingToBiome || null
    };
}

function recordBiomeStay(biomeId, currentScore) {
    if (!biomeId || !biomeEntryTime) return;
    const timeInBiomeSec = Math.max(0, (Date.now() - biomeEntryTime) / 1000);
    const scoreInBiome = Math.max(0, (Number(currentScore) || 0) - biomeEntryScore);
    if (!biomeStayStats[biomeId]) {
        biomeStayStats[biomeId] = { runs: 0, totalTimeSec: 0, totalScore: 0, maxTimeSec: 0, maxScore: 0 };
    }
    const s = biomeStayStats[biomeId];
    s.runs++;
    s.totalTimeSec += timeInBiomeSec;
    s.totalScore += scoreInBiome;
    s.maxTimeSec = Math.max(s.maxTimeSec, timeInBiomeSec);
    s.maxScore = Math.max(s.maxScore, scoreInBiome);
}

function getBiomeStayStats() {
    return JSON.parse(JSON.stringify(biomeStayStats || {}));
}

function resetBiomeStayStats() {
    biomeStayStats = Object.create(null);
}

// ============ 高温环境（火山/地狱） ============
let biomeHeatDotTimerMs = 0;
let biomeHeatLastTickMs = 0;
let netherMushrooms = [];
let fragilePlatforms = [];
const biomeParticlePools = Object.create(null);
let skyWindZones = [];
let skyWindZoneCounter = 0;
let nextSkyWindTypeIndex = 0;
let lastSkyWindHintFrame = -999;

const SKY_WIND_TYPES = ["left", "up", "right"];
const SKY_WIND_FORCE = {
    left: { vx: -0.2, vy: 0 },
    right: { vx: 0.2, vy: 0 },
    up: { vx: 0, vy: -0.38 }
};

function buildSkyWindZone(baseX, overrideType = null) {
    const type = overrideType || SKY_WIND_TYPES[nextSkyWindTypeIndex++ % SKY_WIND_TYPES.length];
    const zone = {
        id: `wind_zone_${skyWindZoneCounter++}`,
        type,
        x: baseX,
        y: type === "up" ? 130 : 190,
        width: 210,
        height: type === "up" ? 320 : 240,
        particles: [],
        rewardPlatformId: null
    };
    return zone;
}

function clearSkyWindPlatforms() {
    platforms = platforms.filter(p => !p?.windReward);
}

function resetSkyWindZones() {
    skyWindZones = [];
    nextSkyWindTypeIndex = 0;
    clearSkyWindPlatforms();
}

function spawnSkyWindRewardPlatform(zone) {
    if (!zone || zone.type !== "up" || zone.rewardPlatformId) return;
    const px = zone.x + zone.width * 0.5 - 70;
    const py = Math.max(40, zone.y - 56);
    const p = new Platform(px, py, 140, 20, "cloud");
    p.windReward = true;
    p.windZoneId = zone.id;
    platforms.push(p);
    zone.rewardPlatformId = zone.id;

    if (Math.random() < 0.8) {
        const chestX = px + 46;
        chests.push(new Chest(chestX, py - 34));
    }
}

function ensureSkyWindZones() {
    if (currentBiome !== "sky_dimension") {
        resetSkyWindZones();
        return;
    }
    if (skyWindZones.length) return;

    const startX = Math.max(500, Math.floor((cameraX + 260) / 420) * 420);
    skyWindZones = [
        buildSkyWindZone(startX, "left"),
        buildSkyWindZone(startX + 480, "up"),
        buildSkyWindZone(startX + 960, "right")
    ];
    skyWindZones.forEach(zone => spawnSkyWindRewardPlatform(zone));
}

function recycleSkyWindZones() {
    if (currentBiome !== "sky_dimension") return;
    if (!skyWindZones.length) return;

    const leftBound = cameraX - 340;
    let farthestX = Math.max(...skyWindZones.map(z => z.x));
    for (const zone of skyWindZones) {
        if (zone.x + zone.width >= leftBound) continue;

        platforms = platforms.filter(p => !(p?.windReward && p.windZoneId === zone.id));
        zone.particles = [];
        zone.type = SKY_WIND_TYPES[nextSkyWindTypeIndex++ % SKY_WIND_TYPES.length];
        zone.x = farthestX + 430;
        zone.y = zone.type === "up" ? 130 : 190;
        zone.width = 210;
        zone.height = zone.type === "up" ? 320 : 240;
        zone.rewardPlatformId = null;
        spawnSkyWindRewardPlatform(zone);
        farthestX = zone.x;
    }
}

function updateSkyWindZoneParticles(zone) {
    if (!zone) return;
    if (zone.particles.length < 28 && Math.random() < 0.45) {
        zone.particles.push({
            x: zone.x + Math.random() * zone.width,
            y: zone.y + Math.random() * zone.height,
            life: 36 + Math.floor(Math.random() * 20),
            maxLife: 56
        });
    }

    zone.particles = zone.particles.filter(p => {
        const force = SKY_WIND_FORCE[zone.type] || SKY_WIND_FORCE.left;
        p.x += force.vx * 8;
        p.y += force.vy * 8;
        if (zone.type === "up") p.x += Math.sin((gameFrame + p.life) * 0.06) * 0.8;
        p.life--;
        const inX = p.x >= zone.x - 15 && p.x <= zone.x + zone.width + 15;
        const inY = p.y >= zone.y - 15 && p.y <= zone.y + zone.height + 15;
        return p.life > 0 && inX && inY;
    });
}

function applySkyWindForceToPlayer(zone) {
    if (!zone || !player) return false;
    if (!rectIntersect(player.x, player.y, player.width, player.height, zone.x, zone.y, zone.width, zone.height)) {
        return false;
    }
    const force = SKY_WIND_FORCE[zone.type] || SKY_WIND_FORCE.left;
    if (zone.type === "left" || zone.type === "right") {
        player.velX = Math.max(-6, Math.min(6, player.velX + force.vx));
    } else if (zone.type === "up") {
        player.velY = Math.max(-8, player.velY + force.vy);
        if (player.velY > -1) player.velY *= 0.95;
    }
    return true;
}

function updateSkyWindSystem() {
    if (currentBiome !== "sky_dimension") {
        if (skyWindZones.length) resetSkyWindZones();
        return;
    }

    ensureSkyWindZones();
    recycleSkyWindZones();

    let touched = null;
    for (const zone of skyWindZones) {
        updateSkyWindZoneParticles(zone);
        if (!touched && applySkyWindForceToPlayer(zone)) touched = zone;
    }

    if (touched && gameFrame - lastSkyWindHintFrame > 90) {
        lastSkyWindHintFrame = gameFrame;
        const text = touched.type === "left" ? "⬅️ 左风区" : touched.type === "right" ? "➡️ 右风区" : "⬆️ 上升气流";
        showFloatingText(text, player.x + 10, player.y - 24, "#FFD54F");
    }
}

function renderSkyWindZones(ctx, camX) {
    if (currentBiome !== "sky_dimension" || !skyWindZones.length) return;
    ctx.save();
    ctx.setLineDash([8, 5]);
    for (const zone of skyWindZones) {
        const dx = zone.x - camX;
        if (dx + zone.width < -20 || dx > canvas.width + 20) continue;

        ctx.strokeStyle = "rgba(255, 215, 0, 0.68)";
        ctx.lineWidth = 2;
        ctx.strokeRect(dx, zone.y, zone.width, zone.height);

        ctx.fillStyle = "rgba(255, 215, 0, 0.14)";
        ctx.fillRect(dx, zone.y, zone.width, zone.height);

        const arrow = zone.type === "left" ? "⬅" : zone.type === "right" ? "➡" : "⬆";
        ctx.fillStyle = "rgba(255, 240, 170, 0.95)";
        ctx.font = "bold 18px Verdana";
        ctx.fillText(arrow, dx + zone.width * 0.5 - 8, zone.y + 26);

        for (const p of zone.particles) {
            const alpha = Math.max(0.2, p.life / p.maxLife);
            ctx.fillStyle = `rgba(255, 215, 80, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x - camX, p.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.setLineDash([]);
    ctx.restore();
}

function acquireBiomeParticle(type, x, y) {
    const pool = biomeParticlePools[type] || (biomeParticlePools[type] = []);
    const reused = pool.find(p => p && p.remove && typeof p.reset === "function");
    if (reused) {
        reused.reset(x, y);
        reused.remove = false;
        return reused;
    }

    let created = null;
    switch (type) {
        case "snowflake":
            created = new Snowflake(x, y);
            break;
        case "leaf":
            created = new LeafParticle(x, y);
            break;
        case "dust":
            created = new DustParticle(x, y);
            break;
        case "ember":
            created = new EmberParticle(x, y);
            break;
        case "bubble":
            created = new BubbleParticle(x, y);
            break;
        case "sparkle":
            created = new SparkleParticle(x, y);
            break;
        case "end_particle":
            created = new EndParticle(x, y);
            break;
        case "rain":
            created = new RainParticle(x, y);
            break;
        default:
            break;
    }

    if (!created) return null;
    pool.push(created);
    return created;
}

function emitBiomeParticle(type, x, y) {
    const particle = acquireBiomeParticle(type, x, y);
    if (!particle) return null;
    particles.push(particle);
    return particle;
}

function updateExtremeHeatEnvironment() {
    const now = Date.now();
    const inHeatBiome = currentBiome === "nether" || currentBiome === "volcano";
    const hasFireResistance = typeof hasVillageBuff === "function" && hasVillageBuff("fireResistance");
    if (!inHeatBiome) {
        biomeHeatDotTimerMs = 0;
        biomeHeatLastTickMs = now;
        return;
    }
    if (hasFireResistance) {
        biomeHeatDotTimerMs = 0;
        biomeHeatLastTickMs = now;
        return;
    }
    // 穿下界合金盔甲免疫高温环境伤害
    if (playerEquipment && playerEquipment.armor === 'netherite') {
        biomeHeatDotTimerMs = 0;
        biomeHeatLastTickMs = now;
        return;
    }
    if (!biomeHeatLastTickMs) {
        biomeHeatLastTickMs = now;
        return;
    }
    const deltaMs = Math.max(0, Math.min(250, now - biomeHeatLastTickMs));
    biomeHeatLastTickMs = now;
    biomeHeatDotTimerMs += deltaMs;
    // 真实时间每 60 秒掉 0.5 血，避免 FPS 波动影响。
    if (biomeHeatDotTimerMs >= 60000) {
        biomeHeatDotTimerMs -= 60000;
        damagePlayer(0.5, player.x, 30);
        showFloatingText(BIOME_MESSAGES.heatDamage, player.x + player.width / 2, player.y - 30, '#FF4500');
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
            showFloatingText(BIOME_MESSAGES.lavaFall, player.x + player.width / 2, player.y - 30, '#FF0000');
            paused = true;
            showToast(BIOME_MESSAGES.lavaDeath);
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
        emitBiomeParticle("snowflake", baseX, -10);
    } else if (biome.effects?.particles === "leaves" && Math.random() < 0.15) {
        emitBiomeParticle("leaf", baseX, -10);
    } else if (biome.effects?.particles === "dust" && Math.random() < 0.2) {
        emitBiomeParticle("dust", baseX, Math.random() * canvas.height);
    } else if (biome.effects?.particles === "flames" && Math.random() < 0.2) {
        emitBiomeParticle("ember", baseX, canvas.height - 50);
    } else if (biome.effects?.particles === "bubbles" && Math.random() < 0.2) {
        emitBiomeParticle("bubble", baseX, canvas.height - 20);
    } else if (biome.effects?.particles === "sparkle" && Math.random() < 0.15) {
        emitBiomeParticle("sparkle", baseX, Math.random() * canvas.height);
    } else if (biome.effects?.particles === "end_particles" && Math.random() < 0.18) {
        emitBiomeParticle("end_particle", baseX, Math.random() * canvas.height);
    }

    if (weatherState.type === "rain" && Math.random() < 0.4) {
        emitBiomeParticle("rain", baseX, -10);
    }
    if (weatherState.type === "snow" && Math.random() < 0.3) {
        emitBiomeParticle("snowflake", baseX, -10);
    }
    if (weatherState.type === "sandstorm" && Math.random() < 0.35) {
        emitBiomeParticle("dust", baseX, Math.random() * canvas.height);
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
        const alpha = (typeof p.life === "number" ? p.life : 0) * 0.6;
        ctx.globalAlpha = Math.max(0, Math.min(alpha, 1));
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x - camX, p.y, p.size || 3, 0, Math.PI * 2);
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
