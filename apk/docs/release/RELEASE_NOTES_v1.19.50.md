# Release Notes - v1.19.50

**发布日期**: 2026-03-26

## 📋 变更概述
本次发布聚焦 APK 资源同步链路修复，防止测试审计目录相关残留文件被误打包进 APK，同时完成版本元数据同步到 build 101。

## 🐛 Bug 修复
- **APK 资产残留问题**: 将 `android-app/android/app/build.gradle` 中 `syncWebAssets` 从 `Copy` 调整为 `Sync`，避免历史残留文件持续留在 `assets/public`。
- **审计目录误打包风险**: 明确并验证 APK 仅使用 `android-app/web` 作为资源输入，`tests/audit` 与 `tests/audit-output` 不参与 APK 资产同步。

## 🔧 优化改进
- **版本同步**: 统一升级到 `v1.19.50 / build 101`。
- **构建信息同步**: 更新 `android-app/web/build-info.json` 与 `build/build-info.json`。

## 📝 文档更新
- 更新 `docs/release/release-notes.md` 与 `CHANGELOG.md`，补充本次发布记录。

## 🧾 相关 Git 记录
```text
63ab0ff docs: update release-notes.md for v1.19.49
```

---

**完整变更**: 1 commit + 当前发布版本同步改动
