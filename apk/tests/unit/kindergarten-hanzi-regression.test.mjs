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

function exampleUsesOnlyPackCharacters(value, allowed) {
  const chars = [...String(value || "").trim()];
  if (chars.length === 0) return false;
  return chars.every((char) => /[\u4e00-\u9fff]/.test(char) && allowed.has(char));
}

function testKindergartenHanziUsesSingleCharacterEntries() {
  const pack = loadKindergartenHanzi();
  const words = new Set(pack.map((entry) => entry.word));
  const gradeBands = new Set(pack.map((entry) => String(entry?.gradeBand || "").trim()).filter(Boolean));
  const entryMap = new Map(pack.map((entry) => [entry.character, entry]));

  assert.equal(pack.length, 800, "幼儿园汉字包应扩充到 800 个手工筛选与联网调研结合的单字");
  for (const entry of pack) {
    assert.ok(isSingleHanzi(entry.word), `word 应是单个汉字: ${entry.word}`);
    assert.ok(isSingleHanzi(entry.character), `character 应是单个汉字: ${entry.character}`);
    assert.ok(isSingleHanzi(entry.chinese), `chinese 应是单个汉字: ${entry.chinese}`);
    assert.equal(entry.word, entry.character, "word 与 character 应保持一致");
    assert.equal(entry.word, entry.chinese, "word 与 chinese 应保持一致");
    assert.equal(entry.mode, "chinese", `汉字包条目应为 chinese 模式: ${entry.word}`);
    assert.ok(typeof entry.gradeBand === "string" && entry.gradeBand.trim(), `gradeBand 不能为空: ${entry.word}`);
    assert.ok(typeof entry.english === "string" && entry.english.trim(), `english 释义不能为空: ${entry.word}`);
    assert.ok(typeof entry.pinyin === "string" && entry.pinyin.trim(), `pinyin 不能为空: ${entry.word}`);
    assert.ok(Array.isArray(entry.examples), `examples 应为数组: ${entry.word}`);
    assert.ok(entry.examples.length >= 1 && entry.examples.length <= 2, `examples 应控制在 1-2 个: ${entry.word}`);
    assert.ok(typeof entry.phrase === "string" && entry.phrase.trim(), `phrase 应包含英文例词释义: ${entry.word}`);
    assert.ok(typeof entry.phraseTranslation === "string" && entry.phraseTranslation.trim(), `phraseTranslation 应包含中文例词: ${entry.word}`);
    assert.equal(hasSentencePunctuation(entry.phraseTranslation), false, `phraseTranslation 应是组词而不是整句: ${entry.word}`);
    for (const example of entry.examples) {
      assert.ok(
        exampleUsesOnlyPackCharacters(example.word, words),
        `examples 应仅使用汉字包内字符: ${entry.word} -> ${example.word}`
      );
    }
  }

  for (const required of ["人", "大", "小", "学", "家", "猫", "狗", "妈", "爸", "我"]) {
    assert.ok(words.has(required), `汉字包应包含基础单字 ${required}`);
  }

  for (const required of ["晨", "晚", "晴", "雪", "班", "读", "讲", "跑", "跳", "洗"]) {
    assert.ok(words.has(required), `汉字包应补齐更贴近低龄场景的常用单字 ${required}`);
  }

  for (const banned of ["婚", "战", "敌", "武", "律", "政", "财", "丧", "暴", "贫", "祭", "宗", "患", "典", "希", "决", "例", "论", "义", "历", "基", "察", "危", "达", "众", "速", "效", "徒", "欲", "祖", "彼", "协", "质", "均", "央", "诸", "军", "施", "益", "宅"]) {
    assert.equal(words.has(banned), false, `汉字包不应保留偏成人或超龄的单字 ${banned}`);
  }

  for (const required of ["兔", "桌", "椅", "级", "哭", "拉", "拍", "伞", "裙", "袜", "帽", "杯", "壶", "雷"]) {
    assert.ok(words.has(required), `汉字包应继续补齐更低龄、更具体的常用单字 ${required}`);
  }

  for (const required of ["铃", "琴", "笛", "盆", "镜", "堆", "洼", "扇", "笼", "剪", "夹", "刷", "柜"]) {
    assert.ok(words.has(required), `汉字包应继续替换为更具体、更易感知的常用单字 ${required}`);
  }

  for (const requiredBand of ["学前", "一年级", "二年级"]) {
    assert.equal(gradeBands.has(requiredBand), true, `汉字包应提供分层年级带: ${requiredBand}`);
  }

  const imageful = pack.filter((entry) => Array.isArray(entry.imageURLs) && entry.imageURLs.length > 0);
  assert.ok(imageful.length >= 20, "具体可视化的单字应保留一批图片资源");

  const bannedGlossSnippets = [
    "China",
    "mainland",
    "ethnic Chinese",
    "Buddhist temple",
    "country or countryside"
  ];

  for (const entry of pack) {
    const glossText = [
      entry.english,
      entry.phrase,
      ...(Array.isArray(entry.examples) ? entry.examples.map((example) => example?.english || "") : [])
    ].join(" ");
    for (const snippet of bannedGlossSnippets) {
      assert.equal(
        glossText.includes(snippet),
        false,
        `汉字包释义不应保留词典腔或不适合低龄儿童的说明: ${entry.character} -> ${snippet}`
      );
    }
  }

  assert.equal(entryMap.get("乡")?.english, "hometown", "乡 应改为更贴近儿童表达的释义 hometown");
  assert.equal(entryMap.get("寺")?.english, "temple", "寺 应使用更基础直接的释义 temple");
  assert.equal(entryMap.get("陆")?.phraseTranslation, "陆地", "陆 应改用更常见直观的组词");
}

function testBilingualRuntimeKeepsHanziFields() {
  const source = read("src/modules/09-vocab.js");

  assert.match(source, /english:\s*String\(raw\.english\s*\|\|\s*""\)\.trim\(\)/, "normalizeWordContent 应保留 english 字段");
  assert.match(source, /character:\s*String\(raw\.character\s*\|\|\s*raw\.chinese\s*\|\|\s*""\)\.trim\(\)/, "normalizeWordContent 应保留 character 字段");
  assert.match(source, /examples:\s*Array\.isArray\(raw\.examples\)\s*\?\s*raw\.examples\s*:\s*\[\]/, "normalizeWordContent 应保留 examples 数组");
  assert.match(source, /pinyin:\s*String\(raw\.pinyin\s*\|\|\s*""\)\.trim\(\)/, "normalizeWordContent 应保留 pinyin");
  assert.match(source, /gradeBand:\s*String\(raw\.gradeBand\s*\|\|\s*""\)\.trim\(\)/, "normalizeWordContent 应保留 gradeBand");
  assert.match(source, /const isHanziWord =[\s\S]*safeWord\.character[\s\S]*safeWord\.examples/, "中文显示逻辑应识别汉字包条目");
  assert.match(source, /secondaryText:\s*safeWord\.pinyin/, "汉字包中文模式下应优先显示拼音");
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
