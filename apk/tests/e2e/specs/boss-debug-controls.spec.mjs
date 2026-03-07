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

test("GameDebug boss state should expose second-pass intent and reward metadata", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "blaze");
  await setBossPhase(page, 3);
  await tickGame(page, 40);
  const blazeState = await getDebugState(page);

  expect(blazeState.bossRewardKey).toBeTruthy();
  expect(typeof blazeState.bossIntentKey).toBe("string");
  expect(Array.isArray(blazeState.bossProjectileTypes)).toBeTruthy();
  expect(typeof blazeState.bossVictoryReady).toBe("boolean");

  await forceBoss(page, "warden");
  await setBossPhase(page, 3);
  await tickGame(page, 40);
  const wardenState = await getDebugState(page);

  expect(wardenState.bossRewardKey).toBeTruthy();
  expect(typeof wardenState.bossIntentKey).toBe("string");
  expect(Array.isArray(wardenState.bossProjectileTypes)).toBeTruthy();
  expect(typeof wardenState.bossVictoryReady).toBe("boolean");
});

test("Boss victory should grant boss-specific reward drops", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "blaze");

  const before = await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    return {
      score: w && typeof w.eval === "function" ? (Number(w.eval('typeof score !== "undefined" ? score : 0')) || 0) : (Number(w && w.score) || 0),
      blazePowder: w && typeof w.eval === "function" ? (Number(w.eval('inventory && inventory.blaze_powder ? inventory.blaze_powder : 0')) || 0) : (Number(w && w.inventory && w.inventory.blaze_powder) || 0)
    };
  });

  await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    const boss = w && w.bossArena ? w.bossArena.boss : null;
    if (!boss) return;
    boss.phaseInvulnerableTimer = 0;
    boss.takeDamage(9999);
  });
  await tickGame(page, 4);

  const after = await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    return {
      score: w && typeof w.eval === "function" ? (Number(w.eval('typeof score !== "undefined" ? score : 0')) || 0) : (Number(w && w.score) || 0),
      blazePowder: w && typeof w.eval === "function" ? (Number(w.eval('inventory && inventory.blaze_powder ? inventory.blaze_powder : 0')) || 0) : (Number(w && w.inventory && w.inventory.blaze_powder) || 0)
    };
  });

  expect(after.score).toBeGreaterThan(before.score);
  expect(after.blazePowder).toBeGreaterThan(before.blazePowder);
});

test("Wither phase 3 should expose an air-pressure barrage intent", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "wither");
  await setBossPhase(page, 3);
  await tickGame(page, 80);
  await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    const boss = w && w.bossArena ? w.bossArena.boss : null;
    if (boss && typeof boss.shootTrackingBalls === "function") boss.shootTrackingBalls(5);
  });
  const state = await getDebugState(page);

  expect(state.bossType).toBe("WitherBoss");
  expect(state.bossIntentKey).toBe("tracking_barrage");
  expect(state.bossProjectileTypes).toContain("wither_tracking_orb");
});

test("Ghast phase 3 should expose an air-pressure bombardment intent", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "ghast");
  await setBossPhase(page, 3);
  await tickGame(page, 80);
  await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    const boss = w && w.bossArena ? w.bossArena.boss : null;
    const playerRef = w && w.player ? w.player : { x: 0, y: 0, width: 0, height: 0 };
    if (boss && typeof boss.shootFireball === "function") boss.shootFireball(playerRef, 3);
  });
  const state = await getDebugState(page);

  expect(state.bossType).toBe("GhastBoss");
  expect(state.bossIntentKey).toBe("bombardment");
  expect(state.bossProjectileTypes).toContain("ghast_fireball_volley");
});

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
  await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    const boss = w && w.bossArena ? w.bossArena.boss : null;
    if (boss && typeof boss.summonMinions === "function") boss.summonMinions();
  });
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

test("Blaze phase 3 should expose a flame-ring pressure intent", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "blaze");
  await setBossPhase(page, 3);
  await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    const boss = w && w.bossArena ? w.bossArena.boss : null;
    if (boss && typeof boss.castFlameRing === "function") boss.castFlameRing();
  });
  const state = await getDebugState(page);

  expect(state.bossType).toBe("BlazeBoss");
  expect(state.bossIntentKey).toBe("flame_ring");
  expect(state.bossProjectileTypes).toContain("blaze_ring_orb");
});

test("Wither skeleton phase 3 should expose a bone-wall pressure intent", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "wither_skeleton");
  await setBossPhase(page, 3);
  await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    const boss = w && w.bossArena ? w.bossArena.boss : null;
    if (boss && typeof boss.raiseBoneWall === "function") boss.raiseBoneWall();
  });
  const state = await getDebugState(page);

  expect(state.bossType).toBe("WitherSkeletonBoss");
  expect(state.bossIntentKey).toBe("bone_wall");
  expect(state.bossProjectileTypes).toContain("bone_wall_shard");
});

test("Warden phase 3 should expose a darkness-pulse elite intent", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "warden");
  await setBossPhase(page, 3);
  await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    const boss = w && w.bossArena ? w.bossArena.boss : null;
    if (boss && typeof boss.emitDarkPulse === "function") boss.emitDarkPulse();
  });
  const state = await getDebugState(page);

  expect(state.bossType).toBe("WardenBoss");
  expect(state.bossIntentKey).toBe("dark_pulse");
  expect(state.bossProjectileTypes).toContain("warden_dark_pulse");
});

test("Evoker phase 3 should expose a spellburst elite intent", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "evoker");
  await setBossPhase(page, 3);
  await page.evaluate(() => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    const boss = w && w.bossArena ? w.bossArena.boss : null;
    if (boss && typeof boss.castSpellBurst === "function") boss.castSpellBurst();
  });
  const state = await getDebugState(page);

  expect(state.bossType).toBe("EvokerBoss");
  expect(state.bossIntentKey).toBe("spellburst");
  expect(state.bossProjectileTypes).toContain("evoker_spellburst");
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
