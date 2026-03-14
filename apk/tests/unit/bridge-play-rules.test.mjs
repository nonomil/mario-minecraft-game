import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function loadBridgeRuleSnippet() {
  const source = read("src/modules/12-challenges.js");
  const start = source.indexOf("// --- Bridge play rules ---");
  assert.ok(start >= 0, "bridge play rules marker not found");
  const end = source.indexOf("// --- Bridge play rules end ---", start);
  assert.ok(end >= 0, "bridge play rules end marker not found");
  const snippet = source.slice(start, end);
  const context = { console };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(snippet, context, { filename: "12-challenges.js::bridge-rules" });
  return context;
}

function testBridgeChallengePool() {
  const ctx = loadBridgeRuleSnippet();
  const poolLangPinyin = ctx.getBridgeChallengeTypePool(
    { subject: "language", chinese: "花", pinyin: "huā" },
    "pinyin"
  );
  assert.ok(poolLangPinyin.includes("pinyin_to_hanzi"));

  const poolMath = ctx.getBridgeChallengeTypePool(
    { subject: "math", word: "加法", keywords: ["相加"] },
    "english"
  );
  assert.ok(poolMath.includes("math_concept"));

  const poolEnglish = ctx.getBridgeChallengeTypePool(
    { subject: "english", word: "apple", english: "apple" },
    "english"
  );
  assert.ok(poolEnglish.includes("fill_blank"));
}

function testBridgeWordGateType() {
  const ctx = loadBridgeRuleSnippet();
  assert.equal(
    ctx.pickBridgeWordGateType({ subject: "math", word: "加法", keywords: ["相加"] }, "english"),
    "math_concept"
  );
  assert.equal(
    ctx.pickBridgeWordGateType({ subject: "language", chinese: "花", pinyin: "huā" }, "pinyin"),
    "pinyin_to_hanzi"
  );
}

testBridgeChallengePool();
testBridgeWordGateType();
