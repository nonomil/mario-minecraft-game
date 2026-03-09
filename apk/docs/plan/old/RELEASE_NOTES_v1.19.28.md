# Release Notes - v1.19.28

**发布日期**: 2026-03-09

## 🐛 Bug 修复

### BOSS 环境系统修复
- 修复 BOSS 专属环境控制器相关问题
- 改进 GameDebug.html 调试功能
- 增强 BOSS 调试控制的 E2E 测试覆盖

## 🔧 工具改进

### 发布流程优化
- 强化 publish-main 拉取逻辑，提升发布稳定性
- 完善版本文档管理

## 🔁 版本号同步

- 版本号：`1.19.28`
- versionCode/buildNumber：`81`

同步文件：
- `version.json`
- `android-app/package.json`
- `android-app/web/build-info.json`
- `android-app/android/app/build.gradle`
- `service-worker.js`
- `Game.html`（资源 cache-busting 参数）

## 📝 相关提交

```
ebc6a89 checkpoint: 22:26
eac6a9b docs: add v1.19.27 changelog entries
d9476ef fix: harden publish-main pull
```

## 📋 完整变更日志

自 v1.19.27 以来的改进：
1. BOSS 环境系统稳定性提升
2. 发布流程健壮性增强
3. 调试工具功能完善
