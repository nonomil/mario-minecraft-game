# Ender Dragon End Arena Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated End arena encounter for `EnderDragonBoss` with arena enter/exit flow, crystal healing, multi-phase combat, debug controls, and Playwright verification, without overloading the existing `bossArena` ground-boss system.

**Architecture:** Create a parallel `endDragonArena` controller instead of extending `bossArena` with dragon-only special cases. Keep the regular boss pipeline stable. Reuse existing End biome rendering ideas and debug/test infrastructure, but isolate dragon arena state, entities, hazards, and victory flow in dedicated code paths.

**Tech Stack:** Plain JavaScript modules, HTML5 canvas rendering, existing game bootstrap flow, existing debug bridge in `GameDebug.html`, Playwright E2E tests.

---

## Current Codebase Context

- Ground boss lifecycle lives in `src/modules/15-entities-boss.js`.
- Existing summonable/ridable dragon prototype lives in `src/modules/15-entities-combat.js`.
- End biome environment helpers live in `src/modules/06-biome.js`.
- Rendering integration points live in `src/modules/14-renderer-main.js` and `src/modules/14-renderer-entities.js`.
- Debug bridge lives in `tests/debug-pages/GameDebug.html`.
- Existing E2E helpers live in `tests/e2e/specs/helpers.mjs`.
- Existing boss smoke coverage establishes the style and debug contract for large encounters.

## Scope

### In Scope
- Add a dedicated `endDragonArena` controller.
- Add an `EnderDragonBoss` implementation distinct from the summonable ally dragon.
- Add arena crystals, pillars, breath hazards, victory portal, and return flow.
- Add debug controls and Playwright coverage.
- Split implementation into parallel worktrees and finish via integration branch.

### Out of Scope
- No imported sprite sheets or third-party art.
- No full outer-End exploration system.
- No merge of ally-dragon riding logic into the boss controller.
- No broad rewrite of the regular `bossArena` system.

## Recommended Parallel Branch Layout

1. `feat/dragon-arena-foundation`
   - Arena state machine, scene bootstrapping, enter/exit, HUD shell.
2. `feat/dragon-boss-flight-phases`
   - `EnderDragonBoss`, flight pathing, phase logic, fireball/dive attacks.
3. `feat/dragon-arena-crystals-hazards`
   - Crystals, healing beams, pillar metadata, breath pools, exit portal.
4. `feat/dragon-debug-tests`
   - Debug bridge, helper APIs, Playwright scenarios.
5. `feat/dragon-integration`
   - Merge branch for conflict resolution and final verification.

---

### Task 1: Create the dedicated arena state shell

**Files:**
- Create: `src/modules/15-entities-boss-dragon.js`
- Modify: `Game.html`
- Modify: `src/modules/11-game-init.js`
- Modify: `src/modules/14-renderer-main.js`
- Modify: `src/modules/14-renderer-entities.js`

**Step 1: Write the failing test**

Add a new file `tests/e2e/specs/dragon-end-arena.spec.mjs` with one first smoke test that expects the debug bridge to enter the dragon arena and expose this state shape:

- `dragonArenaActive === true`
- `dragonArenaState === "intro"` or `"combat"`
- `dragonBossName === "Ender Dragon"`
- `dragonCrystalCount >= 4`

**Step 2: Run test to verify it fails**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/dragon-end-arena.spec.mjs -g "enter dragon arena"`
Expected: FAIL because the debug API and arena state do not exist yet.

**Step 3: Write minimal implementation**

In `src/modules/15-entities-boss-dragon.js`:
- Create `globalThis.endDragonArena = { ... }` with at least:
  - `active`
  - `state`
  - `phase`
  - `dragon`
  - `crystals`
  - `hazards`
  - `entryContext`
  - `returnContext`
- Add methods:
  - `enter(options)`
  - `exit(result)`
  - `reset()`
  - `update()`
  - `renderBackground(ctx)`
  - `renderEntities(ctx)`
  - `renderHud(ctx)`
- Seed simple crystal placeholder data on `enter()`.
- Seed a placeholder dragon object on `enter()` so the smoke contract exists immediately.

In `Game.html`:
- Add `<script src="src/modules/15-entities-boss-dragon.js"></script>` after the boss/combat/entity modules are available and before bootstrap starts using game systems.

In `src/modules/11-game-init.js`:
- Reset `endDragonArena` if present during full game initialization.

In `src/modules/14-renderer-main.js` and `src/modules/14-renderer-entities.js`:
- Guardedly call the dragon arena render hooks when `endDragonArena.active` is true.

**Step 4: Run test to verify it passes**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/dragon-end-arena.spec.mjs -g "enter dragon arena"`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss-dragon.js Game.html src/modules/11-game-init.js src/modules/14-renderer-main.js src/modules/14-renderer-entities.js tests/e2e/specs/dragon-end-arena.spec.mjs
git commit -m "feat: add dragon arena foundation"
```

---

### Task 2: Add debug bridge and stable arena state snapshots

**Files:**
- Modify: `tests/debug-pages/GameDebug.html`
- Modify: `tests/e2e/specs/helpers.mjs`
- Modify: `tests/e2e/specs/dragon-end-arena.spec.mjs`
- Review: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**

Extend `dragon-end-arena.spec.mjs` to expect debug-exposed fields:

- `dragonArenaActive`
- `dragonArenaState`
- `dragonArenaPhase`
- `dragonBossHp`
- `dragonBossMaxHp`
- `dragonCrystalCount`
- `dragonAliveCrystalCount`
- `dragonHazardCount`
- `dragonVictoryReady`
- `dragonExitPortalReady`

Also add one test that calls debug API methods:
- `enterDragonArena()`
- `exitDragonArena()`
- `setDragonArenaPhase(3)`

**Step 2: Run test to verify it fails**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/dragon-end-arena.spec.mjs -g "debug API|state snapshot"`
Expected: FAIL because the bridge methods and fields are missing.

**Step 3: Write minimal implementation**

In `tests/debug-pages/GameDebug.html`:
- Add buttons or bridge functions for:
  - entering arena
  - exiting arena
  - forcing phase
  - destroying crystal
  - forcing victory
- Extend the existing debug snapshot generator to include dragon arena state.

In `tests/e2e/specs/helpers.mjs`:
- Add helpers:
  - `enterDragonArena(page)`
  - `exitDragonArena(page)`
  - `setDragonArenaPhase(page, phase)`
  - `getDragonArenaState(page)`

**Step 4: Run test to verify it passes**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/dragon-end-arena.spec.mjs -g "debug API|state snapshot"`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/debug-pages/GameDebug.html tests/e2e/specs/helpers.mjs tests/e2e/specs/dragon-end-arena.spec.mjs
git commit -m "test: add dragon arena debug bridge"
```

---

### Task 3: Implement `EnderDragonBoss` flight and phase behavior

**Files:**
- Modify: `src/modules/15-entities-boss-dragon.js`
- Modify: `tests/e2e/specs/dragon-end-arena.spec.mjs`

**Step 1: Write the failing test**

Add tests that expect:

- dragon starts in phase 1 with a stable `dragonIntentKey` such as `orbit_crystal_heal`
- forcing phase 2 eventually exposes `dive_charge` or `fireball_breath`
- forcing phase 3 eventually exposes `perch_frenzy` or `low_sweep`
- dragon HP decreases when directly damaged through the debug hook

**Step 2: Run test to verify it fails**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/dragon-end-arena.spec.mjs -g "phase 1|phase 2|phase 3"`
Expected: FAIL because the dragon boss behavior does not exist yet.

**Step 3: Write minimal implementation**

In `src/modules/15-entities-boss-dragon.js`:
- Add `class EnderDragonBoss` with stable fields:
  - `name`
  - `maxHp`
  - `hp`
  - `phase`
  - `state`
  - `intentKey`
  - `alive`
  - `x/y`
  - `vx/vy`
  - `fireballs`
- Add methods:
  - `update(player, arena)`
  - `takeDamage(amount)`
  - `setPhase(phase)`
  - `spawnFireball(targetX, targetY)`
  - `render(ctx)`
- Implement simplified, deterministic behavior loops for each phase so tests can observe stable intent changes.
- Keep movement readable and avoid physics complexity beyond what is needed for the first shipping version.

**Step 4: Run test to verify it passes**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/dragon-end-arena.spec.mjs -g "phase 1|phase 2|phase 3"`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss-dragon.js tests/e2e/specs/dragon-end-arena.spec.mjs
git commit -m "feat: add dragon boss flight phases"
```

---

### Task 4: Implement crystals, healing, and arena hazards

**Files:**
- Modify: `src/modules/15-entities-boss-dragon.js`
- Modify: `tests/e2e/specs/dragon-end-arena.spec.mjs`

**Step 1: Write the failing test**

Add tests that expect:

- alive crystals can heal the dragon in phase 1
- destroying one crystal reduces `dragonAliveCrystalCount`
- destroying an actively linked crystal damages the dragon or interrupts healing
- fireball impact produces at least one hazard entry
- forcing victory enables `dragonExitPortalReady`

**Step 2: Run test to verify it fails**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/dragon-end-arena.spec.mjs -g "crystal|hazard|victory"`
Expected: FAIL because crystals and hazards are placeholders only.

**Step 3: Write minimal implementation**

In `src/modules/15-entities-boss-dragon.js`:
- Add crystal records with:
  - `id`
  - `alive`
  - `x/y`
  - `radius`
  - `beamActive`
  - `healCooldown`
- Implement arena helpers:
  - `spawnCrystals()`
  - `destroyCrystal(id)`
  - `updateCrystalHealing()`
  - `spawnBreathHazard(x, y)`
  - `updateHazards()`
  - `markVictory()`
- When a linked crystal is destroyed, apply bonus dragon damage or a heal interruption flag.
- On victory, mark `victoryReady = true`, then `exitPortalReady = true` after a short deterministic delay.

**Step 4: Run test to verify it passes**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/dragon-end-arena.spec.mjs -g "crystal|hazard|victory"`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss-dragon.js tests/e2e/specs/dragon-end-arena.spec.mjs
git commit -m "feat: add dragon crystals and hazards"
```

---

### Task 5: Hook arena entry to gameplay and restore main-run context

**Files:**
- Modify: `src/modules/15-entities-boss-dragon.js`
- Modify: `src/modules/06-biome.js`
- Modify: `src/modules/11-game-init.js`
- Modify: `tests/e2e/specs/dragon-end-arena.spec.mjs`

**Step 1: Write the failing test**

Add a test that expects:

- entering from gameplay stores a stable return context
- exiting victory or defeat restores player control and leaves `dragonArenaActive === false`
- the player returns to a safe position in the regular world flow

**Step 2: Run test to verify it fails**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/dragon-end-arena.spec.mjs -g "return context|restore"`
Expected: FAIL because there is no return-context restoration yet.

**Step 3: Write minimal implementation**

In `src/modules/15-entities-boss-dragon.js`:
- Save player/world context on `enter()`.
- Restore it on `exit()`.
- Add safe fallback if the original context is incomplete.

In `src/modules/06-biome.js`:
- Add one controlled entry hook for the End biome to trigger arena entry without tightly coupling all biome code to dragon logic.

In `src/modules/11-game-init.js`:
- Ensure all dragon arena state is fully reset on hard game init.

**Step 4: Run test to verify it passes**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/dragon-end-arena.spec.mjs -g "return context|restore"`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss-dragon.js src/modules/06-biome.js src/modules/11-game-init.js tests/e2e/specs/dragon-end-arena.spec.mjs
git commit -m "feat: restore world context after dragon arena"
```

---

### Task 6: Integration branch and final verification

**Files:**
- Validate: `src/modules/15-entities-boss-dragon.js`
- Validate: `src/modules/06-biome.js`
- Validate: `src/modules/11-game-init.js`
- Validate: `src/modules/14-renderer-main.js`
- Validate: `src/modules/14-renderer-entities.js`
- Validate: `tests/debug-pages/GameDebug.html`
- Validate: `tests/e2e/specs/helpers.mjs`
- Validate: `tests/e2e/specs/dragon-end-arena.spec.mjs`

**Step 1: Merge feature branches into the integration branch**

Merge in this order:
1. `feat/dragon-arena-foundation`
2. `feat/dragon-boss-flight-phases`
3. `feat/dragon-arena-crystals-hazards`
4. `feat/dragon-debug-tests`

Resolve conflicts in `src/modules/15-entities-boss-dragon.js`, `tests/debug-pages/GameDebug.html`, and `tests/e2e/specs/dragon-end-arena.spec.mjs` carefully.

**Step 2: Run syntax validation**

Run:
- `node --check src/modules/15-entities-boss-dragon.js`
- `node --check src/modules/06-biome.js`
- `node --check src/modules/11-game-init.js`
- `node --check tests/e2e/specs/helpers.mjs`
- `node --check tests/e2e/specs/dragon-end-arena.spec.mjs`

Expected: PASS.

**Step 3: Run focused Playwright coverage**

Run:
- `MMWG_E2E_PORT=4290 npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/dragon-end-arena.spec.mjs --reporter=line`

Expected: PASS.

**Step 4: Run regression spot checks**

Run:
- `MMWG_E2E_PORT=4290 npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs --reporter=line`

Expected: PASS, proving the dragon arena did not break the regular boss pipeline.

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss-dragon.js src/modules/06-biome.js src/modules/11-game-init.js src/modules/14-renderer-main.js src/modules/14-renderer-entities.js tests/debug-pages/GameDebug.html tests/e2e/specs/helpers.mjs tests/e2e/specs/dragon-end-arena.spec.mjs
git commit -m "feat: integrate ender dragon end arena"
```

---

## Verification Checklist

- `endDragonArena` and `bossArena` can coexist without sharing mutable combat state.
- A dragon arena run can be entered, won, exited, and reset repeatedly.
- Crystal healing and crystal destruction are externally visible via debug state.
- At least one stable `intentKey` exists per dragon phase.
- Victory sets a portal-ready state before leaving the arena.
- Existing regular boss smoke tests still pass.

## Notes for Execution

- Keep the dragon encounter deterministic enough for Playwright; avoid randomness without a debug override.
- Prefer small helper functions over deep nested update logic.
- Reuse existing render token style where possible, but do not contort `bossArena` to host dragon-only logic.
- Commit after each task branch reaches green.
