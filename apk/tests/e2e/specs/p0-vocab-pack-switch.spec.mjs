import { expect, test } from "@playwright/test";

test("P0 vocab packs should include and switch to newly added packs", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));

  await page.goto("/Game.html");

  const username = page.locator("#username-input");
  if (await username.isVisible().catch(() => false)) {
    await username.fill("vocab_tester");
    await username.press("Enter");
    await page.waitForTimeout(300);
    const loginBtn = page.locator("#btn-login");
    if (await loginBtn.isVisible().catch(() => false)) {
      await loginBtn.click({ force: true }).catch(() => {});
    }
  }

  await page.waitForSelector("#btn-settings", { timeout: 20000 });
  await page.click("#btn-settings");
  await page.waitForSelector("#opt-vocab", { timeout: 10000 });

  const optionValues = await page.locator("#opt-vocab option").evaluateAll((opts) => opts.map((o) => o.value));
  expect(optionValues).toContain("vocab.junior_high");
  expect(optionValues).toContain("vocab.junior_high.basic");
  expect(optionValues).toContain("vocab.junior_high.intermediate");
  expect(optionValues).toContain("vocab.junior_high.advanced");
  expect(optionValues).toContain("vocab.kindergarten.supplement");
  expect(optionValues).toContain("vocab.elementary_lower.supplement");

  await page.selectOption("#opt-vocab", "vocab.junior_high.basic");
  await page.waitForTimeout(500);
  await expect(page.locator("#opt-vocab")).toHaveValue("vocab.junior_high.basic");

  await page.selectOption("#opt-vocab", "vocab.junior_high.intermediate");
  await page.waitForTimeout(500);
  await expect(page.locator("#opt-vocab")).toHaveValue("vocab.junior_high.intermediate");

  await page.selectOption("#opt-vocab", "vocab.junior_high.advanced");
  await page.waitForTimeout(500);
  await expect(page.locator("#opt-vocab")).toHaveValue("vocab.junior_high.advanced");

  await page.selectOption("#opt-vocab", "vocab.junior_high");
  await page.waitForTimeout(500);
  await expect(page.locator("#vocab-preview")).toContainText("junior_high");

  await page.selectOption("#opt-vocab", "vocab.kindergarten.supplement");
  await page.waitForTimeout(500);
  await expect(page.locator("#vocab-preview")).toContainText("kindergarten");

  await page.selectOption("#opt-vocab", "vocab.elementary_lower.supplement");
  await page.waitForTimeout(500);
  await expect(page.locator("#vocab-preview")).toContainText("elementary_lower");

  expect(errors, `page errors: ${errors.join(" | ")}`).toHaveLength(0);
});
