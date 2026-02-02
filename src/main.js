const defaults = window.MMWG_DEFAULTS || {};
const storage = window.MMWG_STORAGE;
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
    starfish: 0
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
    gold: "钻石",
    shell: "贝壳",
    starfish: "海星"
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
    gold: "💎",
    shell: "🐚",
    starfish: "⭐",
    hp: "❤️",
    max_hp: "💖",
    score: "💎"
};
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
        digHits: 3
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
const MAX_GOLEMS = 3;
let playerPositionHistory = [];
let projectiles = [];
let digHits = new Map();
let bossSpawned = false;
let playerInvincibleTimer = 0;
let overlayMode = "start";
let enemyKillStats = { total: 0 };
let repeatPauseState = "repeat";
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
let floatingTexts = [];
let lastGenX = 0;
let difficultyState = null;
let difficultyConfigCache = null;
let lootConfigCache = null;
let lastDamageFrame = 0;

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

function getArrowCount() {
    return Number(inventory.arrow) || 0;
}

function unlockWeapon(id) {
    if (!WEAPONS[id]) return false;
    if (playerWeapons.unlocked.includes(id)) return false;
    playerWeapons.unlocked.push(id);
    showToast(`🎉 解锁武器: ${WEAPONS[id].emoji} ${WEAPONS[id].name}`);
    updateWeaponUI();
    return true;
}

function syncWeaponsFromInventory() {
    if ((inventory.stone_sword || 0) > 0) unlockWeapon("sword");
    if ((inventory.iron_pickaxe || 0) > 0) unlockWeapon("axe");
    if ((inventory.iron_pickaxe || 0) > 0) unlockWeapon("pickaxe");
    if ((inventory.bow || 0) > 0) unlockWeapon("bow");
}

function switchWeapon() {
    const list = playerWeapons.unlocked;
    if (!list.length) return;
    if (list.length === 1) {
        showToast("⚠️ 只有一种武器");
        return;
    }
    const idx = list.indexOf(playerWeapons.current);
    const nextIdx = idx >= 0 ? (idx + 1) % list.length : 0;
    playerWeapons.current = list[nextIdx];
    playerWeapons.attackCooldown = 0;
    playerWeapons.isCharging = false;
    playerWeapons.chargeTime = 0;
    const weapon = WEAPONS[playerWeapons.current];
    showToast(`⚔️ ${weapon.emoji} ${weapon.name}`);
    updateWeaponUI();
}

function updateWeaponUI() {
    const el = document.getElementById("weapon-info");
    if (!el) return;
    const weapon = WEAPONS[playerWeapons.current] || WEAPONS.sword;
    const arrows = getArrowCount();
    const arrowText = weapon.type === "ranged" ? ` | 🏹 ${arrows}` : "";
    el.innerText = `武器: ${weapon.emoji} ${weapon.name}${arrowText}`;
}

function startBowCharge() {
    const weapon = WEAPONS.bow;
    if (playerWeapons.attackCooldown > 0) return;
    if (getArrowCount() <= 0) {
        showToast("❌ 没有箭！");
        return;
    }
    playerWeapons.isCharging = true;
    playerWeapons.chargeTime = 0;
}

function releaseBowShot(forceCharge = null) {
    const weapon = WEAPONS.bow;
    if (playerWeapons.attackCooldown > 0) return;
    if (getArrowCount() <= 0) {
        showToast("❌ 没有箭！");
        return;
    }
    const ratio = forceCharge != null ? forceCharge : Math.min(1, playerWeapons.chargeTime / weapon.chargeMax);
    const charge = clamp(ratio, 0.2, 1);
    const dir = player.facingRight ? 1 : -1;
    const startX = player.facingRight ? player.x + player.width : player.x;
    const startY = player.y + player.height * 0.4;
    const targetX = startX + dir * weapon.range;
    const targetY = startY - 20 * charge;
    const speed = 4 + charge * 4;
    const damage = Math.round(weapon.damage * (0.6 + charge * 0.9));
    const arrow = new Arrow(startX, startY, targetX, targetY, "player", speed, damage);
    projectiles.push(arrow);
    inventory.arrow = Math.max(0, (inventory.arrow || 0) - 1);
    updateInventoryUI();
    playerWeapons.attackCooldown = weapon.cooldown;
    playerWeapons.isCharging = false;
    playerWeapons.chargeTime = 0;
}

function digGroundBlock() {
    const weapon = WEAPONS.pickaxe;
    const dir = player.facingRight ? 1 : -1;
    const targetX = player.x + (dir > 0 ? player.width + 6 : -6);
    const blockX = Math.floor(targetX / blockSize) * blockSize;
    const key = `${blockX}`;
    const hit = (digHits.get(key) || 0) + 1;
    digHits.set(key, hit);
    showFloatingText(`⛏️ ${hit}/${weapon.digHits}`, blockX + blockSize / 2, groundY - 40);

    if (hit < weapon.digHits) {
        playerWeapons.attackCooldown = weapon.cooldown;
        return;
    }

    const idx = platforms.findIndex(p => p.y === groundY && blockX >= p.x && blockX < p.x + p.width);
    if (idx === -1) {
        playerWeapons.attackCooldown = weapon.cooldown;
        return;
    }
    const p = platforms[idx];
    const leftWidth = blockX - p.x;
    const rightStart = blockX + blockSize;
    const rightWidth = (p.x + p.width) - rightStart;
    platforms.splice(idx, 1);
    if (leftWidth > 0) platforms.push(new Platform(p.x, p.y, leftWidth, p.height, p.type));
    if (rightWidth > 0) platforms.push(new Platform(rightStart, p.y, rightWidth, p.height, p.type));
    digHits.delete(key);
    showFloatingText("🕳️ 深坑", blockX + blockSize / 2, groundY - 50);
    playerWeapons.attackCooldown = weapon.cooldown;
}

function performMeleeAttack(weapon) {
    if (player.isAttacking) return;
    player.isAttacking = true;
    player.attackTimer = Math.max(12, Math.floor(weapon.cooldown * 0.6));
    const range = weapon.range;
    const ax = player.facingRight ? player.x + player.width : player.x - range;
    const ay = player.y;
    const dmg = weapon.damage;

    trees.forEach(t => {
        if (rectIntersect(ax, ay, range, player.height, t.x, t.y, t.width, t.height)) {
            t.hit();
        }
    });

    enemies.forEach(e => {
        if (rectIntersect(ax, ay, range, player.height, e.x, e.y, e.width, e.height)) {
            if (e.takeDamage) e.takeDamage(dmg);
            else e.hp -= dmg;
            showFloatingText(`-${dmg}`, e.x, e.y);
        }
    });

    playerWeapons.attackCooldown = weapon.cooldown;
}

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

function updateCurrentBiome() {
    const nextBiome = getBiomeById(getBiomeIdForScore(getProgressScore()));
    if (nextBiome.id !== currentBiome) {
        currentBiome = nextBiome.id;
        biomeTransitionX = player.x;
        showToast(`🌍 进入${nextBiome.name}群系`);
        updateWeatherForBiome(nextBiome);
        const info = document.getElementById("level-info");
        if (info) info.innerText = `生态: ${nextBiome.name}`;
        if (currentBiome === "nether" && netherEntryPenaltyArmed) {
            playerHp = Math.max(0, playerHp - 1);
            updateHpUI();
            showFloatingText("🔥 -1❤️", player.x, player.y - 20);
            netherEntryPenaltyArmed = false;
            if (playerHp <= 0) {
                paused = true;
                showToast("💀 生命耗尽");
                setOverlay(true, "pause");
            }
        }
        if (currentBiome !== "nether") {
            netherEntryPenaltyArmed = true;
        }
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
    if (biome.effects?.damage) {
        if (gameFrame % 90 === 0) {
            damagePlayer(biome.effects.damage, player.x, 30);
        }
    }
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
        particles.push(new Snowflake(baseX, -10));
    } else if (biome.effects?.particles === "leaves" && Math.random() < 0.15) {
        particles.push(new LeafParticle(baseX, -10));
    } else if (biome.effects?.particles === "dust" && Math.random() < 0.2) {
        particles.push(new DustParticle(baseX, Math.random() * canvas.height));
    } else if (biome.effects?.particles === "flames" && Math.random() < 0.2) {
        particles.push(new EmberParticle(baseX, canvas.height - 50));
    } else if (biome.effects?.particles === "bubbles" && Math.random() < 0.2) {
        particles.push(new BubbleParticle(baseX, canvas.height - 20));
    } else if (biome.effects?.particles === "sparkle" && Math.random() < 0.15) {
        particles.push(new SparkleParticle(baseX, Math.random() * canvas.height));
    }

    if (weatherState.type === "rain" && Math.random() < 0.4) {
        particles.push(new RainParticle(baseX, -10));
    }
    if (weatherState.type === "snow" && Math.random() < 0.3) {
        particles.push(new Snowflake(baseX, -10));
    }
    if (weatherState.type === "sandstorm" && Math.random() < 0.35) {
        particles.push(new DustParticle(baseX, Math.random() * canvas.height));
    }
}

let baseCanvasSize = null;

function applyConfig() {
    if (!baseCanvasSize) {
        baseCanvasSize = { width: gameConfig.canvas.width, height: gameConfig.canvas.height };
    }
    canvas.width = gameConfig.canvas.width;
    canvas.height = gameConfig.canvas.height;
    const container = document.getElementById("game-container");
    if (container) {
        container.style.width = `${gameConfig.canvas.width}px`;
        container.style.height = `${gameConfig.canvas.height}px`;
    }
    canvasHeight = gameConfig.canvas.height;
    groundY = gameConfig.physics.groundY;
    blockSize = gameConfig.world.blockSize;
    cameraOffsetX = gameConfig.world.cameraOffsetX;
    mapBuffer = gameConfig.world.mapBuffer;
    removeThreshold = gameConfig.world.removeThreshold;
    fallResetY = gameConfig.world.fallResetY;
}

function applyResponsiveCanvas(mode, viewport, safe) {
    if (!baseCanvasSize || !gameConfig?.canvas) return null;
    const vw = Number(viewport?.width) || 0;
    const vh = Number(viewport?.height) || 0;
    const isLandscape = vw >= vh && vw > 0 && vh > 0;
    const padX = (safe?.left || 0) + (safe?.right || 0);
    const padY = (safe?.top || 0) + (safe?.bottom || 0);
    const availW = Math.max(1, vw - padX);
    const availH = Math.max(1, vh - padY);

    let targetW = baseCanvasSize.width;
    let targetH = baseCanvasSize.height;
    let forcedScale = null;

    // Phone landscape: match canvas aspect ratio to viewport, then scale by height so no clipping.
    if (mode === "phone" && isLandscape) {
        targetH = baseCanvasSize.height; // keep vertical gameplay metrics stable (groundY, jump, etc.)
        const scale = availH / targetH;
        targetW = Math.round(availW / scale);
        targetW = Math.round(clamp(targetW, baseCanvasSize.width, 1800));
        forcedScale = scale;
    }

    if (gameConfig.canvas.width !== targetW || gameConfig.canvas.height !== targetH) {
        gameConfig.canvas.width = targetW;
        gameConfig.canvas.height = targetH;
        applyConfig();
    }
    return forcedScale ? { scale: forcedScale, padX, padY } : null;
}

function parsePx(value) {
    const n = Number.parseFloat(String(value || "").replace("px", ""));
    return Number.isFinite(n) ? n : 0;
}

function getViewportSize() {
    const vv = window.visualViewport;
    if (vv && typeof vv.width === "number" && typeof vv.height === "number") {
        return { width: vv.width, height: vv.height };
    }
    return { width: window.innerWidth || 0, height: window.innerHeight || 0 };
}

function getSafeInsets() {
    const css = getComputedStyle(document.documentElement);
    return {
        top: parsePx(css.getPropertyValue("--safe-top")),
        right: parsePx(css.getPropertyValue("--safe-right")),
        bottom: parsePx(css.getPropertyValue("--safe-bottom")),
        left: parsePx(css.getPropertyValue("--safe-left"))
    };
}

function updateViewportVars() {
    const { width, height } = getViewportSize();
    const root = document.documentElement;
    root.style.setProperty("--vvw", `${Math.max(0, Math.round(width))}px`);
    root.style.setProperty("--vvh", `${Math.max(0, Math.round(height))}px`);
}

function normalizeSettings(raw) {
    const merged = mergeDeep(defaultSettings, raw || {});
    if (typeof merged.speechEnRate !== "number") merged.speechEnRate = defaultSettings.speechEnRate ?? 0.8;
    if (typeof merged.speechZhRate !== "number") merged.speechZhRate = defaultSettings.speechZhRate ?? 0.9;
    const deviceMode = String(merged.deviceMode || defaultSettings.deviceMode || "auto");
    merged.deviceMode = deviceMode === "auto" || deviceMode === "phone" || deviceMode === "tablet" ? deviceMode : "auto";
    const orientationLock = String(merged.orientationLock || defaultSettings.orientationLock || "auto");
    merged.orientationLock = orientationLock === "auto" || orientationLock === "portrait" || orientationLock === "landscape" ? orientationLock : "auto";
    if (typeof merged.uiScale !== "number") merged.uiScale = defaultSettings.uiScale ?? 1.0;
    if (typeof merged.motionScale !== "number") merged.motionScale = defaultSettings.motionScale ?? 1.25;
    if (typeof merged.biomeSwitchStepScore !== "number") merged.biomeSwitchStepScore = defaultSettings.biomeSwitchStepScore ?? 200;
    merged.biomeSwitchStepScore = Math.max(50, Math.min(2000, Number(merged.biomeSwitchStepScore) || 200));
    if (!merged.keyCodes) {
        merged.keyCodes = [defaultControls.jump, defaultControls.attack, defaultControls.interact, defaultControls.switch, defaultControls.useDiamond]
            .filter(Boolean)
            .join(",");
    } else {
        const parsed = parseKeyCodes(merged.keyCodes);
        if (!parsed) {
            merged.keyCodes = [defaultControls.jump, defaultControls.attack, defaultControls.interact, defaultControls.switch, defaultControls.useDiamond]
                .filter(Boolean)
                .join(",");
        }
    }
    return merged;
}

settings = normalizeSettings(settings);

function saveSettings() {
    if (storage) storage.saveJson("mmwg:settings", settings);
}

function saveProgress() {
    if (storage) storage.saveJson("mmwg:progress", progress);
}

function saveVocabState() {
    if (storage) storage.saveJson("mmwg:vocabState", vocabState);
}

function normalizeProgress(raw) {
    const p = raw && typeof raw === "object" ? raw : {};
    if (!p.vocab || typeof p.vocab !== "object") p.vocab = {};
    return p;
}

progress = normalizeProgress(progress);

function placeholderImageDataUrl(text) {
    const label = String(text || "").slice(0, 24);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="320" viewBox="0 0 520 320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1b1f2a" offset="0"/><stop stop-color="#2b3550" offset="1"/></linearGradient></defs><rect width="520" height="320" rx="22" ry="22" fill="url(#g)"/><rect x="18" y="18" width="484" height="284" rx="18" ry="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" stroke-width="3"/><text x="260" y="175" text-anchor="middle" font-family="Verdana,Arial" font-size="46" font-weight="900" fill="rgba(255,255,255,0.92)">${label}</text><text x="260" y="220" text-anchor="middle" font-family="Verdana,Arial" font-size="20" font-weight="700" fill="rgba(255,255,255,0.65)">image unavailable</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function updateWordImage(wordObj) {
    const img = document.getElementById("word-card-image");
    if (!img) return;
    if (!settings.showWordImage) {
        img.style.display = "none";
        img.removeAttribute("src");
        img.alt = "";
        return;
    }
    const list = wordObj && (wordObj.imageURLs || wordObj.images || wordObj.imageUrl || wordObj.imageURL) ? (wordObj.imageURLs || wordObj.images || []) : [];
    const url = Array.isArray(list) && list.length ? (list[0] && list[0].url ? list[0].url : null) : (wordObj && typeof wordObj.imageUrl === "string" ? wordObj.imageUrl : null);
    if (!url) {
        img.style.display = "none";
        img.removeAttribute("src");
        img.alt = "";
        return;
    }
    img.style.display = "block";
    img.src = url;
    img.alt = wordObj && wordObj.en ? String(wordObj.en) : "";
    img.onerror = () => {
        img.onerror = null;
        img.src = placeholderImageDataUrl(wordObj && wordObj.en ? wordObj.en : "");
    };
}

function ensureVocabEngine() {
    if (vocabEngine) return vocabEngine;
    if (!vocabManifest || !vocabManifest.packs) return null;
    vocabPackOrder = vocabManifest.packs.map(p => p.id);
    if (vocabManifest.byId) {
        vocabPacks = vocabManifest.byId;
    } else {
        vocabPacks = Object.create(null);
        vocabManifest.packs.forEach(p => { vocabPacks[p.id] = p; });
    }
    vocabEngine = { version: vocabManifest.version, packIds: vocabPackOrder };
    return vocabEngine;
}

function renderVocabSelect() {
    const sel = document.getElementById("opt-vocab");
    if (!sel) return;
    sel.innerHTML = "";
    const add = (value, text) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.innerText = text;
        sel.appendChild(opt);
    };
    add("auto", "随机词库（加权轮换）");
    const engine = ensureVocabEngine();
    if (!engine) return;
    vocabManifest.packs.forEach(p => add(p.id, p.title));
    sel.value = settings.vocabSelection || "auto";
}

function getPackProgress(packId) {
    if (!packId) return null;
    const v = progress.vocab;
    if (!v[packId]) v[packId] = { unique: {}, uniqueCount: 0, total: 0, completed: false };
    const entry = v[packId];
    if (!entry.unique || typeof entry.unique !== "object") entry.unique = {};
    if (typeof entry.uniqueCount !== "number") entry.uniqueCount = Object.keys(entry.unique).length;
    if (typeof entry.total !== "number") entry.total = 0;
    if (typeof entry.completed !== "boolean") entry.completed = false;
    return entry;
}

function updateVocabProgressUI() {
    const el = document.getElementById("progress-vocab");
    if (!el) return;
    const engine = ensureVocabEngine();
    if (!engine || !activeVocabPackId) {
        el.innerText = "未加载";
        return;
    }
    const pack = vocabPacks[activeVocabPackId];
    const pr = getPackProgress(activeVocabPackId);
    const total = pr.total || 0;
    const done = pr.uniqueCount || 0;
    const pct = total ? Math.min(100, Math.floor((done / total) * 100)) : 0;
    const title = pack && pack.title ? pack.title : activeVocabPackId;
    el.innerText = `${title}  ${done}/${total}  (${pct}%)`;
}

function resetVocabRotationAndProgress() {
    vocabState = { runCounts: {}, lastPackId: null };
    progress = normalizeProgress({ vocab: {} });
    saveVocabState();
    saveProgress();
    updateVocabProgressUI();
}

function isPackCompleted(packId) {
    const pr = getPackProgress(packId);
    return !!pr?.completed;
}

function pickPackAuto() {
    const engine = ensureVocabEngine();
    if (!engine) return null;
    let candidates = vocabManifest.packs.filter(p => !isPackCompleted(p.id));
    if (!candidates.length) {
        progress.vocab = {};
        saveProgress();
        candidates = [...vocabManifest.packs];
    }
    const last = vocabState.lastPackId;
    const scored = candidates.map(p => {
        const baseW = Math.max(0.05, Number(p.weight) || 1);
        const count = vocabState.runCounts && typeof vocabState.runCounts[p.id] === "number" ? vocabState.runCounts[p.id] : 0;
        let w = baseW / (1 + count * 0.75);
        if (last && p.id === last) w *= 0.2;
        if (!isFinite(w) || w <= 0) w = 0.05;
        return { id: p.id, w };
    });
    const total = scored.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * (total || 1);
    for (const x of scored) {
        r -= x.w;
        if (r <= 0) return x.id;
    }
    return scored.length ? scored[scored.length - 1].id : null;
}

function loadVocabPackFile(file) {
    if (!file) return Promise.reject(new Error("missing vocab file"));
    if (loadedVocabFiles[file]) return loadedVocabFiles[file];
    loadedVocabFiles[file] = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = file;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error(`load failed: ${file}`));
        document.head.appendChild(script);
    });
    return loadedVocabFiles[file];
}

function normalizeRawWord(raw) {
    if (!raw || typeof raw !== "object") return null;
    const en = String(raw.standardized || raw.word || "").trim();
    const zh = String(raw.chinese || raw.zh || raw.translation || "").trim();
    if (!en) return null;
    return {
        en,
        zh: zh || "",
        imageURLs: Array.isArray(raw.imageURLs) ? raw.imageURLs : []
    };
}

async function setActiveVocabPack(selection) {
    const engine = ensureVocabEngine();
    if (!engine) return false;
    const pickId = selection === "auto" || !selection ? pickPackAuto() : selection;
    const pack = pickId ? vocabPacks[pickId] : null;
    if (!pack) return false;

    activeVocabPackId = pack.id;
    vocabState.lastPackId = pack.id;
    if (!vocabState.runCounts) vocabState.runCounts = {};
    vocabState.runCounts[pack.id] = (vocabState.runCounts[pack.id] || 0) + 1;
    saveVocabState();

    try {
        await loadVocabPackFile(pack.file);
        const rawList = typeof pack.getRaw === "function" ? pack.getRaw() : [];
        const mapped = [];
        const seen = new Set();
        (Array.isArray(rawList) ? rawList : []).forEach(r => {
            const w = normalizeRawWord(r);
            if (!w) return;
            if (seen.has(w.en)) return;
            seen.add(w.en);
            mapped.push(w);
        });
        if (mapped.length) {
            wordDatabase = mapped;
            wordPicker = null;
            const pr = getPackProgress(pack.id);
            pr.total = mapped.length;
            saveProgress();
        }
    } catch {
    }

    renderVocabSelect();
    updateVocabProgressUI();
    return true;
}

function switchToNextPackInOrder() {
    const engine = ensureVocabEngine();
    if (!engine) return false;
    const ids = vocabPackOrder.length ? vocabPackOrder : vocabManifest.packs.map(p => p.id);
    const idx = activeVocabPackId ? ids.indexOf(activeVocabPackId) : -1;
    const keepAuto = (settings.vocabSelection || "auto") === "auto";
    for (let step = 1; step <= ids.length; step++) {
        const nextId = ids[(idx + step + ids.length) % ids.length];
        if (!isPackCompleted(nextId)) {
            if (!keepAuto) {
                settings.vocabSelection = nextId;
                saveSettings();
            }
            setActiveVocabPack(nextId);
            return true;
        }
    }
    progress.vocab = {};
    saveProgress();
    const first = ids[0] || "auto";
    if (!keepAuto) {
        settings.vocabSelection = first;
        saveSettings();
    }
    setActiveVocabPack(first);
    return true;
}

function applySettingsToUI() {
    const rawMode = String(settings.deviceMode || "auto");
    const viewport = getViewportSize();
    const minScreen = Math.min(viewport.width || 0, viewport.height || 0);
    const mode = rawMode === "phone" || rawMode === "tablet" ? rawMode : (minScreen && minScreen <= 760 ? "phone" : "tablet");
    document.documentElement.setAttribute("data-device-mode", mode);

    const responsive = applyResponsiveCanvas(mode, viewport, getSafeInsets());

    const container = document.getElementById("game-container");
    if (container) {
        const safe = getSafeInsets();
        const base = Number(settings.uiScale) || 1.0;
        const padX = 18 + (safe.left || 0) + (safe.right || 0);
        const padY = 18 + (safe.top || 0) + (safe.bottom || 0);
        const isLandscape = (viewport.width || 0) >= (viewport.height || 0);
        // On phone landscape, never scale past "contain" (no clipping). We'll instead adapt canvas aspect ratio.
        const modeMult = mode === "phone" ? (isLandscape ? 1.0 : 1.12) : 1.0;
        const fitW = (viewport.width - padX) / (gameConfig.canvas.width || 800);
        const fitH = (viewport.height - padY) / (gameConfig.canvas.height || 600);
        const fitContain = Math.min(fitW, fitH);
        let s = Math.min(fitContain, base * modeMult * fitContain);
        if (responsive && responsive.scale) {
            s = Math.min(fitContain, responsive.scale * base * modeMult);
        }
        container.style.transform = `scale(${s})`;
    }

    const touch = document.getElementById("touch-controls");
    if (touch) {
        const enabled = mode === "phone" ? true : !!settings.touchControls;
        touch.classList.toggle("visible", enabled);
        touch.setAttribute("aria-hidden", enabled ? "false" : "true");
    }
}

function handleViewportChange() {
    updateViewportVars();
    applySettingsToUI();
}

function applyOrientationLock() {
    const mode = String(settings.orientationLock || "auto");
    const orientation = window.screen && window.screen.orientation ? window.screen.orientation : null;
    if (!orientation) return;
    if (mode === "auto") {
        if (typeof orientation.unlock === "function") {
            try { orientation.unlock(); } catch {}
        }
        return;
    }
    if (typeof orientation.lock !== "function") return;
    const target = mode === "portrait" ? "portrait-primary" : "landscape-primary";
    try { orientation.lock(target); } catch {}
}

function applyScreenModeFromSettings(fromUserGesture) {
    const wantLock = String(settings.orientationLock || "auto") !== "auto";
    if (fromUserGesture && wantLock && !document.fullscreenElement) {
        const el = document.documentElement;
        if (el && typeof el.requestFullscreen === "function") {
            const onChange = () => applyOrientationLock();
            try {
                document.addEventListener("fullscreenchange", onChange, { once: true });
                el.requestFullscreen({ navigationUI: "hide" });
            } catch {
                try { document.removeEventListener("fullscreenchange", onChange); } catch {}
            }
        }
    }
    applyOrientationLock();
}

function setOverlay(visible, mode) {
    const overlay = document.getElementById("screen-overlay");
    if (!overlay) return;
    const title = document.getElementById("overlay-title");
    const text = document.getElementById("overlay-text");
    const btn = document.getElementById("btn-overlay-action");
    if (visible) {
        overlay.classList.add("visible");
        overlay.setAttribute("aria-hidden", "false");
        overlayMode = mode || "pause";
        if (mode === "pause") {
            if (title) title.innerText = "已暂停";
            if (text) text.innerHTML = "← → 移动　空格 跳(可二段跳)<br>J 攻击　K 切换武器　Z 使用钻石<br>Y 打开宝箱　E 采集";
            if (btn) btn.innerText = "继续";
        } else if (mode === "gameover") {
            const diamonds = getDiamondCount();
            if (title) title.innerText = "💀 游戏结束";
            if (text) {
                const level = Math.max(1, Math.floor(score / 1000) + 1);
                text.innerHTML =
                    `📚 学习单词: ${getLearnedWordCount()}<br>` +
                    `💎 钻石: ${diamonds}<br>` +
                    `⭐ 当前积分: ${score}<br>` +
                    `⚔️ 击杀敌人: ${enemyKillStats.total || 0}<br>` +
                    `🏆 玩家等级: ${level}`;
            }
            if (btn) btn.innerText = diamonds >= 10 ? "💎10 复活" : "重新开始";
        } else {
            if (title) title.innerText = "准备开始";
            if (text) text.innerHTML = "← → 移动　空格 跳(可二段跳)<br>J 攻击　K 切换武器　Z 使用钻石<br>Y 打开宝箱　E 采集";
            if (btn) btn.innerText = "开始游戏";
        }
    } else {
        overlay.classList.remove("visible");
        overlay.setAttribute("aria-hidden", "true");
        overlayMode = "start";
    }
}

function resumeGameFromOverlay() {
    applyScreenModeFromSettings(true);
    if (overlayMode === "gameover") {
        if (getDiamondCount() >= 10) {
            inventory.diamond -= 10;
            playerHp = playerMaxHp;
            updateHpUI();
            updateDiamondUI();
            paused = false;
            startedOnce = true;
            setOverlay(false);
        } else {
            initGame();
            paused = false;
            startedOnce = true;
            setOverlay(false);
        }
    } else {
        paused = false;
        startedOnce = true;
        setOverlay(false);
    }
    const btnMix = document.getElementById("btn-repeat-pause");
    if (btnMix) btnMix.innerText = "🔊 重读";
    repeatPauseState = "repeat";
}

function keyLabel(code) {
    if (!code) return "";
    if (code === "Space") return "空格";
    if (code.startsWith("Key") && code.length === 4) return code.slice(3);
    if (code.startsWith("Arrow")) return code.replace("Arrow", "方向");
    return code;
}

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
        attackTimer: 0
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
    resetInventory();
    updateInventoryUI();
    player = createPlayer();
    bossSpawned = false;
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
    updateHpUI();
    player.x = 100;
    player.y = 300;
    player.velX = 0;
    player.velY = 0;
    generatePlatform(0, 12, groundY);
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
    const intervals = [0, 3, 10, 28, 80, 220];
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
                    stats[en] = 1;
                    due[en] = tick + intervals[Math.min(stats[en], intervals.length - 1)];
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
                const c = stats[w.en] || 0;
                if (c < bestCount) {
                    best = w;
                    bestCount = c;
                    if (bestCount === 0) break;
                } else if (c === bestCount && Math.random() < 0.25) {
                    best = w;
                }
            }
            const chosen = best || base[Math.floor(Math.random() * base.length)];
            stats[chosen.en] = (stats[chosen.en] || 0) + 1;
            due[chosen.en] = tick + intervals[Math.min(stats[chosen.en], intervals.length - 1)];
            return chosen;
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
    const level = levels[currentLevelIdx];
    const biome = getBiomeById(getBiomeIdForScore(getProgressScore()));
    const platformCfg = biome.platform || {};
    const groundType = biome.groundType || level.ground;
    const newWidth = length * blockSize;
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
        platforms.push(new Platform(floatX, floatY, floatLen * blockSize, blockSize, floatType));
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
                    platforms.push(new Platform(mx, my, blockSize, blockSize, microType));
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
                platforms.push(new Platform(mx, my, blockSize, blockSize, microType));
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
        } else if (rand < enemyChance) {
            spawnEnemyByDifficulty(objectX, groundYValue - 32);
        }
    }

    lastGenX = startX + length * blockSize;
}

function spawnEnemyByDifficulty(x, y) {
    const enemyConfig = getEnemyConfig();
    const step = Number(getBiomeSwitchConfig().stepScore) || 200;
    const tier = Math.max(0, Math.floor((Number(getProgressScore()) || 0) / Math.max(1, step)));
    const biomePools = {
        forest: ["zombie", "creeper", "spider", "skeleton", "enderman"],
        snow: ["zombie", "skeleton", "creeper", "spider", "enderman"],
        desert: ["zombie", "creeper", "skeleton", "spider", "enderman"],
        mountain: ["zombie", "skeleton", "enderman", "creeper", "spider"],
        ocean: ["zombie", "creeper", "skeleton", "enderman"],
        nether: ["zombie", "piglin", "skeleton", "creeper", "enderman"]
    };
    const basePool = biomePools[currentBiome] || ["zombie", "creeper", "spider", "skeleton", "enderman"];
    const take = Math.max(2, Math.min(basePool.length, 2 + tier));
    let pool = basePool.slice(0, take).filter(t => ENEMY_STATS[t]);
    if (getProgressScore() < 3000) {
        pool = pool.filter(t => t !== "enderman");
    }

    const aliveEnemies = enemies.filter(e => !e.remove && e.y < 900).length;
    if (aliveEnemies >= (enemyConfig.maxOnScreen || 8)) return;

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
    platforms = platforms.filter(p => p.x + p.width > cameraX - removeThreshold);
    trees = trees.filter(t => t.x + t.width > cameraX - removeThreshold && !t.remove);
    chests = chests.filter(c => c.x + 40 > cameraX - removeThreshold);
    items = items.filter(i => i.x + 30 > cameraX - removeThreshold && !i.collected);
    enemies = enemies.filter(e => e.x + e.width > cameraX - removeThreshold && !e.remove && e.y < 1000);
}

function dropItem(type, x, y) {
    if (!inventory[type] && inventory[type] !== 0) inventory[type] = 0;
    inventory[type]++;
    updateInventoryUI();
    const icon = ITEM_ICONS[type] || "✨";
    showFloatingText(`${icon} +1`, x, y);
}

function bumpWordDisplay() {
    const el = document.getElementById("word-display");
    if (!el) return;
    el.style.transform = "scale(1.15)";
    setTimeout(() => { el.style.transform = "scale(1)"; }, 160);
}

function showWordCard(wordObj) {
    const card = document.getElementById("word-card");
    if (!card) return;
    const en = document.getElementById("word-card-en");
    const zh = document.getElementById("word-card-zh");
    if (en) en.innerText = wordObj.en;
    if (zh) zh.innerText = wordObj.zh;
    updateWordImage(wordObj);
    card.classList.add("visible");
    card.setAttribute("aria-hidden", "false");
    setTimeout(() => {
        card.classList.remove("visible");
        card.setAttribute("aria-hidden", "true");
    }, 900);
}

function recordWordProgress(wordObj) {
    if (!wordObj || !wordObj.en) return;
    const en = String(wordObj.en);
    sessionWordCounts[en] = (sessionWordCounts[en] || 0) + 1;

    if (!activeVocabPackId) return;
    const pr = getPackProgress(activeVocabPackId);
    if (!pr.total) pr.total = Array.isArray(wordDatabase) ? wordDatabase.length : 0;
    if (!pr.unique[en]) {
        pr.unique[en] = 1;
        pr.uniqueCount = (pr.uniqueCount || 0) + 1;
        if (pr.total && pr.uniqueCount >= pr.total) {
            pr.completed = true;
            saveProgress();
            updateVocabProgressUI();
            const pack = vocabPacks[activeVocabPackId];
            showToast(`${pack?.title || activeVocabPackId} 已完成，切换下一个词库`);
            switchToNextPackInOrder();
            return;
        }
        saveProgress();
        updateVocabProgressUI();
    }
}

function updateWordUI(wordObj) {
    const el = document.getElementById("word-display");
    if (!el) return;
    const times = wordObj && wordObj.en && sessionWordCounts[wordObj.en] ? ` ×${sessionWordCounts[wordObj.en]}` : "";
    el.innerText = wordObj ? `${wordObj.en} ${wordObj.zh}${times}` : "Start!";
}

function speakWord(wordObj) {
    lastWord = wordObj;
    updateWordUI(wordObj);
    bumpWordDisplay();
    showWordCard(wordObj);

    if (!settings.speechEnabled) return;
    if (!("speechSynthesis" in window)) return;

    try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        const uEn = new SpeechSynthesisUtterance(wordObj.en);
        uEn.lang = "en-US";
        uEn.rate = Math.max(1.0, Number(settings.speechEnRate) || 1.0);
        const uZh = new SpeechSynthesisUtterance(wordObj.zh);
        uZh.lang = "zh-CN";
        uZh.rate = Number(settings.speechZhRate) || 0.9;
        window.speechSynthesis.speak(uEn);
        if (wordObj.zh) {
            setTimeout(() => window.speechSynthesis.speak(uZh), 120);
        }
    } catch {
    }
}

function optimizedUpdate(entity, updateFn) {
    const onScreen = entity.x > cameraX - 100 && entity.x < cameraX + 900;
    if (onScreen) {
        updateFn();
    } else if (gameFrame % 3 === 0) {
        updateFn();
    }
}

function checkBossSpawn() {
    if (bossSpawned) return;
    const enemyConfig = getEnemyConfig();
    if (getProgressScore() >= (enemyConfig.bossSpawnScore || 5000)) {
        bossSpawned = true;
        const dragon = new Enemy(player.x + 300, 100, "ender_dragon");
        enemies.push(dragon);
        showToast("⚠️ 末影龙降临！");
    }
}

function update() {
    if (paused) return;
    updateCurrentBiome();
    applyBiomeEffectsToPlayer();
    tickWeather();
    if (keys.right) {
        if (player.velX < player.speed) player.velX++;
        player.facingRight = true;
    }
    if (keys.left) {
        if (player.velX > -player.speed) player.velX--;
        player.facingRight = false;
    }

    player.velX *= gameConfig.physics.friction;
    let currentGravity = gameConfig.physics.gravity;
    if (Math.abs(player.velY) < 1.0) currentGravity = gameConfig.physics.gravity * 0.4;
    player.velY += currentGravity;
    player.grounded = false;

    for (let p of platforms) {
        const dir = colCheck(player, p);
        if (dir === "l" || dir === "r") player.velX = 0;
        else if (dir === "b") {
            player.grounded = true;
            player.jumpCount = 0;
            coyoteTimer = gameConfig.jump.coyoteFrames;
        } else if (dir === "t") {
            player.velY *= -1;
        }
    }

    for (let t of trees) {
        const trunkX = t.x + (t.width - 30) / 2;
        const trunkY = t.y + t.height - 60;
        const dir = colCheckRect(player.x, player.y, player.width, player.height, trunkX, trunkY, 30, 60);
        if (dir) {
            if (dir === "l" || dir === "r") player.velX = 0;
            else if (dir === "b") {
                player.grounded = true;
                player.jumpCount = 0;
                player.y = trunkY - player.height;
                coyoteTimer = gameConfig.jump.coyoteFrames;
            }
        }
    }

    if (!player.grounded && coyoteTimer > 0) {
        coyoteTimer--;
    }

    if (jumpBuffer > 0) {
        jumpBuffer--;
    }

    if (jumpBuffer > 0) {
        if (coyoteTimer > 0) {
            player.velY = player.jumpStrength;
            player.grounded = false;
            player.jumpCount = 1;
            coyoteTimer = 0;
            jumpBuffer = 0;
        } else if (player.jumpCount < player.maxJumps) {
            player.velY = player.jumpStrength * 0.8;
            player.jumpCount++;
            jumpBuffer = 0;
        }
    }

    if (player.grounded) player.velY = 0;

    player.x += player.velX;
    player.y += player.velY;

    if (player.y > fallResetY) {
        player.y = 0;
        player.x -= 200;
        if (player.x < 0) player.x = 100;
        player.velY = 0;
    }

    let targetCamX = player.x - cameraOffsetX;
    if (targetCamX < 0) targetCamX = 0;
    if (targetCamX > cameraX) cameraX = targetCamX;

    updateMapGeneration();

    decorations.forEach(d => {
        d.update();
        if ((d.interactive || d.harmful) && rectIntersect(player.x, player.y, player.width, player.height, d.x, d.y, d.width, d.height)) {
            d.onCollision(player);
        }
    });
    decorations = decorations.filter(d => d.x + d.width > cameraX - removeThreshold && !d.remove);

    if (particles.length) {
        particles.forEach(p => p.update());
        particles = particles.filter(p => !p.remove);
    }
    spawnBiomeParticles();

    checkBossSpawn();

    playerPositionHistory.push({ x: player.x, y: player.y, frame: gameFrame });
    if (playerPositionHistory.length > 150) playerPositionHistory.shift();

    golems.forEach(g => optimizedUpdate(g, () => g.update(player, playerPositionHistory, enemies, platforms)));
    golems = golems.filter(g => !g.remove && g.x > cameraX - 260);

    enemies.forEach(e => {
        optimizedUpdate(e, () => e.update(player));
        if (e.remove || e.y > 900) return;
        if (colCheck(player, e)) {
            if (player.velY > 0 && player.y + player.height < e.y + e.height * 0.8) {
                e.takeDamage(999);
                player.velY = -4;
            } else {
                damagePlayer(Number(e.damage) || 10, e.x);
            }
        }
    });
    enemies = enemies.filter(e => !e.remove && e.y < 950);

    if (projectiles.length) {
        projectiles.forEach(p => optimizedUpdate(p, () => p.update(player, golems, enemies)));
        projectiles = projectiles.filter(p => {
            const inRange = p.x > cameraX - 300 && p.x < cameraX + 1200;
            if (!inRange) p.remove = true;
            return !p.remove && inRange;
        });
    }

    items.forEach(item => {
        item.floatY = Math.sin(gameFrame / 20) * 5;
        if (rectIntersect(player.x, player.y, player.width, player.height, item.x, item.y + item.floatY, 30, 30)) {
            item.collected = true;
            addScore(gameConfig.scoring.word);
            recordWordProgress(item.wordObj);
            speakWord(item.wordObj);
            showFloatingText(item.wordObj.zh, item.x, item.y);
        }
    });

    if (player.isAttacking) {
        player.attackTimer--;
        if (player.attackTimer <= 0) player.isAttacking = false;
    }

    floatingTexts = floatingTexts.filter(t => t.life > 0);
    floatingTexts.forEach(t => {
        t.y -= 1;
        t.life--;
    });

    if (playerInvincibleTimer > 0) playerInvincibleTimer--;
    if (playerWeapons.attackCooldown > 0) playerWeapons.attackCooldown--;
    if (playerWeapons.isCharging) {
        const weapon = WEAPONS.bow;
        playerWeapons.chargeTime = Math.min(weapon.chargeMax, playerWeapons.chargeTime + 1);
    }

    // Biomes are score-driven now; the old "next level / scene switch" caused conflicts.
    updateDifficultyState();
    gameFrame++;
}

function addScore(points) {
    score += points;
    levelScore += points;
    if (score < 0) score = 0;
    if (levelScore < 0) levelScore = 0;
    runBestScore = Math.max(runBestScore, score);
    document.getElementById("score").innerText = score;
    updateDifficultyState();
}

function updateHpUI() {
    const el = document.getElementById("hp");
    if (!el) return;
    const maxPerRow = 5;
    const total = Math.max(0, playerMaxHp);
    const filled = Math.max(0, Math.min(playerHp, total));
    const rows = Math.ceil(total / maxPerRow) || 1;
    let html = "";
    for (let r = 0; r < rows; r++) {
        const rowStart = r * maxPerRow;
        const rowEnd = Math.min(total, rowStart + maxPerRow);
        const rowFilled = Math.max(0, Math.min(filled - rowStart, rowEnd - rowStart));
        const rowEmpty = (rowEnd - rowStart) - rowFilled;
        let rowHtml = "";
        for (let i = 0; i < rowFilled; i++) rowHtml += `<span class="hp-heart">❤️</span>`;
        for (let i = 0; i < rowEmpty; i++) rowHtml += `<span class="hp-heart">🖤</span>`;
        html += `<div class="hp-row">${rowHtml}</div>`;
    }
    el.innerHTML = html;
}

function getDiamondCount() {
    return Number(inventory.diamond) || 0;
}

function updateDiamondUI() {
    updateInventoryUI();
}

function useDiamondForHp() {
    if (playerHp >= playerMaxHp) {
        showToast("❤️ 已满血");
        return;
    }
    if (getDiamondCount() < 1) {
        showToast("💎 不足");
        return;
    }
    inventory.diamond -= 1;
    healPlayer(1);
    updateDiamondUI();
    showToast("💎 换取 +1❤️");
}

function getLearnedWordCount() {
    const vocab = progress && progress.vocab ? Object.keys(progress.vocab) : [];
    return vocab.length;
}

function recordEnemyKill(type) {
    enemyKillStats.total = (enemyKillStats.total || 0) + 1;
    enemyKillStats[type] = (enemyKillStats[type] || 0) + 1;
}

function healPlayer(amount) {
    if (playerHp <= 0) return;
    playerHp = Math.min(playerMaxHp, playerHp + amount);
    updateHpUI();
}

function scorePenaltyForDamage(amount) {
    const dmg = Math.max(0, Number(amount) || 0);
    // Score is the "HP" proxy in this game: lose a few points on contact, but not too punishing.
    const scale = typeof gameConfig?.scoring?.hitPenaltyScale === "number" ? gameConfig.scoring.hitPenaltyScale : 0.5;
    const minPenalty = typeof gameConfig?.scoring?.minHitPenalty === "number" ? gameConfig.scoring.minHitPenalty : 5;
    const maxPenalty = typeof gameConfig?.scoring?.maxHitPenalty === "number" ? gameConfig.scoring.maxHitPenalty : 30;
    const raw = Math.round(dmg * scale);
    return Math.max(minPenalty, Math.min(maxPenalty, raw || minPenalty));
}

function damagePlayer(amount, sourceX, knockback = 90) {
    if (playerInvincibleTimer > 0) return;
    const invFrames = Number(getDifficultyConfig().invincibleFrames ?? 30) || 30;
    playerInvincibleTimer = Math.max(10, invFrames);
    lastDamageFrame = gameFrame;
    const dir = sourceX != null ? (player.x > sourceX ? 1 : -1) : -1;
    player.x += dir * knockback;
    player.y -= 40;
    const baseDamage = Math.max(1, Number(amount) || 1);
    const diff = getDifficultyState();
    const damageUnit = Number(getDifficultyConfig().damageUnit ?? 20) || 20;
    const scaledDamage = Math.max(1, Math.round((baseDamage * diff.enemyDamageMult) / damageUnit));
    const penalty = scorePenaltyForDamage(baseDamage * diff.enemyDamageMult);
    addScore(-penalty);
    playerHp = Math.max(0, playerHp - scaledDamage);
    updateHpUI();
    showFloatingText(`-${penalty}分`, player.x, player.y);
    if (playerHp <= 0 || score <= 0) {
        paused = true;
        showToast("💀 生命耗尽");
        setOverlay(true, "gameover");
    }
}

function nextLevel() {
    // Deprecated: scenes are controlled by biomes now.
    levelScore = 0;
}

function showToast(msg) {
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.style.display = "block";
    setTimeout(() => t.style.display = "none", 2000);
}

function showFloatingText(text, x, y) {
    floatingTexts.push({ text, x, y, life: 60 });
}

function updateInventoryUI() {
    const ids = {
        diamond: "count-diamond",
        pumpkin: "count-pumpkin",
        iron: "count-iron",
        stick: "count-stick",
        stone_sword: "count-stone_sword",
        iron_pickaxe: "count-iron_pickaxe",
        bow: "count-bow",
        arrow: "count-arrow"
    };
    Object.keys(ids).forEach(key => {
        const el = document.getElementById(ids[key]);
        if (el) el.innerText = inventory[key] ?? 0;
    });
    const slots = Array.from(document.querySelectorAll(".inventory-bar .inv-slot:not(.inv-slot-button)"));
    slots.forEach((s, idx) => {
        s.classList.toggle("selected", idx === selectedSlot);
    });
    syncWeaponsFromInventory();
    updateWeaponUI();
}

const RECIPES = {
    iron_golem: { iron: 10 },
    snow_golem: { pumpkin: 10 }
};

function tryCraft(recipeKey) {
    const recipe = RECIPES[recipeKey];
    if (!recipe) return false;
    for (const [item, count] of Object.entries(recipe)) {
        if ((inventory[item] || 0) < count) {
            showToast(`材料不足: 需要 ${ITEM_LABELS[item] || item} x${count}`);
            return false;
        }
    }
    for (const [item, count] of Object.entries(recipe)) {
        inventory[item] -= count;
    }
    spawnGolem(recipeKey === "iron_golem" ? "iron" : "snow");
    updateInventoryUI();
    return true;
}

function spawnGolem(type) {
    const config = getGolemConfig();
    const maxCount = Number(config.maxCount) || MAX_GOLEMS;
    if (golems.length >= maxCount) {
        showToast(`最多同时存在 ${maxCount} 个傀儡！`);
        return;
    }
    const newGolem = new Golem(player.x + 50, player.y, type);
    golems.push(newGolem);
    const name = type === "iron" ? "铁傀儡" : "雪傀儡";
    showToast(`✅ 成功召唤 ${name}！`);
    showFloatingText(`⚒️ ${name}`, player.x, player.y - 40);
}

function handleInteraction() {
    let nearestChest = null;
    let minDist = 60;
    for (let c of chests) {
        if (c.opened) continue;
        const d = Math.abs((player.x + player.width / 2) - (c.x + c.width / 2));
        if (d < minDist) {
            nearestChest = c;
            break;
        }
    }
    if (nearestChest) nearestChest.open();
}

function handleDecorationInteract() {
    for (const d of decorations) {
        if (!d.collectible) continue;
        if (rectIntersect(player.x, player.y, player.width, player.height, d.x, d.y, d.width, d.height)) {
            d.interact(player);
            break;
        }
    }
}

function handleAttack(mode = "press") {
    if (playerWeapons.attackCooldown > 0) return;
    const weapon = WEAPONS[playerWeapons.current] || WEAPONS.sword;

    if (weapon.type === "ranged") {
        if (mode === "tap") {
            releaseBowShot(0.35);
            return;
        }
        if (!playerWeapons.isCharging) {
            startBowCharge();
        }
        return;
    }

    if (weapon.type === "dig") {
        digGroundBlock();
        return;
    }

    performMeleeAttack(weapon);
}

function handleAttackRelease() {
    const weapon = WEAPONS[playerWeapons.current] || WEAPONS.sword;
    if (weapon.type !== "ranged") return;
    if (!playerWeapons.isCharging) return;
    releaseBowShot();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const biome = getBiomeById(currentBiome);
    drawBackground(biome);
    ctx.save();
    ctx.translate(-cameraX, 0);

    platforms.forEach(p => drawBlock(p.x, p.y, p.width, p.height, p.type));

    if (biome.effects?.waterLevel) {
        ctx.fillStyle = "rgba(33, 150, 243, 0.25)";
        ctx.fillRect(cameraX - 50, biome.effects.waterLevel, canvas.width + 100, canvas.height - biome.effects.waterLevel);
    }

    trees.forEach(t => {
        if (t.shake > 0) t.shake--;
        const shakeX = (Math.random() - 0.5) * t.shake * 2;
        drawPixelTree(ctx, t.x + shakeX, t.y, t.type, t.hp);
    });

    decorations.forEach(d => drawDecoration(d));

    chests.forEach(c => drawChest(c.x, c.y, c.opened));

    items.forEach(i => {
        if (!i.collected) drawItem(i.x, i.y + i.floatY, i.wordObj.en);
    });

    if (particles.length) {
        particles.forEach(p => drawParticle(p));
    }

    enemies.forEach(e => drawEnemy(e));

    golems.forEach(g => drawGolem(g));

    if (projectiles.length) {
        projectiles.forEach(p => drawProjectile(p));
    }

    drawSteve(player.x, player.y, player.facingRight, player.isAttacking);

    ctx.fillStyle = "#FFF";
    ctx.font = "bold 20px Verdana";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    floatingTexts.forEach(t => {
        ctx.strokeText(t.text, t.x + 10, t.y);
        ctx.fillText(t.text, t.x + 10, t.y);
    });

    chests.forEach(c => {
        if (!c.opened && Math.abs(player.x - c.x) < 60) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 4;
            ctx.fillStyle = "white";
            const label = keyLabel(keyBindings.interact) || "Y";
            const hint = `按 ${label} 打开`;
            ctx.strokeText(hint, c.x - 10, c.y - 15);
            ctx.fillText(hint, c.x - 10, c.y - 15);
        }
    });

    ctx.restore();

    const boss = enemies.find(e => e.type === "ender_dragon" && !e.remove);
    if (boss) {
        const barW = 360;
        const barH = 14;
        const bx = (canvas.width - barW) / 2;
        const by = 20;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(bx - 4, by - 4, barW + 8, barH + 8);
        ctx.fillStyle = "#111";
        ctx.fillRect(bx, by, barW, barH);
        const pct = Math.max(0, boss.hp / boss.maxHp);
        ctx.fillStyle = "#8E24AA";
        ctx.fillRect(bx, by, barW * pct, barH);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Verdana";
        ctx.textAlign = "center";
        ctx.fillText("末影龙", canvas.width / 2, by - 6);
        ctx.textAlign = "left";
    }

    requestAnimationFrame(() => { update(); draw(); });
}

function drawBlock(x, y, w, h, type) {
    const cols = Math.ceil(w / blockSize);
    for (let i = 0; i < cols; i++) {
        const cx = x + i * blockSize;
        if (type === "grass") {
            ctx.fillStyle = "#5d4037";
            ctx.fillRect(cx, y, blockSize, h);
            ctx.fillStyle = "#4CAF50";
            ctx.fillRect(cx, y, blockSize, h / 3);
        } else if (type === "snow") {
            ctx.fillStyle = "#1e3f66";
            ctx.fillRect(cx, y, blockSize, h);
            ctx.fillStyle = "#fff";
            ctx.fillRect(cx, y, blockSize, h / 3);
        } else if (type === "stone") {
            ctx.fillStyle = "#757575";
            ctx.fillRect(cx, y, blockSize, h);
            ctx.fillStyle = "#424242";
            ctx.fillRect(cx + 5, y + 5, 10, 10);
        } else if (type === "sand") {
            ctx.fillStyle = "#FDD835";
            ctx.fillRect(cx, y, blockSize, h);
        } else if (type === "netherrack") {
            ctx.fillStyle = "#5E1B1B";
            ctx.fillRect(cx, y, blockSize, h);
            ctx.fillStyle = "#8B0000";
            ctx.fillRect(cx + 4, y + 6, 12, 8);
            ctx.fillRect(cx + 20, y + 16, 10, 8);
        } else {
            ctx.fillStyle = "#5d4037";
            ctx.fillRect(cx, y, blockSize, h);
            ctx.fillStyle = "#4CAF50";
            ctx.fillRect(cx, y, blockSize, h / 3);
        }

        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.strokeRect(cx, y, blockSize, h);

        if (y >= groundY) {
            const fillHeight = canvasHeight - (y + h);
            if (fillHeight > 0) {
                if (type === "grass") ctx.fillStyle = "#5d4037";
                else if (type === "snow") ctx.fillStyle = "#1e3f66";
                else if (type === "stone") ctx.fillStyle = "#757575";
                else if (type === "sand") ctx.fillStyle = "#FDD835";
                else if (type === "netherrack") ctx.fillStyle = "#3E1010";
                else ctx.fillStyle = "#5d4037";
                ctx.fillRect(cx, y + h, blockSize, fillHeight);
                ctx.fillStyle = "rgba(0,0,0,0.05)";
                ctx.fillRect(cx + 10, y + h + 10, 20, 20);
            }
        }
    }
}

function drawPixelTree(ctx2d, x, y, type, hp) {
    const trunkW = 20;
    const trunkH = 60;
    const trunkX = x + (80 - trunkW) / 2;
    const trunkY = y + 140 - trunkH;
    if (type === "cactus") {
        ctx2d.fillStyle = "#2E7D32";
        ctx2d.fillRect(trunkX, trunkY, trunkW, trunkH);
        ctx2d.fillRect(trunkX - 15, trunkY + 10, 15, 10);
        ctx2d.fillRect(trunkX - 15, trunkY - 10, 10, 20);
        ctx2d.fillRect(trunkX + 20, trunkY + 20, 15, 10);
        ctx2d.fillRect(trunkX + 25, trunkY + 5, 10, 15);
        return;
    }

    if (type === "palm") {
        ctx2d.fillStyle = "#8D6E63";
        ctx2d.fillRect(trunkX + 6, trunkY - 20, 8, trunkH + 20);
        ctx2d.fillStyle = "#2E7D32";
        ctx2d.beginPath();
        ctx2d.moveTo(trunkX + 10, trunkY - 30);
        ctx2d.lineTo(trunkX - 10, trunkY - 10);
        ctx2d.lineTo(trunkX + 30, trunkY - 10);
        ctx2d.closePath();
        ctx2d.fill();
        return;
    }

    if (type === "spruce" || type === "pine") {
        ctx2d.fillStyle = "#5D4037";
        ctx2d.fillRect(trunkX + 4, trunkY, trunkW - 8, trunkH);
        ctx2d.fillStyle = type === "spruce" ? "#1B5E20" : "#2E7D32";
        ctx2d.beginPath();
        ctx2d.moveTo(x + 40, y + 10);
        ctx2d.lineTo(x + 10, y + 70);
        ctx2d.lineTo(x + 70, y + 70);
        ctx2d.closePath();
        ctx2d.fill();
        ctx2d.fillStyle = "rgba(255,255,255,0.5)";
        ctx2d.fillRect(x + 20, y + 40, 40, 6);
        return;
    }

    let leafColor = "#2E7D32";
    if (type === "birch") leafColor = "#7CB342";
    if (type === "dark_oak") leafColor = "#1B5E20";
    if (type === "mushroom") leafColor = "#D32F2F";

    if (type === "birch") {
        ctx2d.fillStyle = "#F5F5F5";
    } else if (type === "dark_oak") {
        ctx2d.fillStyle = "#4E342E";
    } else {
        ctx2d.fillStyle = "#5D4037";
    }
    ctx2d.fillRect(trunkX, trunkY, trunkW, trunkH);

    ctx2d.fillStyle = leafColor;
    ctx2d.fillRect(x, y + 40, 80, 40);
    ctx2d.fillRect(x + 10, y + 20, 60, 20);
    ctx2d.fillRect(x + 20, y, 40, 20);

    if (type === "birch") {
        ctx2d.fillStyle = "#424242";
        ctx2d.fillRect(trunkX + 4, trunkY + 10, 4, 6);
        ctx2d.fillRect(trunkX + 12, trunkY + 28, 4, 6);
    }

    if (hp < 5) {
        ctx2d.fillStyle = "rgba(0,0,0,0.3)";
        const crackH = (5 - hp) * 10;
        ctx2d.fillRect(trunkX + 5, trunkY + trunkH - crackH, 10, crackH);
    }
}

function drawChest(x, y, opened) {
    ctx.fillStyle = "#795548";
    ctx.fillRect(x, y, 40, 40);
    ctx.fillStyle = "#3E2723";
    ctx.strokeRect(x, y, 40, 40);
    ctx.fillStyle = "#FFC107";
    if (opened) {
        ctx.fillRect(x + 15, y + 5, 10, 5);
        ctx.fillStyle = "#000";
        ctx.fillText("空", x + 10, y + 25);
    } else {
        ctx.fillRect(x + 15, y + 18, 10, 6);
    }
}

function drawItem(x, y, text) {
    ctx.fillStyle = "#00FFFF";
    ctx.beginPath();
    ctx.moveTo(x + 15, y);
    ctx.lineTo(x + 30, y + 15);
    ctx.lineTo(x + 15, y + 30);
    ctx.lineTo(x, y + 15);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.strokeText(text, x + 15, y - 5);
    ctx.fillText(text, x + 15, y - 5);
}

function drawSteve(x, y, facingRight, attacking) {
    ctx.fillStyle = "#00AAAA";
    ctx.fillRect(x + 6, y + 20, 14, 20);
    ctx.fillStyle = "#0000AA";
    ctx.fillRect(x + 6, y + 40, 14, 12);
    ctx.fillStyle = "#F5Bca9";
    ctx.fillRect(x + 3, y, 20, 20);
    ctx.fillStyle = "#4A332A";
    ctx.fillRect(x + 3, y, 20, 6);
    
    // Eyes: Black
    ctx.fillStyle = "#000";
    const ex = facingRight ? x + 16 : x + 6;
    ctx.fillRect(ex, y + 6, 4, 4); // Steve's eye
    
    if (attacking) {
        ctx.save();
        ctx.translate(x + (facingRight ? 26 : 0), y + 26);
        if (!facingRight) ctx.scale(-1, 1);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = "#00FFFF";
        ctx.fillRect(0, -16, 5, 32);
        ctx.restore();
    }
}

function drawMobRect(x, y, s, px, py, pw, ph) {
    ctx.fillRect(x + px * s, y + py * s, pw * s, ph * s);
}

function drawCreeperMob(enemy) {
    const x = enemy.x;
    const s = enemy.width / 16;
    const y = enemy.y + enemy.height - 24 * s;

    // Base greens close to the in-game creeper texture.
    ctx.fillStyle = "#3AAE2A";
    drawMobRect(x, y, s, 0, 0, 16, 8); // head
    drawMobRect(x, y, s, 2, 8, 12, 8); // body
    // legs
    drawMobRect(x, y, s, 1, 16, 3, 8);
    drawMobRect(x, y, s, 5, 16, 3, 8);
    drawMobRect(x, y, s, 8, 16, 3, 8);
    drawMobRect(x, y, s, 12, 16, 3, 8);

    // Texture patches
    ctx.fillStyle = "#2E7D32";
    drawMobRect(x, y, s, 1, 1, 3, 2);
    drawMobRect(x, y, s, 10, 1, 3, 2);
    drawMobRect(x, y, s, 4, 9, 2, 2);
    drawMobRect(x, y, s, 11, 10, 2, 2);

    // Face
    ctx.fillStyle = "#111";
    drawMobRect(x, y, s, 3, 2, 3, 3);  // left eye
    drawMobRect(x, y, s, 10, 2, 3, 3); // right eye
    drawMobRect(x, y, s, 7, 5, 2, 2);  // nose
    drawMobRect(x, y, s, 6, 6, 4, 2);  // mouth top
    drawMobRect(x, y, s, 5, 7, 2, 1);  // mouth left
    drawMobRect(x, y, s, 9, 7, 2, 1);  // mouth right
}

function drawEnemy(enemy) {
    if (enemy.remove || enemy.y > 900) return;
    switch (enemy.type) {
        case "zombie":
            drawZombie(enemy);
            break;
        case "spider":
            drawSpider(enemy);
            break;
        case "creeper":
            drawCreeperMob(enemy);
            if (enemy.state === "exploding") {
                const flash = Math.floor(enemy.explodeTimer / 10) % 2 === 0;
                if (flash) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.fillRect(enemy.x - 6, enemy.y - 6, enemy.width + 12, enemy.height + 12);
                }
            }
            break;
        case "skeleton":
            drawSkeleton(enemy);
            break;
        case "enderman":
            drawEnderman(enemy);
            break;
        case "ender_dragon":
            drawEnderDragon(enemy.x, enemy.y);
            break;
    }

    if (enemy.hp < enemy.maxHp) {
        drawHealthBar(enemy.x, enemy.y - 8, enemy.width, enemy.hp, enemy.maxHp);
    }
}

function drawZombie(enemy) {
    const x = enemy.x;
    const s = enemy.width / 16;
    const y = enemy.y + enemy.height - 24 * s;

    // Head (green), shirt (blue), pants (purple) - closer to the classic Minecraft zombie palette.
    ctx.fillStyle = "#4CAF50";
    drawMobRect(x, y, s, 0, 0, 16, 8);
    ctx.fillStyle = "#2E7D32";
    drawMobRect(x, y, s, 2, 1, 3, 2);
    drawMobRect(x, y, s, 11, 2, 3, 2);

    // Face
    ctx.fillStyle = "#1B1B1B";
    drawMobRect(x, y, s, 4, 3, 2, 2);
    drawMobRect(x, y, s, 10, 3, 2, 2);
    ctx.fillStyle = "#2B2B2B";
    drawMobRect(x, y, s, 7, 5, 2, 1);

    // Torso + arms
    ctx.fillStyle = "#2E7D9A"; // shirt
    drawMobRect(x, y, s, 3, 8, 10, 8);
    drawMobRect(x, y, s, 0, 8, 3, 12);
    drawMobRect(x, y, s, 13, 8, 3, 12);

    // Pants + legs
    ctx.fillStyle = "#5E35B1";
    drawMobRect(x, y, s, 3, 16, 5, 8);
    drawMobRect(x, y, s, 8, 16, 5, 8);
    ctx.fillStyle = "#4527A0";
    drawMobRect(x, y, s, 3, 22, 5, 2);
    drawMobRect(x, y, s, 8, 22, 5, 2);
}

function drawSpider(enemy) {
    const x = enemy.x;
    const y = enemy.y + enemy.height - 12 * (enemy.width / 22);
    const s = enemy.width / 22;

    // Body
    ctx.fillStyle = "#1B1B1B";
    ctx.fillRect(x + 4 * s, y + 3 * s, 14 * s, 6 * s);
    ctx.fillStyle = "#2B2B2B";
    ctx.fillRect(x + 6 * s, y + 2 * s, 10 * s, 3 * s);

    // Eyes (red)
    ctx.fillStyle = "#D50000";
    ctx.fillRect(x + 7 * s, y + 3 * s, 2 * s, 2 * s);
    ctx.fillRect(x + 13 * s, y + 3 * s, 2 * s, 2 * s);

    // Legs (8)
    ctx.strokeStyle = "#111";
    ctx.lineWidth = Math.max(2, s);
    const legPairs = [
        [[6, 4], [1, 1]],
        [[6, 7], [1, 10]],
        [[8, 4], [2, 0]],
        [[8, 7], [2, 11]],
        [[16, 4], [21, 1]],
        [[16, 7], [21, 10]],
        [[14, 4], [20, 0]],
        [[14, 7], [20, 11]]
    ];
    ctx.beginPath();
    for (const [[sx, sy], [ex, ey]] of legPairs) {
        ctx.moveTo(x + sx * s, y + sy * s);
        ctx.lineTo(x + ex * s, y + ey * s);
    }
    ctx.stroke();
}

function drawSkeleton(enemy) {
    const x = enemy.x;
    const s = enemy.width / 16;
    const y = enemy.y + enemy.height - 24 * s;

    ctx.fillStyle = "#E0E0E0";
    drawMobRect(x, y, s, 0, 0, 16, 8); // head
    ctx.fillStyle = "#111";
    drawMobRect(x, y, s, 4, 3, 3, 3);
    drawMobRect(x, y, s, 9, 3, 3, 3);

    // torso + arms
    ctx.fillStyle = "#D6D6D6";
    drawMobRect(x, y, s, 4, 8, 8, 8);
    drawMobRect(x, y, s, 1, 8, 3, 12);
    drawMobRect(x, y, s, 12, 8, 3, 12);

    // ribs detail
    ctx.fillStyle = "#BDBDBD";
    for (let i = 0; i < 4; i++) drawMobRect(x, y, s, 5, 9 + i * 2, 6, 1);

    // legs
    ctx.fillStyle = "#D6D6D6";
    drawMobRect(x, y, s, 5, 16, 3, 8);
    drawMobRect(x, y, s, 8, 16, 3, 8);

    // simple bow hint
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = Math.max(2, s);
    ctx.beginPath();
    ctx.arc(x + 1.5 * s, y + 12 * s, 4 * s, 0, Math.PI);
    ctx.stroke();
}

function drawEnderman(enemy) {
    const x = enemy.x;
    const s = enemy.width / 16;
    const y = enemy.y + enemy.height - 32 * s;

    ctx.fillStyle = "#0B0B0B";
    // head
    drawMobRect(x, y, s, 0, 0, 16, 8);
    // torso
    drawMobRect(x, y, s, 6, 8, 4, 10);
    // arms
    drawMobRect(x, y, s, 4, 8, 2, 20);
    drawMobRect(x, y, s, 10, 8, 2, 20);
    // legs
    drawMobRect(x, y, s, 6, 18, 2, 14);
    drawMobRect(x, y, s, 8, 18, 2, 14);

    // eyes
    ctx.fillStyle = "#AA00FF";
    drawMobRect(x, y, s, 4, 3, 3, 1);
    drawMobRect(x, y, s, 9, 3, 3, 1);
    ctx.fillStyle = "#E1BEE7";
    drawMobRect(x, y, s, 5, 3, 1, 1);
    drawMobRect(x, y, s, 10, 3, 1, 1);
}

function drawEnderDragon(x, y) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y + 20, 80, 30);
    ctx.fillRect(x + 60, y + 30, 40, 15);
    ctx.fillStyle = "#AA00FF";
    ctx.fillRect(x + 85, y + 35, 4, 4);
    const wingFlap = Math.sin(gameFrame * 0.1) * 10;
    ctx.fillStyle = "#1A0033";
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 25);
    ctx.lineTo(x - 20, y + 10 + wingFlap);
    ctx.lineTo(x + 10, y + 35);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 60, y + 25);
    ctx.lineTo(x + 100, y + 10 + wingFlap);
    ctx.lineTo(x + 70, y + 35);
    ctx.fill();
}

function drawGolem(golem) {
    const x = golem.x;
    const y = golem.y;
    if (golem.type === "iron") {
        ctx.fillStyle = "#757575";
        ctx.fillRect(x + 10, y + 10, 20, 38);
        ctx.fillStyle = "#424242";
        ctx.fillRect(x + 5, y, 30, 10);
        ctx.fillStyle = "#FF5722";
        ctx.fillRect(x + 12, y + 3, 4, 4);
        ctx.fillRect(x + 22, y + 3, 4, 4);
    } else {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x + 8, y + 15, 16, 16);
        ctx.fillRect(x + 10, y, 12, 12);
        ctx.fillStyle = "#FF5722";
        ctx.fillRect(x + 12, y + 4, 2, 2);
        ctx.fillRect(x + 18, y + 4, 2, 2);
        ctx.fillStyle = "#FFA500";
        ctx.fillRect(x + 15, y + 6, 4, 2);
    }
    drawHealthBar(x, y - 8, golem.width, golem.hp, golem.maxHp);
}

function drawHealthBar(x, y, width, hp, maxHp) {
    const barWidth = width;
    const barHeight = 4;
    const hpPercent = Math.max(0, hp / maxHp);
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = hpPercent > 0.5 ? "#4CAF50" : hpPercent > 0.2 ? "#FFC107" : "#F44336";
    ctx.fillRect(x, y, barWidth * hpPercent, barHeight);
}

function drawProjectile(proj) {
    if (proj instanceof Arrow) {
        ctx.fillStyle = "#8B4513";
        ctx.save();
        ctx.translate(proj.x, proj.y);
        const angle = Math.atan2(proj.velY, proj.velX);
        ctx.rotate(angle);
        ctx.fillRect(0, -1, 12, 2);
        ctx.fillStyle = "#C0C0C0";
        ctx.fillRect(10, -2, 2, 4);
        ctx.restore();
    } else if (proj instanceof Snowball) {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#E0E0E0";
        ctx.stroke();
    } else if (proj instanceof DragonFireball) {
        ctx.fillStyle = "#FF5722";
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FF9800";
        ctx.stroke();
    }
}

function drawDecoration(decor) {
    switch (decor.type) {
        case "bush":
            drawBush(decor);
            break;
        case "flower":
            drawFlower(decor);
            break;
        case "mushroom":
            drawMushroom(decor);
            break;
        case "vine":
            drawVine(decor);
            break;
        case "ice_spike":
            drawIceSpike(decor);
            break;
        case "snow_pile":
            drawSnowPile(decor);
            break;
        case "ice_block":
            drawIceBlock(decor);
            break;
        case "dead_bush":
            drawDeadBush(decor);
            break;
        case "rock":
            drawRock(decor);
            break;
        case "bones":
            drawBones(decor);
            break;
        case "cactus":
            drawCactusDecor(decor);
            break;
        case "ore_coal":
        case "ore_iron":
        case "ore_gold":
        case "ore_diamond":
            drawOre(decor);
            break;
        case "stalactite":
            drawStalactite(decor);
            break;
        case "crystal":
            drawCrystal(decor);
            break;
        case "lava_pool":
            drawLavaPool(decor);
            break;
        case "shell":
            drawShell(decor);
            break;
        case "starfish":
            drawStarfish(decor);
            break;
        case "seaweed":
            drawSeaweed(decor);
            break;
        case "boat":
            drawBoatDecor(decor);
            break;
        case "fire":
            drawFireDecor(decor);
            break;
        case "lava_fall":
            drawLavaFall(decor);
            break;
        case "soul_sand":
            drawSoulSand(decor);
            break;
        case "nether_wart":
            drawNetherWart(decor);
            break;
        case "basalt":
            drawBasalt(decor);
            break;
        default:
            break;
    }
}

function drawBush(bush) {
    const x = bush.x;
    const y = bush.y;
    ctx.fillStyle = "#2E7D32";
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 10, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.ellipse(x + 12, y + 8, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (bush.variant === 1) {
        ctx.fillStyle = "#2E7D32";
        ctx.beginPath();
        ctx.ellipse(x + 22, y + 12, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (bush.variant === 2) {
        ctx.fillStyle = "#FF1744";
        ctx.fillRect(x + 10, y + 5, 3, 3);
        ctx.fillRect(x + 18, y + 7, 3, 3);
    }
}

function drawFlower(flower) {
    const x = flower.x;
    const y = flower.y;
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(x + 5, y + 8, 2, 10);
    ctx.fillStyle = flower.color;
    for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i;
        const px = x + 6 + Math.cos(angle) * 4;
        const py = y + 6 + Math.sin(angle) * 4;
        ctx.fillRect(px, py, 4, 4);
    }
    ctx.fillStyle = "#FFEB3B";
    ctx.fillRect(x + 5, y + 5, 3, 3);
}

function drawMushroom(mushroom) {
    const x = mushroom.x;
    const y = mushroom.y;
    ctx.fillStyle = "#F5F5DC";
    ctx.fillRect(x + 6, y + 8, 4, 12);
    ctx.fillStyle = mushroom.isRed ? "#D32F2F" : "#8D6E63";
    ctx.fillRect(x, y, 16, 10);
    ctx.fillRect(x + 2, y - 2, 12, 2);
    if (mushroom.isRed) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x + 4, y + 3, 3, 3);
        ctx.fillRect(x + 10, y + 5, 2, 2);
        ctx.fillRect(x + 7, y + 1, 2, 2);
    }
}

function drawVine(vine) {
    const x = vine.x;
    const y = vine.y;
    const sway = Math.sin(vine.animFrame * 0.05 + vine.swayOffset) * 3;
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segments = 5;
    for (let i = 1; i <= segments; i++) {
        const segY = y + (vine.height / segments) * i;
        const segX = x + sway * (i / segments);
        ctx.lineTo(segX, segY);
    }
    ctx.stroke();
    ctx.fillStyle = "#4CAF50";
    for (let i = 1; i < segments; i++) {
        const leafY = y + (vine.height / segments) * i;
        const leafX = x + sway * (i / segments);
        ctx.fillRect(leafX - 3, leafY, 6, 4);
    }
}

function drawIceSpike(spike) {
    const x = spike.x;
    const y = spike.y;
    const h = spike.height;
    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, "#E3F2FD");
    gradient.addColorStop(0.5, "#90CAF9");
    gradient.addColorStop(1, "#42A5F5");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 20, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 5);
    ctx.lineTo(x + 14, y + h / 2);
    ctx.lineTo(x + 10, y + h / 2);
    ctx.fill();
}

function drawSnowPile(pile) {
    const x = pile.x;
    const y = pile.y;
    const w = pile.width;
    const h = pile.height;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(200, 220, 255, 0.6)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 5, w / 2 - 3, h / 4, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawIceBlock(ice) {
    const x = ice.x;
    const y = ice.y;
    const w = ice.width;
    const h = ice.height;
    ctx.fillStyle = "#B3E5FC";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(x + 5, y + 5, w - 10, 10);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        const cx = x + Math.random() * w;
        const cy = y + Math.random() * h;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy);
        ctx.lineTo(cx + 5, cy);
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx, cy + 5);
        ctx.stroke();
    }
}

function drawDeadBush(bush) {
    const x = bush.x;
    const y = bush.y;
    ctx.strokeStyle = "#5D4037";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 30);
    ctx.lineTo(x + 12, y + 15);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 18);
    ctx.lineTo(x + 5, y + 10);
    ctx.moveTo(x + 5, y + 10);
    ctx.lineTo(x + 3, y + 5);
    ctx.moveTo(x + 12, y + 20);
    ctx.lineTo(x + 20, y + 12);
    ctx.moveTo(x + 20, y + 12);
    ctx.lineTo(x + 23, y + 8);
    ctx.stroke();
}

function drawRock(rock) {
    const x = rock.x;
    const y = rock.y;
    const w = rock.width;
    const h = rock.height;
    ctx.fillStyle = "#9E9E9E";
    if (rock.shape === 0) {
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (rock.shape === 1) {
        ctx.fillRect(x, y, w, h);
    } else {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, y);
        ctx.lineTo(x + w * 0.8, y);
        ctx.lineTo(x + w, y + h * 0.6);
        ctx.lineTo(x + w * 0.7, y + h);
        ctx.lineTo(x + w * 0.3, y + h);
        ctx.lineTo(x, y + h * 0.5);
        ctx.closePath();
        ctx.fill();
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(x + 5, y + h - 5, w - 10, 5);
}

function drawBones(bones) {
    const x = bones.x;
    const y = bones.y;
    ctx.strokeStyle = "#E0E0E0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + 6);
    ctx.lineTo(x + 30, y + 6);
    ctx.stroke();
    ctx.fillStyle = "#EEEEEE";
    ctx.beginPath();
    ctx.arc(x + 4, y + 6, 4, 0, Math.PI * 2);
    ctx.arc(x + 26, y + 6, 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawCactusDecor(cactus) {
    const x = cactus.x;
    const y = cactus.y;
    const h = cactus.height;
    ctx.fillStyle = "#2E7D32";
    ctx.fillRect(x + 4, y, 12, h);
    ctx.fillStyle = "#1B5E20";
    for (let i = 0; i < h; i += 10) {
        ctx.fillRect(x + 2, y + i, 2, 4);
        ctx.fillRect(x + 16, y + i + 5, 2, 4);
    }
    if (h > 50) {
        ctx.fillStyle = "#2E7D32";
        ctx.fillRect(x, y + 20, 8, 15);
        ctx.fillRect(x + 12, y + 35, 8, 15);
    }
}

function drawOre(ore) {
    const x = ore.x;
    const y = ore.y;
    ctx.fillStyle = "#757575";
    ctx.fillRect(x, y, 30, 30);
    ctx.fillStyle = ore.color;
    ctx.fillRect(x + 5, y + 8, 8, 8);
    ctx.fillRect(x + 15, y + 5, 10, 6);
    ctx.fillRect(x + 8, y + 18, 6, 8);
    if (ore.oreType === "diamond" || ore.oreType === "gold") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fillRect(x + 7, y + 10, 2, 2);
        ctx.fillRect(x + 18, y + 7, 2, 2);
    }
}

function drawStalactite(stal) {
    const x = stal.x;
    const y = stal.y;
    const h = stal.height;
    ctx.fillStyle = "#616161";
    ctx.beginPath();
    if (stal.direction === "down") {
        ctx.moveTo(x + 10, y);
        ctx.lineTo(x + 20, y + h);
        ctx.lineTo(x, y + h);
    } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20, y);
        ctx.lineTo(x + 10, y + h);
    }
    ctx.closePath();
    ctx.fill();
}

function drawCrystal(crystal) {
    const x = crystal.x;
    const y = crystal.y;
    const glow = 0.6 + Math.sin(crystal.animFrame * 0.1) * 0.2;
    ctx.fillStyle = `rgba(160, 255, 255, ${glow})`;
    ctx.beginPath();
    ctx.moveTo(x + 9, y);
    ctx.lineTo(x + 18, y + 16);
    ctx.lineTo(x + 9, y + 28);
    ctx.lineTo(x, y + 16);
    ctx.closePath();
    ctx.fill();
}

function drawLavaPool(pool) {
    const x = pool.x;
    const y = pool.y;
    const w = pool.width;
    const h = pool.height;
    const wave = Math.sin(pool.animFrame * 0.1) * 3;
    ctx.fillStyle = "#FF5722";
    ctx.fillRect(x, y + wave, w, h);
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(x + 5, y + 4 + wave, w - 10, 4);
}

function drawShell(shell) {
    const x = shell.x;
    const y = shell.y;
    ctx.fillStyle = "#FFE0B2";
    ctx.beginPath();
    ctx.arc(x + 8, y + 6, 6, Math.PI, 0);
    ctx.fill();
}

function drawStarfish(star) {
    const x = star.x;
    const y = star.y;
    ctx.fillStyle = "#FF9800";
    ctx.beginPath();
    ctx.moveTo(x + 9, y);
    ctx.lineTo(x + 12, y + 6);
    ctx.lineTo(x + 18, y + 7);
    ctx.lineTo(x + 13, y + 11);
    ctx.lineTo(x + 15, y + 18);
    ctx.lineTo(x + 9, y + 14);
    ctx.lineTo(x + 3, y + 18);
    ctx.lineTo(x + 5, y + 11);
    ctx.lineTo(x, y + 7);
    ctx.lineTo(x + 6, y + 6);
    ctx.closePath();
    ctx.fill();
}

function drawSeaweed(seaweed) {
    const x = seaweed.x;
    const y = seaweed.y;
    const sway = Math.sin(seaweed.animFrame * 0.05 + seaweed.swayOffset) * 4;
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + seaweed.height);
    ctx.lineTo(x + 5 + sway, y);
    ctx.stroke();
}

function drawBoatDecor(boat) {
    const x = boat.x;
    const y = boat.y;
    ctx.fillStyle = "#8D6E63";
    ctx.fillRect(x, y, boat.width, boat.height);
    ctx.fillStyle = "#6D4C41";
    ctx.fillRect(x + 4, y - 6, boat.width - 8, 6);
}

function drawFireDecor(fire) {
    const x = fire.x;
    const y = fire.y;
    const flicker = Math.sin(fire.animFrame * 0.2) * 2;
    ctx.fillStyle = "#FF5722";
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 24);
    ctx.lineTo(x + 12, y + 24);
    ctx.lineTo(x + 9, y + 6 + flicker);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#FFC107";
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 20);
    ctx.lineTo(x + 12, y + 20);
    ctx.lineTo(x + 9, y + 10 + flicker);
    ctx.closePath();
    ctx.fill();
}

function drawLavaFall(fall) {
    const x = fall.x;
    const y = fall.y;
    const h = fall.height;
    const wobble = Math.sin(fall.animFrame * 0.1) * 2;
    ctx.fillStyle = "#FF7043";
    ctx.fillRect(x + wobble, y, fall.width, h);
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(x + wobble + 2, y + 10, fall.width - 4, 6);
}

function drawSoulSand(sand) {
    const x = sand.x;
    const y = sand.y;
    const w = sand.width;
    ctx.fillStyle = "#5D4037";
    ctx.fillRect(x, y, w, sand.height);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(x + 4, y + 2, w - 8, 4);
}

function drawNetherWart(wart) {
    const x = wart.x;
    const y = wart.y;
    ctx.fillStyle = "#B71C1C";
    ctx.fillRect(x, y, 12, 10);
    ctx.fillStyle = "#D32F2F";
    ctx.fillRect(x + 2, y + 2, 8, 4);
}

function drawBasalt(basalt) {
    const x = basalt.x;
    const y = basalt.y;
    ctx.fillStyle = "#424242";
    ctx.fillRect(x, y, basalt.width, basalt.height);
    ctx.fillStyle = "#303030";
    ctx.fillRect(x + 4, y + 6, basalt.width - 8, 6);
}

function drawParticle(p) {
    if (p.type === "snowflake") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if (p.type === "leaf") {
        ctx.fillStyle = p.color || "#7CB342";
        ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if (p.type === "dust") {
        ctx.fillStyle = "rgba(210, 180, 120, 0.5)";
        ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if (p.type === "ember") {
        ctx.fillStyle = "rgba(255, 140, 0, 0.8)";
        ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if (p.type === "bubble") {
        ctx.strokeStyle = "rgba(173, 216, 230, 0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
    } else if (p.type === "sparkle") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if (p.type === "rain") {
        ctx.strokeStyle = "rgba(120, 170, 255, 0.8)";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.velX, p.y + p.size);
        ctx.stroke();
    }
}

function drawBackground(biome) {
    const ambient = biome.effects?.ambient || "#87CEEB";
    ctx.fillStyle = ambient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const parallaxX = cameraX * 0.2;
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    for (let i = 0; i < 3; i++) {
        const mx = -parallaxX + i * 400;
        ctx.beginPath();
        ctx.moveTo(mx, canvas.height - 200);
        ctx.lineTo(mx + 200, canvas.height - 320);
        ctx.lineTo(mx + 400, canvas.height - 200);
        ctx.closePath();
        ctx.fill();
    }

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (let i = 0; i < 4; i++) {
        const cx = (i * 220 + (cameraX * 0.4) % 220) - 100;
        ctx.beginPath();
        ctx.arc(cx, 80, 30, 0, Math.PI * 2);
        ctx.arc(cx + 40, 90, 20, 0, Math.PI * 2);
        ctx.arc(cx + 70, 80, 26, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = "rgba(255, 215, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(canvas.width - 80, 60, 24, 0, Math.PI * 2);
    ctx.fill();

    if (biome.effects?.darkness) {
        ctx.fillStyle = `rgba(0,0,0,${biome.effects.darkness})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (weatherState.type === "fog") {
        ctx.fillStyle = "rgba(200,200,200,0.25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (weatherState.type === "sandstorm") {
        ctx.fillStyle = "rgba(210,180,140,0.35)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (weatherState.type === "rain") {
        ctx.fillStyle = "rgba(0,0,50,0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (weatherState.type === "snow") {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (biome.effects?.heatWave) {
        ctx.strokeStyle = "rgba(255, 200, 120, 0.25)";
        for (let y = 120; y < canvas.height; y += 40) {
            ctx.beginPath();
            for (let x = 0; x <= canvas.width; x += 40) {
                const offset = Math.sin((x + gameFrame) * 0.02 + y * 0.05) * 6;
                ctx.lineTo(x, y + offset);
            }
            ctx.stroke();
        }
    }
}

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

function parseKeyCodes(raw) {
    if (!raw) return null;
    const parts = String(raw).split(",").map(s => s.trim()).filter(Boolean);
    if (parts.length !== 5) return null;
    return parts;
}

class Entity {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.remove = false;
    }
}

class Platform extends Entity {
    constructor(x, y, w, h, type) {
        super(x, y, w, h);
        this.type = type;
    }
}

class Tree extends Entity {
    constructor(x, y, type) {
        const h = 140;
        const w = 80;
        super(x, y - h, w, h);
        this.type = type;
        this.hp = 5;
        this.shake = 0;
    }
    hit() {
        this.hp--;
        this.shake = 8;
        if (this.hp <= 0) {
            this.remove = true;
            dropItem("stick", this.x + this.width / 2, this.y + this.height - 20);
        }
    }
}

class Chest extends Entity {
    constructor(x, y) {
        super(x, y - 40, 40, 40);
        this.opened = false;
    }
    open() {
        if (this.opened) return;
        this.opened = true;
        const diff = getDifficultyState();
        const lootCfg = getLootConfig();
        const rarity = pickChestRarity(lootCfg.chestRarities, diff.chestRareBoost);
        const lootTable = lootCfg.chestTables[rarity] || lootCfg.chestTables.common || [];
        const baseTwo = Number(lootCfg.chestRolls.twoDropChance ?? 0.45);
        const baseThree = Number(lootCfg.chestRolls.threeDropChance ?? 0.15);
        const rollBonus = Number(diff.chestRollBonus) || 0;
        const twoChance = clamp(baseTwo + rollBonus, 0.1, 0.9);
        const threeChance = clamp(baseThree + rollBonus * 0.6, 0.05, 0.6);
        const rollCount = Math.random() < threeChance ? 3 : Math.random() < twoChance ? 2 : 1;
        const drops = [];
        for (let i = 0; i < rollCount; i++) {
            const picked = pickWeightedLoot(lootTable);
            if (!picked) continue;
            const count = picked.min + Math.floor(Math.random() * (picked.max - picked.min + 1));
            drops.push({ item: picked.item, count });
        }
        drops.forEach(d => {
            if (d.item === "hp") {
                healPlayer(d.count);
                return;
            }
            if (d.item === "max_hp") {
                playerMaxHp = Math.min(10, playerMaxHp + d.count);
                playerHp = Math.min(playerMaxHp, playerHp + d.count);
                updateHpUI();
                return;
            }
            if (d.item === "score") {
                addScore(d.count);
                return;
            }
            if (!inventory[d.item] && inventory[d.item] !== 0) inventory[d.item] = 0;
            inventory[d.item] += d.count;
        });
        updateHpUI();
        updateInventoryUI();
        const summary = drops.map(d => `${ITEM_ICONS[d.item] || "✨"}x${d.count}`).join(" ");
        const rarityLabel = { common: "普通", rare: "稀有", epic: "史诗", legendary: "传说" }[rarity] || "普通";
        showFloatingText("🎁", this.x + 10, this.y - 30);
        if (summary) showToast(`宝箱(${rarityLabel}): ${summary}`);
    }
}

class Item extends Entity {
    constructor(x, y, wordObj) {
        super(x, y, 30, 30);
        this.wordObj = wordObj;
        this.collected = false;
        this.floatY = 0;
    }
}

const decorationPool = Object.create(null);

function getPooledDecoration(type, resetFn, createFn) {
    const pool = decorationPool[type] || (decorationPool[type] = []);
    const reused = pool.find(d => d.remove);
    if (reused) {
        resetFn(reused);
        reused.remove = false;
        return reused;
    }
    const fresh = createFn();
    pool.push(fresh);
    return fresh;
}

function spawnDecoration(type, resetFn, createFn) {
    if (decorations.length >= MAX_DECORATIONS_ONSCREEN) return;
    const decor = getPooledDecoration(type, resetFn, createFn);
    decorations.push(decor);
}

class Decoration extends Entity {
    constructor(x, y, type, biome) {
        super(x, y, 0, 0);
        this.type = type;
        this.biome = biome;
        this.interactive = false;
        this.collectible = false;
        this.harmful = false;
        this.animated = false;
        this.animFrame = 0;
    }

    resetBase(x, y, type, biome) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.biome = biome;
        this.remove = false;
        this.animFrame = 0;
    }

    update() {
        if (this.animated) this.animFrame++;
    }

    interact() {
    }

    onCollision() {
    }
}

class Bush extends Decoration {
    constructor(x, y) {
        super(x, y, "bush", "forest");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "bush", "forest");
        this.width = 30;
        this.height = 20;
        this.variant = Math.floor(Math.random() * 3);
    }
}

class Flower extends Decoration {
    constructor(x, y) {
        super(x, y, "flower", "forest");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "flower", "forest");
        this.width = 12;
        this.height = 18;
        this.collectible = true;
        this.color = ["#FF1744", "#FFEB3B", "#2196F3", "#9C27B0", "#FFFFFF"][Math.floor(Math.random() * 5)];
    }
    interact() {
        inventory.flower = (inventory.flower || 0) + 1;
        this.remove = true;
        showFloatingText("🌸 +1", this.x, this.y);
        updateInventoryUI();
    }
}

class Mushroom extends Decoration {
    constructor(x, y) {
        super(x, y, "mushroom", "forest");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "mushroom", "forest");
        this.width = 16;
        this.height = 20;
        this.collectible = true;
        this.isRed = Math.random() > 0.5;
    }
    interact() {
        inventory.mushroom = (inventory.mushroom || 0) + 1;
        this.remove = true;
        showFloatingText("🍄 +1", this.x, this.y);
        updateInventoryUI();
    }
}

class Vine extends Decoration {
    constructor(x, y, height) {
        super(x, y, "vine", "forest");
        this.reset(x, y, height);
    }
    reset(x, y, height) {
        this.resetBase(x, y, "vine", "forest");
        this.width = 4;
        this.height = height || (30 + Math.random() * 40);
        this.animated = true;
        this.swayOffset = Math.random() * Math.PI * 2;
    }
}

class IceSpike extends Decoration {
    constructor(x, y) {
        super(x, y, "ice_spike", "snow");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "ice_spike", "snow");
        this.width = 20;
        this.height = 40 + Math.random() * 40;
    }
}

class SnowPile extends Decoration {
    constructor(x, y, size = "medium") {
        super(x, y, "snow_pile", "snow");
        this.reset(x, y, size);
    }
    reset(x, y, size = "medium") {
        this.resetBase(x, y, "snow_pile", "snow");
        this.size = size;
        this.width = size === "small" ? 20 : size === "medium" ? 35 : 50;
        this.height = size === "small" ? 10 : size === "medium" ? 18 : 25;
        this.interactive = true;
    }
    onCollision(entity) {
        if (entity === player && entity.grounded) {
            entity.velX *= 0.9;
        }
    }
}

class IceBlock extends Decoration {
    constructor(x, y, width) {
        super(x, y, "ice_block", "snow");
        this.reset(x, y, width);
    }
    reset(x, y, width) {
        this.resetBase(x, y, "ice_block", "snow");
        this.width = width || 80;
        this.height = 50;
        this.interactive = true;
        this.slippery = true;
    }
    onCollision(entity) {
        if (this.slippery && entity.grounded) {
            entity.velX *= 1.2;
        }
    }
}

class DeadBush extends Decoration {
    constructor(x, y) {
        super(x, y, "dead_bush", "desert");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "dead_bush", "desert");
        this.width = 25;
        this.height = 30;
    }
}

class Rock extends Decoration {
    constructor(x, y, size = "medium") {
        super(x, y, "rock", "desert");
        this.reset(x, y, size);
    }
    reset(x, y, size = "medium") {
        this.resetBase(x, y, "rock", "desert");
        this.size = size;
        this.width = size === "small" ? 20 : size === "medium" ? 35 : 50;
        this.height = size === "small" ? 15 : size === "medium" ? 25 : 35;
        this.shape = Math.floor(Math.random() * 3);
    }
}

class BoneDecor extends Decoration {
    constructor(x, y) {
        super(x, y, "bones", "desert");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "bones", "desert");
        this.width = 30;
        this.height = 12;
    }
}

class CactusDecor extends Decoration {
    constructor(x, y, height) {
        super(x, y, "cactus", "desert");
        this.reset(x, y, height);
    }
    reset(x, y, height) {
        this.resetBase(x, y, "cactus", "desert");
        this.width = 20;
        this.height = height || (40 + Math.random() * 60);
        this.harmful = true;
        this.damage = 5;
    }
    onCollision(entity) {
        if (this.harmful && rectIntersect(entity.x, entity.y, entity.width, entity.height, this.x, this.y, this.width, this.height)) {
            damagePlayer(this.damage, this.x, 40);
            showFloatingText("🌵 -5", entity.x, entity.y - 20);
        }
    }
}

class Ore extends Decoration {
    constructor(x, y, oreType) {
        super(x, y, `ore_${oreType}`, "mountain");
        this.reset(x, y, oreType);
    }
    reset(x, y, oreType) {
        this.resetBase(x, y, `ore_${oreType}`, "mountain");
        this.oreType = oreType;
        this.width = 30;
        this.height = 30;
        this.collectible = true;
        this.hp = { coal: 3, iron: 5, gold: 7, diamond: 10 }[oreType];
        this.color = { coal: "#424242", iron: "#B0BEC5", gold: "#FFD700", diamond: "#00BCD4" }[oreType];
    }
    interact() {
        if (inventory.iron_pickaxe <= 0) {
            showToast("❌ 需要铁镐");
            return;
        }
        this.hp--;
        showFloatingText(`⛏️ ${this.hp}`, this.x, this.y - 20);
        if (this.hp <= 0) {
            inventory[this.oreType] = (inventory[this.oreType] || 0) + 1;
            this.remove = true;
            showFloatingText(`✨ +1 ${this.oreType}`, this.x, this.y);
            updateInventoryUI();
        }
    }
}

class Stalactite extends Decoration {
    constructor(x, y, direction = "down") {
        super(x, y, "stalactite", "mountain");
        this.reset(x, y, direction);
    }
    reset(x, y, direction = "down") {
        this.resetBase(x, y, "stalactite", "mountain");
        this.direction = direction;
        this.width = 20;
        this.height = 30 + Math.random() * 40;
    }
}

class Crystal extends Decoration {
    constructor(x, y) {
        super(x, y, "crystal", "mountain");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "crystal", "mountain");
        this.width = 18;
        this.height = 28;
        this.animated = true;
    }
}

class LavaPool extends Decoration {
    constructor(x, y, width, biome = "mountain") {
        super(x, y, "lava_pool", biome);
        this.reset(x, y, width, biome);
    }
    reset(x, y, width, biome = "mountain") {
        this.resetBase(x, y, "lava_pool", biome);
        this.width = width || (60 + Math.random() * 80);
        this.height = 16;
        this.harmful = true;
        this.damage = 2;
        this.animated = true;
    }
    onCollision() {
        damagePlayer(this.damage, this.x, 30);
    }
}

class Shell extends Decoration {
    constructor(x, y) {
        super(x, y, "shell", "ocean");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "shell", "ocean");
        this.width = 16;
        this.height = 10;
        this.collectible = true;
    }
    interact() {
        inventory.shell = (inventory.shell || 0) + 1;
        this.remove = true;
        showFloatingText("🐚 +1", this.x, this.y);
        updateInventoryUI();
    }
}

class Starfish extends Decoration {
    constructor(x, y) {
        super(x, y, "starfish", "ocean");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "starfish", "ocean");
        this.width = 18;
        this.height = 18;
        this.collectible = true;
    }
    interact() {
        inventory.starfish = (inventory.starfish || 0) + 1;
        this.remove = true;
        showFloatingText("⭐ +1", this.x, this.y);
        updateInventoryUI();
    }
}

class Seaweed extends Decoration {
    constructor(x, y) {
        super(x, y, "seaweed", "ocean");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "seaweed", "ocean");
        this.width = 10;
        this.height = 30 + Math.random() * 20;
        this.animated = true;
        this.swayOffset = Math.random() * Math.PI * 2;
    }
}

class BoatDecor extends Decoration {
    constructor(x, y) {
        super(x, y, "boat", "ocean");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "boat", "ocean");
        this.width = 40;
        this.height = 16;
    }
}

class FireDecor extends Decoration {
    constructor(x, y) {
        super(x, y, "fire", "nether");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "fire", "nether");
        this.width = 12;
        this.height = 24;
        this.harmful = true;
        this.damage = 2;
        this.animated = true;
    }
    onCollision() {
        damagePlayer(this.damage, this.x, 20);
    }
}

class LavaFall extends Decoration {
    constructor(x, y) {
        super(x, y, "lava_fall", "nether");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "lava_fall", "nether");
        this.width = 12;
        this.height = 60 + Math.random() * 60;
        this.harmful = true;
        this.damage = 3;
        this.animated = true;
    }
    onCollision() {
        damagePlayer(this.damage, this.x, 20);
    }
}

class SoulSand extends Decoration {
    constructor(x, y, width) {
        super(x, y, "soul_sand", "nether");
        this.reset(x, y, width);
    }
    reset(x, y, width) {
        this.resetBase(x, y, "soul_sand", "nether");
        this.width = width || 50;
        this.height = 10;
        this.interactive = true;
    }
    onCollision(entity) {
        if (entity === player && entity.grounded) {
            entity.velX *= 0.8;
        }
    }
}

class NetherWart extends Decoration {
    constructor(x, y) {
        super(x, y, "nether_wart", "nether");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "nether_wart", "nether");
        this.width = 12;
        this.height = 10;
    }
}

class Basalt extends Decoration {
    constructor(x, y) {
        super(x, y, "basalt", "nether");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "basalt", "nether");
        this.width = 25;
        this.height = 40;
    }
}

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.velX = 0;
        this.velY = 0;
        this.life = 100;
        this.remove = false;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.remove = false;
    }

    update() {
        this.x += this.velX;
        this.y += this.velY;
        this.life--;
        if (this.life <= 0) this.remove = true;
    }
}

class Snowflake extends Particle {
    constructor(x, y) {
        super(x, y, "snowflake");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = (Math.random() - 0.5) * 0.5;
        this.velY = 0.5 + Math.random() * 1;
        this.size = 2 + Math.random() * 3;
        this.life = 200;
    }
    update() {
        super.update();
        this.velX += Math.sin(this.life * 0.05) * 0.02;
    }
}

class LeafParticle extends Particle {
    constructor(x, y) {
        super(x, y, "leaf");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = (Math.random() - 0.5) * 0.6;
        this.velY = 0.4 + Math.random() * 0.6;
        this.size = 3 + Math.random() * 3;
        this.life = 180;
        this.color = ["#7CB342", "#558B2F", "#9CCC65"][Math.floor(Math.random() * 3)];
    }
}

class DustParticle extends Particle {
    constructor(x, y) {
        super(x, y, "dust");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = -0.5 + Math.random() * 1;
        this.velY = 0.2 + Math.random() * 0.4;
        this.size = 2 + Math.random() * 2;
        this.life = 140;
    }
}

class EmberParticle extends Particle {
    constructor(x, y) {
        super(x, y, "ember");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = (Math.random() - 0.5) * 0.3;
        this.velY = -0.6 - Math.random() * 0.6;
        this.size = 2 + Math.random() * 2;
        this.life = 120;
    }
}

class BubbleParticle extends Particle {
    constructor(x, y) {
        super(x, y, "bubble");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = (Math.random() - 0.5) * 0.2;
        this.velY = -0.4 - Math.random() * 0.4;
        this.size = 2 + Math.random() * 2;
        this.life = 120;
    }
}

class SparkleParticle extends Particle {
    constructor(x, y) {
        super(x, y, "sparkle");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = (Math.random() - 0.5) * 0.2;
        this.velY = -0.2 + Math.random() * 0.4;
        this.size = 2 + Math.random() * 3;
        this.life = 100;
    }
}

class RainParticle extends Particle {
    constructor(x, y) {
        super(x, y, "rain");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = -0.3 + Math.random() * 0.6;
        this.velY = 3 + Math.random() * 2;
        this.size = 6;
        this.life = 80;
    }
}

const ENEMY_STATS = {
    zombie: {
        hp: 20,
        speed: 0.55,
        damage: 10,
        attackType: "melee",
        color: "#00AA00",
        drops: ["rotten_flesh"],
        scoreValue: 10,
        size: { w: 32, h: 48 }
    },
    spider: {
        hp: 16,
        speed: 1.2,
        damage: 8,
        attackType: "melee",
        color: "#4A0E0E",
        drops: ["string"],
        scoreValue: 12,
        size: { w: 44, h: 24 }
    },
    creeper: {
        hp: 20,
        speed: 0.4,
        damage: 40,
        attackType: "explode",
        color: "#00AA00",
        drops: ["gunpowder"],
        scoreValue: 18,
        size: { w: 32, h: 48 }
    },
    skeleton: {
        hp: 15,
        speed: 0.5,
        damage: 12,
        attackType: "ranged",
        color: "#C0C0C0",
        drops: ["arrow"],
        scoreValue: 20,
        size: { w: 32, h: 48 }
    },
    enderman: {
        hp: 40,
        speed: 1.4,
        damage: 25,
        attackType: "teleport",
        color: "#1A0033",
        drops: ["ender_pearl"],
        scoreValue: 35,
        size: { w: 32, h: 64 }
    },
    piglin: {
        hp: 60,
        speed: 1.1,
        damage: 20,
        attackType: "melee",
        color: "#C68642",
        drops: ["diamond"],
        scoreValue: 28,
        size: { w: 32, h: 52 }
    },
    ender_dragon: {
        hp: 200,
        speed: 1.5,
        damage: 30,
        attackType: "boss",
        color: "#000000",
        drops: ["dragon_egg"],
        scoreValue: 200,
        size: { w: 120, h: 60 }
    }
};

class Projectile extends Entity {
    constructor(x, y, targetX, targetY, speed = 3, faction = "enemy") {
        super(x, y, 8, 8);
        const angle = Math.atan2(targetY - y, targetX - x);
        this.velX = Math.cos(angle) * speed;
        this.velY = Math.sin(angle) * speed;
        this.lifetime = 180;
        this.damage = 12;
        this.faction = faction;
    }

    reset(x, y, targetX, targetY, speed) {
        this.x = x;
        this.y = y;
        const angle = Math.atan2(targetY - y, targetX - x);
        this.velX = Math.cos(angle) * speed;
        this.velY = Math.sin(angle) * speed;
        this.lifetime = 180;
        this.remove = false;
    }

    update(playerRef, golemList, enemyList) {
        this.x += this.velX;
        this.y += this.velY;
        this.lifetime--;

        if (this.faction === "enemy") {
            if (rectIntersect(this.x, this.y, this.width, this.height, playerRef.x, playerRef.y, playerRef.width, playerRef.height)) {
                damagePlayer(this.damage, this.x);
                this.remove = true;
                return;
            }
            for (const g of golemList) {
                if (rectIntersect(this.x, this.y, this.width, this.height, g.x, g.y, g.width, g.height)) {
                    g.takeDamage(this.damage);
                    this.remove = true;
                    return;
                }
            }
        } else if (this.faction === "golem") {
            for (const e of enemyList) {
                if (!e.remove && rectIntersect(this.x, this.y, this.width, this.height, e.x, e.y, e.width, e.height)) {
                    e.takeDamage(this.damage);
                    showFloatingText(`⚔️ ${this.damage}`, e.x, e.y - 10);
                    this.remove = true;
                    return;
                }
            }
        } else if (this.faction === "player") {
            for (const e of enemyList) {
                if (!e.remove && rectIntersect(this.x, this.y, this.width, this.height, e.x, e.y, e.width, e.height)) {
                    e.takeDamage(this.damage);
                    showFloatingText(`-${this.damage}`, e.x, e.y - 10);
                    this.remove = true;
                    return;
                }
            }
        }

        if (this.lifetime <= 0) this.remove = true;
    }
}

class Arrow extends Projectile {
    constructor(x, y, targetX, targetY, faction = "enemy", speed = 4, damage = 12) {
        super(x, y, targetX, targetY, speed, faction);
        this.damage = damage;
        this.width = 12;
        this.height = 4;
    }
}

class Snowball extends Projectile {
    constructor(x, y, targetX, targetY) {
        super(x, y, targetX, targetY, 3, "golem");
        this.damage = 8;
    }
}

class DragonFireball extends Projectile {
    constructor(x, y, targetX, targetY) {
        super(x, y, targetX, targetY, 2, "enemy");
        this.damage = 30;
        this.width = 16;
        this.height = 16;
    }
}

class Enemy extends Entity {
    constructor(x, y, type = "zombie", range = 120) {
        const stats = ENEMY_STATS[type] || ENEMY_STATS.zombie;
        const size = stats.size || { w: 32, h: 32 };
        const diff = getDifficultyState();
        super(x, y, size.w, size.h);
        this.type = type;
        this.startX = x;
        this.range = range;
        this.hp = Math.max(1, Math.round(stats.hp * diff.enemyHpMult));
        this.maxHp = this.hp;
        this.speed = stats.speed;
        this.damage = Math.max(1, Math.round(stats.damage * diff.enemyDamageMult));
        this.attackType = stats.attackType;
        this.color = stats.color;
        this.drops = stats.drops || [];
        this.scoreValue = Math.max(1, Math.round((stats.scoreValue || gameConfig.scoring.enemy) * diff.scoreMultiplier));
        this.dir = 1;
        this.state = "patrol";
        this.attackCooldown = 0;
        this.explodeTimer = 0;
        this.teleportCooldown = 0;
        this.phaseChanged = false;
        this.velY = 0;
        this.grounded = false;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) this.die();
    }

    die() {
        this.remove = true;
        this.y = 1000;
        if (Math.random() < 0.6 && this.drops.length) {
            const drop = this.drops[Math.floor(Math.random() * this.drops.length)];
            dropItem(drop, this.x, this.y);
        }
        addScore(this.scoreValue);
        recordEnemyKill(this.type);
    }

    update(playerRef) {
        if (this.remove || this.y > 900) return;
        switch (this.type) {
            case "zombie":
                this.updateZombie(playerRef);
                break;
            case "spider":
                this.updateSpider(playerRef);
                break;
            case "creeper":
                this.updateCreeper(playerRef);
                break;
            case "skeleton":
                this.updateSkeleton(playerRef);
                break;
            case "enderman":
                this.updateEnderman(playerRef);
                break;
            case "ender_dragon":
                this.updateEnderDragon(playerRef);
                break;
            default:
                this.updateBasic();
        }

        this.applyGravity();
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.teleportCooldown > 0) this.teleportCooldown--;
    }

    applyGravity() {
        if (this.type === "ender_dragon") return;
        this.velY += gameConfig.physics.gravity;
        this.y += this.velY;
        this.grounded = false;

        for (const p of platforms) {
            const dir = colCheck(this, p);
            if (dir === "b") {
                this.grounded = true;
                this.y = p.y - this.height;
                this.velY = 0;
            } else if (dir === "t") {
                this.velY = 0;
            }
        }

        if (this.y > fallResetY) {
            this.remove = true;
        }
    }

    updateBasic() {
        this.x += this.speed * this.dir;
        if (this.x > this.startX + this.range || this.x < this.startX) this.dir *= -1;
    }

    updateZombie(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        if (dist < 200) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
        } else {
            this.state = "patrol";
            this.updateBasic();
        }
    }

    updateSpider(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        if (dist < 240) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
        } else {
            this.state = "patrol";
            this.updateBasic();
        }
    }

    updateCreeper(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        if (dist < 60) {
            this.state = "exploding";
            if (this.explodeTimer === 0) this.explodeTimer = 90;
            this.explodeTimer--;
            if (this.explodeTimer <= 0) {
                if (Math.abs(this.x - playerRef.x) < 120 && Math.abs(this.y - playerRef.y) < 120) {
                    damagePlayer(this.damage, this.x);
                    showFloatingText("💥 爆炸!", this.x, this.y);
                }
                this.die();
            }
        } else if (dist < 200) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
            this.explodeTimer = 0;
        } else {
            this.state = "patrol";
            this.explodeTimer = 0;
            this.updateBasic();
        }
    }

    updateSkeleton(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        if (dist < 80) {
            this.x += (playerRef.x > this.x ? -1 : 1) * this.speed;
        } else if (dist > 150 && dist < 300) {
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
        }

        if (this.attackCooldown === 0 && dist < 260) {
            const arrow = projectilePool.getArrow(this.x, this.y, playerRef.x, playerRef.y);
            if (!projectiles.includes(arrow)) projectiles.push(arrow);
            this.attackCooldown = 120;
        }
    }

    updateEnderman(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        if (dist > 300 && this.teleportCooldown === 0 && Math.random() < 0.02) {
            this.x = playerRef.x + (Math.random() > 0.5 ? 120 : -120);
            this.y = playerRef.y;
            this.teleportCooldown = 180;
            showFloatingText("⚡", this.x, this.y);
        } else if (dist < 150) {
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
        } else {
            this.updateBasic();
        }
    }

    updateEnderDragon(playerRef) {
        const phase = this.hp > this.maxHp * 0.5 ? 1 : 2;
        if (phase === 2 && !this.phaseChanged) {
            this.phaseChanged = true;
            this.speed *= 1.5;
            showToast("⚠️ 末影龙进入狂暴状态！");
        }

        this.x += this.speed * this.dir;
        this.y = 100 + Math.sin(gameFrame * 0.02) * 50;
        if (this.x > this.startX + 400 || this.x < this.startX - 200) this.dir *= -1;

        if (this.attackCooldown === 0 && Math.random() < 0.02) {
            const fireball = projectilePool.getFireball(this.x + 40, this.y + 20, playerRef.x, playerRef.y);
            if (!projectiles.includes(fireball)) projectiles.push(fireball);
            this.attackCooldown = phase === 1 ? 120 : 60;
        }

        if (phase === 2 && Math.random() < 0.005) {
            this.state = "diving";
            this.targetDiveY = 400;
        }

        if (this.state === "diving") {
            this.y += 5;
            if (this.y >= this.targetDiveY) {
                this.state = "patrol";
                if (Math.abs(this.x - playerRef.x) < 150) {
                    damagePlayer(this.damage, this.x, 150);
                    showFloatingText("💥 龙息冲击!", playerRef.x, playerRef.y);
                }
            }
        }
    }
}

class Golem extends Entity {
    constructor(x, y, type = "iron") {
        super(x, y, type === "iron" ? 40 : 32, type === "iron" ? 48 : 40);
        const config = getGolemConfig();
        const stats = type === "iron" ? config.ironGolem : config.snowGolem;
        this.type = type;
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.damage = stats.damage;
        this.speed = stats.speed;
        this.followDelay = 50;
        this.attackCooldown = 0;
        this.attackRange = type === "iron" ? 80 : 120;
        this.velX = 0;
        this.velY = 0;
        this.grounded = false;
        this.facingRight = true;
        this.stuckCounter = 0;
        this.lastX = x;
    }

    updateFollow(playerHistory, platformsRef) {
        if (playerHistory.length < this.followDelay) return;
        const target = playerHistory[playerHistory.length - this.followDelay];
        const dx = target.x - this.x;
        if (Math.abs(dx) > 30) {
            this.velX = Math.sign(dx) * this.speed;
            this.facingRight = dx > 0;
        } else {
            this.velX *= 0.8;
        }
        if (this.grounded && this.shouldJump(platformsRef)) {
            this.velY = -10;
        }
    }

    shouldJump(platformsRef) {
        const checkX = this.facingRight ? this.x + this.width + 5 : this.x - 5;
        const checkY = this.y + this.height;
        for (const p of platformsRef) {
            if (p.y < checkY && p.y > this.y - 50) {
                if (checkX > p.x && checkX < p.x + p.width) {
                    return true;
                }
            }
        }
        return false;
    }

    updateAttack(enemyList) {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            return;
        }
        let nearest = null;
        let minDist = this.attackRange;
        for (const e of enemyList) {
            if (e.remove || e.y > 900) continue;
            const dist = Math.abs(this.x - e.x);
            const vertDist = Math.abs(this.y - e.y);
            if (dist < minDist && vertDist < 100) {
                nearest = e;
                minDist = dist;
            }
        }
        if (nearest) {
            if (this.type === "snow") {
                const snowball = projectilePool.getSnowball(this.x + this.width / 2, this.y + this.height / 2, nearest.x, nearest.y);
                if (!projectiles.includes(snowball)) projectiles.push(snowball);
            } else {
                nearest.takeDamage(this.damage);
            }
            this.attackCooldown = 60;
            showFloatingText(`⚔️ ${this.damage}`, nearest.x, nearest.y - 20);
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.remove = true;
            if (Math.random() < 0.5) {
                const dropType = this.type === "iron" ? "iron" : "pumpkin";
                dropItem(dropType, this.x, this.y);
            }
        }
    }

    update(playerRef, playerHistory, enemyList, platformsRef) {
        this.updateFollow(playerHistory, platformsRef);
        this.velY += gameConfig.physics.gravity;
        this.grounded = false;

        for (const p of platformsRef) {
            const dir = colCheck(this, p);
            if (dir === "l" || dir === "r") this.velX = 0;
            else if (dir === "b") {
                this.grounded = true;
                this.y = p.y - this.height;
                this.velY = 0;
            } else if (dir === "t") {
                this.velY = 0;
            }
        }

        this.updateAttack(enemyList);

        this.x += this.velX;
        this.y += this.velY;

        if (this.y > fallResetY) this.remove = true;

        if (Math.abs(this.x - this.lastX) < 0.2) this.stuckCounter++;
        else this.stuckCounter = 0;
        this.lastX = this.x;

        if (this.stuckCounter > 180 && playerRef) {
            this.x = playerRef.x + (Math.random() > 0.5 ? 50 : -50);
            this.y = playerRef.y;
            this.stuckCounter = 0;
        }
    }
}

function wireSettingsModal() {
    const modal = document.getElementById("settings-modal");
    const btnOpen = document.getElementById("btn-settings");
    const btnClose = document.getElementById("btn-settings-close");
    const btnSave = document.getElementById("btn-settings-save");
    const btnResetProgress = document.getElementById("btn-reset-progress");
    const progressVocab = document.getElementById("progress-vocab");

    const optLearningMode = document.getElementById("opt-learning-mode");
    const optSpeech = document.getElementById("opt-speech");
    const optSpeechEn = document.getElementById("opt-speech-en");
    const optSpeechZh = document.getElementById("opt-speech-zh");
    const optUiScale = document.getElementById("opt-ui-scale");
    const optDeviceMode = document.getElementById("opt-device-mode");
    const optOrientationLock = document.getElementById("opt-orientation-lock");
    const optMotionScale = document.getElementById("opt-motion-scale");
    const optBiomeStep = document.getElementById("opt-biome-step");
    const optTouch = document.getElementById("opt-touch");
    const optNoRepeat = document.getElementById("opt-no-repeat");
    const optVocab = document.getElementById("opt-vocab");
    const optShowImage = document.getElementById("opt-show-image");
    const optKeys = document.getElementById("opt-keys");
    let resetArmed = false;
    let resetTimer = null;

    function fill() {
        if (optLearningMode) optLearningMode.checked = !!settings.learningMode;
        if (optSpeech) optSpeech.checked = !!settings.speechEnabled;
        if (optSpeechEn) optSpeechEn.value = String(settings.speechEnRate ?? 0.8);
        if (optSpeechZh) optSpeechZh.value = String(settings.speechZhRate ?? 0.9);
        if (optUiScale) optUiScale.value = String(settings.uiScale ?? 1.0);
        if (optDeviceMode) optDeviceMode.value = String(settings.deviceMode || "auto");
        if (optOrientationLock) optOrientationLock.value = String(settings.orientationLock || "auto");
        if (optMotionScale) optMotionScale.value = String(settings.motionScale ?? 1.25);
        if (optBiomeStep) optBiomeStep.value = String(settings.biomeSwitchStepScore ?? 200);
        if (optTouch) optTouch.checked = !!settings.touchControls;
        if (optNoRepeat) optNoRepeat.checked = !!settings.avoidWordRepeats;
        if (optShowImage) optShowImage.checked = !!settings.showWordImage;
        if (optVocab) optVocab.value = settings.vocabSelection || "auto";
        if (optKeys) optKeys.value = settings.keyCodes || [keyBindings.jump, keyBindings.attack, keyBindings.interact, keyBindings.switch, keyBindings.useDiamond].join(",");
        if (progressVocab) updateVocabProgressUI();
    }

    function open() {
        if (!modal) return;
        pausedByModal = !paused;
        paused = true;
        fill();
        modal.classList.add("visible");
        modal.setAttribute("aria-hidden", "false");
    }

    function close() {
        if (!modal) return;
        modal.classList.remove("visible");
        modal.setAttribute("aria-hidden", "true");
        if (pausedByModal) paused = false;
        pausedByModal = false;
    }

    function resetProgress() {
        resetVocabRotationAndProgress();
    }

    function save() {
        if (optLearningMode) settings.learningMode = !!optLearningMode.checked;
        if (optSpeech) settings.speechEnabled = !!optSpeech.checked;
        if (optSpeechEn) settings.speechEnRate = Number(optSpeechEn.value);
        if (optSpeechZh) settings.speechZhRate = Number(optSpeechZh.value);
        if (optUiScale) settings.uiScale = Number(optUiScale.value);
        if (optDeviceMode) settings.deviceMode = String(optDeviceMode.value || "auto");
        if (optOrientationLock) settings.orientationLock = String(optOrientationLock.value || "auto");
        if (optMotionScale) settings.motionScale = Number(optMotionScale.value);
        if (optBiomeStep) settings.biomeSwitchStepScore = Number(optBiomeStep.value);
        if (optTouch) settings.touchControls = !!optTouch.checked;
        if (optNoRepeat) settings.avoidWordRepeats = !!optNoRepeat.checked;
        if (optShowImage) settings.showWordImage = !!optShowImage.checked;
        if (optVocab) settings.vocabSelection = String(optVocab.value || "auto");
        if (optKeys) settings.keyCodes = String(optKeys.value || "");

        settings = normalizeSettings(settings);
        if (settings.deviceMode === "phone") settings.touchControls = true;
        const parsed = parseKeyCodes(settings.keyCodes);
        if (parsed) {
            keyBindings.jump = parsed[0];
            keyBindings.attack = parsed[1];
            keyBindings.interact = parsed[2];
            keyBindings.switch = parsed[3];
            keyBindings.useDiamond = parsed[4];
        }

        wordPicker = null;
        saveSettings();
        handleViewportChange();
        applyScreenModeFromSettings(true);
        if (player) {
            applyMotionToPlayer(player);
            applyBiomeEffectsToPlayer();
        }
        setActiveVocabPack(settings.vocabSelection || "auto");
        close();
    }

    if (btnOpen) btnOpen.addEventListener("click", open);
    if (btnClose) btnClose.addEventListener("click", close);
    if (btnSave) btnSave.addEventListener("click", save);
    if (btnResetProgress) {
        btnResetProgress.addEventListener("click", () => {
            if (!resetArmed) {
                resetArmed = true;
                btnResetProgress.innerText = "再点一次确认";
                if (resetTimer) clearTimeout(resetTimer);
                resetTimer = setTimeout(() => {
                    resetArmed = false;
                    btnResetProgress.innerText = "重置轮换";
                }, 2000);
                return;
            }
            resetArmed = false;
            if (resetTimer) clearTimeout(resetTimer);
            btnResetProgress.innerText = "重置轮换";
            resetProgress();
        });
    }
    if (modal) {
        modal.addEventListener("click", e => {
            if (e.target === modal) close();
        });
    }
}

function wireHudButtons() {
    const btnMix = document.getElementById("btn-repeat-pause");
    if (btnMix) {
        btnMix.addEventListener("click", () => {
            if (repeatPauseState === "repeat") {
                if (lastWord) speakWord(lastWord);
                repeatPauseState = "pause";
                btnMix.innerText = "⏸ 暂停";
                return;
            }
            paused = !paused;
            if (paused && startedOnce) setOverlay(true, "pause");
            if (!paused) setOverlay(false);
            repeatPauseState = "repeat";
            btnMix.innerText = "🔊 重读";
        });
    }

    const btnSummon = document.getElementById("btn-summon-golem");
    if (btnSummon) {
        btnSummon.addEventListener("click", () => {
            if (inventory.iron >= 10) {
                tryCraft("iron_golem");
            } else if (inventory.pumpkin >= 10) {
                tryCraft("snow_golem");
            } else {
                showToast("材料不足！需要 10 个铁块或南瓜");
            }
        });
    }
}

function wireTouchControls() {
    const root = document.getElementById("touch-controls");
    if (!root) return;

    function bindHold(action, onDown, onUp) {
        const btn = root.querySelector(`[data-action="${action}"]`);
        if (!btn) return;
        btn.addEventListener("pointerdown", e => {
            e.preventDefault();
            btn.setPointerCapture(e.pointerId);
            onDown();
        }, { passive: false });
        btn.addEventListener("pointerup", e => {
            e.preventDefault();
            onUp();
        }, { passive: false });
        btn.addEventListener("pointercancel", e => {
            e.preventDefault();
            onUp();
        }, { passive: false });
        btn.addEventListener("lostpointercapture", () => onUp());
    }

    function bindTap(action, fn) {
        const btn = root.querySelector(`[data-action="${action}"]`);
        if (!btn) return;
        btn.addEventListener("pointerdown", e => {
            e.preventDefault();
            fn();
        }, { passive: false });
    }

    bindHold("left", () => { keys.left = true; }, () => { keys.left = false; });
    bindHold("right", () => { keys.right = true; }, () => { keys.right = false; });
    bindTap("jump", () => { jumpBuffer = gameConfig.jump.bufferFrames; });
    bindTap("attack", () => { handleAttack("tap"); });
    bindTap("interact", () => { handleInteraction(); });
    bindTap("switch", () => { switchWeapon(); });
    bindTap("use-diamond", () => { useDiamondForHp(); });
}

async function start() {
    const [loadedGame, loadedControls, loadedLevels, loadedWords, loadedBiomes] = await Promise.all([
        loadJsonWithFallback("../config/game.json", defaultGameConfig),
        loadJsonWithFallback("../config/controls.json", defaultControls),
        loadJsonWithFallback("../config/levels.json", defaultLevels),
        loadJsonWithFallback("../words/words-base.json", defaultWords),
        loadJsonWithFallback("../config/biomes.json", { switch: DEFAULT_BIOME_SWITCH, biomes: DEFAULT_BIOME_CONFIGS })
    ]);

    gameConfig = mergeDeep(defaultGameConfig, loadedGame);
    difficultyConfigCache = null;
    lootConfigCache = null;
    keyBindings = { ...defaultControls, ...(loadedControls || {}) };
    levels = Array.isArray(loadedLevels) && loadedLevels.length ? loadedLevels : defaultLevels;
    wordDatabase = Array.isArray(loadedWords) && loadedWords.length ? loadedWords : defaultWords;
    const bundle = normalizeBiomeBundle(loadedBiomes);
    biomeConfigs = bundle.biomes;
    biomeSwitchConfig = bundle.switch;
    settings = normalizeSettings(settings);
    const parsed = parseKeyCodes(settings.keyCodes);
    if (parsed) {
        keyBindings.jump = parsed[0];
        keyBindings.attack = parsed[1];
        keyBindings.interact = parsed[2];
        keyBindings.switch = parsed[3];
        keyBindings.useDiamond = parsed[4];
    }

    applyConfig();
    handleViewportChange();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("orientationchange", handleViewportChange);
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", handleViewportChange);
        window.visualViewport.addEventListener("scroll", handleViewportChange);
    }
    applyScreenModeFromSettings(false);
    ensureVocabEngine();
    renderVocabSelect();
    await setActiveVocabPack(settings.vocabSelection || "auto");
    wireHudButtons();
    wireSettingsModal();
    wireTouchControls();

    const overlayBtn = document.getElementById("btn-overlay-action");
    if (overlayBtn) overlayBtn.addEventListener("click", resumeGameFromOverlay);
    const overlay = document.getElementById("screen-overlay");
    if (overlay) overlay.addEventListener("click", e => { if (e.target === overlay) resumeGameFromOverlay(); });

    function matchesBinding(e, binding) {
        if (!binding) return false;
        if (e.code === binding || e.key === binding) return true;
        const k = String(e.key || "");
        if (binding === "Space") return e.code === "Space" || k === " " || k === "Spacebar";
        if (binding.startsWith("Key") && binding.length === 4) {
            return e.code === binding || k.toLowerCase() === binding.slice(3).toLowerCase();
        }
        return false;
    }

    window.addEventListener("keydown", e => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
        const isJump = matchesBinding(e, keyBindings.jump) || e.code === "ArrowUp" || e.code === "Space";
        const isRight = matchesBinding(e, keyBindings.right) || e.code === "ArrowRight" || e.key === "ArrowRight";
        const isLeft = matchesBinding(e, keyBindings.left) || e.code === "ArrowLeft" || e.key === "ArrowLeft";
        const isAttack = matchesBinding(e, keyBindings.attack) || String(e.key || "").toLowerCase() === "j";
        const isWeaponSwitch = matchesBinding(e, keyBindings.switch) || String(e.key || "").toLowerCase() === "k";
        const isInteract = matchesBinding(e, keyBindings.interact) || String(e.key || "").toLowerCase() === "y";
        const isUseDiamond = matchesBinding(e, keyBindings.useDiamond) || String(e.key || "").toLowerCase() === "z";
        const isDecorInteract = String(e.key || "").toLowerCase() === "e";
        const isPause = e.code === "Escape";
        const tag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : "";
        const inInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
        if (isJump) {
            if (!e.repeat) {
                jumpBuffer = gameConfig.jump.bufferFrames;
            }
        }
        if (isRight) keys.right = true;
        if (isLeft) keys.left = true;
        if (isAttack) handleAttack("press");
        if (isWeaponSwitch) switchWeapon();
        if (isUseDiamond) useDiamondForHp();
        if (isInteract) handleInteraction();
        if (isDecorInteract) handleDecorationInteract();
        if (!inInput && e.key >= "1" && e.key <= "9") {
            selectedSlot = parseInt(e.key, 10) - 1;
            updateInventoryUI();
            const itemKey = HOTBAR_ITEMS[selectedSlot];
            showToast(`选择: ${ITEM_LABELS[itemKey] || itemKey || "空"}`);
        }
        if (!inInput && String(e.key || "").toLowerCase() === "x" && !paused) {
            if (inventory.iron >= 10) {
                tryCraft("iron_golem");
            } else if (inventory.pumpkin >= 10) {
                tryCraft("snow_golem");
            } else {
                showToast("材料不足！需要 10 个铁块或南瓜");
            }
        }
        if (isPause && startedOnce) {
            paused = !paused;
            const btnPause = document.getElementById("btn-pause");
            if (btnPause) btnPause.innerText = paused ? "▶️ 继续" : "⏸ 暂停";
            if (paused) setOverlay(true, "pause");
            else setOverlay(false);
        }
    });

    window.addEventListener("keyup", e => {
        const isRight = matchesBinding(e, keyBindings.right) || e.code === "ArrowRight" || e.key === "ArrowRight";
        const isLeft = matchesBinding(e, keyBindings.left) || e.code === "ArrowLeft" || e.key === "ArrowLeft";
        const isAttack = matchesBinding(e, keyBindings.attack) || String(e.key || "").toLowerCase() === "j";
        if (isRight) keys.right = false;
        if (isLeft) keys.left = false;
        if (isAttack) handleAttackRelease();
    });

    window.addEventListener("blur", () => { keys.right = false; keys.left = false; });
    document.addEventListener("visibilitychange", () => {
        if (!startedOnce) return;
        if (document.hidden) {
            paused = true;
            const btnPause = document.getElementById("btn-pause");
            if (btnPause) btnPause.innerText = "▶️ 继续";
            if (!pausedByModal) setOverlay(true, "pause");
        }
    });

    initGame();
    updateWordUI(null);
    paused = true;
    setOverlay(true, "start");
    update();
    draw();
}

start();
