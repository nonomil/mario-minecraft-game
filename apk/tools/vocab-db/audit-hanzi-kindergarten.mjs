import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function loadPack() {
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
  const pack =
    context.window.kindergartenHanzi ||
    context.module.exports ||
    context.exports;
  if (!Array.isArray(pack)) {
    throw new Error("Unable to resolve kindergarten hanzi pack (window.kindergartenHanzi/module.exports)");
  }
  return pack;
}

const HANZI_RE = /^[\u4e00-\u9fff]+$/;
const MAX_EXAMPLE_LENGTH = 4;
const BANNED_GLOSS_SNIPPETS = [
  "China",
  "mainland",
  "ethnic Chinese",
  "Buddhist temple",
  "country or countryside"
];

const BANNED_EXAMPLE_WORDS = new Set([
  "暴力",
  "战争",
  "死亡",
  "罪人",
  "犯罪",
  "皇帝",
  "政治",
  "政府",
  "法律",
  "历史",
  "论文",
  "改革",
  "研究",
  "贫困",
  "威胁",
  "危机",
  "崇拜",
  "悲剧",
  "丧失",
  "佛寺",
  "祭日"
]);

const pack = loadPack();
const invalidExamples = [];
const invalidGlosses = [];
const MAX_REPORT = 20;

for (const entry of pack) {
  const glossFields = [
    String(entry?.english || "").trim(),
    String(entry?.phrase || "").trim(),
    ...(Array.isArray(entry?.examples) ? entry.examples.map((example) => String(example?.english || "").trim()) : [])
  ];

  for (const gloss of glossFields) {
    const matchedSnippet = BANNED_GLOSS_SNIPPETS.find((snippet) => gloss.includes(snippet));
    if (matchedSnippet) {
      invalidGlosses.push({
        character: String(entry?.character || entry?.word || "").trim() || "(missing)",
        gloss,
        snippet: matchedSnippet
      });
      break;
    }
  }

  for (const example of entry.examples || []) {
    const word = String(example?.word || "").trim();
    const char = String(entry?.character || entry?.word || "").trim();
    if (!word || !char) {
      invalidExamples.push({ character: char || "(missing)", example: word || "(missing)" });
      continue;
    }
    if (!HANZI_RE.test(word)) {
      invalidExamples.push({ character: char, example: word });
      continue;
    }
    if (!word.includes(char)) {
      invalidExamples.push({ character: char, example: word });
      continue;
    }
    if (word.length > MAX_EXAMPLE_LENGTH) {
      invalidExamples.push({ character: char, example: word });
      continue;
    }
    if (BANNED_EXAMPLE_WORDS.has(word)) {
      invalidExamples.push({
        character: char,
        example: word
      });
    }
  }
}

if (invalidExamples.length > 0) {
  console.error(`发现 ${invalidExamples.length} 个例词含有非包内字符：`);
  for (const item of invalidExamples.slice(0, MAX_REPORT)) {
    console.error(`- ${item.character}: ${item.example}`);
  }
  process.exit(1);
}

if (invalidGlosses.length > 0) {
  console.error(`发现 ${invalidGlosses.length} 个释义仍含不适合低龄儿童的词典腔说明：`);
  for (const item of invalidGlosses.slice(0, MAX_REPORT)) {
    console.error(`- ${item.character}: ${item.snippet} <- ${item.gloss}`);
  }
  process.exit(1);
}

console.log("kindergarten hanzi audit passed");
