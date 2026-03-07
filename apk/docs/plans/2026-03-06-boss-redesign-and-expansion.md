# Boss Visual Redesign and Roster Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the weakest-looking current bosses and expand the roster from 4 to 6 bosses without breaking the current boss arena, biome gate, HP bar, and debug flows.

**Architecture:** Keep the existing `Boss` base class and `bossArena` lifecycle intact, but move boss visuals toward layered silhouettes, clearer shape language, and reusable render helpers. Add two new bosses (`warden`, `evoker`) by extending the existing registry / rotation / debug spawn paths, while explicitly deferring `ender_dragon` because it needs a different movement, body, and encounter model.

**Tech Stack:** Plain JavaScript modules, HTML5 canvas rendering, existing `bossArena` system, Playwright E2E smoke tests, local debug page helpers.

---

## Current Codebase Context

- Core boss lifecycle lives in `src/modules/15-entities-boss.js`.
- Current boss registry is `bossArena.bossTypes = ["wither", "ghast", "blaze", "wither_skeleton"]`.
- Boss creation switch is in `bossArena.createBoss()`.
- HP bar rendering is in `bossArena.renderBossHpBar()` and drawn from `src/modules/14-renderer-main.js`.
- Boss body / projectile rendering is triggered from `src/modules/14-renderer-entities.js`.
- Existing smoke coverage is in `tests/e2e/specs/boss-debug-controls.spec.mjs`.
- Existing ender dragon planning already exists under `docs/plan/召唤机制/2026-03-06-summon-dragon.md`, so this plan treats dragon as a later phase instead of mixing it into the current boss framework.

## External Visual Reference Notes

Use references for recognizable silhouettes and trait selection, not asset copying:

- Wither Skeleton reference traits: tall dark skeleton, long limbs, square skull, stone sword, ember/ashy Nether feel.
  - https://minecraft.wiki/w/Wither_Skeleton
- Blaze reference traits: floating dark core, rotating golden rods, bright face, rising embers, heat haze feel.
  - https://minecraft.wiki/w/Blaze
- Warden reference traits: massive torso, deep dark palette, horn-like shoulders, glowing chest cavity, heavy ground presence.
  - https://minecraft.wiki/w/Warden
- Evoker reference traits: illager robe silhouette, pale face, gold trim, casting pose, magic burst / summoned helpers.
  - https://minecraft.wiki/w/Evoker
- Ender Dragon reference traits for future work only: winged segmented flying boss, large arena-scale silhouette.
  - https://minecraft.wiki/w/Ender_Dragon

## Scope Boundaries

### In Scope
- Improve visual readability and animation richness for `BlazeBoss`, blaze minions, and `WitherSkeletonBoss`.
- Add `WardenBoss` and `EvokerBoss` to the existing boss encounter system.
- Update rotation / gate spawn / debug spawn / smoke tests for the new roster.
- Add lightweight visual QA coverage and explicit manual acceptance checks.

### Out of Scope
- No imported sprite sheets or external copyrighted art.
- No full ender dragon boss implementation in this phase.
- No full-screen cinematic boss intros.
- No new rendering engine or scene graph.
- No broad difficulty rebalance outside values needed for the two new bosses.

## Recommended Delivery Order

1. Stabilize boss metadata and test hooks.
2. Extract shared visual helpers and render tokens.
3. Redesign blaze boss and blaze minions.
4. Redesign wither skeleton boss.
5. Add warden boss.
6. Add evoker boss.
7. Update progression / debug / docs / verification.

---

### Task 1: Expand Boss Registry Metadata Before Behavior Changes

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`
- Review: `src/modules/14-renderer-main.js`
- Review: `src/modules/14-renderer-entities.js`

**Step 1: Write the failing test**

Add a new smoke assertion in `tests/e2e/specs/boss-debug-controls.spec.mjs` that expects the debug-exposed boss list to include:
- `wither`
- `ghast`
- `blaze`
- `wither_skeleton`
- `warden`
- `evoker`

Also add spawn smoke cases for `warden` and `evoker` with expected constructor names `WardenBoss` and `EvokerBoss`.

**Step 2: Run test to verify it fails**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs`
Expected: FAIL because the new boss ids and constructors do not exist yet.

**Step 3: Write minimal implementation**

In `src/modules/15-entities-boss.js`:
- Replace the hard-coded boss type array with a single registry source of truth.
- Keep existing ids stable.
- Add placeholder metadata entries for `warden` and `evoker`.
- Update `normalizeBossType()`, `nextGateBossType()`, and `createBoss()` to read from the registry.
- Keep fallback behavior backward compatible (`wither` if an id is unknown).

**Step 4: Run test to verify it passes**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs`
Expected: PASS for registry exposure and constructor-based debug spawn.

**Step 5: Commit**

    git add src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs
    git commit -m "feat: expand boss registry for new encounters"

---

### Task 2: Create Shared Visual Tokens and Reusable Render Helpers

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Test: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**

Extend the debug state or a small global debug hook so each boss reports a stable `visualKey` value. Add a test that expects:
- `blaze` -> `blaze_v2`
- `wither_skeleton` -> `wither_skeleton_v2`
- `warden` -> `warden_v1`
- `evoker` -> `evoker_v1`

**Step 2: Run test to verify it fails**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs`
Expected: FAIL because bosses do not yet expose stable visual metadata.

**Step 3: Write minimal implementation**

Inside `src/modules/15-entities-boss.js`:
- Add render constants for palette, glow, outline, shadow, ember, and magic colors.
- Add tiny helper functions for repeated canvas shapes (horns, runes, rod segments, glow cores, robe panels, chest cavity glow).
- Keep helpers local to the module to avoid creating a new abstraction layer too early.
- Give each boss a `visualKey` property for QA and future regression checks.

**Step 4: Run test to verify it passes**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs`
Expected: PASS.

**Step 5: Commit**

    git add src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs
    git commit -m "refactor: add shared boss visual helpers"

---

### Task 3: Redesign Blaze Boss and Blaze Minions

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`
- Optional Add: `tests/e2e/specs/boss-visual-smoke.spec.mjs`

**Step 1: Write the failing test**

Add a debug-visible summary for blaze encounter visuals:
- boss type is `BlazeBoss`
- `visualKey` is `blaze_v2`
- minion type list can include `blaze_mini`
- blaze can still spawn projectiles and orbiting rods after update ticks

If adding `boss-visual-smoke.spec.mjs`, use a controlled debug spawn and assert the page can capture a non-empty screenshot for the blaze encounter.

**Step 2: Run test to verify it fails**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs`
Optional: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-visual-smoke.spec.mjs`
Expected: FAIL because the new debug fields / screenshots are not wired yet.

**Step 3: Write minimal implementation**

Rework `BlazeBoss.render()` and blaze minion rendering so the silhouette reads closer to Minecraft:
- Central floating dark core instead of a flat fire blob.
- 10-12 layered golden rods in 2 rings with subtle bobbing offsets.
- Brighter face window and pulse-based inner heat glow.
- Ember particles rising from below instead of generic random fire dots.
- Mini blazes should become smaller readable versions of the boss silhouette, not plain orange rectangles.
- Preserve current hitbox, projectile timings, and minion gameplay unless clearly broken.

**Step 4: Run test to verify it passes**

Run the same focused tests again.
Expected: PASS, plus manual inspection shows a readable blaze silhouette at normal gameplay zoom.

**Step 5: Commit**

    git add src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs tests/e2e/specs/boss-visual-smoke.spec.mjs
    git commit -m "feat: redesign blaze boss visuals"

---

### Task 4: Redesign Wither Skeleton Boss

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`
- Optional Modify: `tests/e2e/specs/boss-visual-smoke.spec.mjs`

**Step 1: Write the failing test**

Add a debug-visible check that `WitherSkeletonBoss` exposes `visualKey = "wither_skeleton_v2"` and still preserves existing combat states such as `blocking`, `combo`, and `stunned`.

**Step 2: Run test to verify it fails**

Run the focused boss spec.
Expected: FAIL.

**Step 3: Write minimal implementation**

Rework `WitherSkeletonBoss.render()` to add recognizable structure:
- Larger square skull with jaw / cheek separation.
- Ribcage and spine read instead of one solid rectangle.
- Longer forearms / tibia shapes for a tall skeletal silhouette.
- Dark charcoal palette with slight Nether ash highlights.
- Sword with clearer blade / hilt / guard separation.
- Red eye sockets in rage phases, calmer dark-red glow in normal phases.
- Better summon visuals for skeleton minions so they do not look like generic boxes.
- Keep current states visually distinct: blocking shield arc, stunned stars, combo swing exaggeration.

**Step 4: Run test to verify it passes**

Run the focused boss spec again.
Expected: PASS.

**Step 5: Commit**

    git add src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs tests/e2e/specs/boss-visual-smoke.spec.mjs
    git commit -m "feat: redesign wither skeleton boss visuals"

---

### Task 5: Add Warden Boss Using the Existing Grounded Boss Pattern

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`
- Review: `src/modules/05-difficulty.js`
- Review: `config/game.json`
- Review: `src/defaults.js`

**Step 1: Write the failing test**

Add a new smoke spawn case for `warden` that expects:
- constructor name `WardenBoss`
- boss type id `warden`
- grounded behavior
- non-empty name and HP bar rendering path

**Step 2: Run test to verify it fails**

Run: `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs`
Expected: FAIL because the class does not exist.

**Step 3: Write minimal implementation**

Add `class WardenBoss extends Boss` in `src/modules/15-entities-boss.js` using the grounded boss pattern:
- Heavy slow movement, charge windows, and short-range shockwave or slam.
- Large dark teal body, horn/antenna shoulders, glowing chest cavity.
- Emphasize weight with squash, stomp dust, and chest pulse during attack tells.
- Keep collision logic simple: large grounded body, no segmented parts.
- Integrate with the boss registry and gate rotation.

Choose conservative numbers first so balance risk stays low:
- HP slightly above `WitherSkeletonBoss`
- lower speed than blaze / ghast / wither
- stronger telegraph before high-damage attack

**Step 4: Run test to verify it passes**

Run the focused boss spec.
Expected: PASS.

**Step 5: Commit**

    git add src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs config/game.json src/defaults.js src/modules/05-difficulty.js
    git commit -m "feat: add warden boss encounter"

---

### Task 6: Add Evoker Boss Using Summoner-Style Encounter Logic

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`
- Optional Modify: `tests/e2e/specs/boss-visual-smoke.spec.mjs`
- Review: `src/modules/05-difficulty.js`
- Review: `config/game.json`
- Review: `src/defaults.js`

**Step 1: Write the failing test**

Add a new smoke spawn case for `evoker` that expects:
- constructor name `EvokerBoss`
- boss type id `evoker`
- spell or summon state appears in debug-visible state after updates

**Step 2: Run test to verify it fails**

Run the focused boss spec.
Expected: FAIL because the class does not exist.

**Step 3: Write minimal implementation**

Add `class EvokerBoss extends Boss` in `src/modules/15-entities-boss.js`:
- Mid-range caster behavior with retreat windows.
- Robed illager silhouette, pale face, gold trim, casting hand pose.
- Use one simple summon / spell family only in v1 to avoid over-design.
- Prefer one of these, not both:
  - ground fangs style hazard line, or
  - vex-like small summoned helpers
- Recommendation: start with ground fangs because they are easier to read and cheaper than adding another airborne micro-enemy system.
- Add purple/blue-white magic particles and casting telegraph.

**Step 4: Run test to verify it passes**

Run the focused boss spec again.
Expected: PASS.

**Step 5: Commit**

    git add src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs tests/e2e/specs/boss-visual-smoke.spec.mjs config/game.json src/defaults.js src/modules/05-difficulty.js
    git commit -m "feat: add evoker boss encounter"

---

### Task 7: Rebalance Roster Order, Gate Rotation, and Player Messaging

**Files:**
- Modify: `src/modules/15-entities-boss.js`
- Modify: `config/game.json`
- Modify: `src/defaults.js`
- Modify: `src/modules/05-difficulty.js`
- Review: `src/modules/11-game-init.js`

**Step 1: Write the failing test**

Add or extend smoke checks that ensure the boss list order and fallback rotation remain valid when six boss ids exist.

Expected roster recommendation:
1. `wither`
2. `ghast`
3. `blaze`
4. `wither_skeleton`
5. `warden`
6. `evoker`

**Step 2: Run test to verify it fails**

Run the focused boss spec.
Expected: FAIL if order / exposure / rotation logic still assumes 4 bosses.

**Step 3: Write minimal implementation**

- Update score thresholds and any default config assumptions that currently hard-code four bosses.
- Ensure gate fallback rotation does not break if biome config omits a boss type.
- Review support text for flying bosses so `warden` and `evoker` do not receive bow auto-grants.
- Make sure toast / HP bar naming is readable and consistent.

**Step 4: Run test to verify it passes**

Run the focused boss spec.
Expected: PASS.

**Step 5: Commit**

    git add src/modules/15-entities-boss.js config/game.json src/defaults.js src/modules/05-difficulty.js tests/e2e/specs/boss-debug-controls.spec.mjs
    git commit -m "feat: rebalance expanded boss rotation"

---

### Task 8: Add Visual QA Coverage and Release Notes

**Files:**
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`
- Optional Add: `tests/e2e/specs/boss-visual-smoke.spec.mjs`
- Modify: `CHANGELOG.md`
- Add: `docs/releases/v1.19.20.md`

**Step 1: Write the failing test**

If the visual smoke spec does not yet exist, add one that:
- opens the debug page
- spawns each boss
- advances a few frames
- captures a screenshot artifact
- verifies the boss fight remains active

**Step 2: Run test to verify it fails**

Run the focused visual spec.
Expected: FAIL until all boss ids and render paths are stable.

**Step 3: Write minimal implementation**

- Finalize any missing debug hooks needed by the test.
- Document the boss redesign and roster expansion in `CHANGELOG.md` and a new release note.
- Include explicit manual QA checklist:
  - blaze rods remain readable while moving
  - blaze minions no longer look like plain fire blocks
  - wither skeleton silhouette reads clearly at gameplay zoom
  - warden attack telegraph is readable before damage lands
  - evoker spell telegraph is readable and not confused with blaze particles
  - HP bar names and phase banners still fit the screen

**Step 4: Run test to verify it passes**

Run:
- `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-debug-controls.spec.mjs`
- `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/boss-visual-smoke.spec.mjs`

Expected: PASS.

**Step 5: Commit**

    git add tests/e2e/specs/boss-debug-controls.spec.mjs tests/e2e/specs/boss-visual-smoke.spec.mjs CHANGELOG.md docs/releases/v1.19.20.md
    git commit -m "docs: record boss redesign and expansion"

---

## Manual Acceptance Checklist

- Existing four bosses still spawn from debug controls.
- New `warden` and `evoker` spawn correctly from debug controls.
- Boss HP bar, phase text, and victory flow still work.
- Blaze boss and blaze minions are readable as Minecraft-inspired shapes at normal zoom.
- Wither skeleton boss no longer reads as a plain rectangle with eyes.
- Warden feels heavy and distinct from wither skeleton.
- Evoker reads as a caster and not as another melee mob.
- No boss breaks the arena walls, projectile loop, or player weapon lock flow.

## Deferred Follow-Up: Ender Dragon

Do not fold `ender_dragon` into this phase. Revisit it in a separate plan after the 6-boss roster lands. Reasons:
- It needs a flight path and arena scale different from current grounded / small-airborne bosses.
- Its silhouette is multi-part and benefits from wings / tail / body segmentation.
- The repo already has separate dragon summon planning under `docs/plan/召唤机制/2026-03-06-summon-dragon.md`, which should be reconciled before implementation.

## Suggested Execution Strategy

- Recommended approach: implement in this order and stop after each task for visual review.
- If capacity is limited, ship a smaller first release with Tasks 1-4 only (visual redesign of existing bosses), then land Tasks 5-8 in a second pass.
