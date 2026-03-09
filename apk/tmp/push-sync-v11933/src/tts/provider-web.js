/**
 * Web TTS Provider
 * 使用浏览器原生 speechSynthesis API
 */

class WebTtsProvider extends BaseTtsProvider {
    constructor() {
        super();
        this.currentUtterance = null;
    }

    speak(text, lang, options = {}) {
        return new Promise((resolve, reject) => {
            if (!("speechSynthesis" in window)) {
                reject(new Error("speechSynthesis not supported"));
                return;
            }

            try {
                // Stop any ongoing speech
                this.stop();

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = lang || "en-US";
                utterance.rate = options.rate || 1.0;
                utterance.pitch = options.pitch || 1.0;
                utterance.volume = options.volume || 1.0;

                // Try to find a suitable voice
                const voices = window.speechSynthesis.getVoices();
                if (voices && voices.length) {
                    const langPrefix = String(lang || "").toLowerCase().split("-")[0];
                    const voice = voices.find(v => String(v.lang || "").toLowerCase().startsWith(langPrefix));
                    if (voice) utterance.voice = voice;
                }

                utterance.onend = () => {
                    this.currentUtterance = null;
                    resolve();
                };

                utterance.onerror = (err) => {
                    this.currentUtterance = null;
                    reject(err);
                };

                this.currentUtterance = utterance;
                window.speechSynthesis.speak(utterance);
            } catch (err) {
                reject(err);
            }
        });
    }

    stop() {
        if (window.speechSynthesis) {
            try {
                window.speechSynthesis.cancel();
            } catch (err) {
                // Ignore errors
            }
        }
        this.currentUtterance = null;
    }

    diagnose() {
        const hasSpeech = "speechSynthesis" in window;
        const voices = hasSpeech && window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
        const voiceCount = voices ? voices.length : 0;

        let error = null;
        if (!hasSpeech) {
            error = "speechSynthesis not supported";
        } else if (voiceCount === 0) {
            error = "No voices available";
        }

        return {
            provider: "web",
            hasSpeech: hasSpeech,
            voices: voiceCount,
            error: error
        };
    }
}

window.WebTtsProvider = WebTtsProvider;
