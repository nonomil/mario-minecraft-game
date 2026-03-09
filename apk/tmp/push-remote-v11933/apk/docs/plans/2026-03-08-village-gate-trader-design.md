# Village Gate / Trader / Word House Design

**Goal:** Fix village interaction friction, make the word-house quiz mandatory, and make the word-gate toggle behave consistently during runtime.

**Scope:**
- Village interior interaction radius and hint layout
- Trader sell-material UI density and readability
- Word-house quiz flow and cancellation rules
- Word-gate runtime enable/disable behavior

## Root Causes

1. `wordGateEnabled` is checked during spawn, but not during later runtime trigger/render paths.
2. Interior action range uses one small shared constant for bed / word / trader houses.
3. Trader and word-house interior hint text are drawn in the same visual zone as the sprite/prop.
4. Word-house quiz modal still exposes multiple cancel paths, so the player can bypass the checkpoint.
5. Trader sell-material entries are rendered as a narrow single-column stack.

## Chosen Approach

### 1. Runtime-safe word gate toggle
- Guard both runtime trigger and render paths with `settings.wordGateEnabled`.
- Keep existing spawned gates in memory, but make them inert and invisible while disabled.

### 2. House-specific interior action ranges
- Replace the single interior action radius with per-building ranges.
- Increase trader range the most, and increase bed/word ranges moderately for consistency.

### 3. Two-block interior hint layout
- Keep the character/prop on one side.
- Draw a dedicated hint panel on the other side with action title + short instruction + reward/effect.

### 4. Mandatory word-house checkpoint
- Word-house interaction opens the quiz directly.
- Remove cancel/exit affordances while the quiz is active in forced mode.
- Require the player to finish all questions before leaving that checkpoint flow.

### 5. Grid-style trader sell list
- Render sellable materials in a multi-column grid.
- Increase card height and padding for easier tapping.
- Preserve existing sell-count subflow.

## Validation Strategy

- Add Playwright regressions for:
  - trader short-tap works from a larger interior range
  - forced word-house flow cannot be canceled via intro/backdrop/exit affordances
  - disabled word gate does not auto-trigger an existing gate
  - trader sell list uses multi-column grid styling
