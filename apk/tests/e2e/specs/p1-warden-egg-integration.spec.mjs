import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_warden_egg_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
  await page.waitForFunction(() => {
    try {
      return typeof player !== "undefined" && !!player;
    } catch {
      return false;
    }
  }, null, { timeout: 30_000 });
}

test("P1 warden egg is present in runtime legendary chest pool", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    if (typeof getLootConfig !== "function") return { ok: false, reason: "getLootConfig missing" };
    const entries = getLootConfig().chestTables?.legendary || [];
    const entry = entries.find((item) => item && item.item === "warden_egg");
    return {
      ok: true,
      hasEntry: !!entry,
      weight: entry?.weight || 0
    };
  });

  expect(result.ok, result.reason || "setup failed").toBeTruthy();
  expect(result.hasEntry).toBeTruthy();
  expect(result.weight).toBeGreaterThan(0);
});

test("P1 warden egg summons a friendly warden companion and consumes inventory", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    golems.length = 0;
    enemies.length = 0;
    inventory.warden_egg = 1;
    if (typeof updateInventoryUI === "function") updateInventoryUI();
    useInventoryItem("warden_egg");
    const spawned = golems.find((golem) => golem && !golem.remove && golem.type === "warden");
    return {
      wardenEggCount: Number(inventory.warden_egg) || 0,
      spawnedType: spawned?.type || "",
      spawnDistance: spawned ? Math.abs(spawned.x - player.x) : -1
    };
  });

  expect(result.wardenEggCount).toBe(0);
  expect(result.spawnedType).toBe("warden");
  expect(result.spawnDistance).toBeGreaterThanOrEqual(180);
});

test("P1 warden egg can still be used while riding a summoned dragon", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    golems.length = 0;
    enemies.length = 0;
    projectiles.length = 0;
    dragonList.length = 0;
    inventory.dragon_egg = 1;
    inventory.warden_egg = 1;
    if (typeof updateInventoryUI === "function") updateInventoryUI();

    useInventoryItem("dragon_egg");
    const dragon = Array.isArray(dragonList) ? dragonList[0] : null;
    if (dragon) {
      player.x = dragon.x + 8;
      player.y = dragon.y + 8;
      ridingDragon = dragon;
      dragon.rider = player;
    }

    useInventoryItem("warden_egg");
    const spawned = golems.find((golem) => golem && !golem.remove && golem.type === "warden");
    return {
      riding: !!ridingDragon,
      dragonEggCount: Number(inventory.dragon_egg) || 0,
      wardenEggCount: Number(inventory.warden_egg) || 0,
      dragonCount: Array.isArray(dragonList) ? dragonList.length : 0,
      wardenCount: golems.filter((golem) => golem && !golem.remove && golem.type === "warden").length,
      spawnedType: spawned?.type || ""
    };
  });

  expect(result.riding).toBeTruthy();
  expect(result.dragonEggCount).toBe(0);
  expect(result.wardenEggCount).toBe(0);
  expect(result.dragonCount).toBe(1);
  expect(result.wardenCount).toBe(1);
  expect(result.spawnedType).toBe("warden");
});
