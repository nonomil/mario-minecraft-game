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

function testHanziRelationsHaveBasics() {
  const relations = loadGlobal("words/vocabs/06_汉字/汉字关联.js", "HANZI_RELATIONS");
  assert.ok(relations && typeof relations === "object", "汉字关联表应存在");
  assert.ok(relations["日"], "汉字关联表应包含基础象形字：日");
}

testHanziRelationsHaveBasics();
