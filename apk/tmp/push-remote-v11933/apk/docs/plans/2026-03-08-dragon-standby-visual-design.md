# Dragon Standby Visual Design

**Date:** 2026-03-08

**Goal:** Improve the summoned Ender Dragon so it looks like a recognizable dragon, stays idle after summon, becomes controllable only after mount, and returns to the player after dismount.

## Context

- The current summoned dragon in `src/modules/15-entities-combat.js` is a simple placeholder entity with limited visual identity.
- Current behavior in `src/modules/13-game-loop.js` makes the dragon hover near the player immediately after summon and auto-mount on contact.
- Village trader support for `dragon_egg` already exists in `src/modules/18-village.js` and should remain compatible.

## Visual Direction

- Keep the current code-only canvas rendering approach. Do not add image assets.
- Redraw the summoned dragon as a compact 2D silhouette with:
  - dark charcoal body
  - segmented neck and tail
  - two visible wings
  - glowing purple eyes
  - subtle hovering and wing motion
- Keep the summoned dragon visually distinct from the boss dragon module.

## Behavior States

- `standby`: default after summon. The dragon stays near a preferred offset beside the player, with gentle hover motion. It is not controlled by player input.
- `ridden`: active after the player collides with the dragon. Existing riding controls continue to drive movement and fireball actions.
- `returning`: active after dismount. The dragon flies back toward its preferred standby slot near the player, then transitions back to `standby`.

## Interaction Rules

- Summoning spawns the dragon near the player, slightly above and to the right.
- The player does not control the dragon until mount occurs.
- Contact with the dragon mounts the player if the dragon is not already ridden.
- Dismount clears rider ownership and sets the dragon to `returning`.
- If the dragon dies while ridden, existing forced dismount behavior remains.

## Testing Focus

- Summon creates a dragon in `standby`, not in follow-control mode.
- Mount only changes control after collision.
- Dismount changes dragon state to `returning` and it settles back into `standby`.
- Existing dragon egg village purchase path still works.
