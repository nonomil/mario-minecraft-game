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
    [100, 200, 96, 28],
    "床屋室内应使用肉眼可见的大床体尺寸 96x28"
  );

  const legCalls = calls.filter(({ args }) => args[2] === 6 && args[3] === 8);
  assert.equal(legCalls.length, 2, "床屋室内应绘制两条床腿装饰");
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
  assert.match(helperSource, /const shelfX = actionPx - 60\b/, "单词屋应绘制书架背景");
  assert.match(helperSource, /const shelfW = 120\b/, "单词屋书架宽度应为 120");
  assert.match(helperSource, /const bookX = actionPx - 28\b/, "单词屋主书应比旧版更大更居中");
  assert.match(helperSource, /fillText\("ABC", bookX \+ 28, bookY \+ 20\)/, "单词屋主书应显示 ABC 标记");
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

function testTraderNpcUsesTallerOfficialInspiredShape() {
  const context = { console, Math, Date };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/18-village.js");

  const source = String(context.drawTraderInteriorNpc);
  assert.match(source, /const robeH = 44\b/, "商人室内形象应增高到更明显的袍子高度");
  assert.match(source, /const headH = 18\b/, "商人室内头部应提升到更明显的高度");
  assert.match(source, /#1E88E5|#1565C0/, "商人应使用接近 wandering trader 的蓝色长袍配色");
}

function run() {
  testBedHouseInteriorUsesEnlargedBedWithLegs();
  testBedHouseInteriorUsesLargerDoor();
  testTraderDialogUsesMultiColumnGrid();
  testTraderSellsDragonEgg();
  testWordHouseUsesBookshelfAndLargerBook();
  testTraderUsesUnifiedTallTwoColumnLayout();
  testInteriorUsesRaisedSpacedLabelsAndDecorHelpers();
  testTraderNpcUsesTallerOfficialInspiredShape();
  console.log("village UI regression checks passed");
}

run();
