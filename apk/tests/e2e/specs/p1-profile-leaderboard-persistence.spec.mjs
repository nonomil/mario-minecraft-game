import { expect, test } from "@playwright/test";

async function login(page, name) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");
  await page.evaluate(async (username) => {
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    paused = false;
    pausedByModal = false;
  }, name);
}

test("P1 profile save to leaderboard persists after reload", async ({ page }) => {
  const username = `pw_lb_${Date.now()}`;
  await login(page, username);

  await page.evaluate(() => {
    score = Math.max(123, Number(score) || 0);
    if (typeof showProfileModal === "function") showProfileModal();
  });

  await expect(page.locator("#profile-modal")).toBeVisible();
  await page.evaluate(() => {
    const btn = document.getElementById("btn-profile-save-leaderboard");
    if (btn) btn.click();
  });

  await expect(page.locator("#leaderboard-modal")).toBeVisible({ timeout: 10_000 });

  const savedNow = await page.evaluate((name) => {
    const list = window.MMWG_STORAGE.getLeaderboard() || [];
    return list.some((r) => String(r?.name || "") === name);
  }, username);
  expect(savedNow).toBeTruthy();

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  const persisted = await page.evaluate((name) => {
    const list = window.MMWG_STORAGE.getLeaderboard() || [];
    return list.some((r) => String(r?.name || "") === name);
  }, username);
  expect(persisted).toBeTruthy();
});
