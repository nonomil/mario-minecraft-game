import { test, expect } from "@playwright/test";

test("task2: review screen can render", async ({ page }) => {
  await page.goto("/Game.html");
  await page.evaluate(() => {
    window.showGameReview([
      { word: "apple", zh: "苹果", correct: true },
      { word: "banana", zh: "香蕉", correct: false }
    ]);
  });
  await expect(page.locator("#review-screen")).toBeVisible();
  await expect(page.locator("#review-word-list")).toContainText("apple");
  await expect(page.locator("#review-word-list")).toContainText("banana");
});
