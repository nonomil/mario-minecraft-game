# Ender Dragon Phase Pursuit Design

**Goal:** Make the Ender Dragon actively pressure the player in the dedicated arena instead of idling on a fixed hover path.

**Decision:** Replace the current static sine-wave orbit with a three-phase pursuit model that tracks player position and switches attack movement by phase intent.

---

## Problem Summary

- The current `EnderDragonBoss.update()` ignores player position.
- Dragon movement is only:
  - fixed horizontal sine motion
  - fixed vertical cosine motion
- As a result, the boss looks alive but does not behave like a boss encounter.
- User expectation is clear: the dragon should chase and attack the player, not hover in place.

---

## Current Architecture Context

- Dragon arena controller lives in `src/modules/15-entities-boss-dragon.js`.
- Arena state already exposes:
  - `phase`
  - `intentKey`
  - `hazards`
  - dragon HP and debug controls
- Debug entry and Playwright coverage already exist through:
  - `tests/debug-pages/GameDebug.html`
  - `tests/e2e/specs/dragon-end-arena.spec.mjs`

This means the missing piece is not encounter plumbing. It is behavior.

---

## Options Considered

### Option A: Constant follow behavior

Make the dragon always move toward the player's current position plus a fixed offset.

**Pros**
- Fastest to implement
- Immediately better than static hovering

**Cons**
- All phases feel similar
- Boss reads more like a flying minion than a staged encounter

### Option B: Three-phase pursuit model

Use distinct movement goals and attack profiles for phases 1 to 3.

**Pros**
- Matches player expectation
- Preserves existing phase/intention model
- Creates readable escalation
- Fits current controller without a large rewrite

**Cons**
- Slightly more state to manage

### Option C: Full behavior tree

Model cruise, acquire, dive, sweep, breath, recover, stagger as separate AI states.

**Pros**
- Highest long-term flexibility

**Cons**
- Too large for the immediate fix
- Unnecessary for current debug and test scope

### Recommendation

Choose **Option B**.

---

## Target Behavior

### Phase 1: High-Altitude Pressure

- Dragon stays above the player instead of above the arena center.
- Horizontal motion follows the player with smoothing.
- Vertical position stays safely below the HUD and clearly above the player.
- Primary feel: crystal-protected aerial pressure.
- Intent key remains `orbit_crystal_heal`.

### Phase 2: Dive and Breath

- `dive_charge`
  - dragon selects a predicted player position
  - dragon accelerates through that line
  - after pass-through, dragon climbs back up
- `fireball_breath`
  - dragon aligns above or ahead of the player
  - breath hazards spawn near the player's current or predicted landing area
- Primary feel: active chase and punish windows.

### Phase 3: Low Sweep Frenzy

- Dragon lowers altitude.
- Dragon keeps tighter horizontal lock on the player.
- Movement becomes shorter and more aggressive.
- `perch_frenzy` and `low_sweep` should both read as near-player pressure rather than center-arena animation.
- Primary feel: finish-pressure and panic.

---

## Motion Model

Use a lightweight pursuit state instead of a full AI tree.

### Dragon state additions

- `movementMode`
- `targetX`
- `targetY`
- `velocityX`
- `velocityY`
- `attackCooldown`
- `attackTimer`
- `diveTargetX`
- `diveTargetY`

### Update model

Each frame:

1. Read player position from arena/controller.
2. Choose a target point based on phase and current intent.
3. Smoothly steer toward that target.
4. If in attack mode:
   - override target with dive or sweep vector
   - trigger hazards based on player-relative position

This keeps the code understandable and avoids hard teleport-like jumps.

---

## Arena Responsibilities

`endDragonArena.update()` should pass player context into dragon behavior every frame.

The dragon should not read arbitrary globals directly if the controller can provide:

- `playerX`
- `playerY`
- `playerVelocityX`
- `playerGrounded`

That keeps movement logic local and testable.

---

## Hazard Behavior Changes

- Current hazards spawn near the dragon only.
- New behavior should bias hazard placement toward the player when the intent is offensive.

Expected mapping:

- phase 1: hazards rare or minimal
- phase 2: breath pools appear near player pathing
- phase 3: repeated close-range sweep pressure and tighter hazard overlap

---

## Testing Strategy

Keep existing state tests and add pursuit-specific checks.

### New checks

- After moving the player far right, dragon `x` should trend right after several ticks.
- In phase 2, dragon should meaningfully reduce horizontal gap to the player during dive behavior.
- Hazard positions should no longer cluster only around the arena center; they should correlate with player position.

### Non-goals

- No pixel-perfect cinematic flight tests
- No exact path snapshots that would make iteration brittle

---

## Scope Boundaries

### In Scope

- Three-phase pursuit behavior
- Player-relative movement targets
- Dive/breath/sweep attack motion
- Additional Playwright state assertions

### Out of Scope

- Full behavior tree
- Imported dragon art
- Rewriting the entire boss or projectile system

---

## Success Criteria

- Dragon clearly follows and pressures the player.
- Each phase feels behaviorally distinct.
- Existing dragon arena tests still pass.
- New pursuit-specific tests pass.
- Debug page visibly shows the dragon chasing rather than hovering at arena center.
