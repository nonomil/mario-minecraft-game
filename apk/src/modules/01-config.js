/**
 * 01-config.js - 全局状态、常量、模板定义
 * 从 main.js 拆分 (原始行 1-578)
 */
const defaults = window.MMWG_DEFAULTS || {};
const storage = window.MMWG_STORAGE;
// start() finishes wiring input/UI handlers before gameplay loop can begin.
// This prevents "login shown but game loop already running" and avoids races on auto-login.
let bootReady = false;
const defaultGameConfig = defaults.gameConfig || {};
const defaultControls = defaults.controls || {};
const defaultLevels = defaults.levels || [];
const defaultWords = defaults.words || [];
const defaultSettings = defaults.settings || {};

async function loadJsonWithFallback(path, fallback) {
    try {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) {
            throw new Error("load failed");
        }
        return await response.json();
    } catch {
        return JSON.parse(JSON.stringify(fallback));
    }
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameConfig = JSON.parse(JSON.stringify(defaultGameConfig));
let keyBindings = { ...defaultControls };
let levels = [...defaultLevels];
let wordDatabase = [...defaultWords];
let settings = storage ? storage.loadJson("mmwg:settings", defaultSettings) : JSON.parse(JSON.stringify(defaultSettings));
let vocabState = storage ? storage.loadJson("mmwg:vocabState", { runCounts: {}, lastPackId: null }) : { runCounts: {}, lastPackId: null };
let progress = storage ? storage.loadJson("mmwg:progress", { vocab: {} }) : { vocab: {} };
let lastWord = null;
let wordPicker = null;
let followUpQueue = [];
let paused = false;
let startedOnce = false;
let vocabManifest = window.MMWG_VOCAB_MANIFEST || null;
let vocabPackOrder = [];
let vocabPacks = Object.create(null);
let vocabEngine = null;
let activeVocabPackId = null;
let loadedVocabFiles = Object.create(null);
let sessionWordCounts = Object.create(null);
let sessionCollectedWords = [];
let wordGates = [];
let wordMatchActive = false;
let wordMatchTimer = null;
let currentLearningChallenge = null;
let challengeTimerId = null;
let challengeDeadline = 0;
let challengeOrigin = null;
let challengeModalEl = null;
let challengeQuestionEl = null;
let challengeOptionsEl = null;
let challengeInputWrapperEl = null;
let challengeInputEl = null;
let challengeTimerEl = null;
let challengeRepeatBtn = null;
let challengeHintBtn = null;
let wordMatchScreenEl = null;
let matchLeftEl = null;
let matchRightEl = null;
let matchLinesEl = null;
let matchCountEl = null;
let matchTotalEl = null;
let matchSubmitBtn = null;
let matchResultEl = null;
let matchSubtitleEl = null;
let matchTimerEl = null;
let activeWordMatch = null;
let inventoryModalEl = null;
let inventoryContentEl = null;
let inventoryTabButtons = null;
let inventoryTab = "items";
let inventoryDropMode = false;
let profileModalEl = null;
let profileUsernameEl = null;
let profilePlaytimeEl = null;
let profileHighscoreEl = null;
let profileWordsEl = null;
let profileGamesEl = null;
let achievementsContainerEl = null;
let chestHintSeen = storage ? storage.loadJson("mmwg:hintChestSeen", false) : false;
let chestHintFramesLeft = 0;
const CHEST_HINT_FRAMES = 180;
let chestHintPos = null;
let audioCtx = null;
let audioUnlocked = false;
let speechReady = false;
let speechVoicesReady = false;
let speechPendingWord = null;
let speechPendingUnlockWord = null;
let speechPendingTimer = null;
let speechPendingAttempts = 0;
let ttsAudio = null;
let ttsSeqId = 0;
let bgmAudio = null;
let bgmReady = false;
let bgmPausedByVisibility = false;
const BGM_SOURCES = ["audio/minecraft-theme.mp3"];

let score = 0;
let levelScore = 0;
let runBestScore = 0;
let cameraX = 0;
let gameFrame = 0;
let currentLevelIdx = 0;
let playerHp = 3;
let playerMaxHp = 3;
let lastWordItemX = -Infinity;

const INVENTORY_TEMPLATE = {
    diamond: 0,
    pumpkin: 0,
    iron: 0,
    stick: 0,
    stone_sword: 1,
    iron_pickaxe: 0,
    bow: 1,
    arrow: 5,
    gunpowder: 0,
    rotten_flesh: 0,
    string: 0,
    ender_pearl: 0,
    dragon_egg: 0,
    flower: 0,
    mushroom: 0,
    coal: 0,
    gold: 0,
    shell: 0,
    starfish: 0,
    snow_block: 0,
    sculk_vein: 0,
    echo_shard: 0,
    beef: 0,
    mutton: 0,
    mushroom_stew: 0,
    totem: 0
};
let inventory = { ...INVENTORY_TEMPLATE };
let selectedSlot = 0;

// 物品冷却系统
const ITEM_COOLDOWNS = {
    gunpowder: 300,      // 5秒 (火药炸弹)
    ender_pearl: 480,    // 8秒 (末影珍珠传送)
    string: 360,         // 6秒 (蜘蛛丝陷阱)
    rotten_flesh: 240,   // 4秒 (腐肉诱饵)
    shell: 1200,         // 20秒 (贝壳护盾)
    coal: 180,           // 3秒 (煤矿火把)
    flower: 600,         // 10秒 (花朵治愈)
    dragon_egg: 720,     // 12秒 (龙蛋龙息)
    starfish: 5400,      // 90秒 (海星幸运)
    gold: 0              // 无冷却 (黄金交易)
};
let itemCooldownTimers = {}; // { itemKey: remainingFrames }

// 物品描述（用于Tooltip）
const ITEM_DESCRIPTIONS = {
    gunpowder:    { desc: "投掷炸弹，爆炸范围120px，造成30伤害", cost: "消耗: 1个", cd: "冷却: 5秒" },
    ender_pearl:  { desc: "向前方传送200px，穿越障碍物+60秒隐身", cost: "消耗: 1个", cd: "冷却: 8秒" },
    string:       { desc: "放置蛛网陷阱，减速敌人80%持续5秒", cost: "消耗: 2个", cd: "冷却: 6秒" },
    dragon_egg:   { desc: "释放全屏龙息，对所有敌人造成50伤害", cost: "消耗: 1个", cd: "冷却: 12秒" },
    totem:        { desc: "被动：HP归零时自动触发，回复3❤️并获得3秒无敌", cost: "自动消耗: 1个", cd: "被动触发" },
    flower:       { desc: "花香护体30秒，敌人攻击频率降低30%", cost: "消耗: 1个", cd: "冷却: 10秒" },
    mushroom:     { desc: "2个蘑菇合成1个蘑菇煲（回复2❤️）", cost: "消耗: 2个", cd: "无冷却" },
    stick:        { desc: "5根木棍+3根蜘蛛丝合成弓🏹", cost: "消耗: 5个+蜘蛛丝3个", cd: "无冷却" },
    snow_block:   { desc: "在脚下放置临时平台，5秒后消失", cost: "消耗: 1个", cd: "无冷却" },
    echo_shard:   { desc: "3个回响碎片合成复活图腾🗿", cost: "消耗: 3个", cd: "无冷却" },
    shell:        { desc: "激活2秒无敌护盾，抵挡所有伤害", cost: "消耗: 3个", cd: "冷却: 20秒" },
    starfish:     { desc: "30秒内宝箱稀有度提升一级", cost: "消耗: 1个", cd: "冷却: 90秒" },
    coal:         { desc: "放置火把，照亮周围区域8秒", cost: "消耗: 1个", cd: "冷却: 3秒" },
    rotten_flesh: { desc: "投掷腐肉吸引附近敌人聚集", cost: "消耗: 1个", cd: "冷却: 4秒" },
    gold:         { desc: "猪灵交易，随机获得铁/箭/末影珍珠", cost: "消耗: 1个", cd: "无冷却" },
    diamond:      { desc: "立即回复1❤️生命值", cost: "消耗: 1个", cd: "无冷却" },
    pumpkin:      { desc: "召唤雪傀儡辅助战斗（需背包有雪块×2）", cost: "消耗: 1个", cd: "无冷却" },
    iron:         { desc: "召唤铁傀儡强力护卫", cost: "消耗: 3个", cd: "无冷却" },
    sculk_vein:   { desc: "幽匿碎片×5合成静音靴，移动不触发敌人", cost: "消耗: 5个", cd: "无冷却" },
    beef:         { desc: "立即回复1❤️生命值", cost: "消耗: 1个", cd: "食物冷却: 3秒" },
    mutton:       { desc: "立即回复1❤️生命值", cost: "消耗: 1个", cd: "食物冷却: 3秒" },
    mushroom_stew:{ desc: "立即回复2❤️生命值", cost: "消耗: 1个", cd: "食物冷却: 3秒" },
    arrow:        { desc: "弓的弹药，射箭时自动消耗", cost: "弹药", cd: "无冷却" }
};

const HOTBAR_ITEMS = ["diamond", "pumpkin", "iron", "stick", "stone_sword", "iron_pickaxe", "bow", "arrow"];
const ITEM_LABELS = {
    diamond: "钻石",
    pumpkin: "南瓜",
    iron: "铁块",
    stick: "木棍",
    stone_sword: "石剑",
    iron_pickaxe: "铁镐",
    bow: "弓",
    arrow: "箭矢",
    gunpowder: "火药",
    rotten_flesh: "腐肉",
    string: "蜘蛛丝",
    ender_pearl: "末影珍珠",
    dragon_egg: "龙蛋",
    flower: "花朵",
    mushroom: "蘑菇",
    coal: "煤矿",
    gold: "黄金",
    shell: "贝壳",
    starfish: "海星",
    snow_block: "雪块",
    sculk_vein: "幽匿碎片",
    echo_shard: "回响碎片",
    beef: "牛肉",
    mutton: "羊肉",
    mushroom_stew: "蘑菇煲",
    totem: "复活图腾"
};
const ITEM_ICONS = {
    diamond: "💎",
    pumpkin: "🎃",
    iron: "🧱",
    stick: "🥢",
    stone_sword: "⚔️",
    iron_pickaxe: "⛏️",
    bow: "🏹",
    arrow: "🏹",
    gunpowder: "💥",
    rotten_flesh: "🥩",
    string: "🕸️",
    ender_pearl: "🟣",
    dragon_egg: "🐉",
    flower: "🌸",
    mushroom: "🍄",
    coal: "🪨",
    gold: "🪙",
    shell: "🐚",
    starfish: "⭐",
    snow_block: "🧊",
    sculk_vein: "🧩",
    echo_shard: "🔷",
    beef: "🥩",
    mutton: "🍖",
    mushroom_stew: "🍲",
    totem: "🗿",
    hp: "❤️",
    max_hp: "💖",
    score: "🪙",
    // 装备图标
    armor_leather: "🟤",
    armor_chainmail: "⛓️",
    armor_iron: "🛡️",
    armor_gold: "🟡",
    armor_diamond: "💠",
    armor_netherite: "⬛"
};
const INVENTORY_CATEGORIES = {
    items: ["diamond", "pumpkin", "stone_sword", "iron_pickaxe", "bow", "arrow"],
    materials: ["iron", "stick", "coal", "gold", "shell", "starfish", "gunpowder", "rotten_flesh", "string", "ender_pearl", "dragon_egg", "totem", "flower", "mushroom", "sculk_vein", "echo_shard", "beef", "mutton", "mushroom_stew"],
    equipment: []
};
const SPEED_LEVELS = {
    slow: 0.8,
    normal: 1.0,
    fast: 1.3
};
const ACHIEVEMENTS = {
    first_word: { id: "first_word", name: "初识词语", desc: "学习第一个词", icon: "🎉", target: 1 },
    words_10: { id: "words_10", name: "十词入门", desc: "学习 10 个词", icon: "📘", target: 10 },
    words_50: { id: "words_50", name: "词语进阶", desc: "学习 50 个词", icon: "📗", target: 50 },
    words_100: { id: "words_100", name: "词海探险", desc: "学习 100 个词", icon: "📙", target: 100 },
    words_500: { id: "words_500", name: "词语大师", desc: "学习 500 个词", icon: "🏅", target: 500 },
    pack_complete: { id: "pack_complete", name: "词库通关", desc: "完成一个词库", icon: "🗂️", target: 1 },
    first_game: { id: "first_game", name: "首次出航", desc: "完成第一场游戏", icon: "🚀", target: 1 },
    score_1000: { id: "score_1000", name: "千分进击", desc: "累积 1000 分", icon: "⭐", target: 1000 },
    score_5000: { id: "score_5000", name: "突破 5000", desc: "累积 5000 分", icon: "🏆", target: 5000 },
    enemies_100: { id: "enemies_100", name: "斩妖 100", desc: "击败 100 个敌人", icon: "⚔️", target: 100 },
    chests_50: { id: "chests_50", name: "开宝 50", desc: "打开 50 个宝箱", icon: "📦", target: 50 },
    diamond_collector: { id: "diamond_collector", name: "钻石收藏家", desc: "收集 100 颗钻石", icon: "💎", target: 100 },
    armor_collector: { id: "armor_collector", name: "盔甲收藏家", desc: "收集全部 盔甲", icon: "🛡️", target: 6 }
};
const ACHIEVEMENT_MAP = {
    words: ["first_word", "words_10", "words_50", "words_100", "words_500"],
    enemies: ["enemies_100"],
    chests: ["chests_50"],
    score: ["score_1000", "score_5000"]
};

// ========== 文案集中管理 ==========
const BIOME_MESSAGES = {
    enter: (biomeName) => `🌍 进入${biomeName}群系`,
    heatDamage: '🔥 高温灼伤',
    heatDeath: '💀 生命耗尽',
    lavaFall: '💀 掉进了岩浆!',
    lavaDeath: '💀 生命耗尽',
    mushroomHeal: '+1 ❤️ 🍄',
    portalTeleport: '🌀 传送!',
    speedBoost: '⚡ 加速!',
    hpDrain: '🔥 -1❤️',
    enterVillage: (biomeName) => `🏘️ 进入${biomeName}村庄`,
    leaveVillage: '👋 离开村庄'
};

const UI_TEXTS = {
    dragonAppear: '⚠️ 末影龙降临！',
    platformBreak: '⚠️ 平台将破裂',
    luckyStarEnd: '⭐ 幸运星效果结束',
    fullHp: '❤️ 已满血',
    diamondInsufficient: '💎 不足',
    diamondHeal: '💎 换取 +1❤️',
    armorBroken: (name) => `${name || "盔甲"} 已破损`,
    itemInsufficient: '❌ 物品不足',
    cooldown: (sec) => `⏳ 冷却中 (${sec}秒)`,
    cooldownShort: '⏳ 冷却中',
    reviveUsed: '复活机会已用完',
    reviveSuccess: '✨ 词语匹配复活成功！',
    selectAccount: '请先选择或创建档案',
    scoreSaved: '📝 成绩已保存到排行榜',
    restAlready: '💤 已经休息过了',
    restFullHp: '❤️ 已满血，无需休息',
    restSuccess: (amount) => `💤 休息成功！生命+${amount}`,
    restHeal: '❤️ +休息',
    restPrompt: '💤 休息回血',
    restButton: '休息 (Y)',
    villageSaved: '💾 游戏进度已保存',
    villageAlreadySaved: '💾 本村庄已存档',
    questDone: '📚 已完成学习任务',
    specialUsed: '🏗 该特色建筑已使用',
    specialNoFunc: '🏗 特色建筑暂无功能'
};

let currentAccount = null;
let autoSaveInterval = null;
let lastSaveTime = Date.now();
const TOOL_STATS = {
    stone_sword: { damage: 8 },
    iron_pickaxe: { damage: 6 }
};
const WEAPONS = {
    sword: {
        id: "sword",
        name: "石剑",
        damage: 14,
        range: 55,
        cooldown: 18,
        knockback: 8,
        type: "melee",
        emoji: "⚔️"
    },
    axe: {
        id: "axe",
        name: "木斧",
        damage: 20,
        range: 70,
        cooldown: 30,
        knockback: 12,
        type: "melee",
        emoji: "🪓"
    },
    pickaxe: {
        id: "pickaxe",
        name: "铁镐",
        damage: 8,
        range: 40,
        cooldown: 180,
        knockback: 0,
        type: "dig",
        emoji: "⛏️",
        digHits: 1
    },
    bow: {
        id: "bow",
        name: "弓",
        damage: 12,
        range: 380,
        cooldown: 26,
        knockback: 5,
        type: "ranged",
        emoji: "🏹",
        chargeMax: 40
    }
};
const ARMOR_TYPES = {
    leather: {
        id: "leather",
        name: "皮革护甲",
        defense: 1,
        rarity: "common",
        color: "#8B4513",
        description: "轻便护卫"
    },
    chainmail: {
        id: "chainmail",
        name: "链甲护甲",
        defense: 2,
        rarity: "rare",
        color: "#A9A9A9",
        description: "坚固的环形金属"
    },
    iron: {
        id: "iron",
        name: "铁护甲",
        defense: 3,
        rarity: "rare",
        color: "#C0C0C0",
        description: "标准防护"
    },
    gold: {
        id: "gold",
        name: "金护甲",
        defense: 2,
        rarity: "epic",
        color: "#FFD700",
        description: "华丽防御"
    },
    diamond: {
        id: "diamond",
        name: "钻石护甲",
        defense: 4,
        rarity: "epic",
        color: "#00CED1",
        description: "强力守卫"
    },
    netherite: {
        id: "netherite",
        name: "下界合金护甲",
        defense: 5,
        rarity: "legendary",
        color: "#4A4A4A",
        description: "传说加护"
    }
};
const FOOD_TYPES = {
    beef: { heal: 1, icon: "🥩", name: "牛肉", color: "#8B4513" },
    mutton: { heal: 1, icon: "🍖", name: "羊肉", color: "#DEB887" },
    mushroom_stew: { heal: 2, icon: "🍲", name: "蘑菇煲", color: "#CD853F" },
    raw_fish: { heal: 1, icon: "🐟", name: "生鱼", color: "#87CEEB" }
};
let playerEquipment = { armor: null, armorDurability: 0, armorEquippedAt: 0, armorLastDurabilityTick: 0 };
let silentBootsState = { equipped: false, durability: 0, maxDurability: 30 };
let armorInventory = [];

const playerWeapons = {
    current: "sword",
    unlocked: ["sword", "bow", "pickaxe", "axe"],
    attackCooldown: 0,
    isCharging: false,
    chargeTime: 0,
    lastPressTs: 0,
    doublePressWindow: 220
};
const keys = { right: false, left: false };

// 水下物理常量
const WATER_PHYSICS = {
    horizontalSpeedMultiplier: 0.45,
    verticalSwimSpeed: 1.2,
    swimJumpImpulse: 1.8,
    sinkSpeed: 0.5,
    gravity: 0.15,
    bubbleInterval: 15,
};

let jumpBuffer = 0;
let coyoteTimer = 0;

let groundY = 530;
let blockSize = 50;
let canvasHeight = 600;
let cameraOffsetX = 300;
let mapBuffer = 1000;
let removeThreshold = 200;
let fallResetY = 800;

let player = null;
let platforms = [];
let trees = [];
let chests = [];
let items = [];
let enemies = [];
let golems = [];
let treasureBlocks = []; // 藏宝方块位置 {x, y, groundType}
const MAX_GOLEMS = 3;
let playerPositionHistory = [];
let projectiles = [];
let digHits = new Map();
let playerInvincibleTimer = 0;
let overlayMode = "start";
const START_OVERLAY_INTRO_MS = 1600;
const START_OVERLAY_HINT_HTML = "操作提示: 移动跳转 攻击 切换武器";
let startOverlayTimer = 0;
let startOverlayReady = false;
let startOverlayActive = false;
let enemyKillStats = { total: 0 };
let repeatPauseState = "repeat";

// ===== 村庄系统 =====
let villageConfig = {};
let activeVillages = [];
let villageSpawnedForScore = {};
let villageSpawnState = {
    lastSpawnScore: -Infinity,
    lastSpawnX: -Infinity,
    lastSpawnBiome: null,
    lastSpawnTransitionTick: 0
};
let playerInVillage = false;
let currentVillage = null;

const projectilePool = {
    arrows: [],
    snowballs: [],
    fireballs: [],
    getArrow(x, y, tx, ty) {
        let arrow = this.arrows.find(p => p.remove);
        if (arrow) {
            arrow.reset(x, y, tx, ty, 4);
        } else {
            arrow = new Arrow(x, y, tx, ty);
            this.arrows.push(arrow);
        }
        return arrow;
    },
    getSnowball(x, y, tx, ty) {
        let snowball = this.snowballs.find(p => p.remove);
        if (snowball) {
            snowball.reset(x, y, tx, ty, 3);
        } else {
            snowball = new Snowball(x, y, tx, ty);
            this.snowballs.push(snowball);
        }
        return snowball;
    },
    getFireball(x, y, tx, ty) {
        let fireball = this.fireballs.find(p => p.remove);
        if (fireball) {
            fireball.reset(x, y, tx, ty, 2);
        } else {
            fireball = new DragonFireball(x, y, tx, ty);
            this.fireballs.push(fireball);
        }
        return fireball;
    }
};

const DEFAULT_BIOME_CONFIGS = {
    forest: {
        id: "forest",
        name: "森林",
        color: "#4CAF50",
        groundType: "grass",
        decorations: { tree: 0.3, bush: 0.2, flower: 0.25, mushroom: 0.1, vine: 0.15 },
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
        decorations: { ore_coal: 0.15, ore_iron: 0.1, ore_gold: 0.05, ore_diamond: 0.02, stalactite: 0.12, crystal: 0.08, lava_pool: 0.05 },
        effects: { particles: "sparkle", ambient: "#666688", darkness: 0.3, weather: ["fog"] },
        spawnWeight: { min: 1500, max: 3000 }
    },
    ocean: {
        id: "ocean",
        name: "海滨",
        color: "#2196F3",
        groundType: "sand",
        decorations: { shell: 0.2, starfish: 0.15, seaweed: 0.35, boat: 0.05 },
        treeTypes: {},
        effects: { particles: "bubbles", ambient: "#AAD4F5", waterLevel: 150 },
        spawnWeight: { min: 2000, max: 4000 }
    },
    nether: {
        id: "nether",
        name: "地狱",
        color: "#8B0000",
        groundType: "netherrack",
        decorations: { lava_pool: 0.15, fire: 0.2, soul_sand: 0.1, nether_wart: 0.12, basalt: 0.18, lava_fall: 0.08 },
        effects: { particles: "flames", ambient: "#CC3333", damage: 1, onEnterOnly: true, speedMultiplier: 0.7 },
        spawnWeight: { min: 3500, max: 5000 }
    },
    end: {
        id: "end",
        name: "末地",
        color: "#1A0A2E",
        groundType: "end_stone",
        decorations: { end_stone_pillar: 0.15, obsidian_platform: 0.08, chorus_plant: 0.12, purple_crystal: 0.1 },
        treeTypes: {},
        effects: { particles: "end_particles", ambient: "#2D1B4E", gravityMultiplier: 0.65, jumpMultiplier: 1.5 },
        spawnWeight: { min: 4000, max: 6000 }
    }
};

let biomeConfigs = JSON.parse(JSON.stringify(DEFAULT_BIOME_CONFIGS));
let currentBiome = "forest";
let biomeTransitionX = 0;
let decorations = [];
let particles = [];
let weatherState = { type: "clear", timer: 0 };
let netherEntryPenaltyArmed = true;
const MAX_DECORATIONS_ONSCREEN = 60;
const DEFAULT_BIOME_SWITCH = {
    stepScore: 200,
    order: ["forest", "snow", "desert", "mountain", "ocean", "nether", "end"],
    unlockScore: {
        forest: 0,
        snow: 200,
        desert: 400,
        mountain: 600,
        ocean: 800,
        nether: 2000,
        end: 4000
    },
    gateBoss: {
        enabled: true,
        defaultType: "wither",
        perBiomeOnce: true,
        gateExempt: []
    }
};
let biomeSwitchConfig = JSON.parse(JSON.stringify(DEFAULT_BIOME_SWITCH));
const DEFAULT_DIFFICULTY_CONFIG = {
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
};
const DEFAULT_CHEST_RARITIES = [
    { id: "common", weight: 60 },
    { id: "rare", weight: 30 },
    { id: "epic", weight: 8 },
    { id: "legendary", weight: 2 }
];
const DEFAULT_CHEST_TABLES = {
    common: [
        { item: "iron",         weight: 15, min: 1, max: 3 },
        { item: "coal",         weight: 10, min: 1, max: 3 },
        { item: "arrow",        weight: 10, min: 2, max: 6 },
        { item: "beef",         weight: 10, min: 1, max: 2 },
        { item: "mutton",       weight: 10, min: 1, max: 2 },
        { item: "stick",        weight: 10, min: 3, max: 5 },
        { item: "flower",       weight: 8,  min: 1, max: 2 },
        { item: "mushroom",     weight: 8,  min: 2, max: 3 },
        { item: "rotten_flesh", weight: 6,  min: 1, max: 2 },
        { item: "pumpkin",      weight: 6,  min: 1, max: 1 },
        { item: "snow_block",   weight: 5,  min: 1, max: 2 },
        { item: "diamond",      weight: 3,  min: 1, max: 1 },
        { item: "hp",           weight: 6,  min: 1, max: 1 },
        { item: "word_card",    weight: 8,  min: 3, max: 6 },
        { item: "score",        weight: 5,  min: 10, max: 25 },
        { item: "empty",        weight: 8,  min: 0, max: 0 }
    ],
    rare: [
        { item: "diamond",      weight: 5,  min: 1, max: 1 },
        { item: "stone_sword",  weight: 8,  min: 1, max: 1 },
        { item: "iron_pickaxe", weight: 6,  min: 1, max: 1 },
        { item: "ender_pearl",  weight: 5,  min: 1, max: 1 },
        { item: "gunpowder",    weight: 6,  min: 1, max: 2 },
        { item: "string",       weight: 6,  min: 2, max: 3 },
        { item: "shell",        weight: 5,  min: 3, max: 3 },
        { item: "snow_block",   weight: 5,  min: 1, max: 2 },
        { item: "mushroom_stew",weight: 6,  min: 1, max: 2 },
        { item: "iron",         weight: 6,  min: 2, max: 4 },
        { item: "hp",           weight: 8,  min: 1, max: 1 },
        { item: "score",        weight: 8,  min: 20, max: 40 },
        { item: "word_card",    weight: 12, min: 8, max: 15 }
    ],
    epic: [
        { item: "max_hp",       weight: 8,  min: 1, max: 1 },
        { item: "diamond",      weight: 6,  min: 1, max: 2 },
        { item: "ender_pearl",  weight: 6,  min: 1, max: 2 },
        { item: "iron_pickaxe", weight: 5,  min: 1, max: 1 },
        { item: "sculk_vein",   weight: 6,  min: 3, max: 5 },
        { item: "echo_shard",   weight: 6,  min: 2, max: 3 },
        { item: "starfish",     weight: 5,  min: 1, max: 1 },
        { item: "gold",         weight: 5,  min: 1, max: 2 },
        { item: "score",        weight: 8,  min: 40, max: 80 },
        { item: "word_card",    weight: 8,  min: 12, max: 20 }
    ],
    legendary: [
        { item: "max_hp",       weight: 10, min: 1, max: 2 },
        { item: "dragon_egg",   weight: 6,  min: 1, max: 1 },
        { item: "totem",        weight: 6,  min: 1, max: 1 },
        { item: "ender_pearl",  weight: 6,  min: 2, max: 3 },
        { item: "echo_shard",   weight: 5,  min: 3, max: 3 },
        { item: "diamond",      weight: 5,  min: 2, max: 3 },
        { item: "score",        weight: 8,  min: 80, max: 150 }
    ]
};
const DEFAULT_CHEST_ROLLS = {
    twoDropChance: 0.30,
    threeDropChance: 0.10
};

const LEARNING_CONFIG = {
    challenge: {
        timeLimit: 15000,
        baseOptions: 3,
        rewards: {
            correct: { score: 20, diamond: 1 },
            wrong: { scorePenalty: 8 }
        }
    },
    wordGate: {
        spawnChance: 0.18,
        minScore: 150
    },
    wordMatch: {
        wordCount: 5,
        timeLimit: 30000,
        minCorrectToRevive: 4,
        reviveHp: 3,
        bonusPerMatch: 10
    }
};
let foodCooldown = 0;
let floatingTexts = [];
let lastGenX = 0;
let difficultyState = null;
let difficultyConfigCache = null;
let lootConfigCache = null;
let lastDamageFrame = 0;
