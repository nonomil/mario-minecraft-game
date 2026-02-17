# v1.18.1 版本状态

## 已完成

### 1) 版本号同步
- `apk/package.json`: `1.18.1`
- `apk/android-app/package.json`: `1.18.1`
- `apk/android-app/android/app/build.gradle`: `versionName "1.18.1"`, `versionCode 102`

### 2) 调试页更新（P3-1）
- `apk/tests/debug-pages/GameDebug.html`
  - 群系轮次设置（biomeVisitCount）
  - 学习挑战快捷触发（长词/短语/双空补全）
  - 敌人快捷生成扩展（含 drowned/guardian/pufferfish）
  - 状态面板扩展：群系停留信息、BOSS 锁场状态、群系轮次快照

### 3) 调试辅助接口（P3-1）
- `apk/src/modules/06-biome.js`
  - 新增 `setBiomeVisitRound()`
  - 新增 `getBiomeVisitCountSnapshot()`
  - 新增 `getBiomeStayDebugInfo()`

### 4) 全量回归测试（P3-2）
- 全量 `npm test` 通过（31/31）
- 稳定性修复：
  - `tests/biomes-fullrun.spec.js` 启动/过渡流程增强，降低超时误报
  - `tests/p0-stability.spec.js` BOSS 作用域判定修正

### 5) 兼容收尾
- `apk/src/modules/11-game-init.js` 移除旧 `bossSpawned` 残留赋值

---

更新时间：2026-02-17
状态：已完成
