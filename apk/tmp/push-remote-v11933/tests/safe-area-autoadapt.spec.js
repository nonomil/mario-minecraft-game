const { test, expect } = require("@playwright/test");

async function loginAndBoot(page, baseURL, username = "safe_area_e2e_user") {
  page.on("pageerror", (err) => {
    // eslint-disable-next-line no-console
    console.log("[pageerror]", err && err.message ? err.message : String(err));
  });
  page.on("console", (msg) => {
    // eslint-disable-next-line no-console
    console.log(`[console.${msg.type()}]`, msg.text());
  });

  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {}
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

test("adapts to safe-area css var changes without needing resize", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Mobile Safari/537.36",
  });
  const page = await context.newPage();

  await loginAndBoot(page, baseURL, "safe_area_auto");

  const before = await page.evaluate(() => {
    const canvas = document.getElementById("gameCanvas");
    const area = getGameAreaSize();
    return {
      canvasHeight: canvas ? canvas.height : null,
      areaHeight: area ? area.height : null,
    };
  });

  expect(before.canvasHeight).not.toBeNull();
  expect(before.canvasHeight).toBe(before.areaHeight);

  await page.evaluate(() => {
    const root = document.documentElement;
    root.style.setProperty("--safe-top", "20px");
    root.style.setProperty("--safe-bottom", "48px");
  });

  const expected = await page.evaluate(() => getGameAreaSize().height);
  expect(expected).toBeLessThan(before.canvasHeight);

  await page.waitForFunction(
    (height) => {
      const canvas = document.getElementById("gameCanvas");
      return Boolean(canvas && canvas.height === height);
    },
    expected,
    { timeout: 3_000 }
  );

  await context.close();
});

