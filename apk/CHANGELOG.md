# Changelog

All notable changes to this project will be documented in this file.

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
