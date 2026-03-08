import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runScriptInContext(context, relPath) {
  vm.runInContext(readModuleCode(relPath), context, { filename: relPath });
}

function testBedHouseInteriorUsesEnlargedBedWithLegs() {
  const calls = [];
  const ctx = {
    fillStyle: "",
    fillRect(...args) {
      calls.push({ fillStyle: this.fillStyle, args });
    }
  };

  const context = { console };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/18-village-render.js");
  context.drawVillageBed(ctx, 100, 200, { log: "#8D6E63" });

  assert.deepEqual(
    calls[0]?.args,
    [100, 200, 192, 56],
    "床屋室内应继续放大到更有存在感的床体尺寸 192x56"
  );

  const legCalls = calls.filter(({ args }) => args[2] === 10 && args[3] === 14);
  assert.equal(legCalls.length, 2, "床屋室内应保留两条更粗更稳的床腿装饰");
}

function testBedHouseInteriorUsesLargerDoor() {
  const context = { console, Math, Date };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/18-village.js");

  const renderSource = String(context.renderVillageInterior);
  assert.match(renderSource, /const doorW = 56\b/, "床屋室内门宽应放大到 56");
  assert.match(renderSource, /const doorH = 96\b/, "床屋室内门高应放大到 96");
}

function testTraderDialogUsesMultiColumnGrid() {
  const context = { console, Math, Date };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/18-village.js");

  const renderSource = String(context.renderTraderBuyMaterials);
  const gridHelperSource = String(context.getTraderListGridStyle);
  const cardHelperSource = String(context.getTraderCardButtonStyle);
  assert.match(gridHelperSource, /grid-template-columns:repeat\(auto-fit,minmax\(\$\{minWidth\}px,1fr\)\)/, "商人购买面板应使用多列 grid 布局");
  assert.match(cardHelperSource, /width:100%/, "商人购买按钮应撑满网格单元宽度");
}

function testTraderSellsDragonEgg() {
  const context = { console, Math, Date };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/18-village.js");

  const items = vm.runInContext("TRADER_BUY_ITEMS", context);
  const dragonEgg = items.find((item) => item && item.id === "dragon_egg");
  assert.ok(dragonEgg, "商人购买列表应包含龙蛋");
  assert.equal(dragonEgg.cost, 5000, "龙蛋售价应为 5000 钻石");
}

function testWordHouseUsesBookshelfAndLargerBook() {
  const context = { console, Math, Date };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/18-village.js");

  const helperSource = String(context.drawWordHouseDecor);
  assert.match(helperSource, /const shelfX = actionPx - 120\b/, "单词屋书架应整体左移并放大到双倍体量");
  assert.match(helperSource, /const shelfW = 240\b/, "单词屋书架宽度应提升到 240");
  assert.match(helperSource, /const shelfH = 160\b/, "单词屋书架高度应提升到 160");
  assert.match(helperSource, /const bookX = actionPx - 44\b/, "单词屋主书应继续放大并保持居中");
  assert.match(helperSource, /fillText\("ABC", bookX \+ 44, bookY \+ 30\)/, "单词屋主书应按新尺寸居中显示 ABC 标记");
}

function testTraderUsesUnifiedTallTwoColumnLayout() {
  const context = { console, Math, Date };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/18-village.js");

  const ensureSource = String(context.ensureVillageTraderModal);
  const mainSource = String(context.renderVillageTraderMain);
  const sectionHelperSource = String(context.getTraderSectionGridStyle);
  const armorSource = String(context.renderTraderBuyArmor);
  const buySource = String(context.renderTraderBuyMaterials);

  assert.match(ensureSource, /max-width:\s*760px/, "商人弹窗整体宽度应提升到 760px");
  assert.match(ensureSource, /max-height:\s*72vh/, "商人弹窗整体高度应提升到 72vh");
  assert.match(mainSource, /getTraderSectionGridStyle\(\)/, "商人首页入口应复用统一双列布局 helper");
  assert.match(sectionHelperSource, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/, "商人首页入口应使用双列布局");
  assert.match(armorSource, /getTraderListGridStyle\(180\)/, "盔甲页应使用统一网格布局 helper");
  assert.match(buySource, /getTraderListGridStyle\(180\)/, "材料购买页应使用统一网格布局 helper");
  assert.match(String(context.getTraderListGridStyle), /max-height:440px/, "统一列表高度应增加到 440px");
}

function testInteriorUsesRaisedSpacedLabelsAndDecorHelpers() {
  const context = { console, Math, Date };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/18-village.js");

  const renderSource = String(context.renderVillageInterior);
  assert.match(renderSource, /drawInteriorLabelGroup\(/, "三间屋子应复用统一的室内标签绘制 helper");
  assert.match(renderSource, /drawBedHouseDecor\(/, "床屋应补充生活化装饰 helper");
  assert.match(renderSource, /drawWordHouseDecor\(/, "单词屋应补充学习场景装饰 helper");
  assert.match(renderSource, /drawTraderHouseDecor\(/, "商人屋应补充货架装饰 helper");
}

function testInteriorLabelsUseCenteredEntryPrompts() {
  const context = { console, Math, Date };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/18-village.js");

  const labelSource = String(context.drawInteriorLabelGroup);
  const renderSource = String(context.renderVillageInterior);
  const promptSource = String(context.getInteriorPromptLines);
  assert.match(labelSource, /bold 18px sans-serif/, "室内提示文字应继续放大到 18px");
  assert.match(labelSource, /const lineGap = 26;/, "室内提示行距应拉大到 26");
  assert.match(promptSource, /← 走到床边/, "床屋提示应使用向左移动引导");
  assert.match(promptSource, /🧰 按宝箱键休息/, "床屋提示应包含宝箱键图示");
  assert.match(promptSource, /← 走到书前/, "单词屋提示应使用统一向左移动引导");
  assert.match(promptSource, /🧰 按宝箱键开始/, "单词屋提示应包含宝箱键图示");
  assert.match(promptSource, /← 走到商人旁/, "商人屋提示应使用统一向左移动引导");
  assert.match(promptSource, /🧰 按宝箱键交易/, "商人屋提示应包含宝箱键图示");
  assert.match(renderSource, /const entryPromptPx = toPanelX\(Number\(villageInteriorState\.entryBuildingX\) \|\| 0\);/, "室内提示应锚定到入场中心位置");
  assert.match(renderSource, /drawInteriorLabelGroup\(ctx, entryPromptPx, floorY - 154, getInteriorPromptLines\(buildingType\)\);/, "三间屋提示应统一显示在初始主角站位头顶");
}

function testTraderNpcUsesTallerOfficialInspiredShape() {
  const context = { console, Math, Date };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/18-village.js");

  const source = String(context.drawTraderInteriorNpc);
  assert.match(source, /const robeH = 44\b/, "商人室内形象应增高到更明显的袍子高度");
  assert.match(source, /const headH = 18\b/, "商人室内头部应提升到更明显的高度");
  assert.match(source, /#1E88E5|#1565C0/, "商人应使用接近 wandering trader 的蓝色长袍配色");
}


function testInteriorDrawsPlayerAfterFurnitureAndTraderRackSitsOnFloor() {
  const context = { console, Math, Date };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/18-village.js");

  const renderSource = String(context.renderVillageInterior);
  const traderDecorSource = String(context.drawTraderHouseDecor);
  assert.match(renderSource, /drawWordHouseDecor\([\s\S]*?drawTraderHouseDecor\([\s\S]*?drawInteriorLabelGroup\([\s\S]*?(?:drawSteve\(|ctx\.fillRect\(playerPx - 9, floorY - 26, 18, 24\))/, "室内人物应在家具和提示之后绘制，避免被床和书架遮住");
  assert.match(traderDecorSource, /const rackH = 96;/, "商人货架应保留明确高度");
  assert.match(traderDecorSource, /const rackY = floorY - rackH;/, "商人货架应贴地摆放，而不是悬空在中间");
}

function run() {
  testBedHouseInteriorUsesEnlargedBedWithLegs();
  testBedHouseInteriorUsesLargerDoor();
  testTraderDialogUsesMultiColumnGrid();
  testTraderSellsDragonEgg();
  testWordHouseUsesBookshelfAndLargerBook();
  testTraderUsesUnifiedTallTwoColumnLayout();
  testInteriorUsesRaisedSpacedLabelsAndDecorHelpers();
  testInteriorLabelsUseCenteredEntryPrompts();
  testTraderNpcUsesTallerOfficialInspiredShape();
  testInteriorDrawsPlayerAfterFurnitureAndTraderRackSitsOnFloor();
  console.log("village UI regression checks passed");
}

run();
