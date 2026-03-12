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

function buildNearBases(base, baseIndex) {
  const { initial, rest } = splitInitial(base);
  const near = new Set();
  const candidates = NEAR_INITIALS[initial] || [];
  for (const alt of candidates) {
    const candidate = `${alt}${rest}`;
    if (baseIndex.has(candidate)) near.add(candidate);
  }
  return Array.from(near).slice(0, 3);
}

function buildPinyinRelations(pack) {
  const byBase = new Map();
  const byPinyin = new Map();
  const baseIndex = new Set();

  for (const entry of pack) {
    const pinyin = String(entry.pinyin || "").trim();
    if (!pinyin) continue;
    const base = String(entry.base || stripTone(pinyin)).trim();
    if (!base) continue;
    baseIndex.add(base);

    if (!byBase.has(base)) byBase.set(base, new Set());
    byBase.get(base).add(pinyin);

    if (!byPinyin.has(pinyin)) byPinyin.set(pinyin, new Set());
    if (entry.chinese) byPinyin.get(pinyin).add(entry.chinese);
    if (Array.isArray(entry.homophones)) {
      for (const item of entry.homophones) byPinyin.get(pinyin).add(item);
    }
  }

  const relations = {};
  for (const [base, toneSet] of byBase.entries()) {
    const tones = Array.from(toneSet);
    const homophones = [];
    for (const tone of tones) {
      const list = byPinyin.get(tone);
      if (list) homophones.push(...list);
    }
    relations[base] = {
      tones: tones.slice(0, 6),
      homophones: Array.from(new Set(homophones)).slice(0, 8),
      near: buildNearBases(base, baseIndex)
    };
  }

  return relations;
}

const DEFAULT_RELATIONS = {
  "ba": {
    tones: ["bā", "bá", "bǎ", "bà"],
    homophones: ["八", "吧"],
    near: ["pa", "ma"]
  }
};

const PINYIN_RELATIONS = (typeof PINYIN_CORE_PACK !== "undefined" && Array.isArray(PINYIN_CORE_PACK))
  ? buildPinyinRelations(PINYIN_CORE_PACK)
  : DEFAULT_RELATIONS;
