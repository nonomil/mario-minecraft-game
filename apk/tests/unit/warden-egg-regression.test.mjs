import assert from "node:assert/strict";
import fs from "node:fs";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function testChestTablesIncludeWardenEggInLegendaryPool() {
  const configSource = readModuleCode("src/modules/01-config.js");
  assert.match(
    configSource,
    /legendary:\s*\[[\s\S]*?\{\s*item:\s*"warden_egg",\s*weight:\s*4,\s*min:\s*1,\s*max:\s*1\s*\}/,
    "默认宝箱掉落表应把 warden_egg 纳入传奇池"
  );
}

function testWardenEggHasDescriptionAndCooldown() {
  const configSource = readModuleCode("src/modules/01-config.js");
  assert.match(configSource, /warden_egg:\s*900/, "warden_egg 应配置召唤冷却");
  assert.match(configSource, /warden_egg:\s*\{\s*desc:\s*"在前方召唤一只坚守者/, "warden_egg 应配置道具说明");
}

function testGameLoopHandlesWardenEggSummonBranch() {
  const loopSource = readModuleCode("src/modules/13-game-loop.js");
  assert.match(loopSource, /function useWardenEgg\(\)/, "集成线应实现坚守者蛋召唤逻辑");
  assert.match(loopSource, /golems\.some\([^)]*g\.type === "warden"/, "坚守者蛋应检测是否已有友方坚守者");
  assert.match(loopSource, /new Golem\(spawnX, spawnY, "warden"\)/, "坚守者蛋应改为生成友军 Golem 版坚守者");
  assert.doesNotMatch(loopSource, /new WardenEnemy\(spawnX, spawnY\)/, "坚守者蛋不应再召唤敌对 WardenEnemy");
  assert.match(loopSource, /itemKey === "warden_egg"[\s\S]*?itemCooldownTimers\.warden_egg = ITEM_COOLDOWNS\.warden_egg/, "useInventoryItem 应接入 warden_egg 冷却分支");
}

function run() {
  testChestTablesIncludeWardenEggInLegendaryPool();
  testWardenEggHasDescriptionAndCooldown();
  testGameLoopHandlesWardenEggSummonBranch();
  console.log("warden egg regression checks passed");
}

run();
