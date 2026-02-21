import { expect, test } from "@playwright/test";

test("P0 vocab packs should include and switch to newly added packs", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));

  await page.goto("/Game.html");

  const username = page.locator("#username-input");
  if (await username.isVisible().catch(() => false)) {
    await username.fill("vocab_tester");
    await page.click("#btn-login");
  }

  await page.waitForSelector("#btn-settings", { timeout: 20000 });
  await page.click("#btn-settings");
  await page.waitForSelector("#opt-vocab", { timeout: 10000 });

  const optionValues = await page.locator("#opt-vocab option").evaluateAll((opts) => opts.map((o) => o.value));
  expect(optionValues).toContain("vocab.junior_high");
  expect(optionValues).toContain("vocab.kindergarten.supplement");
  expect(optionValues).toContain("vocab.elementary_lower.supplement");

  await page.selectOption("#opt-vocab", "vocab.junior_high");
  await page.waitForTimeout(500);
  await expect(page.locator("#vocab-preview")).toContainText("初中-完整");

  await page.selectOption("#opt-vocab", "vocab.kindergarten.supplement");
  await page.waitForTimeout(500);
  await expect(page.locator("#vocab-preview")).toContainText("幼儿园-补充");

  await page.selectOption("#opt-vocab", "vocab.elementary_lower.supplement");
  await page.waitForTimeout(500);
  await expect(page.locator("#vocab-preview")).toContainText("小学-补充");

  expect(errors, `page errors: ${errors.join(" | ")}`).toHaveLength(0);
});
