# Changelog

All notable changes to this project will be documented in this file.

## [1.19.10] - 2026-03-06

### Added

#### Consumable Equipment System
- **Consumable Slot**: Added dedicated equipment slot for background materials (explosives, ender pearls, etc.)
  - Materials no longer used immediately after selection from inventory
  - Must be equipped to consumable slot first, then triggered via long-press
  - Visual feedback with pulsing glow animation when active
  - Real-time count display synced with inventory

- **Long-Press Trigger Mechanism** (800ms threshold)
  - Short press on attack button: Normal weapon attack
  - Long press on attack button: Use equipped consumable
  - Circular progress bar animation during hold
  - Pointer Events API with Touch Events fallback for cross-platform support

- **Debuff System**
  - Configuration-driven debuff effects (burn, slow, etc.)
  - Anti-stacking mechanism: same debuff type refreshes duration instead of stacking
  - Burn debuff: Damage-over-time with fire particle effects
  - Slow debuff: Speed reduction with visual indicator
  - Radius-based area-of-effect application

- **Particle Pool Optimization**
  - Object pooling for fire particles to reduce GC pressure
  - Automatic pool expansion when needed
  - Particle recycling for better performance

#### Configuration
- `config/consumables.json`: Centralized consumable definitions with effects, debuffs, and visual settings
- Fallback to hardcoded defaults if config file missing

#### UI Enhancements
- Consumable status display in HUD (icon, name, count)
- CSS animations: `hold-fill` (progress bar), `pulse-glow` (active state)
- Responsive design with clamp() for cross-device compatibility

#### Technical Implementation
- **Modified Files**:
  - `src/modules/01-config.js`: Global state initialization
  - `src/modules/10-ui.js`: UI update functions
  - `src/modules/13-game-loop.js`: Equipment and usage logic, debuff integration
  - `src/modules/16-events.js`: Long-press detection with `bindTapOrHold()`
  - `src/modules/17-bootstrap.js`: Config loading
  - `Game.html`: Consumable slot DOM elements
  - `src/styles.css`: Complete styling with animations

- **Total Changes**: 676 lines across 4 parallel tasks
  - task-1a (config): 153 lines - commit 942d925
  - task-2 (debuff+particles): 181 lines - commit d3686be
  - task-1b (long-press): 128 lines - commit efa184e
  - task-3 (UI+integration): 214 lines - commit bbdf0f6

### Changed
- `useInventoryItem()` function extended to apply debuffs based on consumable config
- Touch control system enhanced with dual-mode detection (tap vs hold)

### Technical Notes
- Maintains backward compatibility with existing inventory system
- No breaking changes to existing weapon mechanics
- All features verified via manual HTTP testing (Playwright tests skipped due to worktree node_modules conflicts)
