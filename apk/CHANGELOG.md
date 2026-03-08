# Changelog

All notable changes to this project will be documented in this file.

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
