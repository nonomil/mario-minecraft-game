import { expect, test } from "@playwright/test";
import { forceBoss, openDebugPage, tickGame } from "./helpers.mjs";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_shield_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
  await page.waitForFunction(() => {
    try { return typeof player !== "undefined" && !!player; } catch { return false; }
  }, null, { timeout: 30_000 });
}

test("P1 shield should appear in the HUD badge after equipping", async ({ page }) => {
  await openGameAndBoot(page);

  const shieldState = await page.evaluate(() => {
    inventory.shield = 1;
    shieldState.equipped = false;
    shieldState.durability = 0;
    useInventoryItem("shield");
    updateArmorUI();
    return {
      badgeText: document.getElementById("armor-status")?.innerText || "",
      badgeActive: document.getElementById("armor-status")?.classList.contains("hud-box-active") || false,
      durability: Number(shieldState?.durability) || 0
    };
  });

  expect(shieldState.durability).toBeGreaterThan(0);
  expect(shieldState.badgeActive).toBe(true);
  expect(shieldState.badgeText).toContain("盾牌");
  expect(shieldState.badgeText).toMatch(/耐久|\/|%/);
});

test("P1 shield should block a normal contact hit and still lose durability", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    inventory.shield = 1;
    shieldState.equipped = false;
    shieldState.durability = 0;
    useInventoryItem("shield");

    playerHp = 10;
    playerMaxHp = 10;
    playerInvincibleTimer = 0;
    playerEquipment.armor = null;
    playerEquipment.armorDurability = 0;

    const beforeHp = playerHp;
    const beforeDurability = Number(shieldState?.durability) || 0;
    damagePlayer(1, player.x - 40, 0);

    return {
      beforeHp,
      afterHp: playerHp,
      beforeDurability,
      afterDurability: Number(shieldState?.durability) || 0
    };
  });

  expect(result.afterHp).toBe(result.beforeHp);
  expect(result.afterDurability).toBeLessThan(result.beforeDurability);
});

test("P1 evoker should be clamped back inside the boss arena when pushed outside", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "evoker");

  const before = await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!w || typeof w.eval !== "function") return null;
    w.eval(`
      if (typeof bossArena !== "undefined" && bossArena && bossArena.boss) {
        bossArena.boss.x = bossArena.rightWall + 160;
        bossArena.boss.state = "reposition";
        bossArena.boss.repositionTimer = 10;
      }
    `);
    return {
      bossX: Number(w.eval('bossArena && bossArena.boss ? bossArena.boss.x : 0')) || 0,
      rightWall: Number(w.eval('bossArena ? bossArena.rightWall : 0')) || 0,
      bossWidth: Number(w.eval('bossArena && bossArena.boss ? bossArena.boss.width : 0')) || 0
    };
  });

  expect(before).not.toBeNull();
  expect(before.bossX).toBeGreaterThan(before.rightWall);

  await tickGame(page, 6);

  await expect.poll(async () => {
    const data = await page.evaluate(() => {
      const frame = document.getElementById("game");
      const w = frame && frame.contentWindow ? frame.contentWindow : null;
      if (!w || typeof w.eval !== "function") return null;
      return {
        bossX: Number(w.eval('bossArena && bossArena.boss ? bossArena.boss.x : 0')) || 0,
        rightWall: Number(w.eval('bossArena ? bossArena.rightWall : 0')) || 0,
        bossWidth: Number(w.eval('bossArena && bossArena.boss ? bossArena.boss.width : 0')) || 0,
        bossAlive: Boolean(w.eval('bossArena && bossArena.boss ? bossArena.boss.alive : false'))
      };
    });
    if (!data || !data.bossAlive) return false;
    return data.bossX + data.bossWidth <= data.rightWall;
  }, { timeout: 3000 }).toBe(true);
});
