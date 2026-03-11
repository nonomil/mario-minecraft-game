import { test, expect } from "@playwright/test";
async function openGameDebug(page) {
  await page.goto(`/tests/debug-pages/GameDebug.html?ts=${Date.now()}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6000);
  await page.evaluate(() => {
    if (window.MMDBG) {
      window.MMDBG.ensureRunning();
      window.MMDBG.setGodMode(true);
    }
  });
  await expect.poll(async () => page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    return Boolean(w && w.eval('!!player'));
  })).toBe(true);
}

async function gameEval(page, expression) {
  return page.evaluate((expr) => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!w) throw new Error("game_window_missing");
    return w.eval(expr);
  }, expression);
}


async function dispatchTouchAction(page, action, durationMs = 120) {
  await page.evaluate(async ({ actionName, holdMs }) => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!w) throw new Error("game_window_missing");
    const button = w.document.querySelector(`[data-action="${actionName}"]`);
    if (!button) throw new Error(`touch_button_missing:${actionName}`);
    const pointerId = actionName === "attack" ? 2 : 1;
    button.dispatchEvent(new w.PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      pointerId,
      pointerType: "touch"
    }));
    await new Promise(resolve => setTimeout(resolve, holdMs));
    button.dispatchEvent(new w.PointerEvent("pointerup", {
      bubbles: true,
      cancelable: true,
      pointerId,
      pointerType: "touch"
    }));
  }, { actionName: action, holdMs: durationMs });
}

async function dispatchGameKey(page, code, holdMs = 120) {
  await page.evaluate(async ({ keyCode, durationMs }) => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!w) throw new Error("game_window_missing");

    const eventInit = {
      bubbles: true,
      cancelable: true,
      code: keyCode,
      key: keyCode === "Space" ? " " : keyCode,
      repeat: false
    };

    w.dispatchEvent(new w.KeyboardEvent("keydown", eventInit));
    await new Promise(resolve => setTimeout(resolve, durationMs));
    w.dispatchEvent(new w.KeyboardEvent("keyup", eventInit));
  }, { keyCode: code, durationMs: holdMs });
}

async function mountDragon(page) {
  await gameEval(page, `
    enemies.length = 0;
    projectiles.length = 0;
    inventory.dragon_egg = 1;
    if (typeof updateInventoryUI === "function") updateInventoryUI();
    useInventoryItem("dragon_egg");
    true;
  `);

  await gameEval(page, `
    if (dragonList[0]) {
      player.x = dragonList[0].x + 8;
      player.y = dragonList[0].y + 8;
    }
    true;
  `);

  await page.waitForFunction(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    return Boolean(w && w.eval("!!ridingDragon && dragonList[0] && dragonList[0].rider === player"));
  });
}

async function readLastDragonFireball(page) {
  return gameEval(page, `(() => {
    const lastProjectile = Array.isArray(projectiles) && projectiles.length ? projectiles[projectiles.length - 1] : null;
    if (!lastProjectile) return null;
    return {
      name: lastProjectile.constructor ? lastProjectile.constructor.name : null,
      gravity: Number(lastProjectile.gravity) || 0,
      dropDelayFrames: Number(lastProjectile.dropDelayFrames) || 0,
      velX: Number(lastProjectile.velX) || 0,
      velY: Number(lastProjectile.velY) || 0
    };
  })()`);
}

test.describe("召唤机制与火药增强", () => {
  test("龙蛋可召唤末影龙、自动骑乘并发射火球", async ({ page }) => {
    await openGameDebug(page);

    const summonState = await gameEval(page, `
      enemies.length = 0;
      projectiles.length = 0;
      inventory.dragon_egg = 1;
      if (typeof updateInventoryUI === "function") updateInventoryUI();
      useInventoryItem("dragon_egg");
      ({
        dragonEggCount: Number(inventory.dragon_egg) || 0,
        dragonCount: Array.isArray(dragonList) ? dragonList.length : -1,
        riding: !!ridingDragon
      });
    `);

    expect(summonState.dragonEggCount).toBe(0);
    expect(summonState.dragonCount).toBe(1);

    await gameEval(page, `
      if (dragonList[0]) {
        player.x = dragonList[0].x + 8;
        player.y = dragonList[0].y + 8;
      }
      true;
    `);

    await page.waitForFunction(() => {
      const frame = document.getElementById("game");
      const w = frame && frame.contentWindow ? frame.contentWindow : null;
      return Boolean(w && w.eval("!!ridingDragon && dragonList[0] && dragonList[0].rider === player"));
    });

    const fireballState = await gameEval(page, `
      const before = projectiles.length;
      handleAttack("tap");
      ({
        before,
        after: projectiles.length,
        lastProjectile: projectiles.length ? projectiles[projectiles.length - 1].constructor.name : null
      });
    `);

    expect(fireballState.after).toBeGreaterThan(fireballState.before);
    expect(fireballState.lastProjectile).toBe("EnderDragonFireball");

    await gameEval(page, `dragonList[0].takeDamage(999); true;`);
    await page.waitForFunction(() => {
      const frame = document.getElementById("game");
      const w = frame && frame.contentWindow ? frame.contentWindow : null;
      return Boolean(w && w.eval("!ridingDragon && dismountInvincibleFrames > 0"));
    });

    const dismountState = await gameEval(page, `({ riding: !!ridingDragon, invincibleFrames: dismountInvincibleFrames })`);
    expect(dismountState.riding).toBe(false);
    expect(dismountState.invincibleFrames).toBeGreaterThan(0);
  });



  test("触屏按钮可控制骑龙移动并发射火球", async ({ page }) => {
    await openGameDebug(page);
    await mountDragon(page);

    const beforeMove = await gameEval(page, `({ x: ridingDragon.x, y: ridingDragon.y, rightPressed: !!keys.right })`);
    await dispatchTouchAction(page, "right", 240);

    await expect.poll(async () => gameEval(page, `ridingDragon.x`)).toBeGreaterThan(beforeMove.x);

    const afterMove = await gameEval(page, `({ x: ridingDragon.x, y: ridingDragon.y, rightPressed: !!keys.right })`);
    expect(afterMove.x).toBeGreaterThan(beforeMove.x);
    expect(afterMove.rightPressed).toBe(false);

    const beforeAttack = await gameEval(page, `({ projectiles: projectiles.length, cooldown: ridingDragon.fireballCooldown })`);
    await dispatchTouchAction(page, "attack", 120);

    await expect.poll(async () => gameEval(page, `({
      projectiles: projectiles.length,
      cooldown: ridingDragon.fireballCooldown,
      lastProjectile: projectiles.length ? projectiles[projectiles.length - 1].constructor.name : null
    })`)).toEqual(expect.objectContaining({
      lastProjectile: "EnderDragonFireball"
    }));

    const afterAttack = await gameEval(page, `({
      projectiles: projectiles.length,
      cooldown: ridingDragon.fireballCooldown,
      lastProjectile: projectiles.length ? projectiles[projectiles.length - 1].constructor.name : null
    })`);
    expect(afterAttack.projectiles).toBeGreaterThan(beforeAttack.projectiles);
    expect(afterAttack.cooldown).toBeGreaterThan(0);
    expect(afterAttack.cooldown).toBeLessThanOrEqual(60);
  });

  test("骑龙时触屏短按发抛物线火球，长按发水平直射火球", async ({ page }) => {
    await openGameDebug(page);
    await mountDragon(page);

    await gameEval(page, `projectiles.length = 0; ridingDragon.fireballCooldown = 0; true;`);
    await dispatchTouchAction(page, "attack", 120);
    const touchTapFireball = await readLastDragonFireball(page);
    expect(touchTapFireball).toMatchObject({
      name: "EnderDragonFireball"
    });
    expect(touchTapFireball.gravity).toBeGreaterThan(0);
    expect(touchTapFireball.dropDelayFrames).toBeGreaterThan(0);

    await gameEval(page, `projectiles.length = 0; ridingDragon.fireballCooldown = 0; true;`);
    await dispatchTouchAction(page, "attack", 900);
    const touchHoldFireball = await readLastDragonFireball(page);
    expect(touchHoldFireball).toMatchObject({
      name: "EnderDragonFireball",
      gravity: 0,
      dropDelayFrames: 0
    });
    expect(Math.abs(touchHoldFireball.velY)).toBe(0);
  });

  test("骑龙时点击跳跃按钮会立即下龙", async ({ page }) => {
    await openGameDebug(page);

    await gameEval(page, `
      enemies.length = 0;
      projectiles.length = 0;
      inventory.dragon_egg = 1;
      if (typeof updateInventoryUI === "function") updateInventoryUI();
      useInventoryItem("dragon_egg");
      true;
    `);

    await gameEval(page, `
      if (dragonList[0]) {
        player.x = dragonList[0].x + 8;
        player.y = dragonList[0].y + 8;
      }
      true;
    `);

    await page.waitForFunction(() => {
      const frame = document.getElementById("game");
      const w = frame && frame.contentWindow ? frame.contentWindow : null;
      return Boolean(w && w.eval("!!ridingDragon && dragonList[0] && dragonList[0].rider === player"));
    });

    await dispatchTouchAction(page, "jump", 120);

    await expect.poll(async () => gameEval(page, `({
      riding: !!ridingDragon,
      invincibleFrames: dismountInvincibleFrames
    })`)).toMatchObject({
      riding: false
    });

    const state = await gameEval(page, `({
      riding: !!ridingDragon,
      invincibleFrames: dismountInvincibleFrames
    })`);
    expect(state.riding).toBe(false);
    expect(state.invincibleFrames).toBeGreaterThan(0);

    const playerAfterDismountX = await gameEval(page, `player.x`);
    const separation = await gameEval(page, `(() => {
      const dragon = dragonList[0];
      if (!dragon) return 0;
      const playerRight = player.x + player.width;
      const dragonRight = dragon.x + dragon.width;
      if (playerRight < dragon.x) return dragon.x - playerRight;
      if (dragonRight < player.x) return player.x - dragonRight;
      return 0;
    })()`);
    expect(separation).toBeGreaterThan(8);

    await gameEval(page, `keys.right = true; true;`);
    await expect.poll(async () => gameEval(page, `player.x`)).toBeGreaterThan(playerAfterDismountX);
    const playerAfterMoveX = await gameEval(page, `player.x`);
    expect(playerAfterMoveX).toBeGreaterThan(playerAfterDismountX);
    await gameEval(page, `keys.right = false; true;`);
  });

  test("骑龙时上键只负责上飞，空格才负责下龙", async ({ page }) => {
    await openGameDebug(page);
    await mountDragon(page);

    const beforeFlight = await gameEval(page, `({ x: ridingDragon.x, y: ridingDragon.y, riding: !!ridingDragon })`);
    await dispatchGameKey(page, "ArrowUp", 260);

    await expect.poll(async () => gameEval(page, `({ y: ridingDragon ? ridingDragon.y : null, riding: !!ridingDragon })`)).toMatchObject({
      riding: true
    });

    const afterFlight = await gameEval(page, `({ y: ridingDragon.y, riding: !!ridingDragon })`);
    expect(afterFlight.riding).toBe(true);
    expect(afterFlight.y).toBeLessThan(beforeFlight.y);

    await dispatchGameKey(page, "Space", 120);

    await expect.poll(async () => gameEval(page, `({ riding: !!ridingDragon, invincibleFrames: dismountInvincibleFrames })`)).toMatchObject({
      riding: false
    });
  });

  test("骑龙时键盘 J 短按发抛物线火球，长按发水平直射火球", async ({ page }) => {
    await openGameDebug(page);
    await mountDragon(page);

    await gameEval(page, `projectiles.length = 0; ridingDragon.fireballCooldown = 0; true;`);
    await dispatchGameKey(page, "KeyJ", 120);
    const keyboardTapFireball = await readLastDragonFireball(page);
    expect(keyboardTapFireball).toMatchObject({
      name: "EnderDragonFireball"
    });
    expect(keyboardTapFireball.gravity).toBeGreaterThan(0);
    expect(keyboardTapFireball.dropDelayFrames).toBeGreaterThan(0);

    await gameEval(page, `projectiles.length = 0; ridingDragon.fireballCooldown = 0; true;`);
    await dispatchGameKey(page, "KeyJ", 900);
    const keyboardHoldFireball = await readLastDragonFireball(page);
    expect(keyboardHoldFireball).toMatchObject({
      name: "EnderDragonFireball",
      gravity: 0,
      dropDelayFrames: 0
    });
    expect(Math.abs(keyboardHoldFireball.velY)).toBe(0);
  });

  test("炸药爆炸后会在前方地面留下持续火焰", async ({ page }) => {
    await openGameDebug(page);

    const fireSetup = await gameEval(page, `
      enemies.length = 0;
      bombs.length = 0;
      if (typeof fireZones !== "undefined") fireZones.length = 0;
      inventory.gunpowder = 1;
      player.facingRight = true;

      const enemy = new Enemy(player.x + 260, groundY - 32, "zombie");
      enemy.x = player.x + 260;
      enemy.y = groundY - enemy.height;
      enemies.push(enemy);

      useInventoryItem("gunpowder");
      if (!bombs.length) throw new Error("bomb_not_created");
      bombs[0].x = player.x + 120;
      bombs[0].y = groundY - bombs[0].height;
      bombs[0].explode();

      ({
        fireZoneCount: typeof fireZones !== "undefined" ? fireZones.length : 0,
        firstDuration: typeof fireZones !== "undefined" && fireZones[0] ? fireZones[0].duration : 0
      });
    `);

    expect(fireSetup.fireZoneCount).toBeGreaterThan(0);

    await page.waitForFunction((initialDuration) => {
      const frame = document.getElementById("game");
      const w = frame && frame.contentWindow ? frame.contentWindow : null;
      return Boolean(
        w &&
        w.eval(`typeof fireZones !== "undefined" && fireZones.length > 0 && fireZones[0].duration < ${Number(initialDuration)}`)
      );
    }, fireSetup.firstDuration);

    const fireState = await gameEval(page, `
      ({
        duration: fireZones[0] ? fireZones[0].duration : 0,
        burnDebuffs: enemies[0] && Array.isArray(enemies[0].debuffs)
          ? enemies[0].debuffs.filter(d => d.type === "burn").length
          : 0
      });
    `);

    expect(fireState.duration).toBeLessThan(fireSetup.firstDuration);
    expect(fireState.burnDebuffs).toBeGreaterThan(0);
  });
});
