import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_gate_toggle_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
  await page.waitForFunction(() => {
    try { return typeof player !== "undefined" && !!player; } catch { return false; }
  }, null, { timeout: 30_000 });
}

test("P0 disabled word gate does not trigger already spawned gate", async ({ page }) => {
  await openGameAndBoot(page);

  const probe = await page.evaluate(() => {
    if (typeof WordGate !== "function") return { ok: false, reason: "WordGate missing" };
    if (typeof update !== "function") return { ok: false, reason: "update missing" };
    if (!player) return { ok: false, reason: "player missing" };

    settings.wordGateEnabled = false;
    if (Array.isArray(wordGates)) wordGates.length = 0;
    currentLearningChallenge = null;

    const gate = new WordGate(player.x + 40, groundY, { en: "tree", zh: "树" });
    gate.x = player.x - 4;
    gate.y = player.y - 4;
    gate.width = (Number(player.width) || 32) + 12;
    gate.height = (Number(player.height) || 48) + 12;
    gate.cooldown = 0;
    gate.locked = true;
    wordGates.push(gate);

    update();

    return {
      ok: true,
      challengeActive: !!currentLearningChallenge,
      cooldown: gate.cooldown,
      gateCount: wordGates.length
    };
  });

  expect(probe.ok, probe.reason || "probe failed").toBeTruthy();
  expect(probe.gateCount).toBe(1);
  expect(probe.challengeActive).toBeFalsy();
  expect(probe.cooldown).toBe(0);
});
