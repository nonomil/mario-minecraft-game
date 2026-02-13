/**
 * 05-difficulty.js - 难度系统与动态调整
 * 从 main.js 拆分 (原始行 967-1100)
 */
function getProgressScore() {
    return runBestScore;
}

function getDifficultyConfig() {
    if (difficultyConfigCache) return difficultyConfigCache;
    const cfg = gameConfig?.difficulty || {};
    difficultyConfigCache = mergeDeep(DEFAULT_DIFFICULTY_CONFIG, cfg);
    return difficultyConfigCache;
}

function getDifficultyTier(scoreValue) {
    const cfg = getDifficultyConfig();
    const tiers = Array.isArray(cfg.tiers) ? cfg.tiers : [];
    if (!tiers.length) return { name: "普通", minScore: 0, maxScore: 999999, enemyDamage: 1, enemyHp: 1, enemySpawn: 1, chestSpawn: 1, chestRareBoost: 0, chestRollBonus: 0, scoreMultiplier: 1 };
    // Allow selecting a fixed difficulty tier from settings (otherwise follow score tiers).
    const selected = String(settings?.difficultySelection || "auto");
    if (selected && selected !== "auto") {
        const fixed = tiers.find(t => String(t?.name || "") === selected);
        if (fixed) return fixed;
    }
    const s = Number(scoreValue) || 0;
    const found = tiers.find(t => s >= (t.minScore ?? 0) && s < (t.maxScore ?? Number.MAX_SAFE_INTEGER));
    return found || tiers[tiers.length - 1];
}

function computeDifficultyState() {
    const cfg = getDifficultyConfig();
    const tier = getDifficultyTier(getProgressScore());
    const dda = cfg.dda || {};
    let enemyDamageMult = Number(tier.enemyDamage) || 1;
    let enemyHpMult = Number(tier.enemyHp) || 1;
    let enemySpawnMult = Number(tier.enemySpawn) || 1;
    let chestSpawnMult = Number(tier.chestSpawn) || 1;
    let chestRareBoost = Number(tier.chestRareBoost) || 0;
    let chestRollBonus = Number(tier.chestRollBonus) || 0;
    const scoreMultiplier = Number(tier.scoreMultiplier) || 1;

    if (settings.learningMode) {
        enemyDamageMult *= 0.85;
    }

    if (dda.enabled) {
        const lowHpThreshold = Number(dda.lowHpThreshold ?? 1);
        if (playerHp <= lowHpThreshold) {
            enemyDamageMult *= Number(dda.lowHpEnemyDamage ?? 0.7);
            enemySpawnMult *= Number(dda.lowHpEnemySpawn ?? 0.8);
            chestRareBoost += Number(dda.lowHpChestBonus ?? 0.2);
            chestSpawnMult *= 1.08;
            chestRollBonus += 0.05;
        }
        const noHitFrames = Number(dda.noHitFramesForBoost ?? 720);
        if (gameFrame - lastDamageFrame > noHitFrames) {
            enemyDamageMult *= Number(dda.noHitEnemyDamage ?? 1.15);
            enemySpawnMult *= Number(dda.noHitEnemySpawn ?? 1.1);
        }
        const maxDamage = Number(dda.maxTotalEnemyDamage ?? 2.2);
        const maxSpawn = Number(dda.maxTotalEnemySpawn ?? 1.6);
        enemyDamageMult = clamp(enemyDamageMult, 0.4, maxDamage);
        enemySpawnMult = clamp(enemySpawnMult, 0.4, maxSpawn);
    }

    return {
        name: tier.name || "普通",
        minScore: tier.minScore ?? 0,
        maxScore: tier.maxScore ?? 999999,
        enemyDamageMult,
        enemyHpMult,
        enemySpawnMult,
        chestSpawnMult,
        chestRareBoost,
        chestRollBonus,
        scoreMultiplier
    };
}

function updateDifficultyState(force = false) {
    const next = computeDifficultyState();
    const changed = !difficultyState || difficultyState.name !== next.name;
    difficultyState = next;
    if (changed || force) {
        const el = document.getElementById("difficulty-info");
        if (el) el.innerText = `难度: ${next.name}`;
        if (changed && !force) showToast(`⚔️ 难度调整：${next.name}`);
    }
}

function getDifficultyState() {
    if (!difficultyState) updateDifficultyState(true);
    return difficultyState;
}

function getLootConfig() {
    if (lootConfigCache) return lootConfigCache;
    const cfg = gameConfig?.loot || {};
    const chestTables = mergeDeep(DEFAULT_CHEST_TABLES, cfg.chestTables || {});
    const chestRarities = Array.isArray(cfg.chestRarities) && cfg.chestRarities.length ? cfg.chestRarities : DEFAULT_CHEST_RARITIES;
    const chestRolls = mergeDeep(DEFAULT_CHEST_ROLLS, cfg.chestRolls || {});
    lootConfigCache = { chestTables, chestRarities, chestRolls };
    return lootConfigCache;
}

function resetInventory() {
    inventory = { ...INVENTORY_TEMPLATE };
    playerEquipment = { armor: null, armorDurability: 0 };
    armorInventory = [];
    updateArmorUI();
}

function resetProjectiles() {
    projectiles = [];
    projectilePool.arrows.forEach(p => { p.remove = true; });
    projectilePool.snowballs.forEach(p => { p.remove = true; });
    projectilePool.fireballs.forEach(p => { p.remove = true; });
}

function getEnemyConfig() {
    const base = {
        maxOnScreen: 8,
        spawnChance: 0.3,
        difficultyThresholds: [500, 1000, 2000, 3000],
        bossSpawnScore: 5000
    };
    return mergeDeep(base, gameConfig.enemies || {});
}

function getGolemConfig() {
    const base = {
        maxCount: MAX_GOLEMS,
        ironGolem: { hp: 100, damage: 20, speed: 1.5 },
        snowGolem: { hp: 50, damage: 10, speed: 2.0 }
    };
    return mergeDeep(base, gameConfig.golems || {});
}
