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
  return vm.runInContext("kindergartenHanzi", context);
}

function isHanziWordWithinPack(word, allowed) {
  const chars = [...String(word || "").trim()];
  if (chars.length === 0) return false;
  for (const char of chars) {
    if (!/[\u4e00-\u9fff]/.test(char)) return false;
    if (!allowed.has(char)) return false;
  }
  return true;
}

const pack = loadPack();
const allowed = new Set(pack.map((entry) => entry.word));
const invalidExamples = [];
const MAX_REPORT = 20;

for (const entry of pack) {
  for (const example of entry.examples || []) {
    if (!isHanziWordWithinPack(example.word, allowed)) {
      invalidExamples.push({
        character: entry.word,
        example: example.word
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

console.log("kindergarten hanzi audit passed");
