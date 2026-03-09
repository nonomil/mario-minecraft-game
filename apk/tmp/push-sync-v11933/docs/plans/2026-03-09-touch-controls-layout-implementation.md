# Touch Controls Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore the older grounded touch movement layout, preserve dragon riding compatibility, and publish the change as the next patch release.

**Architecture:** Keep the touch-control HTML structure intact, change only the left-side CSS layout states, and rely on the existing `riding-dragon` class to switch between grounded and flying arrangements. Use one focused regression test plus one runtime E2E test to verify both layout and behavior before versioning and release updates.

**Tech Stack:** Vanilla JS, CSS, Node test runner, Playwright E2E, Git release docs.

---

### Task 1: Update the regression test first

**Files:**
- Modify: `tests/unit/dragon-summon-regression.test.mjs`

**Step 1: Write the failing test**
- Replace the old cross-layout expectation with the restored grounded horizontal layout expectation.
- Add a second assertion for the `riding-dragon` compact four-button layout.

**Step 2: Run the targeted test and confirm failure**
- Run: `node tests/unit/dragon-summon-regression.test.mjs`
- Expected: FAIL because the current CSS still uses the cross layout for the left touch zone.

### Task 2: Implement the layout fix

**Files:**
- Modify: `src/styles/20-touch-controls.css`

**Step 1: Restore the grounded left-zone layout**
- Move the phone left control zone back down near the bottom.
- Render grounded left/right as a horizontal flex row with tighter spacing.

**Step 2: Add riding-only layout overrides**
- Switch the same zone to a compact 2x2 grid while `#touch-controls.riding-dragon` is active.
- Keep `up` and `down` hidden by default and visible only while riding.

### Task 3: Verify dragon riding compatibility

**Files:**
- Test: `tests/unit/dragon-summon-regression.test.mjs`
- Test: `tests/e2e/specs/p1-summon-dragon-and-gunpowder.spec.mjs`

**Step 1: Re-run the targeted unit test**
- Confirm the grounded and riding layout assertions pass.

**Step 2: Run the touch-control dragon E2E coverage**
- Run the summon/ride touch-control spec to confirm runtime movement and attack still work after the CSS change.

### Task 4: Publish the patch release metadata

**Files:**
- Modify: `package.json`
- Modify: `version.json`
- Modify: `android-app/package.json`
- Modify: `android-app/web/build-info.json`
- Modify: `android-app/android/app/build.gradle`
- Modify: `service-worker.js`
- Modify: `Game.html`
- Modify: `CHANGELOG.md`
- Add: `RELEASE_NOTES_v1.19.31.md`

**Step 1: Bump patch version**
- Sync all release metadata from `1.19.30` / `83` to `1.19.31` / `84`.

**Step 2: Write release notes from git history**
- Summarize the touch-control restoration and dragon riding compatibility.
- Include the relevant recent commits as supporting release history.

### Task 5: Final verification and publish

**Files:**
- Test: `tests/unit/dragon-summon-regression.test.mjs`
- Test: `tests/e2e/specs/p1-summon-dragon-and-gunpowder.spec.mjs`

**Step 1: Review diff scope**
- Confirm only touch-control layout, release metadata, and release docs changed.

**Step 2: Commit and push**
- Create one focused release commit.
- Run `push.bat` from the project root.
