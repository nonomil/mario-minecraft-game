import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_learning_spine_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
}

test("P1 learning event spine records vocab, challenge, and village results", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    if (!window.MMWG_TEST_API?.actions?.resetLearningState) {
      return { ok: false, reason: "resetLearningState missing" };
    }
    if (!window.MMWG_TEST_API?.actions?.recordLearningEvent) {
      return { ok: false, reason: "recordLearningEvent missing" };
    }

    window.MMWG_TEST_API.actions.resetLearningState();
    recordWordProgress({ en: "tree", zh: "树" });

    window.MMWG_TEST_API.actions.recordLearningEvent({
      source: "challenge",
      wordKey: "tree",
      themeKey: "forest",
      result: "success",
      meta: { type: "translate" }
    });

    window.MMWG_TEST_API.actions.recordLearningEvent({
      source: "village",
      wordKey: null,
      themeKey: "forest",
      result: "partial",
      meta: { correct: 3, total: 5 }
    });

    return {
      ok: true,
      learningState: window.MMWG_TEST_API.getState().learningState
    };
  });

  expect(result.ok, result.reason || "evaluation failed").toBeTruthy();
  expect(result.learningState).toBeTruthy();
  expect(result.learningState.recentEvents).toHaveLength(3);
  expect(result.learningState.totals.all.total).toBe(3);
  expect(result.learningState.totals.sources.vocab.success).toBe(1);
  expect(result.learningState.totals.sources.challenge.success).toBe(1);
  expect(result.learningState.totals.sources.village.partial).toBe(1);

  const [latest, middle, oldest] = result.learningState.recentEvents;
  expect(latest.source).toBe("village");
  expect(middle.source).toBe("challenge");
  expect(oldest.source).toBe("vocab");
  expect(oldest.wordKey).toBe("tree");
  expect(latest.meta.correct).toBe(3);
});
