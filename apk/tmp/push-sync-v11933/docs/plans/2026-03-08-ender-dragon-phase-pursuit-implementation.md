# Ender Dragon Phase Pursuit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Ender Dragon's static hover motion with a three-phase pursuit model that actively tracks and attacks the player inside the dedicated End arena.

**Architecture:** Extend `EnderDragonBoss` with lightweight pursuit state and let `endDragonArena.update()` pass player context into dragon AI each frame. Preserve the current arena lifecycle, HUD, and debug bridge while replacing center-arena motion with player-relative target selection, dive movement, and attack-linked hazard placement.

**Tech Stack:** Plain JavaScript modules, HTML5 canvas rendering, existing `GameDebug.html` debug bridge, Playwright E2E tests.

---

## Current Codebase Context

- Dragon controller and render logic live in `src/modules/15-entities-boss-dragon.js`.
- Dragon arena tests live in `tests/e2e/specs/dragon-end-arena.spec.mjs`.
- Debug entry and inspection live in `tests/debug-pages/GameDebug.html`.
- Existing phase intent contract already uses:
  - `orbit_crystal_heal`
  - `dive_charge`
  - `fireball_breath`
  - `perch_frenzy`
  - `low_sweep`

## Scope

### In Scope

- Make dragon movement player-relative
- Make phase 2 and 3 offensively chase the player
- Make hazards spawn from attack intent instead of only fixed arena center logic
- Add regression tests for pursuit behavior

### Out of Scope

- No full behavior tree rewrite
- No imported art
- No redesign of the regular boss arena system

---

### Task 1: Add failing pursuit tests

**Files:**
- Modify: `tests/e2e/specs/dragon-end-arena.spec.mjs`

**Step 1: Write the failing test**

Add tests that:

- enter dragon arena
- move player far to the right
- tick several frames
- expect dragon `x` to increase toward player region

Add another test that:

- enters phase 2
- positions player away from dragon
- ticks enough frames for aggressive pursuit
- expects horizontal distance between dragon and player to shrink

**Step 2: Run test to verify it fails**

Run: `npm.cmd run test:e2e -- tests/e2e/specs/dragon-end-arena.spec.mjs -g "tracks player|shrinks horizontal gap"`

Expected: FAIL because dragon motion still uses the arena-center sine path.

**Step 3: Commit**

```bash
git add tests/e2e/specs/dragon-end-arena.spec.mjs
git commit -m "test: add failing dragon pursuit behavior checks"
```

---

### Task 2: Pass player context into dragon AI

**Files:**
- Modify: `src/modules/15-entities-boss-dragon.js`

**Step 1: Implement minimal controller handoff**

In `endDragonArena.update()`:

- build a small player context from `globalThis.player`
- call `this.dragon.update(playerContext)` instead of `this.dragon.update()`

Player context should include:

- `x`
- `y`
- `velX`
- `velY`
- `grounded`

**Step 2: Run focused syntax verification**

Run:

```bash
node --check src/modules/15-entities-boss-dragon.js
```

Expected: PASS

**Step 3: Commit**

```bash
git add src/modules/15-entities-boss-dragon.js
git commit -m "refactor: pass player context into dragon arena ai"
```

---

### Task 3: Implement phase 1 player-relative orbit

**Files:**
- Modify: `src/modules/15-entities-boss-dragon.js`

**Step 1: Add lightweight pursuit state**

Add dragon properties for:

- `targetX`
- `targetY`
- `velocityX`
- `velocityY`
- `movementMode`
- `attackCooldown`
- `attackTimer`

**Step 2: Replace static center-orbit with smoothed player-relative target selection**

For phase 1:

- target `x` should follow player `x`
- target `y` should remain above player and below HUD
- movement should use smoothing, not teleporting

**Step 3: Run focused tests**

Run:

```bash
npm.cmd run test:e2e -- tests/e2e/specs/dragon-end-arena.spec.mjs -g "tracks player"
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/modules/15-entities-boss-dragon.js tests/e2e/specs/dragon-end-arena.spec.mjs
git commit -m "feat: make phase one dragon orbit track the player"
```

---

### Task 4: Implement phase 2 dive and breath pursuit

**Files:**
- Modify: `src/modules/15-entities-boss-dragon.js`
- Modify: `tests/e2e/specs/dragon-end-arena.spec.mjs`

**Step 1: Implement `dive_charge` behavior**

When intent is `dive_charge`:

- choose a predicted player position using current `player.x` and `player.velX`
- accelerate dragon toward that position
- after approach, reset to a climb/recover target

**Step 2: Implement `fireball_breath` hazard placement**

When intent is `fireball_breath`:

- place breath hazards near player pathing instead of only dragon-local offsets

**Step 3: Run focused tests**

Run:

```bash
npm.cmd run test:e2e -- tests/e2e/specs/dragon-end-arena.spec.mjs -g "shrinks horizontal gap|hazard"
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/modules/15-entities-boss-dragon.js tests/e2e/specs/dragon-end-arena.spec.mjs
git commit -m "feat: add phase two dragon pursuit dives and breath targeting"
```

---

### Task 5: Implement phase 3 low sweep frenzy

**Files:**
- Modify: `src/modules/15-entities-boss-dragon.js`
- Modify: `tests/e2e/specs/dragon-end-arena.spec.mjs`

**Step 1: Lower altitude and tighten lock-on distance**

For phase 3:

- target altitude lower than phase 1 and 2
- reduce horizontal slack
- increase movement aggression

**Step 2: Map `perch_frenzy` and `low_sweep` to close-range pressure**

- `perch_frenzy` should hover near player with repeated short corrections
- `low_sweep` should perform a low pass across player position

**Step 3: Run focused tests**

Run:

```bash
npm.cmd run test:e2e -- tests/e2e/specs/dragon-end-arena.spec.mjs -g "phase 1|phase 2|phase 3|tracks player|horizontal gap"
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/modules/15-entities-boss-dragon.js tests/e2e/specs/dragon-end-arena.spec.mjs
git commit -m "feat: add phase three low sweep pursuit pressure"
```

---

### Task 6: Full verification and manual debug validation

**Files:**
- Validate: `src/modules/15-entities-boss-dragon.js`
- Validate: `tests/e2e/specs/dragon-end-arena.spec.mjs`
- Validate: `tests/debug-pages/GameDebug.html`

**Step 1: Run syntax checks**

Run:

```bash
node --check src/modules/15-entities-boss-dragon.js
```

Expected: PASS

**Step 2: Run full dragon arena test file**

Run:

```bash
npm.cmd run test:e2e -- tests/e2e/specs/dragon-end-arena.spec.mjs
```

Expected: PASS

**Step 3: Manual debug validation**

Run:

```bash
tests\debug-pages\start-debug-server.bat
```

Open:

```text
http://127.0.0.1:4173/tests/debug-pages/GameDebug.html
```

Validate manually:

- dragon no longer hovers around arena center only
- dragon movement shifts when player moves
- phase 2 visibly chases and dives
- phase 3 visibly pressures from lower altitude

**Step 4: Capture evidence**

Save screenshots under:

- `test-results/manual/dragon-phase-pursuit-debug-page.png`
- `test-results/manual/dragon-phase-pursuit-canvas.png`

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss-dragon.js tests/e2e/specs/dragon-end-arena.spec.mjs test-results/manual
git commit -m "feat: add three-phase player pursuit to dragon arena"
```

