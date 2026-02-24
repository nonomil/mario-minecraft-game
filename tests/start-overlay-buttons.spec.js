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

test("start overlay uses skip + pick-account buttons (matches desktop Game.html)", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/apk/Game.html`, { waitUntil: "domcontentloaded" });

  await page.waitForFunction(() => Boolean(window.MMWG_TEST_API && window.MMWG_TEST_API.getState().bootReady === true));

  const overlay = page.locator("#screen-overlay");
  await expect(overlay).toHaveClass(/visible/);

  await expect(page.locator("#btn-overlay-skip")).toBeVisible();
  await expect(page.locator("#btn-overlay-pick-account")).toBeVisible();
  await expect(page.locator("#btn-overlay-action")).toBeHidden();
});

test("skip button boots the game loop (no account required)", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/apk/Game.html`, { waitUntil: "domcontentloaded" });

  await page.waitForFunction(() => Boolean(window.MMWG_TEST_API && window.MMWG_TEST_API.getState().bootReady === true));

  await page.locator("#btn-overlay-skip").click();

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 5_000 });
});

test("account setup page shows confirm buttons (not intro buttons)", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/apk/Game.html`, { waitUntil: "domcontentloaded" });

  await page.waitForFunction(() => Boolean(window.MMWG_TEST_API && window.MMWG_TEST_API.getState().bootReady === true));

  await page.locator("#btn-overlay-pick-account").click();

  await expect(page.locator(".overlay-page-setup")).toHaveClass(/active/);

  await expect(page.locator("#btn-overlay-skip")).toBeHidden();
  await expect(page.locator("#btn-overlay-action")).toBeVisible();
});
