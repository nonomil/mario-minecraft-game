import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runScriptInContext(context, relPath) {
  vm.runInContext(readModuleCode(relPath), context, { filename: relPath });
}

function createCombatContext() {
  class Entity {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.remove = false;
    }
  }

  const context = {
    console,
    Math,
    Date,
    Entity,
    worldScale: { unit: 1 },
    rectIntersect: () => false,
    damagePlayer: () => {},
    showFloatingText: () => {},
    showToast: () => {},
    dismountRider: () => {},
    projectiles: [],
    dragonList: [],
    bossArena: { active: false },
    cameraX: 0,
    canvas: { width: 800 },
    groundY: 600
  };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/15-entities-combat.js");
  return context;
}

function testSummonedDragonStartsInStandbyState() {
  const context = createCombatContext();
  const EnderDragon = vm.runInContext("EnderDragon", context);
  const dragon = new EnderDragon(100, 120);

  assert.equal(dragon.state, "standby", "召唤龙默认应进入 standby 状态");
  assert.equal(typeof dragon.getStandbyAnchor, "function", "召唤龙应暴露待命锚点计算方法");
}

function testStandbyDragonStaysGroundedAndDoesNotTrackPlayerBeforeMount() {
  const context = createCombatContext();
  const EnderDragon = vm.runInContext("EnderDragon", context);
  const dragon = new EnderDragon(100, 120);
  const player = { x: 80, y: 320 };

  dragon.setStandbyState(player);
  const initialX = dragon.x;
  const initialY = dragon.y;

  player.x += 220;
  player.y -= 110;
  for (let i = 0; i < 40; i += 1) {
    dragon.update(player);
  }

  assert.equal(dragon.state, "standby", "未上龙前应保持 standby 状态");
  assert.ok(Math.abs(dragon.x - initialX) <= 1, "未上龙前末影龙应停在原地，不应持续跟随主角");
  assert.ok(Math.abs(dragon.y - initialY) <= 1, "未上龙前末影龙应保持原地待命，不应悬停追随");
  assert.equal(dragon.y, context.groundY - dragon.height, "未上龙前末影龙应停在地面上");
}

function testReturningDragonSettlesBackToStandbyNearPlayer() {
  const context = createCombatContext();
  const EnderDragon = vm.runInContext("EnderDragon", context);
  const dragon = new EnderDragon(20, 20);
  const player = { x: 200, y: 240 };

  dragon.setReturningState(player);
  dragon.x = 280;
  dragon.y = 40;

  for (let i = 0; i < 160; i += 1) {
    dragon.update(player);
  }

  const anchor = dragon.getStandbyAnchor(player);
  const dx = Math.abs(dragon.x - anchor.x);
  const dy = Math.abs(dragon.y - anchor.y);
  assert.equal(dragon.state, "standby", "回归中的龙到达主角附近后应切回 standby");
  assert.ok(dx <= 20 && dy <= 20, "回归后的龙应稳定停在主角待命位置附近");
}

function testDragonRendererMatchesBossLikePixelSilhouette() {
  const ops = [];
  const ctx = {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    beginPath() {
      ops.push("beginPath");
    },
    moveTo(...args) {
      ops.push(["moveTo", ...args]);
    },
    lineTo(...args) {
      ops.push(["lineTo", ...args]);
    },
    quadraticCurveTo(...args) {
      ops.push(["quadraticCurveTo", ...args]);
    },
    ellipse(...args) {
      ops.push(["ellipse", ...args]);
    },
    closePath() {
      ops.push("closePath");
    },
    arc(...args) {
      ops.push(["arc", ...args]);
    },
    fill() {
      ops.push("fill");
    },
    stroke() {
      ops.push("stroke");
    },
    translate(...args) {
      ops.push(["translate", ...args]);
    },
    scale(...args) {
      ops.push(["scale", ...args]);
    },
    fillRect(...args) {
      ops.push(["fillRect", ...args]);
    },
    strokeRect(...args) {
      ops.push(["strokeRect", ...args]);
    },
    save() {},
    restore() {}
  };

  const context = {
    console,
    Math,
    Date,
    ctx,
    drawHealthBar: () => {}
  };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/14-renderer-entities.js");
  context.drawEnderDragon({
    x: 100,
    y: 120,
    width: 96,
    height: 56,
    hp: 30,
    maxHp: 30,
    rider: null,
    animationTime: 0
  });

  assert.ok(
    ops.filter(op => Array.isArray(op) && op[0] === "fillRect").length >= 16,
    "召唤龙应采用 Boss 末影龙那种块面像素轮廓，包含足够多的 body/head/tail 分节矩形"
  );
  assert.ok(
    ops.some(op => Array.isArray(op) && op[0] === "ellipse"),
    "召唤龙应保留地面阴影，避免整只龙漂浮发虚"
  );
  assert.ok(
    ops.some(op => op === "stroke"),
    "召唤龙应绘制浅灰翼骨线条，贴近 Boss 末影龙视觉语言"
  );
  assert.ok(
    ops.filter(op => Array.isArray(op) && op[0] === "lineTo").length >= 6,
    "召唤龙应保留展开双翼的折线轮廓"
  );
}

function testDragonRendererCanFlipFacingDirection() {
  const ops = [];
  const ctx = {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    ellipse() {},
    fill() {},
    stroke() {},
    translate(...args) {
      ops.push(["translate", ...args]);
    },
    scale(...args) {
      ops.push(["scale", ...args]);
    },
    fillRect() {},
    strokeRect() {},
    save() {},
    restore() {}
  };
  const context = { console, Math, Date, ctx, drawHealthBar: () => {} };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/14-renderer-entities.js");
  context.drawEnderDragon({
    x: 10,
    y: 20,
    width: 96,
    height: 56,
    hp: 30,
    maxHp: 30,
    rider: null,
    animationTime: 0,
    facingRight: true
  });

  assert.ok(
    ops.some(op => Array.isArray(op) && op[0] === "scale" && op[1] === -1 && op[2] === 1),
    "末影龙朝右时，渲染应镜像翻转，让龙头切到右边"
  );
}

function testGameLoopSetsReturningStateOnDismount() {
  const source = readModuleCode("src/modules/13-game-loop.js");
  assert.match(
    source,
    /state\s*=\s*["']returning["']|setReturningState\s*\(/,
    "下龙逻辑应把召唤龙切到 returning 状态"
  );
  assert.match(
    source,
    /dragonRemountCooldownFrames\s*=\s*24\b/,
    "下龙后应设置短暂的重新骑乘冷却，避免主角留在龙身范围内立刻重新上龙"
  );
  assert.match(
    source,
    /ridingDragon\.y\s*=\s*Math\.max\(50,\s*Math\.min\(ridingDragon\.y,\s*groundY\s*-\s*ridingDragon\.height\)\)/,
    "骑乘末影龙时最低高度应允许降到与地面平齐"
  );
}

function testMountAndDismountHintsExplainDragonControls() {
  const source = readModuleCode("src/modules/13-game-loop.js");
  assert.match(
    source,
    /showToast\("🐉 骑乘末影龙.*攻击.*喷.*切换.*下龙"\)|showToast\('🐉 骑乘末影龙.*攻击.*喷.*切换.*下龙'\)/,
    "上龙提示应明确告诉玩家攻击可喷火、切换可下龙"
  );
  assert.match(
    source,
    /showToast\("⬇️ 已下龙.*回到身边"\)|showToast\('⬇️ 已下龙.*回到身边'\)/,
    "下龙提示应明确告诉玩家末影龙会回到主角身边"
  );
}

function testMobileHoldAttackUsesDragonFireInsteadOfConsumableWhileMounted() {
  const source = readModuleCode("src/modules/16-events.js");
  assert.match(
    source,
    /if\s*\(\s*typeof ridingDragon !== ["']undefined["']\s*&&\s*ridingDragon\s*\)\s*\{\s*dragonShootFireball\(\)/,
    "骑乘末影龙时，移动端攻击按钮长按也应直接喷火，不应走消耗品逻辑"
  );
}

function testDragonFireballStartsFlatThenDrops() {
  const context = createCombatContext();
  const EnderDragonFireball = vm.runInContext("EnderDragonFireball", context);
  const fireball = new EnderDragonFireball(20, 40, 220, 40);
  const samples = [];

  for (let i = 0; i < 18; i += 1) {
    fireball.update({ x: 0, y: 0, width: 0, height: 0 }, [], []);
    samples.push(fireball.y);
  }

  const earlySegment = samples.slice(0, 6);
  const lateSegment = samples.slice(12);
  const earlyVariance = Math.max(...earlySegment) - Math.min(...earlySegment);
  const lateDrop = lateSegment[lateSegment.length - 1] - earlySegment[earlySegment.length - 1];

  assert.ok(earlyVariance <= 2, "末影龙火球起飞后前几帧应基本平飞，不能立刻大幅下坠");
  assert.ok(lateDrop >= 6, "末影龙火球在平飞一段后应明显下落，形成抛物线");
}

function testMobileDragonFlightButtonsExistAndAreBound() {
  const html = readModuleCode("Game.html");
  assert.match(
    html,
    /<div class="touch-left"[\s\S]*data-action="up"[\s\S]*data-action="left"[\s\S]*data-action="right"[\s\S]*data-action="down"/,
    "移动端左侧控制区应包含 up/left/right/down 四个骑龙方向键"
  );

  const css = readModuleCode("src/styles/20-touch-controls.css");
  assert.match(
    css,
    /\.touch-left[\s\S]*grid-template-columns:\s*repeat\(3,\s*var\(--touch-btn-size\)\)/,
    "左侧飞行键应改为 3 列十字布局，而不是四键并排"
  );
  assert.match(
    css,
    /grid-template-areas:\s*["']?\.\s+up\s+\.[\s\S]*["']?left\s+\.\s+right[\s\S]*["']?\.\s+down\s+\./,
    "左侧飞行键应使用十字区域布局，上下位于左右中间"
  );

  const eventsSource = readModuleCode("src/modules/16-events.js");
  assert.match(
    eventsSource,
    /bindHold\("up",[\s\S]*keys\.up\s*=\s*true;[\s\S]*keys\.up\s*=\s*false;[\s\S]*\)/,
    "移动端 up 按钮应绑定为持续上飞输入"
  );
  assert.match(
    eventsSource,
    /bindHold\("down",[\s\S]*keys\.down\s*=\s*true;[\s\S]*keys\.down\s*=\s*false;[\s\S]*\)/,
    "移动端 down 按钮应绑定为持续下飞输入"
  );
}

function testTraderSellsDragonEggForOneHundredDiamonds() {
  const source = readModuleCode("src/modules/18-village.js");
  assert.match(
    source,
    /\{\s*id:\s*["']dragon_egg["'].*cost:\s*100\b/,
    "商人材料列表中的龙蛋售价应为 100 钻石"
  );
}

function testBossHpDoublesWhenSummonedDragonExists() {
  const source = readModuleCode("src/modules/15-entities-boss.js");
  assert.match(
    source,
    /if\s*\(\s*typeof dragonList !== ["']undefined["']\s*&&\s*Array\.isArray\(dragonList\)\s*&&\s*dragonList\.some\(/,
    "进入 BOSS 战时应检查是否已有召唤末影龙参战"
  );
  assert.match(
    source,
    /boss\.maxHp\s*=\s*Math\.round\(boss\.maxHp\s*\*\s*2\)|this\.boss\.maxHp\s*=\s*Math\.round\(this\.boss\.maxHp\s*\*\s*2\)/,
    "有召唤末影龙时，BOSS 最大血量应翻倍"
  );
}

function run() {
  testSummonedDragonStartsInStandbyState();
  testStandbyDragonStaysGroundedAndDoesNotTrackPlayerBeforeMount();
  testReturningDragonSettlesBackToStandbyNearPlayer();
  testDragonRendererMatchesBossLikePixelSilhouette();
  testDragonRendererCanFlipFacingDirection();
  testGameLoopSetsReturningStateOnDismount();
  testMountAndDismountHintsExplainDragonControls();
  testMobileHoldAttackUsesDragonFireInsteadOfConsumableWhileMounted();
  testDragonFireballStartsFlatThenDrops();
  testMobileDragonFlightButtonsExistAndAreBound();
  testTraderSellsDragonEggForOneHundredDiamonds();
  testBossHpDoublesWhenSummonedDragonExists();
  console.log("dragon summon regression checks passed");
}

run();
