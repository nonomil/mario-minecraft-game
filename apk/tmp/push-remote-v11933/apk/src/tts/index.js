/**
 * TTS Provider 抽象层
 * 统一入口，根据平台选择对应的 TTS Provider
 */

/**
 * TTS Provider 接口规范
 * 每个 provider 必须实现以下方法：
 * - speak(text, lang, options) -> Promise
 * - stop() -> void
 * - diagnose() -> Object
 */

class BaseTtsProvider {
    speak(text, lang, options) {
        throw new Error("speak() must be implemented by subclass");
    }

    stop() {
        throw new Error("stop() must be implemented by subclass");
    }

    diagnose() {
        throw new Error("diagnose() must be implemented by subclass");
    }
}

window.BaseTtsProvider = BaseTtsProvider;
