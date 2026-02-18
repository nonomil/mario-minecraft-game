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
- `npm run vocab:db:publish` - export + validate
- `npm run vocab:db:admin` - start local admin UI at `http://127.0.0.1:4174`
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
