/**
 * main.vocab.js - 词汇系统模块
 *
 * 本模块包含游戏词汇相关功能：
 * - 词汇引擎管理
 * - 词库加载和切换
 * - 单词选择算法
 * - 进度追踪
 */

(function() {
    const M = window.MMWG;

    // ============================================
    // 词汇引擎
    // ============================================
    function ensureVocabEngine() {
        if (M.vocabEngine) return M.vocabEngine;
        if (!M.vocabManifest || !M.vocabManifest.packs) return null;
        M.vocabPackOrder = M.vocabManifest.packs.map(p => p.id);
        if (M.vocabManifest.byId) {
            M.vocabPacks = M.vocabManifest.byId;
        } else {
            M.vocabPacks = Object.create(null);
            M.vocabManifest.packs.forEach(p => { M.vocabPacks[p.id] = p; });
        }
        M.vocabEngine = { version: M.vocabManifest.version, packIds: M.vocabPackOrder };
        console.debug("[Vocab] Engine initialized", { version: M.vocabManifest.version, packs: M.vocabPackOrder });
        return M.vocabEngine;
    }

    // ============================================
    // 阶段选项
    // ============================================
    function getStageOptions() {
        if (!M.vocabManifest || !Array.isArray(M.vocabManifest.packs)) return ["auto"];
        const stageSet = new Set();
        M.vocabManifest.packs.forEach(p => {
            const val = String(p.stage || "").trim().toLowerCase();
            if (val) stageSet.add(val);
        });
        const stages = Array.from(stageSet).sort();
        return ["auto", ...stages];
    }

    function populateVocabStageSelect() {
        const select = document.getElementById("opt-vocab-stage");
        if (!select) return;
        const options = getStageOptions();
        const current = select.value || M.settings.vocabStage || "auto";
        select.innerHTML = options.map(stage => {
            const label = stage === "auto" ? "自动/全部" : (M.STAGE_LABELS[stage] || stage);
            return `<option value="${stage}">${label}</option>`;
        }).join("");
        select.value = options.includes(current) ? current : "auto";
    }

    function renderVocabSelect() {
        const sel = document.getElementById("opt-vocab");
        if (!sel) return;
        populateVocabStageSelect();
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
        M.vocabManifest.packs.forEach(p => add(p.id, p.title));
        sel.value = M.settings.vocabSelection || "auto";
    }

    // ============================================
    // 进度管理
    // ============================================
    function getPackProgress(packId) {
        if (!packId) return null;
        const v = M.progress.vocab;
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
        if (!engine || !M.activeVocabPackId) {
            el.innerText = "未加载";
            return;
        }
        const pack = M.vocabPacks[M.activeVocabPackId];
        const pr = getPackProgress(M.activeVocabPackId);
        const total = pr.total || 0;
        const done = pr.uniqueCount || 0;
        const pct = total ? Math.min(100, Math.floor((done / total) * 100)) : 0;
        const title = pack && pack.title ? pack.title : M.activeVocabPackId;
        el.innerText = `${title}  ${done}/${total}  (${pct}%)`;
    }

    function resetVocabRotationAndProgress() {
        M.vocabState = { runCounts: {}, lastPackId: null };
        M.progress = M.normalizeProgress({ vocab: {} });
        M.saveVocabState();
        M.saveProgress();
        updateVocabProgressUI();
    }

    function isPackCompleted(packId) {
        const pr = getPackProgress(packId);
        return !!pr?.completed;
    }

    // ============================================
    // 词库筛选
    // ============================================
    function filterPacksByDifficulty(packs) {
        const pref = String(M.settings.vocabDifficulty || "auto");
        if (pref === "auto" || pref === "mixed") return packs;
        const rank = { basic: 0, intermediate: 1, advanced: 2 };
        const target = rank[pref];
        if (target === undefined) return packs;
        const exact = packs.filter(p => (rank[p.difficulty || "basic"] ?? 0) === target);
        if (exact.length) return exact;
        if (pref === "intermediate") return packs.filter(p => (rank[p.difficulty || "basic"] ?? 0) <= 1);
        if (pref === "advanced") return packs.filter(p => (rank[p.difficulty || "basic"] ?? 0) >= 1);
        return packs;
    }

    function filterPacksByStage(packs) {
        const pref = String(M.settings.vocabStage || "auto").toLowerCase();
        if (pref === "auto") return packs;
        const matches = packs.filter(p => String(p.stage || "").toLowerCase() === pref);
        return matches.length ? matches : packs;
    }

    function pickPackAuto() {
        const engine = ensureVocabEngine();
        if (!engine) return null;
        let candidates = M.vocabManifest.packs.filter(p => !isPackCompleted(p.id));
        if (!candidates.length) {
            M.progress.vocab = {};
            M.saveProgress();
            candidates = [...M.vocabManifest.packs];
        }
        candidates = filterPacksByStage(candidates);
        if (!candidates.length) candidates = [...M.vocabManifest.packs];
        candidates = filterPacksByDifficulty(candidates);
        if (!candidates.length) candidates = [...M.vocabManifest.packs];
        const last = M.vocabState.lastPackId;
        const scored = candidates.map(p => {
            const baseW = Math.max(0.05, Number(p.weight) || 1);
            const count = M.vocabState.runCounts && typeof M.vocabState.runCounts[p.id] === "number" ? M.vocabState.runCounts[p.id] : 0;
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

    // ============================================
    // 词库加载
    // ============================================
    function loadVocabPackFile(file) {
        if (!file) return Promise.reject(new Error("missing vocab file"));
        if (M.loadedVocabFiles[file]) return M.loadedVocabFiles[file];
        console.debug(`[Vocab] Loading file: ${file}`);
        M.loadedVocabFiles[file] = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = file;
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error(`load failed: ${file}`));
            document.head.appendChild(script);
        });
        return M.loadedVocabFiles[file];
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
        const pack = pickId ? M.vocabPacks[pickId] : null;
        if (!pack) return false;

        M.activeVocabPackId = pack.id;
        M.vocabState.lastPackId = pack.id;
        if (!M.vocabState.runCounts) M.vocabState.runCounts = {};
        M.vocabState.runCounts[pack.id] = (M.vocabState.runCounts[pack.id] || 0) + 1;
        M.saveVocabState();

        console.debug("[Vocab] Setting active pack", { selection, pickId, files: pack.files || pack.file });

        try {
            const files = Array.isArray(pack.files) ? [...pack.files] : [];
            if (pack.file) files.push(pack.file);
            if (!files.length) throw new Error(`no vocab files defined for pack ${pack.id}`);
            await Promise.all(files.map(f => loadVocabPackFile(f)));
            const rawList = typeof pack.getRaw === "function" ? pack.getRaw() : [];
            console.debug(`[Vocab] Pack ${pack.id} raw list size`, rawList.length);
            const mapped = [];
            const seen = new Set();
            (Array.isArray(rawList) ? rawList : []).forEach(r => {
                const w = normalizeRawWord(r);
                if (!w) return;
                if (seen.has(w.en)) return;
                seen.add(w.en);
                mapped.push(w);
            });
            const fallbackSource = Array.isArray(M.defaultWords) ? M.defaultWords : [];
            const fallbackWords = fallbackSource.map(w => normalizeRawWord(w)).filter(Boolean);
            let target = mapped.length ? mapped : fallbackWords;
            if (!target.length) {
                console.warn(`[Vocab] Pack ${pack.id} produced no words and no fallback data`);
            }
            if (target.length) {
                M.wordDatabase = target;
                M.wordPicker = null;
                const pr = getPackProgress(pack.id);
                pr.total = target.length;
                M.saveProgress();
            }
        } catch {
            console.error(`[Vocab] Failed to load pack ${pack.id}`, arguments.length ? arguments[0] : undefined);
        }

        renderVocabSelect();
        updateVocabProgressUI();
        return true;
    }

    function switchToNextPackInOrder() {
        const engine = ensureVocabEngine();
        if (!engine) return false;
        const ids = M.vocabPackOrder.length ? M.vocabPackOrder : M.vocabManifest.packs.map(p => p.id);
        const idx = M.activeVocabPackId ? ids.indexOf(M.activeVocabPackId) : -1;
        const keepAuto = (M.settings.vocabSelection || "auto") === "auto";
        for (let step = 1; step <= ids.length; step++) {
            const nextId = ids[(idx + step + ids.length) % ids.length];
            if (!isPackCompleted(nextId)) {
                if (!keepAuto) {
                    M.settings.vocabSelection = nextId;
                    M.saveSettings();
                }
                setActiveVocabPack(nextId);
                return true;
            }
        }
        M.progress.vocab = {};
        M.saveProgress();
        const first = ids[0] || "auto";
        if (!keepAuto) {
            M.settings.vocabSelection = first;
            M.saveSettings();
        }
        setActiveVocabPack(first);
        return true;
    }

    // ============================================
    // 单词选择器
    // ============================================
    function buildWordPicker() {
        const base = Array.isArray(M.wordDatabase) ? M.wordDatabase.filter(w => w && w.en) : [];
        let bag = M.shuffle(base);
        let cursor = 0;
        const intervals = [0, 3, 10, 28, 80, 220];
        const stats = Object.create(null);
        const due = Object.create(null);
        const unseen = M.shuffle(base.map(w => w.en));
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
        if (!M.wordPicker) M.wordPicker = buildWordPicker();
    }

    function pickWordForSpawn() {
        ensureWordPicker();
        const exclude = new Set();
        if (M.settings.avoidWordRepeats) {
            M.items.forEach(i => { if (i && i.wordObj && i.wordObj.en) exclude.add(i.wordObj.en); });
            if (M.lastWord && M.lastWord.en) exclude.add(M.lastWord.en);
        }
        return M.wordPicker.next(exclude);
    }

    // ============================================
    // 进度记录
    // ============================================
    function recordWordProgress(wordObj) {
        if (!wordObj || !wordObj.en) return;
        const en = String(wordObj.en);
        M.sessionWordCounts[en] = (M.sessionWordCounts[en] || 0) + 1;

        if (!M.activeVocabPackId) return;
        const pr = getPackProgress(M.activeVocabPackId);
        if (!pr.total) pr.total = Array.isArray(M.wordDatabase) ? M.wordDatabase.length : 0;
        if (!pr.unique[en]) {
            pr.unique[en] = 1;
            pr.uniqueCount = (pr.uniqueCount || 0) + 1;
            if (pr.total && pr.uniqueCount >= pr.total) {
                pr.completed = true;
                M.saveProgress();
                updateVocabProgressUI();
                const pack = M.vocabPacks[M.activeVocabPackId];
                M.showToast(`${pack?.title || M.activeVocabPackId} 已完成，切换下一个词库`);
                switchToNextPackInOrder();
                return;
            }
            M.saveProgress();
            updateVocabProgressUI();
        }
    }

    function normalizeProgress(raw) {
        const p = raw && typeof raw === "object" ? raw : {};
        if (!p.vocab || typeof p.vocab !== "object") p.vocab = {};
        return p;
    }

    // ============================================
    // 导出到全局
    // ============================================
    Object.assign(M, {
        ensureVocabEngine,
        getStageOptions,
        populateVocabStageSelect,
        renderVocabSelect,
        getPackProgress,
        updateVocabProgressUI,
        resetVocabRotationAndProgress,
        isPackCompleted,
        filterPacksByDifficulty,
        filterPacksByStage,
        pickPackAuto,
        loadVocabPackFile,
        normalizeRawWord,
        setActiveVocabPack,
        switchToNextPackInOrder,
        buildWordPicker,
        ensureWordPicker,
        pickWordForSpawn,
        recordWordProgress,
        normalizeProgress
    });
})();
