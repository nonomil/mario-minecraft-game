const { test, expect } = require("@playwright/test");

async function loginAndBoot(page, baseURL, username = "village_e2e_user") {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {}
  });

  await page.goto(`${baseURL}/apk/Game.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() =>
    Boolean(window.MMWG_TEST_API && window.MMWG_STORAGE && window.MMWG_TEST_API.getState().bootReady === true)
  );

  await page.evaluate(async (name) => {
    const existing = window.MMWG_STORAGE.getAccountList().find((a) => a.username === name);
    const account = existing || window.MMWG_STORAGE.createAccount(name);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    if (!window.MMWG_TEST_API.getState().startedOnce) {
      window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    }
  }, username);

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true);
}

test("village save stone: persists checkpoint", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "village_save_stone");

  const result = await page.evaluate(() => {
    if (settings) settings.villageEnabled = true;
    const interval = Number(villageConfig?.spawnScoreInterval) || 500;
    maybeSpawnVillage(interval, Number(player?.x) || 0);
    const village = activeVillages[activeVillages.length - 1];
    const stone = village?.buildings?.find((b) => b.type === "save_stone");
    if (!village || !stone) return { ok: false };

    player.x = stone.x + stone.w / 2 - player.width / 2;
    const before = localStorage.getItem("mmwg:villageCheckpoint");
    handleVillageInteraction(stone, village);
    const after = localStorage.getItem("mmwg:villageCheckpoint");
    return {
      ok: true,
      saved: !!village.saved,
      hasCheckpoint: !!after,
      changed: before !== after
    };
  });

  expect(result.ok).toBe(true);
  expect(result.saved).toBe(true);
  expect(result.hasCheckpoint).toBe(true);
  expect(result.changed).toBe(true);
});

test("village special building: one-time use", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "village_special_building");

  const result = await page.evaluate(() => {
    if (settings) settings.villageEnabled = true;
    const interval = Number(villageConfig?.spawnScoreInterval) || 500;
    maybeSpawnVillage(interval, Number(player?.x) || 0);
    const village = activeVillages[activeVillages.length - 1];
    const special = village?.buildings?.find((b) => b.type === village?.style?.specialBuilding);
    if (!village || !special) return { ok: false };

    player.x = special.x + special.w / 2 - player.width / 2;
    const scoreBefore = Number(score) || 0;
    village._lastInteractAt = 0;
    handleVillageInteraction(special, village);
    const scoreAfterFirst = Number(score) || 0;
    village._lastInteractAt = 0;
    handleVillageInteraction(special, village);
    const scoreAfterSecond = Number(score) || 0;

    return {
      ok: true,
      specialUsed: !!village.specialUsed,
      scoreBefore,
      scoreAfterFirst,
      scoreAfterSecond
    };
  });

  expect(result.ok).toBe(true);
  expect(result.specialUsed).toBe(true);
  expect(result.scoreAfterFirst).toBeGreaterThanOrEqual(result.scoreBefore);
  expect(result.scoreAfterSecond).toBe(result.scoreAfterFirst);
});
