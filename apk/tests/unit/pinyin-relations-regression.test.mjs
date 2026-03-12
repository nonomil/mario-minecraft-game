import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function loadGlobal(relPath, globalName) {
  const context = { console };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(read(relPath), context, { filename: relPath });
  return vm.runInContext(globalName, context);
}

function testPinyinRelationsHaveBasics() {
  const relations = loadGlobal("words/vocabs/07_拼音/拼音关联.js", "PINYIN_RELATIONS");
  assert.ok(relations && typeof relations === "object", "拼音关联表应存在");
  assert.ok(relations["ba"], "拼音关联表应包含基础拼音：ba");
}

testPinyinRelationsHaveBasics();
