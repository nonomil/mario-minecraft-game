import assert from "node:assert/strict";
import fs from "node:fs";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function testRecoveryQuizPrefersLearningDrivenQuestionTypes() {
  const source = readModuleCode("src/modules/12-challenges.js");
  assert.match(
    source,
    /if \(subject === "english"\) return \["listen", "fill_blank", "multi_blank", "unscramble"\];/,
    "英语恢复测验应优先使用听音、填空、多空和重组，而不是继续用易蒙的 translate"
  );
  assert.match(
    source,
    /return \["listen", "fill_blank", "multi_blank", "unscramble"\];/,
    "默认恢复测验题池应去掉 translate，提升学习性"
  );
}

function testWordMatchWrongPairDisappearsImmediately() {
  const source = readModuleCode("src/modules/10-ui.js");
  assert.match(
    source,
    /if \(leftId !== rightId\) \{[\s\S]*?classList\.add\("wrong"\)[\s\S]*?return;/,
    "连线错配时应立即标红后清除，不应把错误连线保留在画面上"
  );
  assert.doesNotMatch(
    source,
    /this\.connections\.push\(\{ left: leftId, right: rightId \}\);[\s\S]*?stroke="\$\{isCorrect \? "#4CAF50" : "#FFCA28"\}"/,
    "旧的错线常驻逻辑应被移除"
  );
}

function testWordMatchRequiresPerfectAccuracyIfReused() {
  const source = readModuleCode("src/modules/10-ui.js");
  assert.match(
    source,
    /const success = correct >= this\.words\.length;/,
    "如果未来仍启用连线复活，必须全部配对正确才算通过"
  );
  assert.match(
    source,
    /错配会自动消失/,
    "连线提示文案应明确告诉玩家错误连线会自动消失"
  );
  assert.match(
    source,
    /playerHp = playerMaxHp;/,
    "连线全部答对后应直接满血复活，不应只恢复固定几格血"
  );
}

function run() {
  testRecoveryQuizPrefersLearningDrivenQuestionTypes();
  testWordMatchWrongPairDisappearsImmediately();
  testWordMatchRequiresPerfectAccuracyIfReused();
  console.log("recovery learning regression checks passed");
}

run();
