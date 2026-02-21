# Version Status (2026-02-21)

## Current Baseline
- Local version file: `apk/version.json`
- versionName: **1.18.32**
- versionCode/buildNumber: **32**

## Git State
- Branch: `main`
- Includes vocab-db tooling upgrade + junior high + kindergarten/elementary supplement packs.
- After pushing, CI auto-bump workflow is expected to publish next patch version (**1.18.33**).

## Records Check
- Updated: `apk/docs/version/CHANGELOG.md`
- Updated: `apk/docs/version/Progress.md`
- Updated: `apk/docs/version/VERSION-STATUS.md`
- Added release notes: `apk/docs/release/发布说明-v1.18.32.md`

## Validation Snapshot
- `npm run vocab:db:publish` passed.
- `npm run vocab:db:dedup` executed.
- `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p0-vocab-pack-switch.spec.mjs` passed.
