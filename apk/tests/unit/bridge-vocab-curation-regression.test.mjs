import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function loadBridgePack() {
  const context = { console };
  context.window = context;
  vm.createContext(context);
  [
    "words/vocabs/01_幼儿园/幼儿园完整词库.js",
    "words/vocabs/06_汉字/幼儿园汉字.js",
    "words/vocabs/07_拼音/常用拼音.js",
    "words/vocabs/08_幼小衔接/幼小衔接总词库.js",
    "words/vocabs/08_幼小衔接/幼小衔接_数学.js",
    "words/vocabs/08_幼小衔接/幼小衔接_语文.js",
    "words/vocabs/08_幼小衔接/幼小衔接_英语.js"
  ].forEach((relPath) => {
    vm.runInContext(read(relPath), context, { filename: relPath });
  });
  return {
    full: vm.runInContext("BRIDGE_VOCAB_FULL", context),
    math: vm.runInContext("BRIDGE_VOCAB_MATH", context),
    language: vm.runInContext("BRIDGE_VOCAB_LANGUAGE", context),
    english: vm.runInContext("BRIDGE_VOCAB_ENGLISH", context)
  };
}

function wordsFor(pack, { subject, module }) {
  return new Set(
    pack
      .filter((entry) => (!subject || entry?.subject === subject) && (!module || entry?.module === module))
      .map((entry) => String(entry?.word || entry?.chinese || "").trim())
      .filter(Boolean)
  );
}

const { full, math, language, english } = loadBridgePack();

const extensionWords = wordsFor(language, { module: "拓展词汇" });
const allLanguageWords = wordsFor(language, {});
for (const banned of ["记录表", "告示栏", "值班室", "午睡室", "图表", "词语条", "读书条", "朗读条", "摘抄栏", "拼读条"]) {
  assert.equal(extensionWords.has(banned), false, `bridge language 拓展词汇不应保留教师侧或生成感过强的词: ${banned}`);
}

for (const required of ["门铃", "花盆", "镜子", "水洼", "风扇", "语文书", "拼音本", "生字本", "自然段", "听写本"]) {
  assert.equal(allLanguageWords.has(required), true, `bridge language 总词库应保留更贴近低年级儿童的具体高频词: ${required}`);
}

const mathWords = wordsFor(math, {});
for (const banned of ["规律方法", "时间测量", "日期换算", "钱币估算", "圆形旋转", "顶点对称", "项目任务", "活动计划", "统计社区", "计划天气"]) {
  assert.equal(mathWords.has(banned), false, `bridge math 不应保留抽象或教师视角词: ${banned}`);
}

for (const required of ["认识整点", "认识半点", "换零钱", "买文具", "找规律", "图形拼图", "统计玩具", "看统计图"]) {
  assert.equal(mathWords.has(required), true, `bridge math 应保留更具体可操作的低龄词: ${required}`);
}

const englishCoreWords = new Set(
  english
    .filter((entry) => String(entry?.gradeBand || "").trim() === "学前-一年级")
    .map((entry) => String(entry?.word || "").trim().toLowerCase())
);
const englishGrade12Words = new Set(
  english
    .filter((entry) => String(entry?.gradeBand || "").trim() === "一年级-二年级")
    .map((entry) => String(entry?.word || "").trim().toLowerCase())
);

for (const required of ["boy", "girl", "pen", "bag", "door", "window", "bed", "cup"]) {
  assert.equal(englishCoreWords.has(required), true, `bridge english 核心词应补足更高频的启蒙词: ${required}`);
}

for (const moved of ["bridge", "noon", "quiet", "loud", "mountain", "forest", "stone", "meat"]) {
  assert.equal(englishCoreWords.has(moved), false, `bridge english 学前-一年级应避免偏后置或低频词: ${moved}`);
  assert.equal(englishGrade12Words.has(moved), true, `bridge english 一年级-二年级应承接稍后置的词: ${moved}`);
}

console.log("bridge vocab curation regression checks passed");
