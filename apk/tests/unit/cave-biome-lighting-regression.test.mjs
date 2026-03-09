import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runScriptInContext(context, relPath) {
  vm.runInContext(readModuleCode(relPath), context, { filename: relPath });
}

function createBiomeVisualContext({ biome = "cave", noise = 0, torchRadius = 0 } = {}) {
  const context = {
    console,
    Math,
    Date,
    canvas: { width: 960, height: 540 },
    cameraX: 0,
    currentBiome: biome,
    player: { x: 280, y: 300, width: 32, height: 40 },
    decorations: [],
    torches: [],
    __noise: noise,
    __torchRadius: torchRadius,
    getDeepDarkNoiseLevel() {
      return context.__noise;
    },
    getPlayerTorchLightRadius() {
      return context.__torchRadius;
    }
  };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/19-biome-visuals.js");
  return context;
}

function testCaveGetsDedicatedSkyAndParticleConfig() {
  const context = createBiomeVisualContext();
  const caveSky = vm.runInContext("BIOME_SKY_CONFIG.cave", context);
  const caveParticles = vm.runInContext("BIOME_PARTICLE_CONFIG.cave", context);

  assert.ok(Array.isArray(caveSky) && caveSky.length === 3, "矿洞应拥有专属三段式天空 / 背景渐变");
  assert.equal(caveParticles.type, "dust", "矿洞应拥有独立的尘埃粒子配置");
  assert.ok(caveParticles.spawnRate > 0, "矿洞粒子配置应启用刷新频率");
}

function testCaveVisionRadiusGrowsWithTorchContract() {
  const context = createBiomeVisualContext({ biome: "cave", torchRadius: 0 });
  const withoutTorch = vm.runInContext("getPlayerVisionRadiusForBiome('cave')", context);

  context.__torchRadius = 220;
  const withTorch = vm.runInContext("getPlayerVisionRadiusForBiome('cave')", context);

  assert.equal(withoutTorch, 150, "矿洞基础可视半径应收紧到 150");
  assert.ok(withTorch > withoutTorch + 120, "火炬照明契约应明显扩大矿洞可视范围");
}

function testDeepDarkRadiusStillRespondsToNoiseAndTorch() {
  const context = createBiomeVisualContext({ biome: "deep_dark", noise: 80, torchRadius: 0 });
  const noisyRadius = vm.runInContext("getPlayerVisionRadiusForBiome('deep_dark')", context);

  context.__torchRadius = 220;
  const boostedRadius = vm.runInContext("getPlayerVisionRadiusForBiome('deep_dark')", context);

  assert.ok(noisyRadius < 140, "深暗之域在高噪音下应进一步压缩基础可视半径");
  assert.ok(boostedRadius > noisyRadius, "即使在深暗之域，火炬契约也应带来有限增亮");
}

function testBiomeRendererUsesPostEffectsAfterDarknessOverlay() {
  const context = { console, Math, Date };
  vm.createContext(context);
  runScriptInContext(context, "src/modules/14-renderer-main.js");

  const drawSource = String(context.draw);
  assert.match(drawSource, /const darknessAlpha = typeof getBiomeDarknessOverlayAlpha === "function"[\s\S]*?if \(darknessAlpha > 0\)/, "主渲染应复用群系黑暗 helper");
  assert.match(drawSource, /renderBiomePostEffects\(ctx, cameraX\)/, "主渲染末端应调用群系后处理遮罩");
  assert.match(drawSource, /darknessAlpha[\s\S]*renderBiomePostEffects\(ctx, cameraX\)/, "群系后处理应发生在基础黑暗覆盖之后");
}

function testCaveBackdropAndTorchMaskAreWiredIntoBiomeVisuals() {
  const context = createBiomeVisualContext();
  assert.match(String(context.renderBiomeVisuals), /renderCaveBackdrop\(ctx, camX\)/, "矿洞背景应接入 renderBiomeVisuals");
  assert.match(String(context.renderBiomePostEffects), /renderBiomeVisionMask\(ctx, camX\)/, "矿洞后处理应统一走视觉遮罩");
}

function testCaveBiomeGetsFlavorEnemySpawnCase() {
  const enemySource = readModuleCode("src/modules/20-enemies-new.js");
  assert.match(enemySource, /case "cave":[\s\S]*?spore_bug/, "矿洞群系应补充洞穴风味敌人刷新分支");
}

function testCaveIsRegisteredAsRealBiome() {
  const configSource = readModuleCode("src/modules/01-config.js");
  assert.match(
    configSource,
    /cave:\s*\{[\s\S]*id:\s*["']cave["']/,
    "基础群系配置必须真正注册 cave，调试页切矿洞时不能回退成 forest"
  );
  assert.match(
    configSource,
    /order:\s*\[[^\]]*["']cave["']/,
    "群系切换顺序应包含 cave，避免调试入口和正式群系配置脱节"
  );
}

function run() {
  testCaveGetsDedicatedSkyAndParticleConfig();
  testCaveVisionRadiusGrowsWithTorchContract();
  testDeepDarkRadiusStillRespondsToNoiseAndTorch();
  testBiomeRendererUsesPostEffectsAfterDarknessOverlay();
  testCaveBackdropAndTorchMaskAreWiredIntoBiomeVisuals();
  testCaveBiomeGetsFlavorEnemySpawnCase();
  testCaveIsRegisteredAsRealBiome();
  console.log("cave biome lighting regression checks passed");
}

run();
