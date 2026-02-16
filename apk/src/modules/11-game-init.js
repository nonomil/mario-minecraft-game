/**
 * 11-game-init.js - 游戏初始化、关卡生成
 * 从 main.js 拆分 (原始行 2837-3400)
 */
function applyMotionToPlayer(p) {
    if (!p) return;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const scale = clamp(Number(settings.motionScale) || 1.0, 0.6, 2.0);
    p.baseSpeed = (Number(gameConfig.physics.movementSpeed) || 2.0) * scale;
    p.baseJumpStrength = (Number(gameConfig.physics.jumpStrength) || -7.0) * scale;
    p.speed = p.baseSpeed;
    p.jumpStrength = p.baseJumpStrength;
}

function createPlayer() {
    const p = {
        x: 100,
        y: 300,
        width: gameConfig.player.width,
        height: gameConfig.player.height,
        velX: 0,
        velY: 0,
        speed: gameConfig.physics.movementSpeed,
        jumpStrength: gameConfig.physics.jumpStrength,
        grounded: false,
        facingRight: true,
        jumpCount: 0,
        maxJumps: gameConfig.player.maxJumps,
        isAttacking: false,
        attackTimer: 0,
        lastFragilePlatform: null
    };
    applyMotionToPlayer(p);
    return p;
}

function initGame() {
    score = 0;
    levelScore = 0;
    runBestScore = 0;
    lastWordItemX = -Infinity;
    currentLevelIdx = 0;
    playerMaxHp = Number(gameConfig?.player?.maxHp) || 3;
    playerHp = playerMaxHp;
    lastDamageFrame = 0;
    difficultyState = null;
    sessionCollectedWords = [];
    wordGates = [];
    currentLearningChallenge = null;
    clearLearningChallengeTimer();
    hideLearningChallenge();
    wordMatchActive = false;
    if (wordMatchTimer) {
        clearInterval(wordMatchTimer);
        wordMatchTimer = null;
    }
    activeWordMatch = null;
    resetInventory();
    updateInventoryUI();
    player = createPlayer();
    bossSpawned = false;
    // Reset BOSS arena state
    if (typeof bossArena !== 'undefined' && bossArena) {
        bossArena.active = false;
        bossArena.boss = null;
        bossArena.victoryTimer = 0;
        if (bossArena.spawned) {
            for (const k in bossArena.spawned) delete bossArena.spawned[k];
        }
    }
    // Reset village state
    if (typeof activeVillages !== 'undefined') activeVillages = [];
    if (typeof villageSpawnedForScore !== 'undefined') {
        for (const k in villageSpawnedForScore) delete villageSpawnedForScore[k];
    }
    if (typeof playerInVillage !== 'undefined') playerInVillage = false;
    if (typeof currentVillage !== 'undefined') currentVillage = null;
    startLevel(0);
    updateDifficultyState(true);
}

function startLevel(idx) {
    currentLevelIdx = idx;
    const level = levels[currentLevelIdx];
    canvas.style.backgroundColor = level.bg;
    const initBiome = getBiomeById(getBiomeIdForScore(getProgressScore()));
    currentBiome = initBiome.id;
    const info = document.getElementById("level-info");
    if (info) info.innerText = `生态: ${initBiome.name}`;
    platforms = [];
    trees = [];
    chests = [];
    items = [];
    decorations = [];
    particles = [];
    enemies = [];
    golems = [];
    digHits.clear();
    resetProjectiles();
    playerPositionHistory = [];
    lastGenX = 0;
    cameraX = 0;
    wordGates = [];
    sessionCollectedWords = [];
    updateHpUI();
    player.x = 100;
    player.y = Math.min(300, groundY - player.height - 10);
    player.velX = 0;
    player.velY = 0;
    generatePlatform(0, 12, groundY);
    // Safety: ensure ground platform exists and is within canvas
    if (!platforms.length || groundY <= 0 || groundY >= canvas.height) {
        console.warn('startLevel: groundY invalid or no platforms', { groundY, canvasHeight: canvas.height, platforms: platforms.length });
    }
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildWordPicker() {
    const base = Array.isArray(wordDatabase) ? wordDatabase.filter(w => w && w.en) : [];
    let bag = shuffle(base);
    let cursor = 0;
    const INTERVALS = {
        correct_fast: [0, 5, 15, 40, 120, 300],
        correct_slow: [0, 3, 10, 28, 80, 220],
        wrong: [0, 1, 3, 8, 20, 60]
    };
    const stats = Object.create(null);
    const due = Object.create(null);
    const unseen = shuffle(base.map(w => w.en));
    let tick = 0;
    const byEn = Object.create(null);
    base.forEach(w => { byEn[w.en] = w; });
    return {
        next(excludeSet) {
            if (!base.length) return { en: "word", zh: "单词" };
            const excludes = excludeSet || new Set();
            tick++;

            for (let tries = 0; tries < unseen.length; tries++) {
                const en = unseen[0];
                if (!en) break;
                if (!excludes.has(en) && !stats[en]) {
                    unseen.shift();
                    stats[en] = { count: 1, quality: "correct_slow" };
                    const ivl = INTERVALS.correct_slow;
                    due[en] = tick + ivl[Math.min(stats[en].count, ivl.length - 1)];
                    return byEn[en] || base[0];
                }
                unseen.shift();
                unseen.push(en);
            }

            let best = null;
            let bestCount = Infinity;
            for (let i = 0; i < base.length; i++) {
                const w = bag[cursor++ % bag.length];
                if (!w || excludes.has(w.en)) continue;
                const nextDue = typeof due[w.en] === "number" ? due[w.en] : 0;
                if (nextDue > tick) continue;
                const c = stats[w.en]?.count || 0;
                if (c < bestCount) {
                    best = w;
                    bestCount = c;
                    if (bestCount === 0) break;
                } else if (c === bestCount && Math.random() < 0.25) {
                    best = w;
                }
            }
            const chosen = best || base[Math.floor(Math.random() * base.length)];
            if (!stats[chosen.en]) stats[chosen.en] = { count: 0, quality: "correct_slow" };
            stats[chosen.en].count++;
            const q = stats[chosen.en].quality || "correct_slow";
            const ivl = INTERVALS[q] || INTERVALS.correct_slow;
            due[chosen.en] = tick + ivl[Math.min(stats[chosen.en].count, ivl.length - 1)];
            return chosen;
        },
        updateWordQuality(en, quality) {
            if (!en) return;
            if (!stats[en]) stats[en] = { count: 0, quality: "correct_slow" };
            stats[en].quality = quality || "correct_slow";
            if (quality === "wrong") {
                due[en] = tick;
            }
        }
    };
}

function ensureWordPicker() {
    if (!wordPicker) wordPicker = buildWordPicker();
}

function pickWordForSpawn() {
    ensureWordPicker();
    const exclude = new Set();
    if (settings.avoidWordRepeats) {
        items.forEach(i => { if (i && i.wordObj && i.wordObj.en) exclude.add(i.wordObj.en); });
        if (lastWord && lastWord.en) exclude.add(lastWord.en);
    }
    return wordPicker.next(exclude);
}

function clearOldWordItems() {
    items = items.filter(item => !(item && item.wordObj));
    lastWordItemX = cameraX - 100;
}

function spawnWordItemNearPlayer() {
    if (!player) return;
    const word = pickWordForSpawn();
    if (!word) return;
    const spawnX = player.x + 200;
    if (!canSpawnWordItemAt(spawnX)) return;
    const spawnY = player.y - 50;
    const item = new Item(spawnX, spawnY, word);
    items.push(item);
    registerWordItemSpawn(spawnX);
}

function getSpawnRates() {
    const s = gameConfig.spawn || {};
    let treeChance = s.treeChance ?? 0.2;
    let chestChance = s.chestChance ?? 0.35;
    let itemChance = s.itemChance ?? 0.55;
    let enemyChance = s.enemyChance ?? 0.7;

    if (settings.learningMode) {
        // Learning mode should reduce enemies, but not to the point that they vanish.
        enemyChance *= 0.6;
        treeChance *= 0.6;
        chestChance *= 0.8;
        itemChance = Math.min(0.85, itemChance * 1.2);
    }

    const diff = getDifficultyState();
    enemyChance *= diff.enemySpawnMult;
    chestChance *= diff.chestSpawnMult;

    const clamp01 = v => Math.max(0, Math.min(1, v));
    treeChance = clamp01(treeChance);
    chestChance = clamp01(Math.max(chestChance, treeChance));
    itemChance = clamp01(Math.max(itemChance, chestChance));
    enemyChance = clamp01(Math.max(enemyChance, itemChance));
    return { treeChance, chestChance, itemChance, enemyChance };
}

function canSpawnWordItemAt(x) {
    const minGap = Number(gameConfig?.spawn?.wordItemMinGap ?? 150) || 150;
    return Math.abs(x - lastWordItemX) >= minGap;
}

function registerWordItemSpawn(x) {
    lastWordItemX = x;
}

function estimateMaxJumpHeightPx() {
    const g = Math.max(0.05, Number(gameConfig?.physics?.gravity) || 0.2);
    const v1 = Math.abs(Number(player?.jumpStrength ?? gameConfig?.physics?.jumpStrength ?? -7));
    let h = (v1 * v1) / (2 * g);
    const maxJumps = Number(player?.maxJumps ?? gameConfig?.player?.maxJumps ?? 1);
    if (maxJumps >= 2) {
        const v2 = v1 * 0.8;
        h += (v2 * v2) / (2 * g);
    }
    if (!isFinite(h) || h <= 0) return 120;
    return h;
}

function generatePlatform(startX, length, groundYValue) {
    console.log('generatePlatform called:', { startX, length, groundYValue, blockSize });
    const level = levels[currentLevelIdx];
    const biome = getBiomeById(getBiomeIdForScore(getProgressScore()));
    const platformCfg = biome.platform || {};
    const groundType = biome.groundType || level.ground;
    const newWidth = length * blockSize;
    console.log('Platform config:', { groundType, newWidth, biomeId: biome.id });
    let merged = false;
    for (let i = platforms.length - 1; i >= 0; i--) {
        const p = platforms[i];
        if (p.y === groundYValue && p.type === groundType) {
            if (Math.abs((p.x + p.width) - startX) < 1.5) {
                p.width += newWidth;
                merged = true;
            }
            break;
        }
    }

    if (!merged) {
        platforms.push(new Platform(startX, groundYValue, newWidth, blockSize, groundType));
        console.log('Platform created! Total platforms:', platforms.length);
    }

    generateBiomeDecorations(startX, groundYValue, newWidth, biome);

    const floatChance = (gameConfig.spawn.floatingPlatformChance || 0) * (platformCfg.floatingChanceMult || 1);
    const floatItemChance = (gameConfig.spawn.floatingItemChance || 0) * (platformCfg.floatingItemChanceMult || 1);
    if (length > 5 && Math.random() < floatChance) {
        const floatLen = 2 + Math.floor(Math.random() * 3);
        const maxJump = estimateMaxJumpHeightPx() * 0.85;
        const minOffset = Math.max(50, Number(platformCfg.floatingMinOffset) || 100);
        const maxExtra = Math.max(0, Number(platformCfg.floatingMaxExtra) || 80);
        const maxOffset = Math.max(60, Math.min(minOffset + maxExtra, maxJump - 12));
        const baseOffset = Math.min(minOffset, maxOffset);
        const extra = Math.max(0, maxOffset - baseOffset);
        const floatY = Math.round((groundYValue - baseOffset - Math.random() * extra) / (blockSize / 2)) * (blockSize / 2);
        const floatX = startX + blockSize + Math.floor(Math.random() * (length - floatLen) * blockSize);
        const floatTypes = Array.isArray(platformCfg.floatingGroundTypes) && platformCfg.floatingGroundTypes.length ? platformCfg.floatingGroundTypes : [groundType];
        const floatType = floatTypes[Math.floor(Math.random() * floatTypes.length)] || groundType;
        const floatPlatform = new Platform(floatX, floatY, floatLen * blockSize, blockSize, floatType);
        if (biome.id === "nether" && Math.random() < 0.45 && typeof floatPlatform.makeFragile === "function") {
            floatPlatform.makeFragile(3);
        }
        platforms.push(floatPlatform);
        const floatItemX = floatX + blockSize / 2;
        if (Math.random() < floatItemChance && canSpawnWordItemAt(floatItemX)) {
            const word = pickWordForSpawn();
            items.push(new Item(floatItemX, floatY - 50, word));
            registerWordItemSpawn(floatItemX);
        }
    }

    const microChance = Number(platformCfg.microPlatformChance) || 0;
    const microPeriod = Math.max(1, Number(platformCfg.microPlatformPeriod) || 1);
    const microSegment = Math.floor(startX / (blockSize * 6));
    const allowMicro = microSegment % microPeriod === 0;
    if (microChance > 0 && allowMicro && Math.random() < microChance && newWidth >= blockSize * 4) {
        const maxCount = Math.max(1, Number(platformCfg.microPlatformMaxCount) || 2);
        const count = 1 + Math.floor(Math.random() * maxCount);
        const microType = platformCfg.microPlatformType || "grass";
        const pattern = String(platformCfg.microPattern || "stair").toLowerCase();
        const maxJumpBlocks = Math.max(1, Math.floor((estimateMaxJumpHeightPx() * 0.85) / blockSize));
        const maxRiseBlocks = Math.max(1, Math.min(maxJumpBlocks, Number(platformCfg.microMaxRiseBlocks) || 2));

        if (pattern === "stair") {
            const steps = Math.max(1, Math.min(count, maxRiseBlocks));
            const minX = startX + blockSize;
            const maxX = startX + newWidth - blockSize * (steps + 1);
            if (maxX > minX) {
                let stairX0 = minX + Math.random() * (maxX - minX);
                stairX0 = Math.floor(stairX0 / blockSize) * blockSize;
                for (let i = 0; i < steps; i++) {
                    const mx = stairX0 + i * blockSize;
                    const my = groundYValue - (i + 1) * blockSize;
                    const microPlatform = new Platform(mx, my, blockSize, blockSize, microType);
                    if (biome.id === "nether" && Math.random() < 0.5 && typeof microPlatform.makeFragile === "function") {
                        microPlatform.makeFragile(3);
                    }
                    platforms.push(microPlatform);
                }
                const topX = stairX0 + (steps - 1) * blockSize + blockSize / 2;
                if (Math.random() < (platformCfg.microItemChance || 0) && canSpawnWordItemAt(topX)) {
                    const word = pickWordForSpawn();
                    const topY = groundYValue - steps * blockSize - 50;
                    items.push(new Item(topX, topY, word));
                    registerWordItemSpawn(topX);
                }
            }
        } else {
            // fallback: random but clamped to be reachable
            const maxJump = estimateMaxJumpHeightPx() * 0.85;
            const minOffset = Math.max(50, Number(platformCfg.microPlatformMinOffset) || 80);
            const maxExtra = Math.max(0, Number(platformCfg.microPlatformMaxExtra) || 60);
            const maxOffset = Math.max(60, Math.min(minOffset + maxExtra, maxJump - 12));
            const baseOffset = Math.min(minOffset, maxOffset);
            const extra = Math.max(0, maxOffset - baseOffset);
            for (let i = 0; i < count; i++) {
                let mx = startX + blockSize + Math.random() * (newWidth - blockSize * 2);
                mx = Math.floor(mx / blockSize) * blockSize;
                const my = Math.round((groundYValue - baseOffset - Math.random() * extra) / (blockSize / 2)) * (blockSize / 2);
                const microPlatform = new Platform(mx, my, blockSize, blockSize, microType);
                if (biome.id === "nether" && Math.random() < 0.5 && typeof microPlatform.makeFragile === "function") {
                    microPlatform.makeFragile(3);
                }
                platforms.push(microPlatform);
                const spawnX = mx + blockSize / 2;
                if (Math.random() < (platformCfg.microItemChance || 0) && canSpawnWordItemAt(spawnX)) {
                    const word = pickWordForSpawn();
                    items.push(new Item(spawnX, my - 50, word));
                    registerWordItemSpawn(spawnX);
                }
            }
        }
    }

    if (startX > 400) {
        const objectX = startX + 100 + Math.random() * (length * blockSize - 150);
        const rand = Math.random();
        const rates = getSpawnRates();
        const enemyConfig = getEnemyConfig();
        let enemyChance = rates.enemyChance;
        if (enemyConfig.spawnChance != null) {
            let extra = enemyConfig.spawnChance;
            if (settings.learningMode) extra *= 0.6;
            enemyChance = Math.min(1, Math.max(enemyChance, rates.itemChance + extra));
        }
        enemyChance = Math.min(1, Math.max(enemyChance, rates.itemChance));
        if (rand < rates.treeChance) {
            spawnBiomeTree(objectX, groundYValue, biome, level.treeType);
        } else if (rand < rates.chestChance) {
            chests.push(new Chest(objectX, groundYValue));
        } else if (rand < rates.itemChance && canSpawnWordItemAt(objectX)) {
            const word = pickWordForSpawn();
            items.push(new Item(objectX, groundYValue - 60, word));
            registerWordItemSpawn(objectX);
        } else if (settings.wordGateEnabled && Math.random() < LEARNING_CONFIG.wordGate.spawnChance && getProgressScore() >= (LEARNING_CONFIG.wordGate.minScore || 0)) {
            const gateWord = pickWordForSpawn();
            if (gateWord) wordGates.push(new WordGate(objectX, groundYValue - 20, gateWord));
        } else if (rand < enemyChance) {
            spawnEnemyByDifficulty(objectX, groundYValue - 32);
        }
    }

    lastGenX = startX + length * blockSize;
}

function spawnEnemyByDifficulty(x, y) {
    // 村庄安全区不刷怪 (v1.8.0)
    if (typeof isInVillageArea === 'function' && isInVillageArea(x)) return;
    const enemyConfig = getEnemyConfig();
    const step = Number(getBiomeSwitchConfig().stepScore) || 200;
    const tier = Math.max(0, Math.floor((Number(getProgressScore()) || 0) / Math.max(1, step)));
    const biomePools = {
        forest: ["zombie", "creeper", "spider", "skeleton", "enderman"],
        snow: ["zombie", "skeleton", "creeper", "spider", "enderman"],
        desert: ["zombie", "creeper", "skeleton", "spider", "enderman"],
        mountain: ["zombie", "skeleton", "enderman", "creeper", "spider"],
        ocean: ["drowned", "pufferfish"],
        nether: ["zombie", "piglin", "skeleton", "creeper", "enderman"]
    };
    const basePool = biomePools[currentBiome] || ["zombie", "creeper", "spider", "skeleton", "enderman"];
    const take = Math.max(2, Math.min(basePool.length, 2 + tier));
    let pool = basePool.slice(0, take).filter(t => ENEMY_STATS[t]);
    if (getProgressScore() < 3000) {
        pool = pool.filter(t => t !== "enderman");
    }

    const aliveEnemies = enemies.filter(e => !e.remove && e.y < 900).length;
    const penaltyMult = typeof getMushroomIslandPenaltyMultiplier === 'function'
        ? Math.max(1, Number(getMushroomIslandPenaltyMultiplier()) || 1)
        : 1;
    const maxOnScreen = Math.round((enemyConfig.maxOnScreen || 8) * penaltyMult);
    if (aliveEnemies >= maxOnScreen) return;

    if (currentBiome === "nether") {
        const weightedPool = [
            { type: "zombie", weight: 0.2 },
            { type: "piglin", weight: 0.3 },
            { type: "skeleton", weight: 0.2 },
            { type: "creeper", weight: 0.15 },
            { type: "enderman", weight: 0.15 }
        ];
        let randomValue = Math.random();
        let selectedType = "piglin";
        for (const entry of weightedPool) {
            randomValue -= entry.weight;
            if (randomValue <= 0) {
                selectedType = entry.type;
                break;
            }
        }
        enemies.push(new Enemy(x, y, selectedType));
        return;
    }

    if (typeof spawnBiomeEnemy === "function") {
        const biomeEnemy = spawnBiomeEnemy(currentBiome, x, y);
        if (biomeEnemy) {
            enemies.push(biomeEnemy);
            return;
        }
    }

    const type = pool.length ? pool[Math.floor(Math.random() * pool.length)] : "zombie";
    enemies.push(new Enemy(x, y, type));
}

function weightedPick(table) {
    const entries = Object.entries(table || {});
    if (!entries.length) return null;
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let r = Math.random() * (total || 1);
    for (const [key, w] of entries) {
        r -= w;
        if (r <= 0) return key;
    }
    return entries[entries.length - 1][0];
}

function pickWeightedLoot(table) {
    if (!table || !table.length) return null;
    const total = table.reduce((sum, entry) => sum + (entry.weight || 0), 0);
    let r = Math.random() * (total || 1);
    for (const entry of table) {
        r -= (entry.weight || 0);
        if (r <= 0) return entry;
    }
    return table[table.length - 1];
}

function pickChestRarity(rarities, rareBoost) {
    if (!rarities || !rarities.length) return "common";
    const boost = Number(rareBoost) || 0;
    const adjusted = rarities.map((r, idx) => {
        const base = Number(r.weight) || 1;
        const mult = 1 + boost * idx;
        return { ...r, weight: Math.max(1, base * mult) };
    });
    const picked = pickWeightedLoot(adjusted);
    return picked?.id || "common";
}

function spawnBiomeTree(x, yPos, biome, fallbackType) {
    if (biome && biome.id === "ocean") {
        spawnDecoration("seaweed", obj => obj.reset(x, yPos - 30), () => new Seaweed(x, yPos - 30));
        return;
    }
    const type = weightedPick(biome.treeTypes) || fallbackType || "oak";
    trees.push(new Tree(x, yPos, type));
}

function generateBiomeDecorations(x, yPos, width, biome) {
    const decorConfig = biome.decorations || {};
    Object.entries(decorConfig).forEach(([decorType, probability]) => {
        if (Math.random() >= probability) return;
        const decorX = x + Math.random() * width;
        switch (decorType) {
            case "tree":
                spawnBiomeTree(decorX, yPos, biome);
                break;
            case "spruce":
            case "pine":
            case "palm_tree":
                spawnBiomeTree(decorX, yPos, biome);
                break;
            case "bush":
                spawnDecoration("bush", obj => obj.reset(decorX, yPos - 20), () => new Bush(decorX, yPos - 20));
                break;
            case "flower":
                spawnDecoration("flower", obj => obj.reset(decorX, yPos - 18), () => new Flower(decorX, yPos - 18));
                break;
            case "mushroom":
                spawnDecoration("mushroom", obj => obj.reset(decorX, yPos - 20), () => new Mushroom(decorX, yPos - 20));
                break;
            case "vine":
                spawnDecoration("vine", obj => obj.reset(decorX, yPos - 80, 40 + Math.random() * 30), () => new Vine(decorX, yPos - 80, 40 + Math.random() * 30));
                break;
            case "ice_spike":
                spawnDecoration("ice_spike", obj => obj.reset(decorX, yPos - 80), () => new IceSpike(decorX, yPos - 80));
                break;
            case "snow_pile": {
                const size = ["small", "medium", "large"][Math.floor(Math.random() * 3)];
                spawnDecoration("snow_pile", obj => obj.reset(decorX, yPos - 25, size), () => new SnowPile(decorX, yPos - 25, size));
                break;
            }
            case "ice_block": {
                const blockWidth = 60 + Math.random() * 80;
                spawnDecoration("ice_block", obj => obj.reset(decorX, yPos - 50, blockWidth), () => new IceBlock(decorX, yPos - 50, blockWidth));
                break;
            }
            case "cactus":
                spawnDecoration("cactus", obj => obj.reset(decorX, yPos - 100), () => new CactusDecor(decorX, yPos - 100));
                break;
            case "dead_bush":
                spawnDecoration("dead_bush", obj => obj.reset(decorX, yPos - 30), () => new DeadBush(decorX, yPos - 30));
                break;
            case "rock": {
                const size = ["small", "medium", "large"][Math.floor(Math.random() * 3)];
                spawnDecoration("rock", obj => obj.reset(decorX, yPos - 30, size), () => new Rock(decorX, yPos - 30, size));
                break;
            }
            case "bones":
                spawnDecoration("bones", obj => obj.reset(decorX, yPos - 12), () => new BoneDecor(decorX, yPos - 12));
                break;
            case "ore_coal":
            case "ore_iron":
            case "ore_gold":
            case "ore_diamond": {
                const oreType = decorType.replace("ore_", "");
                spawnDecoration(decorType, obj => obj.reset(decorX, yPos - 30, oreType), () => new Ore(decorX, yPos - 30, oreType));
                break;
            }
            case "stalactite": {
                const direction = Math.random() > 0.5 ? "down" : "up";
                spawnDecoration("stalactite", obj => obj.reset(decorX, direction === "down" ? yPos - 100 : yPos - 20, direction), () => new Stalactite(decorX, direction === "down" ? yPos - 100 : yPos - 20, direction));
                break;
            }
            case "crystal":
                spawnDecoration("crystal", obj => obj.reset(decorX, yPos - 28), () => new Crystal(decorX, yPos - 28));
                break;
            case "lava_pool": {
                const poolWidth = 60 + Math.random() * 80;
                spawnDecoration("lava_pool", obj => obj.reset(decorX, yPos - 16, poolWidth, biome.id), () => new LavaPool(decorX, yPos - 16, poolWidth, biome.id));
                break;
            }
            case "palm_tree":
                spawnBiomeTree(decorX, yPos, biome);
                break;
            case "shell":
                spawnDecoration("shell", obj => obj.reset(decorX, yPos - 10), () => new Shell(decorX, yPos - 10));
                break;
            case "starfish":
                spawnDecoration("starfish", obj => obj.reset(decorX, yPos - 12), () => new Starfish(decorX, yPos - 12));
                break;
            case "seaweed":
                spawnDecoration("seaweed", obj => obj.reset(decorX, yPos - 30), () => new Seaweed(decorX, yPos - 30));
                break;
            case "boat":
                spawnDecoration("boat", obj => obj.reset(decorX, yPos - 18), () => new BoatDecor(decorX, yPos - 18));
                break;
            case "fire":
                spawnDecoration("fire", obj => obj.reset(decorX, yPos - 24), () => new FireDecor(decorX, yPos - 24));
                break;
            case "lava_fall":
                spawnDecoration("lava_fall", obj => obj.reset(decorX, yPos - 120), () => new LavaFall(decorX, yPos - 120));
                break;
            case "soul_sand": {
                const sandWidth = 40 + Math.random() * 60;
                spawnDecoration("soul_sand", obj => obj.reset(decorX, yPos - 10, sandWidth), () => new SoulSand(decorX, yPos - 10, sandWidth));
                break;
            }
            case "nether_wart":
                spawnDecoration("nether_wart", obj => obj.reset(decorX, yPos - 10), () => new NetherWart(decorX, yPos - 10));
                break;
            case "basalt":
                spawnDecoration("basalt", obj => obj.reset(decorX, yPos - 40), () => new Basalt(decorX, yPos - 40));
                break;
            case "cherry_tree":
            case "flower_cluster":
            case "butterfly":
            case "small_stream":
            case "giant_mushroom":
            case "glow_mushroom":
            case "mushroom_cow":
            case "magma_crack":
            case "hot_spring":
            case "obsidian_pillar":
            case "sculk_sensor":
            case "soul_lantern":
            case "cloud_platform":
                if (typeof spawnBiomeDecoration === "function") {
                    spawnBiomeDecoration(biome?.id || currentBiome, decorX, yPos, yPos);
                }
                break;
            default:
                break;
        }
    });
}

function updateMapGeneration() {
    if (player.x + mapBuffer > lastGenX) {
        if (Math.random() < 0.05) {
            lastGenX += 80 + Math.random() * 40;
        }
        const length = Math.floor(4 + Math.random() * 7);
        generatePlatform(lastGenX, length, groundY);
    }
    platforms = platforms.filter(p => !p.remove && p.x + p.width > cameraX - removeThreshold);
    trees = trees.filter(t => t.x + t.width > cameraX - removeThreshold && !t.remove);
    chests = chests.filter(c => c.x + 40 > cameraX - removeThreshold);
    items = items.filter(i => i.x + 30 > cameraX - removeThreshold && !i.collected);
    enemies = enemies.filter(e => e.x + e.width > cameraX - removeThreshold && !e.remove && e.y < 1000);
}
