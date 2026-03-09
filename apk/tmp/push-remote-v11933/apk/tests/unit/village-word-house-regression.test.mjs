import assert from "node:assert/strict";
import fs from "node:fs";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function testVillageQuestionImmediatelySpeaksWordOnRender() {
  const source = readModuleCode("src/modules/12-village-challenges.js");
  const start = source.indexOf("function showVillageQuestion(");
  const end = source.indexOf("function finishVillageChallenge(", start);
  const snippet = start >= 0 && end > start ? source.slice(start, end) : "";

  assert.ok(snippet, "应能定位 showVillageQuestion 函数源码");
  assert.match(
    snippet,
    /showVillageChallengeModal\([\s\S]*?if \(typeof speakWord === "function"\) \{[\s\S]*?speakWord\(\{[\s\S]*?en: word\.en,[\s\S]*?phraseTranslation: word\.phraseTranslation[\s\S]*?\}\);[\s\S]*?const modal = getVillageChallengeModal\(\);/,
    "单词屋题目显示后应立即播放读音，而不是等点击选项后才播放"
  );
}

function run() {
  testVillageQuestionImmediatelySpeaksWordOnRender();
  console.log("village word house regression checks passed");
}

run();
