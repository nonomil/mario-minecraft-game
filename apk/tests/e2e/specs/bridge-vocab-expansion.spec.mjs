import { expect, test } from "@playwright/test";

test("Bridge vocab packs should be expanded", async ({ page }) => {
  await page.goto("/Game.html");
  await page.waitForFunction(() => typeof setActiveVocabPack === "function");
  await page.evaluate(async () => {
    await setActiveVocabPack("vocab.bridge.full");
  });

  const counts = await page.evaluate(() => ({
    language: (typeof BRIDGE_VOCAB_LANGUAGE !== "undefined" && Array.isArray(BRIDGE_VOCAB_LANGUAGE))
      ? BRIDGE_VOCAB_LANGUAGE.length
      : 0,
    math: (typeof BRIDGE_VOCAB_MATH !== "undefined" && Array.isArray(BRIDGE_VOCAB_MATH))
      ? BRIDGE_VOCAB_MATH.length
      : 0,
    english: (typeof BRIDGE_VOCAB_ENGLISH !== "undefined" && Array.isArray(BRIDGE_VOCAB_ENGLISH))
      ? BRIDGE_VOCAB_ENGLISH.length
      : 0,
    full: (typeof BRIDGE_VOCAB_FULL !== "undefined" && Array.isArray(BRIDGE_VOCAB_FULL))
      ? BRIDGE_VOCAB_FULL.length
      : 0
  }));

  expect(counts.language).toBeGreaterThanOrEqual(260);
  expect(counts.math).toBeGreaterThanOrEqual(1200);
  expect(counts.english).toBeGreaterThanOrEqual(1400);
  expect(counts.full).toBeGreaterThanOrEqual(3000);
});
