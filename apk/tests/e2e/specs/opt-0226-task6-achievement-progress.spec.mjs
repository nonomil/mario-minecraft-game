import { test, expect } from "@playwright/test";

test("task6: getAchievementProgress returns shape", async ({ page }) => {
  await page.goto("/Game.html");
  const progress = await page.evaluate(() => {
    return window.getAchievementProgress("words_100", { words_100: 45 });
  });
  expect(progress).not.toBeNull();
  expect(progress.target).toBe(100);
  expect(typeof progress.percent).toBe("number");
});
