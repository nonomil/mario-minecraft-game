import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
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
    mergeDeep(base, extra) {
      return { ...(base || {}), ...(extra || {}) };
    },
    clamp(value, min, max) {
      return Math.max(min, Math.min(max, Number(value) || 0));
    },
    parseKeyCodes() {
      return ["Space", "KeyJ", "KeyY", "KeyK", "KeyZ"];
    },
    SPEED_LEVELS: { normal: 1 },
    defaultSettings: {
      languageMode: "english",
      showPinyin: true,
      bridgeGradeScope: "preschool_grade2"
    },
    defaultControls: {
      jump: "Space",
      attack: "KeyJ",
      interact: "KeyY",
      switch: "KeyK",
      useDiamond: "KeyZ"
    },
    settings: {
      vocabSelection: "packA",
      languageMode: "english",
      showPinyin: true,
      bridgeGradeScope: "preschool_grade2"
    },
    storage: null,
    currentAccount: null,
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
    requestAnimationFrame(callback) {
      if (typeof callback === "function") callback();
      return 1;
    },
    setTimeout(callback) {
      if (typeof callback === "function") callback();
      return 1;
    },
    clearTimeout() {},
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
    showFloatingText() {},
    showToast() {},
    buildWordPicker() {
      return { updateWordQuality() {} };
    },
    replayPackQualityToWordPicker() {},
    saveProgress() {},
    saveVocabState() {},
    updateVocabProgressUI() {},
    renderVocabSelect() {},
    updateVocabPreview() {},
    getPackProgress() {
      return { unique: {}, uniqueCount: 0, total: 0, completed: false };
    },
    ensureVocabEngine() {
      return true;
    }
  };
  context.window = context;
  vm.createContext(context);
  return context;
}

function runVocabModule(context) {
  vm.runInContext(read("src/modules/09-vocab.js"), context, {
    filename: "src/modules/09-vocab.js"
  });
}

function loadVocabRuntime() {
  const context = createContext();
  runVocabModule(context);
  return context.window.BilingualVocab;
}

async function loadFilteredWords({ settingsPatch, pack }) {
  const context = createContext();
  context.settings = { ...context.settings, ...settingsPatch };
  context.vocabManifest = {
    version: "test",
    packs: [pack],
    byId: { [pack.id]: pack }
  };
  context.vocabPacks = { [pack.id]: pack };
  runVocabModule(context);
  const ok = await context.setActiveVocabPack(pack.id);
  assert.equal(ok, true, `setActiveVocabPack should load ${pack.id}`);
  return Array.from(context.wordDatabase, (item) => String(item.word || item.chinese || item.character || "").trim());
}

function testDefaultsDeclareBridgeGradeScope() {
  const defaultsSource = read("src/defaults.js");
  assert.match(
    defaultsSource,
    /bridgeGradeScope:\s*"preschool_grade2"/,
    "默认设置应声明桥接学习层级，且保持学前到二年级的广覆盖"
  );
}

function testUiExposesGradeScopeSelectors() {
  const html = read("Game.html");
  assert.match(html, /id="opt-bridge-grade-scope"/, "设置面板应提供学习层级选择器");
  assert.match(html, /id="vocab-prompt-grade-scope"/, "首次词库弹窗应提供学习层级选择器");
  assert.match(html, /id="login-grade-scope-selection"/, "登录页应提供年级入口区");
  assert.match(html, /id="btn-grade-scope-grade1"/, "登录页应提供小学一年级快捷入口");
  assert.match(html, /id="btn-grade-scope-grade2"/, "登录页应提供小学二年级快捷入口");
  assert.match(html, /bridge-grade-scope-presets/, "设置面板应提供学习层级快捷入口");
  assert.match(html, /vocab-prompt-grade-presets/, "首次词库弹窗应提供学习层级快捷入口");
  assert.match(html, /data-bridge-grade-scope="grade1"/, "快捷入口应覆盖小学一年级");
  assert.match(html, /data-bridge-grade-scope="grade2"/, "快捷入口应覆盖小学二年级");
  assert.match(html, /学前启蒙/, "学习层级选项应包含学前启蒙");
  assert.match(html, /小学一年级/, "学习层级选项应包含小学一年级");
  assert.match(html, /小学二年级/, "学习层级选项应包含小学二年级");
}

function testRuntimeExportsGradeScopeHelpers() {
  const vocab = loadVocabRuntime();
  assert.equal(typeof vocab.normalizeBridgeGradeScope, "function", "运行时应暴露 bridgeGradeScope 标准化函数");
  assert.equal(typeof vocab.getBridgeGradeScopeLabel, "function", "运行时应暴露 bridgeGradeScope 文案函数");
  assert.equal(typeof vocab.doesWordMatchBridgeGradeScope, "function", "运行时应暴露 bridgeGradeScope 命中过滤函数");
  assert.equal(typeof vocab.filterWordsByBridgeGradeScope, "function", "运行时应暴露 bridgeGradeScope 批量过滤函数");
  assert.equal(typeof vocab.syncBridgeGradeScopePresetState, "function", "运行时应暴露快捷入口状态同步函数");

  assert.equal(vocab.normalizeBridgeGradeScope("grade1"), "grade1");
  assert.equal(vocab.normalizeBridgeGradeScope("weird-value"), "preschool_grade2");
  assert.equal(vocab.getBridgeGradeScopeLabel("grade1"), "小学一年级");
  assert.equal(vocab.getBridgeGradeScopeLabel("preschool_grade1"), "学前到小学一年级");

  assert.equal(vocab.doesWordMatchBridgeGradeScope({ gradeBand: "学前" }, "preschool"), true);
  assert.equal(vocab.doesWordMatchBridgeGradeScope({ gradeBand: "学前" }, "grade2"), false);
  assert.equal(vocab.doesWordMatchBridgeGradeScope({ gradeBand: "学前-一年级" }, "grade1"), true);
  assert.equal(vocab.doesWordMatchBridgeGradeScope({ gradeBand: "二年级" }, "grade1"), false);
  assert.equal(vocab.doesWordMatchBridgeGradeScope({ gradeBand: "" }, "grade1"), true);
}

function testPresetBindingCodeExists() {
  const eventsSource = read("src/modules/16-events.js");
  const vocabSource = read("src/modules/09-vocab.js");
  const cssSource = read("src/styles/20-touch-controls.css");
  const bootstrapSource = read("src/modules/17-bootstrap.js");
  const accountSource = read("src/modules/08-account.js");
  const baseCssSource = read("src/styles/00-base-and-layout.css");

  assert.match(eventsSource, /bindBridgeGradeScopePresetGroup/, "设置面板应绑定学习层级快捷入口");
  assert.match(vocabSource, /function syncBridgeGradeScopePresetState\(/, "词库模块应负责同步快捷入口高亮状态");
  assert.match(cssSource, /bridge-grade-scope-presets/, "快捷入口应有独立样式");
  assert.match(cssSource, /bridge-grade-scope-chip/, "快捷入口按钮应有芯片式样式");
  assert.match(bootstrapSource, /btn-grade-scope-grade1/, "登录页 onboarding 应绑定一年级入口");
  assert.match(bootstrapSource, /bridgeGradeScope/, "登录页 onboarding 应写入学习层级");
  assert.match(accountSource, /btn-overlay-grade-scope-grade1/, "开场引导应绑定一年级入口");
  assert.match(accountSource, /overlay-grade-current/, "开场引导应显示当前学习层级");
  assert.match(baseCssSource, /overlay-grade-grid/, "开场引导应有年级入口布局样式");
}

async function testBridgePackFiltersBySelectedGradeScope() {
  const words = await loadFilteredWords({
    settingsPatch: {
      languageMode: "pinyin",
      bridgeGradeScope: "grade1"
    },
    pack: {
      id: "packA",
      title: "桥接语文",
      stage: "bridge",
      getRaw() {
        return [
          { standardized: "xueqian", word: "学前词", chinese: "学前词", subject: "language", module: "词语", mode: "pinyin", gradeBand: "学前" },
          { standardized: "grade1", word: "一年级词", chinese: "一年级词", subject: "language", module: "词语", mode: "pinyin", gradeBand: "一年级" },
          { standardized: "range", word: "过渡词", chinese: "过渡词", subject: "language", module: "词语", mode: "pinyin", gradeBand: "学前-一年级" }
        ];
      }
    }
  });

  assert.deepEqual(words, ["一年级词", "过渡词"], "桥接词包应按当前学习层级过滤");
}

async function testHanziModeAlsoFiltersBySelectedGradeScope() {
  const words = await loadFilteredWords({
    settingsPatch: {
      languageMode: "chinese",
      bridgeGradeScope: "grade2"
    },
    pack: {
      id: "packHanzi",
      title: "汉字包",
      stage: "kindergarten",
      getRaw() {
        return [
          { standardized: "ren", word: "人", chinese: "人", character: "人", english: "person", pinyin: "rén", examples: [{ word: "人人", english: "people" }], mode: "chinese", gradeBand: "学前" },
          { standardized: "du", word: "读", chinese: "读", character: "读", english: "read", pinyin: "dú", examples: [{ word: "读书", english: "read books" }], mode: "chinese", gradeBand: "二年级" }
        ];
      }
    }
  });

  assert.deepEqual(words, ["读"], "汉字模式应跟随学习层级过滤单字内容");
}

await testBridgePackFiltersBySelectedGradeScope();
await testHanziModeAlsoFiltersBySelectedGradeScope();
testDefaultsDeclareBridgeGradeScope();
testUiExposesGradeScopeSelectors();
testRuntimeExportsGradeScopeHelpers();
testPresetBindingCodeExists();
