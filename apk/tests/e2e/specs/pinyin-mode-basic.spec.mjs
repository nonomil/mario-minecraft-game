import { test, expect } from "@playwright/test";

test("Pinyin mode appears in overlay and persists", async ({ page }) => {
  await page.goto("/Game.html");
  await page.waitForLoadState("networkidle");

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState("networkidle");

  const pinyinBtn = page.locator("#btn-overlay-language-pinyin");
  await expect(pinyinBtn).toBeVisible();
  await pinyinBtn.click();

  const current = page.locator("#overlay-language-current");
  await expect(current).toContainText("幼小衔接");

  const settings = await page.evaluate(() => JSON.parse(localStorage.getItem("mmwg:settings")));
  expect(settings.languageMode).toBe("pinyin");
});
