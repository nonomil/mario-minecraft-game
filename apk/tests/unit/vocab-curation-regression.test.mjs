import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runInContext(context, relPath) {
  vm.runInContext(read(relPath), context, { filename: relPath });
}

function loadVocabContext() {
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
  ].forEach((relPath) => runInContext(context, relPath));
  return context;
}

function collectWords(entries) {
  return new Set(
    (Array.isArray(entries) ? entries : [])
      .map((entry) => String(entry?.word || entry?.chinese || "").trim())
      .filter(Boolean)
  );
}

function collectExampleWords(entries) {
  const words = new Set();
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    (Array.isArray(entry?.examples) ? entry.examples : []).forEach((example) => {
      const word = String(example?.word || "").trim();
      if (word) words.add(word);
    });
  });
  return words;
}

function collectExampleGlosses(entries) {
  const glosses = new Set();
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    (Array.isArray(entry?.examples) ? entry.examples : []).forEach((example) => {
      const gloss = String(example?.english || "").trim().toLowerCase();
      if (gloss) glosses.add(gloss);
    });
  });
  return glosses;
}

function testBridgeLanguagePackDropsTeacherAdminArtifacts() {
  const context = loadVocabContext();
  const words = collectWords(context.BRIDGE_VOCAB_LANGUAGE);
  const bannedWords = [
    "公告栏",
    "售票处",
    "候车亭",
    "讲评课",
    "观察册",
    "写话单",
    "记录册",
    "预习单",
    "学习单",
    "读书分享会",
    "整本书阅读",
    "课堂展示台",
    "阅读交流卡",
    "图书漂流",
    "评价表",
    "打卡表",
    "任务卡",
    "记录卡"
  ];

  bannedWords.forEach((word) => {
    assert.equal(words.has(word), false, `bridge language vocab should drop teacher/admin artifact: ${word}`);
  });
}

function testBridgeMathPackDropsAbstractGeneratedTerms() {
  const context = loadVocabContext();
  const words = collectWords(context.BRIDGE_VOCAB_MATH);
  const bannedWords = [
    "规律方法",
    "推理方法",
    "统计",
    "换算",
    "估算",
    "对称",
    "组合",
    "验证",
    "项目任务",
    "活动计划",
    "时间安排",
    "路线图",
    "调查表",
    "观察表",
    "记录表",
    "任务卡"
  ];

  bannedWords.forEach((word) => {
    assert.equal(words.has(word), false, `bridge math vocab should drop abstract/generated item: ${word}`);
  });
}

function testHanziExamplesDropDictionaryToneAndAdultContexts() {
  const context = loadVocabContext();
  const exampleWords = collectExampleWords(context.kindergartenHanzi);
  const exampleGlosses = collectExampleGlosses(context.kindergartenHanzi);

  [
    "厂房",
    "大人",
    "入学",
    "才艺",
    "用力",
    "住户",
    "居民"
  ].forEach((word) => {
    assert.equal(exampleWords.has(word), false, `hanzi examples should avoid dictionary/adult example word: ${word}`);
  });

  [
    "adult",
    "resident",
    "talent",
    "enroll",
    "use force",
    "workshop",
    "blade",
    "property",
    "professor"
  ].forEach((gloss) => {
    assert.equal(exampleGlosses.has(gloss), false, `hanzi examples should avoid adult/dictionary gloss: ${gloss}`);
  });
}

function run() {
  testBridgeLanguagePackDropsTeacherAdminArtifacts();
  testBridgeMathPackDropsAbstractGeneratedTerms();
  testHanziExamplesDropDictionaryToneAndAdultContexts();
  console.log("vocab curation regression checks passed");
}

run();
