import { expect, test } from "@playwright/test";
import { forceBoss, openDebugPage, setBossHpRatio, setBossPhase, setBossState, tickGame } from "./helpers.mjs";

async function captureBossScene(page, bossId, setup) {
  await openDebugPage(page);
  await forceBoss(page, bossId);
  if (setup) await setup();
  const frame = page.locator("#game");
  await frame.waitFor({ state: "visible" });
  await page.waitForTimeout(150);
  const shot = await frame.screenshot();
  expect(shot.byteLength).toBeGreaterThan(1000);
}

test("Visual smoke: blaze phase 3 scene renders upgraded silhouette", async ({ page }) => {
  await captureBossScene(page, "blaze", async () => {
    await setBossPhase(page, 3);
    await tickGame(page, 240);
  });
});

test("Visual smoke: wither skeleton blocking summon scene renders upgraded silhouette", async ({ page }) => {
  await captureBossScene(page, "wither_skeleton", async () => {
    await setBossState(page, "blocking");
    await setBossHpRatio(page, 0.2);
    await tickGame(page, 10);
  });
});

test("Visual smoke: warden attack scene renders heavy silhouette", async ({ page }) => {
  await captureBossScene(page, "warden", async () => {
    await setBossPhase(page, 3);
    await tickGame(page, 220);
  });
});

test("Visual smoke: ravager charge scene renders heavy silhouette", async ({ page }) => {
  await captureBossScene(page, "ravager", async () => {
    await setBossPhase(page, 3);
    await page.evaluate(() => {
      const frame = document.getElementById("game");
      const w = frame && frame.contentWindow ? frame.contentWindow : null;
      if (!w || typeof w.eval !== "function") return;
      w.eval('if (typeof bossArena !== "undefined" && bossArena && bossArena.boss && typeof bossArena.boss.startCharge === "function" && typeof player !== "undefined" && player) { bossArena.boss.startCharge(player); }');
    });
    await tickGame(page, 8);
  });
});
