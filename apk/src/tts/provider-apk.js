/**
 * APK TTS Provider
 * 使用 Capacitor TextToSpeech 插件
 */

class ApkTtsProvider extends BaseTtsProvider {
    constructor() {
        super();
        this.ttsPlugin = null;
        this.initialize();
    }

    initialize() {
        try {
            const Cap = window.Capacitor;
            if (!Cap || typeof Cap.isNativePlatform !== "function") return;
            if (!Cap.isNativePlatform()) return;
            if (typeof Cap.isPluginAvailable === "function" && !Cap.isPluginAvailable("TextToSpeech")) return;

            const plugins = Cap.Plugins || {};
            const existing = plugins.TextToSpeech;
            if (existing && typeof existing.speak === "function") {
                this.ttsPlugin = existing;
                return;
            }

            if (typeof Cap.registerPlugin === "function") {
                const registered = Cap.registerPlugin("TextToSpeech");
                if (registered && typeof registered.speak === "function") {
                    this.ttsPlugin = registered;
                }
            }
        } catch (err) {
            // Ignore initialization errors
        }
    }

    speak(text, lang, options = {}) {
        if (!this.ttsPlugin || typeof this.ttsPlugin.speak !== "function") {
            return Promise.reject(new Error("Capacitor TTS plugin not available"));
        }

        try {
            const result = this.ttsPlugin.speak({
                text: String(text),
                lang: String(lang || "en-US"),
                rate: typeof options.rate === "number" ? options.rate : 1.0,
                pitch: typeof options.pitch === "number" ? options.pitch : 1.0,
                volume: typeof options.volume === "number" ? options.volume : 1.0,
                category: "ambient"
            });

            return result && typeof result.then === "function" ? result : Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
    }

    stop() {
        if (this.ttsPlugin && typeof this.ttsPlugin.stop === "function") {
            try {
                this.ttsPlugin.stop();
            } catch (err) {
                // Ignore errors
            }
        }
    }

    diagnose() {
        const available = !!this.ttsPlugin;
        return {
            provider: "apk",
            available: available,
            error: available ? null : "Capacitor TTS plugin not available"
        };
    }
}

window.ApkTtsProvider = ApkTtsProvider;
