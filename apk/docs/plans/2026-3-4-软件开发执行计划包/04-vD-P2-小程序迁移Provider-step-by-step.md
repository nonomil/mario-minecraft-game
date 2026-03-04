# vD（P2）小程序迁移 Provider Step-by-Step

## 目标

将 TTS 从“平台耦合”改为“Provider 抽象”，为小程序落地做准备。

总工时预估：6-12小时。

## Step 0：准备

1. 新建分支：`feature/vD-tts-provider`
2. 先记录当前 `03-audio.js` 的调用路径

## Step 1：创建 TTS 抽象目录

目标文件：
1. `src/tts/index.js`（新）
2. `src/tts/provider-web.js`（新）
3. `src/tts/provider-apk.js`（新）
4. `src/tts/provider-mini.js`（新）

操作：
1. 统一约定：`speak/stop/diagnose`
2. 每个 provider 返回相同结构结果

验收：
1. 三个 provider 能被初始化

## Step 2：接管 `03-audio.js`

目标文件：
1. `src/modules/03-audio.js`

操作：
1. 将 speak 流程改为调用 `window.MMWG_TTS.speak`
2. 保留旧逻辑兜底（过渡期）

验收：
1. Web/APK 发音不退化

## Step 3：实现 mini provider 占位

目标文件：
1. `src/tts/provider-mini.js`
2. `tests/unit/tts-mini-provider.test.mjs`（新）

操作：
1. 非小程序返回 `ok:false + reason`
2. 小程序环境预留真实 API 接口

验收：
1. 在普通浏览器不会抛异常
2. 单测可跑

## Step 4：构建目标注入

目标文件：
1. `scripts/sync-web.js`
2. `config/platform-target.json`（新）
3. `package.json`

操作：
1. 支持 `--target=web|apk|mini`
2. 注入 `window.MMWG_PLATFORM_TARGET`
3. 启动按 target 选择 provider

验收：
1. 同一代码主干支持三目标

## Step 5：回归

命令：
```bash
npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/opt-0226-task1-save-transfer.spec.mjs tests/e2e/specs/opt-0226-task2-review.spec.mjs
```

手工：
1. Web 发音
2. APK 发音
3. target 切换后无主流程回归

## Step 6：提交建议

1. `refactor(vD): introduce tts provider contract`
2. `feat(vD): add mini provider scaffold`
3. `build(vD): add platform target injection`
