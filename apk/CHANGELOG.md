# Changelog

All notable changes to this project will be documented in this file.

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
