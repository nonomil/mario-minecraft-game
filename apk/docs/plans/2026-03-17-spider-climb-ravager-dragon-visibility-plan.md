# Spider Climb + Ravager Boss + Dragon Arena Visibility Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add spider climbing on trees and grass blocks, replace Evoker with a Ravager boss, and fix Ender Dragon arena player visibility.

**Architecture:** Keep spider climbing inside Spider AI only, introduce a Ravager boss module plugged into the existing boss registry/environment pipeline, and clamp player position inside the Ender Dragon arena without altering global rendering.

**Tech Stack:** Vanilla JavaScript, HTML canvas rendering, Playwright e2e (optional) for manual verification.

---

### Task 1: Add spider climb behavior

**Files:**
- Modify: `src/modules/15-entities-combat.js` (Enemy.updateSpider, Enemy.applyGravity)

**Step 1: Write the failing test (manual checklist)**
- Manual checklist: spider hits tree trunk side then climbs to top; spider hits grass platform side then climbs to top; spider leaves contact then stops climbing.

**Step 2: Run manual test to observe current failure**
Run: `npm run dev`  
Expected: Spider cannot climb tree or grass platform.

**Step 3: Write minimal implementation**
Add helpers near Enemy.updateSpider to detect climb surfaces and set a climb state:

```js
const CLIMB_MAX_FRAMES = 90;
const CLIMB_SPEED_MULT = 0.9;

function findSpiderClimbSurface(spider) {
  // 1) tree trunk rectangle
  // 2) grass platform side
  // return { type, x, y, width, height } or null
}
```

Then in `updateSpider`:

```js
if (this.climbState && this.climbState.frames > CLIMB_MAX_FRAMES) this.climbState = null;
const surface = findSpiderClimbSurface(this);
if (surface) {
  this.state = "climb";
  this.velY = -Math.abs(this.speed * CLIMB_SPEED_MULT);
  this.y += this.velY;
  this.climbState = { frames: (this.climbState?.frames || 0) + 1 };
  return;
}
// fallback to chase or patrol
```

**Step 4: Run manual test to verify**
Run: `npm run dev`  
Expected: Spider climbs tree trunk and grass platform side, then resumes chase on top.

**Step 5: Commit (optional)**
Skip commit unless user explicitly requests.

---

### Task 2: Add Ravager boss module

**Files:**
- Create: `src/modules/15-entities-boss-ravager.js`

**Step 1: Write the failing test (manual checklist)**
- Manual checklist: Ravager appears at Evoker score threshold; has charge windup then dash then recovery; roar pushes player at close range.

**Step 2: Run manual test to observe current failure**
Run: `npm run dev` and reach boss threshold  
Expected: Evoker appears; no Ravager.

**Step 3: Write minimal implementation**
Create a new boss class that extends `Boss`:

```js
class RavagerBoss extends Boss {
  constructor(spawnX) {
    super({
      id: "ravager",
      visualKey: "ravager_v1",
      name: "劫掠兽 Ravager",
      maxHp: 60,
      color: "#2f3a3d",
      x: spawnX,
      y: groundY - 90,
      width: 84,
      height: 90,
      phaseThresholds: [0.65, 0.35],
      damage: 2
    });
    this.state = "stalk";
    this.chargeTimer = 0;
    this.recoveryTimer = 0;
    this.roarCooldown = 0;
    this.moveSpeed = 1.4;
  }

  updateBehavior(playerRef) {
    // stalk -> charge_windup -> charge_dash -> recovery
  }

  render(ctx, camX) {
    // simple body and horn shapes using fillRect and arcs
  }
}
```

**Step 4: Run manual test to verify**
Run: `npm run dev`  
Expected: Ravager spawns, charges, and roars; no Evoker.

**Step 5: Commit (optional)**
Skip commit unless user explicitly requests.

---

### Task 3: Register Ravager in boss system

**Files:**
- Modify: `src/modules/15-entities-boss-core.js` (BOSS_REGISTRY, DEFAULT_BOSS_REWARDS, createBoss)
- Modify: `src/modules/15-entities-boss-environments.js` (ENVIRONMENT_DEFINITIONS)
- Modify: `Game.html` (script include)

**Step 1: Write the failing test (manual checklist)**
- Manual checklist: boss registry includes ravager; environment overlay loads; Ravager module loads.

**Step 2: Run manual test to observe current failure**
Run: `npm run dev`  
Expected: Ravager module not found, Evoker still listed.

**Step 3: Write minimal implementation**
Update registry and rewards:

```js
{ id: "ravager", score: 12000, flying: false, debugCtor: "RavagerBoss" }
ravager: { key: "ravager_cache", drops: ["iron", "emerald"] }
```

Add to `createBoss`:

```js
case "ravager":
  return (typeof RavagerBoss === "function") ? new RavagerBoss(spawnX) : new WitherSkeletonBoss(spawnX);
```

Add environment entry:

```js
ravager: {
  id: "raid_stand",
  label: "劫掠战台",
  theme: "ashen",
  hazardProfile: {
    phase2: { interval: 16, ttl: 22, kind: "ash_burst" },
    phase3: { interval: 9, ttl: 28, kind: "bone_spike" }
  }
}
```

Add script tag in `Game.html` after existing boss scripts.

**Step 4: Run manual test to verify**
Run: `npm run dev`  
Expected: Ravager loads and environment overlay renders.

**Step 5: Commit (optional)**
Skip commit unless user explicitly requests.

---

### Task 4: Fix Ender Dragon arena player visibility

**Files:**
- Modify: `src/modules/15-entities-boss-dragon.js` (enter, update)

**Step 1: Write the failing test (manual checklist)**
- Manual checklist: entering Ender Dragon arena shows player at center and stays visible while moving.

**Step 2: Run manual test to observe current failure**
Run: `npm run dev` and enter End arena  
Expected: Player invisible or offscreen.

**Step 3: Write minimal implementation**
Add helper to clamp player position and call on enter and update:

```js
function clampPlayerToArena() {
  if (!globalThis.player) return;
  const minX = 80, maxX = 1220;
  const minY = 180, maxY = 520;
  player.x = clampNumber(player.x, minX, maxX);
  player.y = clampNumber(player.y, minY, maxY);
}
```

In `enter`: save original position, set player x and y to center and zero velocity.  
In `update`: call `clampPlayerToArena()` each frame while active.

**Step 4: Run manual test to verify**
Run: `npm run dev`  
Expected: Player visible and controllable in arena; exit restores prior position.

**Step 5: Commit (optional)**
Skip commit unless user explicitly requests.

---

### Task 5: Final manual verification sweep

**Files:**
- No code changes

**Step 1: Manual smoke test**
- Verify spider climb, Ravager fight, and Ender Dragon arena visibility in one session.

**Step 2: Optional e2e**
Run: `npm run test:e2e -- --grep boss` if such tests exist.

**Step 3: Commit (optional)**
Skip commit unless user explicitly requests.
