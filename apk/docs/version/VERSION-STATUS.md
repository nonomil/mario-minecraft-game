# v1.18.22 版本状态

## 1) 版本号说明
- 仓库基线已更新为 `1.18.21`。
- 推送到 `main` 后，GitHub Actions 会自动执行 patch 递增并发布 `1.18.22`。
- 发布流程会自动回写：
  - `apk/version.json`
  - `apk/package.json`
  - `apk/android-app/package.json`
  - `apk/android-app/android/app/build.gradle`

## 2) 本次重点变更（0220）
- 村庄/室内显示优化（文案与可读性、村民尺寸）。
- BOSS 血量翻倍 + 血条阶段文案统一。
- BOSS 战武器锁定为剑，避免误切武器。
- 门禁小 BOSS 轮换，不再固定凋零。
- 商人屋：卖材料换钻石、买护甲。
- 防晒霜：5 钻，180 秒，联动环境减伤。
- 末影珍珠：60 秒隐身，隐身期间免伤。

## 3) Release 说明
- `.github/workflows/android.yml` 的 Release body 已更新为中文，并同步 0220 全量变更说明。

---
# v1.18.17 版本状态

## 1) 版本号说明
- 本次提交不手动修改 `apk/version.json`，由 GitHub Actions 在发布流程中自动递增到 `1.18.17`（避免重复递增）。
- 发布后会自动回写：`apk/version.json`、`apk/package.json`、`apk/android-app/package.json`、`apk/android-app/android/app/build.gradle`。

## 2) 本次重点变更
- 需求12：室内模式保持角色形象（优先使用 `drawSteve` 渲染）。
- 进屋后角色出生点位于房间中间。
- 室内左右移动速度限制为正常速度上限的 50%。
- 交互点布局调整为两侧：门口一侧、床/单词测试点另一侧。
- 室内改为“靠近自动触发”交互，无需按键。
- 在门口/床/测试点增加文字提示，降低学习与操作成本。

## 3) Release 介绍
- 已更新 `.github/workflows/android.yml` 中的 Release “What's New” 文案，覆盖需求11与需求12改动。

---

更新时间：2026-02-20
状态：待推送并触发 Actions

