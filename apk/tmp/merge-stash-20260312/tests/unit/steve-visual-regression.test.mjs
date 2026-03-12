import assert from "node:assert/strict";
import fs from "node:fs";

function readModuleCode(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function testDrawSteveSignatureAndHelpersExist() {
  const source = readModuleCode("src/modules/14-renderer-entities.js");
  assert.match(
    source,
    /function drawSteve\(x, y, facingRight, attacking\)/,
    "drawSteve 的公共签名必须保持不变"
  );

  const helpers = [
    "drawSteveHead",
    "drawSteveTorso",
    "drawSteveLimbs",
    "drawSteveArmorOverlay",
    "drawSteveShield",
    "drawSteveWeapon"
  ];

  for (const helperName of helpers) {
    assert.match(
      source,
      new RegExp(`function\\s+${helperName}\\s*\\(`),
      `${helperName} 必须存在，避免 Steve 绘制逻辑重新回到单体函数`
    );
  }
}

function testDrawSteveUsesLayeredHelperPipeline() {
  const source = readModuleCode("src/modules/14-renderer-entities.js");
  assert.match(
    source,
    /drawSteveLimbs\([\s\S]*["']back["']\)[\s\S]*drawSteveHead\([\s\S]*drawSteveTorso\([\s\S]*drawSteveLimbs\([\s\S]*["']front["']\)[\s\S]*drawSteveArmorOverlay\([\s\S]*drawSteveShield\([\s\S]*drawSteveWeapon\(/,
    "drawSteve 应按 背侧肢体 → 头部 → 身体/腿 → 护甲 → 盾牌 → 武器 的顺序调用 helper"
  );
}

function testSunscreenBranchStillUsesDedicatedPalette() {
  const source = readModuleCode("src/modules/14-renderer-entities.js");
  assert.match(source, /hasSunscreenBuff\(\)/, "Steve 渲染必须继续读取 sunscreen 状态");
  assert.match(
    source,
    /(getStevePalette\(hasSunscreen\)|hasSunscreen\s*\?\s*STEVE_SUNSCREEN_PALETTE)/,
    "sunscreen 分支应继续走独立 palette，而不是丢失浅色变体"
  );
}

function run() {
  testDrawSteveSignatureAndHelpersExist();
  testDrawSteveUsesLayeredHelperPipeline();
  testSunscreenBranchStillUsesDedicatedPalette();
  console.log("steve visual regression checks passed");
}

run();
