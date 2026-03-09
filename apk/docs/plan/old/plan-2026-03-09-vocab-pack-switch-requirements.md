# Vocab Pack Switch Requirements

## Request Understanding

- Fix the current vocab pack switching issue because switching is not taking effect.
- Reproduce the failure first, then implement the smallest safe fix.
- Verify with sufficient automated coverage, not only manual spot checks.

## Current Findings

- `src/defaults.js` still uses the legacy pack id `vocab.kindergarten`.
- `words/vocabs/manifest.js` only exposes current ids such as `vocab.kindergarten.full` and `vocab.junior_high.full`.
- On boot, `setActiveVocabPack()` receives stale ids from defaults or account data, cannot resolve a pack, and leaves `activeVocabPackId` as `null`.
- Existing E2E coverage also still expects removed ids, so it no longer matches runtime behavior.

## Ambiguities And Risk

- Some historical ids were removed entirely, so legacy-to-current mapping must choose the closest current replacement.
- The work touches boot flow, account restore, settings save flow, and regression tests.
- The worktree already has unrelated user changes; only vocab-switch-related files should be touched.

## Complexity Assessment

- Mode: Debug
- Expected files: 3 to 5
- Expected diff: under 200 lines if kept minimal
- Cross-module impact: yes, because defaults, vocab runtime, and tests must stay aligned

## Proposed Fix Direction

1. Add a single normalization path for legacy vocab ids.
2. Update the default vocab selection to a valid current id.
3. Apply normalization during pack activation so restored accounts and old settings still work.
4. Update regression coverage to prove boot-time migration and actual pack switching.

## Acceptance

- Booting with a legacy vocab id still activates a valid current pack.
- Saving a new vocab selection updates `activeVocabPackId` and word count.
- Relevant unit and E2E tests pass.
