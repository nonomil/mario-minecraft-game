import fs from "fs";
import path from "path";
import { openDb, initSchema, csvDir, exportDir, toCsvCell } from "./shared.mjs";

const db = openDb();
initSchema(db);

const rows = db.prepare(`
    SELECT
        e.id,
        e.lemma_key,
        e.learn_type,
        e.word,
        e.standardized,
        e.chinese,
        e.phonetic,
        e.phrase,
        e.phrase_translation,
        e.difficulty,
        e.category,
        e.status,
        e.created_at,
        e.updated_at
    FROM entries e
    ORDER BY e.lemma_key ASC
`).all();

const sourceStmt = db.prepare(`
    SELECT source_file, source_group, source_pack
    FROM entry_sources
    WHERE entry_id = ?
    ORDER BY source_file ASC
`);
const imageStmt = db.prepare(`
    SELECT filename, url, type, is_primary
    FROM entry_images
    WHERE entry_id = ?
    ORDER BY is_primary DESC, id ASC
`);

const normalized = rows.map((r) => {
    const sources = sourceStmt.all(r.id);
    const images = imageStmt.all(r.id);
    return {
        id: r.id,
        lemma_key: r.lemma_key,
        learn_type: r.learn_type,
        word: r.word,
        standardized: r.standardized,
        chinese: r.chinese,
        phonetic: r.phonetic,
        phrase: r.phrase,
        phraseTranslation: r.phrase_translation,
        difficulty: r.difficulty,
        category: r.category,
        status: r.status,
        imageURLs: images.map((img) => ({
            filename: img.filename || "",
            url: img.url || "",
            type: img.type || ""
        })),
        sources: sources.map((s) => ({
            source_file: s.source_file,
            source_group: s.source_group,
            source_pack: s.source_pack
        }))
    };
});

const jsOutPath = path.join(exportDir, "vocab_entries.js");
const jsOut = `const VOCAB_DB_ENTRIES = ${JSON.stringify(normalized, null, 2)};\n\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = VOCAB_DB_ENTRIES;\n}\n`;
fs.writeFileSync(jsOutPath, jsOut, "utf8");

const csvHeaders = [
    "id",
    "lemma_key",
    "learn_type",
    "word",
    "standardized",
    "chinese",
    "phonetic",
    "phrase",
    "phraseTranslation",
    "difficulty",
    "category",
    "status",
    "primary_image_url",
    "source_files"
];
const csvLines = [csvHeaders.join(",")];
for (const entry of normalized) {
    const primaryImage = (entry.imageURLs || []).find((img) => img.url) || { url: "" };
    const sourceFiles = Array.from(new Set((entry.sources || []).map((s) => s.source_file))).join(";");
    const values = [
        entry.id,
        entry.lemma_key,
        entry.learn_type,
        entry.word,
        entry.standardized,
        entry.chinese,
        entry.phonetic,
        entry.phrase,
        entry.phraseTranslation,
        entry.difficulty,
        entry.category,
        entry.status,
        primaryImage.url,
        sourceFiles
    ];
    csvLines.push(values.map(toCsvCell).join(","));
}
const csvOutPath = path.join(csvDir, "entries.csv");
fs.writeFileSync(csvOutPath, `${csvLines.join("\n")}\n`, "utf8");

db.close();

console.log(`[vocab-db] exported ${normalized.length} entries`);
console.log(`[vocab-db] js -> ${path.relative(process.cwd(), jsOutPath)}`);
console.log(`[vocab-db] csv -> ${path.relative(process.cwd(), csvOutPath)}`);
