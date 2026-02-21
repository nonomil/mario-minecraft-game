import { expect, test } from "@playwright/test";

async function boot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_quiz10_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    paused = false;
    pausedByModal = false;
    if (typeof setOverlay === "function") setOverlay(false);
  });
}

test("P1 village quiz is 10 EN->ZH questions and grants +1 diamond per correct", async ({ page }) => {
  await boot(page);

  const baseline = await page.evaluate(() => {
    settings.villageEnabled = true;
    const targetScore = Math.max(500, Number(villageConfig?.spawnScoreInterval) || 500);
    player.x = 6200;
    score = targetScore;
    currentBiome = "forest";

    activeVillages.length = 0;
    for (const k in villageSpawnedForScore) delete villageSpawnedForScore[k];
    maybeSpawnVillage(targetScore, player.x);

    const village = activeVillages[0];
    const wh = village?.buildings?.find((b) => b?.type === "word_house");
    if (!village || !wh) return { ok: false, reason: "word house missing" };

    inventory.diamond = Number(inventory.diamond) || 0;
    village.questCompleted = false;
    startVillageChallenge(village, () => {});
    return { ok: true, diamondsBefore: inventory.diamond };
  });

  expect(baseline.ok, baseline.reason || "setup failed").toBeTruthy();

  await page.locator("#btn-village-challenge-start").click();

  for (let i = 0; i < 10; i++) {
    const progress = page.locator(".village-question-progress");
    await expect(progress).toContainText(`第 ${i + 1} / 10 题`, { timeout: 10_000 });

    const word = page.locator(".village-question-word");
    await expect(word).toBeVisible();

    const correctBtn = page.locator('.village-opt-btn[data-correct="1"]');
    await expect(correctBtn).toBeVisible();
    await correctBtn.click();
  }

  await expect(page.locator("#btn-village-challenge-done")).toBeVisible({ timeout: 10_000 });
  const diamondsAfter = await page.evaluate(() => Number(inventory?.diamond) || 0);
  expect(diamondsAfter - baseline.diamondsBefore).toBe(10);
});
