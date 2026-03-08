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
