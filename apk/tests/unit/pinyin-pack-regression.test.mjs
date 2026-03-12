import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function loadPinyinPack() {
  const context = { console };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(read("words/vocabs/07_拼音/常用拼音.js"), context, {
    filename: "words/vocabs/07_拼音/常用拼音.js"
  });
  return vm.runInContext("PINYIN_CORE_PACK", context);
}

function testPinyinPackExists() {
  const pack = loadPinyinPack();
  assert.ok(Array.isArray(pack) && pack.length > 0, "拼音词库应存在且非空");
  for (const entry of pack) {
    assert.ok(entry.pinyin && entry.base, `拼音条目必须包含 pinyin/base: ${entry.word}`);
    assert.equal(entry.mode, "pinyin", "拼音条目应标记为 pinyin 模式");
  }
}

testPinyinPackExists();
