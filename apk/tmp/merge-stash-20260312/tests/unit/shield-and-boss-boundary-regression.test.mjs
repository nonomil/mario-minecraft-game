import assert from "node:assert/strict";
import fs from "node:fs";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function testShieldHudStatusIncludesDurabilitySummary() {
  const source = readModuleCode("src/modules/13-game-loop.js");
  assert.match(
    source,
    /function updateArmorUI\(\)[\s\S]*document\.getElementById\("armor-status"\)/,
    "updateArmorUI 应直接更新右上角 armor-status 徽章"
  );
  assert.match(
    source,
    /shieldState\?\.equipped[\s\S]*shieldState\?\.durability[\s\S]*inventory\.shield/,
    "右上角装备徽章应综合盾牌装备状态、耐久和库存来显示"
  );
}

function testSteveRendererDrawsShieldWhenEquipped() {
  const source = readModuleCode("src/modules/14-renderer-entities.js");
  assert.match(
    source,
    /function drawSteve\([\s\S]*shieldState\?\.equipped[\s\S]*inventory\.shield[\s\S]*shieldState\?\.durability/,
    "drawSteve 应读取盾牌装备状态来决定是否绘制手持盾牌"
  );
  assert.match(
    source,
    /ctx\.(beginPath|roundRect|arc|fillRect)[\s\S]*shield/i,
    "Steve 渲染链应包含实际的盾牌绘制逻辑，而不是只改状态文案"
  );
}

function testBossArenaClampsBossInsideViewportWalls() {
  const source = readModuleCode("src/modules/15-entities-boss.js");
  assert.match(
    source,
    /clampBossToArena\(\)[\s\S]*this\.boss\.x = Math\.max\(/,
    "bossArena 应提供把 BOSS 限制在左右墙之间的钳制逻辑"
  );
  assert.match(
    source,
    /this\.boss\.update\(player\);[\s\S]*this\.clampBossToArena\(\);/,
    "bossArena.update 在更新行为后应立即把 BOSS 拉回竞技场范围"
  );
}

function run() {
  testShieldHudStatusIncludesDurabilitySummary();
  testSteveRendererDrawsShieldWhenEquipped();
  testBossArenaClampsBossInsideViewportWalls();
  console.log("shield and boss boundary regression checks passed");
}

run();
