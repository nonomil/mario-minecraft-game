/**
 * 09-vocab.js - 词汇系统与词库管理
 * 从 main.js 拆分 (原始行 2103-2495)
 */
function normalizeSettings(raw) {
    const merged = mergeDeep(defaultSettings, raw || {});
    if (typeof merged.challengeEnabled !== "boolean") merged.challengeEnabled = defaultSettings.challengeEnabled ?? true;
    if (typeof merged.challengeFrequency !== "number") merged.challengeFrequency = defaultSettings.challengeFrequency ?? 0.3;
    if (typeof merged.wordCardDuration !== "number") merged.wordCardDuration = defaultSettings.wordCardDuration ?? 900;
    if (typeof merged.speechEnRate !== "number") merged.speechEnRate = defaultSettings.speechEnRate ?? 0.8;
    if (typeof merged.speechZhRate !== "number") merged.speechZhRate = defaultSettings.speechZhRate ?? 0.9;
    if (typeof merged.speechZhEnabled !== "boolean") merged.speechZhEnabled = defaultSettings.speechZhEnabled ?? true;
    if (typeof merged.musicEnabled !== "boolean") merged.musicEnabled = defaultSettings.musicEnabled ?? true;
    if (typeof merged.uiScale !== "number") merged.uiScale = defaultSettings.uiScale ?? 1.0;
    if (typeof merged.motionScale !== "number") merged.motionScale = defaultSettings.motionScale ?? 1.25;
    if (typeof merged.biomeSwitchStepScore !== "number") merged.biomeSwitchStepScore = defaultSettings.biomeSwitchStepScore ?? 300;
    if (typeof merged.wordGateEnabled !== "boolean") merged.wordGateEnabled = defaultSettings.wordGateEnabled ?? true;
    if (typeof merged.wordMatchEnabled !== "boolean") merged.wordMatchEnabled = defaultSettings.wordMatchEnabled ?? true;
    if (typeof merged.phraseFollowMode !== "string") merged.phraseFollowMode = defaultSettings.phraseFollowMode ?? "hybrid";
    if (typeof merged.phraseFollowGapCount !== "number") merged.phraseFollowGapCount = defaultSettings.phraseFollowGapCount ?? 2;
    if (typeof merged.phraseFollowDirectRatio !== "number") merged.phraseFollowDirectRatio = defaultSettings.phraseFollowDirectRatio ?? 0.7;
    if (typeof merged.phraseFollowAdaptive !== "boolean") merged.phraseFollowAdaptive = defaultSettings.phraseFollowAdaptive ?? true;
    if (typeof merged.wordRepeatWindow !== "number") merged.wordRepeatWindow = defaultSettings.wordRepeatWindow ?? 6;
    if (typeof merged.wordRepeatBias !== "string") merged.wordRepeatBias = defaultSettings.wordRepeatBias ?? "reinforce_wrong";
    if (typeof merged.fixedBossEnabled !== "boolean") merged.fixedBossEnabled = defaultSettings.fixedBossEnabled ?? true;
    if (typeof merged.bossHpMultiplier !== "number") merged.bossHpMultiplier = defaultSettings.bossHpMultiplier ?? 2;
    if (typeof merged.villageEnabled !== "boolean") merged.villageEnabled = defaultSettings.villageEnabled ?? true;
    if (typeof merged.villageFrequency !== "number") merged.villageFrequency = defaultSettings.villageFrequency ?? 500;
    if (typeof merged.villageAutoSave !== "boolean") merged.villageAutoSave = defaultSettings.villageAutoSave ?? true;
    if (typeof merged.movementSpeedLevel !== "string" || !(merged.movementSpeedLevel in SPEED_LEVELS)) merged.movementSpeedLevel = "normal";
    if (typeof merged.difficultySelection !== "string" || !merged.difficultySelection) merged.difficultySelection = "auto";
    if (!["off", "direct", "gap2", "hybrid"].includes(String(merged.phraseFollowMode || ""))) merged.phraseFollowMode = "hybrid";
    if (!["balanced", "reinforce_wrong"].includes(String(merged.wordRepeatBias || ""))) merged.wordRepeatBias = "reinforce_wrong";
    if (!["auto", "phone", "tablet"].includes(String(merged.deviceMode || ""))) merged.deviceMode = "auto";
    merged.biomeSwitchStepScore = Math.max(150, Math.min(2000, Number(merged.biomeSwitchStepScore) || 300));
    merged.challengeFrequency = clamp(Number(merged.challengeFrequency) || 0.3, 0.05, 0.9);
    merged.wordCardDuration = Math.max(300, Math.min(3000, Number(merged.wordCardDuration) || 900));
    merged.phraseFollowGapCount = Math.max(0, Math.min(6, Number(merged.phraseFollowGapCount) || 2));
    merged.phraseFollowDirectRatio = clamp(Number(merged.phraseFollowDirectRatio) || 0.7, 0, 1);
    merged.wordRepeatWindow = Math.max(1, Math.min(20, Number(merged.wordRepeatWindow) || 6));
    merged.bossHpMultiplier = Math.max(1, Math.min(5, Number(merged.bossHpMultiplier) || 2));
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

let _wordImageVersion = 0;
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
    const ver = ++_wordImageVersion;
    img.alt = wordObj && wordObj.en ? String(wordObj.en) : "";
    const preload = new Image();
    preload.onload = () => {
        if (ver !== _wordImageVersion) return;
        img.src = preload.src;
        img.style.display = "block";
    };
    preload.onerror = () => {
        if (ver !== _wordImageVersion) return;
        img.src = placeholderImageDataUrl(wordObj && wordObj.en ? wordObj.en : "");
        img.style.display = "block";
    };
    img.style.display = "none";
    preload.src = url;
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
    const add = (value, text, isOptgroup = false) => {
        if (isOptgroup) {
            const optgroup = document.createElement("optgroup");
            optgroup.label = text;
            sel.appendChild(optgroup);
            return optgroup;
        }
        const opt = document.createElement("option");
        opt.value = value;
        opt.innerText = text;
        sel.appendChild(opt);
    };
    const addToGroup = (group, value, text) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.innerText = text;
        group.appendChild(opt);
    };

    add("auto", "随机词库（按类别轮换）");
    const engine = ensureVocabEngine();
    if (!engine) return;

    // Group packs by stage
    const grouped = {};
    vocabManifest.packs.forEach(p => {
        const stage = p.stage || "other";
        if (!grouped[stage]) grouped[stage] = [];
        grouped[stage].push(p);
    });

    // Define stage order and labels
    const stageOrder = ["kindergarten", "elementary_lower", "elementary_upper", "junior_high", "minecraft"];
    const stageLabels = {
        "kindergarten": "幼儿园",
        "elementary_lower": "小学低年级",
        "elementary_upper": "小学高年级",
        "junior_high": "初中",
        "minecraft": "我的世界"
    };

    // Define level order
    const levelOrder = ["basic", "intermediate", "advanced", "full"];
    const levelLabels = {
        "basic": "初级",
        "intermediate": "中级",
        "advanced": "高级",
        "full": "完整"
    };

    // Render grouped options
    stageOrder.forEach(stage => {
        if (!grouped[stage]) return;
        const group = add(null, stageLabels[stage] || stage, true);

        // Sort packs by level
        const packs = grouped[stage].sort((a, b) => {
            const aLevel = a.level || "full";
            const bLevel = b.level || "full";
            return levelOrder.indexOf(aLevel) - levelOrder.indexOf(bLevel);
        });

        packs.forEach(p => {
            const levelLabel = levelLabels[p.level] || p.level || "";
            const title = levelLabel ? `${levelLabel}` : p.title;
            addToGroup(group, p.id, title);
        });
    });

    sel.value = settings.vocabSelection || "auto";
    updateVocabPreview(sel.value);
}

function getActivePackTitle() {
    if (!activeVocabPackId) return "自动词库";
    const pack = vocabPacks[activeVocabPackId];
    return pack ? pack.title : activeVocabPackId;
}

function updateVocabPreview(selection) {
    const preview = document.getElementById("vocab-preview");
    if (!preview) return;
    const key = selection || settings.vocabSelection || "auto";
    if (key === "auto") {
        preview.innerHTML = `<strong>自动轮换</strong><br>根据阶段与难度智能匹配`;
        return;
    }
    const pack = vocabPacks[key];
    if (!pack) {
        preview.innerText = "词库数据未就绪";
        return;
    }
    const details = [];
    if (pack.stage) {
        const stageLabel = (typeof STAGE_LABELS !== "undefined" && STAGE_LABELS && STAGE_LABELS[pack.stage])
            ? STAGE_LABELS[pack.stage]
            : pack.stage;
        details.push(stageLabel);
    }
    if (pack.difficulty) details.push(pack.difficulty);
    preview.innerHTML = `<strong>${pack.title}</strong>${details.length ? `<br>${details.join(" · ")}` : ""}`;
}

function showVocabSwitchEffect() {
    const title = getActivePackTitle();
    const px = player ? player.x : cameraX;
    const py = player ? player.y - 60 : canvas.height / 2;
    showFloatingText(`切换词库：${title}`, px, py);
    showToast(`已切换至 ${title}`);
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

function loadVocabPackFiles(files) {
    const list = Array.isArray(files) ? files.filter(Boolean) : (files ? [files] : []);
    if (!list.length) return Promise.resolve();
    return list.reduce((chain, file) => chain.then(() => loadVocabPackFile(file)), Promise.resolve());
}

function normalizeRawWord(raw) {
    if (!raw || typeof raw !== "object") return null;
    const en = String(raw.standardized || raw.word || "").trim();
    const zh = String(raw.chinese || raw.zh || raw.translation || "").trim();
    if (!en) return null;
    return {
        en,
        zh: zh || "",
        phrase: String(raw.phrase || "").trim() || null,
        phraseZh: String(raw.phraseTranslation || "").trim() || null,
        phraseTranslation: String(raw.phraseTranslation || "").trim() || null,
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
        if (pack.files && Array.isArray(pack.files)) {
            await loadVocabPackFiles(pack.files);
        } else if (pack.file) {
            await loadVocabPackFile(pack.file);
        }
        let rawList = [];
        if (typeof pack.getRaw === "function") {
            rawList = pack.getRaw();
        } else if (Array.isArray(pack.globals)) {
            rawList = pack.globals.flatMap(name => {
                const value = window[name];
                return Array.isArray(value) ? value : [];
            });
        }
        const mapped = [];
        const seen = new Set();
        (Array.isArray(rawList) ? rawList : []).forEach(r => {
            const w = normalizeRawWord(r);
            if (!w) return;
            if (seen.has(w.en)) return;
            seen.add(w.en);
            mapped.push(w);
        });
        const fallbackSource = Array.isArray(defaultWords) ? defaultWords : [];
        const fallbackWords = fallbackSource.map(w => normalizeRawWord(w)).filter(Boolean);
        const target = mapped.length ? mapped : fallbackWords;
        if (!target.length) {
            console.warn(`[Vocab] Pack ${pack.id} produced no words and no fallback data`);
        }
        if (target.length) {
            wordDatabase = target;
            wordPicker = null;
            const pr = getPackProgress(pack.id);
            pr.total = target.length;
            saveProgress();
        }
    } catch {
    }

        renderVocabSelect();
        updateVocabProgressUI();
        updateVocabPreview(activeVocabPackId || settings.vocabSelection);
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
    const visualViewport = getViewportSize();
    // Use the safe-area-adjusted game area for canvas + physics scaling.
    const gameArea = getGameAreaSize();
    applyConfig(gameArea);
    const viewportChanged = gameArea.width !== lastViewport.width || gameArea.height !== lastViewport.height;
    lastViewport = { width: gameArea.width, height: gameArea.height };

    const baseScale = Number(settings.uiScale) || 1.0;
    const uiScale = clamp(worldScale.unit * baseScale, 0.6, 2.2);
    document.documentElement.style.setProperty("--ui-scale", uiScale.toFixed(3));
    document.documentElement.style.setProperty("--vvw", `${Math.floor(visualViewport.width)}px`);
    document.documentElement.style.setProperty("--vvh", `${Math.floor(visualViewport.height)}px`);

    const container = document.getElementById("game-container");
    if (container) {
        container.style.transform = "none";
    }

    const touch = document.getElementById("touch-controls");
    if (touch) {
        const enabled = !!settings.touchControls;
        const mode = String(settings.deviceMode || "auto");
        const shortestSide = Math.min(Number(visualViewport.width) || 0, Number(visualViewport.height) || 0);
        const resolvedDevice = mode === "phone" || mode === "tablet"
            ? mode
            : (shortestSide > 0 && shortestSide < 768 ? "phone" : "tablet");
        touch.classList.toggle("visible", enabled);
        touch.classList.toggle("layout-phone", resolvedDevice === "phone");
        touch.classList.toggle("layout-tablet", resolvedDevice === "tablet");
        touch.setAttribute("aria-hidden", enabled ? "false" : "true");
        touch.dataset.deviceMode = resolvedDevice;
    }

    if (viewportChanged && startedOnce) {
        if (nowMs() < viewportIgnoreUntilMs) return;
        if (startOverlayActive || pausedByModal) return;
        paused = true;
        pausedByModal = true;
        setOverlay(true, "pause");
        showToast("已适配屏幕，已暂停游戏");
    }
}

let applySettingsRaf = 0;
function scheduleApplySettingsToUI() {
    if (applySettingsRaf) return;
    applySettingsRaf = requestAnimationFrame(() => {
        applySettingsRaf = 0;
        applySettingsToUI();
    });
}
