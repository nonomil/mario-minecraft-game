const { test, expect } = require("@playwright/test");

async function loginAndBoot(page, baseURL, username = "debug_e2e_user") {
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

test("debug action: biome switch works", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "debug_biome");

  await page.evaluate(() => {
    // Pause update loop to avoid automatic biome recalculation overriding manual debug switch.
    if (window.MMWG_TEST_API && typeof window.MMWG_TEST_API.setState === "function") {
      window.MMWG_TEST_API.setState({ paused: true, pausedByModal: true });
    }
    const biomeId = "mountain";
    const unlockScore = Number(getBiomeSwitchConfig?.().unlockScore?.[biomeId] ?? 0);
    score = Math.max(Number(score) || 0, unlockScore);
    runBestScore = Math.max(Number(runBestScore) || 0, unlockScore);
    currentBiome = biomeId;
    if (typeof updateWeatherForBiome === "function" && typeof getBiomeById === "function") {
      updateWeatherForBiome(getBiomeById(biomeId));
    }
  });

  await expect.poll(async () => page.evaluate(() => currentBiome)).toBe("mountain");
});

test("debug action: village spawn works", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "debug_village");

  const beforeCount = await page.evaluate(() => (Array.isArray(activeVillages) ? activeVillages.length : 0));

  await page.evaluate(() => {
    if (settings) settings.villageEnabled = true;
    const interval = Number(villageConfig?.spawnScoreInterval) || 500;
    const targetScore = Math.max(Number(getProgressScore?.() || 0), interval);
    if (typeof maybeSpawnVillage === "function") {
      maybeSpawnVillage(targetScore, Number(player?.x) || 0);
    }
  });

  await expect
    .poll(async () => page.evaluate(() => (Array.isArray(activeVillages) ? activeVillages.length : 0)))
    .toBeGreaterThan(beforeCount);
});

test("debug action: boss trigger works", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "debug_boss");

  await page.evaluate(() => {
    if (bossArena && typeof bossArena.enter === "function") {
      bossArena.enter("wither");
    }
  });

  await expect
    .poll(async () =>
      page.evaluate(() => Boolean(bossArena?.active && bossArena?.boss && bossArena.boss.alive === true))
    )
    .toBe(true);
});
