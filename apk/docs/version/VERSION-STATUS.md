# Version Status (2026-03-10)

## Current Baseline
- Local version file: `version.json`
- versionName: **1.19.35**
- versionCode/buildNumber: **87**

## Git State
- Branch: `main`
- Latest integration checkpoint: `d308f87 checkpoint: 00:28`
- Release workflow doc commit: `88f8b20 docs: add comprehensive release workflow guide`
- Lane E integration commit: `fb28129 feat: integrate lane e release gate`
- Previous release commit: `4f2b5b2 release: v1.19.34`
- Previous vocab fix baseline: `2894e48 fix: resolve vocab pack switching legacy ids`
- Launcher/APK vocab fix baseline: `55f4659 fix: resolve vocab switching in launcher and apk`

## Records Check
- Updated: `version.json`
- Updated: `package.json`
- Updated: `android-app/package.json`
- Updated: `android-app/android/app/build.gradle`
- Updated: `android-app/web/build-info.json`
- Updated: `config/biomes.json`
- Updated: `docs/version/CHANGELOG.md`
- Updated: `docs/version/Progress.md`
- Updated: `docs/version/VERSION-STATUS.md`
- Updated: `docs/release/release-notes.md`
- Added: `docs/release/RELEASE_NOTES_v1.19.35.md`
- Retained vocab fixes without file overlap: `src/defaults.js`, `src/modules/09-vocab.js`, vocab-related tests/build files
- Added gameplay follow-up fixes: safe dragon dismount separation, `cave` baseline registration, enemy renderer regression coverage

## Validation Snapshot
- 主线 0309 集成回归通过：
  - `node tests/unit/village-ui-regression.test.mjs`
  - `node tests/unit/dragon-summon-regression.test.mjs`
  - `node tests/unit/crafting-foundation-regression.test.mjs`
  - `node tests/unit/cave-biome-lighting-regression.test.mjs`
  - `node tests/unit/warden-egg-regression.test.mjs`
  - `node tests/unit/enemy-renderer-regression.test.mjs`
  - `node tests/unit/dev-cache-busting-regression.test.mjs`
  - `MMWG_E2E_PORT=4200 npx playwright test tests/e2e/specs/p0-village-trader-sell-grid.spec.mjs tests/e2e/specs/p0-village-wordhouse-trigger.spec.mjs --config=tests/e2e/playwright.config.mjs`
  - `MMWG_E2E_PORT=4201 npx playwright test tests/e2e/specs/p1-summon-dragon-and-gunpowder.spec.mjs tests/e2e/specs/p1-crafting-foundation.spec.mjs --config=tests/e2e/playwright.config.mjs`
  - `MMWG_E2E_PORT=4202 npx playwright test tests/e2e/specs/p1-cave-lighting.spec.mjs tests/e2e/specs/p1-warden-egg-integration.spec.mjs --config=tests/e2e/playwright.config.mjs`
  - `MMWG_E2E_PORT=4205 npx playwright test tests/e2e/specs/p1-summon-dragon-and-gunpowder.spec.mjs tests/e2e/specs/p1-cave-lighting.spec.mjs --config=tests/e2e/playwright.config.mjs`
- 本次 release 提取 Git 记录：
  - `d308f87 checkpoint: 00:28`
  - `88f8b20 docs: add comprehensive release workflow guide`
  - `fb28129 feat: integrate lane e release gate`
  - `8fd8de0 feat: add release-and-push skill for automated version releases`
  - `874800d docs: add release notes management guide`
  - `142d733 chore: reorganize release notes to docs/release directory`
  - `176bb90 checkpoint: 23:45`
