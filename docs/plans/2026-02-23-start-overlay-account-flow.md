# Start Overlay & Account Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify the start overlay to two buttons and add a confirm action to the account selection screen with proper validation.

**Architecture:** Update `apk/Game.html` to adjust overlay/login markup, `apk/src/styles.css` for the new button layout, and `apk/src/modules/08-account.js` / `apk/src/modules/10-ui.js` to wire new behaviors. Avoid broad refactors; reuse existing handlers.

**Tech Stack:** HTML/CSS, vanilla JS modules in `apk/src/modules`.

---

### Task 1: Update start overlay markup

**Files:**
- Modify: `apk/Game.html`

**Step 1: Write the failing test**
- Not applicable (no unit tests for HTML-only changes).

**Step 2: Run test to verify it fails**
- Skip (baseline Playwright webServer EACCES on port 4173).

**Step 3: Write minimal implementation**
- Replace existing `#screen-overlay .overlay-buttons` contents with two buttons:
  - `#btn-overlay-skip` (left)
  - `#btn-overlay-pick-account` (right)
- Remove/hide leaderboard/revive buttons from this overlay.

**Step 4: Run test to verify it passes**
- Skip.

**Step 5: Commit**
```bash
git add apk/Game.html
git commit -m "feat: simplify start overlay buttons"
```

### Task 2: Add confirm button to login screen

**Files:**
- Modify: `apk/Game.html`

**Step 1: Write the failing test**
- Not applicable.

**Step 2: Run test to verify it fails**
- Skip.

**Step 3: Write minimal implementation**
- Add a bottom button `#btn-login-confirm` with label “点击确定”.
- Ensure it is visually placed at the bottom of the login container.

**Step 4: Run test to verify it passes**
- Skip.

**Step 5: Commit**
```bash
git add apk/Game.html
git commit -m "feat: add login confirm button"
```

### Task 3: Style new buttons

**Files:**
- Modify: `apk/src/styles.css`

**Step 1: Write the failing test**
- Not applicable.

**Step 2: Run test to verify it fails**
- Skip.

**Step 3: Write minimal implementation**
- Add overlay button layout class to align two buttons left/right and equal width.
- Add styles for `#btn-login-confirm` to sit at bottom with primary emphasis.
- Add disabled/quiet style for invalid state.

**Step 4: Run test to verify it passes**
- Skip.

**Step 5: Commit**
```bash
git add apk/src/styles.css
git commit -m "feat: style overlay and login confirm buttons"
```

### Task 4: Wire overlay + login behaviors

**Files:**
- Modify: `apk/src/modules/10-ui.js`
- Modify: `apk/src/modules/08-account.js`

**Step 1: Write the failing test**
- Not applicable.

**Step 2: Run test to verify it fails**
- Skip.

**Step 3: Write minimal implementation**
- `#btn-overlay-skip`: close overlay and start game.
- `#btn-overlay-pick-account`: close overlay, show login screen.
- `#btn-login-confirm`: if account selected or username input non-empty, proceed to login; otherwise show prompt.

**Step 4: Run test to verify it passes**
- Skip.

**Step 5: Commit**
```bash
git add apk/src/modules/10-ui.js apk/src/modules/08-account.js
git commit -m "feat: wire overlay and login confirm actions"
```

### Task 5: Manual smoke check

**Files:**
- None (manual)

**Step 1: Run local smoke check**
- Open `apk/Game.html` and verify:
  - Start overlay shows only “跳过 / 选择档案”.
  - “跳过” enters game; “选择档案” opens login.
  - “点击确定” validates selection/input, then enters game.

**Step 2: Commit**
```bash
git commit --allow-empty -m "chore: verify start overlay and login flow"
```
