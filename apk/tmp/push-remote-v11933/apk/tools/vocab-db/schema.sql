PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lemma_key TEXT NOT NULL,
    learn_type TEXT NOT NULL DEFAULT 'word',
    word TEXT NOT NULL,
    standardized TEXT,
    chinese TEXT,
    phonetic TEXT,
    phrase TEXT,
    phrase_translation TEXT,
    difficulty TEXT,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_lemma_type_active
ON entries (lemma_key, learn_type)
WHERE status = 'active';

CREATE TABLE IF NOT EXISTS entry_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    filename TEXT,
    url TEXT,
    type TEXT,
    is_primary INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (entry_id) REFERENCES entries (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entry_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    source_file TEXT NOT NULL,
    source_group TEXT,
    source_pack TEXT,
    source_version TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (entry_id) REFERENCES entries (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_entry_sources_unique
ON entry_sources (entry_id, source_file, ifnull(source_pack, ''));

CREATE TABLE IF NOT EXISTS entry_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    alias TEXT NOT NULL,
    lang TEXT NOT NULL DEFAULT 'en',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (entry_id) REFERENCES entries (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS change_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    operator TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
