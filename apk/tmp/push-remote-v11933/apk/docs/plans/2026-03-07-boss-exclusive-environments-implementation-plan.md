# Boss Exclusive Environments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a reusable boss-exclusive environment layer, then land Warden and Blaze themed arenas with debug hooks and Playwright coverage.

**Architecture:** Keep the existing `bossArena` flow intact and add one reusable environment controller that owns background rendering, hazard updates, HUD state, and debug-readable environment state. Implement `warden` and `blaze` as first environment definitions on top of that controller, similar in spirit to `endDragonArena` but generic enough for future bosses.

**Tech Stack:** Vanilla JavaScript modules, existing `bossArena` / renderer pipeline, debug page bridge, Playwright E2E.

---

### Task 1: Audit existing boss arena hooks

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Modify: `src/modules/14-renderer-main.js`
- Modify: `src/modules/14-renderer-entities.js`
- Test: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**
- Add one debug-facing test that expects generic boss environment state fields to exist when a boss arena starts.

**Step 2: Run test to verify it fails**
- Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs -g "boss environment state" --reporter=line`
- Expected: FAIL because the generic environment state fields do not exist yet.

**Step 3: Write minimal implementation**
- Add empty but stable environment state plumbing to `bossArena` and surface the fields to debug state.

**Step 4: Run test to verify it passes**
- Run the same command.
- Expected: PASS.

**Step 5: Commit**
```bash
git add tests/e2e/specs/boss-debug-controls.spec.mjs src/modules/15-entities-boss.js src/modules/14-renderer-main.js src/modules/14-renderer-entities.js
git commit -m "feat: add generic boss environment state"
```

### Task 2: Add reusable boss environment controller

**Files:**
- Create: `src/modules/15-entities-boss-environments.js`
- Modify: `Game.html`
- Modify: `src/modules/15-entities-boss.js`
- Test: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**
- Add a test that enters a boss arena and expects a reusable environment controller to report active/inactive state transitions.

**Step 2: Run test to verify it fails**
- Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs -g "environment controller transitions" --reporter=line`
- Expected: FAIL because the controller does not exist.

**Step 3: Write minimal implementation**
- Create a controller with:
  - `active`
  - `bossType`
  - `phase`
  - `hazards`
  - `hudTitle`
  - `phaseLabel`
  - `objectiveLabel`
  - `statusLabel`
  - `bannerText`
  - `enter()` / `exit()` / `update()` / `renderBackground()` / `renderHud()`
- Wire it into `bossArena` lifecycle and `Game.html` script order.

**Step 4: Run test to verify it passes**
- Run the same command.
- Expected: PASS.

**Step 5: Commit**
```bash
git add src/modules/15-entities-boss-environments.js Game.html src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "feat: add reusable boss environment controller"
```

### Task 3: Surface environment debug state

**Files:**
- Modify: `tests/debug-pages/GameDebug.html`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**
- Add a test that expects debug state fields such as:
  - `bossEnvironmentActive`
  - `bossEnvironmentType`
  - `bossEnvironmentHazardCount`
  - `bossEnvironmentObjectiveLabel`

**Step 2: Run test to verify it fails**
- Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs -g "debug state exposes boss environment" --reporter=line`
- Expected: FAIL.

**Step 3: Write minimal implementation**
- Extend `GameDebug.html` to expose those fields from the new environment controller.

**Step 4: Run test to verify it passes**
- Run the same command.
- Expected: PASS.

**Step 5: Commit**
```bash
git add tests/debug-pages/GameDebug.html tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "test: expose boss environment debug state"
```

### Task 4: Implement Warden arena background + HUD

**Files:**
- Modify: `src/modules/15-entities-boss-environments.js`
- Modify: `src/modules/14-renderer-main.js`
- Test: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**
- Add a Warden-specific test that expects:
  - environment type `warden`
  - non-empty Warden HUD labels
  - a phase banner after entering or phase-shifting

**Step 2: Run test to verify it fails**
- Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs -g "Warden environment HUD" --reporter=line`
- Expected: FAIL.

**Step 3: Write minimal implementation**
- Implement Warden environment background and HUD text only:
  - dark overlay
  - limited glow points
  - `WARDEN` title
  - phase/objective/status labels
  - banner text on phase change

**Step 4: Run test to verify it passes**
- Run the same command.
- Expected: PASS.

**Step 5: Commit**
```bash
git add src/modules/15-entities-boss-environments.js src/modules/14-renderer-main.js tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "feat: add warden environment hud"
```

### Task 5: Implement Warden hazards

**Files:**
- Modify: `src/modules/15-entities-boss-environments.js`
- Modify: `src/modules/13-game-loop.js`
- Test: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**
- Add a Warden test expecting hazard creation and decay:
  - sonic lanes or crack zones appear
  - hazard count becomes > 0
  - hazard count or timer decays over time

**Step 2: Run test to verify it fails**
- Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs -g "Warden environment hazards" --reporter=line`
- Expected: FAIL.

**Step 3: Write minimal implementation**
- Implement two simple hazard types:
  - sonic wave lane
  - slam crack zone
- Keep them visually obvious and mechanically readable.

**Step 4: Run test to verify it passes**
- Run the same command.
- Expected: PASS.

**Step 5: Commit**
```bash
git add src/modules/15-entities-boss-environments.js src/modules/13-game-loop.js tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "feat: add warden environment hazards"
```

### Task 6: Implement Blaze arena background + HUD

**Files:**
- Modify: `src/modules/15-entities-boss-environments.js`
- Modify: `src/modules/14-renderer-main.js`
- Test: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**
- Add a Blaze-specific test that expects:
  - environment type `blaze`
  - blaze HUD labels
  - phase banner text

**Step 2: Run test to verify it fails**
- Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs -g "Blaze environment HUD" --reporter=line`
- Expected: FAIL.

**Step 3: Write minimal implementation**
- Implement Blaze environment background and HUD:
  - hot red/orange background
  - ember particles
  - `BLAZE` title
  - phase/objective/status labels

**Step 4: Run test to verify it passes**
- Run the same command.
- Expected: PASS.

**Step 5: Commit**
```bash
git add src/modules/15-entities-boss-environments.js src/modules/14-renderer-main.js tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "feat: add blaze environment hud"
```

### Task 7: Implement Blaze hazards

**Files:**
- Modify: `src/modules/15-entities-boss-environments.js`
- Modify: `src/modules/13-game-loop.js`
- Test: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**
- Add a Blaze hazard test expecting:
  - magma vent hazard creation
  - burn zone persistence
  - hazard timers decaying over time

**Step 2: Run test to verify it fails**
- Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs -g "Blaze environment hazards" --reporter=line`
- Expected: FAIL.

**Step 3: Write minimal implementation**
- Implement simple hazard types:
  - magma vent eruption
  - heat zone burn area

**Step 4: Run test to verify it passes**
- Run the same command.
- Expected: PASS.

**Step 5: Commit**
```bash
git add src/modules/15-entities-boss-environments.js src/modules/13-game-loop.js tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "feat: add blaze environment hazards"
```

### Task 8: Add debug controls for phase/hazard forcing

**Files:**
- Modify: `tests/debug-pages/GameDebug.html`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**
- Add a test that expects debug controls to:
  - switch boss environment phase
  - force a hazard wave
  - read back changed environment state

**Step 2: Run test to verify it fails**
- Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs -g "boss environment debug controls" --reporter=line`
- Expected: FAIL.

**Step 3: Write minimal implementation**
- Extend `MMDBG` with boss environment helpers.

**Step 4: Run test to verify it passes**
- Run the same command.
- Expected: PASS.

**Step 5: Commit**
```bash
git add tests/debug-pages/GameDebug.html tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "test: add boss environment debug helpers"
```

### Task 9: Run focused regression suite

**Files:**
- Test: `tests/e2e/specs/boss-debug-controls.spec.mjs`
- Test: `tests/e2e/specs/dragon-end-arena.spec.mjs`
- Test: `tests/e2e/specs/dragon-end-arena-helpers.spec.mjs`

**Step 1: Run regression commands**
- Run: `node --check src/modules/15-entities-boss-environments.js`
- Run: `node --check src/modules/15-entities-boss.js`
- Run: `node --check src/modules/14-renderer-main.js`
- Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs tests/e2e/specs/dragon-end-arena.spec.mjs tests/e2e/specs/dragon-end-arena-helpers.spec.mjs --reporter=line`
- Expected: all pass.

**Step 2: Commit**
```bash
git add src/modules/15-entities-boss-environments.js src/modules/15-entities-boss.js src/modules/14-renderer-main.js src/modules/13-game-loop.js tests/debug-pages/GameDebug.html tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "feat: add boss exclusive environments for warden and blaze"
```
