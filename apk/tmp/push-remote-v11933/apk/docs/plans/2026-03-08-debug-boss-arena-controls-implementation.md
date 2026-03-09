# Debug Boss Arena Controls Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make GameDebug correctly trigger biome gate and ender dragon arena scenes, and replace free-form item entry with a Chinese debug item picker.

**Architecture:** Keep the fix centered in the debug page, but allow one minimal runtime fix in the dragon arena entry path where the current biome is inconsistent with renderer expectations. Cover the behavioral regressions with focused Playwright tests that assert real in-game state, not just button presence.

**Tech Stack:** Static HTML debug page, browser-side game globals, Playwright E2E specs.

---

### Task 1: Lock the intended debug behaviors with tests

**Files:**
- Modify: `tests/e2e/specs/p1-debug-page-actions.spec.mjs`
- Modify: `tests/e2e/specs/dragon-end-arena-helpers.spec.mjs`
- Modify: `tests/e2e/specs/dragon-end-arena.spec.mjs`

**Step 1: Write failing assertions for gate and dragon arena scene state**

Add assertions that verify:
- biome gate debug entry uses a real target biome instead of a placeholder value
- dragon arena entry switches the live biome to an end-compatible scene biome
- debug item control uses a select element and can still grant items

**Step 2: Run the focused specs to confirm failure**

Run: `npm.cmd run test:e2e -- p1-debug-page-actions.spec.mjs dragon-end-arena.spec.mjs dragon-end-arena-helpers.spec.mjs`

**Step 3: Record the exact failing expectations before implementation**

Capture which assertions fail and keep the implementation minimal to satisfy only those expectations.

### Task 2: Fix GameDebug control wiring

**Files:**
- Modify: `tests/debug-pages/GameDebug.html`

**Step 1: Replace free-form item input with a debug item select**

Use a small curated item list with Chinese labels and stable internal keys.

**Step 2: Route gate-mode boss entry through real biome ids**

Ensure the selected biome is applied to the game state before starting the gate fight, and pass an actual target biome id instead of `next_biome`.

**Step 3: Expose ender dragon through the debug boss picker and button flow**

Allow the debug UI to trigger the dragon arena from both the dedicated button and the boss selection flow when appropriate.

### Task 3: Fix the minimal runtime mismatch for dragon arena rendering

**Files:**
- Modify: `src/modules/15-entities-boss-dragon.js`

**Step 1: Align dragon arena biome state with renderer expectations**

Use an end-scene biome value that existing renderers already understand during arena entry, while preserving the original biome for exit restoration.

**Step 2: Keep exit restoration behavior intact**

Confirm exiting the dragon arena restores the pre-entry biome and player position.

### Task 4: Verify end-to-end behavior

**Files:**
- Modify: `tests/e2e/specs/p1-debug-page-actions.spec.mjs`
- Modify: `tests/e2e/specs/dragon-end-arena.spec.mjs`
- Modify: `tests/e2e/specs/dragon-end-arena-helpers.spec.mjs`
- Modify: `tests/debug-pages/GameDebug.html`
- Modify: `src/modules/15-entities-boss-dragon.js`

**Step 1: Run the focused E2E specs again**

Run: `npm.cmd run test:e2e -- p1-debug-page-actions.spec.mjs dragon-end-arena.spec.mjs dragon-end-arena-helpers.spec.mjs`

**Step 2: Run a syntax sanity check**

Run: `node --check tests/debug-pages/GameDebug.html`

Note: this command is not valid for HTML, so instead run `node --check src/modules/15-entities-boss-dragon.js` and rely on Playwright for the debug page.

**Step 3: Review final diff scope**

Run: `git diff --name-only HEAD`
