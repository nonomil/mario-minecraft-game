import { test, expect } from "@playwright/test";

test("Pinyin quiz shows pinyin label", async ({ page }) => {
  await page.goto("/Game.html");
  await page.waitForLoadState("networkidle");

  await page.evaluate(() => {
    localStorage.setItem("mmwg:settings", JSON.stringify({ languageMode: "pinyin" }));
  });
  await page.reload();
  await page.waitForLoadState("networkidle");

  await page.waitForSelector("#challenge-modal", { state: "attached" });

  await page.evaluate(() => {
    const word = { english: "water", chinese: "水", pinyin: "shuǐ", word: "shuǐ" };
    if (typeof startLearningChallenge === "function") {
      startLearningChallenge(word, "translate", "e2e");
    }
  });

  await expect(page.locator("#challenge-modal")).toHaveClass(/visible/);
  const title = page.locator("#challenge-title");
  await expect(title).toContainText("拼音");
});
