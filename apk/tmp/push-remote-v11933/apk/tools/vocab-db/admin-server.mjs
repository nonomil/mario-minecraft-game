import fs from "fs";
import path from "path";
import http from "http";
import { openDb, initSchema } from "./shared.mjs";

function parseArgs(argv) {
    const out = { port: 4174 };
    for (let i = 0; i < argv.length; i++) {
        const token = argv[i];
        if (token === "--help" || token === "-h") out.help = true;
        if (token === "--port" && i + 1 < argv.length) {
            out.port = Number(argv[++i]) || out.port;
        }
    }
    return out;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
    console.log("Usage: node tools/vocab-db/admin-server.mjs [--port 4174]");
    process.exit(0);
}

const htmlPath = path.join(process.cwd(), "tools", "vocab-db", "admin.html");
const html = fs.readFileSync(htmlPath, "utf8");

const db = openDb();
initSchema(db);

function json(res, code, payload) {
    res.statusCode = code;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
            if (data.length > 2 * 1024 * 1024) {
                reject(new Error("body too large"));
            }
        });
        req.on("end", () => {
            if (!data) return resolve({});
            try {
                resolve(JSON.parse(data));
            } catch (err) {
                reject(err);
            }
        });
        req.on("error", reject);
    });
}

function normalizeSpace(v) {
    return String(v || "").trim().replace(/\s+/g, " ");
}

function lemmaKey(word, standardized) {
    return normalizeSpace(standardized || word).toLowerCase();
}

function inferLearnType(word, phrase) {
    const w = normalizeSpace(word);
    const p = normalizeSpace(phrase);
    if (/\s+/.test(w) || /\s+/.test(p)) return "phrase";
    return "word";
}

const selectListStmt = db.prepare(`
    SELECT id, lemma_key, learn_type, word, standardized, chinese, phrase, phrase_translation, difficulty, category, status, updated_at
    FROM entries
    WHERE
      (? = '' OR lemma_key LIKE '%' || ? || '%' OR word LIKE '%' || ? || '%' OR chinese LIKE '%' || ? || '%')
      AND (? = 'all' OR status = ?)
    ORDER BY updated_at DESC, id DESC
    LIMIT ? OFFSET ?
`);
const countListStmt = db.prepare(`
    SELECT COUNT(*) AS c
    FROM entries
    WHERE
      (? = '' OR lemma_key LIKE '%' || ? || '%' OR word LIKE '%' || ? || '%' OR chinese LIKE '%' || ? || '%')
      AND (? = 'all' OR status = ?)
`);
const statsStmt = db.prepare(`
    SELECT
      SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active_count,
      SUM(CASE WHEN status='inactive' THEN 1 ELSE 0 END) AS inactive_count,
      COUNT(*) AS total_count
    FROM entries
`);
const byIdStmt = db.prepare(`SELECT * FROM entries WHERE id = ?`);
const deactivateStmt = db.prepare(`UPDATE entries SET status='inactive', updated_at=datetime('now') WHERE id=?`);
const reactivateStmt = db.prepare(`UPDATE entries SET status='active', updated_at=datetime('now') WHERE id=?`);
const upsertStmt = db.prepare(`
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
`);
const getByKeyStmt = db.prepare(`SELECT id FROM entries WHERE lemma_key=? AND learn_type=? AND status='active' LIMIT 1`);
const insertLogStmt = db.prepare(`INSERT INTO change_log (entry_id, action, old_value, new_value, operator) VALUES (?, ?, ?, ?, ?)`);

const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
        if (req.method === "GET" && url.pathname === "/") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
            return;
        }
        if (req.method === "GET" && url.pathname === "/api/stats") {
            return json(res, 200, statsStmt.get());
        }
        if (req.method === "GET" && url.pathname === "/api/entries") {
            const q = normalizeSpace(url.searchParams.get("q") || "");
            const status = normalizeSpace(url.searchParams.get("status") || "active");
            const limit = Math.min(500, Math.max(1, Number(url.searchParams.get("limit") || 100)));
            const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
            const rows = selectListStmt.all(q, q, q, q, status, status, limit, offset);
            const total = countListStmt.get(q, q, q, q, status, status)?.c || 0;
            return json(res, 200, { total, rows });
        }
        if (req.method === "POST" && url.pathname === "/api/entry/upsert") {
            const body = await readBody(req);
            const word = normalizeSpace(body.word);
            if (!word) return json(res, 400, { error: "word is required" });
            const standardized = normalizeSpace(body.standardized || word);
            const phrase = normalizeSpace(body.phrase);
            const learnType = normalizeSpace(body.learn_type || inferLearnType(word, phrase));
            const key = lemmaKey(word, standardized);

            const oldRow = getByKeyStmt.get(key, learnType);
            const oldVal = oldRow ? JSON.stringify(byIdStmt.get(oldRow.id)) : null;
            upsertStmt.run(
                key,
                learnType,
                word,
                standardized,
                normalizeSpace(body.chinese),
                normalizeSpace(body.phonetic),
                phrase,
                normalizeSpace(body.phrase_translation || body.phraseTranslation),
                normalizeSpace(body.difficulty),
                normalizeSpace(body.category)
            );
            const newId = getByKeyStmt.get(key, learnType)?.id || null;
            const newVal = newId ? JSON.stringify(byIdStmt.get(newId)) : null;
            insertLogStmt.run(newId, "upsert", oldVal, newVal, "admin");
            return json(res, 200, { ok: true, id: newId });
        }
        if (req.method === "POST" && url.pathname === "/api/entry/deactivate") {
            const body = await readBody(req);
            const id = Number(body.id || 0);
            if (!id) return json(res, 400, { error: "id is required" });
            const oldVal = JSON.stringify(byIdStmt.get(id) || null);
            deactivateStmt.run(id);
            const newVal = JSON.stringify(byIdStmt.get(id) || null);
            insertLogStmt.run(id, "deactivate", oldVal, newVal, "admin");
            return json(res, 200, { ok: true, id });
        }
        if (req.method === "POST" && url.pathname === "/api/entry/reactivate") {
            const body = await readBody(req);
            const id = Number(body.id || 0);
            if (!id) return json(res, 400, { error: "id is required" });
            const row = byIdStmt.get(id);
            if (!row) return json(res, 404, { error: "entry not found" });
            const conflict = getByKeyStmt.get(row.lemma_key, row.learn_type);
            if (conflict && Number(conflict.id) !== id) {
                return json(res, 409, { error: "active entry with same key/type exists" });
            }
            const oldVal = JSON.stringify(row);
            reactivateStmt.run(id);
            const newVal = JSON.stringify(byIdStmt.get(id) || null);
            insertLogStmt.run(id, "reactivate", oldVal, newVal, "admin");
            return json(res, 200, { ok: true, id });
        }
        json(res, 404, { error: "not found" });
    } catch (err) {
        json(res, 500, { error: String(err?.message || err) });
    }
});

server.listen(args.port, () => {
    console.log(`[vocab-db] admin server running at http://127.0.0.1:${args.port}`);
});

process.on("SIGINT", () => {
    db.close();
    server.close(() => process.exit(0));
});
