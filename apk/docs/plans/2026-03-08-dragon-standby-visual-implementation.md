# Dragon Standby Visual Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework the summoned Ender Dragon visuals and control flow so it idles after summon, becomes controllable only after mounting, and returns to the player after dismount.

**Architecture:** Keep the summoned dragon in the existing combat entity module and add a small explicit state machine. Update the main game loop to honor those states for summon, mount, and dismount flow. Preserve the existing village trader path for dragon egg acquisition.

**Tech Stack:** Vanilla JavaScript modules, canvas rendering, existing unit test harness.

---

### Task 1: Capture Summoned Dragon State Expectations

**Files:**
- Modify: `tests/unit/`
- Modify: `src/modules/13-game-loop.js`
- Modify: `src/modules/15-entities-combat.js`

**Step 1: Write the failing test**

- Add a focused unit test file for summoned dragon flow.
- Cover summon default state, mount gating, and dismount return state.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/<new-dragon-test-file>`

Expected: FAIL because the current summoned dragon has no explicit standby or returning states.

**Step 3: Write minimal implementation**

- Introduce explicit summoned dragon states.
- Update summon and dismount flow to use them.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/<new-dragon-test-file>`

Expected: PASS.

**Step 5: Commit**

```bash
git add tests/unit/<new-dragon-test-file> src/modules/13-game-loop.js src/modules/15-entities-combat.js
git commit -m "feat: add summoned dragon standby state"
```

### Task 2: Redraw the Summoned Dragon

**Files:**
- Modify: `src/modules/15-entities-combat.js`
- Modify: `tests/debug-pages/GameDebug.html`

**Step 1: Write the failing test**

- Add assertions for any render-state metadata that can be tested without snapshotting pixels.
- If no stable render assertions are available, document manual debug validation in the test file header and keep the automated behavior tests from Task 1 as the regression net.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/<new-dragon-test-file>`

Expected: FAIL or remain red on newly added state metadata expectations.

**Step 3: Write minimal implementation**

- Replace the placeholder blocky summoned dragon drawing with a structured body/wings/tail render.
- Add light hover and wing animation values driven by entity timers.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/<new-dragon-test-file>`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/15-entities-combat.js tests/debug-pages/GameDebug.html
git commit -m "feat: redraw summoned dragon silhouette"
```

### Task 3: Keep Village Sync Compatible

**Files:**
- Modify: `src/modules/18-village.js`
- Modify: `tests/unit/village-ui-regression.test.mjs`

**Step 1: Write the failing test**

- Add or extend a regression test that confirms trader purchase flow still exposes `dragon_egg`.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/village-ui-regression.test.mjs`

Expected: FAIL only if the sync path needs adjustment.

**Step 3: Write minimal implementation**

- Patch any integration gaps discovered while moving the dragon summon flow forward.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/village-ui-regression.test.mjs`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/18-village.js tests/unit/village-ui-regression.test.mjs
git commit -m "fix: keep dragon egg village sync compatible"
```
