# Release Notes - v1.19.27

**发布日期**: 2026-03-08

## 🔧 工具改进

### push.bat 输出优化
- **静默成功URL输出**：修复 push.bat 成功后输出多余 URL 的问题，使输出更加简洁
- **稳定化输出**：改进 push.bat 的输出稳定性，确保推送流程信息清晰可读

## 🔁 版本号同步

- 版本号：`1.19.27`
- versionCode/buildNumber：`80`

同步文件：
- `version.json`
- `android-app/package.json`
- `android-app/web/build-info.json`
- `android-app/android/app/build.gradle`
- `service-worker.js`
- `Game.html`（资源 cache-busting 参数）

## 📝 相关提交

```
bc20ceb fix: silence push.bat success url
c2c3a9c fix: stabilize push.bat output
```

## 📋 完整变更日志

自 v1.19.26 以来的改进：
1. 优化了 push.bat 脚本的输出格式
2. 移除了不必要的成功 URL 显示
3. 提升了推送流程的用户体验
