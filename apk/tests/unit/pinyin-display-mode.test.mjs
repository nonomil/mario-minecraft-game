import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function loadBilingualVocabSnippet() {
  const source = read("src/modules/09-vocab.js");
  const start = source.indexOf("// --- Bilingual vocabulary support ---");
  assert.ok(start >= 0, "bilingual support marker not found");
  const exportStart = source.indexOf("window.BilingualVocab", start);
  assert.ok(exportStart >= 0, "BilingualVocab export not found");
  const exportEnd = source.indexOf("};", exportStart);
  assert.ok(exportEnd >= 0, "BilingualVocab export end not found");

  const snippet = source.slice(start, exportEnd + 2);
  const context = { console, settings: { languageMode: "pinyin" } };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(snippet, context, { filename: "09-vocab.js::bilingual" });
  return context.window.BilingualVocab;
}

function loadBilingualVocabSnippetWithHanziMap() {
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
    settings: { languageMode: "pinyin" },
    kindergartenHanzi: [
      { character: "小", pinyin: "xiǎo" },
      { character: "麦", pinyin: "mài" }
    ]
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(snippet, context, { filename: "09-vocab.js::bilingual" });
  return context.window.BilingualVocab;
}

function loadBilingualVocabContext() {
  const source = read("src/modules/09-vocab.js");
  const start = source.indexOf("// --- Bilingual vocabulary support ---");
  assert.ok(start >= 0, "bilingual support marker not found");
  const exportStart = source.indexOf("window.BilingualVocab", start);
  assert.ok(exportStart >= 0, "BilingualVocab export not found");
  const exportEnd = source.indexOf("};", exportStart);
  assert.ok(exportEnd >= 0, "BilingualVocab export end not found");

  const snippet = source.slice(start, exportEnd + 2);
  const context = { console, settings: { languageMode: "pinyin" } };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(snippet, context, { filename: "09-vocab.js::bilingual" });
  return context;
}

function testPinyinModeUsesPinyinAsPrimary() {
  const bilingual = loadBilingualVocabSnippet();
  const display = bilingual.getDisplayContent({
    word: "apple",
    english: "apple",
    chinese: "苹果",
    pinyin: "píng guǒ",
    mode: "pinyin"
  });
  assert.equal(display.primaryText, "píng guǒ");
  assert.equal(display.secondaryText, "苹果");
}

function testPinyinModeFallsBackToHanziMap() {
  const bilingual = loadBilingualVocabSnippetWithHanziMap();
  const display = bilingual.getDisplayContent({
    word: "小麦",
    chinese: "小麦"
  });
  assert.equal(display.primaryText, "xiǎo mài");
  assert.equal(display.secondaryText, "小麦");
}

function testPinyinModeUsesEnglishWhenPinyinMissing() {
  const bilingual = loadBilingualVocabSnippet();
  const display = bilingual.getDisplayContent({
    word: "meow",
    english: "meow",
    chinese: "喵喵"
  });
  assert.equal(display.primaryText, "喵喵");
  assert.equal(display.secondaryText, "meow");
}

function testPinyinModeRefreshesWhenHanziMapLoadsLate() {
  const context = loadBilingualVocabContext();
  const bilingual = context.window.BilingualVocab;
  const word = { word: "egg", english: "egg", chinese: "鸡蛋" };

  const before = bilingual.getDisplayContent(word);
  assert.equal(before.primaryText, "鸡蛋");

  context.kindergartenHanzi = [
    { character: "鸡", pinyin: "jī" },
    { character: "蛋", pinyin: "dàn" }
  ];

  const after = bilingual.getDisplayContent(word);
  assert.equal(after.primaryText, "jī dàn");
}

testPinyinModeUsesPinyinAsPrimary();
testPinyinModeFallsBackToHanziMap();
testPinyinModeUsesEnglishWhenPinyinMissing();
testPinyinModeRefreshesWhenHanziMapLoadsLate();
