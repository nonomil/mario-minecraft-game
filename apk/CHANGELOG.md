# Changelog

All notable changes to this project will be documented in this file.

## [1.19.45] - 2026-03-19
### Added
- **Bridge 语文内容扩展**: 继续扩充幼小衔接语文词库，补齐查字典、阅读展示、课堂栏目词和按年级分层的口语交际短表达。
- **课堂化学习提示**: 为汉字/幼小衔接模式补充当前学习层级、课堂上下文徽标和模式化学习报告主题。

### Fixed
- **词库设置重名**: 修复设置中多个词库只显示“初级/完整”等重复名称的问题，改为优先展示真实词库标题并做冲突兜底。
- **学习层级过滤**: 修复桥接词库 `grade1/grade2` 边界过滤不精确的问题，避免 `一年级-二年级` 词条误混入仅一年级范围。
- **表达拼音回退**: 修复共享拼音映射缺字时部分新增课堂表达无法入库的问题。

### Changed
- **Bridge 学习体验**: 优化词语配对、挑战弹窗、学习报告与相关样式，使汉字/拼音/幼小衔接模式更贴近低年级课堂场景。

## [1.19.44] - 2026-03-18
### Added
- **Learning Report**: 新增学习报告与档案页 UI，并补齐配套流程文档。
- **Bridge 词库扩展**: 扩充幼小衔接/桥接词库与清单联动，并新增词库审计工具与回归覆盖。

### Fixed
- **Boss Arena 稳定性**: 修复 BOSS 竞技场与学习弹窗的稳定性问题，恢复龙竞技场渲染基线。
- **Shield Balance**: 调整盾牌表现与使用节奏，并对拼音测验/护盾交互做一致性修复。

## [1.19.40] - 2026-03-14
### Fixed
- **APK 首页弹窗**: 修复 Android APK 首页弹窗缺失问题（补齐 web/index.html）。

## [1.19.39] - 2026-03-14
### Added
- **Boss Mechanics - Blaze Rotating Ring**: Added rotating ring telegraph visuals, damage windows, punish timing, and debug flow coverage.
- **Dragon Arena**: Added three-phase player pursuit behavior in the dragon arena.

### Fixed
- **Pinyin/Bridge Mode**: Stabilized bridge/pinyin display fallback behavior and clarified the mode label.
- **Boss Debug Flow**: Restored boss debug phase behavior and ghast intent handling.

### Changed
- **Boss System Refactor**: Split boss classes/core/shared logic into dedicated modules to improve maintainability.
- **Repository Hygiene**: Updated ignore rules for worktrees/playwright artifacts to reduce repo pollution.

## [1.19.38] - 2026-03-12
### Added
- **Pinyin + Hanzi Learning**: Introduced pinyin vocab pack, mode selection, quiz routing, and pinyin-hanzi relation data.
- **M1 Learning Spine**: Implemented a unified learning event spine for consistent learning flows.
- **M2 Gate Microlearn**: Added gate microlearning with shield buff feedback.
- **M3 Dragon Egg Growth**: Implemented dragon egg growth system aligned with the learning progression.
- **Verification Reports**: Added MVP integration completion and 7/7 test verification reports.

### Fixed
- **Boss Weapon Switching**: Resolved weapon switching issues during boss combat.
- **Learning State Duplication**: Removed duplicate learningState implementation to prevent drift.
- **Kindergarten Hanzi Pack**: Expanded the pack to 800 characters and fixed edge cases.

## [1.19.37] - 2026-03-11
### Added
- **Crafting Improvements**: Optimized crafting modal visuals and introduced debug injection mechanisms.
- **Codex Constraints**: Updated `AGENTS.md` with refined collaboration rules for assistant plugins.

### Fixed
- **Dragon Dismount**: Resolved a crash issue when dismounting from dragons and improved associated visuals.

## [1.19.36] - 2026-03-10
### Added
- **Character Visuals**: Fully refreshed character visuals and added design documentation.
- **Release Automation**: Integrated `release-and-push` skill and Lane E release gate for automated version management.
- **Documentation Guides**: Added comprehensive release workflow and release notes management guides.

### Fixed
- **Vocabulary Switching**: Resolved issues with vocabulary pack switching in both launcher and APK.
- **Git Hygiene**: Ignored `.worktrees` directory to prevent repository pollution.

### Changed
- **Documentation Structure**: Reorganized documentation files and moved release notes to `docs/release/` directory.
- **Repository Cleanup**: Removed legacy documentation and outdated configuration files.

## [1.19.31] - 2026-03-09
### Fixed
- **Mobile Direction Buttons**: Restored the old bottom-left horizontal left/right touch layout on phones so the movement buttons are no longer too high or too far apart.

### Changed
- **Dragon Riding Touch Layout**: Kept the same left control zone but switch it into a compact 2x2 riding layout so up/down flight remains available after summoning and mounting the dragon.
- **Regression Coverage**: Updated the dragon summon touch regression and re-ran the targeted summon/riding touch E2E flow before release.

## [1.19.30] - 2026-03-09
### Added
- **Ender Dragon Pursuit Arena**: Upgraded the dedicated Ender Dragon arena with a three-phase pursuit model that tracks player movement.

### Changed
- **Dragon Combat Pressure**: Added phase-specific dive, fireball, breath, and low-sweep pressure behaviors to make the encounter actively chase the player.
- **Regression Coverage**: Expanded Ender Dragon arena verification for pursuit, hazards, crystal interactions, healing beam targeting, and victory portal flows.

## [1.19.28] - 2026-03-09
### Fixed
- **BOSS Environment System**: Fixed issues in BOSS exclusive environment controller.
- **Debug Tools**: Improved GameDebug.html debugging functionality.
- **E2E Tests**: Enhanced BOSS debug control test coverage.

### Changed
- **Release Pipeline**: Hardened publish-main pull logic for improved stability.
- **Version Documentation**: Improved version documentation management.

## [1.19.26] - 2026-03-08
### Fixed
- **Boss Debug Trigger**: Improved reliability of boss triggering from GameDebug.html.
- **Boss Battle Text**: Fixed garbled boss battle text and added debug controls for Ender Dragon and Word Gate boss.
- **Dev Server Caching**: Added cache-disabling HTTP response headers for the development server to prevent stale assets during iteration.

### Changed
- **Version Synchronization**: Unified release metadata across `package.json`, `version.json`, `android-app/package.json`, `android-app/web/build-info.json`, `android-app/android/app/build.gradle`, `service-worker.js`, and `Game.html`.

## [1.19.25] - 2026-03-08
### Fixed
- **Advanced Settings Button**: Replaced smart quotes in `Game.html` and fixed quote characters in the settings interface to restore Advanced Settings modal behavior.

### Changed
- **Settings UX**: Reorganized settings interface into main and advanced panels.

## [1.19.24] - 2026-03-08
### Added
- **Vocab System Simplification**: Simplified vocab pack classification and improved manifest compatibility.

### Fixed
- **Vocab Loading**: Fixed multiple vocab loading issues caused by global variable name drift and stage label mismatches.

## [1.19.23] - 2026-03-08
### Fixed
- **Village Interaction Regressions**: Resolved critical issues with village gate and trader interactions
  - Fixed word gate toggle mechanism in village areas
  - Corrected trader auto-enter behavior and sell grid functionality
  - Improved word house trigger reliability
  - Updated village challenge quiz flow to prevent state conflicts

### Changed
- **Village System Improvements**: Enhanced village interaction reliability (369 lines changed, 57 deletions)
  - Refactored `18-village.js` for better state management (+81 lines)
  - Updated `12-village-challenges.js` quiz interaction flow (+24 lines)
  - Improved `13-game-loop.js` village state handling (+22 lines)
  - Enhanced renderer integration in `14-renderer-main.js` (+1 line)
  - Updated `config/village.json` configuration

### Added
- **E2E Test Coverage**: Comprehensive village interaction tests
  - New test: `p0-village-trader-sell-grid.spec.mjs` (+81 lines)
  - New test: `p0-village-wordgate-toggle.spec.mjs` (+59 lines)
  - Enhanced: `p0-village-trader-auto-enter.spec.mjs` (+16 lines)
  - Enhanced: `p0-village-wordhouse-trigger.spec.mjs` (+14 lines)
- **Documentation**: Village gate and trader design and implementation plans
  - `docs/plans/2026-03-08-village-gate-trader-design.md` (+49 lines)
  - `docs/plans/2026-03-08-village-gate-trader-implementation.md` (+77 lines)

## [1.19.22] - 2026-03-08
### Added
- **Boss Exclusive Environments**: Added dedicated arena environments for boss encounters
  - New `15-entities-boss-environments.js` module for reusable environment controller
  - Warden deep dark arena with exclusive environmental rules
  - Blaze inferno altar arena with dedicated pacing
  - Environment-specific background rendering and hazards
  - Phase banners and HUD text for arena identity
- **Enhanced Boss Systems**: Extended boss mechanics with environment integration
  - Boss arena now supports dedicated environmental rules (+132 lines in `15-entities-boss.js`)
  - Dragon arena enhanced with environment controller (+230 lines in `15-entities-boss-dragon.js`)
  - Improved renderer integration for boss environments
- **Debug & Testing**: Comprehensive debug tools and E2E coverage
  - Enhanced GameDebug.html with boss environment controls (+37 lines)
  - Added 278 lines of new E2E tests for boss debug controls
  - Added 54 lines of dragon arena E2E tests

### Changed
- **Architecture**: Boss fights upgraded from "normal map + boss enemy" to "dedicated arena + environmental rules + pacing"
- **Rendering Pipeline**: Updated entity and main renderers to support boss environment layers

### Technical Details
- Total changes: 739 lines across 10 files
- New module: `src/modules/15-entities-boss-environments.js`
- Design docs: Boss exclusive environments design and implementation plan

## [1.19.21] - 2026-03-07
### Added
- **Ender Dragon End Arena**: Added a dedicated End arena encounter with a separate `endDragonArena` lifecycle.
- **Dragon Encounter UI & Debug Hooks**: Added dragon arena state exposure, helper APIs, and targeted Playwright coverage for entry, phases, crystals, hazards, and victory flow.

### Changed
- **End Biome Flow**: Entering the `end` biome now routes into the dedicated Ender Dragon battle flow instead of only exposing dragon features through debug-only paths.
- **Version Synchronization**: Unified release metadata across `package.json`, `version.json`, `android-app/package.json`, `android-app/web/build-info.json`, `android-app/android/app/build.gradle`, and `service-worker.js`.

### Fixed
- **Android Version Drift**: Fixed `android-app/android/app/build.gradle` being out of sync with web/app release version files.

## [1.19.20] - 2026-03-07
### Added
- **Dragon Summoning & Riding System**: Complete implementation of EnderDragon summoning and riding mechanics
  - EnderDragon entity with AI behavior and fireball attacks
  - Dragon riding controls and physics integration
  - Gunpowder ground fire effect enhancement
  - Manual debug coverage for dragon summon functionality

### Fixed
- Touch control regressions in dragon summoning interface
- Account selection overlay UI refinements

## [1.19.19] - 2026-03-06
### Changed
- **Version Increment**: Incremented version to `1.19.19` and versionCode to `74` for continuous release.
- **Maintenance**: General build configuration updates.
