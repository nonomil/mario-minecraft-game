/**
 * main.difficulty.js - 难度系统模块
 *
 * 本模块包含游戏难度相关功能：
 * - 难度配置获取
 * - 难度等级计算
 * - 动态难度调整（DDA）
 * - 掉落配置
 */

(function() {
    const M = window.MMWG;

    // ============================================
    // 难度配置获取
    // ============================================
    function getProgressScore() {
        return M.runBestScore;
    }

    function getDifficultyConfig() {
        if (M.difficultyConfigCache) return M.difficultyConfigCache;
        const cfg = M.gameConfig?.difficulty || {};
        M.difficultyConfigCache = M.mergeDeep(M.DEFAULT_DIFFICULTY_CONFIG, cfg);
        return M.difficultyConfigCache;
    }

    function getDifficultyTier(scoreValue) {
        const cfg = getDifficultyConfig();
        const tiers = Array.isArray(cfg.tiers) ? cfg.tiers : [];
        if (!tiers.length) return { name: "普通", minScore: 0, maxScore: 999999, enemyDamage: 1, enemyHp: 1, enemySpawn: 1, chestSpawn: 1, chestRareBoost: 0, chestRollBonus: 0, scoreMultiplier: 1 };
        const s = Number(scoreValue) || 0;
        const found = tiers.find(t => s >= (t.minScore ?? 0) && s < (t.maxScore ?? Number.MAX_SAFE_INTEGER));
        return found || tiers[tiers.length - 1];
    }

    // ============================================
    // 难度状态计算
    // ============================================
    function computeDifficultyState() {
        const cfg = getDifficultyConfig();
        let tier = getDifficultyTier(getProgressScore());
        const pref = M.settings.gameDifficulty || "medium";
        const forcedIndex = pref === "simple" ? 1 : pref === "medium" ? 2 : pref === "hard" ? 3 : null;
        if (forcedIndex !== null && Array.isArray(cfg.tiers) && cfg.tiers.length) {
            const idx = Math.min(cfg.tiers.length - 1, Math.max(0, forcedIndex));
            tier = cfg.tiers[idx] || tier;
        }
        const displayName = pref === "simple" ? "简单" : pref === "medium" ? "中等" : pref === "hard" ? "困难" : tier.name;
        const dda = cfg.dda || {};
        let enemyDamageMult = Number(tier.enemyDamage) || 1;
        let enemyHpMult = Number(tier.enemyHp) || 1;
        let enemySpawnMult = Number(tier.enemySpawn) || 1;
        let chestSpawnMult = Number(tier.chestSpawn) || 1;
        let chestRareBoost = Number(tier.chestRareBoost) || 0;
        let chestRollBonus = Number(tier.chestRollBonus) || 0;
        const scoreMultiplier = Number(tier.scoreMultiplier) || 1;

        if (M.settings.learningMode) {
            enemyDamageMult *= 0.85;
        }

        if (dda.enabled) {
            const lowHpThreshold = Number(dda.lowHpThreshold ?? 1);
            if (M.playerHp <= lowHpThreshold) {
                enemyDamageMult *= Number(dda.lowHpEnemyDamage ?? 0.7);
                enemySpawnMult *= Number(dda.lowHpEnemySpawn ?? 0.8);
                chestRareBoost += Number(dda.lowHpChestBonus ?? 0.2);
                chestSpawnMult *= 1.08;
                chestRollBonus += 0.05;
            }
            const noHitFrames = Number(dda.noHitFramesForBoost ?? 720);
            if (M.gameFrame - M.lastDamageFrame > noHitFrames) {
                enemyDamageMult *= Number(dda.noHitEnemyDamage ?? 1.15);
                enemySpawnMult *= Number(dda.noHitEnemySpawn ?? 1.1);
            }
            const maxDamage = Number(dda.maxTotalEnemyDamage ?? 2.2);
            const maxSpawn = Number(dda.maxTotalEnemySpawn ?? 1.6);
            enemyDamageMult = M.clamp(enemyDamageMult, 0.4, maxDamage);
            enemySpawnMult = M.clamp(enemySpawnMult, 0.4, maxSpawn);
        }

        return {
            name: displayName || tier.name || "普通",
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
        const changed = !M.difficultyState || M.difficultyState.name !== next.name;
        M.difficultyState = next;
        if (changed || force) {
            const el = document.getElementById("difficulty-info");
            if (el) el.innerText = `难度: ${next.name}`;
        }
    }

    function getDifficultyState() {
        if (!M.difficultyState) updateDifficultyState(true);
        return M.difficultyState;
    }

    // ============================================
    // 掉落配置
    // ============================================
    function getLootConfig() {
        if (M.lootConfigCache) return M.lootConfigCache;
        const cfg = M.gameConfig?.loot || {};
        const chestTables = M.mergeDeep(M.DEFAULT_CHEST_TABLES, cfg.chestTables || {});
        const chestRarities = Array.isArray(cfg.chestRarities) && cfg.chestRarities.length ? cfg.chestRarities : M.DEFAULT_CHEST_RARITIES;
        const chestRolls = M.mergeDeep(M.DEFAULT_CHEST_ROLLS, cfg.chestRolls || {});
        M.lootConfigCache = { chestTables, chestRarities, chestRolls };
        return M.lootConfigCache;
    }

    // ============================================
    // 敌人和傀儡配置
    // ============================================
    function getEnemyConfig() {
        const base = {
            maxOnScreen: 8,
            spawnChance: 0.3,
            difficultyThresholds: [500, 1000, 2000, 3000],
            bossSpawnScore: 5000
        };
        return M.mergeDeep(base, M.gameConfig.enemies || {});
    }

    function getGolemConfig() {
        const base = {
            maxCount: M.MAX_GOLEMS,
            ironGolem: { hp: 100, damage: 20, speed: 1.5 },
            snowGolem: { hp: 50, damage: 10, speed: 2.0 }
        };
        return M.mergeDeep(base, M.gameConfig.golems || {});
    }

    // ============================================
    // 导出到全局
    // ============================================
    Object.assign(M, {
        getProgressScore,
        getDifficultyConfig,
        getDifficultyTier,
        computeDifficultyState,
        updateDifficultyState,
        getDifficultyState,
        getLootConfig,
        getEnemyConfig,
        getGolemConfig
    });
})();
