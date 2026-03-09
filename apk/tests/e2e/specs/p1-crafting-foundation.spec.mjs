import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_crafting_${Date.now()}`;
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

test("P1 crafting modal supports multi-select recipes for shield and torch", async ({ page }) => {
  await openGameAndBoot(page);

  await page.evaluate(() => {
    inventory.stick = 3;
    inventory.iron = 1;
    inventory.gunpowder = 1;
    if (typeof updateInventoryUI === "function") updateInventoryUI();
  });

  await page.click("#btn-crafting", { force: true });
  await expect(page.locator("#crafting-modal")).toHaveClass(/visible/);
  await expect(page.locator('[data-action="craft"]')).toHaveCount(1);

  const stickCard = page.locator('#crafting-material-list .inventory-item[data-item="stick"]');
  const ironCard = page.locator('#crafting-material-list .inventory-item[data-item="iron"]');
  const gunpowderCard = page.locator('#crafting-material-list .inventory-item[data-item="gunpowder"]');

  await stickCard.click({ force: true });
  await stickCard.click({ force: true });
  await ironCard.click({ force: true });

  await expect(page.locator("#crafting-selection-summary")).toContainText("木棍 x2");
  await expect(page.locator("#crafting-selection-summary")).toContainText("铁块 x1");
  await expect(page.locator("#crafting-preview")).toContainText("盾牌");

  await page.click("#btn-crafting-confirm", { force: true });

  const shieldResult = await page.evaluate(() => ({
    shieldCount: Number(inventory.shield) || 0,
    shieldEquipped: !!(shieldState && shieldState.equipped),
    shieldDurability: Number(shieldState?.durability) || 0,
    stickCount: Number(inventory.stick) || 0,
    ironCount: Number(inventory.iron) || 0
  }));

  expect(shieldResult.shieldCount).toBe(1);
  expect(shieldResult.shieldEquipped).toBe(true);
  expect(shieldResult.shieldDurability).toBeGreaterThan(0);
  expect(shieldResult.stickCount).toBe(1);
  expect(shieldResult.ironCount).toBe(0);

  await stickCard.click({ force: true });
  await gunpowderCard.click({ force: true });

  await expect(page.locator("#crafting-preview")).toContainText("火炬");
  await page.click("#btn-crafting-confirm", { force: true });

  const torchResult = await page.evaluate(() => ({
    torchCount: Number(inventory.torch) || 0,
    stickCount: Number(inventory.stick) || 0,
    gunpowderCount: Number(inventory.gunpowder) || 0
  }));

  expect(torchResult.torchCount).toBe(1);
  expect(torchResult.stickCount).toBe(0);
  expect(torchResult.gunpowderCount).toBe(0);
});

test("P1 shield reduces damage and loses durability when hit", async ({ page }) => {
  await openGameAndBoot(page);

  const state = await page.evaluate(() => {
    if (typeof inventory !== "undefined") inventory.shield = 1;
    if (typeof useInventoryItem === "function") useInventoryItem("shield");

    playerHp = 10;
    playerMaxHp = 10;
    score = 999;
    playerInvincibleTimer = 0;
    playerEquipment.armor = null;
    playerEquipment.armorDurability = 0;
    const beforeDurability = Number(shieldState?.durability) || 0;

    damagePlayer(10, player.x - 50, 0);

    return {
      hpAfterHit: playerHp,
      shieldCount: Number(inventory.shield) || 0,
      durabilityBefore: beforeDurability,
      durabilityAfter: Number(shieldState?.durability) || 0
    };
  });

  expect(state.hpAfterHit).toBeGreaterThan(0);
  expect(state.durabilityBefore).toBeGreaterThan(state.durabilityAfter);
  expect(state.shieldCount).toBe(1);
});
