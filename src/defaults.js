window.MMWG_DEFAULTS = {
    gameConfig: {
        canvas: { width: 800, height: 600 },
        physics: {
            gravity: 0.2,
            friction: 0.85,
            jumpStrength: -7.0,
            movementSpeed: 2.0,
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
            levelUp: 100
        },
        jump: {
            bufferFrames: 12,
            coyoteFrames: 10
        },
        player: {
            width: 26,
            height: 52,
            maxJumps: 2
        },
        spawn: {
            floatingPlatformChance: 0.6,
            floatingItemChance: 0.5,
            treeChance: 0.2,
            chestChance: 0.35,
            itemChance: 0.55,
            enemyChance: 0.7
        },
        enemies: {
            maxOnScreen: 8,
            spawnChance: 0.45,
            difficultyThresholds: [500, 1000, 2000, 3000],
            bossSpawnScore: 5000
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
        interact: "KeyY"
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
        speechEnabled: true,
        speechEnRate: 0.8,
        speechZhRate: 0.9,
        uiScale: 1.0,
        motionScale: 1.25,
        touchControls: true,
        avoidWordRepeats: true,
        showWordImage: true,
        biomeSwitchStepScore: 200,
        vocabSelection: "auto"
    }
};
