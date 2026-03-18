import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runScriptInContext(context, relPath) {
  vm.runInContext(readModuleCode(relPath), context, { filename: relPath });
}

function createContext() {
  const context = {
    console,
    Math,
    Date,
    setTimeout,
    clearTimeout,
    blockSize: 50,
    groundY: 300,
    fallResetY: 2000,
    worldScale: { unit: 1 },
    gameConfig: {
      physics: { gravity: 0.5 },
      scoring: { enemy: 10 }
    },
    ENEMY_STATS: {
      zombie: { size: { w: 32, h: 40 }, hp: 10, speed: 1.5, damage: 1, attackType: "melee", color: "#4caf50", drops: [], scoreValue: 10 },
      spider: { size: { w: 40, h: 24 }, hp: 12, speed: 2, damage: 2, attackType: "melee", color: "#212121", drops: [], scoreValue: 12 }
    },
    getDifficultyState() {
      return { enemyHpMult: 1, enemyDamageMult: 1, scoreMultiplier: 1 };
    },
    dropItem() {},
    addScore() {},
    recordEnemyKill() {},
    playHitSfx() {},
    damagePlayer() {},
    showFloatingText() {},
    rectIntersect() { return false; },
    platforms: [],
    trees: [],
    projectiles: [],
    dragonList: [],
    enemies: [],
    currentBiome: "forest",
    bossArena: { active: false },
    endDragonArena: { active: false },
    getGolemConfig() {
      return {
        ironGolem: { hp: 100, damage: 10, speed: 1, followDelay: 30, attackCooldown: 60, attackRange: 80, meleeRange: 60, sonicDamage: 8, size: { w: 40, h: 48 } },
        snowGolem: { hp: 60, damage: 6, speed: 1.2, followDelay: 20, attackCooldown: 40, attackRange: 120, meleeRange: 48, sonicDamage: 6, size: { w: 32, h: 40 } },
        wardenGolem: { hp: 180, damage: 18, speed: 1.1, followDelay: 20, attackCooldown: 45, attackRange: 130, meleeRange: 56, sonicDamage: 12, size: { w: 44, h: 54 } }
      };
    }
  };
  context.globalThis = context;
  vm.createContext(context);
  runScriptInContext(context, "src/modules/15-entities-base.js");
  runScriptInContext(context, "src/modules/15-entities-combat.js");
  return context;
}

function createFloor() {
  return { x: 0, y: 300, width: 500, height: 50, type: "grass" };
}

function testSpiderClimbsGrassLedge() {
  const context = createContext();
  const Enemy = vm.runInContext("Enemy", context);
  context.platforms = [
    createFloor(),
    { x: 215, y: 250, width: 50, height: 50, type: "grass" }
  ];

  const spider = new Enemy(180, 276, "spider", 240);
  const player = { x: 235, y: 210, width: 26, height: 40 };
  const initialY = spider.y;
  let sawClimbState = false;

  for (let index = 0; index < 12; index += 1) {
    spider.update(player);
    if (spider.state === "climb") sawClimbState = true;
  }

  assert.equal(sawClimbState, true, "蜘蛛遇到草方块台阶且主角更高时应进入攀爬状态");
  assert.ok(spider.y < initialY - 8, "蜘蛛应沿草方块侧面向上爬，而不是继续卡在原地");
  assert.ok(spider.y <= 226.5, "蜘蛛应能真正爬上草方块顶部，而不是穿过侧面后仍停在低处");
}

function testSpiderClimbsTreeTrunk() {
  const context = createContext();
  const Enemy = vm.runInContext("Enemy", context);
  const Tree = vm.runInContext("Tree", context);
  context.platforms = [createFloor()];
  context.trees = [new Tree(205, 300, "oak")];

  const spider = new Enemy(190, 276, "spider", 240);
  const player = { x: 235, y: 180, width: 26, height: 40 };
  const initialY = spider.y;
  let sawClimbState = false;

  for (let index = 0; index < 12; index += 1) {
    spider.update(player);
    if (spider.state === "climb") sawClimbState = true;
  }

  assert.equal(sawClimbState, true, "蜘蛛遇到树干且主角更高时应尝试爬树");
  assert.ok(spider.y < initialY - 8, "蜘蛛应顺着树干向上移动");
}

function run() {
  testSpiderClimbsGrassLedge();
  testSpiderClimbsTreeTrunk();
  console.log("spider climb regression checks passed");
}

run();
