# 2026-03-13 Ender Dragon Crystal Projectile Toggle - Design

## Goal
Provide a debug-page toggle that controls whether player projectiles can destroy Ender Dragon arena crystals.

## Scope
- Affects only endDragonArena crystal damage from player projectiles.
- Does not change other bosses or normal enemy interactions.
- Default: enabled (projectiles can destroy crystals).

## UX
- Add a checkbox in 	ests/debug-pages/GameDebug.html near existing debug controls.
- Label: 投射物可打碎末影龙水晶.
- State is stored on window.MMDBG (debug layer) and mirrored into game frame as needed.

## Behavior
- When toggle is ON: player projectile collision can destroy Ender Dragon crystals.
- When toggle is OFF: only melee can destroy Ender Dragon crystals.

## Data/Plumbing
- Add MMDBG flag: dragonProjectileCrystalsEnabled.
- On toggle change, set the flag and forward it into the game frame (e.g. endDragonArena.projectileCrystalsEnabled).
- In Projectile.update() for player faction, guard crystal collision by this flag.

## Tests
- Existing test for projectile crystal destruction remains ON by default.
- (Optional later) Add a negative test case when the toggle is OFF.

## Out of Scope
- Tuning projectile damage values.
- Crystal multi-hit durability.
- Non-dragon arenas.
