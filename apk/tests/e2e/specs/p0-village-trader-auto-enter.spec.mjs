import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_trader_auto_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pausedByModal !== "undefined") pausedByModal = false;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
  await page.waitForFunction(() => {
    try { return typeof player !== "undefined" && !!player; } catch { return false; }
  }, null, { timeout: 30_000 });
}

test("P0 trader house auto-enter opens trader modal at door range", async ({ page }) => {
  await openGameAndBoot(page);

  const probe = await page.evaluate(() => {
    if (typeof settings !== "undefined" && settings) settings.villageEnabled = true;
    if (!player) return { ok: false, reason: "player missing" };

    const targetScore = Math.max(500, Number(villageConfig?.spawnScoreInterval) || 500);
    player.x = 5200;
    score = targetScore;
    runBestScore = Math.max(Number(runBestScore) || 0, targetScore);
    currentBiome = "forest";

    if (Array.isArray(activeVillages)) activeVillages.length = 0;
    if (villageSpawnedForScore && typeof villageSpawnedForScore === "object") {
      for (const k in villageSpawnedForScore) delete villageSpawnedForScore[k];
    }

    maybeSpawnVillage(targetScore, player.x);
    const village = Array.isArray(activeVillages) ? activeVillages[0] : null;
    const trader = village?.buildings?.find((b) => b?.type === "trader_house");
    if (!village || !trader) return { ok: false, reason: "trader house missing" };

    const px = Number(player.width) || 32;
    player.x = trader.x + ((trader.w || 72) - px) * 0.5;
    cameraX = Math.max(0, player.x - (Number(cameraOffsetX) || 300));

    if (typeof updateVillages === "function") updateVillages();

    const modal = document.getElementById("village-trader-modal");
    const modalVisible = !!modal && modal.style.display === "flex";
    return { ok: true, modalVisible };
  });

  expect(probe.ok, probe.reason || "probe failed").toBeTruthy();
  expect(probe.modalVisible).toBeTruthy();
});
