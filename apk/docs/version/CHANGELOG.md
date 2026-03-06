## v1.19.11 (2026-03-06)

### Added
- Font size optimization for overlay titles, text, and buttons to improve readability on mobile devices.
- Scrollbars added to long content overlays (Settings, Save selection, etc.).
- 10-second delay for the "Hint" button in word quizzes to encourage player recall.

---

## v1.19.10 (2026-03-06)

### 消耗性装备系统 (Consumable Equipment System)
- 新增：主界面新增消耗品槽位。
- 新增：长按攻击键（800ms）触发消耗品，带动画反馈。
- 新增：Debuff 系统支持燃烧、减速效果。
- 优化：粒子池对象池化，降低频繁 GC。
- 修复：修复长按逻辑在触控端的兼容性问题。

### Version Metadata
- `package.json` -> `1.19.10`
- `android-app/package.json` -> `1.19.10`
- `version.json` -> `versionCode/buildNumber 65`, `versionName 1.19.10`
- `android-app/android/app/build.gradle` -> `versionCode 65`, `versionName 1.19.10`

---

## v1.19.9 (2026-03-04)

### 并行开发合入（A/B/C/D）
- 合入并行开发产物：UI 基础设施、PWA 基础设施、音效系统增强、TTS Provider 抽象与相关落地。
- 同步修复并行合入期间暴露的测试与脚本链路问题。

### 性能优化（Task1）
- 主循环性能监控与关键路径指标采集，便于定位卡顿与耗时热点。
- 碰撞检测加入 early-exit 优化，降低高负载场景下的计算开销。
- 增强异常处理与状态恢复能力，避免局部错误导致全局卡死。

### 存档与配置加固（Task2）
- 引入存档版本管理与压缩，降低存档体积并提升兼容性。
- 增加备份与恢复机制，降低异常写入/损坏的恢复成本。
- 配置加载增加校验与兜底，降低配置缺失/非法导致的运行风险。

### PWA 与缓存
- 完善 Service Worker 引导与缓存策略。
- 缓存版本与 `version.json.versionName` 联动，降低旧缓存导致的线上资源不一致。

### 修复
- 修复 `src/modules/12-challenges.js` 的异常捕获语法问题。

### Version Metadata
- `package.json` -> `1.19.9`
- `package-lock.json` -> `1.19.9`
- `android-app/package.json` -> `1.19.9`
- `version.json` -> `versionCode/buildNumber 64`, `versionName 1.19.9`
- `android-app/android/app/build.gradle` -> `versionCode 64`, `versionName 1.19.9`

---
## v1.19.0 (2026-02-25)

### Quick Win（游戏性 + 学习性）
- 高级学习设置英文标签全部中文化：`Adaptive follow / Repeat Bias / Reinforce wrong / Balanced / Follow-up Stats`。
- 单词卡时长新增 `2秒` 与 `3秒` 选项，默认展示时长由 `0.9s` 调整为 `1.2s`。
- 词库轮换修复：`switchToNextPackInOrder` 在重置进度时同步清空 `runCounts`，避免长期轮换偏斜。
- Word Gate 参数调整：`spawnChance 0.08 -> 0.18`，`minScore 500 -> 150`，并新增首次触发教学提示。
- 普通宝箱掉落权重调整：`word_card` 下调至 `8`（并降低数量区间），提升实体物资掉落体感。
- 护甲减伤平衡已同步：黄金/钻石/下界合金减伤重新设定，且有甲时也至少受 `1` 点伤害。

### Version Metadata
- `apk/package.json` -> `1.19.0`
- `apk/android-app/package.json` -> `1.19.0`
- `apk/version.json` -> `versionCode/buildNumber 59`, `versionName 1.19.0`
- `apk/android-app/android/app/build.gradle` -> `versionCode 59`, `versionName 1.19.0`

---
## v1.18.56 (2026-02-25)

### APK 触控按钮与图标回退对齐
- 将 APK 触控区 7 个按钮图标回退到 `v1.18.42` 的目标样式（`⬅️ ➡️ 🚪 🧰 🔁 ⤴️ 🗡️`）。
- 修正 HUD 顶部“重读/暂停”按钮图标为 `🔊`，与目标版本一致。
- 保持 `touch-controls` 布局参数不变（按钮尺寸 `96px`，手机端底部偏移 `clamp(...)`），确保位置与大小稳定。

### APK/WebView 缩放一致性
- 移除 `apk/src/styles.css` 中新增的 `-webkit-text-size-adjust` / `text-size-adjust`，避免 WebView 下 emoji 图标缩放差异导致的视觉偏移。

### Release Pipeline
- 更新 `.github/workflows/android.yml`：Release 文案改为优先读取 `apk/docs/release/发布说明-v<version>.md`，避免 GitHub Releases 长期复用旧描述。
- 新增发布说明文档：`v1.18.54`、`v1.18.55`、`v1.18.56`。

---
## v1.18.55 (2026-02-24)

### 发布链路与脚本可用性
- 修复 `apk/push.bat` 菜单输出与自动化参数兼容性，支持 `--mode auto --yes --no-pause` 流程。
- 清理批处理输出异常，确保 dry-run 与实推送日志可读。

### Release Metadata
- 自动版本递增到 `1.18.55`（`versionCode/buildNumber = 55`）。

---
## v1.18.54 (2026-02-24)

### HUD 与平台限制同步发布
- 发布 HUD/触控按钮尺寸与布局对齐修复（基于 `v1.18.53` 相关改动）。
- 同步平台高度与堆叠限制约束，保障移动端可视与可达性。

### Release Metadata
- 自动版本递增到 `1.18.54`（`versionCode/buildNumber = 54`）。

---
## v1.18.53 (2026-02-24)

### HUD 布局对齐（APK）
- 对齐 `apk/Game.html` 与 hud-layout 版本的 HUD 结构（`hud-grid` 三列布局）。
- 修复顶部状态栏与控制按钮区域的尺寸/对齐差异。
- 单词展示改为英文/中文分行展示，匹配新 HUD 容器结构。
- 补齐 HUD 相关元素 ID，确保交互与状态更新正确绑定。
- HUD/单词/触控按钮字体与尺寸对齐 v1.18.42（更大、更易读）。

### Tests
- 新增 HUD 布局回归用例，防止 APK 与网页布局再次偏移。
- 新增 HUD 字体与触控按钮尺寸回归用例。
- 新增悬浮/云/微平台高度与堆叠限制回归用例（本机端口权限受限，未执行）。

### Platform Constraints
- 悬浮平台高度不超过屏幕高度 50%。
- 微平台允许 1-2 格纵向堆叠，禁止 3+。
- 云平台高度不超过屏幕高度 50%。

### Release Metadata
- Version bump: push 后由 GitHub Actions 自动 patch 递增（`apk/version.json`、`apk/package.json`、`apk/android-app/package.json`、`apk/android-app/android/app/build.gradle`）。

---
## v1.18.46 (2026-02-23)

### 开局弹窗与发布链路
- 开局弹窗标题去重，仅保留顶部主标题。
- 开局弹窗副标题补充一句：挑战关卡，获取奖励与新武器。
- APK 构建前自动同步网页资源（`build:apk` / `build:apk:release` 先执行 build + sync）。

### Release Metadata
- Version bump:
  - `apk/package.json` -> `1.18.46`
  - `apk/android-app/package.json` -> `1.18.46`
  - `apk/version.json` -> `versionCode/buildNumber 46`
  - `apk/android-app/android/app/build.gradle` -> `versionCode 46`, `versionName 1.18.46`

## v1.18.45 (2026-02-23)

### 悬浮平台 & 挖掘系统大改版

#### 挖掘系统优化
- drawBlock 增加 clip 裁剪，修复挖掘后缺口不可见的问题
- 挖掘方块时喷出碎片粒子（颜色匹配方块类型）
- triggerGravityCheck 容差从 8px 提升到 blockSize，修复物品/宝箱不掉落

#### 悬浮平台改进
- 高度范围扩大：从低（靠近地面）到高（树顶以上）都有
- 自动检测树木碰撞，避免平台与树重叠
- 悬浮平台下方渲染半透明阴影，增加立体感

#### 三个新挖掘场景
- **口袋宝箱**：6+格悬浮平台上宝箱被两侧墙壁方块包围，需挖墙或挖底部让宝箱掉落
- **宝藏柱**：地面上 2-3 格高方块柱，顶部有宝箱/单词，挖底部触发连锁掉落
- **藏宝方块**：地面金色闪烁方块（5%概率），挖开后原地生成宝箱

#### 宝箱系统修复
- 宝箱交互增加垂直距离检测（1.5格），防止隔空打开
- 宝箱下落中不能打开，必须落地
- 重力触发时重置 velY，防止异常速度

#### 其他
- 移除 draw() 中的 debug console.log
- 游戏重置时清空 treasureBlocks 数组

---

## v1.18.34 (2026-02-21)

### Vocab DB + Pack Quality Fixes
- Repaired `words/vocabs/manifest.js` file-path mapping and regenerated pack metadata output to remove runtime path corruption risk.
- Upgraded `vocab:db:publish` pipeline to run:
  - export
  - dedup
  - validate
  - scoped audit (`vocab.junior_high`, `vocab.kindergarten.supplement`, `vocab.elementary_lower.supplement`)
- Added publish gate: build fails when scoped audit has `BLOCKER` findings.
- Strengthened `validate` gate: now fails on `missing chinese` as well.
- Improved import image strategy in `tools/vocab-db/import.mjs`:
  - removed destructive image clear
  - switched to additive image merge by URL to avoid last-source overwrite.

### Junior High + Supplement Data Normalization
- Normalized junior high packs:
  - `junior_high_basic.js`
  - `junior_high_intermediate.js`
  - `junior_high_advanced.js`
  - `junior_high_full.js`
- Added phrase follow compatibility for all new/updated entries:
  - no empty `phrase`
  - no placeholder-only `phraseTranslation`
- Normalized supplement packs:
  - `kindergarten_supplement_external_20260221.js`
  - `elementary_supplement_external_20260221.js`
- Fixed stage/category/difficulty consistency for targeted packs so they can pass scoped audit gate.

### Validation
- `npm run vocab:db:import` passed (no missing files / parse errors).
- `npm run vocab:db:publish` passed with new gate.
- `npm run test:e2e -- tests/e2e/specs/p0-vocab-pack-switch.spec.mjs` passed.

### Release Metadata
- Version bump:
  - `apk/package.json` -> `1.18.34`
  - `apk/android-app/package.json` -> `1.18.34`
  - `apk/version.json` -> `versionCode/buildNumber 34`
  - `apk/android-app/android/app/build.gradle` -> `versionCode 34`, `versionName 1.18.34`

---

## v1.18.33 (2026-02-21)

### Junior High Vocab Update
- Added junior high level packs:
  - `vocab.junior_high.basic`
  - `vocab.junior_high.intermediate`
  - `vocab.junior_high.advanced`
  - kept `vocab.junior_high` as full pack
- Generated new files:
  - `words/vocabs/05_初中/junior_high_basic.js`
  - `words/vocabs/05_初中/junior_high_intermediate.js`
  - `words/vocabs/05_初中/junior_high_advanced.js`

### Phrase Follow Support
- Re-generated `words/vocabs/05_初中/junior_high_full.js` with phrase fields populated.
- Cleared empty phrase entries for junior high pack so “word + phrase” flow can be triggered like elementary packs.

### Validation
- Updated E2E vocab switch test to assert junior high level packs are selectable.
- `p0-vocab-pack-switch.spec.mjs` passed after update.

### Release Metadata
- Version bump:
  - `apk/package.json` -> `1.18.33`
  - `apk/android-app/package.json` -> `1.18.33`
  - `apk/version.json` -> `versionCode/buildNumber 33`
  - `apk/android-app/android/app/build.gradle` -> `versionCode 33`, `versionName 1.18.33`

---

## v1.18.32 (2026-02-21)

### Vocabulary DB Tooling
- Enhanced `tools/vocab-db/import-external-list.mjs`:
  - Added `--file` local import mode (download-first workflow).
  - Added `--format auto|txt|tsv|csv`, CSV quoted-field parsing, and `--hasHeader`.
  - Added safer upsert behavior for external imports: fill empty fields on existing entries and optional re-activation when `--status active`.
- Added `tools/vocab-db/export-pack.mjs` to export one `source_pack` into runtime JS vocab files and append manifest pack entries.
- Added npm script: `vocab:db:export:pack`.

### New Vocabulary Packs
- Added **Junior High** pack:
  - `vocab.junior_high`
  - source: `KyleBing/english-vocabulary` (`1 初中-乱序.txt`)
  - generated file: `words/vocabs/05_初中/junior_high_full.js`
- Added **Kindergarten Supplement** pack:
  - `vocab.kindergarten.supplement`
  - generated file: `words/vocabs/01_幼儿园/kindergarten_supplement_external_20260221.js`
- Added **Elementary Supplement** pack:
  - `vocab.elementary_lower.supplement`
  - generated file: `words/vocabs/02_小学_低年级/elementary_supplement_external_20260221.js`
- Updated vocab stage selector to include `junior_high`.

### External Research + Compare + Dedup
- Researched and downloaded external kindergarten/elementary lists to:
  - `words/vocabs/external_sources/2026-02-21/`
- Generated comparison report against current DB:
  - `words/db/reports/external-compare-2026-02-21.json`
- Imported external lists through `vocab-db` workflow with source tagging and dedup.

### Validation & Tests
- `npm run vocab:db:publish` passed (`active entries=4799`, `duplicate keys=0`, `missing chinese=0`).
- `npm run vocab:db:dedup` executed and report regenerated.
- Added E2E test `tests/e2e/specs/p0-vocab-pack-switch.spec.mjs` and passed:
  - verifies new packs exist in settings and can be switched.

### Release Metadata
- Version bump:
  - `apk/package.json` -> `1.18.32`
  - `apk/android-app/package.json` -> `1.18.32`
  - `apk/version.json` -> `versionCode/buildNumber 32`
  - `apk/android-app/android/app/build.gradle` -> `versionCode 32`, `versionName 1.18.32`

---

## v1.18.31 (2026-02-21)

### Village Interaction
- Restored chest interaction to **tap** for normal chests and village houses (bed/word/trader).
- Trader house now follows interior-first flow: enter house first, move near trader NPC, then tap chest key to open trading dialog.
- Added/updated in-village hints around word house and trader house entry points.

### Armor System
- Armor durability changed to time-based lifetime by tier (minutes):
  - leather 3, iron 4, gold 5, diamond 6, netherite 7
- Removed per-hit durability drain to keep duration behavior predictable.

### Fox Behavior
- Fox size increased, movement constrained to ground, speed aligned to zombie pace.
- Limited to at most one fox on-screen at a time.

---
## v1.18.30 (2026-02-21)

### Village UX Follow-up
- Added near-building prompt overlays for word/trader houses.
- Stabilized touch interaction path for village actions and trader menu buttons.

---
## v1.18.29 (2026-02-21)

### Village + Enemy Balancing
- Unified village interaction handling for interior/trader scenarios.
- Refined fox spawn/behavior tuning across biomes.

---
## v1.18.28 (2026-02-21)

### Armor Durability Refactor
- Introduced real-time durability ticking and equip-time tracking fields.
- UI durability display rounded for readability while preserving internal precision.

---
## v1.18.27 (2026-02-21)

### E2E Coverage
- Added follow-up E2E coverage for village trigger stability, trader flow, 10-question quiz mode, and leaderboard persistence path.

---
## v1.18.26 (2026-02-21)

### Release Metadata
- Version metadata and automated APK bump pipeline aligned for 0220 follow-up deliveries.

---
## v1.18.25 (2026-02-20)

### 0220 Follow-up Baseline
- Consolidated village optimization follow-up plan and staged implementation workflow.

---
## v1.18.24 (2026-02-20)

### 游戏优化 0220-3
- 交互修复：触屏点击改为抬起触发并增加去重，修复“要长按/点两次”问题。
- 键盘修复：交互键与切换武器键增加 `!e.repeat` 防止长按重复触发。
- 室内稳定性：词屋/床屋宝箱触发增加冷却，避免与门口自动离开冲突。
- 交易屋触控：交易弹层按钮统一 `bindTraderTap`，修复点击偶发双触发。
- 护甲表现：新增角色护甲可视层（胸甲/肩甲/护腿），装备后主角外观实时变化。
- 护甲数值：按护甲类型应用固定减伤（钻石/下界合金可完全格挡但消耗耐久），强化体感差异。

### 稳定性与测试
- 修复并校验 `20-enemies-new.js` 注释术语（保留“恼鬼”语义）。
- 关键模块通过 `node --check`。
- 村庄相关 P0 E2E 用例通过：`p0-village-quiz-stability`、`p0-village-trader-fox`、`p0-village-visibility`。

---
## v1.18.22 (2026-02-20)

### 游戏优化 0220-2
- 乱码修复：修复首页血量、钻石兑换提示、背包与护甲面板、物品使用提示等可见文案乱码。
- 村庄单词屋：移除室外图标，避免遮挡角色。
- 交易屋交互：由输入数字改为点击式弹层菜单（卖材料、买护甲、买防晒霜）。
- 狐狸优化：狐狸改为专用形象渲染，不再显示为黄色方块；在非樱花群系也可低概率刷新。
- 配置回归修复：恢复村庄生成默认间隔参数，避免村庄过密。

### 稳定性
- 修复 `20-enemies-new.js` 因乱码注释导致的断行语法问题。
- 关键模块通过 `node --check`。
- 村庄相关 P0 E2E 用例通过：`p0-village-visibility`、`p0-village-quiz-stability`、`p0-village-trader-fox`。

---
## v1.18.17 (2026-02-20)

### Interior Mode (Requirement 12)
- Keep full player avatar in interior mode (uses `drawSteve` when available).
- Spawn position moved to room center when entering house.
- Interior left/right movement speed is capped at 50% of normal max speed.
- Door and action points are placed on opposite sides (door right, bed/test left).
- Proximity auto-trigger enabled: no key press required for door exit, bed rest, or word-test start.
- Added in-room hint texts above interaction points for clearer guidance.

### Release
- Updated GitHub Release "What's New" description for this publish.

---
## v1.18.16 (2026-02-19)

### Gameplay
- Requirement 11 implemented: Wither gate spawn frequency reduced to once every two biome transitions.
- Village is not counted as biome transition in this rule.
- While player is inside village area, Wither cannot deal projectile or charge collision damage.
- After player leaves village, Wither attacks resume normally.

### Interior Mode Stability
- Interior mode movement/interaction baseline merged (auto-enter + in-room movement + point-based interaction foundation).

### Release
- Version and release metadata synchronized for this publish.

---
## 历史记录说明
- 以前版本记录曾在 Windows 终端编码链路中发生了不可逆的字符替换（例如：`?` / 乱码占位符 / 乱码片段）。
- 为避免误导与继续污染，已暂时移除该段文本；后续可从旧仓库或备份 commit 恢复。

