# Village Interior Visual Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the bed house, word house, and trader house interiors so the main interactable objects read clearly at a glance and labels no longer crowd the furniture.

**Architecture:** Keep the existing canvas interior pipeline and only retune the drawing helpers that already exist in `src/modules/18-village.js` and `src/modules/18-village-render.js`. Lock the desired visual proportions with targeted regression tests before changing draw sizes and label offsets.

**Tech Stack:** Vanilla JavaScript, HTML canvas rendering, Node-based regression tests.

---

### Task 1: Lock the new visual targets

**Files:**
- Modify: `tests/unit/village-ui-regression.test.mjs`
- Test: `tests/unit/village-ui-regression.test.mjs`

**Step 1: Write the failing test**
- Add assertions for a much larger bed footprint, higher label spacing, a doubled bookshelf, and higher trader/word labels.

**Step 2: Run test to verify it fails**
- Run: `node tests/unit/village-ui-regression.test.mjs`
- Expected: FAIL on the old size/position assertions.

**Step 3: Write minimal implementation**
- No production code in this task.

**Step 4: Re-run the test**
- Run: `node tests/unit/village-ui-regression.test.mjs`
- Expected: still FAIL until rendering helpers are updated.

### Task 2: Retune interior object proportions

**Files:**
- Modify: `src/modules/18-village-render.js`
- Modify: `src/modules/18-village.js`
- Test: `tests/unit/village-ui-regression.test.mjs`

**Step 1: Write the failing test**
- Covered by Task 1.

**Step 2: Run test to verify it fails**
- Run: `node tests/unit/village-ui-regression.test.mjs`
- Expected: FAIL.

**Step 3: Write minimal implementation**
- Enlarge the bed to read as a real furniture anchor.
- Raise and enlarge label groups for all three rooms.
- Double the bookshelf scale and move the word-house labels higher.
- Raise trader-house labels and keep rack/NPC composition below them.

**Step 4: Run test to verify it passes**
- Run: `node tests/unit/village-ui-regression.test.mjs`
- Expected: PASS.

### Task 3: Verify no regressions in adjacent village behavior

**Files:**
- Test: `tests/unit/village-ui-regression.test.mjs`
- Test: `tests/unit/village-word-house-regression.test.mjs`
- Test: `tests/unit/dev-cache-busting-regression.test.mjs`

**Step 1: Run focused checks**
- Run: `node tests/unit/village-ui-regression.test.mjs`
- Run: `node tests/unit/village-word-house-regression.test.mjs`
- Run: `node tests/unit/dev-cache-busting-regression.test.mjs`

**Step 2: Confirm expected output**
- Expected: all PASS.
