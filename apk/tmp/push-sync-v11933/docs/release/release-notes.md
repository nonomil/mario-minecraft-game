# Release Notes

## v1.19.33 (2026-03-09)

### 📚 Vocabulary Packs
- **启动器 / localhost / 离线单文件 / APK 词库切换链路统一修复**:
  - 修复 `启动游戏.bat` 打开的 `http://localhost:4173/Game.html`、离线 `android-app/web/index.html`、以及 APK 单文件产物中“词库 id 已切换但真实词库数组未切换”的问题
  - 单文件构建器现在支持从 single-quoted manifest 路径提取词库文件，并强制内联所有本地 `src/*.js` / `words/vocabs/*.js` 脚本
  - 为 `vocab.minecraft.intermediate`、`vocab.minecraft.full`、`vocab.kindergarten.hanzi` 补齐浏览器兼容导出，避免切换后退回默认词库
  - 设置保存时立即同步 `currentAccount.vocabulary.currentPack`，避免切换后下次启动又被旧账号词库覆盖
  - 新增 `dev-reset.html`，启动器先清理旧 Service Worker 与缓存，再进入 `Game.html`

### 🧪 Verification
- `node tests/unit/vocab-pack-switch-regression.test.mjs`
- `node tests/unit/offline-vocab-bundle-regression.test.mjs`
- `node tests/unit/launch-game-port-cleanup.test.mjs`
- `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p0-vocab-pack-switch.spec.mjs tests/e2e/specs/p0-launcher-sw-reset.spec.mjs`（临时端口 `4174`）
- 离线 `file:///.../android-app/web/index.html` 连续切换 `vocab.minecraft.intermediate` / `vocab.minecraft.full` / `vocab.kindergarten.hanzi`
  - 实测分别得到 `60` / `1163` / `60` 个词，首词依次为 `diamond` / `air` / `smile`
  - 无 `Pack ... produced no words and no fallback data` warning

### 📦 Technical Changes
- 同步版本元数据到 `version.json`、`package.json`、`android-app/package.json`、`android-app/android/app/build.gradle`、`android-app/web/build-info.json`
- 更新 `service-worker.js` 缓存版本与 `Game.html` 资源缓存戳到 `v1.19.33`
- 提取本次相关 Git 记录：`55f4659 fix: resolve vocab switching in launcher and apk`、`d931d67 release: v1.19.32`、`2894e48 fix: resolve vocab pack switching legacy ids`

---

## v1.19.32 (2026-03-09)

### 📚 Vocabulary Packs
- **Legacy 词库 ID 自动迁移**:
  - 修复旧设置/旧账号中的 `vocab.kindergarten`、`vocab.junior_high`、`vocab.minecraft` 等旧 ID 在当前 manifest 下无法匹配的问题
  - 启动、账号恢复、设置保存统一走 canonical pack id 解析链路
  - 避免 `activeVocabPackId` 为空和“词库数据未就绪”假象

### 🧪 Verification
- `node tests/unit/vocab-pack-switch-regression.test.mjs`
- `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p0-vocab-pack-switch.spec.mjs`（使用临时端口 4181）

### 📦 Technical Changes
- 默认词库改为 `vocab.kindergarten.full`
- 同步版本元数据到 `version.json`、`package.json`、`android-app/package.json`、`android-app/web/build-info.json`
- 更新 `service-worker.js` 缓存版本与 `Game.html` 资源缓存戳到 `v1.19.32`

---

## v1.19.31 (2026-03-09)

### 🎮 Gameplay
- **移动端左右方向键回退到旧版底部布局**:
  - 手机端地面状态恢复为左下角横排双键
  - 左右键间距缩回旧版，不再被十字网格拉开

### 🐉 Dragon Riding
- **龙蛋召唤 / 骑龙兼容保持可用**:
  - 地面时继续默认隐藏上下飞行键
  - 骑上末影龙后左侧控制区切换为紧凑 2x2 四键布局
  - 骑龙触屏移动与喷火流程已重新验证

### 🧪 Verification
- `node tests/unit/dragon-summon-regression.test.mjs`
- `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-summon-dragon-and-gunpowder.spec.mjs`（使用临时端口 4175）

### 📦 Technical Changes
- 同步版本元数据到 `version.json`、`package.json`、`android-app/package.json`、`android-app/web/build-info.json`
- 更新 `service-worker.js` 缓存版本与 `Game.html` 资源缓存戳到 `v1.19.31`

---

## v1.19.30 (2026-03-09)

### 🎮 Gameplay
- **末影龙三阶段追击战**:
  - P1 会跟随玩家位置进行高空压制，不再只是固定悬停
  - P2 会主动俯冲缩距，并朝玩家路线发射火球与吐息危险区
  - P3 会以更低高度进行贴身压迫和低空横扫

### 🧪 Verification
- **龙竞技场回归覆盖扩大**:
  - Playwright 已覆盖追踪、缩距、碰撞伤害、火球、晶体销毁、治疗束切换与胜利传送门流程
  - 额外完成调试页 enter/exit、阶段切换、胜利重开等压力验证

### 📦 Technical Changes
- 同步版本元数据到 `version.json`、`package.json`、`android-app/package.json`、`android-app/web/build-info.json`
- 更新 `service-worker.js` 缓存版本与 `Game.html` 资源缓存戳到 `v1.19.30`

---

## v1.19.29 (2026-03-09)

### 🐛 Bug Fixes
- **APK词汇库切换修复**: 修复Android APK版本中词汇库切换不生效的问题，现在切换词汇库后会立即应用到游戏中

### ✨ Improvements
- **移动端骑龙控制优化**: 
  - 地面时只显示左右移动按键，界面更简洁
  - 骑上末影龙后自动显示上下飞行按键
  - 下龙后上下按键自动隐藏
  - 提升移动端操作体验

### 📦 Technical Changes
- 新增 `13-game-loop-dragon-controls.js` 模块处理触摸控制动态更新
- 优化账号数据加载流程，确保词汇库设置正确同步

---

## v1.19.28 (2026-03-09)

### Fixed
- **BOSS Environment System**: 修复 BOSS 专属环境控制器相关问题
- **Debug Tools**: 改进 GameDebug.html 调试功能
- **E2E Tests**: 增强 BOSS 调试控制的 E2E 测试覆盖

### Changed
- **Release Pipeline**: 强化 publish-main 拉取逻辑，提升发布稳定性
- **Version Documentation**: 完善版本文档管理

---

查看完整更新历史请参考 [CHANGELOG.md](../version/CHANGELOG.md)
