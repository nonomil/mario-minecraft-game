const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {}
  });
});

test("HUD layout matches hud-grid design (desktop preview == APK)", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/apk/Game.html`, { waitUntil: "domcontentloaded" });

  await page.waitForFunction(() => Boolean(window.MMWG_TEST_API && window.MMWG_TEST_API.getState().bootReady === true));

  await expect(page.locator("#ui-layer .hud-grid")).toBeVisible();
  await expect(page.locator("#btn-profile")).toHaveCount(1);
  await expect(page.locator("#armor-status")).toHaveCount(1);

  const pos = await page.evaluate(() => getComputedStyle(document.getElementById("word-display")).position);
  expect(pos).not.toBe("absolute");
});

