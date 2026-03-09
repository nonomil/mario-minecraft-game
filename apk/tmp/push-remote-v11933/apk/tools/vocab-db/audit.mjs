import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
    openDb,
    initSchema,
    parseManifest,
    reportDir,
    toCsvCell
} from "./shared.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function normalizeSpace(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
}

function splitCsvLike(input) {
    return normalizeSpace(input)
        .split(",")
        .map((v) => normalizeSpace(v))
        .filter(Boolean);
}

function toTimestamp(now = new Date()) {
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function defaultRulesPath() {
    return path.join(__dirname, "rules", "audit-rules.json");
}

function loadRules(rulesPath) {
    const raw = fs.readFileSync(rulesPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid rules json");
    }
    return parsed;
}

function readManifestPackMap() {
    const manifest = parseManifest();
    const map = new Map();
    const packs = Array.isArray(manifest.packs) ? manifest.packs : [];
    for (const pack of packs) {
        const id = String(pack?.id || "");
        if (!id) continue;
        map.set(id, {
            id,
            stage: String(pack?.stage || ""),
            difficulty: normalizeSpace(pack?.difficulty || "")
        });
    }
    return map;
}

function getPackProfile(rules, pack) {
    const profiles = Array.isArray(rules.pack_profiles) ? rules.pack_profiles : [];
    for (const profile of profiles) {
        const reText = String(profile?.pack_pattern || "");
        if (!reText) continue;
        try {
            const re = new RegExp(reText);
            if (re.test(pack)) return profile;
        } catch (_) {
            continue;
        }
    }
    return null;
}

function getDifficultyCompatibilitySet(rules, pack) {
    const configs = Array.isArray(rules.difficulty_compatibility)
        ? rules.difficulty_compatibility
        : [];
    for (const item of configs) {
        const reText = String(item?.pack_pattern || "");
        if (!reText) continue;
        try {
            const re = new RegExp(reText);
            if (!re.test(pack)) continue;
        } catch (_) {
            continue;
        }
        const allowed = Array.isArray(item?.allowed_difficulties)
            ? item.allowed_difficulties.map((v) => normalizeSpace(v).toLowerCase()).filter(Boolean)
            : [];
        return new Set(allowed);
    }
    return null;
}

function hasControlChar(text) {
    return /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text);
}

function hasMojibake(text, markers) {
    if (!text) return false;
    if (text.includes("�")) return true;
    for (const marker of markers) {
        if (text.includes(marker)) return true;
    }
    return false;
}

function hasNonAscii(text) {
    return /[^\x20-\x7E]/.test(text);
}

function isLikelySentenceInWord(text, maxTokens) {
    const tokenCount = normalizeSpace(text).split(" ").filter(Boolean).length;
    return tokenCount > maxTokens || /[!?.,]/.test(text);
}

function phraseTokenCount(phrase) {
    if (!normalizeSpace(phrase)) return 0;
    return normalizeSpace(phrase).split(" ").filter(Boolean).length;
}

function matchesPackFilters(pack, filters) {
    if (!filters || filters.length === 0) return true;
    for (const filter of filters) {
        if (!filter) continue;
        if (filter.startsWith("/") && filter.endsWith("/") && filter.length > 2) {
            try {
                const re = new RegExp(filter.slice(1, -1));
                if (re.test(pack)) return true;
            } catch (_) {
                // ignore bad regex filter
            }
            continue;
        }
        if (pack === filter || pack.startsWith(`${filter}.`)) return true;
    }
    return false;
}

function addFinding(list, finding) {
    list.push({
        entry_id: finding.entry_id,
        lemma_key: finding.lemma_key,
        learn_type: finding.learn_type,
        pack: finding.pack,
        source_files: finding.source_files || [],
        severity: finding.severity,
        rule: finding.rule,
        detail: finding.detail,
        word: finding.word,
        phrase: finding.phrase,
        difficulty: finding.difficulty,
        category: finding.category,
        suggested_action: finding.suggested_action,
        suggested_params: finding.suggested_params || {}
    });
}

const args = parseArgs(process.argv.slice(2));
if (args.help === "true" || args.h === "true") {
    console.log("Usage:");
    console.log("  node tools/vocab-db/audit.mjs [--pack vocab.kindergarten] [--rules tools/vocab-db/rules/audit-rules.json] [--out words/db/reports/audit-report.json]");
    process.exit(0);
}

const rulesPath = path.resolve(process.cwd(), args.rules || defaultRulesPath());
if (!fs.existsSync(rulesPath)) {
    throw new Error(`Rules file not found: ${rulesPath}`);
}
const rules = loadRules(rulesPath);
const packFilters = splitCsvLike(args.pack || "");

const allowedDifficulties = new Set(
    (Array.isArray(rules.allowed_difficulties) ? rules.allowed_difficulties : [])
        .map((v) => normalizeSpace(v).toLowerCase())
        .filter(Boolean)
);
const mojibakeMarkers = Array.isArray(rules?.global?.mojibake_markers)
    ? rules.global.mojibake_markers.map((v) => String(v))
    : [];
const treatEmptyDifficultyAsInvalid = Boolean(rules?.global?.treat_empty_difficulty_as_invalid);
const wordSentenceTokenThreshold = Number(rules?.global?.word_sentence_token_threshold || 4);

const manifestPackMap = readManifestPackMap();
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
      es.source_pack,
      es.source_file
    FROM entries e
    LEFT JOIN entry_sources es ON es.entry_id = e.id
    WHERE e.status='active'
    ORDER BY e.id ASC
`).all();
db.close();

const byEntry = new Map();
for (const row of rows) {
    const id = Number(row.id);
    if (!byEntry.has(id)) {
        byEntry.set(id, {
            id,
            lemma_key: String(row.lemma_key || ""),
            learn_type: String(row.learn_type || ""),
            word: normalizeSpace(row.word || ""),
            standardized: normalizeSpace(row.standardized || ""),
            chinese: normalizeSpace(row.chinese || ""),
            phonetic: normalizeSpace(row.phonetic || ""),
            phrase: normalizeSpace(row.phrase || ""),
            phrase_translation: normalizeSpace(row.phrase_translation || ""),
            difficulty: normalizeSpace(row.difficulty || ""),
            category: normalizeSpace(row.category || ""),
            packs: new Set(),
            source_files_by_pack: new Map()
        });
    }
    const item = byEntry.get(id);
    const pack = normalizeSpace(row.source_pack || "__untracked__");
    const sourceFile = normalizeSpace(row.source_file || "");
    item.packs.add(pack);
    if (!item.source_files_by_pack.has(pack)) {
        item.source_files_by_pack.set(pack, new Set());
    }
    if (sourceFile) item.source_files_by_pack.get(pack).add(sourceFile);
}

const findings = [];
let entriesScanned = 0;

for (const entry of byEntry.values()) {
    for (const pack of entry.packs) {
        if (!matchesPackFilters(pack, packFilters)) continue;
        entriesScanned++;
        const sourceFiles = Array.from(entry.source_files_by_pack.get(pack) || []);
        const profile = getPackProfile(rules, pack);
        const manifestPack = manifestPackMap.get(pack) || null;
        const difficulty = normalizeSpace(entry.difficulty).toLowerCase();
        const word = entry.word;
        const phrase = entry.phrase;

        if (!word) {
            addFinding(findings, {
                entry_id: entry.id,
                lemma_key: entry.lemma_key,
                learn_type: entry.learn_type,
                pack,
                source_files: sourceFiles,
                severity: "BLOCKER",
                rule: "empty_word",
                detail: "word is empty",
                word: entry.word,
                phrase: entry.phrase,
                difficulty: entry.difficulty,
                category: entry.category,
                suggested_action: "deactivate",
                suggested_params: {
                    reason: "empty_word"
                }
            });
        }

        if (hasControlChar(word) || hasControlChar(phrase)) {
            addFinding(findings, {
                entry_id: entry.id,
                lemma_key: entry.lemma_key,
                learn_type: entry.learn_type,
                pack,
                source_files: sourceFiles,
                severity: "BLOCKER",
                rule: "control_character_detected",
                detail: "word or phrase contains control characters",
                word: entry.word,
                phrase: entry.phrase,
                difficulty: entry.difficulty,
                category: entry.category,
                suggested_action: "review",
                suggested_params: {
                    reason: "control_character_detected"
                }
            });
        }

        if (hasMojibake(word, mojibakeMarkers) || hasMojibake(phrase, mojibakeMarkers)) {
            addFinding(findings, {
                entry_id: entry.id,
                lemma_key: entry.lemma_key,
                learn_type: entry.learn_type,
                pack,
                source_files: sourceFiles,
                severity: "BLOCKER",
                rule: "mojibake_text",
                detail: "word or phrase looks like mojibake/encoding corruption",
                word: entry.word,
                phrase: entry.phrase,
                difficulty: entry.difficulty,
                category: entry.category,
                suggested_action: "review",
                suggested_params: {
                    reason: "mojibake_text"
                }
            });
        }

        if (word && hasNonAscii(word)) {
            addFinding(findings, {
                entry_id: entry.id,
                lemma_key: entry.lemma_key,
                learn_type: entry.learn_type,
                pack,
                source_files: sourceFiles,
                severity: "BLOCKER",
                rule: "non_ascii_word",
                detail: "word contains non-ASCII characters",
                word: entry.word,
                phrase: entry.phrase,
                difficulty: entry.difficulty,
                category: entry.category,
                suggested_action: "review",
                suggested_params: {
                    reason: "non_ascii_word"
                }
            });
        }

        if (word && isLikelySentenceInWord(word, wordSentenceTokenThreshold)) {
            addFinding(findings, {
                entry_id: entry.id,
                lemma_key: entry.lemma_key,
                learn_type: entry.learn_type,
                pack,
                source_files: sourceFiles,
                severity: "BLOCKER",
                rule: "sentence_in_word_field",
                detail: `word looks like a sentence (tokenThreshold=${wordSentenceTokenThreshold})`,
                word: entry.word,
                phrase: entry.phrase,
                difficulty: entry.difficulty,
                category: entry.category,
                suggested_action: "review",
                suggested_params: {
                    reason: "sentence_in_word_field"
                }
            });
        }

        if (difficulty) {
            if (allowedDifficulties.size > 0 && !allowedDifficulties.has(difficulty)) {
                addFinding(findings, {
                    entry_id: entry.id,
                    lemma_key: entry.lemma_key,
                    learn_type: entry.learn_type,
                    pack,
                    source_files: sourceFiles,
                    severity: "BLOCKER",
                    rule: "invalid_difficulty",
                    detail: `difficulty="${entry.difficulty}" is not in allowed_difficulties`,
                    word: entry.word,
                    phrase: entry.phrase,
                    difficulty: entry.difficulty,
                    category: entry.category,
                    suggested_action: "update_difficulty",
                    suggested_params: {
                        target_difficulty: manifestPack?.difficulty || "basic"
                    }
                });
            }
        } else if (treatEmptyDifficultyAsInvalid) {
            addFinding(findings, {
                entry_id: entry.id,
                lemma_key: entry.lemma_key,
                learn_type: entry.learn_type,
                pack,
                source_files: sourceFiles,
                severity: "BLOCKER",
                rule: "empty_difficulty",
                detail: "difficulty is empty",
                word: entry.word,
                phrase: entry.phrase,
                difficulty: entry.difficulty,
                category: entry.category,
                suggested_action: "update_difficulty",
                suggested_params: {
                    target_difficulty: manifestPack?.difficulty || "basic"
                }
            });
        }

        const compatibilitySet = getDifficultyCompatibilitySet(rules, pack);
        if (difficulty && compatibilitySet && compatibilitySet.size > 0 && !compatibilitySet.has(difficulty)) {
            addFinding(findings, {
                entry_id: entry.id,
                lemma_key: entry.lemma_key,
                learn_type: entry.learn_type,
                pack,
                source_files: sourceFiles,
                severity: "MAJOR",
                rule: "pack_difficulty_mismatch",
                detail: `entry difficulty="${entry.difficulty}" is not compatible with pack "${pack}"`,
                word: entry.word,
                phrase: entry.phrase,
                difficulty: entry.difficulty,
                category: entry.category,
                suggested_action: "update_difficulty",
                suggested_params: {
                    allowed_difficulties: Array.from(compatibilitySet)
                }
            });
        } else if (
            difficulty &&
            (!compatibilitySet || compatibilitySet.size === 0) &&
            manifestPack?.difficulty &&
            difficulty !== manifestPack.difficulty
        ) {
            addFinding(findings, {
                entry_id: entry.id,
                lemma_key: entry.lemma_key,
                learn_type: entry.learn_type,
                pack,
                source_files: sourceFiles,
                severity: "MAJOR",
                rule: "pack_difficulty_mismatch",
                detail: `entry difficulty="${entry.difficulty}", pack difficulty="${manifestPack.difficulty}"`,
                word: entry.word,
                phrase: entry.phrase,
                difficulty: entry.difficulty,
                category: entry.category,
                suggested_action: "update_difficulty",
                suggested_params: {
                    target_difficulty: manifestPack.difficulty
                }
            });
        }

        if (profile) {
            const hasSpaceInWord = /\s/.test(word);
            const maxWordLength = hasSpaceInWord
                ? Number(profile.max_word_length_with_space || profile.max_word_length || 0)
                : Number(profile.max_word_length_single || profile.max_word_length || 0);
            if (maxWordLength > 0 && word.length >= maxWordLength) {
                addFinding(findings, {
                    entry_id: entry.id,
                    lemma_key: entry.lemma_key,
                    learn_type: entry.learn_type,
                    pack,
                    source_files: sourceFiles,
                    severity: "MAJOR",
                    rule: "word_too_long",
                    detail: `word length ${word.length} >= threshold ${maxWordLength}`,
                    word: entry.word,
                    phrase: entry.phrase,
                    difficulty: entry.difficulty,
                    category: entry.category,
                    suggested_action: "move_pack",
                    suggested_params: {
                        target_pack: profile.move_to_pack_on_complexity || "vocab.elementary_lower"
                    }
                });
            }

            const maxPhraseTokens = Number(profile.max_phrase_tokens || 0);
            const phraseTokens = phraseTokenCount(phrase);
            if (maxPhraseTokens > 0 && phraseTokens >= maxPhraseTokens) {
                addFinding(findings, {
                    entry_id: entry.id,
                    lemma_key: entry.lemma_key,
                    learn_type: entry.learn_type,
                    pack,
                    source_files: sourceFiles,
                    severity: "MAJOR",
                    rule: "phrase_too_long_tokens",
                    detail: `phrase token count ${phraseTokens} >= threshold ${maxPhraseTokens}`,
                    word: entry.word,
                    phrase: entry.phrase,
                    difficulty: entry.difficulty,
                    category: entry.category,
                    suggested_action: "move_pack",
                    suggested_params: {
                        target_pack: profile.move_to_pack_on_complexity || "vocab.elementary_lower"
                    }
                });
            }

            const maxPhraseLength = Number(profile.max_phrase_length || 0);
            if (maxPhraseLength > 0 && phrase.length >= maxPhraseLength) {
                addFinding(findings, {
                    entry_id: entry.id,
                    lemma_key: entry.lemma_key,
                    learn_type: entry.learn_type,
                    pack,
                    source_files: sourceFiles,
                    severity: "MAJOR",
                    rule: "phrase_too_long_chars",
                    detail: `phrase length ${phrase.length} >= threshold ${maxPhraseLength}`,
                    word: entry.word,
                    phrase: entry.phrase,
                    difficulty: entry.difficulty,
                    category: entry.category,
                    suggested_action: "move_pack",
                    suggested_params: {
                        target_pack: profile.move_to_pack_on_complexity || "vocab.elementary_lower"
                    }
                });
            }

            const hasBlocker = findings.some(
                (f) => f.entry_id === entry.id && f.pack === pack && f.severity === "BLOCKER"
            );
            if (!hasBlocker && profile.flag_terminal_punctuation && /[!?]/.test(phrase)) {
                addFinding(findings, {
                    entry_id: entry.id,
                    lemma_key: entry.lemma_key,
                    learn_type: entry.learn_type,
                    pack,
                    source_files: sourceFiles,
                    severity: "MAJOR",
                    rule: "phrase_terminal_punctuation",
                    detail: "phrase includes ! or ?",
                    word: entry.word,
                    phrase: entry.phrase,
                    difficulty: entry.difficulty,
                    category: entry.category,
                    suggested_action: "review",
                    suggested_params: {
                        reason: "phrase_terminal_punctuation"
                    }
                });
            }

            const keywordList = Array.isArray(profile.command_keywords)
                ? profile.command_keywords.map((v) => normalizeSpace(v).toLowerCase()).filter(Boolean)
                : [];
            const commandWhitelist = new Set(
                (Array.isArray(profile.command_keyword_whitelist) ? profile.command_keyword_whitelist : [])
                    .map((v) => normalizeSpace(v).toLowerCase())
                    .filter(Boolean)
            );
            const normalizedWord = normalizeSpace(word).toLowerCase();
            const normalizedLemma = normalizeSpace(entry.lemma_key).toLowerCase();
            const isWhitelisted =
                commandWhitelist.has(normalizedWord) || commandWhitelist.has(normalizedLemma);
            if (keywordList.length > 0 && !isWhitelisted) {
                const haystack = `${word} ${phrase}`.toLowerCase();
                const hit = keywordList.find((kw) => haystack.includes(kw));
                if (hit) {
                    addFinding(findings, {
                        entry_id: entry.id,
                        lemma_key: entry.lemma_key,
                        learn_type: entry.learn_type,
                        pack,
                        source_files: sourceFiles,
                        severity: "MAJOR",
                        rule: "command_or_combat_term",
                        detail: `matched keyword "${hit}"`,
                        word: entry.word,
                        phrase: entry.phrase,
                        difficulty: entry.difficulty,
                        category: entry.category,
                        suggested_action: "move_pack",
                        suggested_params: {
                            target_pack: profile.move_to_pack_on_command || "vocab.minecraft"
                        }
                    });
                }
            }
        }

        if (word && word !== word.toLowerCase() && /^[A-Za-z' -]+$/.test(word)) {
            addFinding(findings, {
                entry_id: entry.id,
                lemma_key: entry.lemma_key,
                learn_type: entry.learn_type,
                pack,
                source_files: sourceFiles,
                severity: "MINOR",
                rule: "word_not_lowercase",
                detail: "word contains uppercase letters",
                word: entry.word,
                phrase: entry.phrase,
                difficulty: entry.difficulty,
                category: entry.category,
                suggested_action: "update_fields",
                suggested_params: {
                    word: word.toLowerCase()
                }
            });
        }
    }
}

const severityOrder = ["BLOCKER", "MAJOR", "MINOR"];
findings.sort((a, b) => {
    const sa = severityOrder.indexOf(a.severity);
    const sb = severityOrder.indexOf(b.severity);
    if (sa !== sb) return sa - sb;
    if (a.pack !== b.pack) return a.pack.localeCompare(b.pack);
    if (a.rule !== b.rule) return a.rule.localeCompare(b.rule);
    if (a.lemma_key !== b.lemma_key) return a.lemma_key.localeCompare(b.lemma_key);
    return a.entry_id - b.entry_id;
});

const bySeverity = {};
const byRule = {};
const byPack = {};
const affectedEntries = new Set();
for (const row of findings) {
    bySeverity[row.severity] = Number(bySeverity[row.severity] || 0) + 1;
    byRule[row.rule] = Number(byRule[row.rule] || 0) + 1;
    byPack[row.pack] = Number(byPack[row.pack] || 0) + 1;
    affectedEntries.add(row.entry_id);
}

const now = new Date();
const timestamp = toTimestamp(now);
let jsonOutPath;
let csvOutPath;
if (args.out) {
    const rawOut = path.resolve(process.cwd(), args.out);
    const base = rawOut.toLowerCase().endsWith(".json") ? rawOut.slice(0, -5) : rawOut;
    jsonOutPath = `${base}.json`;
    csvOutPath = `${base}.csv`;
} else {
    const base = path.join(reportDir, `audit-report-${timestamp}`);
    jsonOutPath = `${base}.json`;
    csvOutPath = `${base}.csv`;
}
fs.mkdirSync(path.dirname(jsonOutPath), { recursive: true });
fs.mkdirSync(path.dirname(csvOutPath), { recursive: true });

const latestJsonPath = path.join(reportDir, "audit-report.json");
const latestCsvPath = path.join(reportDir, "audit-report.csv");

const report = {
    generatedAt: now.toISOString(),
    rulesPath: path.relative(process.cwd(), rulesPath),
    args: {
        pack: args.pack || "",
        out: args.out || "",
        rules: args.rules || ""
    },
    summary: {
        entriesScanned,
        entriesWithFindings: affectedEntries.size,
        totalFindings: findings.length,
        bySeverity,
        byRule,
        byPack
    },
    findings
};

fs.writeFileSync(jsonOutPath, JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(latestJsonPath, JSON.stringify(report, null, 2), "utf8");

const csvHeaders = [
    "entry_id",
    "lemma_key",
    "learn_type",
    "pack",
    "severity",
    "rule",
    "detail",
    "word",
    "phrase",
    "difficulty",
    "category",
    "source_files",
    "suggested_action",
    "suggested_params_json"
];
const csvLines = [csvHeaders.join(",")];
for (const item of findings) {
    const row = [
        item.entry_id,
        item.lemma_key,
        item.learn_type,
        item.pack,
        item.severity,
        item.rule,
        item.detail,
        item.word,
        item.phrase,
        item.difficulty,
        item.category,
        (item.source_files || []).join(";"),
        item.suggested_action,
        JSON.stringify(item.suggested_params || {})
    ];
    csvLines.push(row.map(toCsvCell).join(","));
}
fs.writeFileSync(csvOutPath, `${csvLines.join("\n")}\n`, "utf8");
fs.writeFileSync(latestCsvPath, `${csvLines.join("\n")}\n`, "utf8");

console.log(`[vocab-db] audit report -> ${path.relative(process.cwd(), jsonOutPath)}`);
console.log(`[vocab-db] audit csv -> ${path.relative(process.cwd(), csvOutPath)}`);
console.log(
    JSON.stringify(
        {
            entriesScanned: report.summary.entriesScanned,
            entriesWithFindings: report.summary.entriesWithFindings,
            totalFindings: report.summary.totalFindings,
            bySeverity: report.summary.bySeverity
        },
        null,
        2
    )
);
