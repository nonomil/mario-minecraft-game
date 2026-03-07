import { expect, test } from "@playwright/test";
import { forceBoss, getDebugState, openDebugPage, setBossHpRatio, setBossPhase, setBossState, tickGame } from "./helpers.mjs";

const BOSSES = [
  { id: "wither", ctor: "WitherBoss" },
  { id: "ghast", ctor: "GhastBoss" },
  { id: "blaze", ctor: "BlazeBoss" },
  { id: "wither_skeleton", ctor: "WitherSkeletonBoss" },
  { id: "warden", ctor: "WardenBoss" },
  { id: "evoker", ctor: "EvokerBoss" }
];

const PLANNED_BOSSES = ["wither", "ghast", "blaze", "wither_skeleton", "warden", "evoker"];

test("GameDebug controls should expose a working MMDBG API", async ({ page }) => {
  await openDebugPage(page);
  const state = await getDebugState(page);
  expect(state.ready).toBeTruthy();
  expect(typeof state.score).toBe("number");
  expect(state.availableBosses).toEqual(PLANNED_BOSSES);
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

test("Blaze debug scene should expose upgraded visuals, projectiles, and minions", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "blaze");
  await setBossPhase(page, 3);
  await tickGame(page, 220);
  const state = await getDebugState(page);

  expect(state.bossType).toBe("BlazeBoss");
  expect(state.bossVisualKey).toBe("blaze_v2");
  expect(state.bossPhase).toBe(3);
  expect(state.bossProjectileCount).toBeGreaterThan(0);
  expect(state.bossMinionTypes).toContain("blaze_mini");
});

test("Wither skeleton debug scene should expose blocking and summoning states", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "wither_skeleton");
  await setBossState(page, "blocking");
  const blockingState = await getDebugState(page);
  expect(["blocking", "patrol"]).toContain(blockingState.bossState);

  await setBossHpRatio(page, 0.2);
  await tickGame(page, 10);
  const summonState = await getDebugState(page);

  expect(summonState.bossType).toBe("WitherSkeletonBoss");
  expect(summonState.bossVisualKey).toBe("wither_skeleton_v2");
  expect(summonState.bossState).toBe("summoning");
  expect(summonState.bossMinionCount).toBeGreaterThan(0);
});

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
  expect(state.stay.minScore).toBeGreaterThan(0);
  expect(state.stay.minTimeSec).toBeGreaterThan(0);
});

test("Warden debug scene should expose heavy attacks and upgraded visuals", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "warden");
  await setBossPhase(page, 3);
  await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    const boss = w && w.bossArena ? w.bossArena.boss : null;
    if (!boss) return;
    boss.fireSonicPulse();
  });
  await tickGame(page, 4);
  const state = await getDebugState(page);

  expect(state.bossType).toBe("WardenBoss");
  expect(state.bossVisualKey).toBe("warden_v1");
  expect(state.bossPhase).toBe(3);
  expect(state.bossProjectileCount).toBeGreaterThan(0);
});

test("Evoker debug scene should expose fang spells and upgraded visuals", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "evoker");
  await setBossPhase(page, 3);
  await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    const boss = w && w.bossArena ? w.bossArena.boss : null;
    if (!boss) return;
    boss.castFangLine({ x: boss.x + 180 });
  });
  await tickGame(page, 4);
  const state = await getDebugState(page);

  expect(state.bossType).toBe("EvokerBoss");
  expect(state.bossVisualKey).toBe("evoker_v1");
  expect(state.bossPhase).toBe(3);
  expect(state.bossProjectileCount).toBeGreaterThan(0);
});
