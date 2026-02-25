import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runScriptInContext(context, relPath) {
  vm.runInContext(readModuleCode(relPath), context, { filename: relPath });
}

function createMath(randomValue = 0.61) {
  const customMath = Object.create(Math);
  customMath.random = () => randomValue;
  return customMath;
}

function createClassList() {
  const set = new Set();
  return {
    add(name) {
      set.add(name);
    },
    remove(name) {
      set.delete(name);
    },
    contains(name) {
      return set.has(name);
    }
  };
}

function testB1VillageChallengeWordsPreferSessionThenFallback() {
  const context = {
    console,
    Math: createMath(),
    Date,
    sessionCollectedWords: [{ en: "apple" }, { en: "book" }, { en: "cat" }],
    wordDatabase: [
      { en: "apple", zh: "苹果" },
      { en: "book", zh: "书" },
      { en: "cat", zh: "猫" },
      { en: "yak", zh: "牦牛" },
      { en: "zebra", zh: "斑马" }
    ],
    getVillageWords: () => [{ en: "yak" }, { en: "zebra" }],
    villageConfig: { challengeQuestionCount: 10 }
  };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/12-village-challenges.js");

  const sessionOnly = vm.runInContext(
    "buildVillageChallengeWords({ biomeId: 'forest' }, 3)",
    context
  );
  const sessionSet = new Set(sessionOnly.map((w) => w.en));
  assert.deepEqual(
    [...sessionSet].sort(),
    ["apple", "book", "cat"],
    "B-1: when enough session words exist, village quiz should use only session words"
  );

  context.sessionCollectedWords = [{ en: "apple" }];
  const mixed = vm.runInContext(
    "buildVillageChallengeWords({ biomeId: 'forest' }, 3)",
    context
  );
  const mixedSet = new Set(mixed.map((w) => w.en));
  assert.ok(mixedSet.has("apple"), "B-1: mixed pool should retain session words");
  assert.equal(mixedSet.size, 3, "B-1: mixed pool should be filled with unique fallback words");
}

function testB2TraderMaterialPricesIncludeExpandedItems() {
  const context = { console, Math, Date };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/18-village.js");
  const prices = vm.runInContext("TRADER_MATERIAL_PRICES", context);

  assert.equal(prices.pumpkin, 1);
  assert.equal(prices.beef, 2);
  assert.equal(prices.mutton, 2);
  assert.equal(prices.chicken, 1);
  assert.equal(prices.fish, 1);
  assert.equal(prices.bone, 1);
  assert.equal(prices.feather, 1);
  assert.equal(prices.flower, 1);
  assert.equal(prices.arrow, 1);
  assert.equal(prices.dragon_egg, 30);
  assert.equal(prices.totem, 20);
  assert.equal(prices.nether_star, 25);
}

function createWeaponsContext() {
  const toasts = [];
  const equipStatusEl = {
    innerText: "",
    classList: createClassList()
  };

  class Chest {
    constructor(x, y, hidden = false) {
      this.x = x;
      this.y = y;
      this.hidden = hidden;
      this.opened = false;
      this.width = 32;
      this.height = 32;
    }
  }

  const context = {
    console,
    Math: createMath(),
    Date,
    gameFrame: 0,
    blockSize: 32,
    groundY: 300,
    cameraX: 0,
    canvas: { width: 960, height: 540 },
    showToast(msg) {
      toasts.push(String(msg));
    },
    showFloatingText() {},
    emitDigParticles() {},
    triggerGravityCheck() {},
    damagePlayer() {},
    rectIntersect() {
      return false;
    },
    updateWeaponUI() {},
    inventory: {
      arrow: 5
    },
    ITEM_ICONS: {},
    player: {
      x: 0,
      y: 268,
      width: 32,
      height: 32,
      facingRight: true
    },
    playerWeapons: {
      current: "sword",
      unlocked: ["sword", "pickaxe"],
      attackCooldown: 0,
      isCharging: false,
      chargeTime: 0
    },
    playerEquipment: {
      armor: "diamond",
      armorDurability: 88
    },
    ARMOR_TYPES: {
      diamond: { name: "钻石盔甲" }
    },
    WEAPONS: {
      sword: { name: "石剑", emoji: "⚔️", type: "melee", cooldown: 20, range: 60, damage: 2 },
      pickaxe: { name: "铁镐", emoji: "⛏️", type: "dig", cooldown: 15, digHits: 1, range: 42, damage: 1 },
      bow: { name: "弓", emoji: "🏹", type: "ranged", cooldown: 30, range: 260, damage: 2, chargeMax: 40 }
    },
    platforms: [],
    chests: [],
    digHits: new Map(),
    treasureBlocks: [],
    trees: [],
    enemies: [],
    particles: [],
    projectiles: [],
    bombs: [],
    webTraps: [],
    fleshBaits: [],
    torches: [],
    document: {
      getElementById(id) {
        if (id === "equip-status") return equipStatusEl;
        return null;
      }
    },
    Chest,
    bossArena: { active: false }
  };
  vm.createContext(context);
  return { context, toasts, equipStatusEl };
}

function testB5EquipStatusRemovesArmorText() {
  const { context, equipStatusEl } = createWeaponsContext();
  runScriptInContext(context, "src/modules/04-weapons.js");
  vm.runInContext("updateEquipStatus()", context);

  assert.ok(equipStatusEl.innerText.includes("石剑"), "B-5: weapon text should still exist");
  assert.equal(
    equipStatusEl.innerText.includes("🛡️"),
    false,
    "B-5: weapon HUD should not contain armor info"
  );
  assert.equal(
    equipStatusEl.innerText.includes("钻石盔甲"),
    false,
    "B-5: weapon HUD should not duplicate armor label"
  );
}

function testB7HiddenChestGroundDoesNotDisappearOnFirstDig() {
  const { context, toasts } = createWeaponsContext();
  context.playerWeapons.current = "pickaxe";
  context.platforms = [{ x: 0, y: 300, width: 32, height: 32, type: "grass", remove: false }];
  context.treasureBlocks = [{ x: 0, y: 300, groundType: "grass" }];

  runScriptInContext(context, "src/modules/04-weapons.js");
  vm.runInContext("digGroundBlock()", context);

  assert.equal(context.chests.length, 1, "B-7: first dig should reveal hidden chest");
  assert.equal(context.platforms.length, 1, "B-7: first dig should keep floor for chest interaction");
  assert.equal(context.chests[0].hidden, true, "B-7: hidden chest should be marked as hidden");
  assert.ok(
    toasts.some((msg) => msg.includes("先打开宝箱")),
    "B-7: first dig should prompt player to open chest first"
  );
}

function testB4BrokenArmorClearsSameArmorFromBackpack() {
  const toastEl = { innerText: "", style: {} };
  const context = {
    console,
    Math,
    Date,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    blockSize: 32,
    cameraX: 0,
    canvas: { width: 960, height: 540 },
    paused: false,
    playerEquipment: {
      armor: "diamond",
      armorDurability: 1,
      armorEquippedAt: 100,
      armorLastDurabilityTick: 100
    },
    armorInventory: [
      { id: "diamond", durability: 30 },
      { id: "iron", durability: 90 }
    ],
    ARMOR_TYPES: {
      diamond: { name: "钻石盔甲", defense: 3 },
      iron: { name: "铁盔甲", defense: 2 }
    },
    updateArmorUI() {},
    updateInventoryUI() {},
    syncWeaponsFromInventory() {},
    updateWeaponUI() {},
    showToast() {},
    platforms: [],
    particles: [],
    enemies: [],
    chests: [],
    floatingTexts: [],
    items: [],
    player: { x: 0, y: 0, width: 32, height: 32 },
    inventoryModalEl: { classList: { contains() { return false; } } },
    gameConfig: {},
    inventory: { diamond: 10 },
    document: {
      getElementById(id) {
        if (id === "toast") return toastEl;
        return null;
      },
      querySelectorAll() {
        return [];
      }
    }
  };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/13-game-loop.js");
  vm.runInContext("breakEquippedArmor('diamond')", context);

  assert.equal(context.playerEquipment.armor, null, "B-4: equipped armor should be cleared");
  assert.ok(
    context.armorInventory.every((entry) => entry.id !== "diamond"),
    "B-4: backpack should not keep broken same-type armor residue"
  );
}

function testB3BlazeReinforcementUsesMiniType() {
  const context = {
    console,
    Math: createMath(),
    Date,
    settings: {},
    groundY: 320,
    cameraX: 0,
    canvas: { width: 960, height: 540 },
    player: { x: 100, y: 200, width: 32, height: 48 },
    damagePlayer() {},
    showFloatingText() {},
    showToast() {},
    getProgressScore() {
      return 0;
    },
    getBiomeSwitchConfig() {
      return {};
    },
    getBiomeById() {
      return { id: "forest" };
    }
  };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/15-entities-boss.js");
  const minions = vm.runInContext(
    "(() => { const boss = new BlazeBoss(200); boss.phase = 3; boss.summonMinions(); return boss.minions; })()",
    context
  );

  assert.ok(minions.length >= 2, "B-3: blaze boss should summon reinforcements");
  assert.ok(
    minions.every((m) => m.type === "blaze_mini"),
    "B-3: blaze reinforcements should carry blaze_mini type"
  );
}

function run() {
  testB1VillageChallengeWordsPreferSessionThenFallback();
  testB2TraderMaterialPricesIncludeExpandedItems();
  testB3BlazeReinforcementUsesMiniType();
  testB4BrokenArmorClearsSameArmorFromBackpack();
  testB5EquipStatusRemovesArmorText();
  testB7HiddenChestGroundDoesNotDisappearOnFirstDig();
  // eslint-disable-next-line no-console
  console.log("v1.4 gameplay fix checks passed");
}

run();
