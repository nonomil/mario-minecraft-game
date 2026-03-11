import { expect, test } from "@playwright/test";
import { openDebugPage } from "./helpers.mjs";

test("GameDebug can enter the dedicated dragon arena", async ({ page }) => {
  await openDebugPage(page);

  const apiType = await page.evaluate(() => typeof window.MMDBG.enterDragonArena);
  expect(apiType).toBe("function");

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    return window.MMDBG.getState();
  });

  expect(state.dragonArenaActive).toBeTruthy();
  expect(["intro", "combat"]).toContain(state.dragonArenaState);
  expect(state.dragonBossName).toBe("Ender Dragon");
  expect(state.dragonCrystalCount).toBeGreaterThanOrEqual(4);
});



test("Dragon arena exposes player-facing HUD labels and victory messaging", async ({ page }) => {
  await openDebugPage(page);

  const entered = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    return window.MMDBG.getState();
  });

  expect(entered.dragonHudTitle).toBe("ENDER DRAGON");
  expect(entered.dragonPhaseLabel).toContain("Phase 1");
  expect(entered.dragonCrystalLabel).toContain("4");
  expect(entered.dragonObjectiveLabel).toContain("crystal");
  expect(entered.dragonBannerText).toBeTruthy();

  const victory = await page.evaluate(() => {
    window.MMDBG.forceDragonVictory();
    window.MMDBG.tick(12);
    return window.MMDBG.getState();
  });

  expect(victory.dragonStatusLabel).toContain("Portal");
  expect(victory.dragonBannerText).toBeTruthy();
});


test("Dragon arena exposes phase, damage, and portal feedback states", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    const entered = window.MMDBG.getState();
    window.MMDBG.setDragonArenaPhase(2);
    const phaseShift = window.MMDBG.getState();
    window.MMDBG.damageDragonBoss(15);
    const damaged = window.MMDBG.getState();
    window.MMDBG.tick(12);
    const decayed = window.MMDBG.getState();
    window.MMDBG.forceDragonVictory();
    window.MMDBG.tick(10);
    const victory = window.MMDBG.getState();
    return { entered, phaseShift, damaged, decayed, victory };
  });

  expect(state.entered.dragonPhasePulse).toBe(0);
  expect(state.phaseShift.dragonPhasePulse).toBeGreaterThan(0);
  expect(state.damaged.dragonDamageFlash).toBeGreaterThan(0);
  expect(state.decayed.dragonPhasePulse).toBeLessThan(state.phaseShift.dragonPhasePulse);
  expect(state.decayed.dragonDamageFlash).toBeLessThan(state.damaged.dragonDamageFlash);
  expect(state.victory.dragonPortalPulse).toBeGreaterThan(0);
});


test("Dragon arena exposes stable intent keys for phases 1 to 3", async ({ page }) => {
  await openDebugPage(page);

  const phaseOneState = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    window.MMDBG.tick(10);
    return window.MMDBG.getState();
  });

  expect(phaseOneState.dragonArenaPhase).toBe(1);
  expect(phaseOneState.dragonBossIntentKey).toBe("orbit_crystal_heal");

  const phaseTwoState = await page.evaluate(() => {
    window.MMDBG.setDragonArenaPhase(2);
    window.MMDBG.tick(10);
    return window.MMDBG.getState();
  });

  expect(phaseTwoState.dragonArenaPhase).toBe(2);
  expect(["dive_charge", "fireball_breath"]).toContain(phaseTwoState.dragonBossIntentKey);

  const phaseThreeState = await page.evaluate(() => {
    window.MMDBG.setDragonArenaPhase(3);
    window.MMDBG.tick(10);
    return window.MMDBG.getState();
  });

  expect(phaseThreeState.dragonArenaPhase).toBe(3);
  expect(["perch_frenzy", "low_sweep"]).toContain(phaseThreeState.dragonBossIntentKey);
});

test("Dragon boss can take direct debug damage", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    const before = window.MMDBG.getState();
    window.MMDBG.damageDragonBoss(25);
    const after = window.MMDBG.getState();
    return { before, after };
  });

  expect(state.before.dragonBossHp).toBeGreaterThan(state.after.dragonBossHp);
  expect(state.after.dragonBossHp).toBe(state.before.dragonBossHp - 25);
});


test("Dragon crystals heal the boss and can be destroyed", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    window.MMDBG.damageDragonBoss(40);
    const damaged = window.MMDBG.getState();
    window.MMDBG.tick(20);
    const healed = window.MMDBG.getState();
    window.MMDBG.destroyDragonCrystal(0);
    const afterCrystalBreak = window.MMDBG.getState();
    return { damaged, healed, afterCrystalBreak };
  });

  expect(state.damaged.dragonBossHp).toBe(260);
  expect(state.healed.dragonBossHp).toBeGreaterThan(state.damaged.dragonBossHp);
  expect(state.afterCrystalBreak.dragonAliveCrystalCount).toBe(3);
});

test("Dragon hazards and victory portal states are exposed", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    window.MMDBG.setDragonArenaPhase(2);
    window.MMDBG.tick(18);
    const combat = window.MMDBG.getState();
    window.MMDBG.forceDragonVictory();
    window.MMDBG.tick(12);
    const victory = window.MMDBG.getState();
    return { combat, victory };
  });

  expect(state.combat.dragonHazardCount).toBeGreaterThan(0);
  expect(state.victory.dragonVictoryReady).toBeTruthy();
  expect(state.victory.dragonExitPortalReady).toBeTruthy();
});

test("Dragon arena renders a visible dragon silhouette with bright wing bones", async ({ page }) => {
  await openDebugPage(page);

  const metrics = await page.evaluate(async () => {
    window.MMDBG.enterDragonArena();
    window.MMDBG.tick(8);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const frame = document.getElementById("game");
    const gameWindow = frame && frame.contentWindow ? frame.contentWindow : null;
    const arena = gameWindow && gameWindow.endDragonArena ? gameWindow.endDragonArena : null;
    const dragon = arena && arena.dragon ? arena.dragon : null;
    const canvas = gameWindow && gameWindow.document ? gameWindow.document.getElementById("gameCanvas") : null;
    const ctx = canvas ? canvas.getContext("2d", { willReadFrequently: true }) : null;
    if (!dragon || !canvas || !ctx) {
      return { brightWingBonePixels: 0, magentaEyePixels: 0, width: 0, height: 0 };
    }

    const sampleWidth = 280;
    const sampleHeight = 170;
    const left = Math.max(0, Math.round(dragon.x - sampleWidth / 2));
    const top = Math.max(0, Math.round(dragon.y - sampleHeight / 2));
    const width = Math.min(sampleWidth, canvas.width - left);
    const height = Math.min(sampleHeight, canvas.height - top);
    const pixels = ctx.getImageData(left, top, width, height).data;

    let brightWingBonePixels = 0;
    let magentaEyePixels = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const alpha = pixels[index + 3];
      if (alpha < 1) continue;
      if (red >= 145 && green >= 145 && blue >= 145) brightWingBonePixels += 1;
      if (red >= 180 && green <= 120 && blue >= 180) magentaEyePixels += 1;
    }

    return { brightWingBonePixels, magentaEyePixels, width, height };
  });

  expect(metrics.width).toBeGreaterThan(0);
  expect(metrics.height).toBeGreaterThan(0);
  expect(metrics.brightWingBonePixels).toBeGreaterThan(180);
  expect(metrics.magentaEyePixels).toBeGreaterThan(2);
});

test("Dragon phase 1 tracks the player's horizontal position", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    const frame = document.getElementById("game");
    const gameWindow = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!gameWindow || typeof gameWindow.eval !== "function" || !gameWindow.endDragonArena || !gameWindow.endDragonArena.dragon) {
      return { beforeX: 0, afterX: 0, playerX: 0 };
    }

    gameWindow.eval("player.x = 980; player.y = 360;");

    const beforeX = Number(gameWindow.endDragonArena.dragon.x) || 0;
    for (let index = 0; index < 24; index += 1) {
      gameWindow.endDragonArena.update();
    }
    const afterX = Number(gameWindow.endDragonArena.dragon.x) || 0;
    const playerX = Number(gameWindow.eval("player.x")) || 0;
    return { beforeX, afterX, playerX };
  });

  expect(state.playerX).toBe(980);
  expect(state.afterX).toBeGreaterThan(state.beforeX + 140);
  expect(state.afterX).toBeGreaterThan(700);
});

test("Dragon phase 2 aggressively shrinks horizontal gap to the player", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    window.MMDBG.setDragonArenaPhase(2);

    const frame = document.getElementById("game");
    const gameWindow = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!gameWindow || typeof gameWindow.eval !== "function" || !gameWindow.endDragonArena || !gameWindow.endDragonArena.dragon) {
      return { beforeGap: 0, afterGap: 0, dragonX: 0, playerX: 0 };
    }

    gameWindow.eval("player.x = 1040; player.y = 360;");

    const beforeGap = Math.abs((Number(gameWindow.endDragonArena.dragon.x) || 0) - (Number(gameWindow.eval("player.x")) || 0));
    for (let index = 0; index < 18; index += 1) {
      gameWindow.endDragonArena.update();
    }
    const dragonX = Number(gameWindow.endDragonArena.dragon.x) || 0;
    const playerX = Number(gameWindow.eval("player.x")) || 0;
    const afterGap = Math.abs(dragonX - playerX);
    return { beforeGap, afterGap, dragonX, playerX };
  });

  expect(state.playerX).toBe(1040);
  expect(state.beforeGap).toBeGreaterThan(300);
  expect(state.afterGap).toBeLessThan(state.beforeGap - 180);
  expect(state.dragonX).toBeGreaterThan(760);
});

test("Dragon body contact damages the player during pursuit", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.setGodMode(false);
    window.MMDBG.enterDragonArena();
    const frame = document.getElementById("game");
    const gameWindow = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!gameWindow || typeof gameWindow.eval !== "function" || !gameWindow.endDragonArena || !gameWindow.endDragonArena.dragon) {
      return { beforeHp: 0, afterHp: 0 };
    }

    gameWindow.eval(`
      playerHp = playerMaxHp;
      playerInvincibleTimer = 0;
      player.x = endDragonArena.dragon.x;
      player.y = endDragonArena.dragon.y;
      player.velX = 0;
      player.velY = 0;
    `);

    const beforeHp = Number(gameWindow.eval("playerHp")) || 0;
    gameWindow.endDragonArena.update();
    const afterHp = Number(gameWindow.eval("playerHp")) || 0;
    return { beforeHp, afterHp };
  });

  expect(state.beforeHp).toBeGreaterThan(0);
  expect(state.afterHp).toBeLessThan(state.beforeHp);
});

test("Dragon breath hazards damage the player in phase 2", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.setGodMode(false);
    window.MMDBG.enterDragonArena();
    window.MMDBG.setDragonArenaPhase(2);
    const frame = document.getElementById("game");
    const gameWindow = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!gameWindow || typeof gameWindow.eval !== "function" || !gameWindow.endDragonArena) {
      return { beforeHp: 0, afterHp: 0, hazardCount: 0 };
    }

    gameWindow.eval(`
      playerHp = playerMaxHp;
      playerInvincibleTimer = 0;
      player.x = 920;
      player.y = 360;
      player.velX = 0;
      player.velY = 0;
    `);

    const beforeHp = Number(gameWindow.eval("playerHp")) || 0;
    for (let index = 0; index < 18; index += 1) {
      gameWindow.endDragonArena.update();
    }
    const afterHp = Number(gameWindow.eval("playerHp")) || 0;
    const hazardCount = Array.isArray(gameWindow.endDragonArena.hazards) ? gameWindow.endDragonArena.hazards.length : 0;
    return { beforeHp, afterHp, hazardCount };
  });

  expect(state.hazardCount).toBeGreaterThan(0);
  expect(state.afterHp).toBeLessThan(state.beforeHp);
});

test("Dragon phase 2 launches fireballs toward the player", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.setGodMode(false);
    window.MMDBG.enterDragonArena();
    window.MMDBG.setDragonArenaPhase(2);
    const frame = document.getElementById("game");
    const gameWindow = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!gameWindow || typeof gameWindow.eval !== "function" || !gameWindow.endDragonArena || !gameWindow.endDragonArena.dragon) {
      return { fireballCount: 0, taggedCount: 0 };
    }

    gameWindow.eval(`
      playerHp = playerMaxHp;
      playerInvincibleTimer = 0;
      player.x = 1040;
      player.y = 340;
      player.velX = 0;
      player.velY = 0;
      if (Array.isArray(projectiles)) projectiles.length = 0;
      endDragonArena.dragon.updateCount = 8;
    `);

    for (let index = 0; index < 16; index += 1) {
      gameWindow.endDragonArena.update();
    }

    const fireballCount = Number(gameWindow.eval("Array.isArray(projectiles) ? projectiles.length : 0")) || 0;
    const taggedCount = Number(gameWindow.eval("Array.isArray(projectiles) ? projectiles.filter(p => p && p.arenaDragonFireball).length : 0")) || 0;
    return { fireballCount, taggedCount };
  });

  expect(state.fireballCount).toBeGreaterThan(0);
  expect(state.taggedCount).toBeGreaterThan(0);
});

test("Player melee attacks can destroy dragon crystals", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    const frame = document.getElementById("game");
    const gameWindow = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!gameWindow || typeof gameWindow.eval !== "function" || !gameWindow.endDragonArena || !Array.isArray(gameWindow.endDragonArena.crystals)) {
      return { beforeAlive: 0, afterAlive: 0 };
    }

    const targetCrystal = gameWindow.endDragonArena.crystals.find((entry) => entry && entry.alive);
    if (!targetCrystal) return { beforeAlive: 0, afterAlive: 0 };

    gameWindow.eval(`
      player.facingRight = true;
      player.x = ${Number(targetCrystal.x) - 44};
      player.y = ${Number(targetCrystal.y) - 40};
      playerWeapons.current = "sword";
      playerWeapons.attackCooldown = 0;
      player.isAttacking = false;
    `);

    const beforeAlive = gameWindow.endDragonArena.crystals.filter((entry) => entry && entry.alive).length;
    gameWindow.eval("performMeleeAttack(WEAPONS.sword);");
    const afterAlive = gameWindow.endDragonArena.crystals.filter((entry) => entry && entry.alive).length;
    return { beforeAlive, afterAlive };
  });

  expect(state.beforeAlive).toBeGreaterThan(0);
  expect(state.afterAlive).toBe(state.beforeAlive - 1);
});

test("Player projectiles can destroy dragon crystals", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    const frame = document.getElementById("game");
    const gameWindow = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!gameWindow || typeof gameWindow.eval !== "function" || !gameWindow.endDragonArena || !Array.isArray(gameWindow.endDragonArena.crystals)) {
      return { beforeAlive: 0, afterAlive: 0, projectileCount: 0 };
    }

    const targetCrystal = gameWindow.endDragonArena.crystals.find((entry) => entry && entry.alive);
    if (!targetCrystal) return { beforeAlive: 0, afterAlive: 0, projectileCount: 0 };

    const beforeAlive = gameWindow.endDragonArena.crystals.filter((entry) => entry && entry.alive).length;
    gameWindow.eval(`
      if (Array.isArray(projectiles)) projectiles.length = 0;
      const arrow = new Arrow(${Number(targetCrystal.x) - 60}, ${Number(targetCrystal.y)}, ${Number(targetCrystal.x)}, ${Number(targetCrystal.y)}, "player", 10, 12);
      projectiles.push(arrow);
    `);

    for (let index = 0; index < 12; index += 1) {
      gameWindow.eval("projectiles.forEach(p => p.update(player, golems, enemies)); projectiles = projectiles.filter(p => !p.remove);");
    }

    const afterAlive = gameWindow.endDragonArena.crystals.filter((entry) => entry && entry.alive).length;
    const projectileCount = Number(gameWindow.eval("Array.isArray(projectiles) ? projectiles.length : 0")) || 0;
    return { beforeAlive, afterAlive, projectileCount };
  });

  expect(state.beforeAlive).toBeGreaterThan(0);
  expect(state.afterAlive).toBe(state.beforeAlive - 1);
  expect(state.projectileCount).toBe(0);
});

test("Dragon crystals spawn low enough for melee and projectile follow-up", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    const frame = document.getElementById("game");
    const gameWindow = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!gameWindow || !gameWindow.endDragonArena || !Array.isArray(gameWindow.endDragonArena.crystals)) {
      return { count: 0, minY: 0, maxY: 0 };
    }

    const ys = gameWindow.endDragonArena.crystals
      .filter((entry) => entry && entry.alive)
      .map((entry) => Number(entry.y) || 0);

    return {
      count: ys.length,
      minY: ys.length ? Math.min(...ys) : 0,
      maxY: ys.length ? Math.max(...ys) : 0
    };
  });

  expect(state.count).toBeGreaterThan(0);
  expect(state.minY).toBeGreaterThanOrEqual(200);
});

test("Dragon healing beam follows the nearest alive crystal instead of a fixed pillar", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    const frame = document.getElementById("game");
    const gameWindow = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!gameWindow || typeof gameWindow.eval !== "function" || !gameWindow.endDragonArena || !gameWindow.endDragonArena.dragon) {
      return { activeBeamIndex: -1 };
    }

    gameWindow.eval(`
      endDragonArena.dragon.x = 690;
      endDragonArena.dragon.y = 210;
    `);
    gameWindow.endDragonArena.updateCrystals();

    const activeBeamIndex = gameWindow.endDragonArena.crystals.findIndex((entry) => entry && entry.beamActive);
    return { activeBeamIndex };
  });

  expect(state.activeBeamIndex).toBe(3);
});
