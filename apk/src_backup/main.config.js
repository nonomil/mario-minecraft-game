/**
 * main.config.js - 配置、常量、默认值模块
 *
 * 本模块包含游戏的所有配置常量、默认设置、物品模板等。
 * 这些变量被其他模块共享和引用。
 */

// ============================================
// 基础配置和存储
// ============================================
const defaults = window.MMWG_DEFAULTS || {};
const storage = window.MMWG_STORAGE;
const defaultGameConfig = defaults.gameConfig || {};
const defaultControls = defaults.controls || {};
const defaultLevels = defaults.levels || [];
const defaultWords = defaults.words || [];
const defaultSettings = defaults.settings || {};

// ============================================
// Canvas 和 Context
// ============================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ============================================
// 游戏配置变量
// ============================================
let gameConfig = JSON.parse(JSON.stringify(defaultGameConfig));
let keyBindings = { ...defaultControls };
let levels = [...defaultLevels];
let wordDatabase = [...defaultWords];

// ============================================
// 设置和状态变量
// ============================================
function hasStoredSettings() {
    if (!storage) return false;
    try {
        return window.localStorage.getItem("mmwg:settings") !== null;
    } catch {
        return false;
    }
}

let settings = storage ? storage.loadJson("mmwg:settings", defaultSettings) : JSON.parse(JSON.stringify(defaultSettings));
if (!hasStoredSettings()) {
    settings.deviceMode = "phone";
    settings.orientationLock = "landscape";
    settings.touchControls = true;
}

let vocabState = storage ? storage.loadJson("mmwg:vocabState", { runCounts: {}, lastPackId: null }) : { runCounts: {}, lastPackId: null };
let progress = storage ? storage.loadJson("mmwg:progress", { vocab: {} }) : { vocab: {} };

// ============================================
// 游戏状态变量
// ============================================
let lastWord = null;
let wordPicker = null;
let paused = false;
let pausedByModal = false;
let startedOnce = false;
let vocabManifest = window.MMWG_VOCAB_MANIFEST || null;
let vocabPackOrder = [];
let vocabPacks = Object.create(null);
let vocabEngine = null;
let activeVocabPackId = null;
let loadedVocabFiles = Object.create(null);
let sessionWordCounts = Object.create(null);

// ============================================
// 音频状态
// ============================================
let audioCtx = null;
let audioUnlocked = false;
let speechReady = false;
let bgmAudio = null;
let bgmReady = false;
const BGM_SOURCES = ["audio/minecraft-theme.mp3"];

// ============================================
// 阶段标签
// ============================================
const STAGE_LABELS = {
    kindergarten: "幼儿园",
    elementary: "小学全阶段",
    elementary_lower: "小学低年级",
    elementary_upper: "小学高年级",
    minecraft: "Minecraft",
    general: "通用主题",
    mixed: "混合/跨级",
    game: "游戏专题"
};

// ============================================
// 游戏核心变量
// ============================================
let score = 0;
let levelScore = 0;
let runBestScore = 0;
let cameraX = 0;
let gameFrame = 0;
let currentLevelIdx = 0;
let playerHp = 3;
let playerMaxHp = 3;
let lastWordItemX = -Infinity;

// ============================================
// 物品栏模板和配置
// ============================================
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
    slime_ball: 0,
    magma_cream: 0,
    phantom_membrane: 0,
    ghast_tear: 0,
    blaze_rod: 0,
    spider_eye: 0
};

let inventory = { ...INVENTORY_TEMPLATE };
let selectedSlot = 0;

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
    slime_ball: "史莱姆球",
    magma_cream: "岩浆膏",
    phantom_membrane: "幻翼膜",
    ghast_tear: "恶魂之泪",
    blaze_rod: "烈焰棒",
    spider_eye: "蜘蛛眼"
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
    gunpowder: "🧨",
    rotten_flesh: "🍖",
    string: "🕸️",
    ender_pearl: "🟣",
    dragon_egg: "🥚",
    flower: "🌸",
    mushroom: "🍄",
    coal: "🪨",
    gold: "🪙",
    shell: "🐚",
    starfish: "⭐",
    slime_ball: "🟢",
    magma_cream: "🟠",
    phantom_membrane: "🪽",
    ghast_tear: "💧",
    blaze_rod: "🔥",
    spider_eye: "🕷️",
    hp: "❤️",
    max_hp: "💖",
    score: "💎"
};

// ============================================
// 云平台配置
// ============================================
const CLOUD_PLATFORM_CONFIG = {
    normal: { duration: Infinity, respawnTime: 0, bounceForce: 0, moveSpeed: 0, moveRange: 0 },
    thin: { duration: 80, respawnTime: 260, bounceForce: 0, moveSpeed: 0, moveRange: 0 },
    bouncy: { duration: Infinity, respawnTime: 0, bounceForce: -12, moveSpeed: 0, moveRange: 0 },
    moving: { duration: Infinity, respawnTime: 0, bounceForce: 0, moveSpeed: 0.6, moveRange: 80 }
};

// ============================================
// 实体标签
// ============================================
const ENTITY_LABELS = {
    zombie: { en: "Zombie", zh: "僵尸", emoji: "🧟" },
    skeleton: { en: "Skeleton", zh: "骷髅", emoji: "💀" },
    creeper: { en: "Creeper", zh: "苦力怕", emoji: "💥" },
    spider: { en: "Spider", zh: "蜘蛛", emoji: "🕷️" },
    cave_spider: { en: "Cave Spider", zh: "洞穴蜘蛛", emoji: "🕷️" },
    enderman: { en: "Enderman", zh: "末影人", emoji: "🕴️" },
    slime: { en: "Slime", zh: "史莱姆", emoji: "🟢" },
    magma_cube: { en: "Magma Cube", zh: "岩浆怪", emoji: "🟠" },
    phantom: { en: "Phantom", zh: "幻翼", emoji: "🪽" },
    ghast: { en: "Ghast", zh: "恶魂", emoji: "👻" },
    blaze: { en: "Blaze", zh: "烈焰人", emoji: "🔥" },
    chest: { en: "Chest", zh: "宝箱", emoji: "🧰" },
    tree: { en: "Tree", zh: "树", emoji: "🌳" },
    flower: { en: "Flower", zh: "花", emoji: "🌸" },
    mushroom: { en: "Mushroom", zh: "蘑菇", emoji: "🍄" },
    cactus: { en: "Cactus", zh: "仙人掌", emoji: "🌵" },
    ore_coal: { en: "Coal", zh: "煤矿", emoji: "🪨" },
    ore_iron: { en: "Iron", zh: "铁矿", emoji: "🧱" },
    ore_gold: { en: "Gold", zh: "金矿", emoji: "🪙" },
    ore_diamond: { en: "Diamond", zh: "钻石矿", emoji: "💎" },
    cloud: { en: "Cloud", zh: "云", emoji: "☁️" },
    lava_pool: { en: "Lava", zh: "岩浆", emoji: "🌋" },
    water: { en: "Water", zh: "水", emoji: "💧" }
};

let wordLearnCount = {};

// ============================================
// 工具属性
// ============================================
const TOOL_STATS = {
    stone_sword: { damage: 8 },
    iron_pickaxe: { damage: 6 }
};

// ============================================
// 键盘控制状态
// ============================================
const keys = { right: false, left: false, down: false, up: false };

// ============================================
// 跳跃缓冲和土狼时间
// ============================================
let jumpBuffer = 0;
let coyoteTimer = 0;

// ============================================
// 世界配置
// ============================================
let groundY = 530;
let blockSize = 50;
let canvasHeight = 600;
let cameraOffsetX = 300;
let mapBuffer = 1000;
let removeThreshold = 200;
let fallResetY = 800;

// ============================================
// 游戏实体数组
// ============================================
let player = null;
let platforms = [];
let movingPlatforms = [];
let trees = [];
let chests = [];
let items = [];
let enemies = [];
let golems = [];
const MAX_GOLEMS = 3;
let playerPositionHistory = [];
let projectiles = [];
let digHits = new Map();
let bossSpawned = false;
let playerInvincibleTimer = 0;
let overlayMode = "start";
let enemyKillStats = { total: 0 };
let repeatPauseState = "repeat";

// ============================================
// 装饰物和粒子
// ============================================
let decorations = [];
let particles = [];
let weatherState = { type: "clear", timer: 0 };
let netherEntryPenaltyArmed = true;
const MAX_DECORATIONS_ONSCREEN = 60;

// ============================================
// 难度配置
// ============================================
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

// ============================================
// 宝箱稀有度配置
// ============================================
const DEFAULT_CHEST_RARITIES = [
    { id: "common", weight: 60 },
    { id: "rare", weight: 30 },
    { id: "epic", weight: 8 },
    { id: "legendary", weight: 2 }
];

const DEFAULT_CHEST_TABLES = {
    common: [
        { item: "iron", weight: 18, min: 1, max: 3 },
        { item: "pumpkin", weight: 12, min: 1, max: 2 },
        { item: "stick", weight: 12, min: 1, max: 3 },
        { item: "diamond", weight: 4, min: 1, max: 1 },
        { item: "coal", weight: 10, min: 1, max: 3 },
        { item: "arrow", weight: 10, min: 2, max: 6 },
        { item: "rotten_flesh", weight: 8, min: 1, max: 3 },
        { item: "flower", weight: 6, min: 1, max: 2 },
        { item: "mushroom", weight: 6, min: 1, max: 2 },
        { item: "hp", weight: 8, min: 1, max: 1 },
        { item: "score", weight: 7, min: 10, max: 25 }
    ],
    rare: [
        { item: "diamond", weight: 6, min: 1, max: 1 },
        { item: "stone_sword", weight: 7, min: 1, max: 1 },
        { item: "iron_pickaxe", weight: 5, min: 1, max: 1 },
        { item: "ender_pearl", weight: 4, min: 1, max: 1 },
        { item: "iron", weight: 8, min: 2, max: 4 },
        { item: "arrow", weight: 8, min: 4, max: 8 },
        { item: "hp", weight: 8, min: 1, max: 1 },
        { item: "score", weight: 8, min: 20, max: 40 }
    ],
    epic: [
        { item: "max_hp", weight: 6, min: 1, max: 1 },
        { item: "diamond", weight: 6, min: 1, max: 2 },
        { item: "ender_pearl", weight: 5, min: 1, max: 2 },
        { item: "iron_pickaxe", weight: 6, min: 1, max: 1 },
        { item: "score", weight: 8, min: 40, max: 80 }
    ],
    legendary: [
        { item: "max_hp", weight: 8, min: 1, max: 2 },
        { item: "diamond", weight: 8, min: 2, max: 3 },
        { item: "dragon_egg", weight: 4, min: 1, max: 1 },
        { item: "ender_pearl", weight: 6, min: 2, max: 3 },
        { item: "score", weight: 10, min: 80, max: 150 }
    ]
};

const DEFAULT_CHEST_ROLLS = {
    twoDropChance: 0.45,
    threeDropChance: 0.15
};

// ============================================
// 浮动文字和其他状态
// ============================================
let floatingTexts = [];
let lastGenX = 0;
let difficultyState = null;
let difficultyConfigCache = null;
let lootConfigCache = null;
let lastDamageFrame = 0;

// ============================================
// Canvas 基础尺寸
// ============================================
let baseCanvasSize = null;

// ============================================
// 合成配方
// ============================================
const RECIPES = {
    iron_golem: { iron: 10 },
    snow_golem: { pumpkin: 10 }
};

// ============================================
// 工具函数
// ============================================
function mergeDeep(target, source) {
    const output = Array.isArray(target) ? [...target] : { ...target };
    if (source && typeof source === "object" && !Array.isArray(source)) {
        Object.keys(source).forEach(key => {
            const srcValue = source[key];
            if (srcValue && typeof srcValue === "object" && !Array.isArray(srcValue)) {
                output[key] = mergeDeep(output[key] || {}, srcValue);
            } else {
                output[key] = srcValue;
            }
        });
    }
    return output;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function keyLabel(code) {
    if (!code) return "";
    if (code === "Space") return "空格";
    if (code.startsWith("Key") && code.length === 4) return code.slice(3);
    if (code.startsWith("Arrow")) return code.replace("Arrow", "方向");
    return code;
}

function parseKeyCodes(raw) {
    if (!raw) return null;
    const parts = String(raw).split(",").map(s => s.trim()).filter(Boolean);
    if (parts.length !== 5) return null;
    return parts;
}

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

// ============================================
// 碰撞检测函数
// ============================================
function colCheck(shapeA, shapeB) {
    return colCheckRect(shapeA.x, shapeA.y, shapeA.width, shapeA.height, shapeB.x, shapeB.y, shapeB.width, shapeB.height);
}

function colCheckRect(x1, y1, w1, h1, x2, y2, w2, h2) {
    const vX = (x1 + w1 / 2) - (x2 + w2 / 2);
    const vY = (y1 + h1 / 2) - (y2 + h2 / 2);
    const hWidths = w1 / 2 + w2 / 2;
    const hHeights = h1 / 2 + h2 / 2;
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        const oX = hWidths - Math.abs(vX);
        const oY = hHeights - Math.abs(vY);
        if (oX >= oY || oY < 15) {
            if (vY > 0) return "t";
            return "b";
        }
        if (vX > 0) return "l";
        return "r";
    }
    return null;
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
}

// ============================================
// 导出到全局 (为其他模块使用)
// ============================================
window.MMWG = window.MMWG || {};
Object.assign(window.MMWG, {
    // 基础配置
    defaults, storage, defaultGameConfig, defaultControls, defaultLevels, defaultWords, defaultSettings,
    canvas, ctx,
    // 游戏配置
    get gameConfig() { return gameConfig; },
    set gameConfig(v) { gameConfig = v; },
    get keyBindings() { return keyBindings; },
    set keyBindings(v) { keyBindings = v; },
    get levels() { return levels; },
    set levels(v) { levels = v; },
    get wordDatabase() { return wordDatabase; },
    set wordDatabase(v) { wordDatabase = v; },
    // 设置和状态
    get settings() { return settings; },
    set settings(v) { settings = v; },
    get vocabState() { return vocabState; },
    set vocabState(v) { vocabState = v; },
    get progress() { return progress; },
    set progress(v) { progress = v; },
    // 游戏状态
    get lastWord() { return lastWord; },
    set lastWord(v) { lastWord = v; },
    get wordPicker() { return wordPicker; },
    set wordPicker(v) { wordPicker = v; },
    get paused() { return paused; },
    set paused(v) { paused = v; },
    get pausedByModal() { return pausedByModal; },
    set pausedByModal(v) { pausedByModal = v; },
    get startedOnce() { return startedOnce; },
    set startedOnce(v) { startedOnce = v; },
    get vocabManifest() { return vocabManifest; },
    set vocabManifest(v) { vocabManifest = v; },
    get vocabPackOrder() { return vocabPackOrder; },
    set vocabPackOrder(v) { vocabPackOrder = v; },
    get vocabPacks() { return vocabPacks; },
    set vocabPacks(v) { vocabPacks = v; },
    get vocabEngine() { return vocabEngine; },
    set vocabEngine(v) { vocabEngine = v; },
    get activeVocabPackId() { return activeVocabPackId; },
    set activeVocabPackId(v) { activeVocabPackId = v; },
    get loadedVocabFiles() { return loadedVocabFiles; },
    set loadedVocabFiles(v) { loadedVocabFiles = v; },
    get sessionWordCounts() { return sessionWordCounts; },
    set sessionWordCounts(v) { sessionWordCounts = v; },
    // 音频
    get audioCtx() { return audioCtx; },
    set audioCtx(v) { audioCtx = v; },
    get audioUnlocked() { return audioUnlocked; },
    set audioUnlocked(v) { audioUnlocked = v; },
    get speechReady() { return speechReady; },
    set speechReady(v) { speechReady = v; },
    get bgmAudio() { return bgmAudio; },
    set bgmAudio(v) { bgmAudio = v; },
    get bgmReady() { return bgmReady; },
    set bgmReady(v) { bgmReady = v; },
    BGM_SOURCES, STAGE_LABELS,
    // 游戏核心变量
    get score() { return score; },
    set score(v) { score = v; },
    get levelScore() { return levelScore; },
    set levelScore(v) { levelScore = v; },
    get runBestScore() { return runBestScore; },
    set runBestScore(v) { runBestScore = v; },
    get cameraX() { return cameraX; },
    set cameraX(v) { cameraX = v; },
    get gameFrame() { return gameFrame; },
    set gameFrame(v) { gameFrame = v; },
    get currentLevelIdx() { return currentLevelIdx; },
    set currentLevelIdx(v) { currentLevelIdx = v; },
    get playerHp() { return playerHp; },
    set playerHp(v) { playerHp = v; },
    get playerMaxHp() { return playerMaxHp; },
    set playerMaxHp(v) { playerMaxHp = v; },
    get lastWordItemX() { return lastWordItemX; },
    set lastWordItemX(v) { lastWordItemX = v; },
    // 物品栏
    INVENTORY_TEMPLATE,
    get inventory() { return inventory; },
    set inventory(v) { inventory = v; },
    get selectedSlot() { return selectedSlot; },
    set selectedSlot(v) { selectedSlot = v; },
    HOTBAR_ITEMS, ITEM_LABELS, ITEM_ICONS,
    CLOUD_PLATFORM_CONFIG, ENTITY_LABELS,
    get wordLearnCount() { return wordLearnCount; },
    set wordLearnCount(v) { wordLearnCount = v; },
    TOOL_STATS,
    keys,
    get jumpBuffer() { return jumpBuffer; },
    set jumpBuffer(v) { jumpBuffer = v; },
    get coyoteTimer() { return coyoteTimer; },
    set coyoteTimer(v) { coyoteTimer = v; },
    // 世界配置
    get groundY() { return groundY; },
    set groundY(v) { groundY = v; },
    get blockSize() { return blockSize; },
    set blockSize(v) { blockSize = v; },
    get canvasHeight() { return canvasHeight; },
    set canvasHeight(v) { canvasHeight = v; },
    get cameraOffsetX() { return cameraOffsetX; },
    set cameraOffsetX(v) { cameraOffsetX = v; },
    get mapBuffer() { return mapBuffer; },
    set mapBuffer(v) { mapBuffer = v; },
    get removeThreshold() { return removeThreshold; },
    set removeThreshold(v) { removeThreshold = v; },
    get fallResetY() { return fallResetY; },
    set fallResetY(v) { fallResetY = v; },
    // 实体
    get player() { return player; },
    set player(v) { player = v; },
    get platforms() { return platforms; },
    set platforms(v) { platforms = v; },
    get movingPlatforms() { return movingPlatforms; },
    set movingPlatforms(v) { movingPlatforms = v; },
    get trees() { return trees; },
    set trees(v) { trees = v; },
    get chests() { return chests; },
    set chests(v) { chests = v; },
    get items() { return items; },
    set items(v) { items = v; },
    get enemies() { return enemies; },
    set enemies(v) { enemies = v; },
    get golems() { return golems; },
    set golems(v) { golems = v; },
    MAX_GOLEMS,
    get playerPositionHistory() { return playerPositionHistory; },
    set playerPositionHistory(v) { playerPositionHistory = v; },
    get projectiles() { return projectiles; },
    set projectiles(v) { projectiles = v; },
    get digHits() { return digHits; },
    set digHits(v) { digHits = v; },
    get bossSpawned() { return bossSpawned; },
    set bossSpawned(v) { bossSpawned = v; },
    get playerInvincibleTimer() { return playerInvincibleTimer; },
    set playerInvincibleTimer(v) { playerInvincibleTimer = v; },
    get overlayMode() { return overlayMode; },
    set overlayMode(v) { overlayMode = v; },
    get enemyKillStats() { return enemyKillStats; },
    set enemyKillStats(v) { enemyKillStats = v; },
    get repeatPauseState() { return repeatPauseState; },
    set repeatPauseState(v) { repeatPauseState = v; },
    // 装饰物和粒子
    get decorations() { return decorations; },
    set decorations(v) { decorations = v; },
    get particles() { return particles; },
    set particles(v) { particles = v; },
    get weatherState() { return weatherState; },
    set weatherState(v) { weatherState = v; },
    get netherEntryPenaltyArmed() { return netherEntryPenaltyArmed; },
    set netherEntryPenaltyArmed(v) { netherEntryPenaltyArmed = v; },
    MAX_DECORATIONS_ONSCREEN,
    // 难度配置
    DEFAULT_DIFFICULTY_CONFIG, DEFAULT_CHEST_RARITIES, DEFAULT_CHEST_TABLES, DEFAULT_CHEST_ROLLS,
    // 状态
    get floatingTexts() { return floatingTexts; },
    set floatingTexts(v) { floatingTexts = v; },
    get lastGenX() { return lastGenX; },
    set lastGenX(v) { lastGenX = v; },
    get difficultyState() { return difficultyState; },
    set difficultyState(v) { difficultyState = v; },
    get difficultyConfigCache() { return difficultyConfigCache; },
    set difficultyConfigCache(v) { difficultyConfigCache = v; },
    get lootConfigCache() { return lootConfigCache; },
    set lootConfigCache(v) { lootConfigCache = v; },
    get lastDamageFrame() { return lastDamageFrame; },
    set lastDamageFrame(v) { lastDamageFrame = v; },
    get baseCanvasSize() { return baseCanvasSize; },
    set baseCanvasSize(v) { baseCanvasSize = v; },
    RECIPES,
    // 工具函数
    mergeDeep, clamp, shuffle, keyLabel, parseKeyCodes, loadJsonWithFallback,
    colCheck, colCheckRect, rectIntersect, hasStoredSettings
});
