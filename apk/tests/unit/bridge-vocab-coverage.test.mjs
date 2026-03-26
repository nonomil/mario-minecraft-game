import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runInContext(context, relPath) {
  vm.runInContext(read(relPath), context, { filename: relPath });
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
    "words/vocabs/08_幼小衔接/幼小衔接_语文.js",
    "words/vocabs/08_幼小衔接/幼小衔接_数学.js",
    "words/vocabs/08_幼小衔接/幼小衔接_英语.js"
  ].forEach((relPath) => {
    runInContext(context, relPath);
  });
  return vm.runInContext("BRIDGE_VOCAB_FULL", context) || [];
}

const pack = loadBridgePack();
assert.ok(pack.length > 0, "bridge vocab pack should not be empty");

const moduleCounts = {};
const duplicateKeys = new Set();
const seenEntryKeys = new Set();
const languageWords = new Set();
const expressionWords = new Set();
const mathWords = new Set();
const englishGradeBands = new Set();

for (const entry of pack) {
  const subject = String(entry?.subject || "").trim();
  const moduleName = String(entry?.module || "").trim();
  const word = String(entry?.chinese || entry?.word || "").trim();
  if (!subject || !moduleName || !word) continue;

  const countKey = `${subject}::${moduleName}`;
  moduleCounts[countKey] = (moduleCounts[countKey] || 0) + 1;

  const entryKey = `${subject}::${moduleName}::${word}`;
  if (seenEntryKeys.has(entryKey)) duplicateKeys.add(entryKey);
  seenEntryKeys.add(entryKey);

  if (subject === "language") {
    languageWords.add(word);
    if (moduleName === "表达") {
      expressionWords.add(word);
      assert.ok([...word].length <= 8, `language::表达 应限制为 2-8 字短表达: ${word}`);
    }
  }

  if (subject === "math") {
    mathWords.add(word);
  }

  if (subject === "english") {
    const band = String(entry?.gradeBand || "").trim();
    if (band) englishGradeBands.add(band);
  }
}

for (const [key, minCount] of [
  ["language::识字", 800],
  ["language::拼音", 800],
  ["language::词语", 1500],
  ["language::表达", 800],
  ["language::古诗", 20],
  ["language::拓展词汇", 50],
  ["math::数与运算", 50],
  ["math::逻辑推理", 40],
  ["math::量与统计", 50],
  ["math::图形与空间", 30],
  ["math::应用题专项", 120],
  ["math::综合实践", 30],
  ["math::时间与货币", 100],
  ["math::规律与模式", 80],
  ["math::统计与数据", 70],
  ["english::字母", 200],
  ["english::自然拼读", 250],
  ["english::发音", 250],
  ["english::单词", 250],
  ["english::启蒙单词", 150],
  ["english::拓展单词", 25],
  ["english::动作词", 40]
]) {
  assert.ok((moduleCounts[key] || 0) >= minCount, `${key} should have at least ${minCount} entries, got ${moduleCounts[key] || 0}`);
}

assert.equal(
  duplicateKeys.size,
  0,
  `bridge vocab should not contain duplicate module entries: ${Array.from(duplicateKeys).slice(0, 10).join(", ")}`
);

for (const bannedFragment of ["传送", "附魔", "出生点", "采集木头"]) {
  assert.equal(
    [...languageWords].some((word) => word.includes(bannedFragment)),
    false,
    `language entry should not include banned fragment: ${bannedFragment}`
  );
}

for (const required of [
  "田字格", "拼音本", "生字本", "自然段", "看拼音", "写句子", "课间操",
  "口琴", "短笛", "花盆", "镜子", "土堆", "水洼", "风扇", "鸟笼", "剪纸", "发夹", "书柜", "小勺", "门铃",
  "看图写话", "图画本", "练习册", "值日生", "红领巾", "课文", "段落", "课后题"
]) {
  assert.equal(languageWords.has(required), true, `language pack should keep useful low-grade words: ${required}`);
}

for (const banned of [
  "课程表", "作息表", "座位表", "公告栏", "借阅架", "记录表", "告示栏", "值班室",
  "午睡室", "图表", "词语条", "读书条", "朗读条", "摘抄栏", "拼读条"
]) {
  assert.equal(languageWords.has(banned), false, `language pack should drop institutional or noisy words: ${banned}`);
}

for (const required of [
  "认识整点", "认识半点", "换零钱", "买文具", "找规律", "图形拼搭", "统计玩具", "看条形图"
]) {
  assert.equal(mathWords.has(required), true, `math pack should keep concrete low-grade items: ${required}`);
}

for (const banned of [
  "规律方法", "时间测量", "日期换算", "钱币估算", "圆形旋转", "顶点对称", "项目任务", "活动计划", "统计社区", "计划天气"
]) {
  assert.equal(mathWords.has(banned), false, `math pack should drop abstract teacher-facing items: ${banned}`);
}

for (const requiredBand of ["学前-一年级", "一年级-二年级"]) {
  assert.equal(englishGradeBands.has(requiredBand), true, `english packs should keep grade band ${requiredBand}`);
}

console.log("bridge vocab coverage checks passed");
