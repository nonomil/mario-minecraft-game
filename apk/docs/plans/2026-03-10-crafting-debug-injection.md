# Crafting Debug Injection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add debug-only controls to inject crafting materials, open crafting, and auto-fill recipes in `GameDebug.html`.

**Architecture:** Extend the existing debug UI with new controls and wire them to iframe helpers that mutate `inventory` and call existing crafting functions if available.

**Tech Stack:** Plain HTML + inline JavaScript in `tests/debug-pages/GameDebug.html`.

---

### Task 1: Add crafting debug UI controls

**Files:**
- Modify: `tests/debug-pages/GameDebug.html`

**Step 1: Add UI markup for crafting test controls**

Add two new `.row` blocks for:
- Multiplier input and preset buttons.
- Absolute inventory inputs and “Set inventory” button.

**Step 2: Commit**

Skip (git operations restricted in this environment).

---

### Task 2: Implement crafting debug helpers and handlers

**Files:**
- Modify: `tests/debug-pages/GameDebug.html`

**Step 1: Add helper functions**

Implement helpers to:
- Read multiplier and inventory inputs.
- Apply inventory `set` and `add` changes via `runGameExpr`.
- Open crafting modal and auto-fill recipes safely.

**Step 2: Wire event listeners**

Bind buttons to:
- Inject shield/torch materials.
- Clear crafting materials.
- Set absolute inventory.
- Open crafting modal.
- Auto-fill shield/torch.

**Step 3: Extend Playwright-friendly API**

Add `window.MMDBG.crafting.*` helpers that call the same functions.

**Step 4: Commit**

Skip (git operations restricted in this environment).

---

### Task 3: Manual verification (debug page)

**Files:**
- Verify: `tests/debug-pages/GameDebug.html`

**Step 1: Open debug page**

Run in browser: `http://localhost:4183/tests/debug-pages/GameDebug.html`

**Step 2: Validate flow**

- Inject shield materials with multiplier.
- Open crafting modal and auto-fill shield.
- Adjust `+/-` controls and verify inventory updates.

**Step 3: Commit**

Skip (git operations restricted in this environment).
