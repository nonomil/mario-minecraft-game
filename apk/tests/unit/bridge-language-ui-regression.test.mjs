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

function testBridgeWorldItemsDoNotDefaultToPinyinOnOrbLabel() {
  const source = read("src/modules/14-renderer-main.js");

  assert.match(source, /function getWorldWordDisplayText\(/, "世界中的词条圆圈应保留独立显示文案函数");
  assert.match(source, /getCurrentLanguageMode\?\.?\(\)/, "世界词条显示应识别当前学习模式");
  assert.match(source, /wordObj\?\.chinese/, "幼小衔接圆圈文案应优先回退到汉字");
  assert.match(source, /if \(languageMode === "pinyin"\)/, "幼小衔接圆圈应为拼音模式单独处理显示文案");
}

function testBridgeGradeScopeUiOnlyShowsInPinyinMode() {
  const html = read("Game.html");
  const bootstrapSource = read("src/modules/17-bootstrap.js");
  const eventsSource = read("src/modules/16-events.js");

  assert.match(html, /id="settings-bridge-grade-scope-row"/, "设置页应为学习层级提供独立容器");
  assert.match(html, /id="vocab-prompt-grade-scope-section"/, "词库提示弹窗应为学习层级提供独立容器");
  assert.match(bootstrapSource, /function syncLoginBridgeGradeScopeVisibility\(/, "登录页应提供学习层级显隐同步函数");
  assert.match(bootstrapSource, /normalized === "pinyin"/, "登录页学习层级应仅在幼小衔接模式显示");
  assert.match(eventsSource, /function syncBridgeGradeScopeVisibility\(/, "设置页应提供学习层级显隐同步函数");
  assert.match(eventsSource, /mode === "pinyin"/, "设置页与词库弹窗学习层级应仅在幼小衔接模式显示");
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

function testBridgeChallengeUiHasContextBadge() {
  const html = read("Game.html");
  const source = read("src/modules/12-challenges.js");
  const styles = read("src/styles/00-base-and-layout.css");

  assert.match(html, /id="challenge-context-badge"/, "挑战弹窗应预留课堂上下文标签位");
  assert.match(source, /challenge-context-badge/, "挑战逻辑应回填课堂上下文标签");
  assert.match(source, /getBridgeContextHint/, "挑战弹窗应复用桥接学习上下文提示");
  assert.match(styles, /\.challenge-context-badge/, "挑战弹窗样式应提供上下文标签样式");
}

function testBridgeWordCardHasModeThemes() {
  const source = read("src/modules/12-challenges.js");
  const styles = read("src/styles/10-hud-and-panels.css");

  assert.match(source, /word-card-theme-chinese/, "词卡展示逻辑应为汉字模式添加专属主题类");
  assert.match(source, /word-card-theme-pinyin/, "词卡展示逻辑应为幼小衔接模式添加专属主题类");
  assert.match(styles, /#word-card\.word-card-theme-chinese/, "词卡样式应提供汉字模式主题");
  assert.match(styles, /#word-card\.word-card-theme-pinyin/, "词卡样式应提供幼小衔接模式主题");
}

function testPinyinWordCardHidesNoisyTips() {
  const source = read("src/modules/12-challenges.js");

  assert.match(source, /function getWordCardMetaText\(/, "词卡元信息应通过独立函数生成");
  assert.match(source, /languageMode === "pinyin"/, "幼小衔接词卡应支持单独的元信息裁剪");
  assert.match(source, /return displayContent\?\.metaText \|\| ""/, "幼小衔接词卡应仅保留必要元信息，不再拼接提示口号");
  assert.match(source, /function getHudMetaText\(/, "主 HUD 元信息应通过独立函数生成");
  assert.match(source, /return displayContent\?\.metaText \|\| ""/, "幼小衔接主 HUD 应仅保留必要元信息");
}

function testBridgeChallengePromptsAreMoreClassroomLike() {
  const source = read("src/modules/12-challenges.js");

  assert.match(source, /看拼音，选汉字/, "幼小衔接拼音到汉字题面应收敛为短指令");
  assert.match(source, /看词语，选拼音/, "幼小衔接汉字到拼音题面应收敛为短指令");
  assert.match(source, /选对声调/, "幼小衔接声调题面应保持简短明确");
}

function testLearningReportUsesModeSpecificLabels() {
  const source = read("src/modules/10-ui.js");

  assert.match(source, /function getLearningReportModeProfile\(/, "学习报告应按模式生成专属文案配置");
  assert.match(source, /识字遇见/, "汉字模式报告应使用识字向标签");
  assert.match(source, /拼音学习/, "幼小衔接报告应使用更简洁的拼音向标签");
  assert.match(source, /今天还没有识字记录/, "空状态应按模式切换为更贴切的提示");
  assert.match(source, /先读几个拼音词，报告会自动生成/, "幼小衔接空状态说明应更精简");
}

function testWordMatchUsesClassroomModeHints() {
  const source = read("src/modules/10-ui.js");

  assert.match(source, /function getWordMatchHint\(/, "复活配对应保留独立提示生成器");
  assert.match(source, /拼音卡配汉字卡/, "幼小衔接复活配对提示应更短更聚焦");
  assert.match(source, /汉字卡配拼音卡/, "汉字模式复活配对提示应更短更聚焦");
}

function testWordMatchHasModeThemes() {
  const source = read("src/modules/10-ui.js");
  const styles = read("src/styles/00-base-and-layout.css");

  assert.match(source, /word-match-theme-pinyin/, "复活配对逻辑应为幼小衔接模式添加主题类");
  assert.match(source, /word-match-theme-chinese/, "复活配对逻辑应为汉字模式添加主题类");
  assert.match(styles, /#word-match-screen\.word-match-theme-pinyin/, "复活配对样式应提供幼小衔接主题");
  assert.match(styles, /#word-match-screen\.word-match-theme-chinese/, "复活配对样式应提供汉字主题");
}

function testWordMatchUsesModeSpecificTitles() {
  const source = read("src/modules/10-ui.js");

  assert.match(source, /function getWordMatchTitle\(/, "复活配对标题应保留独立的模式文案生成器");
  assert.match(source, /拼音配对/, "幼小衔接模式复活配对标题应更简洁");
  assert.match(source, /识字配对/, "汉字模式复活配对标题应更简洁");
}

function testPinyinChallengeContextIsCompact() {
  const source = read("src/modules/12-challenges.js");

  assert.match(source, /function getCompactPinyinContextHint\(/, "幼小衔接挑战上下文应提供精简文案函数");
  assert.match(source, /scopeHint \|\| moduleName \|\| formatBridgeGradeBandLabel/, "幼小衔接挑战提示应优先保留必要层级信息");
  assert.match(source, /getLanguageModeSafe\(\) === "pinyin"\s*\?\s*getCompactPinyinContextHint/, "幼小衔接题面应切换到精简提示来源");
}

function testPinyinChallengeCorrectionHidesExtraExplanation() {
  const source = read("src/modules/12-challenges.js");

  assert.match(source, /function getChallengeCorrectionText\(/, "挑战纠正区应通过独立函数生成说明文案");
  assert.match(source, /mode === "pinyin"/, "幼小衔接挑战纠正区应支持单独裁剪");
  assert.match(source, /return "";/, "幼小衔接挑战纠正区应允许隐藏扩展说明");
}

function testPinyinDisplayContentDropsExtraGloss() {
  const vocabSource = read("src/modules/09-vocab.js");
  const challengeSource = read("src/modules/12-challenges.js");

  assert.match(vocabSource, /if \(languageMode === "pinyin"\)/, "幼小衔接显示内容应单独分支处理");
  assert.match(vocabSource, /phraseSecondary:\s*""/, "幼小衔接展示内容不应默认附带扩展释义");
  assert.match(challengeSource, /phraseSecondary:\s*""/, "幼小衔接兜底显示内容也不应默认附带扩展释义");
}

function testWordMatchShowsCurrentGradeScope() {
  const html = read("Game.html");
  const source = read("src/modules/10-ui.js");
  const styles = read("src/styles/00-base-and-layout.css");

  assert.match(html, /id="match-scope-label"/, "复活配对弹窗应预留当前学习层级标签位");
  assert.match(source, /function getWordMatchScopeLabel\(/, "复活配对应按当前学习层级生成标签");
  assert.match(source, /match-scope-label/, "复活配对逻辑应回填当前学习层级标签");
  assert.match(source, /getBridgeGradeScopeLabel/, "复活配对应复用统一的学习层级文案");
  assert.match(styles, /\.word-match-scope-label/, "复活配对样式应提供学习层级标签样式");
}

function run() {
  testBridgeModeShowsLearningMeta();
testBridgeDisplayContentCarriesGradeAndTip();
testBridgeWorldItemsDoNotDefaultToPinyinOnOrbLabel();
  testBridgeGradeScopeUiOnlyShowsInPinyinMode();
  testBridgeChallengeUiUsesMetaAndKnownHanziPool();
  testSingleHanziUsesExampleAwareChallenge();
  testAdaptiveChallengeTitleExists();
  testBridgeChallengeUiShowsCurrentGradeScope();
  testBridgeChallengeUiHasContextBadge();
  testBridgeWordCardHasModeThemes();
  testPinyinWordCardHidesNoisyTips();
  testBridgeChallengePromptsAreMoreClassroomLike();
  testPinyinChallengeContextIsCompact();
  testPinyinChallengeCorrectionHidesExtraExplanation();
  testPinyinDisplayContentDropsExtraGloss();
  testLearningReportUsesModeSpecificLabels();
  testWordMatchUsesClassroomModeHints();
  testWordMatchHasModeThemes();
  testWordMatchUsesModeSpecificTitles();
  testWordMatchShowsCurrentGradeScope();
  console.log("bridge language ui regression checks passed");
}

run();
