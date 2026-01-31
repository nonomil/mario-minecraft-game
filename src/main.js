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
let cameraX = 0;
let gameFrame = 0;
let currentLevelIdx = 0;

const INVENTORY_TEMPLATE = {
    diamond: 0,
    pumpkin: 0,
    iron: 0,
    stick: 0,
    wooden_axe: 0,
    stone_sword: 0,
    iron_pickaxe: 0,
    arrow: 0,
    bone: 0,
    gunpowder: 0,
    rotten_flesh: 0,
    string: 0,
    ender_pearl: 0,
    dragon_egg: 0
};
let inventory = { ...INVENTORY_TEMPLATE };
let selectedSlot = 0;
const HOTBAR_ITEMS = ["diamond", "pumpkin", "iron", "stick", "wooden_axe", "stone_sword", "iron_pickaxe", "arrow", "bone"];
const ITEM_LABELS = {
    diamond: "钻石",
    pumpkin: "南瓜",
    iron: "铁块",
    stick: "木棍",
    wooden_axe: "木斧",
    stone_sword: "石剑",
    iron_pickaxe: "铁镐",
    arrow: "箭矢",
    bone: "骨头",
    gunpowder: "火药",
    rotten_flesh: "腐肉",
    string: "蜘蛛丝",
    ender_pearl: "末影珍珠",
    dragon_egg: "龙蛋"
};
const ITEM_ICONS = {
    diamond: "💎",
    pumpkin: "🎃",
    iron: "🧱",
    stick: "🥢",
    wooden_axe: "🪓",
    stone_sword: "⚔️",
    iron_pickaxe: "⛏️",
    arrow: "🏹",
    bone: "🦴",
    gunpowder: "💥",
    rotten_flesh: "🥩",
    string: "🕸️",
    ender_pearl: "🟣",
    dragon_egg: "🐉"
};
const TOOL_STATS = {
    wooden_axe: { damage: 5 },
    stone_sword: { damage: 8 },
    iron_pickaxe: { damage: 6 }
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
let bossSpawned = false;
let playerInvincibleTimer = 0;
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
let floatingTexts = [];
let lastGenX = 0;

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

function applyConfig() {
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

function normalizeSettings(raw) {
    const merged = mergeDeep(defaultSettings, raw || {});
    if (typeof merged.speechEnRate !== "number") merged.speechEnRate = defaultSettings.speechEnRate ?? 0.8;
    if (typeof merged.speechZhRate !== "number") merged.speechZhRate = defaultSettings.speechZhRate ?? 0.9;
    if (typeof merged.uiScale !== "number") merged.uiScale = defaultSettings.uiScale ?? 1.0;
    if (typeof merged.motionScale !== "number") merged.motionScale = defaultSettings.motionScale ?? 1.25;
    if (!merged.keyCodes) {
        merged.keyCodes = [defaultControls.jump, defaultControls.attack, defaultControls.interact].filter(Boolean).join(",");
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
    const container = document.getElementById("game-container");
    if (container) {
        const base = Number(settings.uiScale) || 1.0;
        const pad = 18;
        const fitW = (window.innerWidth - pad) / (gameConfig.canvas.width || 800);
        const fitH = (window.innerHeight - pad) / (gameConfig.canvas.height || 600);
        const fit = Math.max(0.45, Math.min(1.6, Math.min(fitW, fitH)));
        const s = Math.max(0.45, Math.min(1.6, base * fit));
        container.style.transform = `scale(${s})`;
    }

    const touch = document.getElementById("touch-controls");
    if (touch) {
        const enabled = !!settings.touchControls;
        touch.classList.toggle("visible", enabled);
        touch.setAttribute("aria-hidden", enabled ? "false" : "true");
    }
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
        if (mode === "pause") {
            if (title) title.innerText = "已暂停";
            if (text) text.innerHTML = "← → 移动　空格 跳(可二段跳)<br>J 攻击　Y 打开宝箱";
            if (btn) btn.innerText = "继续";
        } else {
            if (title) title.innerText = "准备开始";
            if (text) text.innerHTML = "← → 移动　空格 跳(可二段跳)<br>J 攻击　Y 打开宝箱";
            if (btn) btn.innerText = "开始游戏";
        }
    } else {
        overlay.classList.remove("visible");
        overlay.setAttribute("aria-hidden", "true");
    }
}

function resumeGameFromOverlay() {
    paused = false;
    startedOnce = true;
    setOverlay(false);
    const btnPause = document.getElementById("btn-pause");
    if (btnPause) btnPause.innerText = "⏸ 暂停";
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
    p.speed = (Number(gameConfig.physics.movementSpeed) || 2.0) * scale;
    p.jumpStrength = (Number(gameConfig.physics.jumpStrength) || -7.0) * scale;
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
    currentLevelIdx = 0;
    resetInventory();
    updateInventoryUI();
    player = createPlayer();
    bossSpawned = false;
    startLevel(0);
}

function startLevel(idx) {
    currentLevelIdx = idx;
    const level = levels[currentLevelIdx];
    canvas.style.backgroundColor = level.bg;
    document.getElementById("level-info").innerText = "场景: " + level.name;
    platforms = [];
    trees = [];
    chests = [];
    items = [];
    enemies = [];
    golems = [];
    resetProjectiles();
    playerPositionHistory = [];
    lastGenX = 0;
    cameraX = 0;
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
        enemyChance *= 0.25;
        treeChance *= 0.6;
        chestChance *= 0.8;
        itemChance = Math.min(0.85, itemChance * 1.2);
    }

    const clamp01 = v => Math.max(0, Math.min(1, v));
    treeChance = clamp01(treeChance);
    chestChance = clamp01(Math.max(chestChance, treeChance));
    itemChance = clamp01(Math.max(itemChance, chestChance));
    enemyChance = clamp01(Math.max(enemyChance, itemChance));
    return { treeChance, chestChance, itemChance, enemyChance };
}

function generatePlatform(startX, length, groundYValue) {
    const level = levels[currentLevelIdx];
    const newWidth = length * blockSize;
    let merged = false;
    for (let i = platforms.length - 1; i >= 0; i--) {
        const p = platforms[i];
        if (p.y === groundYValue && p.type === level.ground) {
            if (Math.abs((p.x + p.width) - startX) < 1.5) {
                p.width += newWidth;
                merged = true;
            }
            break;
        }
    }

    if (!merged) {
        platforms.push(new Platform(startX, groundYValue, newWidth, blockSize, level.ground));
    }

    if (length > 5 && Math.random() < gameConfig.spawn.floatingPlatformChance) {
        const floatLen = 2 + Math.floor(Math.random() * 3);
        const floatY = groundYValue - 100 - Math.floor(Math.random() * 80);
        const floatX = startX + blockSize + Math.floor(Math.random() * (length - floatLen) * blockSize);
        platforms.push(new Platform(floatX, floatY, floatLen * blockSize, blockSize, level.ground));
        if (Math.random() < gameConfig.spawn.floatingItemChance) {
            const word = pickWordForSpawn();
            items.push(new Item(floatX + blockSize / 2, floatY - 50, word));
        }
    }

    if (startX > 400) {
        const objectX = startX + 100 + Math.random() * (length * blockSize - 150);
        const rand = Math.random();
        const rates = getSpawnRates();
        const enemyConfig = getEnemyConfig();
        let enemyChance = enemyConfig.spawnChance ?? rates.enemyChance;
        if (enemyConfig.spawnChance != null && settings.learningMode) {
            enemyChance *= 0.25;
        }
        enemyChance = Math.min(1, Math.max(enemyChance, rates.itemChance));
        if (rand < rates.treeChance) {
            trees.push(new Tree(objectX, groundYValue, level.treeType));
        } else if (rand < rates.chestChance) {
            chests.push(new Chest(objectX, groundYValue));
        } else if (rand < rates.itemChance) {
            const word = pickWordForSpawn();
            items.push(new Item(objectX, groundYValue - 60, word));
        } else if (rand < enemyChance) {
            spawnEnemyByDifficulty(objectX, groundYValue - 32);
        }
    }

    lastGenX = startX + length * blockSize;
}

function spawnEnemyByDifficulty(x, y) {
    const enemyConfig = getEnemyConfig();
    const thresholds = enemyConfig.difficultyThresholds || [500, 1000, 2000, 3000];
    let pool = ["zombie"];
    if (score >= thresholds[0]) pool = ["zombie", "spider"];
    if (score >= thresholds[1]) pool = ["zombie", "spider", "creeper"];
    if (score >= thresholds[2]) pool = ["zombie", "spider", "creeper", "skeleton"];
    if (score >= thresholds[3]) pool = ["zombie", "spider", "creeper", "skeleton", "enderman"];

    const aliveEnemies = enemies.filter(e => !e.remove && e.y < 900).length;
    if (aliveEnemies >= (enemyConfig.maxOnScreen || 8)) return;

    const type = pool[Math.floor(Math.random() * pool.length)];
    enemies.push(new Enemy(x, y, type));
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
        const uEn = new SpeechSynthesisUtterance(wordObj.en);
        uEn.lang = "en-US";
        uEn.rate = Number(settings.speechEnRate) || 0.8;
        const uZh = new SpeechSynthesisUtterance(wordObj.zh);
        uZh.lang = "zh-CN";
        uZh.rate = Number(settings.speechZhRate) || 0.9;
        window.speechSynthesis.speak(uEn);
        window.speechSynthesis.speak(uZh);
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
    if (score >= (enemyConfig.bossSpawnScore || 5000)) {
        bossSpawned = true;
        const dragon = new Enemy(player.x + 300, 100, "ender_dragon");
        enemies.push(dragon);
        showToast("⚠️ 末影龙降临！");
    }
}

function update() {
    if (paused) return;
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

    if (levelScore >= gameConfig.scoring.levelUp) nextLevel();
    gameFrame++;
}

function addScore(points) {
    score += points;
    levelScore += points;
    document.getElementById("score").innerText = score;
}

function damagePlayer(amount, sourceX, knockback = 90) {
    if (playerInvincibleTimer > 0) return;
    playerInvincibleTimer = 30;
    const dir = sourceX != null ? (player.x > sourceX ? 1 : -1) : -1;
    player.x += dir * knockback;
    player.y -= 40;
    showFloatingText(`-${amount}`, player.x, player.y);
}

function nextLevel() {
    levelScore = 0;
    currentLevelIdx++;
    if (currentLevelIdx >= levels.length) currentLevelIdx = 0;
    showToast(`通关! 下一站: ${levels[currentLevelIdx].name}`);
    setTimeout(() => { startLevel(currentLevelIdx); }, 2000);
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
        wooden_axe: "count-wooden_axe",
        stone_sword: "count-stone_sword",
        iron_pickaxe: "count-iron_pickaxe",
        arrow: "count-arrow",
        bone: "count-bone"
    };
    Object.keys(ids).forEach(key => {
        const el = document.getElementById(ids[key]);
        if (el) el.innerText = inventory[key] ?? 0;
    });
    const slots = Array.from(document.querySelectorAll(".inventory-bar .inv-slot"));
    slots.forEach((s, idx) => {
        s.classList.toggle("selected", idx === selectedSlot);
    });
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

function handleAttack() {
    if (player.isAttacking) return;
    player.isAttacking = true;
    player.attackTimer = 20;

    const range = 50;
    const ax = player.facingRight ? player.x + player.width : player.x - range;
    const ay = player.y;
    const itemKey = HOTBAR_ITEMS[selectedSlot];
    const tool = TOOL_STATS[itemKey];
    const dmg = tool ? tool.damage : 10;

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
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-cameraX, 0);

    platforms.forEach(p => drawBlock(p.x, p.y, p.width, p.height, p.type));

    trees.forEach(t => {
        if (t.shake > 0) t.shake--;
        const shakeX = (Math.random() - 0.5) * t.shake * 2;
        drawPixelTree(ctx, t.x + shakeX, t.y, t.type, t.hp);
    });

    chests.forEach(c => drawChest(c.x, c.y, c.opened));

    items.forEach(i => {
        if (!i.collected) drawItem(i.x, i.y + i.floatY, i.wordObj.en);
    });

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
    ctx2d.fillStyle = type === "cactus" ? "#2E7D32" : "#5D4037";
    ctx2d.fillRect(trunkX, trunkY, trunkW, trunkH);

    if (type === "cactus") {
        ctx2d.fillRect(trunkX - 15, trunkY + 10, 15, 10);
        ctx2d.fillRect(trunkX - 15, trunkY - 10, 10, 20);
        ctx2d.fillRect(trunkX + 20, trunkY + 20, 15, 10);
        ctx2d.fillRect(trunkX + 25, trunkY + 5, 10, 15);
        return;
    }

    let leafColor = "#2E7D32";
    if (type === "spruce") leafColor = "#1B5E20";
    if (type === "mushroom") leafColor = "#D32F2F";

    ctx2d.fillStyle = leafColor;
    ctx2d.fillRect(x, y + 40, 80, 40);
    ctx2d.fillRect(x + 10, y + 20, 60, 20);
    ctx2d.fillRect(x + 20, y, 40, 20);

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
    ctx.fillStyle = "white";
    const ex = facingRight ? x + 16 : x + 6;
    ctx.fillRect(ex, y + 6, 6, 4);
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

function drawCreeper(x, y) {
    ctx.fillStyle = "#00AA00";
    ctx.fillRect(x, y, 32, 32);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 6, y + 6, 6, 6);
    ctx.fillRect(x + 20, y + 6, 6, 6);
    ctx.fillRect(x + 13, y + 12, 6, 8);
}

function drawEnemy(enemy) {
    if (enemy.remove || enemy.y > 900) return;
    const x = enemy.x;
    const y = enemy.y;

    switch (enemy.type) {
        case "zombie":
            drawZombie(x, y);
            break;
        case "spider":
            drawSpider(x, y);
            break;
        case "creeper":
            drawCreeper(x, y);
            if (enemy.state === "exploding") {
                const flash = Math.floor(enemy.explodeTimer / 10) % 2 === 0;
                if (flash) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.fillRect(x - 5, y - 5, 42, 42);
                }
            }
            break;
        case "skeleton":
            drawSkeleton(x, y);
            break;
        case "enderman":
            drawEnderman(x, y);
            break;
        case "ender_dragon":
            drawEnderDragon(x, y);
            break;
    }

    if (enemy.hp < enemy.maxHp) {
        drawHealthBar(x, y - 8, enemy.width, enemy.hp, enemy.maxHp);
    }
}

function drawZombie(x, y) {
    ctx.fillStyle = "#00AA00";
    ctx.fillRect(x + 8, y, 16, 10);
    ctx.fillRect(x + 10, y + 10, 12, 14);
    ctx.fillRect(x + 6, y + 10, 4, 12);
    ctx.fillRect(x + 22, y + 10, 4, 12);
    ctx.fillRect(x + 10, y + 24, 5, 8);
    ctx.fillRect(x + 17, y + 24, 5, 8);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 11, y + 4, 2, 2);
    ctx.fillRect(x + 19, y + 4, 2, 2);
}

function drawSpider(x, y) {
    ctx.fillStyle = "#4A0E0E";
    ctx.fillRect(x + 8, y + 12, 16, 12);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(x + 12, y + 14, 2, 2);
    ctx.fillRect(x + 18, y + 14, 2, 2);
    ctx.strokeStyle = "#2A0A0A";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 15); ctx.lineTo(x, y + 10);
    ctx.moveTo(x + 8, y + 19); ctx.lineTo(x, y + 24);
    ctx.moveTo(x + 24, y + 15); ctx.lineTo(x + 32, y + 10);
    ctx.moveTo(x + 24, y + 19); ctx.lineTo(x + 32, y + 24);
    ctx.stroke();
}

function drawSkeleton(x, y) {
    ctx.fillStyle = "#C0C0C0";
    ctx.fillRect(x + 8, y, 16, 10);
    ctx.fillRect(x + 10, y + 10, 12, 14);
    ctx.fillRect(x + 6, y + 10, 4, 12);
    ctx.fillRect(x + 22, y + 10, 4, 12);
    ctx.fillRect(x + 10, y + 24, 5, 8);
    ctx.fillRect(x + 17, y + 24, 5, 8);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 11, y + 4, 3, 3);
    ctx.fillRect(x + 18, y + 4, 3, 3);
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 4, y + 15, 4, 0, Math.PI);
    ctx.stroke();
}

function drawEnderman(x, y) {
    ctx.fillStyle = "#1A0033";
    ctx.fillRect(x + 10, y, 12, 8);
    ctx.fillRect(x + 12, y + 8, 8, 16);
    ctx.fillRect(x + 8, y + 8, 3, 18);
    ctx.fillRect(x + 21, y + 8, 3, 18);
    ctx.fillRect(x + 12, y + 24, 3, 8);
    ctx.fillRect(x + 17, y + 24, 3, 8);
    ctx.fillStyle = "#AA00FF";
    ctx.fillRect(x + 12, y + 3, 2, 2);
    ctx.fillRect(x + 18, y + 3, 2, 2);
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
    if (parts.length !== 3) return null;
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
        const roll = Math.random();
        let drop = "iron";
        if (roll < 0.3) drop = "diamond";
        else if (roll < 0.55) drop = "pumpkin";
        else if (roll < 0.7) drop = "iron";
        else if (roll < 0.8) drop = "stick";
        else if (roll < 0.87) drop = "wooden_axe";
        else if (roll < 0.93) drop = "stone_sword";
        else if (roll < 0.97) drop = "arrow";
        else drop = "iron_pickaxe";
        if (!inventory[drop] && inventory[drop] !== 0) inventory[drop] = 0;
        inventory[drop]++;
        updateInventoryUI();
        const dropIcon = ITEM_ICONS[drop] || "✨";
        showFloatingText(dropIcon, this.x + 10, this.y - 30);
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

const ENEMY_STATS = {
    zombie: {
        hp: 20,
        speed: 0.55,
        damage: 10,
        attackType: "melee",
        color: "#00AA00",
        drops: ["rotten_flesh"],
        scoreValue: 10
    },
    spider: {
        hp: 16,
        speed: 1.2,
        damage: 8,
        attackType: "melee",
        color: "#4A0E0E",
        drops: ["string"],
        scoreValue: 12
    },
    creeper: {
        hp: 20,
        speed: 0.4,
        damage: 40,
        attackType: "explode",
        color: "#00AA00",
        drops: ["gunpowder"],
        scoreValue: 18
    },
    skeleton: {
        hp: 15,
        speed: 0.5,
        damage: 12,
        attackType: "ranged",
        color: "#C0C0C0",
        drops: ["bone", "arrow"],
        scoreValue: 20
    },
    enderman: {
        hp: 40,
        speed: 2.0,
        damage: 25,
        attackType: "teleport",
        color: "#1A0033",
        drops: ["ender_pearl"],
        scoreValue: 35
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
        }

        if (this.lifetime <= 0) this.remove = true;
    }
}

class Arrow extends Projectile {
    constructor(x, y, targetX, targetY) {
        super(x, y, targetX, targetY, 4, "enemy");
        this.damage = 12;
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
        super(x, y, size.w, size.h);
        this.type = type;
        this.startX = x;
        this.range = range;
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.speed = stats.speed;
        this.damage = stats.damage;
        this.attackType = stats.attackType;
        this.color = stats.color;
        this.drops = stats.drops || [];
        this.scoreValue = stats.scoreValue || gameConfig.scoring.enemy;
        this.dir = 1;
        this.state = "patrol";
        this.attackCooldown = 0;
        this.explodeTimer = 0;
        this.teleportCooldown = 0;
        this.phaseChanged = false;
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

        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.teleportCooldown > 0) this.teleportCooldown--;
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
    const optMotionScale = document.getElementById("opt-motion-scale");
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
        if (optMotionScale) optMotionScale.value = String(settings.motionScale ?? 1.25);
        if (optTouch) optTouch.checked = !!settings.touchControls;
        if (optNoRepeat) optNoRepeat.checked = !!settings.avoidWordRepeats;
        if (optShowImage) optShowImage.checked = !!settings.showWordImage;
        if (optVocab) optVocab.value = settings.vocabSelection || "auto";
        if (optKeys) optKeys.value = settings.keyCodes || [keyBindings.jump, keyBindings.attack, keyBindings.interact].join(",");
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
        if (optMotionScale) settings.motionScale = Number(optMotionScale.value);
        if (optTouch) settings.touchControls = !!optTouch.checked;
        if (optNoRepeat) settings.avoidWordRepeats = !!optNoRepeat.checked;
        if (optShowImage) settings.showWordImage = !!optShowImage.checked;
        if (optVocab) settings.vocabSelection = String(optVocab.value || "auto");
        if (optKeys) settings.keyCodes = String(optKeys.value || "");

        settings = normalizeSettings(settings);
        const parsed = parseKeyCodes(settings.keyCodes);
        if (parsed) {
            keyBindings.jump = parsed[0];
            keyBindings.attack = parsed[1];
            keyBindings.interact = parsed[2];
        }

        wordPicker = null;
        saveSettings();
        applySettingsToUI();
        if (player) applyMotionToPlayer(player);
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
    const btnRepeat = document.getElementById("btn-repeat-word");
    if (btnRepeat) {
        btnRepeat.addEventListener("click", () => {
            if (lastWord) speakWord(lastWord);
        });
    }

    const btnPause = document.getElementById("btn-pause");
    if (btnPause) {
        btnPause.addEventListener("click", () => {
            paused = !paused;
            btnPause.innerText = paused ? "▶️ 继续" : "⏸ 暂停";
            if (paused && startedOnce) setOverlay(true, "pause");
            if (!paused) setOverlay(false);
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
    bindTap("attack", () => { handleAttack(); });
    bindTap("interact", () => { handleInteraction(); });
}

async function start() {
    const [loadedGame, loadedControls, loadedLevels, loadedWords] = await Promise.all([
        loadJsonWithFallback("../config/game.json", defaultGameConfig),
        loadJsonWithFallback("../config/controls.json", defaultControls),
        loadJsonWithFallback("../config/levels.json", defaultLevels),
        loadJsonWithFallback("../words/words-base.json", defaultWords)
    ]);

    gameConfig = mergeDeep(defaultGameConfig, loadedGame);
    keyBindings = { ...defaultControls, ...(loadedControls || {}) };
    levels = Array.isArray(loadedLevels) && loadedLevels.length ? loadedLevels : defaultLevels;
    wordDatabase = Array.isArray(loadedWords) && loadedWords.length ? loadedWords : defaultWords;
    settings = normalizeSettings(settings);
    const parsed = parseKeyCodes(settings.keyCodes);
    if (parsed) {
        keyBindings.jump = parsed[0];
        keyBindings.attack = parsed[1];
        keyBindings.interact = parsed[2];
    }

    applyConfig();
    applySettingsToUI();
    window.addEventListener("resize", applySettingsToUI);
    window.addEventListener("orientationchange", applySettingsToUI);
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
        const isInteract = matchesBinding(e, keyBindings.interact) || String(e.key || "").toLowerCase() === "y";
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
        if (isAttack) handleAttack();
        if (isInteract) handleInteraction();
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
        if (isRight) keys.right = false;
        if (isLeft) keys.left = false;
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
