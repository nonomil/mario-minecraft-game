# v1.11.1 版本发布状态

## 已完成

### 1. 版本号统一
- `apk/package.json`: `1.11.0` -> `1.11.1`
- `apk/android-app/package.json`: `1.11.0` -> `1.11.1`
- `apk/android-app/android/app/build.gradle`: `versionName "1.11.1"`, `versionCode 87`

### 2. Bug 修复
- `apk/src/modules/11-game-init.js`: 添加 BOSS 竞技场和村庄系统状态重置
- `apk/src/modules/18-village.js`: 添加 villageConfig/settings/player/biomeConfigs 空值检查
- `apk/src/modules/13-game-loop.js`: showFloatingText() 增加第4个颜色参数
- `apk/src/modules/14-renderer-main.js`: 渲染浮动文字时使用 color 属性

### 3. 代码同步
- apk 完善版 BOSS/村庄模块反向同步到 root 目录
- GameDebug.html 调试工具复制到 root/tests/debug-pages/

---

**更新日期**: 2026-02-16
**状态**: Bug 修复与代码同步完成，版本号同步到 v1.11.1
