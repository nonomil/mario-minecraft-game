import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_vocab_switch_all_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
}

async function openSettings(page) {
  await page.waitForSelector("#btn-settings", { timeout: 20000 });
  await page.click("#btn-settings");
  await page.waitForSelector("#opt-vocab", { timeout: 10000 });
}

test("P0 vocab switch should succeed for every selectable pack", async ({ page }, testInfo) => {
  const errors = [];
  const warnings = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "warning" || msg.type() === "error") {
      warnings.push(msg.text());
    }
  });

  await openGameAndBoot(page);
  await openSettings(page);

  const optionValues = await page.locator("#opt-vocab option").evaluateAll((opts) => (
    opts.map((opt) => opt.value).filter(Boolean)
  ));
  const uniqueOptions = Array.from(new Set(optionValues));
  expect(uniqueOptions.length).toBeGreaterThan(0);

  const aliasMap = new Map([
    ["vocab.kindergarten.hanzi", "vocab.bridge.full"],
    ["vocab.kindergarten.pinyin", "vocab.bridge.full"]
  ]);

  for (const packId of uniqueOptions) {
    const resolvedId = aliasMap.get(packId) || packId;
    testInfo.annotations.push({ type: "vocab-pack", description: packId });
    console.log(`[vocab-switch] selecting ${packId}`);
    await page.selectOption("#opt-vocab", packId);
    await page.click("#btn-settings-save");

    try {
      if (packId === "auto") {
        await page.waitForFunction(() => {
          const state = window.MMWG_TEST_API?.getState?.();
          return state?.wordCount > 0;
        }, null, { timeout: 20_000 });
      } else if (packId === "vocab.bridge.auto") {
        await page.waitForFunction(() => {
          const state = window.MMWG_TEST_API?.getState?.();
          return state?.wordCount > 0
            && ["vocab.bridge.language", "vocab.bridge.math", "vocab.bridge.english"].includes(state?.activeVocabPackId);
        }, null, { timeout: 20_000 });
      } else {
        await page.waitForFunction((id) => {
          const state = window.MMWG_TEST_API?.getState?.();
          return state?.activeVocabPackId === id && state?.wordCount > 0;
        }, resolvedId, { timeout: 20_000 });
      }
    } catch (error) {
      throw new Error(`Pack switch timeout: ${packId}`);
    }

    await openSettings(page);
  }

  expect(
    warnings.filter((line) => /Pack .* produced no words and no fallback data/.test(line)),
    `console warnings: ${warnings.join(" | ")}`
  ).toHaveLength(0);
  expect(errors, `page errors: ${errors.join(" | ")}`).toHaveLength(0);
});
