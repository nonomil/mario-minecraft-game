import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function loadKindergartenHanzi() {
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

function isSingleHanzi(value) {
  if (typeof value !== "string") return false;
  const chars = [...value.trim()];
  return chars.length === 1 && /[\u4e00-\u9fff]/.test(chars[0]);
}

function hasSentencePunctuation(value) {
  return /[，。！？,.!?]/.test(String(value || ""));
}

function testKindergartenHanziUsesSingleCharacterEntries() {
  const pack = loadKindergartenHanzi();

  assert.equal(pack.length, 800, "幼儿园汉字包应扩充到 800 个手工筛选与联网调研结合的单字");
  for (const entry of pack) {
    assert.ok(isSingleHanzi(entry.word), `word 应是单个汉字: ${entry.word}`);
    assert.ok(isSingleHanzi(entry.character), `character 应是单个汉字: ${entry.character}`);
    assert.ok(isSingleHanzi(entry.chinese), `chinese 应是单个汉字: ${entry.chinese}`);
    assert.equal(entry.word, entry.character, "word 与 character 应保持一致");
    assert.equal(entry.word, entry.chinese, "word 与 chinese 应保持一致");
    assert.equal(entry.mode, "chinese", `汉字包条目应为 chinese 模式: ${entry.word}`);
    assert.ok(typeof entry.english === "string" && entry.english.trim(), `english 释义不能为空: ${entry.word}`);
    assert.ok(typeof entry.pinyin === "string" && entry.pinyin.trim(), `pinyin 不能为空: ${entry.word}`);
    assert.ok(Array.isArray(entry.examples), `examples 应为数组: ${entry.word}`);
    assert.ok(entry.examples.length >= 1 && entry.examples.length <= 2, `examples 应控制在 1-2 个: ${entry.word}`);
    assert.ok(typeof entry.phrase === "string" && entry.phrase.trim(), `phrase 应包含英文例词释义: ${entry.word}`);
    assert.ok(typeof entry.phraseTranslation === "string" && entry.phraseTranslation.trim(), `phraseTranslation 应包含中文例词: ${entry.word}`);
    assert.equal(hasSentencePunctuation(entry.phraseTranslation), false, `phraseTranslation 应是组词而不是整句: ${entry.word}`);
  }

  const words = new Set(pack.map((entry) => entry.word));
  for (const required of ["人", "大", "小", "学", "家", "猫", "狗", "妈", "爸", "我"]) {
    assert.ok(words.has(required), `汉字包应包含基础单字 ${required}`);
  }

  const imageful = pack.filter((entry) => Array.isArray(entry.imageURLs) && entry.imageURLs.length > 0);
  assert.ok(imageful.length >= 20, "具体可视化的单字应保留一批图片资源");
}

function testBilingualRuntimeKeepsHanziFields() {
  const source = read("src/modules/09-vocab.js");

  assert.match(source, /english:\s*String\(raw\.english\s*\|\|\s*""\)\.trim\(\)/, "normalizeWordContent 应保留 english 字段");
  assert.match(source, /character:\s*String\(raw\.character\s*\|\|\s*raw\.chinese\s*\|\|\s*""\)\.trim\(\)/, "normalizeWordContent 应保留 character 字段");
  assert.match(source, /examples:\s*Array\.isArray\(raw\.examples\)\s*\?\s*raw\.examples\s*:\s*\[\]/, "normalizeWordContent 应保留 examples 数组");
  assert.match(source, /pinyin:\s*String\(raw\.pinyin\s*\|\|\s*""\)\.trim\(\)/, "normalizeWordContent 应保留 pinyin");
  assert.match(source, /const isHanziWord =[\s\S]*safeWord\.character[\s\S]*safeWord\.examples/, "中文显示逻辑应识别汉字包条目");
  assert.match(source, /secondaryText:\s*safeWord\.english\s*\|\|\s*primaryEnglish/, "汉字包中文模式下应显示英文释义");
}

function testSessionSummarySkipsDuplicateSecondaryText() {
  const source = read("src/modules/10-ui.js");

  assert.match(source, /function formatSessionSummaryEntry\(/, "应抽出局内摘要格式化函数");
  assert.match(source, /if\s*\(!secondary\s*\|\|\s*secondary\s*===\s*primary\)\s*return/, "摘要格式化应跳过重复副标题");
}

function run() {
  testKindergartenHanziUsesSingleCharacterEntries();
  testBilingualRuntimeKeepsHanziFields();
  testSessionSummarySkipsDuplicateSecondaryText();
  console.log("kindergarten hanzi regression checks passed");
}

run();
