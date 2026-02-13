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

  const loginScreen = page.locator("#login-screen");
  await expect(loginScreen).toBeVisible();

  await page.fill("#username-input", "test_user");
  await page.click("#btn-login");

  await expect(loginScreen).not.toBeVisible();

  const current = await page.evaluate(() => localStorage.getItem("mmwg_current_account"));
  expect(current).toBeTruthy();

  const accountsRaw = await page.evaluate(() => localStorage.getItem("mmwg_accounts"));
  expect(accountsRaw).toBeTruthy();
});
