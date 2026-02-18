# Playwright E2E (Boss + Biome Validation)

## Install

```bash
npm install
npm run pw:install
```

## Run

```bash
npm run test:e2e
```

Optional:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
```

## What is covered

1. `p0-render-path.spec.mjs`
   - Verifies boss render path uses `camX = 0` in translated draw context.

2. `p2-biome-config.spec.mjs`
   - Verifies `stepScore=300`, `volcano/nether minStay`, and slider + normalization lower bound.

3. `boss-debug-controls.spec.mjs`
   - Uses `tests/debug-pages/GameDebug.html` and `window.MMDBG` API.
   - Can force-spawn all 4 bosses and verify active/locked/type state.
   - Can set biome/score and verify stay config is available.

## Manual debug page

Use:

```text
http://localhost:4173/tests/debug-pages/GameDebug.html
```

The page now exposes:

- `window.MMDBG.ready()`
- `window.MMDBG.ensureRunning()`
- `window.MMDBG.setBiome(id)`
- `window.MMDBG.setScore(score)`
- `window.MMDBG.spawnBoss(type)`
- `window.MMDBG.getState()`

