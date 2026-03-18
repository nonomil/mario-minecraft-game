import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runScriptInContext(context, relPath) {
  vm.runInContext(readModuleCode(relPath), context, { filename: relPath });
}

function testDeathReviveUsesRecoveryQuizInsteadOfLineMatch() {
  const source = readModuleCode("src/modules/10-ui.js");
  const start = source.indexOf("function maybeLaunchWordMatchRevive()");
  const end = source.indexOf("function buildWordMatchItems(", start);
  const snippet = start >= 0 && end > start ? source.slice(start, end) : "";

  assert.ok(snippet, "应能定位 maybeLaunchWordMatchRevive 函数源码");
  assert.match(
    snippet,
    /startRecoveryQuizSession\(\{\s*context:\s*"death"/,
    "死亡复活应改为启动多题恢复测验"
  );
  assert.doesNotMatch(
    snippet,
    /new WordMatchGame\(/,
    "死亡复活入口不应继续直接启动旧的连线复活"
  );
}

function testGameOverOverlayExplainsReviveTradeoffs() {
  const source = readModuleCode("src/modules/10-ui.js");
  assert.match(source, /答对全部题目可满血复活/, "游戏结束提示应说明答对全部题目可以满血复活");
  assert.match(source, /积分复活仅恢复1格血/, "游戏结束提示应说明积分复活只有1格血");
  assert.match(
    source,
    /scoreReviveHp:\s*revive\.scoreReviveHp \?\? 1/,
    "积分复活配置应改为固定 1 格血"
  );
  assert.match(
    source,
    /playerHp = Math\.min\(playerMaxHp, Math\.max\(1, Number\(cfg\.scoreReviveHp\) \|\| 1\)\);/,
    "积分复活应按固定血量恢复，而不是按比例回血"
  );
}

function testBossLowHpHooksIntoEmergencyRecoveryQuiz() {
  const source = readModuleCode("src/modules/13-game-loop.js");
  assert.match(
    source,
    /if \(typeof maybeOfferBossEmergencyQuiz === "function"\) maybeOfferBossEmergencyQuiz\(\);/,
    "玩家受伤后应检查是否需要触发 BOSS 低血急救测验"
  );
}

function testRecoveryQuizSessionHooksIntoChallengeFlow() {
  const source = readModuleCode("src/modules/12-challenges.js");
  assert.match(source, /function startRecoveryQuizSession\(/, "挑战系统应提供恢复测验会话入口");
  assert.match(source, /type:\s*"recovery_quiz"/, "恢复测验应通过专门的 challenge origin 标记流程");
  assert.match(
    source,
    /challengeOrigin && challengeOrigin\.type === "recovery_quiz"/,
    "挑战完成逻辑应识别恢复测验，不再沿用普通挑战的重试流程"
  );
}

function testBossDamageMultiplierReducesIncomingDamage() {
  const context = {
    console,
    settings: {
      bossHpMultiplier: 1,
      bossDamageTakenMultiplier: 0.5
    },
    showFloatingText() {},
    bossArena: { onVictory() {}, triggerPhaseFlash() {} },
    canvas: { width: 800, height: 450 },
    cameraX: 0,
    player: { x: 120, y: 120, width: 24, height: 48 },
    inventory: {},
    addArmorToInventory() {},
    showToast() {},
    score: 0,
    currentBiome: "forest",
    getProgressScore() { return 0; },
    getBiomeSwitchConfig() { return null; },
    getBiomeById() { return null; },
    WitherBoss: function WitherBoss() {},
    GhastBoss: function GhastBoss() {},
    BlazeBoss: function BlazeBoss() {},
    WitherSkeletonBoss: function WitherSkeletonBoss() {},
    WardenBoss: function WardenBoss() {},
    EvokerBoss: function EvokerBoss() {},
    globalThis: null
  };
  context.globalThis = context;
  vm.createContext(context);
  runScriptInContext(context, "src/modules/15-entities-boss-core.js");

  const Boss = vm.runInContext("Boss", context);
  const boss = new Boss({ id: "wither", name: "Wither", maxHp: 100, damage: 10 });
  boss.takeDamage(20);

  assert.equal(boss.hp, 90, "BOSS 应应用受伤倍率，20 点伤害在 0.5 倍下只扣 10 HP");
}

function testProfileModalUsesReadableLightPanels() {
  const source = readModuleCode("src/styles/30-inventory-and-achievements.css");
  assert.match(
    source,
    /\.profile-modal-content \{[\s\S]*background:\s*linear-gradient\(180deg,/,
    "档案弹窗应使用更明亮的渐变背景，避免整块发黑"
  );
  assert.match(
    source,
    /\.profile-stats > div \{[\s\S]*background:\s*rgba\(255,\s*255,\s*255,/,
    "档案统计行应有独立浅色底板，提升文字可读性"
  );
  assert.match(
    source,
    /\.stat-card \{[\s\S]*color:\s*#1F2937/,
    "学习统计卡片应改为深色文字配浅底，而不是继续糊在暗背景上"
  );
}

function run() {
  testDeathReviveUsesRecoveryQuizInsteadOfLineMatch();
  testGameOverOverlayExplainsReviveTradeoffs();
  testBossLowHpHooksIntoEmergencyRecoveryQuiz();
  testRecoveryQuizSessionHooksIntoChallengeFlow();
  testBossDamageMultiplierReducesIncomingDamage();
  testProfileModalUsesReadableLightPanels();
  console.log("revive boss profile regression checks passed");
}

run();
