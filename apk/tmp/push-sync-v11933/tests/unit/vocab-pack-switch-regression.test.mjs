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

function assertPackStartsWithWord(manifest, packId, expectedWord) {
  const pack = manifest.packs.find((item) => item && item.id === packId);
  assert.ok(pack, `应能找到词库 pack: ${packId}`);

  const words = typeof pack.getRaw === "function" ? pack.getRaw() : [];
  assert.ok(Array.isArray(words), `${packId} 的 getRaw 应返回数组`);
  assert.ok(words.length > 0, `${packId} 应能取到真实词库，而不是空数组`);
  assert.equal(
    String(words[0]?.word || words[0]?.standardized || "").toLowerCase(),
    expectedWord,
    `${packId} 的首词应保持稳定，证明 manifest 命中了正确数据源`
  );
}

function testManifestResolvesConstDefinedPackGlobals() {
  const context = createBrowserContext();

  runInContext(context, "words/vocabs/05_初中/junior_high_basic.js");
  runInContext(context, "words/vocabs/manifest.js");

  const manifest = getManifest(context);
  assert.ok(manifest && Array.isArray(manifest.packs), "manifest 应成功加载");
  assertPackStartsWithWord(manifest, "vocab.junior_high.basic", "ability");
}

function testManifestResolvesMinecraftAndHanziPackGlobals() {
  const context = createBrowserContext();

  runInContext(context, "words/vocabs/04_我的世界/minecraft_intermediate.js");
  runInContext(context, "words/vocabs/04_我的世界/minecraft_words_full.js");
  assert.doesNotThrow(
    () => runInContext(context, "words/vocabs/06_汉字/幼儿园汉字.js"),
    "汉字词库文件应兼容浏览器加载，而不是依赖 CommonJS module"
  );
  runInContext(context, "words/vocabs/manifest.js");

  const manifest = getManifest(context);
  assert.ok(manifest && Array.isArray(manifest.packs), "manifest 应成功加载 Minecraft/汉字词库");
  assertPackStartsWithWord(manifest, "vocab.minecraft.intermediate", "diamond");
  assertPackStartsWithWord(manifest, "vocab.minecraft.full", "air");
  assertPackStartsWithWord(manifest, "vocab.kindergarten.hanzi", "smile");
}

function testDefaultVocabSelectionExistsInCurrentManifest() {
  const context = createBrowserContext();

  runInContext(context, "src/defaults.js");
  runInContext(context, "words/vocabs/manifest.js");

  const defaultSelection = context.window.MMWG_DEFAULTS?.settings?.vocabSelection;
  const manifest = getManifest(context);

  assert.ok(defaultSelection, "默认设置应声明 vocabSelection");
  assert.ok(
    manifest?.byId?.[defaultSelection],
    `默认 vocabSelection 应指向 manifest 中存在的 pack，当前为 ${defaultSelection}`
  );
}

function run() {
  testManifestResolvesConstDefinedPackGlobals();
  testManifestResolvesMinecraftAndHanziPackGlobals();
  testDefaultVocabSelectionExistsInCurrentManifest();
  console.log("vocab pack switch regression checks passed");
}

run();
