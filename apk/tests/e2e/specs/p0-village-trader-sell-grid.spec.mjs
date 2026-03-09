import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_trader_grid_${Date.now()}`;
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

test("P0 trader sell materials uses multi-column grid cards", async ({ page }) => {
  await openGameAndBoot(page);

  const setup = await page.evaluate(() => {
    if (typeof openVillageTrader !== "function") return { ok: false, reason: "openVillageTrader missing" };
    if (typeof renderTraderSellMaterials !== "function") return { ok: false, reason: "renderTraderSellMaterials missing" };
    if (typeof settings !== "undefined" && settings) settings.villageEnabled = true;
    if (!player) return { ok: false, reason: "player missing" };

    inventory.iron = 12;
    inventory.gold = 8;
    inventory.coal = 15;
    inventory.arrow = 25;
    inventory.bone = 7;

    const targetScore = Math.max(500, Number(villageConfig?.spawnScoreInterval) || 500);
    player.x = 7000;
    score = targetScore;
    runBestScore = Math.max(Number(runBestScore) || 0, targetScore);
    currentBiome = "forest";

    if (Array.isArray(activeVillages)) activeVillages.length = 0;
    if (villageSpawnedForScore && typeof villageSpawnedForScore === "object") {
      for (const k in villageSpawnedForScore) delete villageSpawnedForScore[k];
    }

    maybeSpawnVillage(targetScore, player.x);
    const village = Array.isArray(activeVillages) ? activeVillages[0] : null;
    if (!village) return { ok: false, reason: "village missing" };

    openVillageTrader(village);
    const modal = document.getElementById("village-trader-modal");
    renderTraderSellMaterials(modal, village);
    return { ok: true };
  });

  expect(setup.ok, setup.reason || "setup failed").toBeTruthy();

  const list = page.locator("#trader-sell-list");
  await expect(list).toBeVisible();

  const layout = await list.evaluate((node) => {
    const style = window.getComputedStyle(node);
    return {
      display: style.display,
      gridTemplateColumns: style.gridTemplateColumns,
      childCount: node.children.length
    };
  });

  expect(layout.childCount).toBeGreaterThanOrEqual(4);
  expect(layout.display).toBe("grid");
  expect(layout.gridTemplateColumns.split(" ").length).toBeGreaterThanOrEqual(2);

  const firstButton = page.locator("#trader-sell-list .game-btn").first();
  const box = await firstButton.boundingBox();
  expect(box?.height || 0).toBeGreaterThanOrEqual(60);
});

test("P0 trader sell count actions use multi-column grid on the next page", async ({ page }) => {
  await openGameAndBoot(page);

  const setup = await page.evaluate(() => {
    if (typeof openVillageTrader !== "function") return { ok: false, reason: "openVillageTrader missing" };
    if (typeof renderTraderSellCount !== "function") return { ok: false, reason: "renderTraderSellCount missing" };
    if (typeof settings !== "undefined" && settings) settings.villageEnabled = true;
    if (!player) return { ok: false, reason: "player missing" };

    inventory.arrow = 25;

    const targetScore = Math.max(500, Number(villageConfig?.spawnScoreInterval) || 500);
    player.x = 7100;
    score = targetScore;
    runBestScore = Math.max(Number(runBestScore) || 0, targetScore);
    currentBiome = "forest";

    if (Array.isArray(activeVillages)) activeVillages.length = 0;
    if (villageSpawnedForScore && typeof villageSpawnedForScore === "object") {
      for (const k in villageSpawnedForScore) delete villageSpawnedForScore[k];
    }

    maybeSpawnVillage(targetScore, player.x);
    const village = Array.isArray(activeVillages) ? activeVillages[0] : null;
    if (!village) return { ok: false, reason: "village missing" };

    openVillageTrader(village);
    const modal = document.getElementById("village-trader-modal");
    renderTraderSellCount(modal, village, "arrow", 1, 25, "箭矢");
    return { ok: true };
  });

  expect(setup.ok, setup.reason || "setup failed").toBeTruthy();

  const grid = page.locator("#trader-sell-count-grid");
  await expect(grid).toBeVisible();

  const layout = await grid.evaluate((node) => {
    const style = window.getComputedStyle(node);
    return {
      display: style.display,
      gridTemplateColumns: style.gridTemplateColumns,
      childCount: node.children.length
    };
  });

  expect(layout.childCount).toBe(4);
  expect(layout.display).toBe("grid");
  expect(layout.gridTemplateColumns.split(" ").length).toBeGreaterThanOrEqual(2);
});

test("P0 trader short tap opens sell count page with dual-column actions", async ({ page }) => {
  await openGameAndBoot(page);

  const setup = await page.evaluate(() => {
    if (typeof openVillageTrader !== "function") return { ok: false, reason: "openVillageTrader missing" };
    if (typeof renderTraderSellMaterials !== "function") return { ok: false, reason: "renderTraderSellMaterials missing" };
    if (typeof settings !== "undefined" && settings) settings.villageEnabled = true;
    if (!player) return { ok: false, reason: "player missing" };

    inventory.arrow = 25;
    inventory.iron = 12;

    const targetScore = Math.max(500, Number(villageConfig?.spawnScoreInterval) || 500);
    player.x = 7150;
    score = targetScore;
    runBestScore = Math.max(Number(runBestScore) || 0, targetScore);
    currentBiome = "forest";

    if (Array.isArray(activeVillages)) activeVillages.length = 0;
    if (villageSpawnedForScore && typeof villageSpawnedForScore === "object") {
      for (const k in villageSpawnedForScore) delete villageSpawnedForScore[k];
    }

    maybeSpawnVillage(targetScore, player.x);
    const village = Array.isArray(activeVillages) ? activeVillages[0] : null;
    if (!village) return { ok: false, reason: "village missing" };

    openVillageTrader(village);
    const modal = document.getElementById("village-trader-modal");
    renderTraderSellMaterials(modal, village);
    return { ok: true };
  });

  expect(setup.ok, setup.reason || "setup failed").toBeTruthy();

  const firstSellButton = page.locator("#trader-sell-list .game-btn").first();
  await expect(firstSellButton).toBeVisible();
  await firstSellButton.click();

  const grid = page.locator("#trader-sell-count-grid");
  await expect(grid).toBeVisible();

  const layout = await grid.evaluate((node) => {
    const style = window.getComputedStyle(node);
    return {
      display: style.display,
      gridTemplateColumns: style.gridTemplateColumns,
      childCount: node.children.length
    };
  });

  expect(layout.childCount).toBe(4);
  expect(layout.display).toBe("grid");
  expect(layout.gridTemplateColumns.split(" ").length).toBeGreaterThanOrEqual(2);
});

test("P0 trader buy materials shows warden egg slot priced at four hundred diamonds", async ({ page }) => {
  await openGameAndBoot(page);

  const setup = await page.evaluate(() => {
    if (typeof openVillageTrader !== "function") return { ok: false, reason: "openVillageTrader missing" };
    if (typeof renderTraderBuyMaterials !== "function") return { ok: false, reason: "renderTraderBuyMaterials missing" };
    if (typeof settings !== "undefined" && settings) settings.villageEnabled = true;
    if (!player) return { ok: false, reason: "player missing" };

    inventory.diamond = 500;

    const targetScore = Math.max(500, Number(villageConfig?.spawnScoreInterval) || 500);
    player.x = 7200;
    score = targetScore;
    runBestScore = Math.max(Number(runBestScore) || 0, targetScore);
    currentBiome = "forest";

    if (Array.isArray(activeVillages)) activeVillages.length = 0;
    if (villageSpawnedForScore && typeof villageSpawnedForScore === "object") {
      for (const k in villageSpawnedForScore) delete villageSpawnedForScore[k];
    }

    maybeSpawnVillage(targetScore, player.x);
    const village = Array.isArray(activeVillages) ? activeVillages[0] : null;
    if (!village) return { ok: false, reason: "village missing" };

    openVillageTrader(village);
    const modal = document.getElementById("village-trader-modal");
    renderTraderBuyMaterials(modal, village);
    return { ok: true };
  });

  expect(setup.ok, setup.reason || "setup failed").toBeTruthy();

  const wardenItem = page.locator("#trader-buy-list .game-btn").filter({ hasText: "坚守者的蛋" });
  await expect(wardenItem).toHaveCount(1);
  await expect(wardenItem).toContainText("400");
});
