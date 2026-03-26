# Release Notes - v1.19.51

**发布日期**: 2026-03-26

## 📋 变更概述
本次发布聚焦 APK 首页 UI 构建入口一致性，修复打包链路中 `android-app/web/index.html` 被构建产物覆盖导致的 APK 页面不一致问题，并完成版本元数据同步。

## ✨ 新功能
- 无

## 🐛 Bug 修复
- **APK 首页 UI 与源码不一致**: `build:apk` 和 `build:apk:release` 不再在打包前自动执行 `npm run build`，避免覆盖 `android-app/web/index.html`。
- **打包入口回归预期**: APK 直接使用 `android-app/web/index.html` 作为首页来源，确保你在该文件的 UI 修改可进入 APK。

## 🔧 优化改进
- **版本同步**: 统一升级到 `v1.19.51 / build 102`。
- **构建信息同步**: 更新 `android-app/web/build-info.json` 与 `build/build-info.json`。

## 📝 文档更新
- 更新 `CHANGELOG.md` 与 `docs/release/release-notes.md`。

## 🎯 下一步计划
- 如需保留离线单文件构建链路，可追加独立脚本（例如 `build:apk:offline`）用于显式选择，不影响默认 APK 直打包入口。

---

**完整变更**: 0 commits + uncommitted changes
