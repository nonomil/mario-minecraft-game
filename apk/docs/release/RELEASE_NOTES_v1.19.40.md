# Release Notes - v1.19.40

## 摘要
本次更新修复 Android APK 入口缺失导致首页弹窗不显示的问题，确保 APK 版本可正常进入游戏。

## 变更详情

### 修复 (Bug Fixes)
- **APK 首页弹窗**: 恢复 `android-app/web/index.html` 输出，避免 APK 无法显示首页弹窗。

## Git 提交记录 (v1.19.39..HEAD)
- `1b23dee`: fix: restore android web index for apk
