# HUD Layout Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the HUD into a 3-column / 2-row layout in `apk/` so the center word display is unobstructed and left/right controls are grouped.

**Architecture:** Update `apk/Game.html` HUD markup to a `hud-grid` structure with left/center/right columns. Replace existing word display styling with a centered, two-line word block. Update `apk/src/styles.css` to define the grid layout, row alignment, and word display animation. Adjust `apk/src/modules/12-challenges.js` to render English + Chinese on separate lines and trigger a lightweight slide-in animation.

**Tech Stack:** HTML/CSS, vanilla JS in `apk/src/modules`, Playwright for tests (optional, currently failing in baseline).

---

### Task 1: Update HUD markup structure

**Files:**
- Modify: `apk/Game.html`

**Step 1: Write the failing test**
- Not applicable (no unit tests for HUD markup in repo).

**Step 2: Run test to verify it fails**
- Skip (baseline tests currently fail on WebServer EACCES).

**Step 3: Write minimal implementation**
- Replace existing `.hud-top` + `.btn-group` block with a single `.hud-grid` container.
- Create columns: `.hud-left`, `.hud-center`, `.hud-right`.
- Create rows inside left/right columns for Row1/Row2 content.
- Move `#word-display` into `.hud-center` and add a new `.word-display-sub` element for Chinese.

**Step 4: Run test to verify it passes**
- Skip.

**Step 5: Commit**
```bash
git add apk/Game.html
git commit -m "feat: restructure HUD layout grid"
```

### Task 2: Implement HUD grid styles and word display animation

**Files:**
- Modify: `apk/src/styles.css`

**Step 1: Write the failing test**
- Not applicable.

**Step 2: Run test to verify it fails**
- Skip.

**Step 3: Write minimal implementation**
- Add `.hud-grid` layout (3 columns, 2 rows).
- Add `.hud-left/.hud-center/.hud-right` sizing rules (25/50/25).
- Add `.hud-row` layout for left/right rows.
- Style `.word-display-title` and `.word-display-sub` within center.
- Add slide-in animation for `.word-display-animate` when word updates.

**Step 4: Run test to verify it passes**
- Skip.

**Step 5: Commit**
```bash
git add apk/src/styles.css
git commit -m "feat: style HUD grid and word display"
```

### Task 3: Update word display text formatting

**Files:**
- Modify: `apk/src/modules/12-challenges.js`

**Step 1: Write the failing test**
- Not applicable.

**Step 2: Run test to verify it fails**
- Skip.

**Step 3: Write minimal implementation**
- Update `updateWordUI()` to set English text in `#word-display` and Chinese in `.word-display-sub`.
- Add a transient class for animation on update (remove after 250ms).

**Step 4: Run test to verify it passes**
- Skip.

**Step 5: Commit**
```bash
git add apk/src/modules/12-challenges.js
git commit -m "feat: render word display in two lines"
```

### Task 4: Smoke check

**Files:**
- None (manual check)

**Step 1: Run local smoke check**
- Open `apk/Game.html` in browser and verify:
  - Left/center/right alignment
  - Buttons clickable
  - Word display updated and animated

**Step 2: Commit**
```bash
git commit --allow-empty -m "chore: verify HUD layout manually"
```
