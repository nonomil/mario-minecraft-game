# Release Notes

## v1.19.51 (2026-03-26)

### 🛠️ APK Build / Packaging
- **恢复 APK 构建入口一致性**: 调整 `build:apk` 与 `build:apk:release`，移除构建前自动执行 `npm run build` 的步骤，避免 `android-app/web/index.html` 在打包前被 `out/Game.offline.html` 覆盖。
- **保持 Android 打包来源稳定**: 继续通过 `npm run sync` 与 Gradle `syncWebAssets` 从 `android-app/web` 同步到 APK 资产目录，确保首页 UI 与 APK 一致。

### 📦 Technical Changes
- 统一版本元数据到 `v1.19.51 / build 102`
- 同步 `package.json`、`android-app/package.json`、`version.json`、`android-app/android/app/build.gradle`
- 同步 `android-app/web/build-info.json` 与 `build/build-info.json`
- 提取本次相关 Git 记录：无新增业务提交（基于 `release: v1.19.50` 后工作区变更发布）

## v1.19.50 (2026-03-26)

### 🛠️ APK Build / Packaging
- **修复 APK 资产残留打包**: `android-app/android/app/build.gradle` 中的 `syncWebAssets` 已从 `Copy` 调整为 `Sync`，确保每次构建前对目标目录做镜像同步，清除历史残留文件。
- **隔离测试审计目录**: 构建资产来源仍固定为 `android-app/web`，不再因旧的 assets 残留把 `tests/audit`、`tests/audit-output` 内容误带进 APK。

### 📦 Technical Changes
- 统一版本元数据到 `v1.19.50 / build 101`
- 同步 `package.json`、`android-app/package.json`、`version.json`、`android-app/android/app/build.gradle`
- 同步 `android-app/web/build-info.json` 与 `build/build-info.json`
- 提取本次相关 Git 记录：`63ab0ff docs: update release-notes.md for v1.19.49`

## v1.19.49 (2026-03-26)

### 📚 Bridge Learning / UI
- **桥接语言 UI 回归测试**: 新增 `tests/unit/bridge-language-ui-regression.test.mjs`，确保桥接模式下词卡与挑战展示逻辑稳定。
- **挑战 UI 逻辑修复**: 统一 `src/modules/12-challenges.js` 中的展示提取逻辑，解决部分模式下挑战行文字提取不准确的问题。
- **词库净化**: 继续清理桥接词库噪声，同步 `fix: continue bridge language vocab curation` 提交内容。

### 📦 Technical Changes
- 升级版本元数据到 `v1.19.49 / build 100`
- 同步 `package.json`、`version.json`、`android-app/android/app/build.gradle`、`CHANGELOG.md`
- 生成 `docs/release/RELEASE_NOTES_v1.19.49.md`

## v1.19.48 (2026-03-26)

### 📚 Vocabulary / Learning
- **汉字 800 字包继续净化**:
  - 修正仍残留的异常例词，确保例词优先使用包内字符、自然组词和低龄可理解表达
  - `操` 等条目已改为更稳妥的儿童词例，避免再次出现 `做操` 这类包外字符组合回归
- **幼小衔接数学更贴近低年级**:
  - 新增 `十以内加法 / 二十以内加减 / 图形拼搭 / 图形拼图 / 看位置 / 看统计图` 等具体词条
  - 继续补入 `加一加 / 减一减 / 合起来 / 还剩多少 / 图形摆放 / 统计文具` 等更适合学前到二年级的数学场景词
- **桥接词库继续去噪**:
  - 语文继续过滤教师任务口吻和行政化栏目词
  - 数学继续过滤 `应用题 / 数量关系 / 规律卡片 / 看图题 / 口算题` 等生成感强词条
  - 英语继续拦截无意义自然拼读串，并确保 `vocab.bridge.english` 加载独立英语补充词库

### 🛠️ UX / Display
- **词卡提示继续精简**:
  - 汉字模式与幼小衔接模式默认不再显示多余元信息与提示文案
  - APK `android-app/web/index.html` 同步词卡/HUD/UI 整理后的展示效果
- **README 与入口说明更新**:
  - 仓库首页改为反映当前真实状态：多学习线、Boss/环境、桥接词库、学习报告与档案系统

### 🧪 Verification
- `node tests/unit/kindergarten-hanzi-regression.test.mjs`
- `node tests/unit/bridge-vocab-curation.test.mjs`
- `node tests/unit/bridge-vocab-coverage.test.mjs`
- `node tests/unit/vocab-pack-switch-regression.test.mjs`
- `node tests/unit/bridge-language-ui-regression.test.mjs`
- `npx playwright test tests/e2e/specs/bridge-vocab-expansion.spec.mjs --config tests/e2e/playwright.config.mjs`

### 📦 Technical Changes
- 统一版本元数据到 `v1.19.48 / build 99`
- 同步 `package.json`、`android-app/package.json`、`version.json`、`android-app/android/app/build.gradle`
- 更新 `Game.html`、`service-worker.js`、`android-app/web/index.html`、`build/index.html` 的缓存版本戳
- 更新 `android-app/web/build-info.json`、`build/build-info.json`
- 提取本次相关 Git 记录：`ef3be18 feat: finalize child-friendly vocab curation and bridge polish`

## v1.19.46 (2026-03-20)

### 📚 Vocabulary / Learning
- **汉字 / 拼音词库入口独立**:
  - `vocab.kindergarten.hanzi` 与 `vocab.kindergarten.pinyin` 改为真正独立的汉字 / 拼音包，不再回退到桥接总包
  - 设置页与预览文案按模式单独分组，减少重名和误选
- **幼小衔接课堂化收口**:
  - 继续清理幼小衔接单词卡、提示文案、测验纠错和 HUD 元信息
  - 英语 / 汉字模式不再显示幼小衔接层级选择，拼音模式保留更合适的年级范围

### 🛠️ Stability / UX Fixes
- **TTS 发音恢复**:
  - 修复 APK TTS provider 不可用时所有词库都无法发音的问题
  - 现在会优先判断原生 provider 是否真的可用，再自动回退到 Web TTS
- **抽词与测验去重稳定**:
  - 抽词器、跟随短语、挑战候选统一改用稳定词条键
  - 修复汉字模式切换后重复刷出少数几个词、候选池误排除和短语跟随重复的问题
- **显示风格更贴近课堂**:
  - 拼音模式圆圈默认显示汉字，不再默认露出拼音
  - 拼音/汉字/幼小衔接模式的标题、提示、上下文徽标与报告文案更统一

### 🧪 Verification
- `node --check src/modules/09-vocab.js`
- `node --check src/modules/10-ui.js`
- `node --check src/modules/11-game-init.js`
- `node --check src/modules/12-challenges.js`
- `node --check src/modules/13-game-loop.js`
- `node --check src/modules/14-renderer-main.js`
- `node --check src/modules/16-events.js`
- `node --check src/modules/17-bootstrap.js`
- `node --check words/vocabs/manifest.js`
- `node tests/unit/vocab-pack-switch-regression.test.mjs`
- `node tests/unit/bridge-language-ui-regression.test.mjs`
- `node tests/unit/bridge-grade-scope-regression.test.mjs`
- `node tests/unit/kindergarten-hanzi-regression.test.mjs`
- `node tests/unit/pinyin-pack-regression.test.mjs`
- `node tests/unit/bridge-play-display.test.mjs`

### 📦 Technical Changes
- 统一版本元数据到 `v1.19.46 / build 98`
- 更新 `version.json`、`package.json`、`android-app/package.json`、`android-app/android/app/build.gradle`、`android-app/web/build-info.json`
- 更新 `service-worker.js` 缓存版本与 `Game.html` 资源缓存戳到 `v1.19.46`
- 提取本次相关 Git 记录：`5599e8e feat: finalize bridge vocab curation and learning polish`

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
