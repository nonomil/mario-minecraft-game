import assert from "node:assert/strict";
import fs from "node:fs";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function testCraftingButtonsExistInHudAndTouchControls() {
  const html = readModuleCode("Game.html");
  assert.match(html, /id="btn-crafting"/, "HUD 中应新增合成按钮入口");
  assert.match(html, /data-action="craft"/, "触屏控制区中应新增合成按钮入口");
  assert.match(html, /id="crafting-modal"/, "页面中应包含独立的合成面板");
}

function testCraftingAddsShieldAndTorchMetadata() {
  const source = readModuleCode("src/modules/01-config.js");
  assert.match(source, /shield:\s*"盾牌"/, "物品文案中应新增盾牌");
  assert.match(source, /torch:\s*"火炬"/, "物品文案中应新增火炬");
  assert.match(source, /shield:\s*"🛡️"/, "物品图标中应新增盾牌");
  assert.match(source, /torch:\s*"🔥"/, "物品图标中应新增火炬");
}

function testCraftingRecipesIncludeShieldAndTorch() {
  const source = readModuleCode("src/modules/13-game-loop.js");
  assert.match(source, /shield:\s*\{\s*stick:\s*2,\s*iron:\s*1\s*\}/, "合成表中应包含 2 木棍 + 1 铁块 = 盾牌");
  assert.match(source, /torch:\s*\{\s*stick:\s*1,\s*gunpowder:\s*1\s*\}/, "合成表中应包含 1 木棍 + 1 火药 = 火炬");
  assert.match(source, /function craftSelectedMaterials\(/, "应提供多选材料后的确认合成入口");
}

function testShieldAndTorchHaveRuntimeBehaviors() {
  const source = readModuleCode("src/modules/13-game-loop.js");
  assert.match(source, /itemKey === "shield"/, "盾牌应能在背包中被点击使用");
  assert.match(source, /itemKey === "torch"/, "火炬应能在背包中被点击使用");
  assert.match(source, /shieldState[\s\S]*durability/, "盾牌应具有独立耐久状态");
  assert.match(source, /function getPlayerTorchLightRadius\(/, "应暴露火炬照明半径读取接口");
}

function run() {
  testCraftingButtonsExistInHudAndTouchControls();
  testCraftingAddsShieldAndTorchMetadata();
  testCraftingRecipesIncludeShieldAndTorch();
  testShieldAndTorchHaveRuntimeBehaviors();
  console.log("crafting foundation regression checks passed");
}

run();
