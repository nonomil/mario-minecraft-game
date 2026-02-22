import { expect, test } from "@playwright/test";
import { forceBoss, getDebugState, openDebugPage } from "./helpers.mjs";

const BOSSES = [
  { id: "wither", ctor: "WitherBoss" },
  { id: "ghast", ctor: "GhastBoss" },
  { id: "blaze", ctor: "BlazeBoss" },
  { id: "wither_skeleton", ctor: "WitherSkeletonBoss" }
];

test("GameDebug controls should expose a working MMDBG API", async ({ page }) => {
  await openDebugPage(page);
  const state = await getDebugState(page);
  expect(state.ready).toBeTruthy();
  expect(typeof state.score).toBe("number");
});

for (const boss of BOSSES) {
  test(`Boss debug spawn smoke: ${boss.id}`, async ({ page }) => {
    await openDebugPage(page);
    const state = await forceBoss(page, boss.id);

    expect(state.ready).toBeTruthy();
    expect(state.bossActive).toBeTruthy();
    expect(state.bossLocked).toBeTruthy();
    expect(state.bossType).toBe(boss.ctor);
    expect(state.bossName).toBeTruthy();
  });
}

test("Biome selection control should switch to volcano and keep stay info available", async ({ page }) => {
  await openDebugPage(page);
  await page.evaluate(() => {
    window.MMDBG.setScore(5200);
    window.MMDBG.setBiome("volcano");
    window.MMDBG.setBiomeRound(1);
  });
  const state = await getDebugState(page);

  expect(state.biome).toBe("volcano");
  expect(state.stay).toBeTruthy();
  expect(state.stay.minScore).toBe(320);
  expect(state.stay.minTimeSec).toBe(70);
});

