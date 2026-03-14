import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runInContext(context, relPath) {
  vm.runInContext(read(relPath), context, { filename: relPath });
}

function loadBridgePack() {
  const context = { console };
  context.window = context;
  vm.createContext(context);
  runInContext(context, "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed\u5b8c\u6574\u8bcd\u5e93.js");
  runInContext(context, "words/vocabs/06_\u6c49\u5b57/\u5e7c\u513f\u56ed\u6c49\u5b57.js");
  runInContext(context, "words/vocabs/07_\u62fc\u97f3/\u5e38\u7528\u62fc\u97f3.js");
  runInContext(context, "words/vocabs/08_\u5e7c\u5c0f\u8854\u63a5/\u5e7c\u5c0f\u8854\u63a5\u603b\u8bcd\u5e93.js");
  return vm.runInContext("BRIDGE_VOCAB_FULL", context) || [];
}

const pack = loadBridgePack();
assert.ok(pack.length > 0, "bridge vocab pack should not be empty");

const moduleCounts = {};
for (const entry of pack) {
  if (!entry || !entry.subject || !entry.module) continue;
  const key = `${entry.subject}::${entry.module}`;
  moduleCounts[key] = (moduleCounts[key] || 0) + 1;
}

const requiredCounts = [
  ["language", "词语", 1000],
  ["language", "表达", 600],
  ["language", "古诗", 150],
  ["math", "数与运算", 150],
  ["math", "逻辑推理", 150],
  ["math", "量与统计", 150],
  ["math", "图形与空间", 150],
  ["math", "应用题专项", 150],
  ["math", "综合实践", 150],
  ["english", "字母", 250],
  ["english", "自然拼读", 250],
  ["english", "发音", 250],
  ["english", "单词", 250]
];

for (const [subject, moduleName, minCount] of requiredCounts) {
  const key = `${subject}::${moduleName}`;
  const actual = moduleCounts[key] || 0;
  assert.ok(
    actual >= minCount,
    `${key} should have at least ${minCount} entries, got ${actual}`
  );
}
