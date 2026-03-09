const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {}
  });
});

test("HUD + touch control sizes match v1.18.42 baseline", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/apk/Game.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.MMWG_TEST_API && window.MMWG_TEST_API.getState().bootReady === true));

  await page.waitForSelector(".hud-box");
  await page.waitForSelector(".touch-btn");
  await page.waitForSelector(".word-display-title");

  const hudFont = await page.$eval(".hud-box", el => getComputedStyle(el).fontSize);
  const wordFont = await page.$eval(".word-display-title", el => getComputedStyle(el).fontSize);
  const wordSubFont = await page.$eval(".word-display-sub", el => getComputedStyle(el).fontSize);
  const touchSize = await page.$eval(".touch-btn", el => getComputedStyle(el).width);
  const touchFont = await page.$eval(".touch-btn", el => getComputedStyle(el).fontSize);

  expect(hudFont).toBe("18px");
  expect(wordFont).toBe("24px");
  expect(wordSubFont).toBe("16px");
  expect(touchSize).toBe("96px");
  expect(touchFont).toBe("30px");
});
