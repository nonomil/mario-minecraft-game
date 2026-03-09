# Touch Controls Layout Design

**Goal:** Restore the old lower horizontal left/right touch layout on phones while keeping dragon riding compatible with up/down flight controls.

**Scope:**
- Mobile left-side touch controls in `Game.html` and `src/styles/20-touch-controls.css`
- Dragon riding compatibility in existing touch-control wiring
- Release/version documentation for the new patch release

## Root Cause

1. The phone layout in `src/styles/20-touch-controls.css` lifts the entire left control zone too high with `clamp(96px, 22vh, 220px)`.
2. The left control zone uses a 3-column cross grid, so the left and right buttons are separated by an empty center column even when the player is on the ground.
3. Older layout styling in `src_backup/styles.css` keeps the movement buttons at the bottom-left in a simple horizontal row, which matches the requested behavior.

## Chosen Approach

### 1. Restore the old grounded movement layout
- Keep the existing four buttons in the DOM so event wiring does not change.
- Render only the left and right buttons for grounded play as a bottom-left horizontal row.
- Move the phone control zone back down to the older bottom position.

### 2. Keep dragon riding compatible through a riding-only layout switch
- Reuse the existing `riding-dragon` class from `13-game-loop-dragon-controls.js`.
- When riding, switch the left control zone into a compact 2x2 grid so `up`, `left`, `right`, and `down` are all reachable.
- Continue hiding `up` and `down` outside riding mode.

### 3. Lock behavior with a focused regression test
- Update the existing dragon summon regression test to expect:
  - grounded layout = horizontal left/right row near the bottom
  - riding layout = four-button compact layout with visible flight buttons
- Reuse the existing HTML/CSS/source inspection style already present in `tests/unit/dragon-summon-regression.test.mjs`.

## Validation Strategy

- Run the targeted regression test before implementation and confirm the old expectation fails.
- Re-run the regression after the CSS change and confirm it passes.
- Run the targeted dragon touch E2E spec to verify summon + mount + touch controls still work in runtime.
- Review release metadata diffs before committing and pushing.
