# Bridge Grade Scope Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a formal grade-scope selector for bridge, hanzi, and pinyin learning content so runtime word pools can be filtered by preschool, grade 1, or grade 2.

**Architecture:** Keep existing vocab packs intact and add a runtime `bridgeGradeScope` setting. Normalize the setting once, filter mapped word entries in `setActiveVocabPack()`, and surface the active scope in settings, prompt UI, and preview text. Reuse `gradeBand` already embedded in vocab entries instead of splitting pack files.

**Tech Stack:** Vanilla JS, static HTML, CSS, Node.js built-in test runner

---

### Task 1: Add a failing regression test

**Files:**
- Create: `tests/unit/bridge-grade-scope-regression.test.mjs`
- Read: `src/defaults.js`
- Read: `Game.html`
- Read: `src/modules/09-vocab.js`

**Step 1: Write the failing test**

- Assert `bridgeGradeScope` exists in defaults.
- Assert settings UI and first-launch prompt include grade-scope selects.
- Load the bilingual vocab runtime snippet and assert the new helpers exist.
- Verify helper behavior for `学前` / `一年级` / `二年级` and range labels.

**Step 2: Run test to verify it fails**

Run: `node --test tests/unit/bridge-grade-scope-regression.test.mjs`

Expected: FAIL because the setting, UI selectors, and helper functions do not exist yet.

### Task 2: Implement runtime grade-scope support

**Files:**
- Modify: `src/defaults.js`
- Modify: `src/modules/09-vocab.js`

**Step 1: Add the setting**

- Add `bridgeGradeScope` to `window.MMWG_DEFAULTS.settings`.
- Normalize and validate the setting in `normalizeSettings()`.

**Step 2: Implement helper functions**

- Add `normalizeBridgeGradeScope()`
- Add `getBridgeGradeScopeLabel()`
- Add `getBridgeScopeTagsFromGradeBand()`
- Add `doesWordMatchBridgeGradeScope()`
- Add `filterWordsByBridgeGradeScope()`
- Add `shouldApplyBridgeGradeScope()`

**Step 3: Filter mapped runtime words**

- In `setActiveVocabPack()`, filter `target` before assigning `wordDatabase`.
- Preserve words without `gradeBand`.
- If filtering returns empty, fall back to the unfiltered target and emit a warning.

### Task 3: Wire the selectors into UI flow

**Files:**
- Modify: `Game.html`
- Modify: `src/modules/16-events.js`
- Modify: `src/modules/09-vocab.js`

**Step 1: Add settings select**

- Insert `#opt-bridge-grade-scope` in the learning settings area.

**Step 2: Add prompt select**

- Insert `#vocab-prompt-grade-scope` in the first-launch vocab modal.

**Step 3: Save and restore**

- Fill both selectors from `settings.bridgeGradeScope`.
- Persist changes through existing settings save flow and vocab prompt confirm flow.
- Refresh vocab preview when either vocab selection or grade scope changes.

### Task 4: Improve learning copy

**Files:**
- Modify: `src/modules/09-vocab.js`

**Step 1: Formalize labels**

- Update `formatWordGradeBandLabel()` to render primary-school phrasing.
- Extend preview text so users can see the current selected grade scope.
- Include the active scope in vocab switch feedback where useful.

### Task 5: Verify regressions

**Files:**
- Test: `tests/unit/bridge-grade-scope-regression.test.mjs`
- Test: `tests/unit/kindergarten-hanzi-regression.test.mjs`
- Test: `tests/unit/bridge-vocab-coverage.test.mjs`
- Test: `tests/unit/bridge-language-ui-regression.test.mjs`
- Test: `tests/unit/pinyin-pack-regression.test.mjs`

**Step 1: Run targeted red/green cycle**

Run: `node --test tests/unit/bridge-grade-scope-regression.test.mjs`

**Step 2: Run focused regression suite**

Run: `node --test tests/unit/bridge-grade-scope-regression.test.mjs tests/unit/kindergarten-hanzi-regression.test.mjs tests/unit/bridge-vocab-coverage.test.mjs tests/unit/bridge-language-ui-regression.test.mjs tests/unit/pinyin-pack-regression.test.mjs`

**Step 3: Rebuild pinyin pack**

Run: `node tools/vocab-db/build-pinyin-pack.mjs`

**Step 4: Check changed files**

Run: `git diff --name-only HEAD`
