/**
 * main.audio.js - 音频系统模块
 *
 * 本模块包含游戏的所有音频相关功能：
 * - 音频上下文管理
 * - 背景音乐控制
 * - 音效播放
 * - 语音合成（TTS）
 */

(function() {
    const M = window.MMWG;
    let speechVoicesReady = false;
    let speechPendingWord = null;
    let speechPendingTimer = null;
    let speechPendingAttempts = 0;

    // ============================================
    // 音频上下文管理
    // ============================================
    function ensureAudioContext() {
        if (M.audioCtx) return M.audioCtx;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        M.audioCtx = new Ctx();
        return M.audioCtx;
    }

    function ensureSpeechReady() {
        if (!("speechSynthesis" in window)) return false;
        try {
            if (window.speechSynthesis.getVoices) {
                window.speechSynthesis.getVoices();
            }
            window.speechSynthesis.resume();
            M.speechReady = true;
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

    // ============================================
    // 背景音乐管理
    // ============================================
    function setupBgm() {
        if (M.bgmAudio) return M.bgmAudio;
        const audio = new Audio();
        audio.loop = true;
        audio.preload = "auto";
        audio.volume = 0.35;
        const src = M.BGM_SOURCES.find(Boolean);
        if (src) audio.src = src;
        M.bgmAudio = audio;
        M.bgmReady = !!src;
        return M.bgmAudio;
    }

    function applyBgmSetting() {
        setupBgm();
        if (!M.bgmAudio) return;
        const enabled = !!M.settings.musicEnabled;
        if (!enabled) {
            try { M.bgmAudio.pause(); } catch {}
            return;
        }
        if (!M.audioUnlocked) return;
        const playPromise = M.bgmAudio.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
        }
    }

    // ============================================
    // 音频解锁
    // ============================================
    function unlockAudio() {
        M.audioUnlocked = true;
        const ctx = ensureAudioContext();
        if (ctx && ctx.state === "suspended") {
            try { ctx.resume(); } catch {}
        }
        ensureSpeechReady();
        applyBgmSetting();
    }

    function wireAudioUnlock() {
        if (wireAudioUnlock.bound) return;
        wireAudioUnlock.bound = true;
        document.addEventListener("pointerdown", unlockAudio, { passive: true });
        document.addEventListener("touchstart", unlockAudio, { passive: true });
        document.addEventListener("keydown", unlockAudio);
    }

    // ============================================
    // 音效播放
    // ============================================
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

    // ============================================
    // 语音合成（TTS）
    // ============================================
    function speakWord(wordObj) {
        M.lastWord = wordObj;
        if (M.updateWordUI) M.updateWordUI(wordObj);
        if (M.bumpWordDisplay) M.bumpWordDisplay();
        if (M.showWordCard) M.showWordCard(wordObj);

        if (!M.settings.speechEnabled) return;
        if (!("speechSynthesis" in window)) return;
        ensureSpeechReady();
        const voicesReady = ensureSpeechVoices();
        if (!voicesReady && speechPendingAttempts < 2) {
            speechPendingWord = wordObj;
            speechPendingAttempts += 1;
            if (!speechPendingTimer) {
                speechPendingTimer = setTimeout(() => {
                    speechPendingTimer = null;
                    if (speechPendingWord && M.settings.speechEnabled) {
                        const pending = speechPendingWord;
                        speechPendingWord = null;
                        speakWord(pending);
                    }
                }, 600);
            }
            return;
        }
        speechPendingAttempts = 0;

        try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
            const uEn = new SpeechSynthesisUtterance(wordObj.en);
            uEn.lang = "en-US";
            const enVoice = pickVoice("en");
            if (enVoice) uEn.voice = enVoice;
            uEn.rate = Math.max(1.0, Number(M.settings.speechEnRate) || 1.0);
            const uZh = new SpeechSynthesisUtterance(wordObj.zh);
            uZh.lang = "zh-CN";
            const zhVoice = pickVoice("zh");
            if (zhVoice) uZh.voice = zhVoice;
            uZh.rate = Number(M.settings.speechZhRate) || 0.9;
            if (wordObj.zh) {
                uEn.onend = () => {
                    try { window.speechSynthesis.speak(uZh); } catch {}
                };
            }
            window.speechSynthesis.speak(uEn);
        } catch {
        }
    }

    // ============================================
    // 导出到全局
    // ============================================
    Object.assign(M, {
        ensureAudioContext,
        ensureSpeechReady,
        pickVoice,
        setupBgm,
        applyBgmSetting,
        unlockAudio,
        wireAudioUnlock,
        playHitSfx,
        speakWord
    });
})();
