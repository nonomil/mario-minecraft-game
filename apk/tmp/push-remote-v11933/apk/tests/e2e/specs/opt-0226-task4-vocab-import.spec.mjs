import { test, expect } from "@playwright/test";

test("task4: parse custom vocab text", async ({ page }) => {
  await page.goto("/Game.html");
  const words = await page.evaluate(() =>
    window.parseCustomVocab("apple,苹果\nbanana,香蕉\n")
  );
  expect(words.length).toBe(2);
  expect(words[0].en).toBe("apple");
});

test("task4: register custom pack", async ({ page }) => {
  await page.goto("/Game.html");
  const found = await page.evaluate(() => {
    window.registerCustomVocab("My Pack", [{ en: "cat", zh: "猫" }]);
    const packs = window.getVocabPackList();
    return packs.some((p) => p.name === "My Pack");
  });
  expect(found).toBe(true);
});
