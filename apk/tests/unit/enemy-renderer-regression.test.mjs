import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

function readModuleCode(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function testDedicatedRendererRoutesExist() {
  const source = readModuleCode("src/modules/14-renderer-entities.js");
  const dedicatedRenderers = [
    ["drowned", "drawDrownedEnemy"],
    ["guardian", "drawGuardianEnemy"],
    ["pufferfish", "drawPufferfishEnemy"],
    ["piglin", "drawPiglinEnemy"],
    ["bee", "drawBeeEnemy"],
    ["spore_bug", "drawSporeBugEnemy"],
    ["magma_cube", "drawMagmaCubeEnemy"],
    ["fire_spirit", "drawFireSpiritEnemy"],
    ["sculk_worm", "drawSculkWormEnemy"],
    ["shadow_stalker", "drawShadowStalkerEnemy"]
  ];

  for (const [enemyType, rendererName] of dedicatedRenderers) {
    assert.match(
      source,
      new RegExp(`case\\s+["']${enemyType}["']:\\s*${rendererName}\\(enemy\\);`, "s"),
      `${enemyType} 应切到独立渲染函数 ${rendererName}，不能继续走占位方块图`
    );
  }
}

function testSimpleBiomeFallbackIsNotUsedForRedesignedEnemies() {
  const source = readModuleCode("src/modules/14-renderer-entities.js");
  const redesignedTypes = [
    "drowned",
    "guardian",
    "pufferfish",
    "piglin",
    "bee",
    "spore_bug",
    "magma_cube",
    "fire_spirit",
    "sculk_worm",
    "shadow_stalker"
  ];

  for (const enemyType of redesignedTypes) {
    assert.doesNotMatch(
      source,
      new RegExp(`case\\s+["']${enemyType}["']:\\s*drawSimpleBiomeEnemy\\(`, "s"),
      `${enemyType} 不应再退回 drawSimpleBiomeEnemy 的纯色占位画法`
    );
  }
}

function testDedicatedRendererFunctionsExist() {
  const source = readModuleCode("src/modules/14-renderer-entities.js");
  const rendererNames = [
    "drawDrownedEnemy",
    "drawGuardianEnemy",
    "drawPufferfishEnemy",
    "drawPiglinEnemy",
    "drawBeeEnemy",
    "drawSporeBugEnemy",
    "drawMagmaCubeEnemy",
    "drawFireSpiritEnemy",
    "drawSculkWormEnemy",
    "drawShadowStalkerEnemy"
  ];

  for (const rendererName of rendererNames) {
    assert.match(
      source,
      new RegExp(`function\\s+${rendererName}\\s*\\(`),
      `${rendererName} 必须真实存在，不能只在 switch 里挂一个空分支`
    );
  }
}

function testGameDebugIncludesCaveBiomeOption() {
  const html = readModuleCode("tests/debug-pages/GameDebug.html");
  assert.match(
    html,
    /<option>\s*cave\s*<\/option>/,
    "GameDebug 群系列表应包含 cave，便于直接切换矿洞环境调试"
  );
}

try {
  testDedicatedRendererRoutesExist();
  testSimpleBiomeFallbackIsNotUsedForRedesignedEnemies();
  testDedicatedRendererFunctionsExist();
  testGameDebugIncludesCaveBiomeOption();
  console.log("enemy renderer regression checks passed");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
