# v1.15.1 版本状态

## 已完成

### 1) 版本号统一
- `apk/package.json`: `1.15.1`
- `apk/android-app/package.json`: `1.15.1`
- `apk/android-app/android/app/build.gradle`: `versionName "1.15.1"`, `versionCode 92`

### 2) 地狱环境升级（v1.5.2 收尾）
- `apk/src/modules/15-entities-base.js`
  - `Platform` 新增易碎平台状态字段与逻辑（`makeFragile` / `onPlayerStep` / `updateFragile`）
- `apk/src/modules/11-game-init.js`
  - 地狱浮空平台与微平台按概率标记为易碎平台
  - 平台移除后进行清理过滤
- `apk/src/modules/13-game-loop.js`
  - 每帧更新易碎平台状态
  - 玩家踩踏时触发易碎计数与破裂预警
- `apk/src/modules/14-renderer-main.js`
  - 易碎平台新增裂纹渲染反馈

### 3) 文档同步
- 更新版本计划文档中的实现状态：
  - `apk/docs/development/版本计划/11-v1.11.2-雪傀儡与猪灵.md`
  - `apk/docs/development/版本计划/12-v1.11.3-海洋手感与高温掉血节奏.md`
- 更新路线图文档：
  - `apk/docs/development/BOSS设计和海洋地域环境/00-总览-版本路线图.md`
  - `apk/docs/development/BOSS设计和海洋地域环境/10-v1.5.2-地狱环境升级.md`

---

更新时间：2026-02-16  
状态：已完成并进入提测
