# Village Gate / Trader / Word House Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix village interaction range and hint layout, enforce the word-house checkpoint, and make the word-gate toggle work at runtime.

**Architecture:** Adjust village interior behavior in `18-village.js`, make the village quiz flow configurable in `12-village-challenges.js`, and guard word-gate runtime behavior in update/render paths. Use focused Playwright regressions to lock the new interaction contract.

**Tech Stack:** Vanilla JS, canvas rendering, Playwright E2E.

---

### Task 1: Add failing regression tests

**Files:**
- Modify: `tests/e2e/specs/p0-village-wordhouse-trigger.spec.mjs`
- Add: `tests/e2e/specs/p0-village-wordgate-toggle.spec.mjs`
- Add: `tests/e2e/specs/p0-village-trader-sell-grid.spec.mjs`

**Step 1: Write failing test**
- Cover forced word-house flow.
- Cover disabled word-gate runtime behavior.
- Cover trader sell grid layout.

**Step 2: Run targeted tests and confirm failure**
- Run the three new/updated Playwright specs.

### Task 2: Implement village interior interaction fixes

**Files:**
- Modify: `src/modules/18-village.js`

**Step 1: Add per-building action range helpers**
- Increase trader range most.

**Step 2: Refactor interior hint rendering**
- Split action sprite and hint text into separate visual blocks.

**Step 3: Update trader sell layout markup**
- Render the material list in a card/grid layout.

### Task 3: Implement forced word-house checkpoint

**Files:**
- Modify: `src/modules/18-village.js`
- Modify: `src/modules/12-village-challenges.js`

**Step 1: Add forced-mode options to village challenge session**
- Allow intro skip and cancel lockout for forced flows.

**Step 2: Start the word-house quiz in forced mode**
- Ensure it is still counted as completed only after the full quiz flow.

### Task 4: Implement runtime-safe word-gate toggle

**Files:**
- Modify: `src/modules/13-game-loop.js`
- Modify: `src/modules/14-renderer-main.js`

**Step 1: Guard gate trigger path by setting**
- Disabled gates must not auto-trigger.

**Step 2: Guard gate render path by setting**
- Disabled gates must not visually block the player.

### Task 5: Verify targeted behavior

**Files:**
- Test: `tests/e2e/specs/p0-village-wordhouse-trigger.spec.mjs`
- Test: `tests/e2e/specs/p0-village-wordgate-toggle.spec.mjs`
- Test: `tests/e2e/specs/p0-village-trader-sell-grid.spec.mjs`

**Step 1: Run targeted Playwright specs**
- Confirm RED → GREEN for each regression.

**Step 2: Review diff scope**
- Keep changes focused on village/quiz/gate behavior only.
