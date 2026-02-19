# v1.18.16 版本状态

## 已完成
### 1) 版本号同步
- `apk/version.json`: `versionName "1.18.16"`, `versionCode 16`, `buildNumber 16`
- `apk/package.json`: `1.18.16`
- `apk/android-app/package.json`: `1.18.16`
- `apk/android-app/android/app/build.gradle`: `versionName "1.18.16"`, `versionCode 16`

### 2) 本次重点变更
- 需求11：凋零出现频率调整为每隔两个群系切换一次。
- 村庄不计入群系切换计数。
- 玩家进入村庄后，凋零攻击不再造成伤害；离开村庄后恢复攻击。
- 室内模式基础交互链路（自动进屋/室内移动/点位交互）纳入此版本。

### 3) Release 介绍更新
- `.github/workflows/android.yml` 的 Release body 已更新为本次真实变更说明。

---

更新时间：2026-02-19
状态：待推送触发 Actions
