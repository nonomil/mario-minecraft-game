import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runInContext(context, relPath) {
  vm.runInContext(read(relPath), context, { filename: relPath });
}

function createBrowserContext() {
  const context = { console };
  context.window = context;
  vm.createContext(context);
  return context;
}

function loadBridgeAndHanziPacks() {
  const context = createBrowserContext();
  [
    "words/vocabs/01_幼儿园/幼儿园完整词库.js",
    "words/vocabs/06_汉字/幼儿园汉字.js",
    "words/vocabs/07_拼音/常用拼音.js",
    "words/vocabs/08_幼小衔接/幼小衔接总词库.js",
    "words/vocabs/08_幼小衔接/幼小衔接_语文.js",
    "words/vocabs/08_幼小衔接/幼小衔接_数学.js"
  ].forEach((relPath) => runInContext(context, relPath));
  return {
    bridgePack: vm.runInContext("BRIDGE_VOCAB_FULL", context) || [],
    hanziPack: context.window.kindergartenHanzi || [],
    standaloneMathPack: context.window.BRIDGE_VOCAB_MATH || []
  };
}

function asWordSet(entries, filterFn = () => true) {
  return new Set(
    entries
      .filter(filterFn)
      .map((entry) => String(entry?.word || entry?.chinese || entry?.character || "").trim())
      .filter(Boolean)
  );
}

function testBridgeExpressionsStayConversational() {
  const { bridgePack } = loadBridgeAndHanziPacks();
  const expressionWords = asWordSet(
    bridgePack,
    (entry) => String(entry?.subject || "") === "language" && String(entry?.module || "") === "表达"
  );

  for (const banned of [
    "开心的小朋友",
    "圆圆的球体",
    "锯齿形的线",
    "安静的图书馆",
    "勇敢的消防员",
    "一个大象",
    "一位老爷爷",
    "几个苹果",
    "坏天气",
    "温暖的天气"
  ]) {
    assert.equal(expressionWords.has(banned), false, `表达词库不应保留生成感强的描述句: ${banned}`);
  }

  for (const required of [
    "请你先说",
    "我来回答",
    "请再读一遍",
    "我先读一段",
    "请补充一句",
    "请说完整句",
    "我来讲一讲",
    "请说说想法"
  ]) {
    assert.equal(expressionWords.has(required), true, `表达词库应保留更贴近课堂口语的短表达: ${required}`);
  }
}

function testBridgeExtensionWordsAvoidAdministrativeTerms() {
  const { bridgePack } = loadBridgeAndHanziPacks();
  const allLanguageWords = asWordSet(
    bridgePack,
    (entry) => String(entry?.subject || "") === "language"
  );
  const extensionWords = asWordSet(
    bridgePack,
    (entry) => String(entry?.subject || "") === "language" && String(entry?.module || "") === "拓展词汇"
  );

  for (const banned of [
    "服务台",
    "售票处",
    "候车亭",
    "值班室",
    "保健室",
    "管理员",
    "保育员",
    "清洁工",
    "任务单",
    "轮流表",
    "分组表",
    "值日册",
    "座位表",
    "队列表",
    "讲评卡",
    "阅读交流卡"
  ]) {
    assert.equal(extensionWords.has(banned), false, `拓展词汇不应保留偏行政或教师视角的词: ${banned}`);
  }

  for (const required of [
    "口琴",
    "花盆",
    "镜子",
    "水洼",
    "风扇",
    "鸟笼",
    "剪纸",
    "门铃"
  ]) {
    assert.equal(allLanguageWords.has(required), true, `语文词库应保留更生活化的名词: ${required}`);
  }
}

function testMathWordsStayConcreteForPreschoolToGrade2() {
  const { bridgePack, standaloneMathPack } = loadBridgeAndHanziPacks();
  const bridgeMathWords = asWordSet(bridgePack, (entry) => String(entry?.subject || "") === "math");
  const standaloneMathWords = asWordSet(standaloneMathPack);

  for (const set of [bridgeMathWords, standaloneMathWords]) {
    for (const banned of [
      "规律方法",
      "推理规则",
      "长度换算",
      "圆形旋转",
      "实验天气",
      "计划购物",
      "统计社区",
      "路线图",
      "三位数加法",
      "三位数口算"
    ]) {
      assert.equal(set.has(banned), false, `数学词库不应保留超龄或空泛组合词: ${banned}`);
    }
  }

  for (const required of [
    "十以内加法",
    "二十以内加减",
    "看钟面",
    "认时间",
    "找规律",
    "分一分",
    "比多少",
    "购物找零",
    "图形拼搭",
    "看位置"
  ]) {
    assert.equal(bridgeMathWords.has(required) || standaloneMathWords.has(required), true, `数学词库应保留更贴近低年级的核心词: ${required}`);
  }
}

function testHanziExamplesAvoidDictionaryTone() {
  const { hanziPack } = loadBridgeAndHanziPacks();
  const exampleMap = new Map(
    hanziPack.map((entry) => [
      String(entry?.character || entry?.word || "").trim(),
      (entry?.examples || []).map((item) => `${item.word}|${item.english}`)
    ])
  );

  for (const banned of [
    ["目", "题目|exercise title"],
    ["谈", "谈判|to negotiate"],
    ["证", "保证|guarantee"],
    ["寺", "寺里|temple"],
    ["德", "道德|virtue"],
    ["满", "满意|satisfied"],
    ["爪", "爪印|paw print"]
  ]) {
    const [character, example] = banned;
    assert.equal(exampleMap.get(character)?.includes(example), false, `汉字 ${character} 不应保留字典腔例词: ${example}`);
  }

  const requiredExamples = new Map([
    ["讲", "讲故事|tell a story"],
    ["谈", "谈话|talk"],
    ["操", "做操|do exercises"],
    ["密", "秘密|secret"],
    ["寺", "山寺|mountain temple"]
  ]);
  for (const [character, example] of requiredExamples.entries()) {
    assert.equal(exampleMap.get(character)?.includes(example), true, `汉字 ${character} 应改为更自然的例词: ${example}`);
  }
}

testBridgeExpressionsStayConversational();
testBridgeExtensionWordsAvoidAdministrativeTerms();
testMathWordsStayConcreteForPreschoolToGrade2();
testHanziExamplesAvoidDictionaryTone();

console.log("child friendly vocab regression checks passed");
