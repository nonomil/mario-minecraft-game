import assert from "node:assert/strict";
import fs from "node:fs";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function testBossRosterReplacesEvokerWithRavager() {
  const coreSource = readModuleCode("src/modules/15-entities-boss-core.js");
  assert.match(coreSource, /id:\s*'ravager'/, "BOSS 名单应加入 ravager");
  assert.doesNotMatch(coreSource, /id:\s*'evoker'/, "BOSS 名单应移除问题较多的 evoker");
  assert.match(coreSource, /case 'ravager': return \(typeof RavagerBoss === 'function'\) \? new RavagerBoss\(spawnX\)/, "createBoss 应切换到 RavagerBoss");
  assert.doesNotMatch(coreSource, /case 'evoker'/, "createBoss 不应再创建 EvokerBoss");
}

function testRavagerBossClassLivesInBossModule() {
  const bossSource = readModuleCode("src/modules/15-entities-boss-evoker.js");
  assert.match(bossSource, /class RavagerBoss extends Boss/, "原唤魔者模块应改为实现 RavagerBoss");
  assert.match(bossSource, /name:\s*'掠夺兽 Ravager'/, "新 BOSS 应命名为 Ravager");
}

function testBossEnvironmentUsesRavagerArena() {
  const envSource = readModuleCode("src/modules/15-entities-boss-environments.js");
  assert.match(envSource, /ravager:\s*\{/, "环境控制器应支持 ravager 竞技场");
  assert.doesNotMatch(envSource, /evoker:\s*\{/, "环境控制器不应再为 evoker 保留独立竞技场");
}

function run() {
  testBossRosterReplacesEvokerWithRavager();
  testRavagerBossClassLivesInBossModule();
  testBossEnvironmentUsesRavagerArena();
  console.log("boss roster regression checks passed");
}

run();
