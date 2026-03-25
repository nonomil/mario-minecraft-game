/**
 * 09-vocab.js - 词汇系统与词库管理
 * 从 main.js 拆分 (原始行 2103-2495)
 */
const LEGACY_VOCAB_SELECTION_ALIASES = Object.freeze({
    "vocab.kindergarten": "vocab.kindergarten.full",
    "vocab.kindergarten.basic": "vocab.kindergarten.full",
    "vocab.kindergarten.supplement": "vocab.kindergarten.full",
    "vocab.elementary_lower": "vocab.elementary.basic",
    "vocab.elementary_lower.basic": "vocab.elementary.basic",
    "vocab.elementary_lower.supplement": "vocab.elementary.full",
    "vocab.elementary_upper": "vocab.elementary.intermediate",
    "vocab.junior_high": "vocab.junior_high.full",
    "vocab.junior_high.advanced": "vocab.junior_high.full",
    "vocab.minecraft": "vocab.minecraft.full"
});

const BRIDGE_AUTO_SELECTION = "vocab.bridge.auto";
const BRIDGE_PACK_IDS = Object.freeze([
    "vocab.bridge.language",
    "vocab.bridge.math",
    "vocab.bridge.english"
]);
const DIRECT_PINYIN_PACK_IDS = Object.freeze([
    "vocab.kindergarten.pinyin"
]);

const LEGACY_VOCAB_STAGE_FALLBACKS = Object.freeze({
    "vocab.kindergarten": "vocab.kindergarten.full",
    "vocab.elementary": "vocab.elementary.full",
    "vocab.junior_high": "vocab.junior_high.full",
    "vocab.minecraft": "vocab.minecraft.full"
});

function normalizeVocabSelectionId(selection) {
    const raw = String(selection || "").trim();
    if (!raw || raw === "auto") return "auto";
    if (raw === BRIDGE_AUTO_SELECTION) return BRIDGE_AUTO_SELECTION;
    return LEGACY_VOCAB_SELECTION_ALIASES[raw] || raw;
}

function resolveVocabSelectionId(selection) {
    const normalized = normalizeVocabSelectionId(selection);
    if (normalized === BRIDGE_AUTO_SELECTION) return BRIDGE_AUTO_SELECTION;
    if (normalized === "auto") return "auto";

    const engine = ensureVocabEngine();
    if (!engine) return normalized;
    if (vocabPacks[normalized]) return normalized;

    const stageKey = normalized.split(".").slice(0, 2).join(".");
    const stageFallback = LEGACY_VOCAB_STAGE_FALLBACKS[stageKey];
    if (stageFallback && vocabPacks[stageFallback]) return stageFallback;

    const pack = Array.isArray(vocabManifest?.packs)
        ? vocabManifest.packs.find(item => item?.id && item.id.startsWith(`${stageKey}.`))
        : null;
    return pack?.id || "auto";
}

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
    if (typeof merged.bridgeGradeScope !== "string") merged.bridgeGradeScope = defaultSettings.bridgeGradeScope ?? "preschool_grade2";
    if (typeof merged.movementSpeedLevel !== "string" || !(merged.movementSpeedLevel in SPEED_LEVELS)) merged.movementSpeedLevel = "normal";
    if (typeof merged.difficultySelection !== "string" || !merged.difficultySelection) merged.difficultySelection = "auto";
    if (!["off", "direct", "gap2", "hybrid"].includes(String(merged.phraseFollowMode || ""))) merged.phraseFollowMode = "hybrid";
    if (!["balanced", "reinforce_wrong"].includes(String(merged.wordRepeatBias || ""))) merged.wordRepeatBias = "reinforce_wrong";
    if (!["auto", "phone", "tablet"].includes(String(merged.deviceMode || ""))) merged.deviceMode = "auto";
    if (!["english", "chinese", "bilingual", "pinyin"].includes(String(merged.languageMode || ""))) merged.languageMode = "english";
    merged.bridgeGradeScope = normalizeBridgeGradeScope(merged.bridgeGradeScope);
    merged.vocabSelection = normalizeVocabSelectionId(merged.vocabSelection);
    if (merged.languageMode === "pinyin") {
        const currentSelection = String(merged.vocabSelection || "").trim();
        const hasExplicitBridgeOrPinyin = BRIDGE_PACK_IDS.includes(currentSelection)
            || DIRECT_PINYIN_PACK_IDS.includes(currentSelection)
            || currentSelection === BRIDGE_AUTO_SELECTION;
        if (!hasExplicitBridgeOrPinyin) {
            merged.vocabSelection = BRIDGE_AUTO_SELECTION;
        }
    }
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
    if (!currentAccount || !storage || typeof storage.saveAccount !== "function") return;
    currentAccount.vocabulary = currentAccount.vocabulary || {};
    currentAccount.vocabulary.currentPack = normalizeVocabSelectionId(settings.vocabSelection || "");
    storage.saveAccount(currentAccount);
}

function saveProgress() {
    if (storage) storage.saveJson("mmwg:progress", progress);
}

function saveVocabState() {
    if (storage) storage.saveJson("mmwg:vocabState", vocabState);
}

const LEARNING_EVENT_SOURCES = Object.freeze(["vocab", "challenge", "village"]);
const LEARNING_EVENT_RESULTS = Object.freeze(["success", "partial", "fail"]);
const MAX_RECENT_LEARNING_EVENTS = 100;

const LEARNING_REPORT_VERSION = 1;
const LEARNING_REPORT_MAX_DAYS = 120;
const LEARNING_REPORT_PLAYTIME_SAVE_THROTTLE_MS = 15000;
const LEARNING_REPORT_PLAYTIME_MAX_FRAME_DELTA_MS = 5000;
const WORD_QUALITY_DEFAULT = "new";
const WORD_QUALITY_SET = new Set(["new", "correct_fast", "correct_slow", "wrong"]);

function toNonNegativeInt(value, fallback = 0) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.floor(n));
}

function pad2(value) {
    return String(Math.max(0, toNonNegativeInt(value, 0))).padStart(2, "0");
}

function getLocalDayKey(ts = Date.now()) {
    const date = new Date(Number(ts) || Date.now());
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function dayKeyToEpochDay(dayKey) {
    if (!dayKey) return null;
    const parts = String(dayKey).split("-").map(Number);
    if (parts.length !== 3) return null;
    const [year, month, day] = parts;
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
    const date = new Date(year, month - 1, day);
    if (!Number.isFinite(date.getTime())) return null;
    return Math.floor(date.getTime() / 86400000);
}

function isLikelyValidWordKey(wordKey) {
    const key = String(wordKey || "").trim();
    if (!key) return false;
    if (key.length > 80) return false;
    return true;
}

function createEmptyLearningReportState() {
    return {
        version: LEARNING_REPORT_VERSION,
        days: {},
        streak: {
            current: 0,
            lastDayKey: null
        }
    };
}

function normalizeLearningReportWordEntry(raw) {
    const value = raw && typeof raw === "object" ? raw : {};
    const lastTsRaw = Number(value.lastTs);
    return {
        seen: toNonNegativeInt(value.seen, 0),
        correct: toNonNegativeInt(value.correct, 0),
        wrong: toNonNegativeInt(value.wrong, 0),
        lastTs: Number.isFinite(lastTsRaw) && lastTsRaw > 0 ? lastTsRaw : 0,
        primary: value.primary == null ? "" : String(value.primary),
        secondary: value.secondary == null ? "" : String(value.secondary)
    };
}

function normalizeLearningReportDay(raw) {
    const value = raw && typeof raw === "object" ? raw : {};
    const wordsRaw = value.words && typeof value.words === "object" ? value.words : {};
    const challengeRaw = value.challenge && typeof value.challenge === "object" ? value.challenge : {};
    const words = {};
    Object.keys(wordsRaw).forEach((key) => {
        words[key] = normalizeLearningReportWordEntry(wordsRaw[key]);
    });
    return {
        playSeconds: toNonNegativeInt(value.playSeconds, 0),
        words,
        challenge: {
            success: toNonNegativeInt(challengeRaw.success, 0),
            fail: toNonNegativeInt(challengeRaw.fail, 0)
        }
    };
}

function normalizeLearningReportState(raw) {
    const value = raw && typeof raw === "object" ? raw : {};
    const daysRaw = value.days && typeof value.days === "object" ? value.days : {};
    const streakRaw = value.streak && typeof value.streak === "object" ? value.streak : {};

    const dayKeys = Object.keys(daysRaw).filter(Boolean).sort();
    const trimmedKeys = dayKeys.length > LEARNING_REPORT_MAX_DAYS
        ? dayKeys.slice(dayKeys.length - LEARNING_REPORT_MAX_DAYS)
        : dayKeys;

    const days = {};
    trimmedKeys.forEach((dayKey) => {
        days[dayKey] = normalizeLearningReportDay(daysRaw[dayKey]);
    });

    const lastDayKey = streakRaw.lastDayKey == null ? null : String(streakRaw.lastDayKey);

    return {
        version: LEARNING_REPORT_VERSION,
        days,
        streak: {
            current: toNonNegativeInt(streakRaw.current, 0),
            lastDayKey: lastDayKey && /^\d{4}-\d{2}-\d{2}$/.test(lastDayKey) ? lastDayKey : null
        }
    };
}

function ensureLearningReportState() {
    if (!progress || typeof progress !== "object") progress = {};
    progress.learningReport = normalizeLearningReportState(progress.learningReport);
    return progress.learningReport;
}

function ensureLearningReportDay(state, dayKey) {
    if (!state || typeof state !== "object") return null;
    const safeKey = String(dayKey || "").trim();
    if (!safeKey) return null;
    if (!state.days || typeof state.days !== "object") state.days = {};
    state.days[safeKey] = normalizeLearningReportDay(state.days[safeKey]);
    return state.days[safeKey];
}

function updateLearningReportStreak(state, dayKey) {
    if (!state || typeof state !== "object") return;
    state.streak = state.streak && typeof state.streak === "object" ? state.streak : { current: 0, lastDayKey: null };
    const safeDayKey = String(dayKey || "").trim();
    if (!safeDayKey) return;
    if (state.streak.lastDayKey === safeDayKey) return;

    const prev = state.streak.lastDayKey;
    const currentEpoch = dayKeyToEpochDay(safeDayKey);
    const prevEpoch = dayKeyToEpochDay(prev);
    const isNextDay = currentEpoch != null && prevEpoch != null && (currentEpoch - prevEpoch === 1);

    state.streak.current = isNextDay ? Math.max(1, toNonNegativeInt(state.streak.current, 0)) + 1 : 1;
    state.streak.lastDayKey = safeDayKey;
}

function updateLearningReportFromEvent(event) {
    if (!event || typeof event !== "object") return;
    const state = ensureLearningReportState();
    const dayKey = getLocalDayKey(event.ts);
    const day = ensureLearningReportDay(state, dayKey);
    if (!day) return;

    const wordKey = event.wordKey == null ? "" : String(event.wordKey).trim();
    if (isLikelyValidWordKey(wordKey)) {
        day.words = day.words && typeof day.words === "object" ? day.words : {};
        const entry = normalizeLearningReportWordEntry(day.words[wordKey]);
        entry.seen = Math.max(0, toNonNegativeInt(entry.seen, 0)) + 1;
        entry.lastTs = Number(event.ts) || Date.now();

        const primary = String(event.meta?.primary || "").trim();
        const secondary = String(event.meta?.secondary || "").trim();
        if (primary) entry.primary = primary;
        if (secondary) entry.secondary = secondary;

        day.words[wordKey] = entry;

        if (event.source === "challenge") {
            if (event.result === "success") entry.correct = Math.max(0, toNonNegativeInt(entry.correct, 0)) + 1;
            if (event.result === "fail") entry.wrong = Math.max(0, toNonNegativeInt(entry.wrong, 0)) + 1;
            day.words[wordKey] = entry;
        }
    }

    if (event.source === "challenge") {
        day.challenge = day.challenge && typeof day.challenge === "object" ? day.challenge : { success: 0, fail: 0 };
        if (event.result === "success") day.challenge.success = Math.max(0, toNonNegativeInt(day.challenge.success, 0)) + 1;
        if (event.result === "fail") day.challenge.fail = Math.max(0, toNonNegativeInt(day.challenge.fail, 0)) + 1;
    }

    updateLearningReportStreak(state, dayKey);
}

let learningReportPlaytimeLastTickAt = Date.now();
let learningReportPlaytimeCarryMs = 0;
let learningReportPlaytimeLastSaveAt = 0;

function tickLearningReportPlaytime() {
    const now = Date.now();
    const deltaMs = Math.min(
        LEARNING_REPORT_PLAYTIME_MAX_FRAME_DELTA_MS,
        Math.max(0, now - learningReportPlaytimeLastTickAt)
    );
    learningReportPlaytimeLastTickAt = now;

    if (typeof startedOnce !== "undefined" && !startedOnce) return;
    if (typeof paused !== "undefined" && paused) return;

    learningReportPlaytimeCarryMs += deltaMs;
    const addSeconds = Math.floor(learningReportPlaytimeCarryMs / 1000);
    if (addSeconds <= 0) return;
    learningReportPlaytimeCarryMs = learningReportPlaytimeCarryMs % 1000;

    const state = ensureLearningReportState();
    const dayKey = getLocalDayKey(now);
    const day = ensureLearningReportDay(state, dayKey);
    if (!day) return;

    day.playSeconds = Math.max(0, toNonNegativeInt(day.playSeconds, 0)) + addSeconds;

    if (now - learningReportPlaytimeLastSaveAt >= LEARNING_REPORT_PLAYTIME_SAVE_THROTTLE_MS) {
        learningReportPlaytimeLastSaveAt = now;
        saveProgress();
    }
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

function createLearningResultTotals() {
    return {
        success: 0,
        partial: 0,
        fail: 0,
        total: 0
    };
}

function createEmptyLearningProgressState() {
    return {
        recentEvents: [],
        totals: {
            all: createLearningResultTotals(),
            sources: {
                vocab: createLearningResultTotals(),
                challenge: createLearningResultTotals(),
                village: createLearningResultTotals()
            }
        },
        dragonEgg: {
            points: 0,
            stage: 0
        },
        gatePreview: {
            active: false,
            pendingFromBiome: null,
            pendingToBiome: null,
            lastResult: null
        }
    };
}

function normalizeLearningMeta(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return { ...raw };
}

function normalizeLearningResultTotals(raw) {
    const value = raw && typeof raw === "object" ? raw : {};
    const out = createLearningResultTotals();
    LEARNING_EVENT_RESULTS.forEach((key) => {
        out[key] = Math.max(0, toNonNegativeInt(value[key], 0));
    });
    out.total = Math.max(0, toNonNegativeInt(value.total, out.success + out.partial + out.fail));
    return out;
}

function normalizeLearningProgressState(raw) {
    const value = raw && typeof raw === "object" ? raw : {};
    const totals = value.totals && typeof value.totals === "object" ? value.totals : {};
    const sourceTotals = totals.sources && typeof totals.sources === "object" ? totals.sources : {};
    const recentEvents = Array.isArray(value.recentEvents) ? value.recentEvents : [];
    return {
        recentEvents: recentEvents
            .map((event) => {
                const source = LEARNING_EVENT_SOURCES.includes(String(event?.source || "").trim())
                    ? String(event.source).trim()
                    : null;
                const result = LEARNING_EVENT_RESULTS.includes(String(event?.result || "").trim())
                    ? String(event.result).trim()
                    : null;
                if (!source || !result) return null;
                return {
                    source,
                    wordKey: event?.wordKey == null ? null : String(event.wordKey),
                    themeKey: event?.themeKey == null ? null : String(event.themeKey),
                    result,
                    ts: Number(event?.ts) > 0 ? Number(event.ts) : Date.now(),
                    meta: normalizeLearningMeta(event?.meta)
                };
            })
            .filter(Boolean)
            .slice(0, MAX_RECENT_LEARNING_EVENTS),
        totals: {
            all: normalizeLearningResultTotals(totals.all),
            sources: {
                vocab: normalizeLearningResultTotals(sourceTotals.vocab),
                challenge: normalizeLearningResultTotals(sourceTotals.challenge),
                village: normalizeLearningResultTotals(sourceTotals.village)
            }
        },
        dragonEgg: {
            points: Math.max(0, toNonNegativeInt(value.dragonEgg?.points, 0)),
            stage: Math.max(0, toNonNegativeInt(value.dragonEgg?.stage, 0))
        },
        gatePreview: {
            active: !!value.gatePreview?.active,
            pendingFromBiome: value.gatePreview?.pendingFromBiome == null ? null : String(value.gatePreview.pendingFromBiome),
            pendingToBiome: value.gatePreview?.pendingToBiome == null ? null : String(value.gatePreview.pendingToBiome),
            lastResult: value.gatePreview?.lastResult == null ? null : String(value.gatePreview.lastResult)
        }
    };
}

function ensureLearningProgressState() {
    if (!progress || typeof progress !== "object") progress = {};
    progress.learning = normalizeLearningProgressState(progress.learning);
    return progress.learning;
}

function pushLearningEventFeedback(event) {
    if (!event || event.meta?.silent) return;
    const feedbackText = String(event.meta?.feedbackText || "").trim();
    if (!feedbackText || typeof showFloatingText !== "function" || typeof player === "undefined" || !player) return;
    const feedbackColor = String(event.meta?.feedbackColor || "#FFFFFF");
    showFloatingText(feedbackText, player.x, player.y - 52, feedbackColor);
}

function recordLearningEvent(payload) {
    const source = LEARNING_EVENT_SOURCES.includes(String(payload?.source || "").trim())
        ? String(payload.source).trim()
        : null;
    const result = LEARNING_EVENT_RESULTS.includes(String(payload?.result || "").trim())
        ? String(payload.result).trim()
        : null;
    if (!source || !result) return null;

    const state = ensureLearningProgressState();
    const event = {
        source,
        wordKey: payload?.wordKey == null ? null : String(payload.wordKey).trim(),
        themeKey: payload?.themeKey == null ? null : String(payload.themeKey),
        result,
        ts: Date.now(),
        meta: normalizeLearningMeta(payload?.meta)
    };

    state.recentEvents.unshift(event);
    if (state.recentEvents.length > MAX_RECENT_LEARNING_EVENTS) {
        state.recentEvents.length = MAX_RECENT_LEARNING_EVENTS;
    }

    const sourceBucket = state.totals.sources[source] || createLearningResultTotals();
    sourceBucket[result] = Math.max(0, toNonNegativeInt(sourceBucket[result], 0)) + 1;
    sourceBucket.total = Math.max(0, toNonNegativeInt(sourceBucket.total, 0)) + 1;
    state.totals.sources[source] = sourceBucket;

    const allBucket = state.totals.all || createLearningResultTotals();
    allBucket[result] = Math.max(0, toNonNegativeInt(allBucket[result], 0)) + 1;
    allBucket.total = Math.max(0, toNonNegativeInt(allBucket.total, 0)) + 1;
    state.totals.all = allBucket;

    // M3: Update dragon egg growth
    updateDragonEggGrowth(state, source, result);

    updateLearningReportFromEvent(event);

    saveProgress();
    pushLearningEventFeedback(event);
    return event;
}

function getLearningStateSnapshot() {
    return JSON.parse(JSON.stringify(ensureLearningProgressState()));
}

function resetLearningState() {
    if (!progress || typeof progress !== "object") progress = {};
    progress.learning = createEmptyLearningProgressState();
    saveProgress();
    return getLearningStateSnapshot();
}

// ============ M3: Dragon Egg Growth ============

const DRAGON_EGG_GROWTH_POINTS = {
    vocab: { success: 2, partial: 0, fail: 0 },
    challenge: { success: 1, partial: 0, fail: 0 },
    village: { success: 3, partial: 1, fail: 0 }
};

const DRAGON_EGG_STAGE_THRESHOLDS = [20, 50, 100];

const DRAGON_EGG_STAGE_NAMES = [
    "龙蛋（休眠）",
    "龙蛋（微光）",
    "龙蛋（裂纹）",
    "龙蛋（孵化）"
];

function updateDragonEggGrowth(state, source, result) {
    if (!state || !state.dragonEgg) return;

    const pointsConfig = DRAGON_EGG_GROWTH_POINTS[source];
    if (!pointsConfig) return;

    const pointsToAdd = pointsConfig[result] || 0;
    if (pointsToAdd <= 0) return;

    const oldPoints = state.dragonEgg.points || 0;
    const oldStage = state.dragonEgg.stage || 0;

    state.dragonEgg.points = oldPoints + pointsToAdd;

    // Calculate new stage
    let newStage = 0;
    for (let i = 0; i < DRAGON_EGG_STAGE_THRESHOLDS.length; i++) {
        if (state.dragonEgg.points >= DRAGON_EGG_STAGE_THRESHOLDS[i]) {
            newStage = i + 1;
        }
    }

    state.dragonEgg.stage = newStage;

    // Show growth feedback
    if (typeof showFloatingText === "function" && typeof player !== "undefined" && player) {
        showFloatingText(`🐉 龙蛋成长 +${pointsToAdd}`, player.x, player.y - 60, "#9C27B0");
    }

    // Show stage upgrade toast
    if (newStage > oldStage && typeof showToast === "function") {
        const stageName = DRAGON_EGG_STAGE_NAMES[newStage] || `阶段 ${newStage}`;
        showToast(`🥚 龙蛋升级：${stageName}`);
    }
}

function getDragonEggState() {
    const state = ensureLearningProgressState();
    return {
        points: state.dragonEgg.points || 0,
        stage: state.dragonEgg.stage || 0,
        stageName: DRAGON_EGG_STAGE_NAMES[state.dragonEgg.stage || 0] || "未知",
        nextThreshold: DRAGON_EGG_STAGE_THRESHOLDS[state.dragonEgg.stage || 0] || null
    };
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
    p.learning = normalizeLearningProgressState(p.learning);
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

const VOCAB_STAGE_ORDER = ["bridge", "hanzi", "pinyin", "kindergarten", "elementary", "junior_high", "minecraft", "custom"];
const VOCAB_STAGE_LABELS = {
    "bridge": "幼小衔接",
    "hanzi": "汉字",
    "pinyin": "拼音",
    "kindergarten": "幼儿园",
    "elementary": "小学",
    "junior_high": "初中",
    "minecraft": "我的世界",
    "custom": "自定义"
};
const VOCAB_LEVEL_ORDER = ["basic", "intermediate", "advanced", "full"];
const VOCAB_LEVEL_LABELS = {
    "basic": "初级",
    "intermediate": "中级",
    "advanced": "高级",
    "full": "完整"
};
const VOCAB_DIFFICULTY_DISPLAY_LABELS = {
    "basic": "基础",
    "intermediate": "进阶",
    "advanced": "拓展",
    "full": "全阶段",
    "language": "语文",
    "math": "数学",
    "english": "英语"
};

function getVocabPackOptionLabel(pack) {
    const title = String(pack?.title || "").trim();
    if (title) return title;
    const stageLabel = VOCAB_STAGE_LABELS[String(pack?.stage || "").trim()] || "";
    if (pack?.mode === "chinese") return `${stageLabel || "汉字"}词库`;
    if (pack?.mode === "pinyin") return `${stageLabel || "拼音"}词库`;
    const levelLabel = VOCAB_LEVEL_LABELS[pack?.level] || String(pack?.level || "").trim();
    if (levelLabel) return levelLabel;
    return String(pack?.id || "未命名词库").trim() || "未命名词库";
}

function getNormalizedWordIdentity(wordObj) {
    const w = wordObj || {};
    const mode = String(w.mode || "").trim().toLowerCase();
    const primary = String(w.character || w.chinese || w.zh || w.word || w.en || "").trim();
    const secondary = String(w.pinyin || w.english || "").trim();
    if (mode === "chinese") return `zh:${primary || secondary}`;
    if (mode === "pinyin") return `py:${primary}:${secondary}`;
    const englishKey = String(w.en || w.word || w.english || "").trim();
    const chineseKey = String(w.chinese || w.zh || w.character || "").trim();
    return `en:${englishKey}:${chineseKey}`;
}

function getUniqueVocabPackOptionLabels(packs) {
    const labelCounts = new Map();
    packs.forEach((pack) => {
        const label = getVocabPackOptionLabel(pack);
        labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
    });
    return packs.map((pack) => {
        const label = getVocabPackOptionLabel(pack);
        if ((labelCounts.get(label) || 0) <= 1) return [pack.id, label];
        const fallback = String(pack?.id || "").trim().split(".").pop() || "pack";
        return [pack.id, `${label}（${fallback}）`];
    });
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

    // Render grouped options
    VOCAB_STAGE_ORDER.forEach(stage => {
        if (!grouped[stage]) return;
        const group = add(null, VOCAB_STAGE_LABELS[stage] || stage, true);

        if (stage === "bridge") {
            addToGroup(group, BRIDGE_AUTO_SELECTION, "幼小衔接-语文/数学/英语轮询");
        }

        // Sort packs by level
        const packs = grouped[stage].sort((a, b) => {
            const aLevel = a.level || "full";
            const bLevel = b.level || "full";
            return VOCAB_LEVEL_ORDER.indexOf(aLevel) - VOCAB_LEVEL_ORDER.indexOf(bLevel);
        });

        getUniqueVocabPackOptionLabels(packs).forEach(([id, label]) => {
            addToGroup(group, id, label);
        });
    });

    const resolvedSelection = resolveVocabSelectionId(settings.vocabSelection || "auto");
    sel.value = resolvedSelection;
    if (sel.value !== resolvedSelection) sel.value = "auto";
    updateVocabPreview(sel.value);
}

function getVocabPackDisplayTitle(selection, pack) {
    const key = String(selection || "").trim();
    if (key === "auto") return "随机词库（按类别轮换）";
    if (key === BRIDGE_AUTO_SELECTION) return "幼小衔接（语文/数学/英语轮换）";
    const title = String(pack?.title || "").trim();
    return title || getVocabPackOptionLabel(pack);
}

function getVocabPackMetaLabels(selection, pack) {
    const labels = [];
    const key = String(selection || "").trim();
    if (key === "auto") return ["自动轮换"];
    if (key === BRIDGE_AUTO_SELECTION) return ["幼小衔接", "顺序轮换"];
    const stageKey = String(pack?.stage || "").trim();
    const stageLabel = VOCAB_STAGE_LABELS[stageKey] || stageKey;
    if (stageLabel) labels.push(stageLabel);
    if (pack?.mode === "chinese") labels.push("汉字学习");
    else if (pack?.mode === "pinyin") labels.push("拼音学习");
    else {
        const difficultyKey = String(pack?.difficulty || pack?.level || "").trim();
        const difficultyLabel = VOCAB_DIFFICULTY_DISPLAY_LABELS[difficultyKey] || "";
        if (difficultyLabel && difficultyLabel !== stageLabel) labels.push(difficultyLabel);
    }
    return labels;
}

function getActivePackTitle() {
    if (!activeVocabPackId) return getVocabPackDisplayTitle("auto", null);
    const pack = vocabPacks[activeVocabPackId];
    return getVocabPackDisplayTitle(activeVocabPackId, pack);
}

function updateVocabPreview(selection) {
    const preview = document.getElementById("vocab-preview");
    if (!preview) return;
    const key = selection || settings.vocabSelection || "auto";
    const scopeLine = getBridgeGradeScopePreviewLine(key, vocabPacks[key]);
    if (key === "auto") {
        const title = getVocabPackDisplayTitle(key, null);
        preview.innerHTML = `<strong>${title}</strong><br>根据分类自动切换${scopeLine ? `<br>${scopeLine}` : ""}`;
        return;
    }
    if (key === BRIDGE_AUTO_SELECTION) {
        const title = getVocabPackDisplayTitle(key, null);
        preview.innerHTML = `<strong>${title}</strong><br>在语文、数学、英语之间顺序切换${scopeLine ? `<br>${scopeLine}` : ""}`;
        return;
    }
    const pack = vocabPacks[key];
    if (!pack) {
        preview.innerText = "词库数据未就绪";
        return;
    }
    const details = getVocabPackMetaLabels(key, pack);
    if (scopeLine) details.push(scopeLine);
    preview.innerHTML = `<strong>${getVocabPackDisplayTitle(key, pack)}</strong>${details.length ? `<br>${details.join(" · ")}` : ""}`;
}

function showVocabSwitchEffect() {
    const pack = activeVocabPackId ? vocabPacks[activeVocabPackId] : null;
    const title = getVocabPackDisplayTitle(activeVocabPackId, pack);
    const scopeLabel = getBridgeGradeScopePreviewLine(activeVocabPackId, pack);
    const displayTitle = scopeLabel ? `${title} · ${scopeLabel}` : title;
    const px = player ? player.x : cameraX;
    const py = player ? player.y - 60 : canvas.height / 2;
    showFloatingText(`切换词库：${displayTitle}`, px, py);
    showToast(`已切换至 ${displayTitle}`);
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

function getBridgeAutoPackIds() {
    const engine = ensureVocabEngine();
    if (!engine) return [];
    return BRIDGE_PACK_IDS.filter(id => vocabPacks && vocabPacks[id]);
}

function pickBridgeAutoPack() {
    const ids = getBridgeAutoPackIds();
    if (!ids.length) return null;
    if (!vocabState || typeof vocabState !== "object") vocabState = { runCounts: {}, lastPackId: null };
    const last = vocabState.bridgeAutoLastId;
    const idx = last ? ids.indexOf(last) : -1;
    const nextId = ids[(idx + 1 + ids.length) % ids.length];
    vocabState.bridgeAutoLastId = nextId;
    saveVocabState();
    return nextId;
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
    const mode = String(raw.mode || "bilingual").trim().toLowerCase();
    const fallbackEn = String(raw.standardized || raw.word || raw.en || "").trim();
    const zh = String(raw.chinese || raw.zh || raw.translation || "").trim();
    const chinese = String(raw.chinese || zh || "").trim();
    let en = fallbackEn;
    if (mode === "pinyin") {
        const charKey = String(raw.chinese || raw.character || zh || "").trim();
        if (charKey) en = charKey;
    }
    if (!en) return null;
    const examples = Array.isArray(raw.examples)
        ? raw.examples
            .map(item => {
                if (Array.isArray(item)) {
                    return {
                        word: String(item[0] || "").trim(),
                        english: String(item[1] || "").trim()
                    };
                }
                if (!item || typeof item !== "object") return null;
                return {
                    word: String(item.word || "").trim(),
                    english: String(item.english || "").trim()
                };
            })
            .filter(item => item && item.word)
        : [];
    const keywords = Array.isArray(raw.keywords)
        ? raw.keywords.map(item => String(item || "").trim()).filter(Boolean)
        : (raw.keywords ? [String(raw.keywords || "").trim()].filter(Boolean) : []);
    const subject = String(raw.subject || "").trim();
    const moduleName = String(raw.module || "").trim();
    const concept = String(raw.concept || raw.word || en).trim();
    const phonics = String(raw.phonics || raw.phonetic || "").trim();
    return {
        ...raw,
        en,
        zh: zh || "",
        word: String(raw.word || en).trim(),
        chinese,
        pinyin: String(raw.pinyin || "").trim(),
        phonetic: String(raw.phonetic || raw.uk || raw.us || "").trim(),
        phonics,
        subject,
        module: moduleName,
        concept,
        keywords,
        english: String(raw.english || "").trim(),
        character: String(raw.character || raw.chinese || "").trim(),
        examples,
        mode: mode || "bilingual",
        phrase: String(raw.phrase || "").trim() || null,
        phraseZh: String(raw.phraseTranslation || "").trim() || null,
        phraseTranslation: String(raw.phraseTranslation || "").trim() || null,
        imageURLs: Array.isArray(raw.imageURLs) ? raw.imageURLs : []
    };
}

async function setActiveVocabPack(selection) {
    const engine = ensureVocabEngine();
    if (!engine) return false;
    const rawCurrentSelection = String(settings.vocabSelection || "auto").trim() || "auto";
    const rawRequestedSelection = String(selection || rawCurrentSelection).trim() || "auto";
    const requestedSelection = normalizeVocabSelectionId(rawRequestedSelection);
    const resolvedSelection = resolveVocabSelectionId(requestedSelection);
    const shouldPersistResolvedSelection =
        rawCurrentSelection === rawRequestedSelection && rawCurrentSelection !== resolvedSelection;
    if (shouldPersistResolvedSelection) {
        settings.vocabSelection = resolvedSelection;
        saveSettings();
    }
    const pickId = resolvedSelection === BRIDGE_AUTO_SELECTION
        ? (pickBridgeAutoPack() || pickPackAuto())
        : (resolvedSelection === "auto" ? pickPackAuto() : resolvedSelection);
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
            const wordIdentity = getNormalizedWordIdentity(w);
            if (!wordIdentity || seen.has(wordIdentity)) return;
            seen.add(wordIdentity);
            mapped.push(w);
        });
        const fallbackSource = Array.isArray(defaultWords) ? defaultWords : [];
        const fallbackWords = fallbackSource.map(w => normalizeRawWord(w)).filter(Boolean);
        const target = mapped.length ? mapped : fallbackWords;
        const shouldFilterByGradeScope = shouldApplyBridgeGradeScope(pack, target);
        const filteredTarget = shouldFilterByGradeScope
            ? filterWordsByBridgeGradeScope(target, settings.bridgeGradeScope)
            : target;
        const finalTarget = filteredTarget.length ? filteredTarget : target;
        if (shouldFilterByGradeScope && target.length && !filteredTarget.length) {
            console.warn(`[Vocab] Grade scope ${settings.bridgeGradeScope} produced no words for ${pack.id}, fallback to full target`);
        }
        if (!target.length) {
            console.warn(`[Vocab] Pack ${pack.id} produced no words and no fallback data`);
        }
        if (finalTarget.length) {
            wordDatabase = finalTarget;
            wordPicker = null;
            const pr = getPackProgress(pack.id);
            pr.total = finalTarget.length;
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
    const gradeSel = document.getElementById("vocab-prompt-grade-scope");
    if (sel) {
        const source = document.getElementById("opt-vocab");
        if (source) sel.innerHTML = source.innerHTML;
        sel.value = settings.vocabSelection || "auto";
    }
    if (gradeSel) {
        gradeSel.value = normalizeBridgeGradeScope(settings.bridgeGradeScope);
    }
    if (typeof window.syncBridgeGradeScopeVisibility === "function") {
        window.syncBridgeGradeScopeVisibility(settings.languageMode);
    }
    syncBridgeGradeScopePresetState(modal);
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
    const gradeSel = document.getElementById("vocab-prompt-grade-scope");
    if (sel) {
        settings.vocabSelection = sel.value || "auto";
    }
    if (gradeSel) settings.bridgeGradeScope = gradeSel.value || "preschool_grade2";
    settings = normalizeSettings(settings);
    saveSettings();
    await setActiveVocabPack(settings.vocabSelection);
    hideVocabPromptModal();
    showToast("📚 词库已设置");
}

function startWeakWordsPractice() {
    return { status: "not_implemented" };
}

window.startWeakWordsPractice = startWeakWordsPractice;

// --- Bilingual vocabulary support ---

function normalizeBridgeGradeScope(scope) {
    const raw = String(scope || "").trim();
    const aliasMap = {
        "": "preschool_grade2",
        auto: "preschool_grade2",
        preschool: "preschool",
        grade1: "grade1",
        grade2: "grade2",
        preschool_grade1: "preschool_grade1",
        preschool_grade2: "preschool_grade2",
        all: "all",
        学前: "preschool",
        一年级: "grade1",
        二年级: "grade2",
        "学前-一年级": "preschool_grade1",
        "学前到一年级": "preschool_grade1",
        "学前-二年级": "preschool_grade2",
        "学前到二年级": "preschool_grade2",
        全部: "all",
        全部内容: "all"
    };
    return aliasMap[raw] || "preschool_grade2";
}

function getBridgeGradeScopeLabel(scope) {
    const normalized = normalizeBridgeGradeScope(scope);
    const labelMap = {
        preschool: "学前启蒙",
        grade1: "小学一年级",
        grade2: "小学二年级",
        preschool_grade1: "学前到小学一年级",
        preschool_grade2: "学前到小学二年级",
        all: "全部内容"
    };
    return labelMap[normalized] || "学前到小学二年级";
}

function normalizeBridgeGradeBand(gradeBand) {
    const raw = String(gradeBand || "").trim();
    const aliasMap = {
        "": "",
        学前: "学前",
        一年级: "一年级",
        二年级: "二年级",
        "学前-一年级": "学前-一年级",
        学前到一年级: "学前-一年级",
        "学前-二年级": "学前-二年级",
        学前到二年级: "学前-二年级",
        "一年级-二年级": "一年级-二年级",
        一年级到二年级: "一年级-二年级"
    };
    return aliasMap[raw] || raw;
}

function getBridgeScopeTagsFromGradeBand(gradeBand) {
    const normalized = normalizeBridgeGradeBand(gradeBand);
    if (!normalized) return [];
    const explicitMap = {
        学前: ["preschool"],
        一年级: ["grade1"],
        二年级: ["grade2"],
        "学前-一年级": ["preschool", "grade1"],
        "学前-二年级": ["preschool", "grade1", "grade2"],
        "一年级-二年级": ["grade1", "grade2"],
        学前到一年级: ["preschool", "grade1"],
        学前到二年级: ["preschool", "grade1", "grade2"],
        一年级到二年级: ["grade1", "grade2"]
    };
    if (explicitMap[normalized]) return explicitMap[normalized];
    const tags = [];
    if (normalized.includes("学前")) tags.push("preschool");
    if (normalized.includes("一年级")) tags.push("grade1");
    if (normalized.includes("二年级")) tags.push("grade2");
    return [...new Set(tags)];
}

function getBridgeGradeScopeTags(scope) {
    const normalized = normalizeBridgeGradeScope(scope);
    const scopeMap = {
        preschool: ["preschool"],
        grade1: ["grade1"],
        grade2: ["grade2"],
        preschool_grade1: ["preschool", "grade1"],
        preschool_grade2: ["preschool", "grade1", "grade2"],
        all: ["preschool", "grade1", "grade2"]
    };
    return scopeMap[normalized] || scopeMap.preschool_grade2;
}

function getBridgeAllowedGradeBands(scope) {
    const normalized = normalizeBridgeGradeScope(scope);
    const allowMap = {
        preschool: ["学前", "学前-一年级", "学前-二年级"],
        grade1: ["一年级", "学前-一年级", "学前-二年级"],
        grade2: ["二年级", "一年级-二年级", "学前-二年级"],
        preschool_grade1: ["学前", "一年级", "学前-一年级", "学前-二年级"],
        preschool_grade2: ["学前", "一年级", "二年级", "学前-一年级", "一年级-二年级", "学前-二年级"],
        all: ["学前", "一年级", "二年级", "学前-一年级", "一年级-二年级", "学前-二年级"]
    };
    return allowMap[normalized] || allowMap.preschool_grade2;
}

function doesWordMatchBridgeGradeScope(wordObj, scope) {
    const normalizedScope = normalizeBridgeGradeScope(scope);
    if (normalizedScope === "all") return true;
    const normalizedGradeBand = normalizeBridgeGradeBand(wordObj?.gradeBand);
    if (!normalizedGradeBand) return true;
    const allowedGradeBands = getBridgeAllowedGradeBands(normalizedScope);
    if (allowedGradeBands.length) return allowedGradeBands.includes(normalizedGradeBand);
    const gradeTags = getBridgeScopeTagsFromGradeBand(normalizedGradeBand);
    if (!gradeTags.length) return true;
    const scopeTags = getBridgeGradeScopeTags(normalizedScope);
    return gradeTags.some(tag => scopeTags.includes(tag));
}

function filterWordsByBridgeGradeScope(words, scope) {
    if (!Array.isArray(words)) return [];
    return words.filter(item => item && doesWordMatchBridgeGradeScope(item, scope));
}

function shouldApplyBridgeGradeScope(pack, words) {
    if (!Array.isArray(words) || !words.length) return false;
    const packId = String(pack?.id || "").trim();
    const packStage = String(pack?.stage || "").trim().toLowerCase();
    const languageMode = getCurrentLanguageMode();
    if (packStage === "bridge" || packId === "vocab.bridge.full" || packId === BRIDGE_AUTO_SELECTION || BRIDGE_PACK_IDS.includes(packId)) {
        return true;
    }
    if (languageMode === "chinese" || languageMode === "pinyin") {
        return words.some(item => String(item?.gradeBand || "").trim());
    }
    return false;
}

function shouldShowBridgeGradeScope(selection, pack) {
    const languageMode = getCurrentLanguageMode();
    const packId = String(pack?.id || selection || "").trim();
    const packStage = String(pack?.stage || "").trim().toLowerCase();
    return languageMode === "chinese"
        || languageMode === "pinyin"
        || packStage === "bridge"
        || packId === "vocab.bridge.full"
        || packId === BRIDGE_AUTO_SELECTION
        || BRIDGE_PACK_IDS.includes(packId);
}

function getBridgeGradeScopePreviewLine(selection, pack) {
    if (!shouldShowBridgeGradeScope(selection, pack)) return "";
    return `当前层级：${getBridgeGradeScopeLabel(settings.bridgeGradeScope)}`;
}

function syncBridgeGradeScopePresetState(root) {
    const doc = typeof document !== "undefined" ? document : null;
    const scopeRoot = root && typeof root.querySelectorAll === "function"
        ? root
        : (doc && typeof doc.querySelectorAll === "function" ? doc : null);
    if (!scopeRoot) return;
    const groups = Array.from(scopeRoot.querySelectorAll("[data-grade-scope-target]"));
    groups.forEach(group => {
        const targetId = String(group?.dataset?.gradeScopeTarget || "").trim();
        if (!targetId) return;
        const selectEl = doc?.getElementById?.(targetId);
        const currentScope = normalizeBridgeGradeScope(selectEl?.value || settings?.bridgeGradeScope);
        const buttons = Array.from(group.querySelectorAll("[data-bridge-grade-scope]"));
        buttons.forEach(button => {
            const buttonScope = normalizeBridgeGradeScope(button?.dataset?.bridgeGradeScope || "");
            const isActive = buttonScope === currentScope;
            if (button.classList?.toggle) button.classList.toggle("active", isActive);
            if (typeof button.setAttribute === "function") button.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
    });
}

function isBridgeMode() {
    const packId = typeof activeVocabPackId === "string" ? activeVocabPackId : "";
    const pack = packId && typeof vocabPacks === "object" ? vocabPacks[packId] : null;
    const stage = String(pack?.stage || "").toLowerCase();
    const type = String(pack?.type || "").toLowerCase();
    if (stage === "bridge" || type === "bridge") return true;
    return packId.startsWith("vocab.bridge");
}

let cachedHanziPinyinMap = null;
let cachedHanziPinyinMapHasSource = false;
const HANZI_CHAR_RE = /[\u4e00-\u9fff]/;
const BRIDGE_PINYIN_OVERRIDES = new Map();

function getHanziPinyinMap() {
    const root = typeof window !== "undefined" ? window : globalThis;
    const source = Array.isArray(root.kindergartenHanzi) ? root.kindergartenHanzi : [];
    if (cachedHanziPinyinMap && (cachedHanziPinyinMapHasSource || source.length === 0)) {
        return cachedHanziPinyinMap;
    }
    const map = new Map();
    source.forEach(entry => {
        const char = String(entry?.character || entry?.chinese || entry?.word || "").trim();
        const pinyin = String(entry?.pinyin || "").trim();
        if (char.length === 1 && pinyin) {
            map.set(char, pinyin);
        }
    });

    BRIDGE_PINYIN_OVERRIDES.forEach((pinyin, char) => {
        if (!map.has(char)) {
            map.set(char, pinyin);
        }
    });
    cachedHanziPinyinMap = map;
    cachedHanziPinyinMapHasSource = source.length > 0;
    return map;
}

function buildPinyinFromHanzi(text) {
    const map = getHanziPinyinMap();
    if (!map || !map.size) return "";
    const out = [];
    for (const char of String(text || "")) {
        if (!HANZI_CHAR_RE.test(char)) continue;
        const py = map.get(char);
        if (!py) return "";
        out.push(py);
    }
    return out.length ? out.join(" ") : "";
}

function getPinyinFallback(safeWord) {
    const direct = String(safeWord.pinyin || "").trim();
    if (direct) return direct;
    const source = String(safeWord.chinese || safeWord.character || safeWord.word || "").trim();
    if (!source) return "";
    return buildPinyinFromHanzi(source);
}

function joinWordMetaParts(parts, maxParts = 3) {
    return (Array.isArray(parts) ? parts : [])
        .map(part => String(part || "").trim())
        .filter(Boolean)
        .slice(0, maxParts)
        .join(" · ");
}

function formatWordGradeBandLabel(gradeBand) {
    const normalized = String(gradeBand || "").trim();
    if (!normalized) return "";
    const labelMap = {
        "学前": "学前启蒙",
        "一年级": "小学一年级",
        "二年级": "小学二年级",
        "学前-一年级": "学前到小学一年级",
        "学前-二年级": "学前到小学二年级",
        "学前到一年级": "学前到小学一年级",
        "学前到二年级": "学前到小学二年级"
    };
    return labelMap[normalized] || normalized.replace(/-/g, "到");
}

function getWordModuleLabel(moduleName, languageMode, isHanziWord) {
    if (isHanziWord) {
        return languageMode === "pinyin" ? "识字拼读" : "识字组词";
    }
    switch (String(moduleName || "").trim()) {
        case "词语":
            return "词语积累";
        case "拓展词汇":
            return "拓展识词";
        case "表达":
            return "情境表达";
        case "古诗":
            return "古诗诵读";
        case "识字":
            return "识字组词";
        default:
            return languageMode === "pinyin" ? "拼音练习" : String(moduleName || "").trim();
    }
}

function getWordMetaText(safeWord, languageMode) {
    const subject = String(safeWord?.subject || "").trim().toLowerCase();
    const stage = String(safeWord?.stage || "").trim().toLowerCase();
    const moduleName = String(safeWord?.module || "").trim();
    const gradeBand = String(safeWord?.gradeBand || "").trim();
    const isHanziWord = Boolean(safeWord?.character && safeWord?.examples && safeWord.examples.length);
    if (isHanziWord || stage === "bridge") return "";
    const stageLabel = isHanziWord
        ? "汉字模式"
        : (stage === "bridge" ? "幼小衔接" : (stage === "kindergarten" ? "幼儿园" : ""));
    const moduleLabel = subject === "language"
        ? getWordModuleLabel(moduleName, languageMode, isHanziWord)
        : moduleName;
    return joinWordMetaParts([stageLabel, moduleLabel, formatWordGradeBandLabel(gradeBand)]);
}

function getWordTipText(safeWord, languageMode) {
    const subject = String(safeWord?.subject || "").trim().toLowerCase();
    const moduleName = String(safeWord?.module || "").trim();
    const gradeBand = String(safeWord?.gradeBand || "").trim();
    const textLength = [...String(safeWord?.chinese || safeWord?.character || safeWord?.word || "").trim()].length;
    const isHanziWord = Boolean(safeWord?.character && safeWord?.examples && safeWord.examples.length);
    const stage = String(safeWord?.stage || "").trim().toLowerCase();

    if (isHanziWord || stage === "bridge") return "";

    if (isHanziWord) {
        return languageMode === "pinyin"
            ? "看汉字，读拼音，再说组词"
            : (gradeBand === "学前" ? "先认一认字形，再借组词记住它" : "先认字，再读拼音，再看组词");
    }

    if (subject === "language") {
        if (languageMode === "pinyin") return textLength >= 4 ? "先按拼音分段，再连成词组" : "拼音对应汉字，注意声调";
        if (moduleName === "表达") return "联系生活场景，把话说完整";
        if (moduleName === "古诗") return "先读顺，再想画面和节奏";
        if (moduleName === "拓展词汇") return gradeBand.includes("二年级") ? "联系课文和生活场景理解词义" : "联系生活场景理解词义";
        if (moduleName === "词语") return "先认词，再说它常出现的场景";
        return "先认词，再理解意思";
    }

    if (subject === "math") return "先看概念，再找关键词";
    if (subject === "english") return "先认读，再看拼读";
    return "";
}

function normalizeWordContent(raw) {
    if (!raw || typeof raw !== "object") return null;
    const word = String(raw.word || raw.en || raw.standardized || "").trim();
    if (!word) return null;
    const mode = String(raw.mode || "bilingual").trim().toLowerCase();
    const normalizedMode = (mode === "english" || mode === "chinese" || mode === "bilingual" || mode === "pinyin")
        ? mode
        : "bilingual";
    const keywords = Array.isArray(raw.keywords)
        ? raw.keywords.map(item => String(item || "").trim()).filter(Boolean)
        : (raw.keywords ? [String(raw.keywords || "").trim()].filter(Boolean) : []);
    return {
        ...raw,
        word,
        chinese: String(raw.chinese || raw.zh || "").trim(),
        pinyin: String(raw.pinyin || "").trim(),
        english: String(raw.english || "").trim(),
        character: String(raw.character || raw.chinese || "").trim(),
        examples: Array.isArray(raw.examples) ? raw.examples : [],
        phonetic: String(raw.phonetic || raw.uk || raw.us || "").trim(),
        phonics: String(raw.phonics || "").trim(),
        subject: String(raw.subject || "").trim(),
        module: String(raw.module || "").trim(),
        concept: String(raw.concept || raw.word || "").trim(),
        keywords,
        phrase: String(raw.phrase || "").trim(),
        phraseTranslation: String(raw.phraseTranslation || raw.phraseZh || "").trim(),
        gradeBand: String(raw.gradeBand || "").trim(),
        difficulty: String(raw.difficulty || "basic").trim(),
        stage: String(raw.stage || "").trim(),
        mode: normalizedMode
    };
}

function getCurrentLanguageMode() {
    const mode = settings.languageMode;
    if (mode === "chinese" || mode === "bilingual" || mode === "pinyin") return mode;
    return "english";
}

function shouldKeepByMode(wordObj, languageMode) {
    const mode = String((wordObj && wordObj.mode) || "bilingual").toLowerCase();
    if (mode === "bilingual") return true;
    if (languageMode === "chinese") return mode === "chinese";
    if (languageMode === "pinyin") return mode === "pinyin";
    if (languageMode === "bilingual") return mode === "english" || mode === "chinese";
    return mode === "english";
}

function filterWordsByLanguageMode(words, languageMode) {
    if (!Array.isArray(words)) return [];
    return words.filter(item => item && shouldKeepByMode(item, languageMode));
}

function getBridgeDisplayContent(safeWord, languageMode) {
    const subject = String(safeWord.subject || "").trim().toLowerCase();
    const primaryEnglish = safeWord.english || safeWord.word;
    const primaryChinese = safeWord.chinese || safeWord.word;
    const pinyinText = safeWord.pinyin;
    const phonicsText = safeWord.phonics || safeWord.phonetic || safeWord.english || safeWord.word;
    const conceptText = safeWord.concept || safeWord.word || primaryChinese || primaryEnglish;
    const keywordText = Array.isArray(safeWord.keywords) && safeWord.keywords.length
        ? String(safeWord.keywords[0] || "").trim()
        : (safeWord.module || primaryChinese || primaryEnglish);
    const metaText = getWordMetaText(safeWord, languageMode);
    const tipText = getWordTipText(safeWord, languageMode);

    if (subject === "english") {
        return {
            id: primaryEnglish,
            primaryText: primaryEnglish,
            secondaryText: phonicsText || primaryEnglish,
            phoneticText: safeWord.phonetic,
            phrasePrimary: safeWord.phrase,
            phraseSecondary: safeWord.phraseTranslation,
            metaText,
            tipText
        };
    }

    if (subject === "math") {
        return {
            id: conceptText,
            primaryText: conceptText,
            secondaryText: keywordText,
            phoneticText: safeWord.phonetic,
            phrasePrimary: safeWord.phrase,
            phraseSecondary: safeWord.phraseTranslation,
            metaText,
            tipText
        };
    }

    const isSamePrimary = Boolean(primaryEnglish && primaryChinese && String(primaryEnglish).trim() === String(primaryChinese).trim());
    const fallbackEnglish = isSamePrimary ? "" : primaryEnglish;

    if (languageMode === "chinese") {
        return {
            id: primaryChinese || primaryEnglish,
            primaryText: primaryChinese || primaryEnglish,
            secondaryText: pinyinText || fallbackEnglish,
            phoneticText: pinyinText,
            phrasePrimary: safeWord.phraseTranslation,
            phraseSecondary: safeWord.phrase,
            metaText,
            tipText
        };
    }

    if (languageMode === "pinyin") {
        return {
            id: primaryChinese || primaryEnglish,
            primaryText: pinyinText || primaryChinese || primaryEnglish,
            secondaryText: primaryChinese || fallbackEnglish,
            phoneticText: pinyinText,
            phrasePrimary: safeWord.phrase,
            phraseSecondary: "",
            metaText,
            tipText
        };
    }

    return {
        id: primaryEnglish || primaryChinese,
        primaryText: primaryEnglish || primaryChinese,
        secondaryText: isSamePrimary ? (pinyinText || "") : (primaryChinese || pinyinText),
        phoneticText: safeWord.phonetic,
        phrasePrimary: safeWord.phrase,
        phraseSecondary: safeWord.phraseTranslation,
        metaText,
        tipText
    };
}

function getDisplayContent(wordObj) {
    const safeWord = normalizeWordContent(wordObj) || {
        word: "",
        chinese: "",
        pinyin: "",
        english: "",
        character: "",
        examples: [],
        phonetic: "",
        phonics: "",
        subject: "",
        module: "",
        concept: "",
        keywords: [],
        phrase: "",
        phraseTranslation: ""
    };
    const languageMode = getCurrentLanguageMode();
    const primaryEnglish = safeWord.word;
    const primaryChinese = safeWord.chinese;
    const isHanziWord = Boolean(safeWord.character && safeWord.examples && safeWord.examples.length);
    const metaText = getWordMetaText(safeWord, languageMode);
    const tipText = getWordTipText(safeWord, languageMode);

    if (isBridgeMode() && safeWord.subject) {
        return getBridgeDisplayContent(safeWord, languageMode);
    }

    if (isHanziWord) {
        const primaryCharacter = safeWord.character || primaryChinese || primaryEnglish;
        const groupText = safeWord.phraseTranslation || safeWord.phrase || safeWord.english || "";
        const meaningText = safeWord.english || safeWord.phrase || "";
        if (languageMode === "pinyin") {
            return {
                id: primaryCharacter,
                primaryText: primaryCharacter,
                secondaryText: safeWord.pinyin || groupText || primaryCharacter,
                phoneticText: safeWord.pinyin,
                phrasePrimary: groupText,
                phraseSecondary: "",
                metaText,
                tipText
            };
        }
        return {
            id: primaryCharacter,
            primaryText: primaryCharacter,
            secondaryText: safeWord.pinyin || groupText || safeWord.english || primaryEnglish,
            phoneticText: safeWord.pinyin,
            phrasePrimary: groupText,
            phraseSecondary: meaningText,
            metaText,
            tipText
        };
    }

    if (languageMode === "chinese") {
        return {
            id: primaryEnglish,
            primaryText: primaryChinese || primaryEnglish,
            secondaryText: primaryEnglish,
            phoneticText: safeWord.pinyin,
            phrasePrimary: safeWord.phraseTranslation,
            phraseSecondary: safeWord.phrase,
            metaText,
            tipText
        };
    }

    if (languageMode === "pinyin") {
        const fallbackPinyin = getPinyinFallback(safeWord);
        return {
            id: primaryChinese || primaryEnglish,
            primaryText: primaryChinese || primaryEnglish,
            secondaryText: fallbackPinyin || safeWord.pinyin || "",
            phoneticText: fallbackPinyin || safeWord.pinyin,
            phrasePrimary: safeWord.phrase,
            phraseSecondary: "",
            metaText,
            tipText
        };
    }

    return {
        id: primaryEnglish,
        primaryText: primaryEnglish,
        secondaryText: primaryChinese,
        phoneticText: safeWord.phonetic,
        phrasePrimary: safeWord.phrase,
        phraseSecondary: safeWord.phraseTranslation,
        metaText,
        tipText
    };
}

function getWordDisplayPair(wordObj) {
    const display = getDisplayContent(wordObj) || {};
    return {
        primary: String(display.primaryText || "").trim(),
        secondary: String(display.secondaryText || "").trim()
    };
}

function getWordKey(wordObj) {
    const display = getDisplayContent(wordObj) || {};
    const id = String(display.id || "").trim();
    if (id) return id;
    const safeWord = normalizeWordContent(wordObj) || {};
    return String(safeWord.word || safeWord.en || safeWord.english || safeWord.chinese || "").trim();
}

window.BilingualVocab = {
    normalizeWordContent,
    getCurrentLanguageMode,
    normalizeBridgeGradeScope,
    getBridgeGradeScopeLabel,
    doesWordMatchBridgeGradeScope,
    filterWordsByBridgeGradeScope,
    syncBridgeGradeScopePresetState,
    filterWordsByLanguageMode,
    getDisplayContent,
    getWordDisplayPair,
    getWordKey,
    isBridgeMode
};

