# v1.18.22 版本状态

## 1) 版本号说明
- 仓库基线已更新为 `1.18.22`。
- 推送到 `main` 后，GitHub Actions 会自动执行 patch 递增并发布下一版本（`1.18.23`）。
- 发布流程会自动回写：
  - `apk/version.json`
  - `apk/package.json`
  - `apk/android-app/package.json`
  - `apk/android-app/android/app/build.gradle`

## 2) 本次重点变更（0220-2）
- 修复首页血量、钻石兑换、背包/护甲/道具提示等多处乱码文案。
- 移除村庄单词屋遮挡图标，避免遮挡角色。
- 交易屋改为点击菜单交互，不再使用输入数字。
- 狐狸改为专用形象渲染，并支持非樱花群系低概率刷新。
- 恢复村庄生成默认间隔参数，避免村庄过密。
- 修复 `20-enemies-new.js` 注释断行导致的语法问题。

## 3) Release 说明
- `.github/workflows/android.yml` 的 Release body 已更新为中文，并同步 0220-2 变更说明。

更新时间：2026-02-20
状态：待推送并触发 Actions
