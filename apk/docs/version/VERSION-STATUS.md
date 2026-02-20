# v1.18.24 版本状态

## 1) 版本号说明
- 仓库基线已更新为 `1.18.24`。
- 推送到 `main` 后，GitHub Actions 会自动执行 patch 递增并发布下一版本（`1.18.25`）。
- 发布流程会自动回写：
  - `apk/version.json`
  - `apk/package.json`
  - `apk/android-app/package.json`
  - `apk/android-app/android/app/build.gradle`

## 2) 本次重点变更（0220-3）
- 修复室内和交易触控“要长按/点两次”问题，统一为单次点击稳定触发。
- 交互键与切换武器键加入去重复触发保护（`!e.repeat`）。
- 室内宝箱触发加冷却，避免门口自动离开逻辑冲突。
- 主角新增护甲外观叠层，装备后即时可见。
- 护甲减伤改为按护甲类型固定值优先，强化不同护甲的体感差异。

## 3) Release 说明
- `.github/workflows/android.yml` 的 Release body 已同步更新为 0220-3 变更说明。

更新时间：2026-02-20
状态：待推送并触发 Actions