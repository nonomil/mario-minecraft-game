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

const cachePath = path.join(apkRoot, "tools", "vocab-db", ".cache", "junior-phrase-cache.json");
const forceAll = process.argv.includes("--force-all");

const fixedPhrase = {
  am: "I am in Grade 8.",
  is: "This is my notebook.",
  are: "They are my classmates.",
  was: "He was late yesterday.",
  were: "We were at school yesterday.",
  be: "Please be quiet in class.",
  a: "I have a pencil.",
  an: "She has an apple.",
  the: "The book is on the desk.",
  and: "I like tea and milk.",
  or: "Do you want rice or noodles?",
  but: "I was tired, but I finished my homework.",
  if: "If it rains, we will stay home.",
  although: "Although it was late, he kept studying.",
  because: "I stayed home because it was raining.",
  with: "I play basketball with my friends.",
  for: "This gift is for you.",
  from: "I am from Shanghai.",
  to: "I go to school by bike.",
  of: "A cup of water is on the table.",
  in: "The pen is in my bag.",
  on: "The cat is on the chair.",
  at: "We meet at the school gate.",
  about: "We are talking about our weekend plan.",
  after: "Let's clean the classroom after school.",
  before: "Wash your hands before dinner.",
  again: "Please say that sentence again.",
  already: "I have already finished my homework.",
  almost: "I am almost ready for the exam.",
  always: "She always arrives at school early.",
  never: "I never eat breakfast too late.",
  often: "We often play football after class.",
  usually: "I usually get up at six.",
  sometimes: "Sometimes I read in the library.",
  very: "The math problem is very difficult.",
  not: "I am not busy this evening.",
  no: "No, I don't think so.",
  yes: "Yes, I can help you.",
  my: "My school bag is blue.",
  your: "Your answer is correct.",
  his: "His bike is new.",
  her: "Her English is very good.",
  our: "Our teacher is very kind.",
  their: "Their classroom is on the third floor.",
  we: "We have a science class today.",
  you: "You can ask me any question.",
  they: "They are practicing for the school show.",
  he: "He plays table tennis very well.",
  she: "She is reading an English story.",
  it: "It is sunny today.",
  this: "This is my first lesson today.",
  that: "That is a useful dictionary.",
  these: "These books belong to me.",
  those: "Those students are from Class 2.",
  who: "Who is your English teacher?",
  whom: "Whom did you invite to the party?",
  whose: "Whose pencil is this?",
  what: "What are you doing now?",
  when: "When will the class begin?",
  where: "Where is the school library?",
  why: "Why are you late today?",
  how: "How do you solve this question?",
  can: "I can finish this task today.",
  could: "Could you open the window?",
  may: "May I come in?",
  might: "It might rain this afternoon.",
  must: "We must wear uniforms at school.",
  should: "You should review your notes tonight.",
  would: "I would like a cup of tea.",
  america: "America is a large country.",
  american: "My American friend studies in our school.",
  asia: "Asia is the largest continent.",
  asian: "We learned about Asian cultures in class.",
  atlantic: "The Atlantic Ocean is very large.",
  april: "Our sports meeting is in April.",
  august: "It is very hot in August.",
  apple: "I eat an apple every morning.",
  article: "I read an article about science.",
  assistant: "The assistant helped the teacher prepare class.",
  among: "She sat among her classmates.",
  anymore: "I don't watch TV much anymore.",
  anyone: "Anyone can ask a question in class.",
  anybody: "Anyone can ask a question in class.",
  anything: "You can ask me anything after class.",
  ancient: "We visited an ancient temple.",
  ant: "An ant is carrying a leaf.",
  queue: "Please stand in a queue.",
  quality: "This product has good quality.",
  radio: "I listen to the radio every morning.",
  railway: "The railway station is near my home.",
  raincoat: "Take a raincoat on rainy days.",
  quite: "The test was quite easy.",
  seldom: "He seldom eats fast food.",
  so: "I was tired, so I went to bed early.",
  somewhere: "I left my keys somewhere in the room.",
  soon: "We will start the meeting soon.",
  southeast: "Our school is in the southeast of the city."
};

const badWordPattern =
  /\b(kill|killed|killing|dead|death|die|gun|blood|murder|suicide|sex|nude|drug|drugs|riot|enemy|war)\b/i;

function normalizeWord(word) {
  return String(word || "").trim();
}

function cleanSentence(text) {
  let s = String(text || "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  s = s.replace(/\s+([,.!?;:])/g, "$1");
  if (!/[.!?]$/.test(s)) s += ".";
  if (s.length > 120) s = `${s.slice(0, 119).trimEnd()}.`;
  return s;
}

function parsePack(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const prefix = content.match(/^([\s\S]*?const\s+[A-Za-z0-9_]+\s*=\s*)\[/);
  const array = content.match(/=\s*(\[[\s\S]*\]);?\s*$/);
  if (!prefix || !array) throw new Error(`Cannot parse file: ${filePath}`);
  return {
    prefix: prefix[1],
    rows: JSON.parse(array[1])
  };
}

function writePack(filePath, prefix, rows) {
  fs.writeFileSync(filePath, `${prefix}${JSON.stringify(rows, null, 2)};\n`, "utf8");
}

function countTokens(sentence) {
  return sentence
    .split(/\s+/)
    .map((t) => t.replace(/[^a-zA-Z'-]/g, ""))
    .filter(Boolean).length;
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

function isBadPhrase(phrase, word) {
  const p = String(phrase || "").trim();
  if (!p) return true;
  const esc = normalizeWord(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (/^Learn the word\b/i.test(p)) return true;
  if (/^Use\b.+\bin a sentence\.?$/i.test(p)) return true;
  if (/^I use the word\b.+\bin a sentence\.?$/i.test(p)) return true;
  if (/^I use\b.+\bdaily life\.?$/i.test(p)) return true;
  if (/^She speaks\b.+\bin class\.?$/i.test(p)) return true;
  if (/^The story is very\b/i.test(p)) return true;
  if (/^I read a short text about .+ in class\.$/i.test(p)) return true;
  if (/^I .+ every day after school\.$/i.test(p)) return true;
  if (/^The weather is .+ today\.$/i.test(p)) return true;
  if (/^Please do the task .+\.$/i.test(p)) return true;
  if (/^The library is .+ the playground\.$/i.test(p)) return true;
  if (/^I have .+ books\.$/i.test(p)) return true;
  if (/^I have .+ pencils\.$/i.test(p)) return true;
  if (/^This gift is for (anyone|anybody|anything)\.?$/i.test(p)) return true;
  if (/^The (cat|bag) is .+ the (table|chair)\.?$/i.test(p)) return true;
  if (/^I eat \w+ anymore\.?$/i.test(p)) return true;
  if (/^The book is \w+\.$/i.test(p)) return true;
  if (/^I want to visit Apple\.$/i.test(p)) return true;
  if (/^This is a?n? \w+\.$/i.test(p)) return true;
  if (/^The word '.+' appears in this sentence\.$/i.test(p)) return true;
  if (/^The new word is .+\.$/i.test(p)) return true;
  if (/^We (learn|talked about) .+ in class today\.$/i.test(p)) return true;
  if (new RegExp(`^${esc}$`, "i").test(p)) return true;
  if (p.includes(";") || p.includes("/")) return true;
  if (!/^[A-Z"']/.test(p)) return true;
  if (badWordPattern.test(p)) return true;
  if (/“|”|‘|’/.test(p)) return true;
  const tokens = countTokens(p);
  if (tokens < 4 || tokens > 16) return true;
  if (/\b[A-Za-z]{11,}\b/.test(p)) return true;
  if (/[,]{2,}|[:]/.test(p)) return true;
  return false;
}

function fallbackPhrase(word, chinese, posHint = "unknown") {
  const w = normalizeWord(word);
  const low = w.toLowerCase();
  if (fixedPhrase[low]) return fixedPhrase[low];

  const pos = posHint !== "unknown" ? posHint : detectPosFromChinese(chinese);
  const article = /^[aeiou]/i.test(low) ? "an" : "a";
  const abstractNoun = /(tion|sion|ment|ness|ity|ship|age|ance|ence|ism)$/i.test(low);
  const properNoun = /^[A-Z]/.test(w);

  switch (pos) {
    case "noun":
      if (properNoun) return `${w} appears in our geography textbook.`;
      if (abstractNoun) return `We discussed ${low} during today's class.`;
      return `I saw ${article} ${low} near the school.`;
    case "verb":
      return `I usually ${low} with my classmates after school.`;
    case "adjective":
      return `The movie was ${low}.`;
    case "adverb":
      return `She answered ${low} in the interview.`;
    case "preposition":
      return `The cat is ${low} the table.`;
    case "conjunction":
      return `I stayed home because it was raining.`;
    case "pronoun":
      return `This gift is for ${low}.`;
    case "number":
      return `I have ${low} notebooks in my bag.`;
    case "auxiliary":
      return `I ${low} finish this work today.`;
    case "article":
      return `She bought ${low} orange at the store.`;
    default:
      if (properNoun) return `${w} is an important name in this lesson.`;
      return `I used the word ${low} in a simple sentence.`;
  }
}

function scorePhrase(phrase, word) {
  const s = cleanSentence(phrase);
  if (!s) return -1e9;
  if (badWordPattern.test(s)) return -1e9;
  const low = word.toLowerCase();
  if (!new RegExp(`\\b${low}\\b`, "i").test(s)) return -1e9;
  const tokens = countTokens(s);
  if (tokens < 4 || tokens > 16) return -1e9;
  const rawTokens = s.split(/\s+/).map((t) => t.replace(/[^A-Za-z'-]/g, "")).filter(Boolean);
  if (rawTokens.some((t) => t.length > 10)) return -1e9;
  if (/[,]{2,}|[:]/.test(s)) return -1e9;
  const uncommonHardWords = /(atmospheric|intolerance|heritage|expediency|uprising|vandalism|deemed|privileges|trenches|foundering)/i;
  if (uncommonHardWords.test(s)) return -1e9;
  if (/“|”|‘|’/.test(s)) return -1e9;
  let score = 0;
  score += 40;
  score += Math.max(0, 20 - Math.abs(tokens - 9) * 2);
  if (/^[A-Z"']/.test(s)) score += 5;
  if (/[.!?]$/.test(s)) score += 5;
  if (/["()[\]{}]/.test(s)) score -= 5;
  if (s.includes(";")) score -= 10;
  if (s.length > 110) score -= 10;
  return score;
}

async function fetchJson(url, timeoutMs = 9000) {
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

async function pickDictionaryPhrase(word) {
  try {
    const payload = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, 9000);
    if (!Array.isArray(payload)) return { phrase: "", pos: "unknown" };
    let bestPhrase = "";
    let bestPos = "unknown";
    let bestScore = -1e9;
    for (const entry of payload) {
      const meanings = Array.isArray(entry?.meanings) ? entry.meanings : [];
      for (const meaning of meanings) {
        const pos = String(meaning?.partOfSpeech || "").toLowerCase() || "unknown";
        const defs = Array.isArray(meaning?.definitions) ? meaning.definitions : [];
        for (const def of defs) {
          const candidate = cleanSentence(def?.example || "");
          const sc = scorePhrase(candidate, word);
          if (sc > bestScore) {
            bestScore = sc;
            bestPhrase = candidate;
            bestPos = pos;
          }
        }
      }
    }
    return { phrase: bestPhrase, pos: bestPos };
  } catch {
    return { phrase: "", pos: "unknown" };
  }
}

async function pickTatoebaPhrase(word) {
  try {
    const url = `https://tatoeba.org/en/api_v0/search?from=eng&to=cmn&query=${encodeURIComponent(word)}&page=1&perPage=20`;
    const payload = await fetchJson(url, 10000);
    const rows = Array.isArray(payload?.results) ? payload.results : [];
    let best = "";
    let bestScore = -1e9;
    for (const row of rows) {
      const candidate = cleanSentence(row?.text || "");
      const sc = scorePhrase(candidate, word);
      if (sc > bestScore) {
        bestScore = sc;
        best = candidate;
      }
    }
    return best;
  } catch {
    return "";
  }
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

async function runPool(items, worker, concurrency = 18) {
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

async function generatePhrase(word, chinese, cache, refresh = false) {
  const low = word.toLowerCase();
  if (fixedPhrase[low]) {
    const out = cleanSentence(fixedPhrase[low]);
    cache[word] = { phrase: out };
    return out;
  }
  if (!refresh && cache[word]?.phrase && !isBadPhrase(cache[word].phrase, word)) {
    return cache[word].phrase;
  }

  const fromDict = await pickDictionaryPhrase(word);
  let phrase = fromDict.phrase;
  if (!phrase) phrase = await pickTatoebaPhrase(word);
  if (!phrase) phrase = fallbackPhrase(word, chinese, fromDict.pos);
  phrase = cleanSentence(phrase);
  if (isBadPhrase(phrase, word)) {
    phrase = cleanSentence(fallbackPhrase(word, chinese, fromDict.pos));
  }
  cache[word] = { phrase };
  return phrase;
}

async function main() {
  const packs = targetFiles.map((file) => ({ file, ...parsePack(file) }));
  const rows = packs.flatMap((p) => p.rows);
  const toFix = rows.filter((r) => forceAll || isBadPhrase(r.phrase, r.word));
  const uniqueWords = [...new Set(toFix.map((r) => normalizeWord(r.word)).filter(Boolean))];
  const sampleByWord = new Map(toFix.map((r) => [normalizeWord(r.word), r]));

  const cache = loadCache();
  let done = 0;
  await runPool(uniqueWords, async (word) => {
    const row = sampleByWord.get(word);
    await generatePhrase(word, row?.chinese || "", cache, true);
    done++;
    if (done % 100 === 0) {
      console.log(`[curate] generated ${done}/${uniqueWords.length}`);
      saveCache(cache);
    }
  });
  saveCache(cache);

  let changed = 0;
  for (const pack of packs) {
    for (const row of pack.rows) {
      const word = normalizeWord(row.word);
      if (!word) continue;
      if (!forceAll && !isBadPhrase(row.phrase, word)) continue;
      row.phrase = cache[word]?.phrase || cleanSentence(fallbackPhrase(word, row.chinese));
      row.phraseTranslation = `例句：${row.phrase}`;
      changed++;
    }
    writePack(pack.file, pack.prefix, pack.rows);
    console.log(`[curate] wrote ${path.relative(apkRoot, pack.file)} rows=${pack.rows.length}`);
  }

  console.log(`[curate] uniqueWords=${uniqueWords.length} changed=${changed}`);
}

await main();
