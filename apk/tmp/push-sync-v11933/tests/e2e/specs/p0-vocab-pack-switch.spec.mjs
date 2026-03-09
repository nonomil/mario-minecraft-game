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

async function getWordDatabaseSnapshot(page) {
  return await page.evaluate(() => ({
    activeVocabPackId: window.MMWG_TEST_API?.getState?.().activeVocabPackId || null,
    wordCount: Array.isArray(wordDatabase) ? wordDatabase.length : 0,
    firstWord: String(wordDatabase?.[0]?.en || wordDatabase?.[0]?.standardized || wordDatabase?.[0]?.word || "").toLowerCase(),
    settingsVocabSelection: window.MMWG_TEST_API?.getState?.().settings?.vocabSelection || null
  }));
}

test("P0 vocab switch should migrate legacy ids and activate selected current pack", async ({ page }) => {
  const errors = [];
  const warnings = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "warning" || msg.type() === "error") {
      warnings.push(msg.text());
    }
  });

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

  const storedAfterFirstSave = await page.evaluate(() => {
    const currentAccountId = window.MMWG_STORAGE?.getCurrentAccountId?.();
    const account = currentAccountId ? window.MMWG_STORAGE?.getAccount?.(currentAccountId) : null;
    return account?.vocabulary?.currentPack || "";
  });
  expect(storedAfterFirstSave).toBe("vocab.junior_high.basic");

  await page.click("#btn-settings");
  await page.waitForSelector("#opt-vocab", { timeout: 10000 });
  await page.selectOption("#opt-vocab", "vocab.minecraft.full");
  await expect(page.locator("#vocab-preview")).toContainText("Minecraft");
  await page.click("#btn-settings-save");

  await expect.poll(() => getWordDatabaseSnapshot(page), { timeout: 20_000 }).toMatchObject({
    activeVocabPackId: "vocab.minecraft.full",
    settingsVocabSelection: "vocab.minecraft.full",
    firstWord: "air"
  });

  const minecraftSnapshot = await getWordDatabaseSnapshot(page);
  expect(minecraftSnapshot.wordCount).toBeGreaterThanOrEqual(1000);

  const storedAfterSecondSave = await page.evaluate(() => {
    const currentAccountId = window.MMWG_STORAGE?.getCurrentAccountId?.();
    const account = currentAccountId ? window.MMWG_STORAGE?.getAccount?.(currentAccountId) : null;
    return account?.vocabulary?.currentPack || "";
  });
  expect(storedAfterSecondSave).toBe("vocab.minecraft.full");

  expect(
    warnings.filter((line) => /Pack .* produced no words and no fallback data/.test(line)),
    `console warnings: ${warnings.join(" | ")}`
  ).toHaveLength(0);
  expect(errors, `page errors: ${errors.join(" | ")}`).toHaveLength(0);
});
