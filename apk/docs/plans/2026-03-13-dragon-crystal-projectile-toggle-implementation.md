# 2026-03-13 Ender Dragon Crystal Projectile Toggle - Implementation Plan

## Step 1: Debug UI
- Update 	ests/debug-pages/GameDebug.html:
  - Add a checkbox toggle for 投射物可打碎末影龙水晶.
  - Bind to window.MMDBG.dragonProjectileCrystalsEnabled.
  - Default ON.

## Step 2: Debug Bridge
- In 	ests/debug-pages/GameDebug.html, forward toggle changes into the game frame:
  - endDragonArena.projectileCrystalsEnabled = <boolean>.

## Step 3: Gameplay Guard
- In src/modules/15-entities-combat.js, guard projectile-to-crystal collision with:
  - endDragonArena.projectileCrystalsEnabled !== false.

## Step 4: Tests
- Keep existing e2e test for projectile crystal destruction (default ON).
- (Optional) Add a negative case when OFF.

## Step 5: Manual Check
- Start debug server.
- Toggle OFF and verify projectiles no longer destroy crystals.
- Toggle ON and verify they do.
