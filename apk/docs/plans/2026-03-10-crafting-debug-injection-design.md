# Crafting Debug Injection Design

## Goal
Add debug-only controls in `tests/debug-pages/GameDebug.html` to inject crafting
materials, open the crafting modal, and trigger auto-fill so we can verify the
`+/-` controls and crafting flow with real inventory values.

## Scope
- Debug page only (no changes to production UI).
- Inventory keys: `stick`, `iron`, `gunpowder`.
- Presets for shield and torch recipes.

## UI Additions
- Crafting test row:
  - Multiplier input.
  - Buttons to inject shield or torch materials.
  - Clear crafting materials.
  - Open crafting modal.
  - Auto-fill shield or torch.
- Crafting inventory row:
  - Absolute inventory inputs for stick/iron/gunpowder.
  - “Set inventory” button.

## Data Flow
- Use `inventory` in the iframe and call `updateInventoryUI()` after changes.
- Use `showCraftingModal()` if available to open the modal.
- Use `selectCraftRecipe()` and `autoFillCraftingSelection()` if available.

## Error Handling
If the iframe is not ready or functions are missing, the actions are no-ops and
the status panel continues to reflect readiness.

## Testing
- Manual: open `tests/debug-pages/GameDebug.html`, inject materials, open
  crafting, auto-fill, adjust `+/-`, and craft.
- Playwright: call new `window.MMDBG.crafting.*` helpers.
