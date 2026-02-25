import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function createClassList() {
  const set = new Set();
  return {
    add(name) { set.add(name); },
    remove(name) { set.delete(name); },
    contains(name) { return set.has(name); }
  };
}

function createElementStub() {
  return {
    className: "",
    innerHTML: "",
    style: {},
    dataset: {},
    classList: createClassList(),
    appendChild() {},
    addEventListener() {},
    setAttribute() {},
    querySelector() { return null; }
  };
}

function createBaseContext() {
  const inventoryModal = {
    classList: createClassList(),
    setAttribute() {}
  };
  const armorList = {
    innerHTML: "",
    appendChild() {}
  };
  const armorModal = {
    classList: createClassList(),
    setAttribute() {},
    querySelector(sel) {
      if (sel === ".armor-list") return armorList;
      return null;
    }
  };

  const context = {
    console,
    Math,
    Date,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    paused: false,
    inventoryModalEl: inventoryModal,
    playerEquipment: {
      armor: null,
      armorDurability: 0,
      armorEquippedAt: 0,
      armorLastDurabilityTick: 0
    },
    armorInventory: [],
    ARMOR_TYPES: {
      leather: { name: "皮甲", defense: 1, color: "#8D6E63" }
    },
    Entity: class Entity {
      constructor(x, y, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
      }
    },
    document: {
      getElementById(id) {
        if (id === "armor-select-modal") return armorModal;
        return null;
      },
      createElement() {
        return createElementStub();
      }
    }
  };

  vm.createContext(context);
  return context;
}

function runScriptInContext(context, relPath) {
  vm.runInContext(readModuleCode(relPath), context, { filename: relPath });
}

function testNestedModalPauseBehavior() {
  const context = createBaseContext();
  runScriptInContext(context, "src/modules/13-game-loop.js");

  // Emulate two modal opens (inventory + armor) stacked in order.
  context.pushPause();
  context.pushPause();
  context.inventoryModalEl.classList.add("visible");
  assert.equal(context.paused, true, "inventory open should pause game");

  context.hideArmorSelectUI();
  assert.equal(
    context.paused,
    true,
    "closing top modal should keep game paused when another modal remains open"
  );

  context.hideInventoryModal();
  assert.equal(context.paused, false, "closing all modals should resume game");
}

function testFlowerShouldRootOnGround() {
  const context = createBaseContext();
  context.decorations = [];
  context.currentBiome = "forest";
  context.groundY = 300;
  context.spawnDecoration = (type, resetFn, createFn) => {
    const obj = createFn();
    context.decorations.push(obj);
  };

  runScriptInContext(context, "src/modules/15-entities-decorations.js");
  runScriptInContext(context, "src/modules/11-game-init.js");

  const originalRandom = context.Math.random;
  context.Math.random = () => 0.2;
  try {
    context.generateBiomeDecorations(
      120,
      context.groundY,
      100,
      { id: "forest", decorations: { flower: 1 }, treeTypes: { oak: 1 } }
    );
  } finally {
    context.Math.random = originalRandom;
  }

  const flower = context.decorations.find(d => d && d.type === "flower");
  assert.ok(flower, "flower decoration should be generated");
  assert.equal(
    Math.round(flower.y + flower.height),
    context.groundY,
    "flower bottom should sit on ground"
  );
}

function run() {
  testNestedModalPauseBehavior();
  testFlowerShouldRootOnGround();
  // eslint-disable-next-line no-console
  console.log("unit checks passed");
}

run();
