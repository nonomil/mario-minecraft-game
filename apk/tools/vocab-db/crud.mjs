import { openDb, initSchema, normalizeSpace, toLemmaKey, toLearnType } from "./shared.mjs";

function parseArgs(argv) {
    const out = {};
    for (let i = 0; i < argv.length; i++) {
        const token = argv[i];
        if (!token.startsWith("--")) continue;
        const key = token.slice(2);
        const val = i + 1 < argv.length && !argv[i + 1].startsWith("--") ? argv[i + 1] : "true";
        out[key] = val;
        if (val !== "true") i++;
    }
    return out;
}

const [command = "help", ...rest] = process.argv.slice(2);
const args = parseArgs(rest);

if (!["upsert", "deactivate"].includes(command)) {
    console.log("Usage:");
    console.log("  node tools/vocab-db/crud.mjs upsert --word <word> [--standardized <s>] [--chinese <zh>] [--phrase <p>] [--phraseTranslation <pz>] [--difficulty <d>] [--category <c>]");
    console.log("  node tools/vocab-db/crud.mjs deactivate --word <word> [--learnType word|phrase]");
    process.exit(1);
}

const db = openDb();
initSchema(db);

if (command === "upsert") {
    const word = normalizeSpace(args.word || "");
    if (!word) {
        throw new Error("Missing --word");
    }
    const standardized = normalizeSpace(args.standardized || word);
    const chinese = normalizeSpace(args.chinese || "");
    const phonetic = normalizeSpace(args.phonetic || "");
    const phrase = normalizeSpace(args.phrase || "");
    const phraseTranslation = normalizeSpace(args.phraseTranslation || "");
    const difficulty = normalizeSpace(args.difficulty || "");
    const category = normalizeSpace(args.category || "");
    const learnType = normalizeSpace(args.learnType || toLearnType(word, phrase));
    const lemmaKey = toLemmaKey(word, standardized);

    db.prepare(`
        INSERT INTO entries (
            lemma_key, learn_type, word, standardized, chinese, phonetic, phrase, phrase_translation, difficulty, category, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        ON CONFLICT(lemma_key, learn_type) WHERE status='active'
        DO UPDATE SET
            word=excluded.word,
            standardized=excluded.standardized,
            chinese=excluded.chinese,
            phonetic=excluded.phonetic,
            phrase=excluded.phrase,
            phrase_translation=excluded.phrase_translation,
            difficulty=excluded.difficulty,
            category=excluded.category,
            updated_at=datetime('now')
    `).run(
        lemmaKey,
        learnType,
        word,
        standardized,
        chinese,
        phonetic,
        phrase,
        phraseTranslation,
        difficulty,
        category
    );
    const row = db.prepare(`SELECT id FROM entries WHERE lemma_key=? AND learn_type=? AND status='active'`).get(lemmaKey, learnType);
    db.prepare(`INSERT INTO change_log (entry_id, action, new_value, operator) VALUES (?, 'upsert', ?, ?)`).
        run(row?.id || null, JSON.stringify({ lemmaKey, learnType, word, chinese }), "cli");
    console.log(`[vocab-db] upserted entry ${lemmaKey}/${learnType}`);
} else if (command === "deactivate") {
    const word = normalizeSpace(args.word || "");
    if (!word) throw new Error("Missing --word");
    const learnType = normalizeSpace(args.learnType || "word");
    const lemmaKey = toLemmaKey(word, word);
    const row = db.prepare(`SELECT id FROM entries WHERE lemma_key=? AND learn_type=? AND status='active'`).get(lemmaKey, learnType);
    if (!row) {
        console.log(`[vocab-db] not found active entry ${lemmaKey}/${learnType}`);
    } else {
        db.prepare(`UPDATE entries SET status='inactive', updated_at=datetime('now') WHERE id=?`).run(row.id);
        db.prepare(`INSERT INTO change_log (entry_id, action, old_value, operator) VALUES (?, 'deactivate', ?, ?)`).
            run(row.id, JSON.stringify({ lemmaKey, learnType }), "cli");
        console.log(`[vocab-db] deactivated entry ${lemmaKey}/${learnType}`);
    }
}

db.close();
