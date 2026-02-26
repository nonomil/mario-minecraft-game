import { test, expect } from "@playwright/test";

test("task5: weak words sorted by error rate", async ({ page }) => {
  await page.goto("/Game.html");
  const weak = await page.evaluate(() =>
    window.getWeakWords({
      apple: { correct: 1, wrong: 3 },
      cat: { correct: 5, wrong: 0 },
      dog: { correct: 0, wrong: 2 }
    }, 5)
  );
  expect(weak[0].word).toBe("apple");
  expect(weak.some((w) => w.word === "cat")).toBe(false);
});
