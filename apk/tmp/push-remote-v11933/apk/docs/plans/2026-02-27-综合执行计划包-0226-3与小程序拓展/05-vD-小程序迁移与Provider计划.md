# vD 小程序迁移与 Provider 计划（落地版）

## 目标

统一语音调用层，确保 APK/Web/小程序三端可复用业务逻辑。

## 周期

1. Day 10-11：Provider 抽象。
2. Day 12：小程序 provider 占位实现。
3. Day 13：构建 target 注入。

## Task 1：抽象统一 TTS 接口

文件：
1. `src/tts/index.js`（新）
2. `src/tts/provider-web.js`（新）
3. `src/tts/provider-apk.js`（新）
4. `src/tts/provider-mini.js`（新）
5. `src/modules/03-audio.js`

步骤：
1. 定义统一接口 `speak/stop/diagnose`。
2. 业务层仅依赖 `window.MMWG_TTS`。
3. 保留老逻辑兜底一版，避免一次性切断。

验收：
1. `03-audio.js` 不再直接耦合平台细节。
2. Web/APK 功能不退化。

## Task 2：mini provider（先 mock）

文件：
1. `src/tts/provider-mini.js`
2. `tests/unit/tts-mini-provider.test.mjs`（新）

步骤：
1. 增加环境探测。
2. 非小程序环境返回明确 `reason`。
3. 小程序环境预留真实 API 接口。

验收：
1. 本地运行不报错。
2. 结果可诊断。

## Task 3：构建目标注入

文件：
1. `scripts/sync-web.js`
2. `config/platform-target.json`（新）
3. `package.json`

步骤：
1. 支持 `--target=web|apk|mini`。
2. 构建注入 `window.MMWG_PLATFORM_TARGET`。
3. 启动时按 target 选择 provider。

验收：
1. 三端同一代码主干可运行。
2. 切换 target 不需要改业务代码。

## vD DoD

1. 统一 Provider 可用。
2. 小程序接入路径明确。
3. 构建系统支持目标切换。
