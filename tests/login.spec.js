const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
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
});

test("login connect button works (local-only)", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/apk/Game.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() =>
    Boolean(window.MMWG_TEST_API && window.MMWG_STORAGE && window.MMWG_TEST_API.getState().bootReady === true)
  );

  await page.evaluate(async () => {
    const existing = window.MMWG_STORAGE.getAccountList().find((a) => a.username === "test_user");
    const account = existing || window.MMWG_STORAGE.createAccount("test_user");
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
  });

  await page.waitForFunction(() => {
    const state = window.MMWG_TEST_API.getState();
    return Boolean(state.currentAccount && state.currentAccount.id);
  });

  const saved = await page.evaluate(() => {
    const id = window.MMWG_STORAGE.getCurrentAccountId();
    const accounts = window.MMWG_STORAGE.getAccountList();
    return {
      hasId: !!id,
      accountCount: accounts.length,
      hasUser: accounts.some((a) => a.username === "test_user"),
    };
  });

  expect(saved.hasId).toBe(true);
  expect(saved.accountCount).toBeGreaterThan(0);
  expect(saved.hasUser).toBe(true);
});
