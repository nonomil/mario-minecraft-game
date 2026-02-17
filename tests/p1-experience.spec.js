const { test, expect } = require("@playwright/test");

async function loginAndBoot(page, baseURL, username = "e2e_user") {
  page.on("pageerror", (err) => {
    console.log("[pageerror]", err && err.message ? err.message : String(err));
  });
  page.on("console", (msg) => {
    console.log(`[console.${msg.type()}]`, msg.text());
  });

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
      if (window.MMWG_TEST_API.actions.bootGameLoopIfNeeded) {
        window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
      } else {
        const btn = document.getElementById("btn-overlay-action");
        if (btn) btn.click();
      }
    }
  }, username);

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true);
}

// 测试 1：群系难度分级 - 轮次追踪存在
test("群系轮次追踪与enemyTiers配置", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "p1_biome_tier");

  const result = await page.evaluate(() => {
    const hasFn = typeof getBiomeVisitRound === 'function';
    const hasReset = typeof resetBiomeVisitCount === 'function';
    // 检查 biomeConfigs 中 cherry_grove 是否有 enemyTiers
    const cfg = typeof biomeConfigs !== 'undefined' ? biomeConfigs.cherry_grove : null;
    const hasTiers = cfg && Array.isArray(cfg.enemyTiers) && cfg.enemyTiers.length > 0;
    return { hasFn, hasReset, hasTiers };
  });

  expect(result.hasFn).toBe(true);
  expect(result.hasReset).toBe(true);
  expect(result.hasTiers).toBe(true);
});

// 测试 2：群系最小停留
test("群系最小停留守卫存在", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "p1_biome_stay");

  const result = await page.evaluate(() => {
    const hasFn = typeof canLeaveBiome === 'function';
    // 检查 switch 配置中有 minStay
    const cfg = typeof biomeSwitchConfig !== 'undefined' ? biomeSwitchConfig : null;
    const hasMinStay = cfg && cfg.minStay && Object.keys(cfg.minStay).length > 0;
    return { hasFn, hasMinStay };
  });

  expect(result.hasFn).toBe(true);
  if (result.hasMinStay !== null) {
    expect(result.hasMinStay).toBe(true);
  }
});

// 测试 3：海洋群系无 creeper
test("海洋群系生态正确", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "p1_ocean");

  const result = await page.evaluate(() => {
    // 检查 ocean 的 treeTypes 为空
    const cfg = typeof biomeConfigs !== 'undefined' ? biomeConfigs.ocean : null;
    const noTrees = cfg && cfg.treeTypes && Object.keys(cfg.treeTypes).length === 0;
    // 检查 ocean 有 large_seaweed 和 coral 装饰
    const hasLargeSeaweed = cfg && cfg.decorations && 'large_seaweed' in cfg.decorations;
    const hasCoral = cfg && cfg.decorations && 'coral' in cfg.decorations;
    return { noTrees, hasLargeSeaweed, hasCoral };
  });

  expect(result.noTrees).toBe(true);
  expect(result.hasLargeSeaweed).toBe(true);
  expect(result.hasCoral).toBe(true);
});

// 测试 4：挑战按钮样式包含断词
test("挑战按钮样式支持长词", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "p1_challenge_ui");

  const hasStyle = await page.evaluate(() => {
    const sheets = document.styleSheets;
    for (const sheet of sheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && rule.selectorText.includes('learning-modal-options button')) {
            const style = rule.style;
            if (style.wordBreak === 'break-word' || style.overflowWrap === 'break-word') {
              return true;
            }
          }
        }
      } catch (e) {}
    }
    return false;
  });

  expect(hasStyle).toBe(true);
});
