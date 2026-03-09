import { test, expect } from "@playwright/test";

test("task3: attack button has larger touch size", async ({ page }) => {
  await page.goto("/Game.html");
  await page.setViewportSize({ width: 390, height: 844 });
  const box = await page.locator("#btn-attack").boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(60);
  expect(box.height).toBeGreaterThanOrEqual(60);
});

test("task3: input lock state can be toggled", async ({ page }) => {
  await page.goto("/Game.html");
  const locked = await page.evaluate(() => {
    window.setInputLocked(true);
    return window._inputLocked;
  });
  expect(locked).toBe(true);
});
