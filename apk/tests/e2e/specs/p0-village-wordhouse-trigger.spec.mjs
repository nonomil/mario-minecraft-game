import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_wh_trigger_${Date.now()}`;
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

test("P0 word house challenge can start by single interaction near action point", async ({ page }) => {
  await openGameAndBoot(page);

  const setup = await page.evaluate(() => {
    if (typeof settings !== "undefined" && settings) settings.villageEnabled = true;
    if (!player) return { ok: false, reason: "player missing" };

    const targetScore = Math.max(500, Number(villageConfig?.spawnScoreInterval) || 500);
    player.x = 4200;
    score = targetScore;
    runBestScore = Math.max(Number(runBestScore) || 0, targetScore);
    currentBiome = "forest";

    if (Array.isArray(activeVillages)) activeVillages.length = 0;
    if (villageSpawnedForScore && typeof villageSpawnedForScore === "object") {
      for (const k in villageSpawnedForScore) delete villageSpawnedForScore[k];
    }

    maybeSpawnVillage(targetScore, player.x);
    const village = Array.isArray(activeVillages) ? activeVillages[0] : null;
    const wh = village?.buildings?.find((b) => b?.type === "word_house");
    if (!village || !wh) return { ok: false, reason: "word house missing" };

    const entered = enterVillageInterior(village, wh);
    if (!entered) return { ok: false, reason: "enter interior failed" };

    const actionX = (typeof getInteriorActionX === "function") ? getInteriorActionX("word_house") : (wh.x + wh.w * 0.3);
    player.x = actionX - ((Number(player.width) || 32) * 0.5);
    if (typeof handleVillageInteriorInteraction === "function") handleVillageInteriorInteraction();

    return { ok: true };
  });

  expect(setup.ok, setup.reason || "setup failed").toBeTruthy();

  const modal = page.locator("#village-challenge-modal");
  await expect(modal).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("#btn-village-challenge-start")).toBeVisible();
});
