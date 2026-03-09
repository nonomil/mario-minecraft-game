/**
 * 03-audio.js - 音频系统 (BGM、TTS、音效)
 * 从 main.js 拆分 (原始行 599-824)
 */
function ensureAudioContext() {
    if (audioCtx) return audioCtx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    return audioCtx;
}

function ensureSpeechReady() {
    if (!("speechSynthesis" in window)) return false;
    try {
        if (window.speechSynthesis.getVoices) {
            window.speechSynthesis.getVoices();
        }
        window.speechSynthesis.resume();
        speechReady = true;
        return true;
    } catch {
        return false;
    }
}

function ensureSpeechVoices() {
    if (!("speechSynthesis" in window)) return false;
    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    if (voices && voices.length) {
        speechVoicesReady = true;
        return true;
    }
    if (!ensureSpeechVoices.bound && window.speechSynthesis.addEventListener) {
        ensureSpeechVoices.bound = true;
        window.speechSynthesis.addEventListener("voiceschanged", () => {
            const updated = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
            if (updated && updated.length) {
                speechVoicesReady = true;
                if (speechPendingWord) {
                    const pending = speechPendingWord;
                    speechPendingWord = null;
                    setTimeout(() => {
                        speakWord(pending);
                    }, 0);
                }
            }
        });
    }
    return false;
}

function pickVoice(langPrefix) {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    if (!voices || !voices.length) return null;
    const lang = String(langPrefix || "").toLowerCase();
    return voices.find(v => String(v.lang || "").toLowerCase().startsWith(lang)) || null;
}

function getNativeTts() {
    try {
        const Cap = window.Capacitor;
        if (!Cap || typeof Cap.isNativePlatform !== "function") return null;
        if (!Cap.isNativePlatform()) return null;
        if (typeof Cap.isPluginAvailable === "function" && !Cap.isPluginAvailable("TextToSpeech")) return null;

        const plugins = Cap.Plugins || {};
        const existing = plugins.TextToSpeech;
        if (existing && typeof existing.speak === "function") return existing;

        if (typeof Cap.registerPlugin === "function") {
            const registered = Cap.registerPlugin("TextToSpeech");
            if (registered && typeof registered.speak === "function") return registered;
        }

        return null;
    } catch {
        return null;
    }
}

function speakNativeTts(tts, text, lang, rate, queueStrategy) {
    if (!tts || typeof tts.speak !== "function") return false;
    if (!text) return false;
    try {
        const result = tts.speak({
            text: String(text),
            lang: String(lang || ""),
            rate: typeof rate === "number" ? rate : 1.0,
            pitch: 1.0,
            volume: 1.0,
            category: "ambient",
            // Ensure EN->ZH does not cancel EN on Android (default may flush).
            // Capacitor TextToSpeech expects string strategies like QUEUE_ADD/QUEUE_FLUSH.
            queueStrategy: queueStrategy || "QUEUE_ADD"
        });
        // Some implementations return a Promise.
        if (result && typeof result.catch === "function") {
            result.catch(() => {});
        }
        return true;
    } catch {
        return false;
    }
}

function normalizeSpeechText(primary, fallback) {
    const main = primary == null ? "" : String(primary);
    const alt = fallback == null ? "" : String(fallback);
    const trimmed = main.trim();
    if (trimmed) return trimmed;
    const altTrimmed = alt.trim();
    return altTrimmed || "";
}

function buildOnlineTtsUrl(text, lang) {
    const safeLang = String(lang || "").toLowerCase().startsWith("zh") ? "zh-CN" : "en";
    return `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(safeLang)}&q=${encodeURIComponent(text)}`;
}

function playOnlineTtsSequence(sequence) {
    const items = Array.isArray(sequence) ? sequence.filter(it => it && it.text) : [];
    if (!items.length) return false;

    ttsSeqId += 1;
    const seq = ttsSeqId;

    if (!ttsAudio) {
        ttsAudio = new Audio();
        ttsAudio.preload = "auto";
        ttsAudio.volume = 1;
    }

    const playAt = idx => {
        if (seq !== ttsSeqId) return;
        const item = items[idx];
        if (!item) return;

        const url = buildOnlineTtsUrl(item.text, item.lang);
        try {
            ttsAudio.onended = () => playAt(idx + 1);
            ttsAudio.onerror = () => playAt(idx + 1);
            try { ttsAudio.pause(); } catch {}
            try { ttsAudio.currentTime = 0; } catch {}
            ttsAudio.src = url;
            const playPromise = ttsAudio.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {});
            }
        } catch {
        }
    };

    playAt(0);
    return true;
}

function setupBgm() {
    if (bgmAudio) return bgmAudio;
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.35;
    const src = BGM_SOURCES.find(Boolean);
    if (src) audio.src = src;
    bgmAudio = audio;
    bgmReady = !!src;
    return bgmAudio;
}

function applyBgmSetting() {
    setupBgm();
    if (!bgmAudio) return;
    const enabled = !!settings.musicEnabled;
    if (!enabled) {
        try { bgmAudio.pause(); } catch {}
        return;
    }
    if (!audioUnlocked) return;
    const playPromise = bgmAudio.play();
    if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
    }
}

function unlockAudio() {
    audioUnlocked = true;
    const ctx = ensureAudioContext();
    if (ctx && ctx.state === "suspended") {
        try { ctx.resume(); } catch {}
    }
    ensureSpeechReady();

    // Some browsers/WebViews block TTS until the first user gesture.
    // If a word was queued before unlock, speak it once unlock happens.
    if (settings.speechEnabled && speechPendingUnlockWord) {
        const pending = speechPendingUnlockWord;
        speechPendingUnlockWord = null;
        setTimeout(() => {
            if (pending && settings.speechEnabled) speakWord(pending);
        }, 0);
    }
    applyBgmSetting();
}

function wireAudioUnlock() {
    if (wireAudioUnlock.bound) return;
    wireAudioUnlock.bound = true;
    document.addEventListener("pointerdown", unlockAudio, { passive: true });
    document.addEventListener("touchstart", unlockAudio, { passive: true });
    document.addEventListener("keydown", unlockAudio);
}

function playHitSfx(intensity = 1) {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = 180 + Math.min(1, Math.max(0, intensity)) * 180;
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
}
