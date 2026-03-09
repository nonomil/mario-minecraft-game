# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A side-scrolling platformer game inspired by Super Mario with Minecraft-themed graphics and integrated English vocabulary learning. The game is built as a single-page HTML5 application with vanilla JavaScript and can be packaged as an Android APK using Capacitor.

**Repository Structure:**
- **`apk/` 是唯一的开发目录（单一真源）。** 所有开发、测试、发布均从此目录进行。
- 根目录代码已废弃，仅作归档保留。根目录 `Game.html` 已替换为跳转提示页。
- 不要修改根目录的 `src/`、`config/`、`words/` 文件，所有改动只在 `apk/` 下进行。

## Build Commands

### Local Development (apk/ Directory)

**测试游戏：** 直接在浏览器打开 `apk/Game.html`，无需服务器。

**开发服务器：** `node tools/serve-apk.mjs --port 4173`

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

**CI/CD:**
- GitHub Actions automatically builds APK on push to `main` branch when `apk/**` changes
- Workflow: `.github/workflows/android.yml`
- Requires signing secrets for release builds (see `docs/SIGNING.md`)
- Published to `apk-latest` Release tag

## Code Architecture

### Module System

The game uses a numbered module system loaded sequentially via `<script>` tags in `apk/Game.html`. Modules share global scope and depend on earlier modules being loaded first.

**Module Loading Order (apk/src/modules/):**
1. `defaults.js` - Default configuration values
2. `storage.js` - LocalStorage wrapper
3. `words/vocabs/manifest.js` - Vocabulary pack registry
4. `01-config.js` - Global state, constants, config loading
5. `02-utils.js` - Utility functions
6. `03-audio.js` - Audio and speech synthesis
7. `04-weapons.js` - Weapon system
8. `05-difficulty.js` - Dynamic difficulty adjustment
9. `06-biome.js` - Biome system (forest, desert, deep dark, cherry grove, nether, volcano, etc.)
10. `07-viewport.js` - Camera and viewport management
11. `08-account.js` - User account, login, save progress system
12. `09-vocab.js` - Vocabulary engine and spaced repetition
13. `10-ui.js` - UI modals, HUD, overlays
14. `11-game-init.js` - Game initialization and level generation
15. `12-challenges.js` - Learning challenges (multiple choice, word match)
16. `12-village-challenges.js` - Village-specific challenges
17. `13-game-loop.js` - Main game loop, physics, collision, armor durability
18. `entity-names.js` - Entity name mappings
19. `14-renderer-*.js` - Rendering system (main, entities, decorations)
20. `15-entities-*.js` - Entity logic (base, decorations, combat, boss, particles)
21. `16-events.js` - Event handlers (keyboard, touch, buttons)
22. `17-bootstrap.js` - Application startup
23. `18-village.js` - Village system, trader, buffs
24. `18-village-render.js` - Village rendering
25. `18-interaction-chains.js` - Interaction chain system
26. `19-biome-visuals.js` - Biome visual effects
27. `20-enemies-new.js` - New enemy types
28. `21-decorations-new.js` - New decoration rendering (cherry trees, etc.)

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
- `tickArmorDurabilityByTime()` - Armor durability time-based decay
- `damagePlayer()` - Damage calculation with armor reduction
- `ARMOR_DURATION_MINUTES` - Armor lifetime config (defined here, not in 01-config.js)

**Rendering:**
- `14-renderer-main.js` - Background, platforms, biome visuals, tree rendering (spruce/pine/oak)
- `14-renderer-entities.js` - `drawSteve()` player rendering with armor overlay
- `14-renderer-decorations.js` - Decoration rendering
- `21-decorations-new.js` - New biome decorations (`renderCherryTree()`, etc.)

**Vocabulary System (09-vocab.js):**
- Spaced repetition algorithm with quality-based scheduling
- Multiple vocabulary packs (kindergarten, elementary, junior high, minecraft)
- Word collection triggers learning challenges
- Progress tracking per word (exposure count, last seen, quality score)

**Biome System (06-biome.js):**
- Multiple biomes: forest, desert, snow, deep_dark, village, cherry_grove, nether, volcano
- Environmental damage system (`updateExtremeHeatEnvironment()`)
- Heat protection via sunscreen buff or netherite armor
- `hasHeatProtection()` checks village buffs

**Account & Save System (08-account.js):**
- Account CRUD via LocalStorage (`MMWG_STORAGE`)
- `saveCurrentProgress()` - saves score, words, inventory, equipment
- Auto-save every 30 seconds
- Save progress modal (works with or without existing account)
- Welcome tutorial overlay on first launch

**Village & Buffs (18-village.js):**
- Village trader sells items including sunscreen
- Buff system: `setVillageBuff()`, `hasVillageBuff()`, `getPlayerBuffStore()`
- Sunscreen buff provides heat protection in desert/nether

### Configuration Files

All configs are in `apk/config/` directory:
- `game.json` - Core game parameters (physics, player stats, canvas size)
- `controls.json` - Keyboard bindings
- `levels.json` - Level definitions (currently single endless level)
- `biomes.json` - Biome configurations and switching rules
- `village.json` - Village spawn settings

### Vocabulary Data

Located in `apk/words/` directory:
- `words-base.json` - Fallback word list
- `vocabs/manifest.js` - Registry of vocabulary packs
- `vocabs/*/` - Individual vocabulary pack directories with word lists

## Development Workflow

**Making Changes:**
1. Edit source files in `apk/` directory (`apk/src/`, `apk/config/`, `apk/words/`, `apk/Game.html`)
2. Test locally by opening `apk/Game.html` in browser
3. Push to GitHub - CI builds APK automatically

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

- **apk/ 是唯一开发目录，根目录已废弃**
- The game uses Chinese UI text (`zh-CN`) but teaches English vocabulary
- Touch controls are automatically shown on mobile devices
- Device mode (`auto`/`mobile`/`tablet`) affects scaling and UI layout
- LocalStorage is used for save data, settings, and progress tracking
- Speech synthesis requires user interaction to unlock (browser security)
- The numbered module system must be preserved - renaming breaks load order
