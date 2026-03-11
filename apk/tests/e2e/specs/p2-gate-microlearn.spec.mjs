import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_gate_microlearn_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
}

test("P2 gate microlearn triggers before biome gate and grants shield on success", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    if (!window.MMWG_TEST_API?.actions?.triggerGateMicrolearn) {
      return { ok: false, reason: "triggerGateMicrolearn missing" };
    }
    if (!window.MMWG_TEST_API?.actions?.getGateMicrolearnState) {
      return { ok: false, reason: "getGateMicrolearnState missing" };
    }

    // Trigger gate microlearn from forest to desert
    const microlearnResult = window.MMWG_TEST_API.actions.triggerGateMicrolearn("forest", "desert");

    if (!microlearnResult || !microlearnResult.questionShown) {
      return { ok: false, reason: "Question not shown" };
    }

    // Simulate correct answer
    const answerResult = window.MMWG_TEST_API.actions.answerGateMicrolearn(true);

    if (!answerResult || !answerResult.correct) {
      return { ok: false, reason: "Answer not recorded as correct" };
    }

    // Check shield buff granted
    const state = window.MMWG_TEST_API.getState();
    const hasShield = state.playerShieldLayers > 0;

    return {
      ok: true,
      microlearnResult,
      answerResult,
      hasShield,
      shieldLayers: state.playerShieldLayers,
      learningState: state.learningState
    };
  });

  expect(result.ok, result.reason || "evaluation failed").toBeTruthy();
  expect(result.microlearnResult.questionShown).toBeTruthy();
  expect(result.answerResult.correct).toBeTruthy();
  expect(result.hasShield).toBeTruthy();
  expect(result.shieldLayers).toBe(1);

  // Verify learning event recorded
  expect(result.learningState.recentEvents.length).toBeGreaterThan(0);
  const latestEvent = result.learningState.recentEvents[0];
  expect(latestEvent.source).toBe("challenge");
  expect(latestEvent.result).toBe("success");
  expect(latestEvent.meta.type).toBe("gate_microlearn");
});

test("P2 gate microlearn does not grant shield on wrong answer", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    if (!window.MMWG_TEST_API?.actions?.triggerGateMicrolearn) {
      return { ok: false, reason: "triggerGateMicrolearn missing" };
    }

    // Trigger gate microlearn
    const microlearnResult = window.MMWG_TEST_API.actions.triggerGateMicrolearn("forest", "desert");

    if (!microlearnResult || !microlearnResult.questionShown) {
      return { ok: false, reason: "Question not shown" };
    }

    // Simulate wrong answer
    const answerResult = window.MMWG_TEST_API.actions.answerGateMicrolearn(false);

    if (!answerResult || answerResult.correct) {
      return { ok: false, reason: "Answer should be wrong" };
    }

    // Check no shield buff
    const state = window.MMWG_TEST_API.getState();
    const hasShield = state.playerShieldLayers > 0;

    return {
      ok: true,
      answerResult,
      hasShield,
      shieldLayers: state.playerShieldLayers,
      learningState: state.learningState
    };
  });

  expect(result.ok, result.reason || "evaluation failed").toBeTruthy();
  expect(result.answerResult.correct).toBeFalsy();
  expect(result.hasShield).toBeFalsy();
  expect(result.shieldLayers).toBe(0);

  // Verify learning event recorded as fail
  expect(result.learningState.recentEvents.length).toBeGreaterThan(0);
  const latestEvent = result.learningState.recentEvents[0];
  expect(latestEvent.source).toBe("challenge");
  expect(latestEvent.result).toBe("fail");
  expect(latestEvent.meta.type).toBe("gate_microlearn");
});
