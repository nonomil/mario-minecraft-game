import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function loadKindergartenHanzi() {
  const context = {
    console,
    window: {},
    module: { exports: {} },
    exports: {}
  };
  vm.createContext(context);
  vm.runInContext(read("words/vocabs/06_汉字/幼儿园汉字.js"), context, {
    filename: "words/vocabs/06_汉字/幼儿园汉字.js"
  });
  return vm.runInContext("kindergartenHanzi", context);
}

const TONE_MAP = new Map([
  ["ā", "a"], ["á", "a"], ["ǎ", "a"], ["à", "a"],
  ["ē", "e"], ["é", "e"], ["ě", "e"], ["è", "e"],
  ["ī", "i"], ["í", "i"], ["ǐ", "i"], ["ì", "i"],
  ["ō", "o"], ["ó", "o"], ["ǒ", "o"], ["ò", "o"],
  ["ū", "u"], ["ú", "u"], ["ǔ", "u"], ["ù", "u"],
  ["ǖ", "ü"], ["ǘ", "ü"], ["ǚ", "ü"], ["ǜ", "ü"]
]);

const INITIALS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "r", "z", "c", "s", "y", "w"];
const NEAR_INITIALS = {
  b: ["p"],
  p: ["b"],
  d: ["t"],
  t: ["d"],
  g: ["k"],
  k: ["g"],
  zh: ["z", "ch"],
  ch: ["zh", "c"],
  sh: ["s"],
  z: ["zh", "c"],
  c: ["ch", "z"],
  s: ["sh"],
  n: ["l"],
  l: ["n", "r"],
  r: ["l"],
  j: ["q", "x"],
  q: ["j", "x"],
  x: ["j", "q"],
  f: ["h"],
  h: ["f"]
};

function stripTone(pinyin) {
  return [...String(pinyin || "")]
    .map((char) => TONE_MAP.get(char) || char)
    .join("")
    .replace(/ü/g, "ü");
}

function splitInitial(base) {
  const lower = String(base || "");
  for (const initial of INITIALS) {
    if (lower.startsWith(initial)) {
      return { initial, rest: lower.slice(initial.length) };
    }
  }
  return { initial: "", rest: lower };
}

function buildNearPhones(base, baseIndex) {
  const { initial, rest } = splitInitial(base);
  const near = new Set();
  const candidates = NEAR_INITIALS[initial] || [];
  for (const alt of candidates) {
    const candidate = `${alt}${rest}`;
    if (baseIndex.has(candidate)) near.add(candidate);
  }
  return Array.from(near).slice(0, 3);
}

function buildEntry(entry, homophones, nearPhones) {
  const pinyin = String(entry.pinyin || "").trim();
  const base = stripTone(pinyin);
  const examples = Array.isArray(entry.examples) && entry.examples.length
    ? entry.examples.map((item) => ({
        word: String(item.word || "").trim(),
        english: String(item.english || "").trim()
      }))
    : [{ word: entry.character, english: entry.english }];

  return {
    pinyin,
    base,
    chinese: entry.character,
    english: entry.english,
    examples,
    homophones,
    nearPhones
  };
}

function generatePack(limit = 180) {
  const hanzi = loadKindergartenHanzi();
  const byPinyin = new Map();
  const order = [];
  for (const entry of hanzi) {
    const pinyin = String(entry.pinyin || "").trim();
    if (!pinyin) continue;
    if (!byPinyin.has(pinyin)) {
      byPinyin.set(pinyin, []);
      order.push(pinyin);
    }
    byPinyin.get(pinyin).push(entry);
  }

  const preferred = ["bā"];
  for (const pinyin of preferred.reverse()) {
    const index = order.indexOf(pinyin);
    if (index > 0) {
      order.splice(index, 1);
      order.unshift(pinyin);
    }
  }

  const entries = [];
  const baseIndex = new Set();
  for (const pinyin of order) {
    if (entries.length >= limit) break;
    const list = byPinyin.get(pinyin);
    if (!list || list.length === 0) continue;
    const representative = list[0];
    const base = stripTone(pinyin);
    baseIndex.add(base);
    const homophones = Array.from(new Set(list.map((item) => item.character))).slice(0, 6);
    entries.push(buildEntry(representative, homophones, []));
  }

  for (const entry of entries) {
    entry.nearPhones = buildNearPhones(entry.base, baseIndex);
  }

  return entries;
}

function renderPack(entries) {
  const header = `function createPinyinEntry({\n  pinyin,\n  base,\n  chinese,\n  english,\n  examples,\n  homophones = [],\n  nearPhones = []\n}) {\n  const normalizedExamples = (Array.isArray(examples) ? examples : [])\n    .slice(0, 2)\n    .map((item) => ({\n      word: String(item?.word || \"\").trim(),\n      english: String(item?.english || \"\").trim()\n    }))\n    .filter((item) => item.word);\n\n  return {\n    word: pinyin,\n    pinyin,\n    base,\n    chinese,\n    english,\n    examples: normalizedExamples,\n    homophones: Array.isArray(homophones) ? homophones : [],\n    nearPhones: Array.isArray(nearPhones) ? nearPhones : [],\n    difficulty: \"basic\",\n    stage: \"kindergarten\",\n    mode: \"pinyin\",\n    imageURLs: []\n  };\n}\n\nconst PINYIN_CORE_PACK = [\n`;

  const body = entries
    .map((entry) => {
      const data = {
        pinyin: entry.pinyin,
        base: entry.base,
        chinese: entry.chinese,
        english: entry.english,
        examples: entry.examples,
        homophones: entry.homophones,
        nearPhones: entry.nearPhones
      };
      const json = JSON.stringify(data, null, 2);
      const indented = json.replace(/\n/g, "\n  ");
      return `  createPinyinEntry(${indented})`;
    })
    .join(",\n");

  const footer = `\n];\n`;
  return `${header}${body}${footer}`;
}

const entries = generatePack(180);
const output = renderPack(entries);
fs.writeFileSync(new URL("../../words/vocabs/07_拼音/常用拼音.js", import.meta.url), output, "utf8");
console.log(`Generated ${entries.length} pinyin entries.`);
