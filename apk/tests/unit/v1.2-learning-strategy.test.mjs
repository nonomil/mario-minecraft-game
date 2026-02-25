import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runScriptInContext(context, relPath) {
  vm.createContext(context);
  vm.runInContext(readModuleCode(relPath), context, { filename: relPath });
}

function createChallengeContext() {
  const randomMath = Object.create(Math);
  const context = {
    console,
    Math: randomMath,
    Date,
    setTimeout: () => 1,
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    settings: {
      learningMode: true,
      challengeEnabled: true,
      challengeMode: false,
      challengeFrequency: 0.3
    },
    sessionWordCounts: Object.create(null),
    sessionCollectedWords: [],
    currentLearningChallenge: null,
    challengeOrigin: null,
    challengeDeadline: Date.now() + 15000,
    challengeTimerId: null,
    challengeModalEl: null,
    challengeInputEl: null,
    challengeInputWrapperEl: null,
    challengeQuestionEl: null,
    challengeOptionsEl: null,
    challengeRepeatBtn: null,
    challengeHintBtn: null,
    challengeTimerEl: null,
    WordGate: class WordGate {},
    player: { x: 0, y: 0 },
    paused: false,
    LEARNING_CONFIG: {
      challenge: {
        timeLimit: 15000,
        rewards: {
          correct: { score: 20, diamond: 1 },
          wrong: { scorePenalty: 8 }
        }
      }
    },
    inventory: { diamond: 0 },
    wordDatabase: [],
    wordPicker: {
      getWordStats() {
        return null;
      },
      updateWordQuality() {}
    },
    addScore() {},
    updateInventoryUI() {},
    showFloatingText() {},
    showToast() {},
    hideLearningChallenge() {},
    speakWord() {},
    pushPause() {},
    popPause() {},
    document: {
      createElement() {
        return {
          className: "",
          style: {},
          innerHTML: "",
          appendChild() {},
          querySelector() {
            return null;
          }
        };
      }
    },
    shuffle(arr) {
      return [...arr];
    },
    getDifficultyState() {
      return null;
    }
  };
  return context;
}

function createDifficultyContext(streaks) {
  function isObject(x) {
    return x && typeof x === "object" && !Array.isArray(x);
  }

  function mergeDeep(target, source) {
    if (!isObject(target) || !isObject(source)) return source;
    const out = { ...target };
    for (const [key, value] of Object.entries(source)) {
      if (isObject(value) && isObject(out[key])) {
        out[key] = mergeDeep(out[key], value);
      } else if (Array.isArray(value)) {
        out[key] = value.slice();
      } else {
        out[key] = value;
      }
    }
    return out;
  }

  return {
    console,
    Math,
    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    },
    mergeDeep,
    DEFAULT_DIFFICULTY_CONFIG: {
      damageUnit: 20,
      invincibleFrames: 120,
      tiers: [
        {
          name: "normal",
          minScore: 0,
          maxScore: 999999,
          enemyDamage: 1,
          enemyHp: 1,
          enemySpawn: 1,
          chestSpawn: 1,
          chestRareBoost: 0,
          chestRollBonus: 0,
          scoreMultiplier: 1
        }
      ],
      dda: { enabled: false }
    },
    gameConfig: { difficulty: {} },
    difficultyConfigCache: null,
    settings: {
      learningMode: true,
      challengeFrequency: 0.3,
      difficultySelection: "auto"
    },
    runBestScore: 0,
    playerHp: 3,
    gameFrame: 0,
    lastDamageFrame: 0,
    gameState: { flowerBuffTimer: 0 },
    getLearningStreaks() {
      return { ...streaks };
    },
    showToast() {},
    difficultyState: null,
    document: {
      getElementById() {
        return null;
      }
    }
  };
}

function testChallengeTriggerByMastery() {
  const context = createChallengeContext();
  runScriptInContext(context, "src/modules/12-challenges.js");

  context.sessionWordCounts.apple = 1;
  context.Math.random = () => 0.15;
  assert.equal(
    context.shouldTriggerLearningChallenge({ en: "apple" }),
    false,
    "new word should have lower trigger chance"
  );

  context.sessionWordCounts.apple = 2;
  assert.equal(
    context.shouldTriggerLearningChallenge({ en: "apple" }),
    true,
    "seen words should use base trigger chance"
  );

  context.sessionWordCounts.apple = 3;
  context.wordPicker.getWordStats = () => ({ quality: "wrong" });
  context.Math.random = () => 0.55;
  assert.equal(
    context.shouldTriggerLearningChallenge({ en: "apple" }),
    true,
    "wrong words should trigger more often for remediation"
  );

  context.wordPicker.getWordStats = () => ({ quality: "correct_fast" });
  context.Math.random = () => 0.25;
  assert.equal(
    context.shouldTriggerLearningChallenge({ en: "apple" }),
    false,
    "mastered words should trigger less often"
  );
}

function testWrongPenaltyRequiresChallengeMode() {
  function runPenaltyCase(challengeMode) {
    const context = createChallengeContext();
    context.settings.challengeMode = challengeMode;
    let scoreDelta = 0;
    context.addScore = delta => {
      scoreDelta += Number(delta) || 0;
    };
    runScriptInContext(context, "src/modules/12-challenges.js");
    context.currentLearningChallenge = {
      type: "translate",
      wordObj: { en: "apple", zh: "苹果" }
    };
    context.challengeDeadline = Date.now() + 3000;
    context.completeLearningChallenge(false);
    return scoreDelta;
  }

  assert.equal(
    runPenaltyCase(false),
    0,
    "wrong answer should not deduct score in default tolerant mode"
  );
  assert.equal(
    runPenaltyCase(true),
    -8,
    "wrong answer should deduct score when challengeMode is enabled"
  );
}

function testMultiBlankDistractorsUseSimilarLetters() {
  const context = createChallengeContext();
  runScriptInContext(context, "src/modules/12-challenges.js");

  const randomSeq = [0.1, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94];
  let idx = 0;
  context.Math.random = () => {
    const value = randomSeq[idx % randomSeq.length];
    idx++;
    return value;
  };

  const payload = context.generateMultiBlankChallenge({ en: "game", zh: "游戏" });
  assert.ok(payload, "multi-blank payload should be generated");
  assert.equal(payload.answer.length, 1, "4-letter words should use one missing letter");

  const allowed = new Set(context.generateLetterOptions(payload.answer, 4));
  const distractors = payload.options.filter(option => !option.correct);
  for (const option of distractors) {
    assert.ok(
      allowed.has(option.value),
      `distractor "${option.value}" should come from similar-letter pool`
    );
  }
}

function testLearningStreakTracking() {
  function assertStreaks(actual, expectedCorrect, expectedWrong, message) {
    assert.equal(actual.correct, expectedCorrect, `${message} (correct)`);
    assert.equal(actual.wrong, expectedWrong, `${message} (wrong)`);
  }

  const context = createChallengeContext();
  runScriptInContext(context, "src/modules/12-challenges.js");

  assertStreaks(context.getLearningStreaks(), 0, 0, "streak counters should start at zero");

  context.currentLearningChallenge = {
    type: "translate",
    wordObj: { en: "apple", zh: "苹果" }
  };
  context.challengeDeadline = Date.now() + 3000;
  context.completeLearningChallenge(true);
  assertStreaks(
    context.getLearningStreaks(),
    1,
    0,
    "correct answer should increase correct streak and clear wrong streak"
  );

  context.currentLearningChallenge = {
    type: "translate",
    wordObj: { en: "apple", zh: "苹果" }
  };
  context.challengeDeadline = Date.now() + 3000;
  context.completeLearningChallenge(false);
  assertStreaks(
    context.getLearningStreaks(),
    0,
    1,
    "wrong answer should increase wrong streak and clear correct streak"
  );
}

function testDifficultyAdaptsToLearningStreaks() {
  let context = createDifficultyContext({ correct: 3, wrong: 0 });
  runScriptInContext(context, "src/modules/05-difficulty.js");
  const boosted = context.computeDifficultyState();
  assert.ok(
    boosted.effectiveChallengeFrequency > 0.3,
    "correct streak should increase challenge frequency"
  );
  assert.equal(
    boosted.forcedChallengeType,
    null,
    "correct streak should not force easiest challenge type"
  );

  context = createDifficultyContext({ correct: 0, wrong: 2 });
  runScriptInContext(context, "src/modules/05-difficulty.js");
  const softened = context.computeDifficultyState();
  assert.equal(
    softened.forcedChallengeType,
    "translate",
    "wrong streak should force translate challenge type"
  );
  assert.ok(
    softened.effectiveChallengeFrequency < 0.3,
    "wrong streak should reduce challenge frequency"
  );

  context = createDifficultyContext({ correct: 0, wrong: 4 });
  runScriptInContext(context, "src/modules/05-difficulty.js");
  const moreSoftened = context.computeDifficultyState();
  assert.ok(
    moreSoftened.enemyDamageMult < softened.enemyDamageMult,
    "deep wrong streak should reduce enemy damage multiplier"
  );
}

function run() {
  testChallengeTriggerByMastery();
  testWrongPenaltyRequiresChallengeMode();
  testMultiBlankDistractorsUseSimilarLetters();
  testLearningStreakTracking();
  testDifficultyAdaptsToLearningStreaks();
  // eslint-disable-next-line no-console
  console.log("v1.2 learning strategy checks passed");
}

run();
