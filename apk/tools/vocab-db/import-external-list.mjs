import fs from "fs";
import path from "path";
import {
    openDb,
    initSchema,
    normalizeSpace,
    toLemmaKey,
    toLearnType,
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

    const w = normalizeSpace(normalized);
    if (!w) return "";
    if (/[^a-zA-Z' -]/.test(w)) return "";
    return w;
}

function parseDelimited(line, delimiter, wordCol, chineseCol) {
    const cells = String(line || "").split(delimiter).map((x) => normalizeSpace(x));
    const word = cleanWord(cells[wordCol] || "");
    if (!word) return null;
    const chinese = normalizeSpace(cells[chineseCol] || "");
    return { word, chinese };
}

function parseCsvLine(line) {
    const out = [];
    let cur = "";
    let i = 0;
    let inQuote = false;
    const s = String(line || "");
    while (i < s.length) {
        const ch = s[i];
        if (inQuote) {
            if (ch === '"') {
                if (s[i + 1] === '"') {
                    cur += '"';
                    i += 2;
                    continue;
                }
                inQuote = false;
                i++;
                continue;
            }
            cur += ch;
            i++;
            continue;
        }
        if (ch === '"') {
            inQuote = true;
            i++;
            continue;
        }
        if (ch === ",") {
            out.push(normalizeSpace(cur));
            cur = "";
            i++;
            continue;
        }
        cur += ch;
        i++;
    }
    out.push(normalizeSpace(cur));
    return out;
}

function parseCsvRecord(line, wordCol, chineseCol) {
    const cells = parseCsvLine(line);
    const word = cleanWord(cells[wordCol] || "");
    if (!word) return null;
    const chinese = normalizeSpace(cells[chineseCol] || "");
    return { word, chinese };
}

function parseAutoLine(line) {
    const raw = String(line || "").trim();
    if (!raw || raw.startsWith("#")) return null;
    if (raw.includes("\t")) return parseDelimited(raw, "\t", 0, 1);
    if (raw.includes(",")) return parseDelimited(raw, ",", 0, 1);
    const word = cleanWord(raw);
    if (!word) return null;
    return { word, chinese: "" };
}

const rawArgv = process.argv.slice(2);
const args = parseArgs(rawArgv);
const positionals = rawArgv.filter((token) => !token.startsWith("--"));

const url = normalizeSpace(args.url || "");
const localFile = normalizeSpace(args.file || positionals[0] || "");
if (!url && !localFile) {
    console.error("Usage: node tools/vocab-db/import-external-list.mjs --url <https://...txt> | --file <local.txt>");
    process.exit(1);
}

const sourceFile = normalizeSpace(args.sourceFile || positionals[1] || localFile || url);
const sourcePack = normalizeSpace(args.sourcePack || positionals[2] || "external");
const sourceGroup = normalizeSpace(args.sourceGroup || positionals[3] || "external");
const sourceVersion = normalizeSpace(args.sourceVersion || positionals[4] || "");
const status = normalizeSpace(args.status || positionals[5] || "inactive");
const allowPhrase = parseBool(args.allowPhrase, false);
const dryRun = parseBool(args.dryRun, false);
const maxWords = Math.max(0, Number(args.limit || positionals[4] || 0));
const minLength = Math.max(1, Number(args.minLength || 2));
const maxLength = Math.max(minLength, Number(args.maxLength || 32));
const defaultDifficulty = normalizeSpace(args.difficulty || "external");
const defaultCategory = normalizeSpace(args.category || "external");
const format = normalizeSpace(args.format || "auto").toLowerCase();
const wordCol = Math.max(0, Number(args.wordCol || 0));
const chineseCol = Math.max(0, Number(args.chineseCol || 1));
const delimiter = args.delimiter === "\\t" ? "\t" : String(args.delimiter || ",");
const hasHeader = parseBool(args.hasHeader, false);

let text = "";
if (localFile) {
    const abs = path.resolve(process.cwd(), localFile);
    text = fs.readFileSync(abs, "utf8");
} else {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}, status=${response.status}`);
    }
    text = await response.text();
}
const lines = text.split(/\r?\n/);

const rows = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (hasHeader && i === 0) continue;
    let parsed = null;
    if (format === "auto") parsed = parseAutoLine(line);
    else if (format === "txt") {
        const word = cleanWord(line);
        parsed = word ? { word, chinese: "" } : null;
    } else if (format === "tsv") parsed = parseDelimited(line, "\t", wordCol, chineseCol);
    else if (format === "csv") parsed = delimiter === "," ? parseCsvRecord(line, wordCol, chineseCol) : parseDelimited(line, delimiter, wordCol, chineseCol);
    else throw new Error(`Unsupported format: ${format}`);

    if (!parsed) continue;
    if (!allowPhrase && /\s/.test(parsed.word)) continue;
    if (parsed.word.length < minLength || parsed.word.length > maxLength) continue;
    rows.push(parsed);
    if (maxWords > 0 && rows.length >= maxWords) break;
}

const uniqueRows = [];
const seen = new Set();
for (const row of rows) {
    const key = `${row.word.toLowerCase()}|${toLearnType(row.word, "")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueRows.push(row);
}

const db = openDb();
initSchema(db);

const findAnyStmt = db.prepare(`
    SELECT id, status, chinese FROM entries
    WHERE lemma_key=? AND learn_type=?
    ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, id ASC
    LIMIT 1
`);
const insertEntryStmt = db.prepare(`
    INSERT INTO entries (
        lemma_key, learn_type, word, standardized, chinese, phonetic, phrase, phrase_translation, difficulty, category, status
    ) VALUES (?, ?, ?, ?, ?, '', '', '', ?, ?, ?)
`);
const updateEntryStmt = db.prepare(`
    UPDATE entries
    SET
      chinese = CASE
          WHEN trim(ifnull(chinese, '')) = '' AND trim(ifnull(?, '')) <> '' THEN ?
          ELSE chinese
      END,
      difficulty = CASE
          WHEN trim(ifnull(difficulty, '')) = '' AND trim(ifnull(?, '')) <> '' THEN ?
          ELSE difficulty
      END,
      category = CASE
          WHEN trim(ifnull(category, '')) = '' AND trim(ifnull(?, '')) <> '' THEN ?
          ELSE category
      END,
      updated_at = datetime('now')
    WHERE id = ?
`);
const activateEntryStmt = db.prepare(`
    UPDATE entries
    SET status='active', updated_at=datetime('now')
    WHERE id = ?
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
let updated = 0;
let activated = 0;
let sourceLinked = 0;

if (!dryRun) db.exec("BEGIN");
try {
    for (const token of uniqueRows) {
        const word = normalizeSpace(token.word);
        const chinese = normalizeSpace(token.chinese);
        const learnType = toLearnType(word, "");
        const lemmaKey = toLemmaKey(word, word);
        const existing = findAnyStmt.get(lemmaKey, learnType);
        let entryId = null;

        if (existing) {
            entryId = Number(existing.id);
            if (existing.status === "active") existedActive++;
            else {
                existedInactive++;
                if (!dryRun && status === "active") {
                    const act = activateEntryStmt.run(entryId);
                    if (Number(act.changes || 0) > 0) activated++;
                }
            }
            if (!dryRun) {
                const info = updateEntryStmt.run(
                    chinese,
                    chinese,
                    defaultDifficulty,
                    defaultDifficulty,
                    defaultCategory,
                    defaultCategory,
                    entryId
                );
                if (Number(info.changes || 0) > 0) updated++;
            }
        } else {
            if (!dryRun) {
                const res = insertEntryStmt.run(
                    lemmaKey,
                    learnType,
                    word,
                    word,
                    chinese,
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
    localFile,
    format,
    sourceFile,
    sourceGroup,
    sourcePack,
    sourceVersion,
    status,
    dryRun,
    totalLines: lines.length,
    acceptedWords: rows.length,
    uniqueWords: uniqueRows.length,
    inserted,
    updated,
    activated,
    existedActive,
    existedInactive,
    sourceLinked
};

const safePack = sourcePack.replace(/[^a-zA-Z0-9._-]/g, "_");
const reportPath = path.join(reportDir, `external-import-${safePack}.json`);
fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");

console.log(`[vocab-db] external import report -> ${path.relative(process.cwd(), reportPath)}`);
console.log(JSON.stringify(summary, null, 2));
