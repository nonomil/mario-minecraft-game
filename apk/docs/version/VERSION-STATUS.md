# v1.8.17 版本发布状态

## 已完成

### 1. 版本号统一
- `apk/package.json`: `1.8.10` -> `1.8.17`
- `apk/android-app/package.json`: `1.8.10` -> `1.8.17`
- `apk/android-app/package-lock.json`: `1.8.10` -> `1.8.17`
- `apk/android-app/android/app/build.gradle`: `versionName "1.8.17"`, `versionCode 77`

### 2. 版本日志补齐
- 更新 `apk/docs/version/CHANGELOG.md`，补入 `v1.8.12 ~ v1.8.17`
- 更新 `apk/docs/version/Progress.md`，补入 `v1.8.12 ~ v1.8.17`

### 3. Release 显示对齐说明
- GitHub Actions `android.yml` 的 release 标题读取 `apk/android-app/package.json`。
- 已更新该文件后，后续 release 页面将显示 `Mario Minecraft Game v1.8.17`。

## 待执行

1. 触发一次新的 Android 构建工作流，验证 release 页面版本显示。
2. 安装新 APK，确认 App 内版本与 Release 版本一致。

---

**更新日期**: 2026-02-16
**状态**: 版本号与日志已同步到 v1.8.17
