import { expect, test } from "@playwright/test";

async function openGameAndBoot(page, options = {}) {
  const { legacyPackId = null } = options;
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async ({ legacyPackId: requestedLegacyPackId }) => {
    const username = `pw_vocab_switch_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    if (requestedLegacyPackId) {
      account.vocabulary = {
        ...(account.vocabulary || {}),
        currentPack: requestedLegacyPackId,
        packProgress: account.vocabulary?.packProgress || {},
        learnedWords: account.vocabulary?.learnedWords || []
      };
    }
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  }, { legacyPackId });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
}

test("P0 vocab switch should migrate legacy ids and activate selected current pack", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));

  await openGameAndBoot(page, { legacyPackId: "vocab.kindergarten" });

  await page.waitForFunction(() => {
    const state = window.MMWG_TEST_API?.getState?.();
    return state?.activeVocabPackId === "vocab.kindergarten.full" && state.wordCount > 100;
  }, null, { timeout: 20_000 });

  await page.waitForSelector("#btn-settings", { timeout: 20000 });
  await page.click("#btn-settings");
  await page.waitForSelector("#opt-vocab", { timeout: 10000 });

  const optionValues = await page.locator("#opt-vocab option").evaluateAll((opts) => opts.map((o) => o.value));
  expect(optionValues).toContain("vocab.kindergarten.full");
  expect(optionValues).toContain("vocab.junior_high.basic");
  expect(optionValues).toContain("vocab.junior_high.intermediate");
  expect(optionValues).toContain("vocab.junior_high.full");
  expect(optionValues).toContain("vocab.minecraft.full");
  await expect(page.locator("#opt-vocab")).toHaveValue("vocab.kindergarten.full");

  await page.selectOption("#opt-vocab", "vocab.junior_high.basic");
  await expect(page.locator("#vocab-preview")).toContainText("初中-初级");
  await page.click("#btn-settings-save");

  await page.waitForFunction(() => {
    const state = window.MMWG_TEST_API?.getState?.();
    return state?.activeVocabPackId === "vocab.junior_high.basic" && state.wordCount > 100;
  }, null, { timeout: 20_000 });

  await page.click("#btn-settings");
  await page.waitForSelector("#opt-vocab", { timeout: 10000 });
  await page.selectOption("#opt-vocab", "vocab.minecraft.full");
  await expect(page.locator("#vocab-preview")).toContainText("Minecraft");
  await page.click("#btn-settings-save");

  await page.waitForFunction(() => {
    const state = window.MMWG_TEST_API?.getState?.();
    return state?.activeVocabPackId === "vocab.minecraft.full" && state.wordCount > 100;
  }, null, { timeout: 20_000 });

  expect(errors, `page errors: ${errors.join(" | ")}`).toHaveLength(0);
});
