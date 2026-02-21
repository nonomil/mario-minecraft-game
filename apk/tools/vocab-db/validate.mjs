import fs from "fs";
import path from "path";
import { openDb, initSchema, reportDir } from "./shared.mjs";

const db = openDb();
initSchema(db);

const total = db.prepare(`SELECT COUNT(*) AS c FROM entries WHERE status='active'`).get().c;
const dupes = db.prepare(`
    SELECT lemma_key, learn_type, COUNT(*) AS c
    FROM entries
    WHERE status='active'
    GROUP BY lemma_key, learn_type
    HAVING COUNT(*) > 1
    ORDER BY c DESC, lemma_key ASC
`).all();
const missingWord = db.prepare(`SELECT id, lemma_key FROM entries WHERE status='active' AND trim(ifnull(word,''))=''`).all();
const missingChinese = db.prepare(`SELECT id, lemma_key FROM entries WHERE status='active' AND trim(ifnull(chinese,''))='' LIMIT 500`).all();

const report = {
    generatedAt: new Date().toISOString(),
    totals: {
        activeEntries: Number(total),
        duplicateKeys: dupes.length,
        missingWord: missingWord.length,
        missingChinese: missingChinese.length
    },
    duplicateRows: dupes,
    missingWordRows: missingWord,
    missingChineseRows: missingChinese
};

const outPath = path.join(reportDir, "validate-report.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
db.close();

console.log(`[vocab-db] active entries: ${report.totals.activeEntries}`);
console.log(`[vocab-db] duplicate keys: ${report.totals.duplicateKeys}`);
console.log(`[vocab-db] missing chinese: ${report.totals.missingChinese}`);
console.log(`[vocab-db] report -> ${path.relative(process.cwd(), outPath)}`);

if (report.totals.duplicateKeys > 0 || report.totals.missingWord > 0 || report.totals.missingChinese > 0) {
    process.exitCode = 1;
}
