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
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
  await page.waitForFunction(() => {
    try { return typeof player !== "undefined" && !!player; } catch { return false; }
  }, null, { timeout: 30_000 });
}

test("P0 trader house opens modal by short interaction from larger interior range", async ({ page }) => {
  await openGameAndBoot(page);

  const probe = await page.evaluate(() => {
    if (typeof enterVillageInterior !== "function") return { ok: false, reason: "enterVillageInterior missing" };
    if (typeof handleVillageInteriorInteraction !== "function") return { ok: false, reason: "handleVillageInteriorInteraction missing" };
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

    const entered = enterVillageInterior(village, trader);
    if (!entered) return { ok: false, reason: "enter interior failed" };

    const px = Number(player.width) || 32;
    const actionX = (typeof getInteriorActionX === "function") ? getInteriorActionX("trader_house") : (trader.x + trader.w * 0.4);
    const offsetFromCenter = 34;
    player.x = actionX - (px * 0.5) - offsetFromCenter;

    const modalBefore = document.getElementById("village-trader-modal");
    const beforeVisible = !!modalBefore && modalBefore.style.display === "flex";
    const openedByClick = handleVillageInteriorInteraction("tap");
    const modalAfter = document.getElementById("village-trader-modal");
    const afterVisible = !!modalAfter && modalAfter.style.display === "flex";

    return { ok: true, beforeVisible, openedByClick, afterVisible };
  });

  expect(probe.ok, probe.reason || "probe failed").toBeTruthy();
  expect(probe.beforeVisible).toBeFalsy();
  expect(probe.openedByClick).toBeTruthy();
  expect(probe.afterVisible).toBeTruthy();
});
