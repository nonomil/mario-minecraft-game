# Release Notes - v1.19.31

**发布日期**: 2026-03-09

## 🎮 触控布局修复

### 移动端左右方向键恢复旧版位置
- 手机端地面状态恢复为左下角横排双键布局
- 左右方向键整体下移到底部旧位置
- 左右键间距缩回旧版紧凑手感，不再被十字网格拉开

## 🐉 骑龙兼容

### 龙蛋召唤与骑龙触控保持兼容
- 地面状态继续默认隐藏上下飞行键
- 骑上末影龙后，左侧控制区切换为紧凑 2x2 四键布局
- 保留现有 `up/left/right/down` 按钮和事件绑定，不改动触摸输入逻辑
- 已重新验证骑龙移动与喷火流程

## 🧪 验证结果

- `node tests/unit/dragon-summon-regression.test.mjs`
- `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-summon-dragon-and-gunpowder.spec.mjs`
  - 运行时使用临时端口 `4175`，避开本地已占用的 `4173`

## 🔁 版本号同步

- 版本号：`1.19.31`
- `versionCode/buildNumber`：`84`

同步文件：
- `version.json`
- `package.json`
- `android-app/package.json`
- `android-app/web/build-info.json`
- `android-app/android/app/build.gradle`
- `service-worker.js`
- `Game.html`

## 📝 相关 Git 记录

```text
127f74b checkpoint: 17:12
5b93160 checkpoint: 17:04
fd64de9 fix: 默认隐藏上下飞行按键，只在骑龙时显示
ebff2a5 release: v1.19.30
```

## 📋 完整变更摘要

1. 移动端地面左右方向键恢复到更早版本的底部横排布局。
2. 骑龙时左侧控制区切换为紧凑四键布局，兼容龙蛋召唤后的飞行操作。
3. 补充布局回归测试与骑龙触控 E2E 验证，并同步发布版本元数据。
