/**
 * main.biome.js - 生态系统模块
 *
 * 本模块包含游戏生态系统相关功能：
 * - 生态区域配置
 * - 生态切换逻辑
 * - 地下/天空模式
 * - 天气系统
 * - 生态粒子效果
 */

(function() {
    const M = window.MMWG;

    // ============================================
    // 默认生态配置
    // ============================================
    const DEFAULT_BIOME_CONFIGS = {
        forest: {
            id: "forest",
            name: "森林",
            color: "#4CAF50",
            groundType: "grass",
            decorations: { tree: 0.3, bush: 0.2, flower: 0.25, mushroom: 0.1, vine: 0.15, cave_entrance: 0.04, vine_ladder: 0.02 },
            treeTypes: { oak: 0.5, birch: 0.3, dark_oak: 0.2 },
            effects: { particles: "leaves", ambient: "#88CC88", weather: ["clear", "rain", "fog"] },
            spawnWeight: { min: 0, max: 1000 }
        },
        snow: {
            id: "snow",
            name: "雪地",
            color: "#FFFFFF",
            groundType: "snow",
            decorations: { spruce: 0.25, ice_spike: 0.1, snow_pile: 0.3, ice_block: 0.15 },
            treeTypes: { spruce: 0.7, pine: 0.3 },
            effects: { particles: "snowflakes", ambient: "#CCE6FF", speedMultiplier: 1.2, weather: ["snow"] },
            spawnWeight: { min: 500, max: 1500 }
        },
        desert: {
            id: "desert",
            name: "沙漠",
            color: "#FDD835",
            groundType: "sand",
            decorations: { cactus: 0.2, dead_bush: 0.15, rock: 0.1, bones: 0.05 },
            treeTypes: { cactus: 1.0 },
            effects: { particles: "dust", ambient: "#FFEECC", speedMultiplier: 0.85, heatWave: true, weather: ["clear", "sandstorm"] },
            spawnWeight: { min: 1000, max: 2000 }
        },
        mountain: {
            id: "mountain",
            name: "山地",
            color: "#757575",
            groundType: "stone",
            decorations: { ore_coal: 0.15, ore_iron: 0.1, ore_gold: 0.05, ore_diamond: 0.02, stalactite: 0.12, crystal: 0.08, lava_pool: 0.05, cave_entrance: 0.03 },
            effects: { particles: "sparkle", ambient: "#666688", darkness: 0.3, weather: ["fog"] },
            spawnWeight: { min: 1500, max: 3000 }
        },
        ocean: {
            id: "ocean",
            name: "海滩",
            color: "#2196F3",
            groundType: "sand",
            decorations: { palm_tree: 0.15, shell: 0.2, starfish: 0.15, seaweed: 0.25, boat: 0.05 },
            treeTypes: { palm: 1.0 },
            effects: { particles: "bubbles", ambient: "#AAD4F5", waterLevel: 150 },
            spawnWeight: { min: 2000, max: 4000 }
        },
        nether: {
            id: "nether",
            name: "地狱",
            color: "#8B0000",
            groundType: "netherrack",
            decorations: { lava_pool: 0.15, fire: 0.2, soul_sand: 0.1, nether_wart: 0.12, basalt: 0.18, lava_fall: 0.08 },
            effects: { particles: "flames", ambient: "#CC3333", damage: 1, speedMultiplier: 0.7 },
            spawnWeight: { min: 3500, max: 5000 }
        },
        cave: {
            id: "cave",
            name: "矿洞",
            color: "#3B3B4F",
            groundType: "stone",
            decorations: { ore_coal: 0.25, ore_iron: 0.18, ore_gold: 0.08, ore_diamond: 0.05, stalactite: 0.2, crystal: 0.1, lava_pool: 0.08, cave_exit: 0.08 },
            effects: { particles: "sparkle", ambient: "#3B3B4F", darkness: 0.45, weather: ["fog"] },
            spawnWeight: { min: 0, max: 99999 },
            platform: {
                floatingChanceMult: 0.6,
                floatingGroundTypes: ["stone"],
                microPlatformChance: 0.25,
                microPlatformPeriod: 2,
                microPattern: "stair",
                microPlatformType: "stone",
                microPlatformMaxCount: 3,
                microMaxRiseBlocks: 3,
                microItemChance: 0.15,
                fragileChance: 0.2,
                fragileBreakDelay: 100
            }
        },
        sky: {
            id: "sky",
            name: "云端",
            color: "#87CEEB",
            groundType: "cloud",
            decorations: { },
            effects: { particles: "sparkle", ambient: "#9BD4FF", weather: ["clear", "fog"] },
            spawnWeight: { min: 0, max: 99999 }
        }
    };

    let biomeConfigs = JSON.parse(JSON.stringify(DEFAULT_BIOME_CONFIGS));
    let currentBiome = "forest";
    let biomeTransitionX = 0;
    let undergroundMode = false;
    let skyMode = false;
    let surfaceBiomeId = "forest";
    let caveEntryArmed = null;

    // ============================================
    // 生态切换配置
    // ============================================
    const DEFAULT_BIOME_SWITCH = {
        stepScore: 200,
        order: ["forest", "snow", "desert", "mountain", "ocean", "nether"],
        unlockScore: {
            forest: 0,
            snow: 200,
            desert: 400,
            mountain: 600,
            ocean: 800,
            nether: 2000
        }
    };

    let biomeSwitchConfig = JSON.parse(JSON.stringify(DEFAULT_BIOME_SWITCH));

    // ============================================
    // 生态辅助函数
    // ============================================
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
        return { biomes, switch: M.mergeDeep(DEFAULT_BIOME_SWITCH, switchCfg) };
    }

    function getBiomeById(id) {
        return biomeConfigs[id] || biomeConfigs.forest;
    }

    function getBiomeSwitchConfig() {
        const cfg = biomeSwitchConfig && typeof biomeSwitchConfig === "object" ? biomeSwitchConfig : DEFAULT_BIOME_SWITCH;
        const stepFromSettings = Number(M.settings?.biomeSwitchStepScore);
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
        const biomeLength = 2000;
        const idx = Math.floor(x / biomeLength) % available.length;
        return available[idx];
    }

    // ============================================
    // 生态更新
    // ============================================
    function updateCurrentBiome() {
        if (undergroundMode || skyMode) return;
        const nextBiome = getBiomeById(getBiomeIdForScore(M.getProgressScore()));
        if (nextBiome.id !== currentBiome) {
            currentBiome = nextBiome.id;
            biomeTransitionX = M.player.x;
            M.showToast(`🌍 进入${nextBiome.name}群系`);
            updateWeatherForBiome(nextBiome);
            const info = document.getElementById("level-info");
            if (info) info.innerText = `生态: ${nextBiome.name}`;
            if (currentBiome === "nether" && M.netherEntryPenaltyArmed) {
                M.playerHp = Math.max(0, M.playerHp - 1);
                M.updateHpUI();
                M.showFloatingText("🔥 -1❤️", M.player.x, M.player.y - 20);
                M.netherEntryPenaltyArmed = false;
                if (M.playerHp <= 0) {
                    M.paused = true;
                    M.showToast("💀 生命耗尽");
                    M.setOverlay(true, "pause");
                }
            }
            if (currentBiome !== "nether") {
                M.netherEntryPenaltyArmed = true;
            }
        }
    }

    // ============================================
    // 地下/天空模式
    // ============================================
    function resetWorldForMode() {
        M.platforms = [];
        M.movingPlatforms = [];
        M.trees = [];
        M.chests = [];
        M.items = [];
        M.decorations = [];
        M.particles = [];
        M.enemies = [];
        M.golems = [];
        caveEntryArmed = null;
        M.digHits.clear();
        M.resetProjectiles();
        M.playerPositionHistory = [];
        M.lastGenX = 0;
        M.cameraX = 0;
        M.player.x = 100;
        M.player.y = 300;
        M.player.velX = 0;
        M.player.velY = 0;
        M.generatePlatform(0, 12, M.groundY);
    }

    function enterUnderground(source = "entrance") {
        if (undergroundMode) return;
        undergroundMode = true;
        surfaceBiomeId = currentBiome;
        currentBiome = biomeConfigs.cave ? "cave" : "mountain";
        updateWeatherForBiome(getBiomeById(currentBiome));
        const info = document.getElementById("level-info");
        if (info) info.innerText = "生态: 矿洞";
        M.showToast(source === "dig" ? "⛏️ 挖进矿洞！" : "⛏️ 进入矿洞");
        resetWorldForMode();
    }

    function exitUnderground() {
        if (!undergroundMode) return;
        undergroundMode = false;
        const nextBiome = getBiomeById(getBiomeIdForScore(M.getProgressScore()));
        currentBiome = nextBiome.id || surfaceBiomeId || "forest";
        updateWeatherForBiome(getBiomeById(currentBiome));
        const info = document.getElementById("level-info");
        if (info) info.innerText = `生态: ${getBiomeById(currentBiome).name}`;
        M.showToast("🪨 返回地表");
        resetWorldForMode();
    }

    function enterSky() {
        if (skyMode) return;
        skyMode = true;
        surfaceBiomeId = currentBiome;
        currentBiome = biomeConfigs.sky ? "sky" : "forest";
        updateWeatherForBiome(getBiomeById(currentBiome));
        const info = document.getElementById("level-info");
        if (info) info.innerText = "生态: 云端";
        M.showToast("☁️ 进入云端");
        resetWorldForMode();
    }

    function exitSky() {
        if (!skyMode) return;
        skyMode = false;
        const nextBiome = getBiomeById(getBiomeIdForScore(M.getProgressScore()));
        currentBiome = nextBiome.id || surfaceBiomeId || "forest";
        updateWeatherForBiome(getBiomeById(currentBiome));
        const info = document.getElementById("level-info");
        if (info) info.innerText = `生态: ${getBiomeById(currentBiome).name}`;
        M.showToast("☁️ 返回地表");
        resetWorldForMode();
    }

    // ============================================
    // 天气系统
    // ============================================
    function updateWeatherForBiome(biome) {
        const options = biome.effects?.weather || ["clear"];
        M.weatherState.type = options[Math.floor(Math.random() * options.length)];
        M.weatherState.timer = 600 + Math.floor(Math.random() * 600);
    }

    function applyBiomeEffectsToPlayer() {
        const biome = getBiomeById(currentBiome);
        const speedMult = biome.effects?.speedMultiplier || 1;
        let nextSpeed = M.player.baseSpeed * speedMult;
        if (biome.effects?.waterLevel && M.player.y + M.player.height > biome.effects.waterLevel) {
            nextSpeed *= 0.65;
        }
        M.player.speed = nextSpeed;
        if (biome.effects?.damage) {
            if (M.gameFrame % 90 === 0) {
                M.damagePlayer(biome.effects.damage, M.player.x, 30);
            }
        }
    }

    function tickWeather() {
        M.weatherState.timer--;
        if (M.weatherState.timer <= 0) {
            updateWeatherForBiome(getBiomeById(currentBiome));
        }
    }

    // ============================================
    // 生态粒子
    // ============================================
    function spawnBiomeParticles() {
        const biome = getBiomeById(currentBiome);
        const baseX = M.cameraX + Math.random() * M.canvas.width;
        if (biome.effects?.particles === "snowflakes" && Math.random() < 0.2) {
            M.particles.push(new Snowflake(baseX, -10));
        } else if (biome.effects?.particles === "leaves" && Math.random() < 0.15) {
            M.particles.push(new LeafParticle(baseX, -10));
        } else if (biome.effects?.particles === "dust" && Math.random() < 0.2) {
            M.particles.push(new DustParticle(baseX, Math.random() * M.canvas.height));
        } else if (biome.effects?.particles === "flames" && Math.random() < 0.2) {
            M.particles.push(new EmberParticle(baseX, M.canvas.height - 50));
        } else if (biome.effects?.particles === "bubbles" && Math.random() < 0.2) {
            M.particles.push(new BubbleParticle(baseX, M.canvas.height - 20));
        } else if (biome.effects?.particles === "sparkle" && Math.random() < 0.15) {
            M.particles.push(new SparkleParticle(baseX, Math.random() * M.canvas.height));
        }

        if (M.weatherState.type === "rain" && Math.random() < 0.4) {
            M.particles.push(new RainParticle(baseX, -10));
        }
        if (M.weatherState.type === "snow" && Math.random() < 0.3) {
            M.particles.push(new Snowflake(baseX, -10));
        }
        if (M.weatherState.type === "sandstorm" && Math.random() < 0.35) {
            M.particles.push(new DustParticle(baseX, Math.random() * M.canvas.height));
        }
    }

    // ============================================
    // 导出到全局
    // ============================================
    Object.assign(M, {
        DEFAULT_BIOME_CONFIGS,
        get biomeConfigs() { return biomeConfigs; },
        set biomeConfigs(v) { biomeConfigs = v; },
        get currentBiome() { return currentBiome; },
        set currentBiome(v) { currentBiome = v; },
        get biomeTransitionX() { return biomeTransitionX; },
        set biomeTransitionX(v) { biomeTransitionX = v; },
        get undergroundMode() { return undergroundMode; },
        set undergroundMode(v) { undergroundMode = v; },
        get skyMode() { return skyMode; },
        set skyMode(v) { skyMode = v; },
        get surfaceBiomeId() { return surfaceBiomeId; },
        set surfaceBiomeId(v) { surfaceBiomeId = v; },
        get caveEntryArmed() { return caveEntryArmed; },
        set caveEntryArmed(v) { caveEntryArmed = v; },
        DEFAULT_BIOME_SWITCH,
        get biomeSwitchConfig() { return biomeSwitchConfig; },
        set biomeSwitchConfig(v) { biomeSwitchConfig = v; },
        normalizeBiomeBundle,
        getBiomeById,
        getBiomeSwitchConfig,
        getBiomeIdForScore,
        selectBiome,
        updateCurrentBiome,
        resetWorldForMode,
        enterUnderground,
        exitUnderground,
        enterSky,
        exitSky,
        updateWeatherForBiome,
        applyBiomeEffectsToPlayer,
        tickWeather,
        spawnBiomeParticles
    });
})();
