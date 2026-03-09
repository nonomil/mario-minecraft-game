import fs from "fs";
import path from "path";
import { openDb, initSchema, reportDir } from "./shared.mjs";

const db = openDb();
initSchema(db);

const exactDupes = db.prepare(`
  SELECT lemma_key, learn_type, COUNT(*) AS cnt
  FROM entries
  WHERE status='active'
  GROUP BY lemma_key, learn_type
  HAVING COUNT(*) > 1
  ORDER BY cnt DESC, lemma_key ASC
`).all();

const multiSource = db.prepare(`
  SELECT e.id, e.lemma_key, e.learn_type, e.word, e.chinese, COUNT(es.id) AS source_count
  FROM entries e
  LEFT JOIN entry_sources es ON es.entry_id = e.id
  WHERE e.status='active'
  GROUP BY e.id
  HAVING COUNT(es.id) > 1
  ORDER BY source_count DESC, e.lemma_key ASC
  LIMIT 2000
`).all();

const compactCollisions = db.prepare(`
  SELECT
    lower(replace(replace(replace(lemma_key, ' ', ''), '-', ''), '_', '')) AS compact_key,
    COUNT(*) AS cnt,
    group_concat(id) AS ids
  FROM entries
  WHERE status='active'
  GROUP BY compact_key
  HAVING COUNT(*) > 1
  ORDER BY cnt DESC, compact_key ASC
  LIMIT 2000
`).all();

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    exactDuplicateKeys: exactDupes.length,
    multiSourceEntries: multiSource.length,
    compactCollisions: compactCollisions.length
  },
  exactDupes,
  multiSource,
  compactCollisions
};

const outPath = path.join(reportDir, "dedup-report.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
db.close();

console.log(`[vocab-db] dedup report -> ${path.relative(process.cwd(), outPath)}`);
console.log(JSON.stringify(report.summary, null, 2));
