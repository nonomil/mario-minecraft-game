import fs from "fs";
import path from "path";
import {
    apkRoot,
    manifestPath,
    openDb,
    initSchema,
    normalizeSpace
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

function parseBool(v, fallback = false) {
    if (v == null) return fallback;
    return ["1", "true", "yes", "on", "y"].includes(String(v).toLowerCase());
}

function ensureDir(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

const args = parseArgs(process.argv.slice(2));
const sourcePack = normalizeSpace(args.sourcePack || "");
const packId = normalizeSpace(args.packId || "");
const title = normalizeSpace(args.title || "");
const stage = normalizeSpace(args.stage || "");
const level = normalizeSpace(args.level || "full");
const difficulty = normalizeSpace(args.difficulty || "intermediate");
const relOutput = normalizeSpace(args.output || "");
const varName = normalizeSpace(args.varName || "STAGE_CUSTOM");
const weight = Number(args.weight || 1);
const updateManifest = parseBool(args.updateManifest, true);

if (!sourcePack || !packId || !title || !stage || !relOutput) {
    console.error("Usage:");
    console.error("  node tools/vocab-db/export-pack.mjs --sourcePack <id> --packId <vocab.xxx> --title <name> --stage <stage> --output <words/vocabs/...js> [--varName STAGE_XXX] [--level full] [--difficulty intermediate] [--updateManifest true]");
    process.exit(1);
}

const db = openDb();
initSchema(db);

const entries = db.prepare(`
    SELECT DISTINCT
      e.id,
      e.word,
      e.standardized,
      e.chinese,
      e.phonetic,
      e.phrase,
      e.phrase_translation,
      e.difficulty,
      e.category
    FROM entries e
    INNER JOIN entry_sources s ON s.entry_id = e.id
    WHERE e.status='active' AND s.source_pack = ?
    ORDER BY e.lemma_key ASC
`).all(sourcePack);

const imgStmt = db.prepare(`
    SELECT filename, url, type
    FROM entry_images
    WHERE entry_id = ?
    ORDER BY is_primary DESC, id ASC
`);

const words = entries.map((e) => {
    const images = imgStmt.all(e.id).map((img) => ({
        filename: normalizeSpace(img.filename),
        url: normalizeSpace(img.url),
        type: normalizeSpace(img.type)
    })).filter((img) => img.url);
    return {
        word: normalizeSpace(e.word),
        standardized: normalizeSpace(e.standardized || e.word),
        chinese: normalizeSpace(e.chinese),
        phonetic: normalizeSpace(e.phonetic),
        phrase: normalizeSpace(e.phrase),
        phraseTranslation: normalizeSpace(e.phrase_translation),
        difficulty: normalizeSpace(e.difficulty || difficulty),
        category: normalizeSpace(e.category || "junior_high"),
        stage,
        imageURLs: images
    };
}).filter((w) => w.word);

db.close();

const absOutput = path.resolve(apkRoot, relOutput);
ensureDir(absOutput);

const js = `// Auto-generated from vocab-db source_pack=${sourcePack}\nconst ${varName} = ${JSON.stringify(words, null, 2)};\n`;
fs.writeFileSync(absOutput, js, "utf8");
console.log(`[vocab-db] exported pack words=${words.length} -> ${path.relative(apkRoot, absOutput)}`);

if (!updateManifest) {
    process.exit(0);
}

const relForManifest = path.relative(apkRoot, absOutput).replace(/\\/g, "/");
const manifestCode = fs.readFileSync(manifestPath, "utf8");
if (manifestCode.includes(`id: "${packId}"`)) {
    console.log(`[vocab-db] manifest already has pack: ${packId}`);
    process.exit(0);
}

const insertAt = manifestCode.lastIndexOf("\n  ];");
if (insertAt < 0) {
    throw new Error("Cannot locate packs array end in manifest.js");
}

const block = `
    {
      id: "${packId}",
      title: "${title}",
      stage: "${stage}",
      difficulty: "${difficulty}",
      level: "${level}",
      weight: ${Number.isFinite(weight) ? weight : 1},
      files: [
        "${relForManifest}",
      ],
      getRaw() {
        return [
          ...(typeof ${varName} !== "undefined" ? ${varName} : []),
        ];
      }
    },`;

const nextManifest = manifestCode.slice(0, insertAt) + block + manifestCode.slice(insertAt);
fs.writeFileSync(manifestPath, nextManifest, "utf8");
console.log(`[vocab-db] manifest appended pack: ${packId}`);
