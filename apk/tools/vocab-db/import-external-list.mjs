import fs from "fs";
import path from "path";
import {
    openDb,
    initSchema,
    normalizeSpace,
    toLemmaKey,
    reportDir
} from "./shared.mjs";

function parseArgs(argv) {
    const out = {};
    for (let i = 0; i < argv.length; i++) {
        const token = argv[i];
        if (!token.startsWith("--")) continue;
        const key = token.slice(2);
        const next = argv[i + 1];
        const value = next && !next.startsWith("--") ? next : "true";
        out[key] = value;
        if (value !== "true") i++;
    }
    return out;
}

function parseBool(raw, fallback = false) {
    if (raw == null) return fallback;
    const v = String(raw).toLowerCase();
    return ["1", "true", "yes", "y", "on"].includes(v);
}

function cleanWord(raw) {
    const normalized = normalizeSpace(raw).replace(/#.*/, "").trim();
    if (!normalized) return "";

    const parts = normalized.split(/\s+/).filter(Boolean);
    const candidate = parts.find((p) => /^[a-zA-Z'-]+$/.test(p)) || normalized;
    const w = normalizeSpace(candidate);
    if (!w) return "";
    if (/[^a-zA-Z' -]/.test(w)) return "";
    return w;
}

const rawArgv = process.argv.slice(2);
const args = parseArgs(rawArgv);
const positionals = rawArgv.filter((token) => !token.startsWith("--"));

const url = normalizeSpace(args.url || positionals[0] || "");
if (!url) {
    console.error("Usage: node tools/vocab-db/import-external-list.mjs --url <https://...txt>");
    process.exit(1);
}

const sourceFile = normalizeSpace(args.sourceFile || positionals[1] || url);
const sourcePack = normalizeSpace(args.sourcePack || positionals[1] || "external");
const sourceGroup = normalizeSpace(args.sourceGroup || positionals[2] || "external");
const sourceVersion = normalizeSpace(args.sourceVersion || positionals[3] || "");
const status = normalizeSpace(args.status || positionals[5] || "inactive");
const allowPhrase = parseBool(args.allowPhrase, false);
const dryRun = parseBool(args.dryRun, false);
const maxWords = Math.max(0, Number(args.limit || positionals[4] || 0));
const minLength = Math.max(1, Number(args.minLength || 2));
const maxLength = Math.max(minLength, Number(args.maxLength || 32));
const defaultDifficulty = normalizeSpace(args.difficulty || "external");
const defaultCategory = normalizeSpace(args.category || "external");

const response = await fetch(url);
if (!response.ok) {
    throw new Error(`Failed to fetch ${url}, status=${response.status}`);
}
const text = await response.text();
const lines = text.split(/\r?\n/);

const words = [];
for (const line of lines) {
    const cleaned = cleanWord(line);
    if (!cleaned) continue;
    if (!allowPhrase && /\s/.test(cleaned)) continue;
    if (cleaned.length < minLength || cleaned.length > maxLength) continue;
    words.push(cleaned);
    if (maxWords > 0 && words.length >= maxWords) break;
}

const uniqueWords = Array.from(new Set(words.map((w) => w.toLowerCase())));
const db = openDb();
initSchema(db);

const findAnyStmt = db.prepare(`
    SELECT id, status FROM entries
    WHERE lemma_key=? AND learn_type='word'
    ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, id ASC
    LIMIT 1
`);
const insertEntryStmt = db.prepare(`
    INSERT INTO entries (
        lemma_key, learn_type, word, standardized, chinese, phonetic, phrase, phrase_translation, difficulty, category, status
    ) VALUES (?, 'word', ?, ?, '', '', '', '', ?, ?, ?)
`);
const insertSourceStmt = db.prepare(`
    INSERT OR IGNORE INTO entry_sources (entry_id, source_file, source_group, source_pack, source_version)
    VALUES (?, ?, ?, ?, ?)
`);
const insertChangeLogStmt = db.prepare(`
    INSERT INTO change_log (entry_id, action, new_value, operator)
    VALUES (?, 'external_import', ?, 'cli')
`);

let inserted = 0;
let existedActive = 0;
let existedInactive = 0;
let sourceLinked = 0;

if (!dryRun) db.exec("BEGIN");
try {
    for (const token of uniqueWords) {
        const word = normalizeSpace(token);
        const lemmaKey = toLemmaKey(word, word);
        const existing = findAnyStmt.get(lemmaKey);
        let entryId = null;

        if (existing) {
            entryId = Number(existing.id);
            if (existing.status === "active") existedActive++;
            else existedInactive++;
        } else {
            if (!dryRun) {
                const res = insertEntryStmt.run(
                    lemmaKey,
                    word,
                    word,
                    defaultDifficulty,
                    defaultCategory,
                    status
                );
                entryId = Number(res.lastInsertRowid);
                insertChangeLogStmt.run(
                    entryId,
                    JSON.stringify({ sourceFile, sourcePack, sourceGroup, word, status })
                );
            }
            inserted++;
        }

        if (entryId && !dryRun) {
            const info = insertSourceStmt.run(entryId, sourceFile, sourceGroup, sourcePack, sourceVersion);
            if (Number(info.changes || 0) > 0) sourceLinked++;
        }
    }
    if (!dryRun) db.exec("COMMIT");
} catch (err) {
    if (!dryRun) db.exec("ROLLBACK");
    throw err;
} finally {
    db.close();
}

const summary = {
    generatedAt: new Date().toISOString(),
    url,
    sourceFile,
    sourceGroup,
    sourcePack,
    sourceVersion,
    status,
    dryRun,
    totalLines: lines.length,
    acceptedWords: words.length,
    uniqueWords: uniqueWords.length,
    inserted,
    existedActive,
    existedInactive,
    sourceLinked
};

const safePack = sourcePack.replace(/[^a-zA-Z0-9._-]/g, "_");
const reportPath = path.join(reportDir, `external-import-${safePack}.json`);
fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");

console.log(`[vocab-db] external import report -> ${path.relative(process.cwd(), reportPath)}`);
console.log(JSON.stringify(summary, null, 2));
