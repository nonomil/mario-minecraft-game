import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_chinese_world_label_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
}

test("P0 chinese mode should render Chinese text above floating word items", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));

  await openGameAndBoot(page);

  await page.evaluate(() => {
    const originalDrawItem = window.drawItem;
    if (typeof originalDrawItem !== "function") {
      throw new Error("drawItem is unavailable");
    }

    window.__drawItemArgs = [];
    window.drawItem = function patchedDrawItem(x, y, text) {
      window.__drawItemArgs.push(String(text ?? ""));
      if (window.__drawItemArgs.length > 40) window.__drawItemArgs.shift();
      return originalDrawItem.apply(this, arguments);
    };

    window.MMWG_TEST_API.setState({
      settings: {
        languageMode: "chinese",
        learningMode: true
      }
    });

    window.MMWG_TEST_API.actions.clearOldWordItems();
    window.MMWG_TEST_API.actions.spawnWordItemNearPlayer();
  });

  await page.waitForTimeout(1500);

  const drawItemArgs = await page.evaluate(() => window.__drawItemArgs || []);
  expect(drawItemArgs.length).toBeGreaterThan(0);
  expect(drawItemArgs.some((text) => /[\u4e00-\u9fff]/.test(text))).toBeTruthy();
  expect(errors, `page errors: ${errors.join(" | ")}`).toHaveLength(0);
});
