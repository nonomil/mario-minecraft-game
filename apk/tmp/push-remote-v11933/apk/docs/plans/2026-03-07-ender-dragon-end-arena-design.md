# Ender Dragon Dedicated End Arena Design

**Goal:** Add a dedicated End arena encounter for the Ender Dragon, entered as a separate battle scene, without turning the existing `bossArena` system into a dragon-specific special-case bundle.

**Decision:** Use a parallel `endDragonArena` controller instead of inserting `ender_dragon` directly into `bossArena`.

---

## Current Architecture Context

- The existing ground-boss lifecycle lives in `src/modules/15-entities-boss.js`.
- The existing summonable/ridable dragon prototype lives in `src/modules/15-entities-combat.js`.
- End biome environment helpers already exist in `src/modules/06-biome.js`.
- The game already has a debug bridge and Playwright harness through:
  - `tests/debug-pages/GameDebug.html`
  - `tests/e2e/specs/boss-debug-controls.spec.mjs`

This means the project already has three strong foundations:

1. A stable boss/debug/test workflow.
2. Reusable End-themed environment logic.
3. A dragon-shaped prototype that can inform, but should not directly define, the real boss encounter.

---

## Options Considered

### Option A: Add `ender_dragon` to `bossArena`

**Pros**
- Fastest path to a visible result.
- Reuses the existing boss HP bar and spawn plumbing.

**Cons**
- `bossArena` is designed around relatively compact encounters.
- Dragon-only concepts such as crystal healing, aerial orbiting, perch windows, and battle-scene enter/exit would become brittle special cases.
- Future large flying bosses would become harder to add cleanly.

### Option B: Create `endDragonArena` as a separate system

**Pros**
- Keeps the current ground-boss pipeline stable.
- Gives the dragon encounter clear ownership over arena state, crystals, hazards, and return flow.
- Supports future large-scale encounter design more cleanly.
- Fits the existing parallel worktree workflow well.

**Cons**
- Requires a small amount of new encounter scaffolding.

### Option C: Build a full explorable End world layer first

**Pros**
- Highest fidelity to a full End dimension experience.

**Cons**
- Too large for the current batch.
- Would expand the scope from boss encounter work into broad world-generation and progression work.

### Recommendation

Choose **Option B**. Build a dedicated End arena encounter with a clear entry, combat, victory, and exit lifecycle.

---

## Scope Boundaries

### In Scope

- Add a dedicated `endDragonArena` lifecycle.
- Add a formal `EnderDragonBoss` distinct from the ally/riding dragon prototype.
- Add End arena scene elements: island, obsidian pillars, crystals, hazards, exit portal.
- Add three readable combat phases.
- Add debug hooks and Playwright coverage.
- Add reward and return flow back to the main run.

### Out of Scope

- No imported art or copyrighted sprite packs.
- No full outer-End exploration system.
- No merge between the summonable ally dragon and the boss dragon state model.
- No broad rewrite of the regular boss UI and boss pipeline.

---

## Core Design Decisions

### 1. Dedicated Controller: `endDragonArena`

The new arena controller should own:

- entering the battle scene
- exiting the battle scene
- saving and restoring the player/world return context
- spawning and updating crystals, hazards, and portal state
- holding the current `dragon`
- exposing stable debug state
- handling victory and defeat transitions

Recommended state fields:

- `active`
- `state` (`idle`, `intro`, `combat`, `victory`, `defeat`, `exit`)
- `phase`
- `dragon`
- `crystals`
- `hazards`
- `entryContext`
- `returnContext`
- `victoryReady`
- `exitPortalReady`

### 2. Separate Boss Entity: `EnderDragonBoss`

The existing `EnderDragon` prototype is useful reference material, but the boss version should be separate.

Reusable ideas:
- large flying silhouette
- directional fireball launch logic
- broad segmented body language

Boss-specific requirements:
- phase state machine
- crystal healing integration
- perch / dive / breath hazard combat loops
- explicit victory and defeat integration
- stable debug metadata for automation

### 3. Battle as a Scene Switch, Not an In-Place Spawn

The dragon fight should not simply appear inside the normal scrolling map.

Recommended approach:
- save the current run context on entry
- switch to a dedicated arena state
- run the battle in that scene
- restore the main run safely on exit

This keeps the encounter self-contained and prevents the regular map loop from accumulating dragon-specific conditions.

---

## Arena Design

### Arena Layout

The arena should include:

- a central End island
- a center platform / portal pedestal
- 4 to 6 obsidian pillars
- one crystal per pillar
- one or two caged-crystal silhouettes for visual variety
- an outer danger boundary or pullback mechanic

### Visual Goals

- strong black/purple End atmosphere
- clear distinction between dragon, crystals, pillars, and breath hazards
- readable player position even during heavy action
- layered silhouette and glow-driven visuals rather than imported art

### Boundary and Failure Handling

Recommended behavior:
- falling or drifting too far out applies damage and/or snaps the player back toward a safe island position
- player death triggers a controlled defeat exit, not a permanent broken scene
- the arena always has a safe recoverable exit path after combat resolution

---

## Combat Design

### Overall Feel

This encounter does not need to be a one-to-one reproduction of vanilla Minecraft. It should instead be:

- readable
- high-pressure
- crystal-centric
- phase-driven
- easy to debug and automate

### Phase 1: Orbital Pressure + Crystal Healing

- Dragon stays higher and circles the arena.
- Fireball pressure is present but readable.
- Living crystals can periodically heal the dragon.
- Player priority is to break crystals and stop the healing loop.

### Phase 2: Dive Pressure + Breath Pools

- Dragon begins more aggressive low passes.
- Add dive charge windows.
- Fireball impacts create lingering breath hazards.
- The player gets clearer damage windows while also dealing with more spatial pressure.

### Phase 3: Perch Frenzy / Low-Altitude Finish

- Dragon uses a lower and more aggressive movement pattern.
- Crystal healing is reduced or disabled.
- Stronger sweep pressure and denser hazard coverage create the final phase identity.
- The fight should feel more urgent, but still readable and testable.

### Initial Attack Set

1. `Dragon Fireball`
   - projectile attack
   - creates a breath hazard on impact

2. `Dive Charge`
   - high-speed directional attack toward the player

3. `Wing Gust`
   - short-range knockback / displacement pressure during low passes or perch windows

4. `Breath Pool`
   - lingering damage zone that controls ground positioning

---

## Crystal and Arena Mechanisms

### End Crystals

Each crystal should track:

- `id`
- `alive`
- `x`
- `y`
- `pillarId`
- `beamActive`
- `healCooldown`

Desired behavior:
- active crystals can heal the dragon during phase 1
- destroying a linked crystal interrupts healing immediately
- linked crystal destruction may also deal bonus backlash damage to the dragon
- the shrinking crystal count visibly advances encounter tempo

### Obsidian Pillars

Pillars mainly provide:
- vertical structure
- crystal anchors
- battlefield landmarks
- mild sightline variation

They do not need complex destructibility in the first version.

### Exit Portal

- Spawn only after victory is confirmed.
- Expose a stable `exitPortalReady` debug state.
- Make reward delivery and portal activation two distinct states for easier automation.

---

## Entry and Return Flow

### Entry

The first shipping version should support two entry paths:

1. direct debug entry for testing and automation
2. one controlled gameplay hook from the End biome

Debug entry should be implemented first because it enables reliable TDD and regression testing.

### Return Flow

- Victory: reward -> portal ready -> exit arena -> restore main run
- Defeat: defeat state -> safe rollback -> restore main run
- Optional cancel flows should only exist outside active combat if added later

---

## Debug and Test Expectations

### Debug Bridge Additions

Recommended debug API surface:

- `enterDragonArena()`
- `exitDragonArena()`
- `setDragonArenaPhase(phase)`
- `destroyDragonCrystal(index)`
- `setDragonHp(value)`
- `forceDragonVictory()`
- `getDragonArenaState()`

### Playwright Acceptance Coverage

At minimum, automated tests should verify:

1. arena entry works
2. dragon and crystals spawn correctly
3. crystal destruction changes healing state
4. phase 2 and phase 3 can be forced and observed
5. victory produces reward-ready and portal-ready states
6. exiting returns control to the normal run flow

---

## Recommended Parallel Worktree Layout

### Worktree A
- Branch: `feat/dragon-arena-foundation`
- Owns: arena lifecycle, entry/exit, base HUD, reset flow

### Worktree B
- Branch: `feat/dragon-boss-flight-phases`
- Owns: `EnderDragonBoss`, phase logic, fireball, dive, low-flight behavior

### Worktree C
- Branch: `feat/dragon-arena-crystals-hazards`
- Owns: crystals, beams, healing, hazards, exit portal activation

### Worktree D
- Branch: `feat/dragon-debug-tests`
- Owns: debug bridge and Playwright coverage

### Worktree E
- Branch: `feat/dragon-integration`
- Owns: merge, conflict resolution, final verification

---

## External Reference Notes

Use these for trait selection and encounter structure, not for asset copying:

- Ender Dragon
  - https://minecraft.wiki/w/Ender_Dragon
- End Crystal
  - https://minecraft.wiki/w/End_Crystal

Useful traits to adapt into this project:
- large flying arena-scale boss identity
- crystal-linked healing as the main encounter pacing mechanic
- clear post-victory exit state
- strong silhouette and readable arena landmarks

---

## Final Recommendation

The right next step is not to chase a full End-dimension simulation. The right next step is to ship a clean, testable, expandable dedicated dragon encounter system.

In short:

**Build a focused Ender Dragon arena first. Then iterate on depth in later versions.**
