import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function loadBilingualVocab(languageMode = "english") {
  const source = read("src/modules/09-vocab.js");
  const start = source.indexOf("// --- Bilingual vocabulary support ---");
  assert.ok(start >= 0, "bilingual support marker not found");
  const exportStart = source.indexOf("window.BilingualVocab", start);
  assert.ok(exportStart >= 0, "BilingualVocab export not found");
  const exportEnd = source.indexOf("};", exportStart);
  assert.ok(exportEnd >= 0, "BilingualVocab export end not found");

  const snippet = source.slice(start, exportEnd + 2);
  const context = {
    console,
    settings: { languageMode },
    activeVocabPackId: "vocab.bridge.full",
    vocabPacks: {
      "vocab.bridge.full": { id: "vocab.bridge.full", type: "bridge", stage: "bridge" }
    }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(snippet, context, { filename: "09-vocab.js::bilingual" });
  return context.window.BilingualVocab;
}

function testBridgeLanguageDisplayInPinyinMode() {
  const bilingual = loadBilingualVocab("pinyin");
  const display = bilingual.getDisplayContent({
    subject: "language",
    word: "苹果",
    chinese: "苹果",
    pinyin: "píng guǒ"
  });
  assert.equal(display.primaryText, "píng guǒ");
  assert.equal(display.secondaryText, "苹果");
}

function testBridgeEnglishDisplayUsesPhonics() {
  const bilingual = loadBilingualVocab("english");
  const display = bilingual.getDisplayContent({
    subject: "english",
    word: "apple",
    english: "apple",
    phonics: "a-p-p-l-e"
  });
  assert.equal(display.primaryText, "apple");
  assert.equal(display.secondaryText, "a-p-p-l-e");
}

function testBridgeMathDisplayUsesKeywords() {
  const bilingual = loadBilingualVocab("english");
  const display = bilingual.getDisplayContent({
    subject: "math",
    word: "加法",
    concept: "加法",
    keywords: ["相加", "求和"],
    module: "数与运算"
  });
  assert.equal(display.primaryText, "加法");
  assert.equal(display.secondaryText, "相加");
}

function testBridgeLanguageDisplayFallbacksToPinyinWhenEnglishMissing() {
  const bilingual = loadBilingualVocab("bilingual");
  const display = bilingual.getDisplayContent({
    subject: "language",
    word: "小麦",
    chinese: "小麦",
    pinyin: "xiǎo mài"
  });
  assert.equal(display.primaryText, "小麦");
  assert.equal(display.secondaryText, "xiǎo mài");
}

function testBridgeDisplayPairAndKey() {
  const bilingual = loadBilingualVocab("english");
  const pair = bilingual.getWordDisplayPair({
    subject: "math",
    word: "减法",
    concept: "减法",
    keywords: ["相减"]
  });
  assert.equal(pair.primary, "减法");
  assert.equal(pair.secondary, "相减");
  const key = bilingual.getWordKey({
    subject: "english",
    word: "cat",
    english: "cat"
  });
  assert.equal(key, "cat");
}

testBridgeLanguageDisplayInPinyinMode();
testBridgeEnglishDisplayUsesPhonics();
testBridgeMathDisplayUsesKeywords();
testBridgeDisplayPairAndKey();
testBridgeLanguageDisplayFallbacksToPinyinWhenEnglishMissing();
