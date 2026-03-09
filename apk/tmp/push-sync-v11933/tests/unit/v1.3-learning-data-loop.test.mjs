import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function createDomElementStub() {
  return {
    classList: {
      add() {},
      remove() {}
    },
    style: {},
    dataset: {},
    innerHTML: "",
    innerText: "",
    value: "",
    disabled: false,
    addEventListener() {},
    appendChild() {},
    setAttribute() {},
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
}

function createContext() {
  const context = {
    console,
    Math,
    Date,
    setTimeout(fn) {
      if (typeof fn === "function") fn();
      return 1;
    },
    clearTimeout() {},
    setInterval() {
      return 1;
    },
    clearInterval() {},
    mergeDeep(base, extra) {
      return { ...(base || {}), ...(extra || {}) };
    },
    clamp(v, min, max) {
      return Math.max(min, Math.min(max, Number(v) || 0));
    },
    parseKeyCodes() {
      return ["Space", "KeyJ"];
    },
    SPEED_LEVELS: { normal: 1 },
    defaultSettings: {},
    defaultControls: {
      jump: "Space",
      attack: "KeyJ",
      interact: "KeyY",
      switch: "KeyK",
      useDiamond: "KeyZ"
    },
    settings: {},
    storage: null,
    progress: { vocab: {} },
    vocabState: { runCounts: {}, lastPackId: null },
    vocabManifest: {
      version: "test",
      packs: [],
      byId: {}
    },
    vocabEngine: null,
    vocabPackOrder: [],
    vocabPacks: {},
    activeVocabPackId: null,
    loadedVocabFiles: {},
    defaultWords: [],
    wordDatabase: [],
    wordPicker: null,
    sessionWordCounts: {},
    sessionCollectedWords: [],
    onWordCollectedCalls: 0,
    onWordCollected() {},
    saveProgressCalls: 0,
    saveProgress() {},
    saveVocabState() {},
    updateVocabProgressUI() {},
    renderVocabSelect() {},
    updateVocabPreview() {},
    switchToNextPackInOrder() {},
    getViewportSize() {
      return { width: 800, height: 600 };
    },
    getGameAreaSize() {
      return { width: 800, height: 600 };
    },
    applyConfig() {},
    worldScale: { unit: 1 },
    lastViewport: { width: 800, height: 600 },
    requestAnimationFrame(cb) {
      cb();
      return 1;
    },
    startedOnce: false,
    nowMs() {
      return Date.now();
    },
    viewportIgnoreUntilMs: 0,
    startOverlayActive: false,
    paused: false,
    document: {
      getElementById() {
        return null;
      },
      createElement() {
        return createDomElementStub();
      },
      head: {
        appendChild() {}
      }
    },
    window: {},
    inventory: {},
    ITEM_ICONS: {},
    updateInventoryUI() {},
    showFloatingText() {},
    showToast() {},
    challengeModalEl: null,
    challengeQuestionEl: null,
    challengeOptionsEl: null,
    challengeInputWrapperEl: null,
    challengeInputEl: null,
    challengeRepeatBtn: null,
    challengeHintBtn: null,
    challengeTimerEl: null,
    challengeTimerId: null,
    challengeDeadline: Date.now() + 10000,
    currentLearningChallenge: null,
    challengeOrigin: null,
    LEARNING_CONFIG: {
      challenge: {
        timeLimit: 10000,
        rewards: {
          correct: { score: 10, diamond: 1 },
          wrong: { scorePenalty: 5 }
        }
      }
    },
    addScore() {},
    player: { x: 10, y: 10 },
    WordGate: class WordGate {},
    hideLearningChallenge() {},
    popPause() {},
    startLearningChallenge() {},
    speakWord() {},
    escapeHtml(text) {
      return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
  };
  context.onWordCollected = () => {
    context.onWordCollectedCalls += 1;
  };
  context.saveProgress = () => {
    context.saveProgressCalls += 1;
  };
  vm.createContext(context);
  return context;
}

function runModules(context) {
  vm.runInContext(readModuleCode("src/modules/09-vocab.js"), context, {
    filename: "09-vocab.js"
  });
  vm.runInContext(readModuleCode("src/modules/12-challenges.js"), context, {
    filename: "12-challenges.js"
  });
}

async function testNormalizeProgressMigratesLegacyShape() {
  const context = createContext();
  runModules(context);

  const now = Date.now();
  const migrated = context.normalizeProgress({
    vocab: {
      packA: {
        unique: {
          apple: 1,
          banana: {
            seen: 4,
            correct: 3,
            wrong: 1,
            lastSeen: now - 1000,
            quality: "wrong"
          }
        }
      }
    }
  });

  assert.equal(typeof migrated.vocab.packA.unique.apple, "object");
  assert.equal(migrated.vocab.packA.unique.apple.seen, 1);
  assert.equal(migrated.vocab.packA.unique.apple.correct, 0);
  assert.equal(migrated.vocab.packA.unique.apple.wrong, 0);
  assert.equal(migrated.vocab.packA.unique.apple.quality, "new");
  assert.equal(migrated.vocab.packA.unique.banana.quality, "wrong");
}

async function testRecordWordProgressStoresStructuredEntry() {
  const context = createContext();
  runModules(context);
  context.activeVocabPackId = "packA";
  context.wordDatabase = [{ en: "apple" }, { en: "banana" }];
  context.progress = context.normalizeProgress({
    vocab: {
      packA: { unique: {}, uniqueCount: 0, total: 2, completed: false }
    }
  });

  context.recordWordProgress({ en: "apple", zh: "苹果" });
  context.recordWordProgress({ en: "apple", zh: "苹果" });
  const pack = context.getPackProgress("packA");
  const entry = pack.unique.apple;

  assert.equal(typeof entry, "object");
  assert.equal(entry.seen, 2);
  assert.equal(entry.correct, 0);
  assert.equal(entry.wrong, 0);
  assert.equal(pack.uniqueCount, 1);
}

async function testCompleteLearningChallengeWritesQualityBack() {
  const context = createContext();
  runModules(context);
  context.activeVocabPackId = "packA";
  context.progress = context.normalizeProgress({
    vocab: {
      packA: { unique: {}, uniqueCount: 0, total: 10, completed: false }
    }
  });
  const qualityCalls = [];
  context.wordPicker = {
    updateWordQuality(en, quality) {
      qualityCalls.push({ en, quality });
    }
  };
  context.settings.learningMode = false;

  context.currentLearningChallenge = { wordObj: { en: "apple", zh: "苹果" } };
  context.challengeDeadline = Date.now() + 10000;
  context.completeLearningChallenge(true);
  let entry = context.getPackProgress("packA").unique.apple;
  assert.equal(entry.correct, 1);
  assert.equal(entry.quality, "correct_fast");

  context.currentLearningChallenge = { wordObj: { en: "apple", zh: "苹果" } };
  context.challengeDeadline = Date.now() + 10000;
  context.completeLearningChallenge(false);
  entry = context.getPackProgress("packA").unique.apple;
  assert.equal(entry.wrong, 1);
  assert.equal(entry.quality, "wrong");
  assert.ok(qualityCalls.length >= 2);
}

async function testSetActiveVocabPackReplaysHistoryQuality() {
  const context = createContext();
  runModules(context);
  const replayCalls = [];
  context.buildWordPicker = () => ({
    updateWordQuality(en, quality) {
      replayCalls.push({ en, quality });
    }
  });
  context.vocabManifest = {
    version: "test",
    packs: [
      {
        id: "packA",
        title: "packA",
        getRaw() {
          return [
            { standardized: "apple", chinese: "苹果" },
            { standardized: "banana", chinese: "香蕉" }
          ];
        }
      }
    ]
  };
  context.progress = context.normalizeProgress({
    vocab: {
      packA: {
        unique: {
          apple: { seen: 3, correct: 1, wrong: 2, lastSeen: Date.now(), quality: "wrong" },
          banana: { seen: 2, correct: 2, wrong: 0, lastSeen: Date.now(), quality: "correct_slow" },
          cat: { seen: 1, correct: 0, wrong: 0, lastSeen: Date.now(), quality: "new" }
        },
        uniqueCount: 3,
        total: 3,
        completed: false
      }
    }
  });

  const ok = await context.setActiveVocabPack("packA");
  assert.equal(ok, true);
  assert.deepEqual(replayCalls, [
    { en: "apple", quality: "wrong" },
    { en: "banana", quality: "correct_slow" }
  ]);
}

async function testBuildSessionWordsSummaryRendersClickableWords() {
  const context = createContext();
  runModules(context);
  context.sessionCollectedWords = [
    { en: "apple", zh: "苹果" },
    { en: "banana", zh: "香蕉" },
    { en: "apple", zh: "苹果" }
  ];
  const html = context.buildSessionWordsSummary();
  assert.match(html, /session-words-summary/);
  assert.match(html, /session-word/);
  assert.match(html, /speakSessionWordByText/);
}

async function run() {
  await testNormalizeProgressMigratesLegacyShape();
  await testRecordWordProgressStoresStructuredEntry();
  await testCompleteLearningChallengeWritesQualityBack();
  await testSetActiveVocabPackReplaysHistoryQuality();
  await testBuildSessionWordsSummaryRendersClickableWords();
  // eslint-disable-next-line no-console
  console.log("v1.3 data loop unit checks passed");
}

run().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
