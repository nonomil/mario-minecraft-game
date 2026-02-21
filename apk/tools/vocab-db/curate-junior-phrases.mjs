import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apkRoot = path.resolve(__dirname, "..", "..");

const targetFiles = [
    "words/vocabs/05_初中/junior_high_basic.js",
    "words/vocabs/05_初中/junior_high_intermediate.js",
    "words/vocabs/05_初中/junior_high_advanced.js",
    "words/vocabs/05_初中/junior_high_full.js"
].map((rel) => path.join(apkRoot, rel));

const cachePath = path.join(apkRoot, "words", "vocabs", "_junior_phrase_curate_cache.json");

function parseJsArray(fileContent) {
    const m = fileContent.match(/=\s*(\[[\s\S]*\]);?\s*$/);
    if (!m) throw new Error("Cannot parse JS vocab array");
    return JSON.parse(m[1]);
}

function readPack(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const prefixMatch = content.match(/^([\s\S]*?const\s+[A-Za-z0-9_]+\s*=\s*)\[/);
    if (!prefixMatch) throw new Error(`Cannot parse JS prefix: ${filePath}`);
    return {
        prefix: prefixMatch[1],
        rows: parseJsArray(content)
    };
}

function writePack(filePath, prefix, rows) {
    fs.writeFileSync(filePath, `${prefix}${JSON.stringify(rows, null, 2)};\n`, "utf8");
}

function normalizeWord(w) {
    return String(w || "").trim();
}

function cleanSentence(text) {
    let s = String(text || "").replace(/\s+/g, " ").trim();
    if (!s) return "";
    if (s.length > 120) s = s.slice(0, 120).trim();
    if (!/[.!?]$/.test(s)) s += ".";
    s = s.replace(/\s+([,.!?;:])/g, "$1");
    return s;
}

function chooseBestExample(word, payload) {
    if (!Array.isArray(payload)) return "";
    const low = word.toLowerCase();
    const cands = [];
    for (const entry of payload) {
        const meanings = Array.isArray(entry?.meanings) ? entry.meanings : [];
        for (const meaning of meanings) {
            const defs = Array.isArray(meaning?.definitions) ? meaning.definitions : [];
            for (const def of defs) {
                const ex = cleanSentence(def?.example || "");
                if (!ex) continue;
                cands.push(ex);
            }
        }
    }
    if (!cands.length) return "";
    let best = cands[0];
    let bestScore = -1e9;
    for (const ex of cands) {
        let score = 0;
        const l = ex.toLowerCase();
        if (new RegExp(`\\b${low}\\b`, "i").test(ex)) score += 50;
        if (l.includes(low)) score += 20;
        const len = ex.length;
        if (len >= 14 && len <= 80) score += 20;
        if (len > 100) score -= 10;
        if (/["()]/.test(ex)) score -= 4;
        if (/[{}[\]]/.test(ex)) score -= 4;
        if (score > bestScore) {
            bestScore = score;
            best = ex;
        }
    }
    return best;
}

function detectPosFromChinese(chinese = "") {
    const text = String(chinese || "").toLowerCase();
    if (/\bn\./.test(text)) return "noun";
    if (/\bv\./.test(text)) return "verb";
    if (/\badj\./.test(text)) return "adjective";
    if (/\badv\./.test(text)) return "adverb";
    if (/\bprep\./.test(text)) return "preposition";
    if (/\bconj\./.test(text)) return "conjunction";
    if (/\bpron\./.test(text)) return "pronoun";
    if (/\bnum\./.test(text)) return "number";
    if (/\baux\./.test(text)) return "auxiliary";
    return "unknown";
}

function fallbackPhrase(word, chinese) {
    const w = normalizeWord(word);
    const pos = detectPosFromChinese(chinese);
    const article = /^[aeiou]/i.test(w) ? "an" : "a";
    switch (pos) {
        case "noun":
            return `This is ${article} ${w}.`;
        case "verb":
            return `We often ${w} after school.`;
        case "adjective":
            return `The movie is very ${w}.`;
        case "adverb":
            return `She speaks ${w} in class.`;
        case "preposition":
            return `The bag is ${w} the chair.`;
        case "conjunction":
            return `I stayed home because it was raining.`;
        case "pronoun":
            return `This gift is for ${w}.`;
        case "number":
            return `I have ${w} books.`;
        case "auxiliary":
            return `I ${w} finish my homework today.`;
        default:
            return `I use ${w} in daily life.`;
    }
}

async function fetchJson(url, timeoutMs = 5000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const resp = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
}

async function fetchExampleForWord(word) {
    const u = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    try {
        const payload = await fetchJson(u, 5000);
        return chooseBestExample(word, payload);
    } catch {
        try {
            const payload = await fetchJson(u, 7000);
            return chooseBestExample(word, payload);
        } catch {
            return "";
        }
    }
}

async function runPool(items, worker, concurrency = 8) {
    const q = [...items];
    const runners = [];
    for (let i = 0; i < concurrency; i++) {
        runners.push((async () => {
            while (q.length) {
                const item = q.shift();
                await worker(item);
            }
        })());
    }
    await Promise.all(runners);
}

function loadCache() {
    if (!fs.existsSync(cachePath)) return {};
    try {
        return JSON.parse(fs.readFileSync(cachePath, "utf8"));
    } catch {
        return {};
    }
}

function saveCache(cache) {
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf8");
}

function phraseLooksGeneric(phrase, word) {
    const p = String(phrase || "").trim();
    const w = normalizeWord(word);
    if (!p) return true;
    if (/^Learn the word\b/i.test(p)) return true;
    if (new RegExp(`^Use\\s+${w}\\s+in a sentence\\.?$`, "i").test(p)) return true;
    if (/^This is a?n? \w+\.$/i.test(p)) return true;
    if (/^I use \w+ in daily life\.$/i.test(p)) return true;
    if (/^We often \w+ after school\.$/i.test(p)) return true;
    return false;
}

async function main() {
    const packs = targetFiles.map((f) => ({ file: f, ...readPack(f) }));
    const rows = packs.flatMap((p) => p.rows);
    const uniqueWords = [...new Set(rows.map((r) => normalizeWord(r.word)).filter(Boolean))];

    const cache = loadCache();
    let requested = 0;
    let translated = 0;

    await runPool(uniqueWords, async (word) => {
        if (cache[word]?.phrase && cache[word]?.phraseZh) return;
        const example = await fetchExampleForWord(word);
        const phrase = example || fallbackPhrase(word, "");
        cache[word] = {
            phrase: cleanSentence(phrase),
            phraseZh: `例句：${cleanSentence(phrase)}`
        };
        requested++;
        if (requested % 50 === 0) {
            console.log(`[curate] processed words: ${requested}/${uniqueWords.length}`);
            saveCache(cache);
        }
    }, 20);

    saveCache(cache);

    let changed = 0;
    for (const pack of packs) {
        for (const item of pack.rows) {
            const word = normalizeWord(item.word);
            if (!word) continue;
            if (!phraseLooksGeneric(item.phrase, word)) continue;
            const hit = cache[word];
            if (!hit?.phrase) continue;
            item.phrase = hit.phrase;
            item.phraseTranslation = hit.phraseZh || `例句：${hit.phrase}`;
            changed++;
        }
        writePack(pack.file, pack.prefix, pack.rows);
        console.log(`[curate] wrote ${path.relative(apkRoot, pack.file)} rows=${pack.rows.length}`);
    }

    console.log(`[curate] uniqueWords=${uniqueWords.length} requested=${requested} translated=${translated} changed=${changed}`);
}

await main();
