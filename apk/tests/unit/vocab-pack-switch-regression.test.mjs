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

function getManifest(context) {
  return context.window.vocabManifest || context.window.MMWG_VOCAB_MANIFEST;
}

function getPackFirstWord(manifest, packId) {
  const pack = manifest.packs.find((item) => item && item.id === packId);
  assert.ok(pack, `Expected vocab pack: ${packId}`);
  const words = typeof pack.getRaw === "function" ? pack.getRaw() : [];
  assert.ok(Array.isArray(words) && words.length > 0, `${packId} should return a non-empty array`);
  return String(words[0]?.word || words[0]?.standardized || "").toLowerCase();
}

function assertPackStartsWithWord(manifest, packId, expectedWord) {
  const firstWord = getPackFirstWord(manifest, packId);
  assert.equal(
    firstWord,
    expectedWord,
    `${packId} should keep a stable first word to confirm manifest mapping`
  );
}

function testManifestResolvesConstDefinedPackGlobals() {
  const context = createBrowserContext();

  runInContext(context, "words/vocabs/05_\u521d\u4e2d/junior_high_basic.js");
  runInContext(context, "words/vocabs/manifest.js");

  const manifest = getManifest(context);
  assert.ok(manifest && Array.isArray(manifest.packs), "manifest should load");
  assertPackStartsWithWord(manifest, "vocab.junior_high.basic", "ability");
}

function testManifestResolvesMinecraftAndHanziPackGlobals() {
  const context = createBrowserContext();

  assert.doesNotThrow(
    () => runInContext(context, "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed\u5b8c\u6574\u8bcd\u5e93.js"),
    "kindergarten vocab should load in browser context"
  );
  runInContext(context, "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_intermediate.js");
  runInContext(context, "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_words_full.js");
  assert.doesNotThrow(
    () => runInContext(context, "words/vocabs/06_\u6c49\u5b57/\u5e7c\u513f\u56ed\u6c49\u5b57.js"),
    "hanzi vocab should load in browser context"
  );
  assert.doesNotThrow(
    () => runInContext(context, "words/vocabs/07_\u62fc\u97f3/\u5e38\u7528\u62fc\u97f3.js"),
    "pinyin vocab should load in browser context"
  );
  assert.doesNotThrow(
    () => runInContext(context, "words/vocabs/08_\u5e7c\u5c0f\u8854\u63a5/\u5e7c\u5c0f\u8854\u63a5\u603b\u8bcd\u5e93.js"),
    "bridge vocab should load in browser context"
  );
  runInContext(context, "words/vocabs/manifest.js");

  const manifest = getManifest(context);
  assert.ok(manifest && Array.isArray(manifest.packs), "manifest should load Minecraft/hanzi");
  assertPackStartsWithWord(manifest, "vocab.minecraft.intermediate", "diamond");
  assertPackStartsWithWord(manifest, "vocab.minecraft.full", "air");
  const bridgeFirst = getPackFirstWord(manifest, "vocab.bridge.full");
  assert.equal(bridgeFirst, "\u4e00", "bridge pack should start with the expected anchor word");
  assert.equal(
    getPackFirstWord(manifest, "vocab.kindergarten.hanzi"),
    "\u4e00",
    "hanzi pack should use the standalone hanzi source"
  );
  assert.equal(
    getPackFirstWord(manifest, "vocab.kindergarten.pinyin"),
    "y\u012b",
    "pinyin pack should use the standalone pinyin source"
  );
}

function testDefaultVocabSelectionExistsInCurrentManifest() {
  const context = createBrowserContext();

  runInContext(context, "src/defaults.js");
  runInContext(context, "words/vocabs/manifest.js");

  const defaultSelection = context.window.MMWG_DEFAULTS?.settings?.vocabSelection;
  const manifest = getManifest(context);

  assert.ok(defaultSelection, "default settings should declare vocabSelection");
  assert.ok(
    manifest?.byId?.[defaultSelection],
    `default vocabSelection should exist in manifest, current: ${defaultSelection}`
  );
}

function testVocabSelectUsesPackTitlesInsteadOfDuplicateLevelOnlyLabels() {
  const source = read("src/modules/09-vocab.js");

  assert.match(source, /function getVocabPackOptionLabel\(/, "词库设置应提供独立的选项标签生成器");
  assert.match(source, /String\(pack\?\.title \|\| ""\)\.trim\(\)/, "词库设置标签应优先保留 pack.title");
  assert.match(source, /pack\?\.mode === "chinese"/, "词库设置标签应识别汉字词库");
  assert.match(source, /pack\?\.mode === "pinyin"/, "词库设置标签应识别拼音词库");
  assert.doesNotMatch(source, /const title = levelLabel \? `\$\{levelLabel\}` : p\.title;/, "词库设置不应再只显示重复的等级名");
}

function testChineseModeUsesStableWordIdentityForDeduping() {
  const source = read("src/modules/09-vocab.js");

  assert.match(source, /function getNormalizedWordIdentity\(/, "词库切换应使用独立的词条标识函数");
  assert.match(source, /w\.character \|\| w\.chinese \|\| w\.zh \|\| w\.word \|\| w\.en/, "汉字词库去重应优先使用汉字本体");
  assert.doesNotMatch(source, /if \(seen\.has\(w\.en\)\) return;/, "词库切换不应再只按英文释义去重");
}

function testStandaloneHanziAndPinyinSelectionsAreNotAliasedToBridge() {
  const source = read("src/modules/09-vocab.js");

  assert.doesNotMatch(source, /"vocab\.kindergarten\.hanzi":\s*"vocab\.bridge\.full"/, "汉字词库选择不应再被旧别名强制映射到幼小衔接总词库");
  assert.doesNotMatch(source, /"vocab\.kindergarten\.pinyin":\s*"vocab\.bridge\.full"/, "拼音词库选择不应再被旧别名强制映射到幼小衔接总词库");
  assert.match(source, /const DIRECT_PINYIN_PACK_IDS = Object\.freeze\(\[/, "幼小衔接模式应允许显式拼音词库白名单");
  assert.match(source, /DIRECT_PINYIN_PACK_IDS\.includes\(currentSelection\)/, "幼小衔接模式不应把显式拼音词库改回桥接轮换");
}

function testVocabPreviewAndSwitchCopyUseUnifiedDisplayLabels() {
  const source = read("src/modules/09-vocab.js");

  assert.match(source, /function getVocabPackDisplayTitle\(/, "词库预览与切换提示应共用展示标题函数");
  assert.match(source, /function getVocabPackMetaLabels\(/, "词库预览应共用展示标签函数");
  assert.match(source, /const VOCAB_DIFFICULTY_DISPLAY_LABELS = \{/, "词库预览应提供内部难度到展示文案的映射");
  assert.match(source, /"language": "语文"/, "幼小衔接语文词库预览应显示中文标签");
  assert.match(source, /"math": "数学"/, "幼小衔接数学词库预览应显示中文标签");
  assert.match(source, /"english": "英语"/, "幼小衔接英语词库预览应显示中文标签");
  assert.match(source, /随机词库（按类别轮换）/, "自动词库应保留清晰的总入口名称");
  assert.match(source, /幼小衔接（语文\/数学\/英语轮换）/, "幼小衔接自动轮换应使用更自然的名称");
}

function testWordPickerUsesStableWordKeysAcrossModes() {
  const vocabSource = read("src/modules/09-vocab.js");
  const pickerSource = read("src/modules/11-game-init.js");
  const challengeSource = read("src/modules/12-challenges.js");
  const loopSource = read("src/modules/13-game-loop.js");

  assert.match(vocabSource, /window\.BilingualVocab = \{[\s\S]*getWordKey/s, "词汇模块应继续暴露统一词条键函数");
  assert.match(pickerSource, /function getWordPickerKey\(/, "抽词器应提供稳定词条键函数");
  assert.match(pickerSource, /window\.BilingualVocab\?\.getWordKey\?\.?\(wordObj\)/, "抽词器应优先复用统一词条键");
  assert.doesNotMatch(pickerSource, /const unseen = shuffle\(base\.map\(w => w\.en\)\)/, "抽词器不应再只按 en 建立未见词队列");
  assert.doesNotMatch(pickerSource, /__sourceWordEn:/, "跟随短语队列不应再保留旧 en 来源键");
  assert.doesNotMatch(pickerSource, /__sourceWordKey \|\| phraseItem\.__sourceWordEn/, "跟随短语去重不应再回退到旧 en 来源键");
  assert.doesNotMatch(pickerSource, /q\.__sourceWordKey \|\| q\.__sourceWordEn/, "跟随短语队列比对应只使用稳定来源键");
  assert.doesNotMatch(challengeSource, /wordPicker\.updateWordQuality\(wordObj\.en,/, "挑战结果回写不应再只按 en 更新抽词器");
  assert.doesNotMatch(loopSource, /wordPicker\.updateWordQuality\(item\.wordObj\.en,/, "拾取结果回写不应再只按 en 更新抽词器");
}

function testChallengeDistinctWordPoolUsesStableWordKeys() {
  const challengeSource = read("src/modules/12-challenges.js");

  assert.match(challengeSource, /function pickDistinctWords\(/, "挑战候选词应保留独立的去重入口");
  assert.match(challengeSource, /const currentKey = getWordKeySafe\(wordObj\);/, "挑战候选词应先取当前词条稳定键");
  assert.match(challengeSource, /key === currentKey/, "挑战候选词应按稳定键排除当前词条");
  assert.doesNotMatch(challengeSource, /const pool = wordDatabase\.filter\(w => w && w\.en && w\.en !== wordObj\.en\);/, "挑战候选词不应再只按 en 排除自身");
}

function testTtsProviderDoesNotForceBrokenApkProviderWithoutNativeRuntime() {
  const source = read("src/modules/17-bootstrap.js");

  assert.match(source, /function canUseApkTtsProvider\(/, "TTS 初始化应先判断 APK provider 是否真的可用");
  assert.match(source, /const isNativeApk = canUseApkTtsProvider\(\)/, "TTS 初始化应把 native 可用性单独抽出判断");
  assert.match(source, /apkDiagnosis\?\.available \|\| isNativeApk/, "APK provider 不可用时应允许回退到其他 TTS provider");
}

function run() {
  testManifestResolvesConstDefinedPackGlobals();
  testManifestResolvesMinecraftAndHanziPackGlobals();
  testDefaultVocabSelectionExistsInCurrentManifest();
  testVocabSelectUsesPackTitlesInsteadOfDuplicateLevelOnlyLabels();
  testChineseModeUsesStableWordIdentityForDeduping();
  testStandaloneHanziAndPinyinSelectionsAreNotAliasedToBridge();
  testVocabPreviewAndSwitchCopyUseUnifiedDisplayLabels();
  testWordPickerUsesStableWordKeysAcrossModes();
  testChallengeDistinctWordPoolUsesStableWordKeys();
  testTtsProviderDoesNotForceBrokenApkProviderWithoutNativeRuntime();
  console.log("vocab pack switch regression checks passed");
}

run();
