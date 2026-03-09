# Release Notes - v1.19.26

**发布日期**: 2026-03-08

## 🐛 Bug 修复

### BOSS 调试触发修复
修复了 GameDebug.html 中部分 BOSS 触发失败的问题，确保调试入口更加稳定。

### BOSS 战斗文本乱码修复 + 调试能力补全
- 修复 BOSS 战斗文本显示乱码的问题
- 增加末影龙与门禁 BOSS 的调试能力，便于回归与验证

### 开发服务器禁用缓存
为开发服务器增加禁用缓存的 HTTP 响应头，避免本地调试时加载到旧资源导致“改了代码没生效”。

## 🔁 版本号同步

- 版本号：`1.19.26`
- versionCode/buildNumber：`79`

同步文件：
- `package.json`
- `version.json`
- `android-app/package.json`
- `android-app/web/build-info.json`
- `android-app/android/app/build.gradle`
- `service-worker.js`
- `Game.html`（资源 cache-busting 参数）

## 📝 相关提交

```
3167e5d fix: 添加禁用缓存的HTTP响应头到开发服务器
829d869 fix: 修复GameDebug.html中BOSS触发失败问题
9cc1690 fix: 修复BOSS战斗文本乱码，添加末影龙和门禁BOSS调试功能
```
