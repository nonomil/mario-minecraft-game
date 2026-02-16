/**
 * 09-vocab.js - 词汇系统与词库管理
 * 从 main.js 拆分 (原始行 2103-2495)
 */
function normalizeSettings(raw) {
    const merged = mergeDeep(defaultSettings, raw || {});
    if (typeof merged.speechEnRate !== "number") merged.speechEnRate = defaultSettings.speechEnRate ?? 0.8;
    if (typeof merged.speechZhRate !== "number") merged.speechZhRate = defaultSettings.speechZhRate ?? 0.9;
    if (typeof merged.speechZhEnabled !== "boolean") merged.speechZhEnabled = defaultSettings.speechZhEnabled ?? false;
    if (typeof merged.musicEnabled !== "boolean") merged.musicEnabled = defaultSettings.musicEnabled ?? true;
    if (typeof merged.uiScale !== "number") merged.uiScale = defaultSettings.uiScale ?? 1.0;
    if (typeof merged.motionScale !== "number") merged.motionScale = defaultSettings.motionScale ?? 1.25;
    if (typeof merged.biomeSwitchStepScore !== "number") merged.biomeSwitchStepScore = defaultSettings.biomeSwitchStepScore ?? 200;
    if (typeof merged.wordGateEnabled !== "boolean") merged.wordGateEnabled = defaultSettings.wordGateEnabled ?? true;
    if (typeof merged.wordMatchEnabled !== "boolean") merged.wordMatchEnabled = defaultSettings.wordMatchEnabled ?? true;
    if (typeof merged.wordCardDuration !== "number") merged.wordCardDuration = defaultSettings.wordCardDuration ?? 900;
    if (typeof merged.movementSpeedLevel !== "string" || !(merged.movementSpeedLevel in SPEED_LEVELS)) merged.movementSpeedLevel = "normal";
    if (typeof merged.difficultySelection !== "string" || !merged.difficultySelection) merged.difficultySelection = "auto";
    merged.biomeSwitchStepScore = Math.max(50, Math.min(2000, Number(merged.biomeSwitchStepScore) || 200));
    merged.wordCardDuration = Math.max(600, Math.min(3000, Number(merged.wordCardDuration) || 900));
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

    // === 新增：答题统计数据 (v1.6.0) ===
    if (!p.challengeStats || typeof p.challengeStats !== "object") p.challengeStats = {};
    // 结构：p.challengeStats["apple"] = { correct: 3, wrong: 1, lastSeen: 1707900000000 }

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
    add("auto", "随机词库（按类别轮换）");
    const engine = ensureVocabEngine();
    if (!engine) return;
    vocabManifest.packs.forEach(p => add(p.id, p.title));
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
    const previousLayout = {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
    };
    const visualViewport = getViewportSize();
    // Use the safe-area-adjusted game area for canvas + physics scaling.
    const gameArea = getGameAreaSize();
    applyConfig(gameArea);
    const viewportChanged = gameArea.width !== lastViewport.width || gameArea.height !== lastViewport.height;
    lastViewport = { width: gameArea.width, height: gameArea.height };

    if (viewportChanged && startedOnce) {
        realignWorldForViewport(previousLayout);
    }

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
        touch.classList.toggle("visible", enabled);
        touch.setAttribute("aria-hidden", enabled ? "false" : "true");
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

/**
 * 获取答题统计数据 (v1.6.0 新增)
 * @returns {Object} 统计对象
 */
function getChallengeStats() {
    const stats = progress.challengeStats || {};
    const words = Object.keys(stats);

    let totalCorrect = 0, totalWrong = 0;
    words.forEach(w => {
        totalCorrect += stats[w].correct || 0;
        totalWrong += stats[w].wrong || 0;
    });

    const total = totalCorrect + totalWrong;

    return {
        wordCount: words.length,           // 答题涉及单词数
        totalCorrect: totalCorrect,        // 总答对次数
        totalWrong: totalWrong,            // 总答错次数
        accuracy: total > 0 ? Math.round(totalCorrect / total * 100) : 0,  // 正确率
        details: stats                     // 详细数据
    };
}

/**
 * 从当前词库随机取一个单词 (v1.6.1 新增)
 * @returns {Object|null} 单词对象或null
 */
function pickNextWord() {
    if (!wordDatabase || !wordDatabase.length) return null;

    // 从已加载的 wordDatabase 中随机取一个
    const idx = Math.floor(Math.random() * wordDatabase.length);
    return wordDatabase[idx];
}

/**
 * 获取需要复习的单词列表（基于间隔重复算法）(v1.6.3 新增)
 * @param {number} count - 需要复习的单词数量（默认3个）
 * @returns {Array} 单词对象数组
 */
function getWordsForReview(count) {
    count = count || 3;
    const stats = progress.challengeStats || {};
    const now = Date.now();
    const candidates = [];

    // 从答题记录中找出"该复习"的单词
    for (const word in stats) {
        const s = stats[word];
        const total = (s.correct || 0) + (s.wrong || 0);
        if (total === 0) continue;

        // 间隔策略：答对越多，复习间隔越长
        const level = Math.min(s.correct || 0, 5);
        const intervals = [
            0,           // level 0: 立即
            60000,       // level 1: 1分钟
            300000,      // level 2: 5分钟
            900000,      // level 3: 15分钟
            3600000,     // level 4: 1小时
            86400000     // level 5: 1天
        ];

        const nextReview = (s.lastSeen || 0) + (intervals[level] || 0);

        if (now >= nextReview) {
            // 计算优先级：错误率高的 + 久未复习的优先
            const errorRate = (s.wrong || 0) / total;
            const timeSince = now - (s.lastSeen || 0);

            candidates.push({
                word: word,
                priority: errorRate * 100 + timeSince / 60000  // 归一化优先级
            });
        }
    }

    // 按优先级排序，取前N个
    candidates.sort((a, b) => b.priority - a.priority);

    // 返回完整的 wordObj
    return candidates.slice(0, count).map(c => {
        const found = wordDatabase.find(w => w.en === c.word);
        return found || { en: c.word, zh: stats[c.word]?.zh || "" };
    });
}

