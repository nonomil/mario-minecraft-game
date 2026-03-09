# Vocab DB Workflow (SQLite + CSV)

## Scope
- Main source: `words/db/vocab.db`
- Import source: files referenced by `words/vocabs/manifest.js`
- Human editable export: `words/db/csv/entries.csv`
- JS export: `words/db/export/vocab_entries.js`

## Commands
- `npm run vocab:db:init` - create sqlite schema
- `npm run vocab:db:import` - import words from manifest-referenced JS files
- `npm run vocab:db:export` - export database to JS + CSV
- `npm run vocab:db:validate` - validate duplicate keys and required fields
- `npm run vocab:db:publish` - import + export + dedup + validate + audit (scoped to `vocab.junior_high,vocab.kindergarten.supplement,vocab.elementary_lower.supplement`; BLOCKER findings fail build)
- `npm run vocab:db:admin` - start local admin UI at `http://127.0.0.1:4174`
- `npm run vocab:db:dedup` - generate dedup/collision analysis report
- `npm run vocab:db:audit -- --pack vocab.kindergarten` - run quality/complexity audit and emit JSON + CSV reports
- `npm run vocab:db:import:external -- --url <raw_url> | --file <local.txt> --sourcePack <id> [--format auto|txt|tsv|csv] [--wordCol 0 --chineseCol 1] [--limit 300]` - import external list (default inactive)
- `npm run vocab:db:export:pack -- --sourcePack <id> --packId <vocab.xxx> --stage <stage> --title <name> --output <words/vocabs/...js> [--varName STAGE_XXX]` - export one source pack into runtime JS and append manifest pack
- `npm run vocab:db:upsert -- --word apple --chinese pingguo` - add/update one entry
- `npm run vocab:db:deactivate -- --word apple` - soft delete one entry

## Data rules
- `lemma_key = lower(trim(standardized || word))`
- `learn_type` auto-detected: `phrase` when phrase/word contains spaces; else `word`
- Unique active key: `(lemma_key, learn_type)`
- Soft delete by setting `status='inactive'`

## Build gate
- `npm run build` executes `vocab:db:publish` before web sync.
- Validation failure will stop build.

## External import safety defaults
- Default `status=inactive` so unreviewed words do not affect in-game active set.
- Imported rows are tagged in `entry_sources` by `source_file/source_pack/source_group`.
- Run `npm run vocab:db:dedup` and review `words/db/reports/*.json` before any activation.

## Audit rules
- Rules file: `tools/vocab-db/rules/audit-rules.json`
- Optional args:
  - `--pack <packPrefix>`: only audit matching packs (`vocab.kindergarten` will include `vocab.kindergarten.*`)
  - `--rules <path>`: custom rules file
  - `--out <path/to/report.json>`: custom output base path
