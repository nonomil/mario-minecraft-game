# Changelog

All notable changes to this project will be documented in this file.

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

## [1.19.18] - 2026-03-06
### Changed
- **Version Increment**: Incremented version to `1.19.18` and versionCode to `73` for continuous release.
- **Maintenance**: General build configuration updates.

## [1.19.17] - 2026-03-06
### Changed
- **Version Synchronization**: Unified version numbers across all configuration files (`package.json`, `version.json`, `build-info.json`)
- **Release Preparation**: Updated build numbers and version codes for official release

## [1.19.16] - 2026-03-06
### Added
- **Challenge Success Tracking**: Track all successful challenge completions
  - `progress.challengeSuccessCount` persists across sessions
  - Challenge count displayed in learning statistics panel
- **Milestone Reward System**: 9 reward tiers for challenge achievements
  - Item rewards at 10, 25, 100, 200 challenges (Iron, Diamonds, Pumpkins, Ender Pearls)
  - Armor rewards at 50, 150, 300, 500, 1000 challenges (Leather → Netherite progression)
  - Visual celebration effects for major milestones (≥100 challenges)
  - Toast notifications with custom messages for each milestone
- **Learning Stats Enhancement**: Added challenge success count to stats summary panel

### Changed
- `LEARNING_CONFIG.challenge` now includes `milestones` array with reward configurations
- `completeLearningChallenge()` now tracks success count and checks for milestone rewards
- `renderLearningStats()` displays challenge success count alongside other stats

## [1.19.15] - 2026-03-06
### Added
- **Chinese Mode Challenges**: Language-specific challenge types
  - Chinese mode: Character-based fill_blank (缺少哪个汉字？) instead of letter-based
  - Chinese mode: Character scrambling (重新排列汉字) instead of letter scrambling
  - Challenges automatically adapt based on language mode setting
- **Voice Prompts for Word Gates**: TTS speaks the word when player encounters a word gate
- **Challenge Option Voice Hints**: Hover or focus on options to hear them spoken
  - Helps users choose the correct answer, especially for Chinese characters
  - Respects language mode and speech settings

### Changed
- Challenge generation now checks language mode and generates appropriate challenge types
- Fill_blank and unscramble challenges have separate implementations for English and Chinese modes

## [1.19.14] - 2026-03-06
### Fixed
- **Chinese Mode Display**: Fixed word display to show Chinese characters correctly in Chinese mode
  - `updateWordUI` now uses `BilingualVocab.getDisplayContent()` for proper language-based display
  - Chinese mode: Shows Chinese characters as primary text, English as secondary
  - English mode: Shows English as primary text, Chinese as secondary
- **Language Selection UX**: Integrated language selection into login screen
  - Removed separate language onboarding modal popup
  - Language selection buttons now appear directly in login screen
  - Automatically hides after user makes selection
- **Test Suite**: Fixed E2E tests to use correct API access pattern
  - All tests now use `window.MMWG_TEST_API.getState().settings` instead of direct `window.settings`
  - Added comprehensive Chinese mode test suite (6 tests, all passing)

### Changed
- Language mode selection is now part of the login flow instead of a separate modal
- Bootstrap logic updated to show/hide language selection based on existing preference

## [1.19.13] - 2026-03-06
### Added
- **Bilingual Learning Mode**: Complete dual-language learning system
  - Language mode selection: English learning (🇬🇧) and Chinese character learning (🇨🇳)
  - First-launch onboarding modal for language preference
  - Language mode settings in Settings panel with pinyin display toggle
  - Chinese vocabulary pack: Kindergarten Chinese characters (幼儿园汉字)
  - Bilingual vocabulary functions: word filtering, display transformation, and mode detection
  - Data migration system for bilingual mode (v2.2.0)
  - Pinyin generation tool for Chinese vocabulary

### Changed
- **TTS Language Switching**: Speech synthesis now respects language mode
  - Chinese mode: Only speaks Chinese pronunciation
  - English mode: Speaks English first, then Chinese (if enabled)
  - Language-aware speech rate settings
- **Vocabulary Manifest**: Converted to browser-compatible format
  - Changed from CommonJS to window global for browser support
  - Maintains Node.js compatibility for build tools

### Fixed
- Browser compatibility issues with vocabulary manifest loading
- Test suite handling of login/game screen states
- localStorage state management in E2E tests

### Testing
- Added 8 comprehensive E2E tests for bilingual mode
  - Language mode onboarding flow
  - Settings UI integration
  - Vocabulary pack availability
  - Function availability checks

## [1.19.12] - 2026-03-06
### Added
- Further optimization of font sizes for mobile readability.
- 10-second delay for the "Hint" button in all quiz/challenge modules to improve learning outcomes.
- Service Worker update for v1.19.12 cache management and offline support.
- Experimental: Bilingual learning mode base architecture, including new Chinese character vocabularies and E2E test framework.

## [1.19.11] - 2026-03-06
### Added
- Font size optimization for overlay titles, text, and buttons to improve readability on mobile devices.
- Scrollbars added to long content overlays (Settings, Save selection, etc.).
- 10-second delay for the "Hint" button in word quizzes to encourage player recall.

## [1.19.10] - 2026-03-06
### Added
#### Consumable Equipment System
- **Consumable Slot**: Added dedicated equipment slot for background materials (explosives, ender pearls, etc.)
  - Materials no longer used immediately after selection from inventory
  - Must be equipped to consumable slot first, then triggered via long-press
  - Visual feedback with pulsing glow animation when active
  - Real-time count display synced with inventory

- **Long-Press Trigger Mechanism** (800ms threshold)
  - Short press on attack button: Normal weapon attack
  - Long press on attack button: Use equipped consumable
  - Circular progress bar animation during hold
  - Pointer Events API with Touch Events fallback for cross-platform support

- **Debuff System**
  - Configuration-driven debuff effects (burn, slow, etc.)
  - Anti-stacking mechanism: same debuff type refreshes duration instead of stacking
  - Burn debuff: Damage-over-time with fire particle effects
  - Slow debuff: Speed reduction with visual indicator
  - Radius-based area-of-effect application

- **Particle Pool Optimization**
  - Object pooling for fire particles to reduce GC pressure
  - Automatic pool expansion when needed
  - Particle recycling for better performance

#### Configuration
- `config/consumables.json`: Centralized consumable definitions with effects, debuffs, and visual settings
- Fallback to hardcoded defaults if config file missing

#### UI Enhancements
- Consumable status display in HUD (icon, name, count)
- CSS animations: `hold-fill` (progress bar), `pulse-glow` (active state)
- Responsive design with clamp() for cross-device compatibility

#### Technical Implementation
- **Modified Files**:
  - `src/modules/01-config.js`: Global state initialization
  - `src/modules/10-ui.js`: UI update functions
  - `src/modules/13-game-loop.js`: Equipment and usage logic, debuff integration
  - `src/modules/16-events.js`: Long-press detection with `bindTapOrHold()`
  - `src/modules/17-bootstrap.js`: Config loading
  - `Game.html`: Consumable slot DOM elements
  - `src/styles.css`: Complete styling with animations

- **Total Changes**: 676 lines across 4 parallel tasks
  - task-1a (config): 153 lines - commit 942d925
  - task-2 (debuff+particles): 181 lines - commit d3686be
  - task-1b (long-press): 128 lines - commit efa184e
  - task-3 (UI+integration): 214 lines - commit bbdf0f6

### Changed
- `useInventoryItem()` function extended to apply debuffs based on consumable config
- Touch control system enhanced with dual-mode detection (tap vs hold)

### Technical Notes
- Maintains backward compatibility with existing inventory system
- No breaking changes to existing weapon mechanics
- All features verified via manual HTTP testing (Playwright tests skipped due to worktree node_modules conflicts)
