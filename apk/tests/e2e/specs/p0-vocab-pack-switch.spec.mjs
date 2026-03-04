import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_vocab_switch_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
}

test("P0 vocab packs should include and switch to newly added packs", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));

  await openGameAndBoot(page);

  await page.waitForSelector("#btn-settings", { timeout: 20000 });
  await page.click("#btn-settings");
  await page.waitForSelector("#opt-vocab", { timeout: 10000 });

  const optionValues = await page.locator("#opt-vocab option").evaluateAll((opts) => opts.map((o) => o.value));
  expect(optionValues).toContain("vocab.junior_high");
  expect(optionValues).toContain("vocab.junior_high.basic");
  expect(optionValues).toContain("vocab.junior_high.intermediate");
  expect(optionValues).toContain("vocab.junior_high.advanced");
  expect(optionValues).toContain("vocab.kindergarten");
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

  await page.selectOption("#opt-vocab", "vocab.kindergarten");
  await page.waitForTimeout(500);
  await expect(page.locator("#vocab-preview")).toContainText("kindergarten");

  await page.selectOption("#opt-vocab", "vocab.elementary_lower.supplement");
  await page.waitForTimeout(500);
  await expect(page.locator("#vocab-preview")).toContainText("elementary_lower");

  expect(errors, `page errors: ${errors.join(" | ")}`).toHaveLength(0);
});
