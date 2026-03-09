# vC Web TTS 与 PWA 基线计划（落地版）

## 目标

让网页端可稳定演示、可快速排障，为小程序迁移做技术底座。

## 周期

1. Day 7：TTS 诊断能力。
2. Day 8：设置页语音自检。
3. Day 9：PWA 注册与缓存更新。

## Task 1：TTS 诊断 API

文件：
1. `src/modules/03-audio.js`

步骤：
1. 增加 `window.diagnoseTts()`。
2. 返回 `hasSpeech/audioUnlocked/speechEnabled/providerHint`。

验收：
1. 控制台调用返回结构化结果。
2. 用于售后定位“能力/权限/配置”问题。

## Task 2：设置页语音自检入口

文件：
1. `Game.html`
2. `src/modules/16-events.js`
3. `src/styles.css`

步骤：
1. 新增“语音自检”按钮和结果区。
2. 点击后运行 `diagnoseTts()` 并输出可读结果。
3. 增加“复制结果”按钮（可选）。

验收：
1. 普通用户不用开发工具就能自检。
2. 结果可截图用于售后。

## Task 3：PWA 基线补齐

文件：
1. `src/modules/17-bootstrap.js`
2. `service-worker.js`
3. `version.json`

步骤：
1. 启动时注册 SW。
2. 缓存名绑定版本号。
3. 更新时清理旧缓存。

验收：
1. SW 成功注册。
2. 发布新版本后不会长期卡旧资源。

## 回归建议

```bash
npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/opt-0226-task7-pwa.spec.mjs
```

## vC DoD

1. 网页发音问题可被诊断。
2. PWA 更新可控。
3. 网页端可用于演示与引流承接。
