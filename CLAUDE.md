# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A side-scrolling platformer game inspired by Super Mario with Minecraft-themed graphics and integrated English vocabulary learning. The game is built as a single-page HTML5 application with vanilla JavaScript and can be packaged as an Android APK using Capacitor.

**Repository Structure:**
- Root directory contains the web version (`Game.html`, `src/`, `config/`, `words/`)
- `apk/` directory contains a copy of the game plus Android build infrastructure

## Build Commands

### Web Version (Root Directory)

**Build single-file offline version:**
```bash
node tools/build-singlefile.js
# Output: out/Game.offline.html
```

**Run tests:**
```bash
npm test                # Run Playwright tests
npm run test:headed     # Run tests with browser UI
```

### Android APK (apk/ Directory)

**Build APK locally:**
```bash
cd apk/android-app
npm ci                                    # Install dependencies
cd .. && node scripts/sync-web.js         # Generate offline HTML and sync to android-app/web/
cd android-app && npx cap sync android    # Sync web assets to Android project
cd android/
./gradlew assembleDebug                   # Build debug APK
# Output: android-app/android/app/build/outputs/apk/debug/*.apk
```

**Quick push to GitHub (triggers CI build):**
```bash
cd apk
./push.bat    # Windows batch script that handles git push with retries
```

**CI/CD:**
- GitHub Actions automatically builds APK on push to `main` branch when `apk/**` changes
- Workflow: `.github/workflows/android.yml`
- Requires signing secrets for release builds (see `docs/SIGNING.md`)
- Published to `apk-latest` Release tag

## Code Architecture

### Module System

The game uses a numbered module system loaded sequentially via `<script>` tags in `Game.html`. Modules share global scope and depend on earlier modules being loaded first.

**Module Loading Order:**
1. `src/defaults.js` - Default configuration values
2. `src/storage.js` - LocalStorage wrapper
3. `words/vocabs/manifest.js` - Vocabulary pack registry
4. `src/modules/01-config.js` - Global state, constants, config loading
5. `src/modules/02-utils.js` - Utility functions
6. `src/modules/03-audio.js` - Audio and speech synthesis
7. `src/modules/04-weapons.js` - Weapon system
8. `src/modules/05-difficulty.js` - Dynamic difficulty adjustment
9. `src/modules/06-biome.js` - Biome system (forest, desert, deep dark, etc.)
10. `src/modules/07-viewport.js` - Camera and viewport management
11. `src/modules/08-account.js` - User account and login system
12. `src/modules/09-vocab.js` - Vocabulary engine and spaced repetition
13. `src/modules/10-ui.js` - UI modals and HUD
14. `src/modules/11-game-init.js` - Game initialization and level generation
15. `src/modules/12-challenges.js` - Learning challenges (multiple choice, word match)
16. `src/modules/12-village-challenges.js` - Village-specific challenges
17. `src/modules/13-game-loop.js` - Main game loop, physics, collision
18. `src/modules/entity-names.js` - Entity name mappings
19. `src/modules/14-renderer-*.js` - Rendering system (main, entities, decorations)
20. `src/modules/15-entities-*.js` - Entity logic (base, decorations, combat, boss, particles)
21. `src/modules/16-events.js` - Event handlers (keyboard, touch, buttons)
22. `src/modules/17-bootstrap.js` - Application startup
23. `src/modules/18-village.js` - Village system
24. `src/modules/18-village-render.js` - Village rendering

**Key Architecture Patterns:**

- **Global Scope:** All modules share global scope. Variables declared with `let`/`const` at module top-level are accessible across modules loaded after them.
- **Sequential Dependencies:** Module N can reference any variable/function from modules 1 through N-1.
- **No Imports:** No ES6 modules or require() - pure script concatenation model.
- **Initialization Flow:** `start()` function in `17-bootstrap.js` is the entry point, called after all modules load.

### Core Systems

**Game Loop (13-game-loop.js):**
- `gameLoop()` - Main loop called via `requestAnimationFrame`
- Handles physics, collision detection, entity updates, difficulty scaling
- Manages player movement, enemy AI, projectiles, particles

**Rendering (14-renderer-*.js):**
- Canvas 2D rendering with camera offset
- Layered rendering: background → platforms → entities → decorations → particles → HUD
- Biome-specific visual themes

**Vocabulary System (09-vocab.js):**
- Spaced repetition algorithm with quality-based scheduling
- Multiple vocabulary packs (kindergarten, elementary, minecraft)
- Word collection triggers learning challenges
- Progress tracking per word (exposure count, last seen, quality score)

**Learning Challenges (12-challenges.js):**
- Multiple choice questions
- Word matching games
- Timed challenges with rewards
- Triggered by collecting word items or opening chests

**Difficulty System (05-difficulty.js):**
- Dynamic difficulty adjustment based on player performance
- Scales enemy stats, spawn rates, loot quality
- Biome progression tied to score milestones

**Biome System (06-biome.js):**
- Multiple biomes: forest, desert, snow, deep_dark, village
- Each biome has unique visuals, enemies, and mechanics
- Automatic biome switching based on score thresholds

### Configuration Files

All configs are in `config/` directory:
- `game.json` - Core game parameters (physics, player stats, canvas size)
- `controls.json` - Keyboard bindings
- `levels.json` - Level definitions (currently single endless level)
- `biomes.json` - Biome configurations and switching rules
- `village.json` - Village spawn settings

### Vocabulary Data

Located in `words/` directory:
- `words-base.json` - Fallback word list
- `vocabs/manifest.js` - Registry of vocabulary packs
- `vocabs/*/` - Individual vocabulary pack directories with word lists

## Development Workflow

**Making Changes:**
1. Edit source files in root directory (`src/`, `config/`, `words/`, `Game.html`)
2. Test locally by opening `Game.html` in browser
3. For Android testing, run `node tools/build-singlefile.js` then sync to `apk/`

**Android Build Workflow:**
1. Make changes in root directory
2. Copy changes to `apk/` directory (or work directly in `apk/`)
3. Run `node scripts/sync-web.js` from `apk/` to generate offline HTML
4. Push to GitHub - CI builds APK automatically
5. Download APK from `apk-latest` Release

**Module Editing:**
- When editing a module, be aware of its position in the load order
- Can only reference variables/functions from earlier modules
- Global state is in `01-config.js`
- Avoid circular dependencies

**Build System:**
- `tools/build-singlefile.js` - Inlines all scripts, styles, and JSON configs into single HTML file
- Replaces `fetch()` calls with inline data
- Used for offline play and Android packaging

## Important Notes

- The game uses Chinese UI text (`zh-CN`) but teaches English vocabulary
- Touch controls are automatically shown on mobile devices
- Device mode (`auto`/`mobile`/`tablet`) affects scaling and UI layout
- LocalStorage is used for save data, settings, and progress tracking
- Speech synthesis requires user interaction to unlock (browser security)
- The numbered module system must be preserved - renaming breaks load order
