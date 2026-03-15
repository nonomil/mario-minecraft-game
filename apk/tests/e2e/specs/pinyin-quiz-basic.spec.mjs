import { test, expect } from "@playwright/test";

test("Pinyin quiz shows pinyin label and prompt", async ({ page }) => {
  await page.goto("/Game.html");
  await page.waitForLoadState("networkidle");

  await page.evaluate(() => {
    localStorage.setItem("mmwg:settings", JSON.stringify({ languageMode: "pinyin" }));
  });
  await page.reload();
  await page.waitForLoadState("networkidle");

  await page.waitForSelector("#challenge-modal", { state: "attached" });

  await page.evaluate(() => {
    window.wordDatabase = [
      { en: "water", zh: "水", pinyin: "shuǐ" },
      { en: "fire", zh: "火", pinyin: "huǒ" },
      { en: "earth", zh: "土", pinyin: "tǔ" },
      { en: "wood", zh: "木", pinyin: "mù" }
    ];
    const word = window.wordDatabase[0];
    if (typeof startLearningChallenge === "function") {
      startLearningChallenge(word, "translate", "e2e");
    }
  });

  await expect(page.locator("#challenge-modal")).toHaveClass(/visible/);
  const title = page.locator("#challenge-title");
  await expect(title).toContainText("拼音");
  await expect(page.locator("#challenge-question")).toContainText("请选择合适的拼音");
  await expect(page.locator("#challenge-options")).toContainText("shuǐ");
});
