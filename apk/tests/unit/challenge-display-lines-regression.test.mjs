import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function loadChallengeDisplayHelpers(languageMode = "english") {
  const source = read("src/modules/12-challenges.js");
  const start = source.indexOf("function getWordDisplayContentSafe(wordObj) {");
  assert.ok(start >= 0, "challenge display helper start not found");
  const end = source.indexOf("function buildSessionWordsSummary()", start);
  assert.ok(end >= 0, "challenge display helper end not found");
  const snippet = source.slice(start, end);
  const context = {
    console,
    settings: { languageMode },
    _root: {},
    normalizeSpeechText: (...parts) => parts.map(part => String(part || "").trim()).find(Boolean) || "",
    getLanguageModeSafe: () => languageMode
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(snippet, context, { filename: "12-challenges.js::display-helpers" });
  return context;
}

function testEnglishModeKeepsEnglishThenChinese() {
  const ctx = loadChallengeDisplayHelpers("english");
  const wordObj = { word: "apple", english: "apple", chinese: "苹果", pinyin: "píng guǒ" };
  const displayContent = ctx.getWordDisplayContentSafe(wordObj);
  const displayLines = ctx.getChallengeDisplayLines(wordObj, displayContent);

  assert.equal(displayLines.primary, "apple");
  assert.equal(displayLines.secondary, "苹果");
  assert.equal(
    ctx.getChallengeMetaText({ metaText: "英语词汇", tipText: "先认读" }, wordObj),
    "英语词汇 · 先认读"
  );
}

function testChineseModeShowsChineseThenPinyin() {
  const ctx = loadChallengeDisplayHelpers("chinese");
  const wordObj = { word: "apple", english: "apple", chinese: "苹果", pinyin: "píng guǒ" };
  const displayContent = ctx.getWordDisplayContentSafe(wordObj);
  const displayLines = ctx.getChallengeDisplayLines(wordObj, displayContent);

  assert.equal(displayLines.primary, "苹果");
  assert.equal(displayLines.secondary, "píng guǒ");
  assert.equal(ctx.getChallengeMetaText({ metaText: "汉字模式", tipText: "说明" }, wordObj), "");
}

function testPinyinModeBridgeCardShowsChineseThenPinyin() {
  const ctx = loadChallengeDisplayHelpers("pinyin");
  const wordObj = { subject: "language", chinese: "苹果", pinyin: "píng guǒ" };
  const displayLines = ctx.getChallengeDisplayLines(wordObj, {
    primaryText: "píng guǒ",
    secondaryText: "苹果",
    phoneticText: "píng guǒ"
  });

  assert.equal(displayLines.primary, "苹果");
  assert.equal(displayLines.secondary, "píng guǒ");
  assert.equal(ctx.getChallengeMetaText({ metaText: "幼小衔接", tipText: "说明" }, wordObj), "");
}

function testEnglishBridgeAndMathModesStayUnchanged() {
  const ctx = loadChallengeDisplayHelpers("english");
  const englishBridgeLines = ctx.getChallengeDisplayLines(
    { subject: "english", english: "apple", word: "apple" },
    { primaryText: "apple", secondaryText: "a-p-p-l-e" }
  );
  const mathBridgeLines = ctx.getChallengeDisplayLines(
    { subject: "math", word: "加法", concept: "加法" },
    { primaryText: "加法", secondaryText: "相加" }
  );

  assert.equal(englishBridgeLines.primary, "apple");
  assert.equal(englishBridgeLines.secondary, "a-p-p-l-e");
  assert.equal(mathBridgeLines.primary, "加法");
  assert.equal(mathBridgeLines.secondary, "相加");
}

testEnglishModeKeepsEnglishThenChinese();
testChineseModeShowsChineseThenPinyin();
testPinyinModeBridgeCardShowsChineseThenPinyin();
testEnglishBridgeAndMathModesStayUnchanged();

console.log("challenge display line regression checks passed");
