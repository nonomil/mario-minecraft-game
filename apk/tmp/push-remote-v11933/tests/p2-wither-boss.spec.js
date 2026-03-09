const { test, expect } = require("@playwright/test");

async function loginAndBoot(page, baseURL, username = "p2_wither_user") {
  await page.addInitScript(() => {
    try { localStorage.clear(); } catch {}
  });

  await page.goto(`${baseURL}/apk/Game.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.MMWG_TEST_API && window.MMWG_STORAGE));

  await page.evaluate(async (name) => {
    const state = window.MMWG_TEST_API.getState();
    if (!state.currentAccount) {
      const existing = window.MMWG_STORAGE.getAccountList().find((a) => a.username === name);
      const account = existing || window.MMWG_STORAGE.createAccount(name);
      await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    }
    if (!window.MMWG_TEST_API.getState().startedOnce) {
      window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    }
  }, username);

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true);
}

test("P2: 凋零可触发且具备新渲染能力", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "p2_wither_spawn");

  const result = await page.evaluate(() => {
    if (typeof bossArena === "undefined" || typeof bossArena.enter !== "function") return null;
    bossArena.enter("wither");
    const b = bossArena.boss;
    return {
      active: bossArena.active,
      name: b?.name || null,
      hasRenderProjectile: typeof b?.renderProjectile === "function",
      hasShockwaveField: Object.prototype.hasOwnProperty.call(b || {}, "shockwave"),
      hasPhaseInvuln: Object.prototype.hasOwnProperty.call(b || {}, "phaseInvulnerableTimer")
    };
  });

  expect(result).not.toBeNull();
  expect(result.active).toBe(true);
  expect(result.name).toContain("凋零");
  expect(result.hasRenderProjectile).toBe(true);
  expect(result.hasShockwaveField).toBe(true);
  expect(result.hasPhaseInvuln).toBe(true);
});

test("P2: 凋零阶段切换触发统一反馈", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "p2_wither_phase");

  const result = await page.evaluate(() => {
    if (typeof bossArena === "undefined" || typeof bossArena.enter !== "function") return null;
    bossArena.enter("wither");
    const b = bossArena.boss;
    if (!b) return null;

    // 推到阶段2
    b.hp = Math.floor(b.maxHp * 0.6);
    b.updatePhase();

    return {
      phase: b.phase,
      invuln: b.phaseInvulnerableTimer,
      flashTimer: bossArena.phaseFlashTimer,
      bannerText: bossArena.phaseBannerText || ""
    };
  });

  expect(result).not.toBeNull();
  expect(result.phase).toBe(2);
  expect(result.invuln).toBeGreaterThan(0);
  expect(result.flashTimer).toBeGreaterThan(0);
  expect(result.bannerText).toContain("阶段 2");
});
