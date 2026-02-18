import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const apkRoot = path.resolve(__dirname, "..", "..");
export const dbDir = path.join(apkRoot, "words", "db");
export const dbPath = path.join(dbDir, "vocab.db");
export const manifestPath = path.join(apkRoot, "words", "vocabs", "manifest.js");
export const schemaPath = path.join(__dirname, "schema.sql");
export const csvDir = path.join(dbDir, "csv");
export const reportDir = path.join(dbDir, "reports");
export const exportDir = path.join(dbDir, "export");

export function ensureDirs() {
    [dbDir, csvDir, reportDir, exportDir].forEach((d) => fs.mkdirSync(d, { recursive: true }));
}

export function openDb() {
    ensureDirs();
    return new DatabaseSync(dbPath);
}

export function initSchema(db) {
    const sql = fs.readFileSync(schemaPath, "utf8");
    db.exec(sql);
}

export function normalizeSpace(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
}

export function toLemmaKey(word, standardized) {
    const base = normalizeSpace(standardized || word).toLowerCase();
    return base;
}

export function toLearnType(word, phrase) {
    const w = normalizeSpace(word);
    const p = normalizeSpace(phrase);
    if (/\s+/.test(w) || /\s+/.test(p)) return "phrase";
    return "word";
}

export function parseManifest() {
    const code = fs.readFileSync(manifestPath, "utf8");
    const sandbox = { window: {}, globalThis: {} };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { filename: manifestPath });
    const manifest = sandbox.window.MMWG_VOCAB_MANIFEST || sandbox.globalThis.MMWG_VOCAB_MANIFEST;
    if (!manifest || !Array.isArray(manifest.packs)) {
        throw new Error("Invalid manifest format: missing MMWG_VOCAB_MANIFEST.packs");
    }
    return manifest;
}

function findArrayAssignment(code) {
    const assignRe = /(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*\[/g;
    const match = assignRe.exec(code);
    if (!match) return null;
    const varName = match[2];
    const bracketStart = code.indexOf("[", match.index);
    if (bracketStart < 0) return null;

    let i = bracketStart;
    let depth = 0;
    let inString = false;
    let quote = "";
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    for (; i < code.length; i++) {
        const ch = code[i];
        const next = i + 1 < code.length ? code[i + 1] : "";

        if (lineComment) {
            if (ch === "\n") lineComment = false;
            continue;
        }
        if (blockComment) {
            if (ch === "*" && next === "/") {
                blockComment = false;
                i++;
            }
            continue;
        }
        if (inString) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === "\\") {
                escaped = true;
                continue;
            }
            if (ch === quote) {
                inString = false;
                quote = "";
            }
            continue;
        }

        if (ch === "/" && next === "/") {
            lineComment = true;
            i++;
            continue;
        }
        if (ch === "/" && next === "*") {
            blockComment = true;
            i++;
            continue;
        }
        if (ch === "'" || ch === '"' || ch === "`") {
            inString = true;
            quote = ch;
            continue;
        }
        if (ch === "[") depth++;
        if (ch === "]") {
            depth--;
            if (depth === 0) {
                const literal = code.slice(bracketStart, i + 1);
                return { varName, arrayLiteral: literal };
            }
        }
    }
    return null;
}

export function loadVocabArrayFromFile(absFilePath) {
    const code = fs.readFileSync(absFilePath, "utf8");
    const found = findArrayAssignment(code);
    if (!found) {
        throw new Error(`Cannot find top-level vocab array assignment in ${absFilePath}`);
    }
    const arrayValue = vm.runInNewContext(`(${found.arrayLiteral})`, {}, { filename: absFilePath });
    if (!Array.isArray(arrayValue)) {
        throw new Error(`Parsed vocab value is not an array in ${absFilePath}`);
    }
    return {
        variableName: found.varName,
        words: arrayValue
    };
}

export function resolveManifestFiles(manifest) {
    const fileMap = new Map();
    for (const pack of manifest.packs) {
        const packId = String(pack.id || "");
        const group = String(pack.stage || "");
        const files = Array.isArray(pack.files) ? pack.files : [];
        for (const relPath of files) {
            const rel = String(relPath || "");
            if (!rel.endsWith(".js")) continue;
            const abs = path.resolve(apkRoot, rel);
            if (!fileMap.has(abs)) {
                fileMap.set(abs, { rel, packs: new Set(), groups: new Set() });
            }
            const item = fileMap.get(abs);
            item.packs.add(packId);
            item.groups.add(group);
        }
    }
    return fileMap;
}

export function toCsvCell(v) {
    const s = String(v ?? "");
    if (!/[",\n]/.test(s)) return s;
    return `"${s.replace(/"/g, '""')}"`;
}
