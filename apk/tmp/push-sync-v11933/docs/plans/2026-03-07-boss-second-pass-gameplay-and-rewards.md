# Boss Second Pass Gameplay and Rewards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deepen the gameplay identity of the existing 6-boss roster with clearer phase behavior, signature attacks, and boss-specific victory rewards, without replacing the current boss arena lifecycle.

**Architecture:** Keep the current `Boss` base class and `bossArena` orchestration intact, and layer a second-pass system on top: stable debug metadata (`intentKey`, `rewardKey`, attack type snapshots), lightweight victory reward hooks, and more distinctive attack loops per boss pair. Implement shared hooks first, then split boss behavior work into parallel branches that can later be merged in an integration worktree.

**Tech Stack:** Plain JavaScript modules, HTML5 canvas rendering, existing `bossArena` system, `GameDebug.html` debug bridge, Playwright E2E smoke tests.

---

## Current Codebase Context

- Boss core lives in `src/modules/15-entities-boss.js`.
- Debug bridge lives in `tests/debug-pages/GameDebug.html`.
- Existing Playwright boss coverage lives in `tests/e2e/specs/boss-debug-controls.spec.mjs` and `tests/e2e/specs/boss-visual-smoke.spec.mjs`.
- Current victory rewards are hard-coded in `bossArena.onVictory()` and are not boss-specific yet.
- Current debug state already exposes `bossVisualKey`, `bossPhase`, `bossState`, `bossProjectileCount`, and `bossMinionTypes`.

## Batch 2 Scope

### In Scope
- Add shared boss debug metadata for second-pass tuning.
- Add boss-specific reward metadata and lightweight reward delivery on victory.
- Deepen each existing boss with one signature move or one stronger phase identity.
- Expand Playwright coverage so each boss has a stable second-pass verification path.
- Keep the work split across parallel worktrees and finish with an integration branch.

### Out of Scope
- No `ender_dragon` implementation in this batch.
- No new world-scale flying arena system.
- No imported art/sprites.
- No broad rebalance of unrelated combat systems.

## Recommended Parallel Branch Layout

1. `feat/boss2-foundation-rewards`
   - Shared metadata, debug hooks, reward plumbing.
2. `feat/boss2-air-pressure`
   - `WitherBoss` + `GhastBoss` second-pass mechanics.
3. `feat/boss2-fire-bone`
   - `BlazeBoss` + `WitherSkeletonBoss` second-pass mechanics.
4. `feat/boss2-deep-arcane`
   - `WardenBoss` + `EvokerBoss` second-pass mechanics.
5. `feat/boss2-integration`
   - Merge branch for final conflict resolution and verification.

---

### Task 1: Add Shared Boss Intent / Reward Debug Hooks

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Modify: `tests/debug-pages/GameDebug.html`
- Modify: `tests/e2e/specs/helpers.mjs`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**

Extend `boss-debug-controls.spec.mjs` so the debug state is expected to expose:
- `bossIntentKey`
- `bossRewardKey`
- `bossProjectileTypes`
- `bossVictoryReady`

At minimum, assert that a spawned `blaze` and `warden` return non-empty `bossRewardKey`, and that after forcing phase 3 they return non-empty `bossIntentKey`.

**Step 2: Run test to verify it fails**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs -g "working MMDBG API|Blaze|Warden"`
Expected: FAIL because the extra debug fields do not exist yet.

**Step 3: Write minimal implementation**

In `src/modules/15-entities-boss.js`:
- Add stable shared fields on `Boss`:
  - `intentKey`
  - `rewardKey`
  - `rewardDrops`
- Add helper methods for:
  - `setIntent(key)`
  - `setReward(config)`
  - `getProjectileTypeSnapshot()`
- Populate initial `rewardKey` / `rewardDrops` per boss.

In `tests/debug-pages/GameDebug.html`:
- Add the new boss debug fields to `window.MMDBG.getState()`.
- Add a small inventory snapshot only if required by the victory test later.

In `tests/e2e/specs/helpers.mjs`:
- Add helper(s) for forced boss defeat if needed later.

**Step 4: Run test to verify it passes**

Run the same targeted Playwright command.
Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss.js tests/debug-pages/GameDebug.html tests/e2e/specs/helpers.mjs tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "feat: add boss second-pass debug hooks"
```

---

### Task 2: Add Boss-Specific Victory Rewards

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Modify: `tests/debug-pages/GameDebug.html`
- Modify: `tests/e2e/specs/helpers.mjs`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**

Add one Playwright test that:
- Spawns a `blaze`
- Records pre-victory score / inventory snapshot
- Forces the boss to die through a debug helper
- Waits a few ticks
- Asserts score increases and at least one expected reward marker changes

Use boss-specific reward assertions such as:
- `blaze` ? `blaze_powder`
- `wither_skeleton` ? `coal` or `iron`
- `warden` ? `echo_shard`
- `evoker` ? `emerald` or `potion`

**Step 2: Run test to verify it fails**

Run the targeted Playwright test.
Expected: FAIL because victory is still generic.

**Step 3: Write minimal implementation**

In `src/modules/15-entities-boss.js`:
- Replace the hard-coded generic reward block in `bossArena.onVictory()` with:
  - shared guaranteed score reward
  - shared guaranteed armor reward (if you keep it)
  - boss-specific item drops driven by `boss.rewardDrops`
  - reward toast text that mentions the defeated boss
- Keep backward compatibility for any external `onVictory` callback.

In `tests/debug-pages/GameDebug.html`:
- Add inventory snapshot fields needed for the assertion.

**Step 4: Run test to verify it passes**

Run the targeted Playwright test.
Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss.js tests/debug-pages/GameDebug.html tests/e2e/specs/helpers.mjs tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "feat: add boss-specific victory rewards"
```

---

### Task 3: Rework Wither + Ghast into Air-Control Encounters

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Test: `tests/e2e/specs/boss-debug-controls.spec.mjs`
- Test: `tests/e2e/specs/boss-visual-smoke.spec.mjs`

**Step 1: Write the failing tests**

Add tests that verify:
- `WitherBoss` phase 3 can enter a stable `intentKey` such as `skull_barrage` or `dash_sweep`
- `WitherBoss` produces at least one distinctive projectile subtype for the new attack window
- `GhastBoss` phase 3 can enter a stable `intentKey` such as `bombardment`
- `GhastBoss` produces its upgraded fireball volley subtype

**Step 2: Run tests to verify they fail**

Run the targeted Playwright tests.
Expected: FAIL because the new intent / projectile types do not exist yet.

**Step 3: Write minimal implementation**

In `src/modules/15-entities-boss.js`:
- `WitherBoss`
  - add a second-pass aerial sweep / barrage loop
  - emit a unique projectile type for the special attack
  - update `intentKey` during telegraph and release
- `GhastBoss`
  - add a bombardment window or wider volley pattern
  - emit a unique projectile type for the upgraded attack
  - update `intentKey`
- Keep base HP bar, arena lock, and current render flow intact.

**Step 4: Run tests to verify they pass**

Run the same targeted Playwright tests.
Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs tests/e2e/specs/boss-visual-smoke.spec.mjs
git commit -m "feat: deepen wither and ghast encounters"
```

---

### Task 4: Rework Blaze + Wither Skeleton into Pressure Encounters

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Test: `tests/e2e/specs/boss-debug-controls.spec.mjs`
- Test: `tests/e2e/specs/boss-visual-smoke.spec.mjs`

**Step 1: Write the failing tests**

Add tests that verify:
- `BlazeBoss` phase 3 enters a stable `intentKey` such as `flame_ring`
- `BlazeBoss` emits a distinct projectile type for the ring / burst pattern
- `WitherSkeletonBoss` enters a stable `intentKey` such as `guard_break` or `bone_wall`
- `WitherSkeletonBoss` produces either extra minions or a distinct projectile / hazard type

**Step 2: Run tests to verify they fail**

Run the targeted Playwright tests.
Expected: FAIL.

**Step 3: Write minimal implementation**

In `src/modules/15-entities-boss.js`:
- `BlazeBoss`
  - add a short telegraph into a ring / burst attack
  - update `intentKey`
  - preserve current upgraded visual silhouette
- `WitherSkeletonBoss`
  - add a guard-break or lane-control move
  - update `intentKey`
  - preserve current summon and blocking identity

**Step 4: Run tests to verify they pass**

Run the same targeted tests.
Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs tests/e2e/specs/boss-visual-smoke.spec.mjs
git commit -m "feat: deepen blaze and wither skeleton encounters"
```

---

### Task 5: Rework Warden + Evoker into Elite Phase Encounters

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Test: `tests/e2e/specs/boss-debug-controls.spec.mjs`
- Test: `tests/e2e/specs/boss-visual-smoke.spec.mjs`

**Step 1: Write the failing tests**

Add tests that verify:
- `WardenBoss` phase 3 exposes a stable enrage / darkness intent
- `WardenBoss` emits a second distinct projectile subtype or area pulse subtype
- `EvokerBoss` phase 3 exposes a stable summon / spellburst intent
- `EvokerBoss` emits either a widened fang pattern or a summoned helper marker

**Step 2: Run tests to verify they fail**

Run the targeted Playwright tests.
Expected: FAIL.

**Step 3: Write minimal implementation**

In `src/modules/15-entities-boss.js`:
- `WardenBoss`
  - add a clearer phase-3 frenzy or darkness pulse cycle
  - update `intentKey`
- `EvokerBoss`
  - add one stronger phase-3 spell pattern or helper summon window
  - update `intentKey`
- Keep visual identities and existing special methods intact.

**Step 4: Run tests to verify they pass**

Run the same targeted tests.
Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs tests/e2e/specs/boss-visual-smoke.spec.mjs
git commit -m "feat: deepen warden and evoker encounters"
```

---

### Task 6: Integrate Parallel Branches and Re-Verify on Merge Branch

**Files:**
- Merge: `feat/boss2-foundation-rewards`
- Merge: `feat/boss2-air-pressure`
- Merge: `feat/boss2-fire-bone`
- Merge: `feat/boss2-deep-arcane`
- Validate: `src/modules/15-entities-boss.js`
- Validate: `tests/debug-pages/GameDebug.html`
- Validate: `tests/e2e/specs/boss-debug-controls.spec.mjs`
- Validate: `tests/e2e/specs/boss-visual-smoke.spec.mjs`
- Validate: `tests/e2e/specs/helpers.mjs`

**Step 1: Create a fresh integration worktree**

Create:
- branch `feat/boss2-integration`
- worktree `.worktrees/task-boss2-integration`

**Step 2: Merge branches in order**

Recommended order:
1. `feat/boss2-foundation-rewards`
2. `feat/boss2-air-pressure`
3. `feat/boss2-fire-bone`
4. `feat/boss2-deep-arcane`

**Step 3: Resolve merge conflicts carefully**

Expected hot spots:
- `src/modules/15-entities-boss.js`
- `tests/e2e/specs/boss-debug-controls.spec.mjs`
- `tests/e2e/specs/boss-visual-smoke.spec.mjs`

**Step 4: Run syntax checks**

Run:
- `node --check src/modules/15-entities-boss.js`
- `node --check tests/e2e/specs/boss-debug-controls.spec.mjs`
- `node --check tests/e2e/specs/boss-visual-smoke.spec.mjs`
- `node --check tests/e2e/specs/helpers.mjs`
- `node --check tests/e2e/playwright.config.mjs`

Expected: all PASS.

**Step 5: Run Playwright verification**

Run:
- `MMWG_E2E_PORT=4280 npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs tests/e2e/specs/boss-visual-smoke.spec.mjs --reporter=line`

Expected: full batch passes with the new second-pass cases included.

**Step 6: Commit**

```bash
git add src/modules/15-entities-boss.js tests/debug-pages/GameDebug.html tests/e2e/specs/boss-debug-controls.spec.mjs tests/e2e/specs/boss-visual-smoke.spec.mjs tests/e2e/specs/helpers.mjs
git commit -m "feat: integrate boss second-pass gameplay"
```
