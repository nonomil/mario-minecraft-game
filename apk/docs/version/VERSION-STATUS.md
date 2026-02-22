# Version Status (2026-02-21)

## Current Baseline
- Local version file: `apk/version.json`
- versionName: **1.18.34**
- versionCode/buildNumber: **34**

## Git State
- Branch: `main`
- Includes vocab-db publish-gate hardening + manifest path repair + junior-high/supplement normalization.
- After pushing, CI auto-bump workflow is expected to publish next patch version (**1.18.35**).

## Records Check
- Updated: `apk/docs/version/CHANGELOG.md`
- Updated: `apk/docs/version/VERSION-STATUS.md`

## Validation Snapshot
- `node --check words/vocabs/manifest.js` passed.
- `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p0-vocab-pack-switch.spec.mjs` passed.
