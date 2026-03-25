# Version Status (2026-03-26)

## Current Baseline
- Local version file: `version.json`
- versionName: **1.19.48**
- versionCode/buildNumber: **99**

## Git State
- Branch: `main`
- Latest vocab curation commit: `ef3be18 feat: finalize child-friendly vocab curation and bridge polish`
- Previous release commit: `9185b3d release: v1.19.47`
- Current release target: `v1.19.48 / build 99`
- Release notes baseline: `docs/release/RELEASE_NOTES_v1.19.48.md`

## Records Check
- Updated: `version.json`
- Updated: `package.json`
- Updated: `android-app/package.json`
- Updated: `android-app/android/app/build.gradle`
- Updated: `android-app/web/build-info.json`
- Updated: `CHANGELOG.md`
- Updated: `docs/release/release-notes.md`
- Updated: `docs/version/VERSION-STATUS.md`
- Added: `docs/release/RELEASE_NOTES_v1.19.48.md`
- Retained learning vocab runtime updates: `src/modules/09-vocab.js`, `android-app/web/index.html`, `words/vocabs/manifest.js`
- Retained curated vocab packs: `words/vocabs/06_汉字/幼儿园汉字.js`, `words/vocabs/08_幼小衔接/*`
- Retained regression coverage: `tests/unit/bridge-vocab-curation.test.mjs`, `tests/unit/bridge-vocab-coverage.test.mjs`, `tests/e2e/specs/bridge-vocab-expansion.spec.mjs`

## Validation Snapshot
- 词库与桥接回归通过：
  - `node tests/unit/kindergarten-hanzi-regression.test.mjs`
  - `node tests/unit/vocab-pack-switch-regression.test.mjs`
  - `node tests/unit/bridge-language-ui-regression.test.mjs`
  - `node tests/unit/bridge-vocab-curation.test.mjs`
  - `node tests/unit/bridge-vocab-coverage.test.mjs`
  - `npx playwright test tests/e2e/specs/bridge-vocab-expansion.spec.mjs --config tests/e2e/playwright.config.mjs`
- 本次 release 提取 Git 记录：
  - `ef3be18 feat: finalize child-friendly vocab curation and bridge polish`
  - `9185b3d release: v1.19.47`
