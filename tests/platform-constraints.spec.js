const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {}
  });
});

test("floating/micro/cloud platforms obey height and stack limits", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/apk/Game.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.MMWG_TEST_API && window.MMWG_TEST_API.getState().bootReady === true));

  await page.waitForTimeout(1000);

  const result = await page.evaluate(() => window.__MMWG_TEST_HOOKS__?.getPlatformStats?.());
  expect(result).toBeTruthy();
  expect(result.maxFloatingHeightRatio).toBeLessThanOrEqual(0.5);
  expect(result.maxMicroStackHeight).toBeLessThanOrEqual(2);
  expect(result.maxCloudStackHeight).toBeLessThanOrEqual(2);
});
