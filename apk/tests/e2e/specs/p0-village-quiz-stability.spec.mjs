import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_village_quiz_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pausedByModal !== "undefined") pausedByModal = false;
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

async function spawnVillageAndStandAtWordHouse(page) {
  return page.evaluate(() => {
    if (typeof settings !== "undefined" && settings) settings.villageEnabled = true;
    const targetScore = Math.max(500, Number(villageConfig?.spawnScoreInterval) || 500);

    if (!player) return { ok: false, reason: "player missing" };

    player.x = 4200;
    score = targetScore;
    runBestScore = Math.max(Number(runBestScore) || 0, targetScore);
    currentBiome = "forest";

    if (Array.isArray(activeVillages)) activeVillages.length = 0;
    if (villageSpawnedForScore && typeof villageSpawnedForScore === "object") {
      for (const k in villageSpawnedForScore) delete villageSpawnedForScore[k];
    }

    if (typeof maybeSpawnVillage !== "function") return { ok: false, reason: "maybeSpawnVillage missing" };
    maybeSpawnVillage(targetScore, player.x);

    const village = Array.isArray(activeVillages) ? activeVillages[0] : null;
    if (!village) return { ok: false, reason: "village missing" };

    const wordHouse = Array.isArray(village.buildings)
      ? village.buildings.find((b) => b && b.type === "word_house")
      : null;
    if (!wordHouse) return { ok: false, reason: "word_house missing" };

    const px = Number(player.width) || 32;
    player.x = wordHouse.x + ((wordHouse.w || 100) - px) * 0.5;
    cameraX = Math.max(0, player.x - (Number(cameraOffsetX) || 300));

    if (typeof updateVillages === "function") updateVillages();

    return {
      ok: true,
      villageX: village.x,
      wordHouseX: wordHouse.x,
      playerX: player.x,
      cameraX
    };
  });
}

test("P0 village quiz should not render undefined and should recover from exit", async ({ page }) => {
  await openGameAndBoot(page);
  const setup = await spawnVillageAndStandAtWordHouse(page);
  expect(setup.ok, setup.reason || "spawnVillageAndStandAtWordHouse failed").toBeTruthy();

  await page.evaluate(() => {
    const village = Array.isArray(activeVillages) ? activeVillages[0] : null;
    if (!village) return;
    village.questCompleted = false;
    if (typeof startVillageChallenge === "function") {
      startVillageChallenge(village, () => {});
    }
  });

  await page.locator("#village-challenge-modal").waitFor({ state: "visible", timeout: 10_000 });
  await page.locator("#btn-village-challenge-start").click();

  const questionExitBtn = page.locator("#btn-village-challenge-exit");
  await questionExitBtn.waitFor({ state: "visible", timeout: 10_000 });

  const challengeText = await page.locator("#village-challenge-modal").innerText();
  expect(challengeText.toLowerCase()).not.toContain("undefined");

  const optionTexts = await page.locator("#village-challenge-modal .village-opt-btn").allTextContents();
  expect(optionTexts.length).toBeGreaterThanOrEqual(4);
  for (const t of optionTexts) {
    expect(String(t).toLowerCase()).not.toContain("undefined");
  }

  await questionExitBtn.click();
  await page.locator("#village-challenge-modal").waitFor({ state: "hidden", timeout: 10_000 });

  const resume = await page.evaluate(async () => {
    const before = Number(gameFrame) || 0;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const after = Number(gameFrame) || 0;
    return {
      paused: !!paused,
      pausedByModal: !!pausedByModal,
      frameDelta: after - before
    };
  });

  expect(resume.paused).toBeFalsy();
  expect(resume.pausedByModal).toBeFalsy();
  expect(resume.frameDelta).toBeGreaterThan(10);
});
