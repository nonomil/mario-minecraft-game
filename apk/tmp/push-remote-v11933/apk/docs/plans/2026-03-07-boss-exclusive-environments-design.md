# Boss Exclusive Environments Design

> Date: 2026-03-07
> Status: Direction confirmed, implementation pending
> Scope: First batch for `Warden` and `Blaze`

## 1. Goal

Upgrade boss fights from "normal map + boss enemy" into "dedicated arena + dedicated environmental rules + dedicated pacing".

The first batch only targets two bosses:
- `Warden`: deep dark arena
- `Blaze`: inferno altar arena

The goal is not to rebuild every boss immediately. The goal is to establish one reusable boss-environment layer so later bosses such as `Wither` and `Evoker` can plug into the same architecture.

---

## 2. Design Principles

### 2.1 Immediate identity

A dedicated boss arena should instantly tell the player:
- this is no longer a normal world segment
- this fight has its own rules
- the arena itself matters, not just the boss body

### 2.2 Keep the current `bossArena`

Do not replace the existing flow for:
- arena entry
- viewport lock
- win / reward flow
- phase progression

Instead, add one environment controller that owns:
- background rendering
- arena hazards
- HUD text
- phase banners
- environment state updates

### 2.3 Gameplay first, art second

The first batch should optimize for:
- readability
- playability
- testability
- extensibility

Do not depend on new art packs or complex animation systems in phase one.

---

## 3. Recommended Architecture

Recommended approach: **Reusable environment framework + boss-specific definitions**.

### Why this is the best fit

- Reuses lessons from `endDragonArena`
- Avoids copying one-off logic for each boss
- Keeps debug tools and Playwright coverage consistent
- Makes later bosses cheaper to add

### Core controller shape

Add one reusable layer such as:
- `bossEnvironmentArena`
- or `bossEnvironmentController`

Suggested responsibilities:
- `enter(bossType, options)`
- `exit()`
- `update(player, boss)`
- `renderBackground(ctx)`
- `renderEntities(ctx)`
- `renderHud(ctx)`
- `getDebugState()`

Boss-specific definitions for phase one:
- `warden`
- `blaze`

---

## 4. Warden Arena

### Theme

A deep dark chamber / sculk shrine boss space.

### Visual identity

- heavy dark blue-black overlay
- sparse cold glow points
- edge vignette / darkness pressure
- stronger darkness as phases increase

### Environmental mechanics

#### A. Darkness pulse
- periodic visibility pressure
- stronger atmosphere cue than raw punishment in phase one

#### B. Sonic danger lanes
- Warden creates one or more sonic strike bands
- bands deal damage or knockback if the player stands inside them
- hazard must have readable telegraph timing

#### C. Slam crack zones
- ground cracks appear after heavy slam actions
- crack zones stay active briefly and punish bad positioning
- encourages movement and safe-space reading

### Intended player feel

- oppressive
- slower and more deliberate
- observation-heavy
- arena pressure matters as much as boss movement

---

## 5. Blaze Arena

### Theme

A nether altar / furnace platform arena.

### Visual identity

- hot red-orange background
- lava vents and ember particles
- heat-wave atmosphere
- more visual intensity as phases increase

### Environmental mechanics

#### A. Magma vents
- fixed eruption points
- warning ring before eruption
- vertical fire column does heavy damage

#### B. Heat zones
- temporary burn areas across parts of the floor
- standing inside them causes ongoing damage
- movement solves the problem; no complex resistance system in phase one

#### C. Safe-window routing
- certain spaces are only safe between vent cycles
- player learns to cross during short windows
- adds rhythm and movement contrast versus Warden

### Intended player feel

- bright and dangerous
- higher frequency hazards
- movement-and-timing focused
- strong contrast to the slower Warden arena

---

## 6. Shared HUD Pattern

Every exclusive arena should expose:
- boss title
- current phase label
- short objective line
- short status line
- centered banner for transitions

### Example: Warden
- `WARDEN`
- `Phase 2 - Sonic Collapse`
- `Avoid sonic lanes`
- `Darkness rising`

### Example: Blaze
- `BLAZE`
- `Phase 2 - Magma Burst`
- `Avoid vents and use safe windows`
- `Heat level rising`

---

## 7. Debug and Test Requirements

### Debug page requirements
- direct entry into `warden` arena
- direct entry into `blaze` arena
- force phase changes
- force hazard waves
- read HUD and hazard state from debug output

### Playwright acceptance
- entering the arena replaces the normal map presentation
- HUD text matches boss / phase / objective state
- hazards spawn, update, and expire
- phase changes update banner text and environment state
- leaving / winning restores normal world state

---

## 8. Likely Files

Expected phase-one touch points:
- `src/modules/15-entities-boss.js`
- `src/modules/14-renderer-main.js`
- `src/modules/14-renderer-entities.js`
- `src/modules/13-game-loop.js`
- `tests/debug-pages/GameDebug.html`
- `tests/e2e/specs/boss-debug-controls.spec.mjs`
- one new environment module, likely near existing boss modules

---

## 9. Main Risks

### Risk 1: one-off implementations per boss
Mitigation: create the controller first.

### Risk 2: too much difficulty from boss attacks + arena hazards
Mitigation: first batch only ships 2-3 simple, well-telegraphed hazards per boss.

### Risk 3: rendering and gameplay become tightly coupled
Mitigation: keep `update`, `renderBackground`, and `renderHud` separate.

### Risk 4: tests become fragile
Mitigation: expose all environment state through the debug page.

---

## 10. Phase-One Acceptance

### Warden
- dedicated background
- darkness pressure effect
- at least two environment hazards
- HUD + banner text
- debug + Playwright coverage

### Blaze
- dedicated background
- eruption / burn mechanics
- at least two environment hazards
- HUD + banner text
- debug + Playwright coverage

### Framework
- can later support `Wither` and `Evoker`
- does not break `endDragonArena`
- does not break existing `bossArena` lifecycle
