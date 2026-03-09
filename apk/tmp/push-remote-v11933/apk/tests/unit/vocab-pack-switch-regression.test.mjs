import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runInContext(context, relPath) {
  vm.runInContext(read(relPath), context, { filename: relPath });
}

function testManifestResolvesConstDefinedPackGlobals() {
  const context = { console };
  context.window = context;
  vm.createContext(context);

  runInContext(context, "words/vocabs/05_初中/junior_high_basic.js");
  runInContext(context, "words/vocabs/manifest.js");

  const manifest = context.window.vocabManifest || context.window.MMWG_VOCAB_MANIFEST;
  assert.ok(manifest && Array.isArray(manifest.packs), "manifest 应成功加载");

  const pack = manifest.packs.find((item) => item && item.id === "vocab.junior_high.basic");
  assert.ok(pack, "应能找到初中基础词库 pack");

  const words = typeof pack.getRaw === "function" ? pack.getRaw() : [];
  assert.ok(Array.isArray(words), "pack.getRaw 应返回数组");
  assert.ok(words.length > 0, "pack.getRaw 应能取到 const 定义的真实词库，而不是空数组");
  assert.equal(
    String(words[0]?.word || words[0]?.standardized || "").toLowerCase(),
    "ability",
    "初中基础词库的首词应来自 junior_high_basic.js"
  );
}

function testDefaultVocabSelectionExistsInCurrentManifest() {
  const context = { console };
  context.window = context;
  vm.createContext(context);

  runInContext(context, "src/defaults.js");
  runInContext(context, "words/vocabs/manifest.js");

  const defaultSelection = context.window.MMWG_DEFAULTS?.settings?.vocabSelection;
  const manifest = context.window.vocabManifest || context.window.MMWG_VOCAB_MANIFEST;

  assert.ok(defaultSelection, "默认设置应声明 vocabSelection");
  assert.ok(
    manifest?.byId?.[defaultSelection],
    `默认 vocabSelection 应指向 manifest 中存在的 pack，当前为 ${defaultSelection}`
  );
}

function run() {
  testManifestResolvesConstDefinedPackGlobals();
  testDefaultVocabSelectionExistsInCurrentManifest();
  console.log("vocab pack switch regression checks passed");
}

run();
