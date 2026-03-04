/**
 * Mini Program TTS Provider
 * 小程序 TTS 占位实现
 */

class MiniTtsProvider extends BaseTtsProvider {
    constructor() {
        super();
        this.isMiniProgram = this.detectMiniProgram();
    }

    detectMiniProgram() {
        // 检测是否在小程序环境
        // 微信小程序
        if (typeof wx !== "undefined" && wx.getSystemInfoSync) {
            return "wechat";
        }
        // 支付宝小程序
        if (typeof my !== "undefined" && my.getSystemInfoSync) {
            return "alipay";
        }
        // 其他小程序环境可以在这里添加
        return null;
    }

    speak(text, lang, options = {}) {
        if (!this.isMiniProgram) {
            return Promise.reject(new Error("Not in miniprogram environment"));
        }

        // 占位实现：预留真实 API 接口
        // TODO: 实现小程序 TTS API 调用
        if (this.isMiniProgram === "wechat") {
            // 微信小程序 TTS API (需要实际实现)
            // wx.createInnerAudioContext() 或其他 API
            return Promise.reject(new Error("WeChat miniprogram TTS not implemented yet"));
        } else if (this.isMiniProgram === "alipay") {
            // 支付宝小程序 TTS API (需要实际实现)
            return Promise.reject(new Error("Alipay miniprogram TTS not implemented yet"));
        }

        return Promise.reject(new Error("Miniprogram TTS not implemented"));
    }

    stop() {
        // 占位实现
        // TODO: 停止小程序 TTS 播放
    }

    diagnose() {
        return {
            provider: "mini",
            environment: this.isMiniProgram || "none",
            available: false,
            error: this.isMiniProgram
                ? "Miniprogram TTS not implemented yet"
                : "Not in miniprogram environment"
        };
    }
}

window.MiniTtsProvider = MiniTtsProvider;
