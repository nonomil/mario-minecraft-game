import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apkRoot = path.resolve(__dirname, "..", "..");

const defaultTargets = [
  "words/vocabs/01_\u5e7c\u513f\u56ed/kindergarten_supplement_external_20260221.js",
  "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/elementary_supplement_external_20260221.js"
];

const args = process.argv.slice(2);
const forceAll = args.includes("--force-all");
const targetArgs = args.filter((a) => a !== "--force-all");
const targets = (targetArgs.length ? targetArgs : defaultTargets).map((rel) => path.resolve(apkRoot, rel));

const cachePath = path.join(apkRoot, "tools", "vocab-db", ".cache", "phrase-curate-cache.json");

const fixedPhraseByWord = {
  a: "I have a red pen.",
  about: "Tell me about your school.",
  after: "We play after class.",
  again: "Please say it again.",
  all: "All the children are here.",
  also: "She also likes reading.",
  always: "I always wash my hands.",
  am: "I am happy today.",
  an: "She has an apple.",
  and: "I like apples and bananas.",
  any: "Do you have any questions?",
  are: "They are in the classroom.",
  at: "We meet at the school gate.",
  be: "Be kind to your classmates.",
  before: "Brush your teeth before bed.",
  behind: "The cat is behind the box.",
  between: "The ball is between two chairs.",
  but: "I am tired, but I keep going.",
  by: "I go to school by bus.",
  can: "I can swim.",
  do: "Do your homework on time.",
  does: "She does her homework every day.",
  for: "This gift is for you.",
  from: "I am from China.",
  had: "I had milk for breakfast.",
  has: "She has a blue bag.",
  have: "I have a new pencil.",
  he: "He likes science.",
  her: "Her book is on the desk.",
  here: "Come here, please.",
  him: "I help him after school.",
  his: "His bike is red.",
  i: "I read English every day.",
  in: "The book is in my bag.",
  is: "This is my English book.",
  it: "It is a sunny day.",
  its: "The dog is wagging its tail.",
  me: "Please help me with this question.",
  my: "My name is Lily.",
  no: "No, thank you.",
  not: "I am not late today.",
  of: "A cup of milk is on the table.",
  on: "The pencil is on the desk.",
  or: "Do you want tea or milk?",
  our: "Our class starts at eight.",
  she: "She sings very well.",
  so: "I was tired, so I went home early.",
  than: "My bag is bigger than yours.",
  that: "That is my classroom.",
  the: "The cat is on the chair.",
  their: "Their teacher is very kind.",
  them: "We help them clean the room.",
  there: "There is a tree near our school.",
  these: "These are my books.",
  they: "They play football after school.",
  this: "This is my ruler.",
  those: "Those are tall trees.",
  to: "I go to school every day.",
  under: "The cat is under the table.",
  us: "Our teacher helps us.",
  very: "It is very cold today.",
  was: "He was at home yesterday.",
  we: "We read together every morning.",
  were: "We were at the park yesterday.",
  what: "What is your name?",
  when: "When do you get up?",
  where: "Where is your school?",
  which: "Which book is yours?",
  who: "Who is your English teacher?",
  whose: "Whose pencil is this?",
  why: "Why are you late?",
  with: "I play with my friends.",
  away: "The bird flies away.",
  big: "I see a big dog.",
  blue: "The sky is blue.",
  come: "Come here, please.",
  down: "Please sit down.",
  find: "Can you find your book?",
  funny: "This story is funny.",
  help: "I help my mother.",
  jump: "The rabbit can jump.",
  little: "I have a little toy.",
  look: "Look at the blackboard.",
  make: "I make a paper boat.",
  one: "I have one apple.",
  play: "We play games after class.",
  red: "The apple is red.",
  run: "I run in the park.",
  see: "I can see a bird.",
  three: "I have three pencils.",
  two: "I have two books.",
  up: "Stand up, please.",
  yellow: "The banana is yellow.",
  yes: "Yes, I understand.",
  you: "You are my best friend.",
  your: "Your bag is very nice."
};

function cleanSentence(text) {
  let s = String(text || "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  s = s.replace(/\s+([,.!?;:])/g, "$1");
  if (s.length > 110) s = s.slice(0, 110).trim();
  if (!/[.!?]$/.test(s)) s += ".";
  return s;
}

function normalizeWord(word) {
  return String(word || "").trim();
}

function parsePack(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const prefixMatch = text.match(/^([\s\S]*?const\s+[A-Za-z0-9_]+\s*=\s*)\[/);
  const arrayMatch = text.match(/=\s*(\[[\s\S]*\]);?\s*$/);
  if (!prefixMatch || !arrayMatch) throw new Error(`Cannot parse pack: ${filePath}`);
  return {
    prefix: prefixMatch[1],
    rows: JSON.parse(arrayMatch[1])
  };
}

function writePack(filePath, prefix, rows) {
  fs.writeFileSync(filePath, `${prefix}${JSON.stringify(rows, null, 2)};\n`, "utf8");
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
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf8");
}

function isTemplatePhrase(phrase, word) {
  const p = String(phrase || "").trim();
  const esc = normalizeWord(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!p) return true;
  if (/^Learn the word\b/i.test(p)) return true;
  if (/^Use\b.+\bin a sentence\.?$/i.test(p)) return true;
  if (new RegExp(`^${esc}$`, "i").test(p)) return true;
  if (/^I can see an? \w+\.$/i.test(p)) return true;
  if (/^The story is very \w+\.$/i.test(p)) return true;
  if (/^I use the word .+ in class\.$/i.test(p)) return true;
  if (/^I use .+ in daily life\.$/i.test(p)) return true;
  if (/^The ball is .+ the box\.$/i.test(p)) return true;
  if (/^She speaks .+ in class\.$/i.test(p)) return true;
  if (/^I have .+ books\.$/i.test(p)) return true;
  return false;
}

function detectPosFromChinese(chinese = "") {
  const text = String(chinese || "").toLowerCase();
  const rules = [
    { pos: "noun", pattern: /\bn\./ },
    { pos: "verb", pattern: /\bv\./ },
    { pos: "adjective", pattern: /\badj\./ },
    { pos: "adverb", pattern: /\badv\./ },
    { pos: "preposition", pattern: /\bprep\./ },
    { pos: "conjunction", pattern: /\bconj\./ },
    { pos: "pronoun", pattern: /\bpron\./ },
    { pos: "number", pattern: /\bnum\./ },
    { pos: "auxiliary", pattern: /\baux\./ },
    { pos: "article", pattern: /article/ }
  ];
  let best = { pos: "unknown", idx: Number.MAX_SAFE_INTEGER };
  for (const rule of rules) {
    const idx = text.search(rule.pattern);
    if (idx >= 0 && idx < best.idx) best = { pos: rule.pos, idx };
  }
  return best.pos;
}

function fallbackPhrase(word, chinese, posHint = "unknown") {
  const w = normalizeWord(word);
  const low = w.toLowerCase();
  if (fixedPhraseByWord[low]) return fixedPhraseByWord[low];
  const pos = posHint && posHint !== "unknown" ? posHint : detectPosFromChinese(chinese);
  switch (pos) {
    case "noun":
      return `This is ${/^[aeiou]/i.test(w) ? "an" : "a"} ${low}.`;
    case "verb":
      return `I ${low} every day.`;
    case "adjective":
      return `The book is ${low}.`;
    case "adverb":
      return `Please do it ${low}.`;
    case "preposition":
      return `The cat is ${low} the table.`;
    case "conjunction":
      return `I stayed home because it was raining.`;
    case "pronoun":
      return `This is for ${low}.`;
    case "number":
      return `I have ${low} apples.`;
    case "auxiliary":
      return `I ${low} go now.`;
    case "article":
      return `I have ${low} apple.`;
    default:
      return `We learn the word ${low} today.`;
  }
}

async function fetchJson(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { signal: ctrl.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timer);
  }
}

function scoreSentence(sentence, word) {
  const s = cleanSentence(sentence);
  if (!s) return -1e9;
  const banned = /\b(kill|killed|dead|death|gun|blood|murder|suicide|sex|nude|drug|drugs)\b/i;
  if (banned.test(s)) return -1e9;
  if (!new RegExp(`\\b${word.toLowerCase()}\\b`, "i").test(s)) return -1e9;
  const tokens = s.split(/\s+/).map((t) => t.replace(/[^a-zA-Z'-]/g, "")).filter(Boolean);
  if (tokens.length < 4 || tokens.length > 14) return -1e9;
  const longWords = tokens.filter((t) => t.length > 9).length;
  let score = 0;
  score += 40;
  score += Math.max(0, 18 - Math.abs(tokens.length - 8) * 2);
  score -= longWords * 4;
  if (/^[A-Z]/.test(s)) score += 5;
  if (/[.!?]$/.test(s)) score += 4;
  if (/[(){}[\]"]/g.test(s)) score -= 6;
  return score;
}

function pickDictionaryExample(word, payload) {
  if (!Array.isArray(payload)) return { phrase: "", pos: "unknown" };
  let bestPhrase = "";
  let bestScore = -1e9;
  let bestPos = "unknown";
  for (const entry of payload) {
    const meanings = Array.isArray(entry?.meanings) ? entry.meanings : [];
    for (const meaning of meanings) {
      const pos = String(meaning?.partOfSpeech || "").toLowerCase() || "unknown";
      const defs = Array.isArray(meaning?.definitions) ? meaning.definitions : [];
      for (const def of defs) {
        const ex = cleanSentence(def?.example || "");
        const score = scoreSentence(ex, word);
        if (score > bestScore) {
          bestScore = score;
          bestPhrase = ex;
          bestPos = pos;
        }
      }
    }
  }
  return { phrase: bestPhrase, pos: bestPos };
}

async function pickTatoebaExample(word) {
  const url = `https://tatoeba.org/en/api_v0/search?from=eng&to=cmn&query=${encodeURIComponent(word)}&page=1&perPage=20`;
  try {
    const payload = await fetchJson(url, 10000);
    const rows = Array.isArray(payload?.results) ? payload.results : [];
    let bestPhrase = "";
    let bestScore = -1e9;
    for (const row of rows) {
      const phrase = cleanSentence(row?.text || "");
      const score = scoreSentence(phrase, word);
      if (score > bestScore) {
        bestScore = score;
        bestPhrase = phrase;
      }
    }
    return bestPhrase;
  } catch {
    return "";
  }
}

async function resolvePhrase(word, chinese, cache, refresh = false) {
  if (!refresh && cache[word]?.phrase) return cache[word].phrase;
  const low = word.toLowerCase();
  if (fixedPhraseByWord[low]) {
    const phrase = cleanSentence(fixedPhraseByWord[low]);
    cache[word] = { phrase };
    return phrase;
  }

  let phrase = "";
  let pos = "unknown";
  try {
    const dict = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, 8000);
    const picked = pickDictionaryExample(word, dict);
    phrase = picked.phrase;
    pos = picked.pos || "unknown";
  } catch {
    phrase = "";
  }
  if (!phrase) phrase = await pickTatoebaExample(word);
  if (!phrase) phrase = fallbackPhrase(word, chinese, pos);
  phrase = cleanSentence(phrase);
  cache[word] = { phrase };
  return phrase;
}

async function runPool(items, worker, concurrency = 20) {
  const queue = [...items];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const item = queue.shift();
      if (item === undefined) return;
      await worker(item);
    }
  });
  await Promise.all(workers);
}

async function main() {
  for (const file of targets) {
    if (!fs.existsSync(file)) throw new Error(`Missing target file: ${file}`);
  }

  const packs = targets.map((file) => ({ file, ...parsePack(file) }));
  const allRows = packs.flatMap((p) => p.rows);
  const rowsToFix = allRows.filter((r) => forceAll || isTemplatePhrase(r.phrase, r.word));
  const uniqueWords = [...new Set(rowsToFix.map((r) => normalizeWord(r.word)).filter(Boolean))];
  const cache = loadCache();

  let done = 0;
  await runPool(uniqueWords, async (word) => {
    const sample = rowsToFix.find((r) => normalizeWord(r.word) === word);
    await resolvePhrase(word, sample?.chinese || "", cache, forceAll);
    done++;
    if (done % 100 === 0) {
      console.log(`[curate] fetched ${done}/${uniqueWords.length}`);
      saveCache(cache);
    }
  });
  saveCache(cache);

  let changed = 0;
  for (const pack of packs) {
    for (const row of pack.rows) {
      const word = normalizeWord(row.word);
      if (!word) continue;
      if (!forceAll && !isTemplatePhrase(row.phrase, word)) continue;
      row.phrase = cache[word]?.phrase || fallbackPhrase(word, row.chinese);
      row.phraseTranslation = `例句：${row.phrase}`;
      changed++;
    }
    writePack(pack.file, pack.prefix, pack.rows);
    console.log(`[curate] wrote ${path.relative(apkRoot, pack.file)} rows=${pack.rows.length}`);
  }

  console.log(
    `[curate] targets=${packs.length} rowsToFix=${rowsToFix.length} uniqueWords=${uniqueWords.length} changed=${changed}`
  );
}

await main();
