# Release Notes

## v1.19.45 (2026-03-19)

### 📚 Bridge Learning
- **幼小衔接语文继续扩容**:
  - 补齐 `展示台 / 日积月累 / 查字典 / 音序表 / 部首表 / 阅读交流 / 课堂展示` 等更贴近统编低年级教材与课堂活动的词语
  - 继续扩展 `快乐读书吧 / 读书分享会 / 整本书阅读 / 课堂展示台 / 阅读交流卡` 等一二年级阅读场景词
  - 新增 `请你先说 / 我来回答 / 我先读一段 / 请补充一句 / 请完整表达 / 我会查字典` 等分层课堂短表达

### 🛠️ UX / 设置修复
- **词库设置标签去重**:
  - 修复设置下拉框把多个词库压成同名 `初级 / 中级 / 完整` 的问题
  - 词库项现在优先显示真实 `pack.title`，并保留冲突兜底标签，避免用户选错包
- **学习层级提示增强**:
  - 词语配对复活弹窗显示当前学习层级
  - 挑战弹窗显示课堂上下文徽标
  - 学习报告按 `chinese / pinyin` 模式切换更贴切的主题风格

### 🧪 Verification
- `node tests/unit/bridge-vocab-coverage.test.mjs`
- `node tests/unit/bridge-language-ui-regression.test.mjs`
- `node tests/unit/bridge-grade-scope-regression.test.mjs`
- `node tests/unit/vocab-pack-switch-regression.test.mjs`
- `node tests/unit/kindergarten-hanzi-regression.test.mjs`
- `node tests/unit/pinyin-pack-regression.test.mjs`
- `node tests/unit/bridge-play-display.test.mjs`

### 📦 Technical Changes
- 统一版本元数据到 `v1.19.45 / build 97`
- 更新 `version.json`、`package.json`、`android-app/package.json`、`android-app/android/app/build.gradle`、`android-app/web/build-info.json`
- 更新 `service-worker.js` 缓存版本与 `Game.html` 资源缓存戳到 `v1.19.45`
- 提取本次相关 Git 记录：`7905f41 feat: expand bridge vocab content and learning ui`

## v1.19.35 (2026-03-10)

### 🎮 Gameplay Integration
- **0309 多线玩法集成完成**:
  - 商人屋短按进入恢复稳定，卖材料第一页和下一页均为双列动作布局
  - 地面左右方向键恢复旧版底部横排双键，骑龙时自动切换四键飞行布局
  - 跳跃下龙后主角会安全脱离龙体，方向输入立即恢复；末影龙按新的主角位置回归待命
  - 合成台正式接入，支持盾牌 / 火炬配方、多选材料与 HUD/触控入口
  - 地下矿洞新增暗区遮罩、火炬照明扩圈与洞穴背景效果，并正式注册到群系配置 / 调试切换链路
  - 坚守者蛋接入传奇宝箱、商人售卖与召唤流程
  - 补齐 `drowned / guardian / pufferfish / piglin / bee / spore_bug / magma_cube / fire_spirit / sculk_worm / shadow_stalker` 的专用敌人剪影

### 🧪 Verification
- `node tests/unit/village-ui-regression.test.mjs`
- `node tests/unit/dragon-summon-regression.test.mjs`
- `node tests/unit/crafting-foundation-regression.test.mjs`
- `node tests/unit/cave-biome-lighting-regression.test.mjs`
- `node tests/unit/warden-egg-regression.test.mjs`
- `node tests/unit/enemy-renderer-regression.test.mjs`
- `node tests/unit/dev-cache-busting-regression.test.mjs`
- `MMWG_E2E_PORT=4200 npx playwright test tests/e2e/specs/p0-village-trader-sell-grid.spec.mjs tests/e2e/specs/p0-village-wordhouse-trigger.spec.mjs --config=tests/e2e/playwright.config.mjs`
- `MMWG_E2E_PORT=4201 npx playwright test tests/e2e/specs/p1-summon-dragon-and-gunpowder.spec.mjs tests/e2e/specs/p1-crafting-foundation.spec.mjs --config=tests/e2e/playwright.config.mjs`
- `MMWG_E2E_PORT=4202 npx playwright test tests/e2e/specs/p1-cave-lighting.spec.mjs tests/e2e/specs/p1-warden-egg-integration.spec.mjs --config=tests/e2e/playwright.config.mjs`
- `MMWG_E2E_PORT=4205 npx playwright test tests/e2e/specs/p1-summon-dragon-and-gunpowder.spec.mjs tests/e2e/specs/p1-cave-lighting.spec.mjs --config=tests/e2e/playwright.config.mjs`

### 📦 Technical Changes
- 统一版本元数据到 `v1.19.35 / build 87`
- 更新 `service-worker.js` 缓存版本与 `Game.html` 资源缓存戳到 `v1.19.35`
- 新增发布流程文档 `docs/release/WORKFLOW.md`
- 提取本次相关 Git 记录：`d308f87`、`88f8b20`、`fb28129`、`8fd8de0`、`874800d`、`142d733`、`176bb90`

---

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
