# vB（P1）学习体验增强 Step-by-Step

## 目标

增强“学习效果可见性”和“答题即时反馈”。

总工时预估：6-10小时。

## Step 0：准备

1. 新建分支：`feature/vB-learning-feedback`
2. 先跑现有统计相关测试，确认基线

## Step 1：学习趋势模块（7天）

目标文件：
1. `src/modules/08-account.js`
2. `src/styles.css`

操作：
1. 在 `renderLearningStats()` 增加“最近7天学习”区域
2. 数据源先从 account.stats 或 account.vocabulary 推导
3. 无数据显示“暂无学习记录”

验收：
1. 档案页看到趋势区
2. 空数据不卡死

## Step 2：本周 vs 上周对比

目标文件：
1. `src/modules/08-account.js`

操作：
1. 增加周维度聚合函数
2. 输出文案：本周学习词数/正确率 vs 上周
3. 方向箭头：↑/↓

验收：
1. 对比结果可见
2. 不出现 undefined 文案

## Step 3：弱词行动入口（占位）

目标文件：
1. `src/modules/08-account.js`
2. `src/modules/09-vocab.js`（后续可接）

操作：
1. 在弱词区新增按钮 `弱词专项练习`
2. 第一期先做占位提示（toast）
3. 第二期再接真实练习模式

验收：
1. 按钮存在且可点击
2. 不影响现有弱词列表

## Step 4：成就维度深化

目标文件：
1. `src/modules/01-config.js`
2. `src/modules/08-account.js`

操作：
1. 新增成就：`streak_3`、`streak_7`、`perfect_run`、`night_owl`
2. 给每个成就映射真实统计字段（metric）
3. 进度条统一使用 `getAchievementProgress()`

验收：
1. 新成就可显示
2. 对应行为后进度会变

## Step 5：挑战音效增强

目标文件：
1. `src/modules/03-audio.js`
2. `src/modules/12-challenges.js`
3. `src/modules/16-events.js`
4. `Game.html`

操作：
1. 新增 `playChallengeCorrectSfx`、`playChallengeWrongSfx`
2. 在答题结果分支触发对应音效
3. 增加设置项 `opt-sfx`

验收：
1. 答对/答错有不同反馈音
2. 关闭开关后完全静音

## Step 6：回归

命令：
```bash
npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/opt-0226-task5-learning-stats.spec.mjs tests/e2e/specs/opt-0226-task6-achievement-progress.spec.mjs
```

手工：
1. 趋势显示
2. 成就进度变化
3. 音效可开关

## Step 7：提交建议

1. `feat(vB): add 7-day learning trend and weekly comparison`
2. `feat(vB): expand achievements and progress mapping`
3. `feat(vB): add challenge sfx and toggle`
