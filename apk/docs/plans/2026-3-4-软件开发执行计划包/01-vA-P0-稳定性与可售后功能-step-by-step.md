# vA（P0）稳定性与可售后功能 Step-by-Step

## 目标

完成三个高优先功能：

1. 设置页“测试发音”
2. 档案页“备份/恢复存档”快捷入口
3. 学习统计“正确率”

总工时预估：4-6小时。

## Step 0：准备

1. 切到项目目录：`mario-minecraft-game_V1/apk`
2. 新建分支：`feature/vA-tts-save-stats`
3. 记录当前基线：`git status`

## Step 1：给设置页加“测试发音”按钮（UI）

目标文件：
1. `Game.html`

操作：
1. 在 settings 区域新增按钮：`id="btn-speech-test"`
2. 文案：`测试发音`
3. 放在朗读设置附近

检查：
1. 打开页面能看到按钮
2. 不挤压移动端布局

## Step 2：绑定“测试发音”逻辑

目标文件：
1. `src/modules/16-events.js`
2. `src/modules/12-challenges.js`

操作：
1. 在 `wireSettingsModal()` 中获取 `btn-speech-test`
2. 点击时执行：
   - 若 `settings.speechEnabled` 为 false，toast 提示先开启朗读
   - 否则调用 `speakWord({ en: "hello", zh: "你好" })`
3. try/catch 包裹，异常时提示失败原因

检查：
1. 点击后有发音或有失败提示
2. 不影响原有设置保存流程

## Step 3：在档案页加“备份/恢复存档”快捷入口

目标文件：
1. `Game.html`
2. `src/modules/08-account.js`

操作：
1. 在 `#profile-modal` 的 `profile-actions` 中新增两个按钮：
   - `id="btn-profile-export-save"`
   - `id="btn-profile-import-save"`
2. 在 `wireProfileModal()` 中绑定这两个按钮：
   - 导出 -> `handleExportSave`
   - 导入 -> `handleImportSave`

检查：
1. 档案页打开即可看到两个按钮
2. 点击可触发导出/导入流程

## Step 4：学习统计增加“正确率”

目标文件：
1. `src/modules/08-account.js`

操作：
1. 在 `renderLearningStats(account)` 中统计：
   - `totalCorrect`
   - `totalWrong`
   - `accuracy = totalCorrect / (totalCorrect + totalWrong)`
2. 新增统计卡：`正确率 <strong>xx%</strong>`
3. 无数据时显示 `0%`

检查：
1. 档案页统计区可见正确率
2. 百分比计算不出现 NaN

## Step 5：补测试（建议）

建议新增：
1. `tests/e2e/specs/opt-vA-task1-speech-test-button.spec.mjs`
2. `tests/e2e/specs/opt-vA-task2-profile-save-shortcuts.spec.mjs`

复用修改：
1. `tests/e2e/specs/opt-0226-task5-learning-stats.spec.mjs`（增加正确率断言）

## Step 6：执行回归

命令：
```bash
npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/opt-0226-task1-save-transfer.spec.mjs tests/e2e/specs/opt-0226-task5-learning-stats.spec.mjs
```

手工：
1. 设置页测试发音
2. 档案页备份/恢复
3. 正确率显示

## Step 7：提交与回滚点

提交建议：
1. `feat(vA): add speech self-test in settings`
2. `feat(vA): add profile save export/import shortcuts`
3. `feat(vA): add learning accuracy metric`

回滚点：
1. 若发音按钮影响设置页可用性，先回滚 Step 2
2. 若统计异常，保留弱词功能并回滚正确率卡片
