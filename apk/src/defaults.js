window.MMWG_DEFAULTS = {
    gameConfig: {
        canvas: { width: 800, height: 600 },
        physics: {
            gravity: 0.2,
            friction: 0.85,
            jumpStrength: -7.0,
            movementSpeed: 1.2,
            groundY: 530
        },
        world: {
            blockSize: 50,
            cameraOffsetX: 300,
            mapBuffer: 1000,
            removeThreshold: 200,
            fallResetY: 800
        },
        scoring: {
            word: 10,
            enemy: 5,
            levelUp: 100,
            hitPenaltyScale: 0.5,
            minHitPenalty: 5,
            maxHitPenalty: 30
        },
        revive: {
            diamondCost: 10,
            scoreCost: 500,
            scoreReviveHpPercent: 0.5,
            invincibleFrames: 180
        },
        jump: {
            bufferFrames: 12,
            coyoteFrames: 10
        },
        player: {
            width: 26,
            height: 52,
            maxJumps: 2,
            maxHp: 10
        },
        spawn: {
            floatingPlatformChance: 0.6,
            floatingItemChance: 0.5,
            treeChance: 0.2,
            chestChance: 0.35,
            itemChance: 0.55,
            enemyChance: 0.7,
            wordItemMinGap: 150
        },
        platforms: {
            gapChance: 0.16,
            gapWeights: { narrow: 0.5, medium: 0.35, wide: 0.15 },
            gapSizes: { narrow: [1, 2], medium: [2, 3], wide: [3, 4] },
            cloudGapChance: 0.08,
            cloudHeightMin: 120,
            cloudHeightMax: 200,
            cloudPlatformMin: 2,
            cloudPlatformMax: 4,
            cloudSpacingMin: 1,
            cloudSpacingMax: 2,
            cloudFragileChance: 0.35,
            fragileBreakDelay: 120,
            jumpVerbMinAirFrames: 18,
            movingPlatformChance: 0.15,
            movingPlatformSpeedMin: 0.4,
            movingPlatformSpeedMax: 1.1,
            movingPlatformRangeMult: 0.4,
            cloudTypeWeights: { normal: 0.6, thin: 0.25, moving: 0.1, bouncy: 0.05 }
        },
        enemies: {
            maxOnScreen: 8,
            spawnChance: 0.45,
            difficultyThresholds: [500, 1000, 2000, 3000],
            bossSpawnScore: 5000
        },
        difficulty: {
            damageUnit: 20,
            invincibleFrames: 120,
            tiers: [
                { name: "新手", minScore: 0, maxScore: 500, enemyDamage: 0.8, enemyHp: 0.85, enemySpawn: 0.75, chestSpawn: 1.1, chestRareBoost: 0.25, chestRollBonus: 0.08, scoreMultiplier: 1.0 },
                { name: "简单", minScore: 500, maxScore: 1500, enemyDamage: 1.0, enemyHp: 1.0, enemySpawn: 0.95, chestSpawn: 1.0, chestRareBoost: 0.1, chestRollBonus: 0.04, scoreMultiplier: 1.0 },
                { name: "普通", minScore: 1500, maxScore: 3000, enemyDamage: 1.15, enemyHp: 1.1, enemySpawn: 1.05, chestSpawn: 0.95, chestRareBoost: 0.0, chestRollBonus: 0.0, scoreMultiplier: 1.05 },
                { name: "困难", minScore: 3000, maxScore: 5000, enemyDamage: 1.4, enemyHp: 1.25, enemySpawn: 1.2, chestSpawn: 0.9, chestRareBoost: -0.1, chestRollBonus: -0.02, scoreMultiplier: 1.1 },
                { name: "地狱", minScore: 5000, maxScore: 999999, enemyDamage: 1.8, enemyHp: 1.5, enemySpawn: 1.35, chestSpawn: 0.85, chestRareBoost: -0.2, chestRollBonus: -0.04, scoreMultiplier: 1.2 }
            ],
            dda: {
                enabled: true,
                lowHpThreshold: 1,
                lowHpEnemyDamage: 0.7,
                lowHpEnemySpawn: 0.8,
                lowHpChestBonus: 0.2,
                noHitFramesForBoost: 720,
                noHitEnemyDamage: 1.15,
                noHitEnemySpawn: 1.1,
                maxTotalEnemyDamage: 2.2,
                maxTotalEnemySpawn: 1.6
            }
        },
        loot: {
            chestRarities: [
                { id: "common", weight: 60 },
                { id: "rare", weight: 30 },
                { id: "epic", weight: 8 },
                { id: "legendary", weight: 2 }
            ],
            chestTables: {
                common: [
                    { item: "iron", weight: 18, min: 1, max: 3 },
                    { item: "pumpkin", weight: 12, min: 1, max: 2 },
                { item: "stick", weight: 12, min: 1, max: 3 },
                { item: "diamond", weight: 2, min: 1, max: 1 },
                { item: "coal", weight: 10, min: 1, max: 3 },
                { item: "arrow", weight: 10, min: 2, max: 6 },
                { item: "rotten_flesh", weight: 8, min: 1, max: 3 },
                { item: "flower", weight: 6, min: 1, max: 2 },
                { item: "mushroom", weight: 6, min: 1, max: 2 },
                { item: "hp", weight: 8, min: 1, max: 1 },
                { item: "armor_leather", weight: 5, min: 1, max: 1 },
                { item: "score", weight: 7, min: 10, max: 25 },
                { item: "word_card", weight: 25, min: 5, max: 10 },
                { item: "empty", weight: 10, min: 0, max: 0 }
            ],
            rare: [
                { item: "diamond", weight: 3, min: 1, max: 1 },
                { item: "stone_sword", weight: 7, min: 1, max: 1 },
                { item: "iron_pickaxe", weight: 5, min: 1, max: 1 },
                { item: "bow", weight: 4, min: 1, max: 1 },
                { item: "ender_pearl", weight: 4, min: 1, max: 1 },
                { item: "iron", weight: 8, min: 2, max: 4 },
                { item: "arrow", weight: 8, min: 4, max: 8 },
                { item: "hp", weight: 8, min: 1, max: 1 },
                { item: "armor_chainmail", weight: 4, min: 1, max: 1 },
                { item: "armor_iron", weight: 3, min: 1, max: 1 },
                { item: "score", weight: 8, min: 20, max: 40 },
                { item: "word_card", weight: 15, min: 10, max: 20 }
            ],
            epic: [
                { item: "max_hp", weight: 6, min: 1, max: 1 },
                { item: "diamond", weight: 4, min: 1, max: 1 },
                { item: "ender_pearl", weight: 5, min: 1, max: 2 },
                { item: "iron_pickaxe", weight: 6, min: 1, max: 1 },
                { item: "bow", weight: 6, min: 1, max: 1 },
                { item: "armor_gold", weight: 3, min: 1, max: 1 },
                { item: "armor_diamond", weight: 2, min: 1, max: 1 },
                { item: "score", weight: 8, min: 40, max: 80 },
                { item: "word_card", weight: 10, min: 15, max: 25 }
            ],
            legendary: [
                { item: "max_hp", weight: 8, min: 1, max: 2 },
                { item: "diamond", weight: 5, min: 1, max: 2 },
                { item: "dragon_egg", weight: 4, min: 1, max: 1 },
                { item: "ender_pearl", weight: 6, min: 2, max: 3 },
                { item: "armor_netherite", weight: 3, min: 1, max: 1 },
                { item: "score", weight: 10, min: 80, max: 150 }
            ]
            },
            chestRolls: {
                twoDropChance: 0.30,
                threeDropChance: 0.10
            }
        },
        golems: {
            maxCount: 3,
            ironGolem: { hp: 100, damage: 20, speed: 1.5 },
            snowGolem: { hp: 50, damage: 10, speed: 2.0 }
        }
    },
    controls: {
        left: "ArrowLeft",
        right: "ArrowRight",
        jump: "Space",
        attack: "KeyJ",
        interact: "KeyY",
        switch: "KeyK",
        useDiamond: "KeyZ"
    },
    levels: [
        { name: "草原", bg: "#87CEEB", ground: "grass", treeType: "oak" },
        { name: "雪地", bg: "#E0F7FA", ground: "snow", treeType: "spruce" },
        { name: "矿洞", bg: "#2F2F2F", ground: "stone", treeType: "mushroom" },
        { name: "森林", bg: "#228B22", ground: "forest", treeType: "big_oak" },
        { name: "沙漠", bg: "#FFECB3", ground: "sand", treeType: "cactus" }
    ],
    words: [
        { en: "cat", zh: "猫" },
        { en: "dog", zh: "狗" },
        { en: "pig", zh: "猪" },
        { en: "duck", zh: "鸭" },
        { en: "cow", zh: "牛" },
        { en: "red", zh: "红色" },
        { en: "blue", zh: "蓝色" },
        { en: "green", zh: "绿色" },
        { en: "yellow", zh: "黄色" },
        { en: "one", zh: "一" },
        { en: "two", zh: "二" },
        { en: "three", zh: "三" },
        { en: "apple", zh: "苹果" },
        { en: "tree", zh: "树" },
        { en: "flower", zh: "花" },
        { en: "grass", zh: "草" },
        { en: "sky", zh: "天空" }
    ],
    settings: {
        learningMode: true,
        challengeEnabled: true,
        challengeFrequency: 0.3,
        wordGateEnabled: true,
        wordMatchEnabled: true,
        speechEnabled: true,
        speechZhEnabled: false,
        speechEnRate: 1.2,
        speechZhRate: 1.1,
        musicEnabled: true,
        deviceMode: "phone",
        orientationLock: "auto",
        uiScale: 1.0,
        motionScale: 1.25,
        touchControls: true,
        avoidWordRepeats: true,
        showWordImage: true,
        showEnvironmentLabels: true,
        biomeSwitchStepScore: 200,
        gameDifficulty: "medium",
        vocabStage: "auto",
        vocabSelection: "vocab.kindergarten",
        vocabDifficulty: "auto",
        movementSpeedLevel: "normal",
        keyCodes: "Space,KeyJ,KeyY,KeyK,KeyZ",
        villageEnabled: true,
        villageFrequency: 500,
        villageAutoSave: true
    }
};
