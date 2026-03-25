import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function createBrowserContext() {
  const context = { console };
  context.window = context;
  vm.createContext(context);
  return context;
}

function runInContext(context, relPath) {
  vm.runInContext(read(relPath), context, { filename: relPath });
}

function loadBundle(files) {
  const context = createBrowserContext();
  files.forEach((file) => runInContext(context, file));
  return context;
}

function getLexicalArray(context, globalName) {
  return vm.runInContext(
    `(typeof ${globalName} !== "undefined" && Array.isArray(${globalName})) ? ${globalName} : []`,
    context
  );
}

function getWordTexts(entries) {
  return entries.map((entry) => String(entry?.word || entry?.chinese || entry?.character || "").trim()).filter(Boolean);
}

function testHanziExamplesAvoidAdultOrDictionaryExamples() {
  const context = loadBundle(["words/vocabs/06_汉字/幼儿园汉字.js"]);
  const entries = getLexicalArray(context, "kindergartenHanzi");
  const exampleWords = new Set(entries.flatMap((entry) => (entry.examples || []).map((item) => String(item?.word || "").trim())));

  [
    "酒店",
    "短信",
    "信仰",
    "税收",
    "主席",
    "权利",
    "调查",
    "宣传",
    "抢救",
    "外卖"
  ].forEach((word) => {
    assert.ok(!exampleWords.has(word), `汉字例词不应再包含生硬或低龄不合适词：${word}`);
  });
}

function testBridgeLanguageFiltersTeacherStylePhrases() {
  const context = loadBundle([
    "words/vocabs/01_幼儿园/幼儿园完整词库.js",
    "words/vocabs/06_汉字/幼儿园汉字.js",
    "words/vocabs/07_拼音/常用拼音.js",
    "words/vocabs/08_幼小衔接/幼小衔接总词库.js",
    "words/vocabs/08_幼小衔接/幼小衔接_语文.js"
  ]);
  const words = new Set(getWordTexts(getLexicalArray(context, "BRIDGE_VOCAB_LANGUAGE")));

  [
    "我来分享",
    "我来记录",
    "我来做分享",
    "请完整表达",
    "值日表",
    "阅读单",
    "晨检表",
    "课代表",
    "课堂笔记",
    "默写练习",
    "短文练习",
    "组词练习",
    "请你跟读",
    "先想再回答",
    "请说完整句",
    "请补充一句"
  ].forEach((word) => {
    assert.ok(!words.has(word), `幼小衔接语文不应再保留教师/任务视角词条：${word}`);
  });
}

function testBridgeMathFiltersAbstractGeneratedPhrases() {
  const context = loadBundle([
    "words/vocabs/01_幼儿园/幼儿园完整词库.js",
    "words/vocabs/06_汉字/幼儿园汉字.js",
    "words/vocabs/07_拼音/常用拼音.js",
    "words/vocabs/08_幼小衔接/幼小衔接总词库.js",
    "words/vocabs/08_幼小衔接/幼小衔接_数学.js"
  ]);
  const words = new Set(getWordTexts(getLexicalArray(context, "BRIDGE_VOCAB_MATH")));

  [
    "规律卡片",
    "整理图卡",
    "文字题",
    "数量关系",
    "应用题",
    "买卡片",
    "看图题",
    "加法题",
    "减法题",
    "口算题",
    "看看钟面",
    "说说今天",
    "整理书包",
    "比较结果",
    "贴一贴数量点点"
  ].forEach((word) => {
    assert.ok(!words.has(word), `幼小衔接数学不应再保留生成感强的抽象词条：${word}`);
  });

  [
    "十以内加法",
    "二十以内加减",
    "图形拼搭",
    "图形拼图",
    "看位置",
    "看统计图"
  ].forEach((word) => {
    assert.ok(words.has(word), `幼小衔接数学应保留更具体的低年级核心词条：${word}`);
  });
}

function testBridgeEnglishPackUsesCuratedSupplementAndNoNonsenseNonwords() {
  const context = createBrowserContext();
  runInContext(context, "words/vocabs/manifest.js");

  const manifest = context.window.vocabManifest || context.window.MMWG_VOCAB_MANIFEST;
  const englishPack = manifest.packs.find((pack) => pack?.id === "vocab.bridge.english");
  assert.ok(englishPack, "应存在幼小衔接英语词库");
  assert.ok(
    Array.isArray(englishPack.files) && englishPack.files.includes("words/vocabs/08_幼小衔接/幼小衔接_英语.js"),
    "幼小衔接英语词库应加载单独的英语补充词库"
  );

  englishPack.files.forEach((file) => runInContext(context, file));
  const words = new Set(getWordTexts(typeof englishPack.getRaw === "function" ? englishPack.getRaw() : []));
  const modules = new Set((englishPack.getRaw() || []).map((entry) => String(entry?.module || "").trim()).filter(Boolean));

  ["blat", "clen", "glup", "ce", "gi", "vu", "igh", "tch", "compare", "remember", "follow"].forEach((word) => {
    assert.ok(!words.has(word), `幼小衔接英语不应再包含无意义拼读串：${word}`);
  });
  assert.ok(modules.has("启蒙单词"), "幼小衔接英语应包含人工筛选的启蒙单词模块");
}

function run() {
  testHanziExamplesAvoidAdultOrDictionaryExamples();
  testBridgeLanguageFiltersTeacherStylePhrases();
  testBridgeMathFiltersAbstractGeneratedPhrases();
  testBridgeEnglishPackUsesCuratedSupplementAndNoNonsenseNonwords();
  console.log("bridge vocab curation checks passed");
}

run();
