/**
 * 09-vocab.js - 词汇系统与词库管理
 * 从 main.js 拆分 (原始行 2103-2495)
 */
function normalizeSettings(raw) {
    const merged = mergeDeep(defaultSettings, raw || {});
    if (typeof merged.challengeEnabled !== "boolean") merged.challengeEnabled = defaultSettings.challengeEnabled ?? true;
    if (typeof merged.challengeMode !== "boolean") merged.challengeMode = defaultSettings.challengeMode ?? false;
    if (typeof merged.challengeFrequency !== "number") merged.challengeFrequency = defaultSettings.challengeFrequency ?? 0.3;
    if (typeof merged.wordCardDuration !== "number") merged.wordCardDuration = defaultSettings.wordCardDuration ?? 1200;
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
    if (typeof merged.languageMode !== "string") merged.languageMode = defaultSettings.languageMode ?? "english";
    if (typeof merged.showPinyin !== "boolean") merged.showPinyin = defaultSettings.showPinyin ?? true;
    if (typeof merged.movementSpeedLevel !== "string" || !(merged.movementSpeedLevel in SPEED_LEVELS)) merged.movementSpeedLevel = "normal";
    if (typeof merged.difficultySelection !== "string" || !merged.difficultySelection) merged.difficultySelection = "auto";
    if (!["off", "direct", "gap2", "hybrid"].includes(String(merged.phraseFollowMode || ""))) merged.phraseFollowMode = "hybrid";
    if (!["balanced", "reinforce_wrong"].includes(String(merged.wordRepeatBias || ""))) merged.wordRepeatBias = "reinforce_wrong";
    if (!["auto", "phone", "tablet"].includes(String(merged.deviceMode || ""))) merged.deviceMode = "auto";
    if (!["english", "chinese", "bilingual"].includes(String(merged.languageMode || ""))) merged.languageMode = "english";
    merged.biomeSwitchStepScore = Math.max(150, Math.min(2000, Number(merged.biomeSwitchStepScore) || 300));
    merged.challengeFrequency = clamp(Number(merged.challengeFrequency) || 0.3, 0.05, 0.9);
    merged.wordCardDuration = Math.max(300, Math.min(3000, Number(merged.wordCardDuration) || 1200));
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

window._customVocabPacks = window._customVocabPacks || [];

function saveSettings() {
    if (storage) storage.saveJson("mmwg:settings", settings);
}

function saveProgress() {
    if (storage) storage.saveJson("mmwg:progress", progress);
}

function saveVocabState() {
    if (storage) storage.saveJson("mmwg:vocabState", vocabState);
}

const WORD_QUALITY_DEFAULT = "new";
const WORD_QUALITY_SET = new Set(["new", "correct_fast", "correct_slow", "wrong"]);

function toNonNegativeInt(value, fallback = 0) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.floor(n));
}

function normalizeWordEntry(value) {
    const now = Date.now();
    if (value && typeof value === "object") {
        const seen = Math.max(1, toNonNegativeInt(value.seen, 1));
        const correct = toNonNegativeInt(value.correct, 0);
        const wrong = toNonNegativeInt(value.wrong, 0);
        const lastSeenRaw = Number(value.lastSeen);
        const qualityRaw = String(value.quality || "").trim();
        const quality = WORD_QUALITY_SET.has(qualityRaw)
            ? qualityRaw
            : (wrong > 0 ? "wrong" : (correct > 0 ? "correct_slow" : WORD_QUALITY_DEFAULT));
        return {
            seen,
            correct,
            wrong,
            lastSeen: Number.isFinite(lastSeenRaw) && lastSeenRaw > 0 ? lastSeenRaw : now,
            quality
        };
    }

    const seenLegacy = Math.max(1, toNonNegativeInt(value, 1));
    return {
        seen: seenLegacy,
        correct: 0,
        wrong: 0,
        lastSeen: now,
        quality: WORD_QUALITY_DEFAULT
    };
}

function normalizePackProgressEntry(entry) {
    const out = entry && typeof entry === "object" ? entry : {};
    if (!out.unique || typeof out.unique !== "object") out.unique = {};

    Object.keys(out.unique).forEach(word => {
        out.unique[word] = normalizeWordEntry(out.unique[word]);
    });

    if (typeof out.uniqueCount !== "number") {
        out.uniqueCount = Object.keys(out.unique).length;
    } else {
        out.uniqueCount = Math.max(out.uniqueCount, Object.keys(out.unique).length);
    }
    if (typeof out.total !== "number") out.total = 0;
    if (typeof out.completed !== "boolean") out.completed = false;
    return out;
}

function replayPackQualityToWordPicker(packId) {
    if (!packId || !wordPicker || typeof wordPicker.updateWordQuality !== "function") return;
    const pack = progress?.vocab?.[packId];
    if (!pack?.unique || typeof pack.unique !== "object") return;

    Object.entries(pack.unique).forEach(([word, entry]) => {
        const normalized = normalizeWordEntry(entry);
        pack.unique[word] = normalized;
        if (normalized.quality && normalized.quality !== WORD_QUALITY_DEFAULT) {
            wordPicker.updateWordQuality(word, normalized.quality);
        }
    });
}

function normalizeProgress(raw) {
    const p = raw && typeof raw === "object" ? raw : {};
    if (!p.vocab || typeof p.vocab !== "object") p.vocab = {};

    Object.keys(p.vocab).forEach(packId => {
        p.vocab[packId] = normalizePackProgressEntry(p.vocab[packId]);
    });
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

function parseCustomVocab(text) {
    return String(text || "")
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => line.split(","))
        .filter(parts => parts.length >= 2)
        .map(parts => ({
            en: String(parts[0] || "").trim(),
            zh: String(parts[1] || "").trim(),
            phrase: String(parts[2] || "").trim()
        }))
        .filter(item => item.en);
}

function registerCustomVocab(name, words) {
    const cleanName = String(name || "自定义词库").trim() || "自定义词库";
    const cleanWords = Array.isArray(words) ? words.filter(w => w?.en).map(w => ({
        standardized: String(w.en || "").trim(),
        chinese: String(w.zh || "").trim(),
        phrase: String(w.phrase || "").trim(),
        phraseTranslation: ""
    })) : [];
    if (!cleanWords.length) return null;

    const packId = `custom_${Date.now()}`;
    const pack = {
        id: packId,
        title: cleanName,
        stage: "custom",
        difficulty: "custom",
        level: "full",
        weight: 1,
        getRaw() { return cleanWords; }
    };
    window._customVocabPacks.push(pack);

    if (vocabManifest && Array.isArray(vocabManifest.packs)) {
        vocabManifest.packs.push(pack);
        if (!vocabManifest.byId) vocabManifest.byId = Object.create(null);
        vocabManifest.byId[packId] = pack;
    }
    vocabEngine = null;
    ensureVocabEngine();
    renderVocabSelect();
    return pack;
}

function getVocabPackList() {
    const engine = ensureVocabEngine();
    if (!engine || !Array.isArray(vocabManifest?.packs)) return [];
    return vocabManifest.packs.map(pack => ({ id: pack.id, name: pack.title || pack.id }));
}

function handleVocabFileImport(event) {
    const file = event?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const words = parseCustomVocab(e?.target?.result || "");
        if (!words.length) {
            alert("未解析到有效词条，格式：英文,中文");
            return;
        }
        const baseName = String(file.name || "自定义词库").replace(/\.[^.]+$/, "");
        registerCustomVocab(baseName, words);
        alert(`已加入 ${words.length} 个词条`);
    };
    reader.readAsText(file, "utf-8");
}

function handleVocabTextImport() {
    const text = prompt("请粘贴词库文本（每行：英文,中文[,短]）：");
    if (!text) return;
    const words = parseCustomVocab(text);
    if (!words.length) {
        alert("未解析到有效词条");
        return;
    }
    const name = prompt("词库名称：", "自定义词库") || "自定义词库";
    registerCustomVocab(name, words);
    alert(`已加入 ${words.length} 个词条`);
}

window.parseCustomVocab = parseCustomVocab;
window.registerCustomVocab = registerCustomVocab;
window.getVocabPackList = getVocabPackList;
window.handleVocabFileImport = handleVocabFileImport;
window.handleVocabTextImport = handleVocabTextImport;

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
    const stageOrder = ["kindergarten", "elementary", "junior_high", "minecraft", "custom"];
    const stageLabels = {
        "kindergarten": "幼儿园",
        "elementary": "小学",
        "junior_high": "初中",
        "minecraft": "我的世界",
        "custom": "自定义"
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
    preview.innerHTML = `<strong>${pack.title}</strong>${details.length ? `<br>${details.join(" 路 ")}` : ""}`;
}

function showVocabSwitchEffect() {
    const title = getActivePackTitle();
    const px = player ? player.x : cameraX;
    const py = player ? player.y - 60 : canvas.height / 2;
    showFloatingText(`切换词库：{title}`, px, py);
    showToast(`已切换至 ${title}`);
}

function getPackProgress(packId) {
    if (!packId) return null;
    const v = progress.vocab;
    if (!v[packId]) v[packId] = { unique: {}, uniqueCount: 0, total: 0, completed: false };
    return normalizePackProgressEntry(v[packId]);
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

            if (typeof buildWordPicker === "function") {
                wordPicker = buildWordPicker();
            }
            replayPackQualityToWordPicker(pack.id);
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
    if (!vocabState || typeof vocabState !== "object") vocabState = {};
    // Reset historical run weights to avoid long-term pack selection bias.
    vocabState.runCounts = {};
    saveVocabState();
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

    const secondarySpeechInput = document.getElementById("opt-speech-zh-enabled");
    const secondarySpeechLabel = secondarySpeechInput?.closest("label");
    if (secondarySpeechLabel) {
        const suffixText = getCurrentLanguageMode() === "chinese" ? " 朗读英文释义" : " 朗读中文释义";
        const textNode = Array.from(secondarySpeechLabel.childNodes || []).find(node => node && node.nodeType === Node.TEXT_NODE);
        if (textNode) textNode.nodeValue = suffixText;
        else secondarySpeechLabel.append(document.createTextNode(suffixText));
    }

    if (viewportChanged && startedOnce) {
        if (nowMs() < viewportIgnoreUntilMs) return;
        if (startOverlayActive || (typeof isModalPauseActive === "function" && isModalPauseActive())) return;
        if (typeof pushPause === "function") pushPause();
        else paused = true;
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

// --- First-launch vocab prompt modal ---

function showVocabPromptModal() {
    const modal = document.getElementById("vocab-prompt-modal");
    if (!modal) return;
    const sel = document.getElementById("vocab-prompt-select");
    if (sel) {
        const source = document.getElementById("opt-vocab");
        if (source) sel.innerHTML = source.innerHTML;
        sel.value = settings.vocabSelection || "auto";
    }
    modal.classList.add("visible");
    modal.setAttribute("aria-hidden", "false");
    if (typeof pushPause === "function") pushPause();
    else paused = true;
}

function hideVocabPromptModal() {
    const modal = document.getElementById("vocab-prompt-modal");
    if (!modal) return;
    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");
    if (typeof markVocabPromptSeen === "function") markVocabPromptSeen();
    if (typeof popPause === "function") popPause();
    else paused = false;
}

async function confirmVocabPrompt() {
    const sel = document.getElementById("vocab-prompt-select");
    if (sel) {
        settings.vocabSelection = sel.value || "auto";
        saveSettings();
        await setActiveVocabPack(settings.vocabSelection);
    }
    hideVocabPromptModal();
    showToast("📚 词库已设置");
}

function startWeakWordsPractice() {
    return { status: "not_implemented" };
}

window.startWeakWordsPractice = startWeakWordsPractice;

// --- Bilingual vocabulary support ---

function normalizeWordContent(raw) {
    if (!raw || typeof raw !== "object") return null;
    const word = String(raw.word || raw.en || raw.standardized || "").trim();
    if (!word) return null;
    const mode = String(raw.mode || "bilingual").trim().toLowerCase();
    const normalizedMode = (mode === "english" || mode === "chinese" || mode === "bilingual") ? mode : "bilingual";
    return {
        ...raw,
        word,
        chinese: String(raw.chinese || raw.zh || "").trim(),
        pinyin: String(raw.pinyin || "").trim(),
        phonetic: String(raw.phonetic || raw.uk || raw.us || "").trim(),
        phrase: String(raw.phrase || "").trim(),
        phraseTranslation: String(raw.phraseTranslation || raw.phraseZh || "").trim(),
        difficulty: String(raw.difficulty || "basic").trim(),
        stage: String(raw.stage || "").trim(),
        mode: normalizedMode
    };
}

function getCurrentLanguageMode() {
    const mode = settings.languageMode;
    if (mode === "chinese" || mode === "bilingual") return mode;
    return "english";
}

function shouldKeepByMode(wordObj, languageMode) {
    const mode = String((wordObj && wordObj.mode) || "bilingual").toLowerCase();
    if (mode === "bilingual") return true;
    if (languageMode === "chinese") return mode === "chinese";
    if (languageMode === "bilingual") return mode === "english" || mode === "chinese";
    return mode === "english";
}

function filterWordsByLanguageMode(words, languageMode) {
    if (!Array.isArray(words)) return [];
    return words.filter(item => item && shouldKeepByMode(item, languageMode));
}

function getDisplayContent(wordObj) {
    const safeWord = normalizeWordContent(wordObj) || {
        word: "",
        chinese: "",
        pinyin: "",
        phonetic: "",
        phrase: "",
        phraseTranslation: ""
    };
    const languageMode = getCurrentLanguageMode();
    const primaryEnglish = safeWord.word;
    const primaryChinese = safeWord.chinese;

    if (languageMode === "chinese") {
        return {
            id: primaryEnglish,
            primaryText: primaryChinese || primaryEnglish,
            secondaryText: primaryEnglish,
            phoneticText: safeWord.pinyin,
            phrasePrimary: safeWord.phraseTranslation,
            phraseSecondary: safeWord.phrase
        };
    }

    return {
        id: primaryEnglish,
        primaryText: primaryEnglish,
        secondaryText: primaryChinese,
        phoneticText: safeWord.phonetic,
        phrasePrimary: safeWord.phrase,
        phraseSecondary: safeWord.phraseTranslation
    };
}

window.BilingualVocab = {
    normalizeWordContent,
    getCurrentLanguageMode,
    filterWordsByLanguageMode,
    getDisplayContent
};

