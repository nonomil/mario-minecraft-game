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
    /showVillageChallengeModal\([\s\S]*?if \(typeof speakWord === "function"\) \{[\s\S]*?speakWord\(\{[\s\S]*?en: pair\.primary,[\s\S]*?phraseTranslation: word\.phraseTranslation[\s\S]*?\}\);[\s\S]*?const modal = getVillageChallengeModal\(\);/,
    "单词屋题目显示后应立即播放读音，而不是等点击选项后才播放"
  );
}

function testPerfectWordHouseRewardRotatesBetweenDragonAndWardenEgg() {
  const source = readModuleCode("src/modules/12-village-challenges.js");
  assert.match(
    source,
    /const PERFECT_WORD_HOUSE_REWARDS = \["dragon_egg", "warden_egg"\];/,
    "单词屋完美奖励应在龙蛋和坚守者蛋之间轮询"
  );
  assert.match(
    source,
    /currentAccount\.progress\.wordHousePerfectRewardCursor/,
    "单词屋奖励轮询游标应写入当前账号进度，避免每次重置"
  );
  assert.match(
    source,
    /inventory\[specialReward\.item\] = \(Number\(inventory\?\.\[specialReward\.item\]\) \|\| 0\) \+ 1;/,
    "单词屋完美通关后应把轮询奖励真正发进背包"
  );
}

function run() {
  testVillageQuestionImmediatelySpeaksWordOnRender();
  testPerfectWordHouseRewardRotatesBetweenDragonAndWardenEgg();
  console.log("village word house regression checks passed");
}

run();
