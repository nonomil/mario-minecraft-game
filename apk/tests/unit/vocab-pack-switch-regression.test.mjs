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
    bridgeFirst,
    "legacy hanzi pack should map to bridge pack"
  );
  assert.equal(
    getPackFirstWord(manifest, "vocab.kindergarten.pinyin"),
    bridgeFirst,
    "legacy pinyin pack should map to bridge pack"
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

function run() {
  testManifestResolvesConstDefinedPackGlobals();
  testManifestResolvesMinecraftAndHanziPackGlobals();
  testDefaultVocabSelectionExistsInCurrentManifest();
  console.log("vocab pack switch regression checks passed");
}

run();
