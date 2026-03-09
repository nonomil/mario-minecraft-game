# vC（P1）Web TTS 与 PWA Step-by-Step

## 目标

让 Web 端可诊断、可自检、可更新，作为小程序迁移前置稳定端。

总工时预估：4-8小时。

## Step 0：准备

1. 新建分支：`feature/vC-web-tts-pwa`
2. 本地启动：`npm run dev`

## Step 1：实现 TTS 诊断 API

目标文件：
1. `src/modules/03-audio.js`

操作：
1. 增加 `diagnoseTts()`
2. 返回字段：
   - `hasSpeech`
   - `audioUnlocked`
   - `speechEnabled`
   - `providerHint`
3. 挂到 `window.diagnoseTts`

验收：
1. 浏览器控制台可调用并返回对象

## Step 2：设置页语音自检入口

目标文件：
1. `Game.html`
2. `src/modules/16-events.js`
3. `src/styles.css`

操作：
1. 增加 `#btn-tts-self-check` 与结果区
2. 点击后执行 `diagnoseTts()` 并渲染文本
3. 可选：增加“复制结果”按钮

验收：
1. 用户无需开发工具也能自检

## Step 3：补齐 SW 注册

目标文件：
1. `src/modules/17-bootstrap.js`

操作：
1. 启动后检查 `serviceWorker in navigator`
2. 注册 `./service-worker.js`
3. 失败只 warn，不阻塞主流程

验收：
1. DevTools 可看到 SW 被注册

## Step 4：版本化缓存策略

目标文件：
1. `service-worker.js`
2. `version.json`

操作：
1. 缓存名绑定版本号
2. activate 时清旧缓存
3. 新版本后旧缓存自动替换

验收：
1. 更新版本后页面不再长期卡旧资源

## Step 5：回归

命令：
```bash
npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/opt-0226-task7-pwa.spec.mjs
```

手工：
1. 自检按钮可用
2. TTS 正常/失败可提示
3. SW 正常注册

## Step 6：提交建议

1. `feat(vC): add tts diagnostics and self-check ui`
2. `fix(vC): register service worker in bootstrap`
3. `fix(vC): add versioned cache strategy`
