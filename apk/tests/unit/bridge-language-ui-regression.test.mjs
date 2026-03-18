import assert from "node:assert/strict";
import fs from "node:fs";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function testBridgeModeShowsLearningMeta() {
  const html = read("Game.html");

  assert.match(html, /id="word-display-meta"/, "主 HUD 应保留词条元信息位");
  assert.match(html, /id="word-card-meta"/, "词卡应保留词条元信息位");
}

function testBridgeDisplayContentCarriesGradeAndTip() {
  const source = read("src/modules/09-vocab.js");

  assert.match(source, /gradeBand:\s*String\(raw\.gradeBand\s*\|\|\s*""\)\.trim\(\)/, "normalizeWordContent 应保留 gradeBand");
  assert.match(source, /\bmetaText\b/, "词条显示内容应包含 metaText");
  assert.match(source, /\btipText\b/, "词条显示内容应包含 tipText");
  assert.match(source, /词语积累/, "词语模块应有更贴近低年级语文学习的标签");
  assert.match(source, /拓展识词/, "拓展词汇模块应有更明确的学习标签");
}

function testBridgeChallengeUiUsesMetaAndKnownHanziPool() {
  const source = read("src/modules/12-challenges.js");

  assert.match(source, /word-display-meta/, "挑战 HUD 应更新词条元信息");
  assert.match(source, /word-card-meta/, "挑战词卡应更新词条元信息");
  assert.match(source, /kindergartenHanzi/, "汉字干扰项与候选池应优先复用汉字词库");
  assert.doesNotMatch(source, /const commonChars = /, "汉字填空不应回退到生硬的硬编码常见字串");
}

function testSingleHanziUsesExampleAwareChallenge() {
  const source = read("src/modules/12-challenges.js");

  assert.match(source, /hanzi_example/, "单字识字应提供组词型挑战");
  assert.match(source, /function generateHanziExampleChallenge\(/, "应实现单字识字的组词挑战生成器");
}

function testAdaptiveChallengeTitleExists() {
  const source = read("src/modules/12-challenges.js");

  assert.match(source, /function getAdaptiveChallengeTitle\(/, "应提供按模式与模块自适应的挑战标题");
  assert.match(source, /识字组词/, "应为单字识字提供更贴切的挑战标题");
  assert.match(source, /词语认读/, "应为词语模块提供更贴切的挑战标题");
  assert.match(source, /拓展识词/, "应为拓展词汇模块提供更贴切的挑战标题");
  assert.match(source, /表达练习/, "应为表达模块提供更贴切的挑战标题");
  assert.match(source, /古诗朗读/, "应为古诗模块提供更贴切的挑战标题");
}

function testBridgeChallengeUiShowsCurrentGradeScope() {
  const source = read("src/modules/12-challenges.js");

  assert.match(source, /getBridgeGradeScopeLabel/, "挑战系统应读取当前学习层级标签");
  assert.match(source, /当前层级：/, "挑战提示应明确展示当前学习层级");
  assert.match(source, /小学一年级/, "挑战文案应使用正式年级层级名称");
}

function testBridgeWordCardHasModeThemes() {
  const source = read("src/modules/12-challenges.js");
  const styles = read("src/styles/10-hud-and-panels.css");

  assert.match(source, /word-card-theme-chinese/, "词卡展示逻辑应为汉字模式添加专属主题类");
  assert.match(source, /word-card-theme-pinyin/, "词卡展示逻辑应为幼小衔接模式添加专属主题类");
  assert.match(styles, /#word-card\.word-card-theme-chinese/, "词卡样式应提供汉字模式主题");
  assert.match(styles, /#word-card\.word-card-theme-pinyin/, "词卡样式应提供幼小衔接模式主题");
}

function testBridgeChallengePromptsAreMoreClassroomLike() {
  const source = read("src/modules/12-challenges.js");

  assert.match(source, /拼出正确词语/, "拼音到汉字挑战应支持更贴近低年级课堂的词语提示");
  assert.match(source, /认出诗句片段/, "古诗挑战应给出更贴近朗读场景的提示");
  assert.match(source, /选出正确读音/, "汉字到拼音挑战应使用更自然的课堂化提示");
}

function run() {
  testBridgeModeShowsLearningMeta();
  testBridgeDisplayContentCarriesGradeAndTip();
  testBridgeChallengeUiUsesMetaAndKnownHanziPool();
  testSingleHanziUsesExampleAwareChallenge();
  testAdaptiveChallengeTitleExists();
  testBridgeChallengeUiShowsCurrentGradeScope();
  testBridgeWordCardHasModeThemes();
  testBridgeChallengePromptsAreMoreClassroomLike();
  console.log("bridge language ui regression checks passed");
}

run();
