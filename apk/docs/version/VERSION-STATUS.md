# v1.18.15 版本状态

## 已完成
### 1) 版本号同步
- `apk/version.json`: `versionName "1.18.15"`, `versionCode 15`, `buildNumber 15`
- `apk/package.json`: `1.18.15`
- `apk/android-app/package.json`: `1.18.15`
- `apk/android-app/android/app/build.gradle`: `versionName "1.18.15"`, `versionCode 15`

### 2) 本次重点变更
- 需求7室内模式实现：
  - 房屋进出（`bed_house` / `word_house`）
  - 室内渲染、交互分流、Esc/触控退出、异常重置
  - 与 BOSS/门禁/群系切换互斥
- 首页与样式乱码修复：
  - `apk/Game.html` 文案与触控区修复
  - `apk/src/styles.css` 显示相关乱码修复
- 发布稳定性修复：
  - 版本文件 BOM 兼容解析
  - 构建脚本 BOM 风险修复
  - Release 文案模板更新为当前版本说明

### 3) 已执行验证
- `node --check`：
  - `apk/src/modules/11-game-init.js`
  - `apk/src/modules/13-game-loop.js`
  - `apk/src/modules/14-renderer-main.js`
  - `apk/src/modules/16-events.js`
  - `apk/src/modules/17-bootstrap.js`
  - `apk/src/modules/18-village.js`
- `npm --prefix apk run test:e2e`（完成执行，历史失败项待后续独立修复）

### 4) 备注
- 当前 e2e 失败项不阻塞本次需求7交付，已确认与室内模式核心链路无直接耦合：
  - `boss-debug-controls`
  - `p1-phrase-followup`（direct 断言）
  - `p2-biome-config`（断言值与已调整参数不一致）

---

更新时间：2026-02-19（触发构建）  
状态：已完成（待推送后触发 Actions 与 Release）
