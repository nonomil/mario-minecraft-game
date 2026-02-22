import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_trader_fox_${Date.now()}`;
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

test("P0 trader house uses click menu (no prompt) and fox can spawn outside cherry", async ({ page }) => {
  await openGameAndBoot(page);

  const probe = await page.evaluate(() => {
    if (typeof openVillageTrader !== "function") return { ok: false, reason: "openVillageTrader missing" };
    if (typeof spawnBiomeEnemy !== "function") return { ok: false, reason: "spawnBiomeEnemy missing" };
    if (!player) return { ok: false, reason: "player missing" };

    if (!settings) return { ok: false, reason: "settings missing" };
    settings.villageEnabled = true;

    if (!villageConfig || !villageConfig.enabled) {
      villageConfig = {
        enabled: true,
        spawnScoreInterval: 500,
        villageWidth: 800,
        buildings: {
          bed_house: { w: 80, h: 60, offset: 100 },
          word_house: { w: 100, h: 80, offset: 300 },
          trader_house: { w: 72, h: 62, offset: 550 },
          special: { w: 80, h: 60, offset: 700 }
        }
      };
    }

    if (Array.isArray(activeVillages)) activeVillages.length = 0;
    const village = typeof createVillage === "function" ? createVillage(3000, "forest", 1) : null;
    if (!village) return { ok: false, reason: "createVillage failed" };
    activeVillages.push(village);

    const trader = Array.isArray(village.buildings) ? village.buildings.find((b) => b?.type === "trader_house") : null;
    if (!trader) return { ok: false, reason: "trader_house missing" };

    inventory.stick = Math.max(Number(inventory.stick) || 0, 5);
    inventory.diamond = Math.max(Number(inventory.diamond) || 0, 20);

    const originalPrompt = window.prompt;
    window.__promptCalled = false;
    window.prompt = () => {
      window.__promptCalled = true;
      return "1";
    };

    const opened = openVillageTrader(village);
    const modal = document.getElementById("village-trader-modal");
    const modalVisible = !!modal && modal.style.display === "flex";
    const hasClickMenu = !!modal?.querySelector("#trader-btn-sell") && !!modal?.querySelector("#trader-btn-armor");

    // restore prompt immediately after probing
    window.prompt = originalPrompt;

    // Fox spawn probe in non-cherry biome.
    score = 1200;
    let foxCount = 0;
    const rounds = 240;
    for (let i = 0; i < rounds; i++) {
      const e = spawnBiomeEnemy("forest", 100 + i, 200);
      if (e && e.type === "fox") foxCount++;
    }

    return {
      ok: true,
      opened,
      modalVisible,
      hasClickMenu,
      promptCalled: !!window.__promptCalled,
      foxCount
    };
  });

  expect(probe.ok, probe.reason || "probe failed").toBeTruthy();
  expect(probe.opened).toBeTruthy();
  expect(probe.modalVisible).toBeTruthy();
  expect(probe.hasClickMenu).toBeTruthy();
  expect(probe.promptCalled).toBeFalsy();
  expect(probe.foxCount).toBeGreaterThan(0);
});

