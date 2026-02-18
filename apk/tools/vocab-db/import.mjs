import fs from "fs";
import path from "path";
import {
    openDb,
    initSchema,
    parseManifest,
    resolveManifestFiles,
    loadVocabArrayFromFile,
    toLemmaKey,
    toLearnType,
    normalizeSpace
} from "./shared.mjs";

const db = openDb();
initSchema(db);

const manifest = parseManifest();
const fileMap = resolveManifestFiles(manifest);

const upsertEntryStmt = db.prepare(`
    INSERT INTO entries (
        lemma_key, learn_type, word, standardized, chinese, phonetic, phrase, phrase_translation, difficulty, category, status
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active'
    )
    ON CONFLICT(lemma_key, learn_type) WHERE status='active'
    DO UPDATE SET
        word = COALESCE(NULLIF(excluded.word, ''), entries.word),
        standardized = COALESCE(NULLIF(excluded.standardized, ''), entries.standardized),
        chinese = COALESCE(NULLIF(excluded.chinese, ''), entries.chinese),
        phonetic = COALESCE(NULLIF(excluded.phonetic, ''), entries.phonetic),
        phrase = COALESCE(NULLIF(excluded.phrase, ''), entries.phrase),
        phrase_translation = COALESCE(NULLIF(excluded.phrase_translation, ''), entries.phrase_translation),
        difficulty = COALESCE(NULLIF(excluded.difficulty, ''), entries.difficulty),
        category = COALESCE(NULLIF(excluded.category, ''), entries.category),
        updated_at = datetime('now')
`);

const fetchEntryIdStmt = db.prepare(`SELECT id FROM entries WHERE lemma_key=? AND learn_type=? AND status='active' LIMIT 1`);
const insertSourceStmt = db.prepare(`
    INSERT OR IGNORE INTO entry_sources (entry_id, source_file, source_group, source_pack, source_version)
    VALUES (?, ?, ?, ?, ?)
`);
const insertImageStmt = db.prepare(`
    INSERT INTO entry_images (entry_id, filename, url, type, is_primary)
    VALUES (?, ?, ?, ?, ?)
`);
const clearImagesByEntryStmt = db.prepare(`DELETE FROM entry_images WHERE entry_id=?`);

let importedFiles = 0;
let importedWords = 0;
let skippedFiles = 0;
let skippedWords = 0;
const missingFiles = [];
const badFiles = [];

db.exec("BEGIN");
try {
    for (const [absPath, meta] of fileMap.entries()) {
        if (!fs.existsSync(absPath)) {
            skippedFiles++;
            missingFiles.push(meta.rel);
            continue;
        }
        let parsed;
        try {
            parsed = loadVocabArrayFromFile(absPath);
        } catch (err) {
            skippedFiles++;
            badFiles.push({ file: meta.rel, error: String(err.message || err) });
            continue;
        }
        importedFiles++;
        const words = Array.isArray(parsed.words) ? parsed.words : [];
        for (const raw of words) {
            if (!raw || typeof raw !== "object") {
                skippedWords++;
                continue;
            }
            const word = normalizeSpace(raw.word || raw.standardized);
            if (!word) {
                skippedWords++;
                continue;
            }
            const standardized = normalizeSpace(raw.standardized || raw.word);
            const chinese = normalizeSpace(raw.chinese);
            const phonetic = normalizeSpace(raw.phonetic);
            const phrase = normalizeSpace(raw.phrase);
            const phraseTranslation = normalizeSpace(raw.phraseTranslation);
            const difficulty = normalizeSpace(raw.difficulty);
            const category = normalizeSpace(raw.category);
            const learnType = toLearnType(word, phrase);
            const lemmaKey = toLemmaKey(word, standardized);
            upsertEntryStmt.run(
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
            const row = fetchEntryIdStmt.get(lemmaKey, learnType);
            if (!row) {
                skippedWords++;
                continue;
            }
            const entryId = Number(row.id);
            for (const packId of meta.packs) {
                for (const group of meta.groups) {
                    insertSourceStmt.run(entryId, meta.rel, group, packId, String(manifest.version || ""));
                }
            }

            clearImagesByEntryStmt.run(entryId);
            const images = Array.isArray(raw.imageURLs)
                ? raw.imageURLs
                : (raw.imageUrl ? [{ filename: "", url: raw.imageUrl, type: "default" }] : []);
            let first = true;
            for (const img of images) {
                if (!img || typeof img !== "object") continue;
                const url = normalizeSpace(img.url);
                if (!url) continue;
                insertImageStmt.run(
                    entryId,
                    normalizeSpace(img.filename),
                    url,
                    normalizeSpace(img.type),
                    first ? 1 : 0
                );
                first = false;
            }
            importedWords++;
        }
    }
    db.exec("COMMIT");
} catch (err) {
    db.exec("ROLLBACK");
    throw err;
} finally {
    db.close();
}

const summary = {
    importedFiles,
    skippedFiles,
    importedWords,
    skippedWords,
    missingFiles,
    badFiles
};

const summaryPath = path.resolve(process.cwd(), "words", "db", "reports", "import-summary.json");
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");

console.log("[vocab-db] import done");
console.log(JSON.stringify(summary, null, 2));
