import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_dragon_growth_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
}

test("P3 dragon egg growth accumulates points from learning events", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    if (!window.MMWG_TEST_API?.actions?.resetLearningState) {
      return { ok: false, reason: "resetLearningState missing" };
    }
    if (!window.MMWG_TEST_API?.actions?.recordLearningEvent) {
      return { ok: false, reason: "recordLearningEvent missing" };
    }

    window.MMWG_TEST_API.actions.resetLearningState();

    // Record vocab success (+2 points)
    recordWordProgress({ en: "apple", zh: "苹果" });

    // Record challenge success (+1 point)
    window.MMWG_TEST_API.actions.recordLearningEvent({
      source: "challenge",
      wordKey: "apple",
      themeKey: "forest",
      result: "success",
      meta: { type: "translate" }
    });

    // Record village success (+3 points)
    window.MMWG_TEST_API.actions.recordLearningEvent({
      source: "village",
      wordKey: null,
      themeKey: "forest",
      result: "success",
      meta: { correct: 5, total: 5 }
    });

    // Record village partial (+1 point)
    window.MMWG_TEST_API.actions.recordLearningEvent({
      source: "village",
      wordKey: null,
      themeKey: "forest",
      result: "partial",
      meta: { correct: 3, total: 5 }
    });

    const state = window.MMWG_TEST_API.getState();
    return {
      ok: true,
      dragonEgg: state.learningState.dragonEgg,
      expectedPoints: 2 + 1 + 3 + 1  // = 7
    };
  });

  expect(result.ok, result.reason || "evaluation failed").toBeTruthy();
  expect(result.dragonEgg.points).toBe(result.expectedPoints);
  expect(result.dragonEgg.stage).toBe(0);  // Stage 0 until 20 points
});

test("P3 dragon egg advances to stage 1 at 20 points", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    if (!window.MMWG_TEST_API?.actions?.resetLearningState) {
      return { ok: false, reason: "resetLearningState missing" };
    }

    window.MMWG_TEST_API.actions.resetLearningState();

    // Record 10 vocab successes (10 * 2 = 20 points)
    for (let i = 0; i < 10; i++) {
      recordWordProgress({ en: `word${i}`, zh: `词${i}` });
    }

    const state = window.MMWG_TEST_API.getState();
    return {
      ok: true,
      dragonEgg: state.dragonEgg,
      learningState: state.learningState
    };
  });

  expect(result.ok, result.reason || "evaluation failed").toBeTruthy();
  expect(result.learningState.dragonEgg.points).toBe(20);
  expect(result.learningState.dragonEgg.stage).toBe(1);
});

test("P3 dragon egg advances to stage 2 at 50 points", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    window.MMWG_TEST_API.actions.resetLearningState();

    // Record 25 vocab successes (25 * 2 = 50 points)
    for (let i = 0; i < 25; i++) {
      recordWordProgress({ en: `word${i}`, zh: `词${i}` });
    }

    const state = window.MMWG_TEST_API.getState();
    return {
      ok: true,
      dragonEgg: state.learningState.dragonEgg
    };
  });

  expect(result.ok).toBeTruthy();
  expect(result.dragonEgg.points).toBe(50);
  expect(result.dragonEgg.stage).toBe(2);
});

test("P3 dragon egg advances to stage 3 at 100 points", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    window.MMWG_TEST_API.actions.resetLearningState();

    // Record 50 vocab successes (50 * 2 = 100 points)
    for (let i = 0; i < 50; i++) {
      recordWordProgress({ en: `word${i}`, zh: `词${i}` });
    }

    const state = window.MMWG_TEST_API.getState();
    return {
      ok: true,
      dragonEgg: state.learningState.dragonEgg
    };
  });

  expect(result.ok).toBeTruthy();
  expect(result.dragonEgg.points).toBe(100);
  expect(result.dragonEgg.stage).toBe(3);
});
