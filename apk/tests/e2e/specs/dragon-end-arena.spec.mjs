import { expect, test } from "@playwright/test";
import { openDebugPage } from "./helpers.mjs";

test("GameDebug can enter the dedicated dragon arena", async ({ page }) => {
  await openDebugPage(page);

  const apiType = await page.evaluate(() => typeof window.MMDBG.enterDragonArena);
  expect(apiType).toBe("function");

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    return window.MMDBG.getState();
  });

  expect(state.dragonArenaActive).toBeTruthy();
  expect(["intro", "combat"]).toContain(state.dragonArenaState);
  expect(state.dragonBossName).toBe("Ender Dragon");
  expect(state.dragonCrystalCount).toBeGreaterThanOrEqual(4);
});

test("Dragon arena exposes stable intent keys for phases 1 to 3", async ({ page }) => {
  await openDebugPage(page);

  const phaseOneState = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    window.MMDBG.tick(10);
    return window.MMDBG.getState();
  });

  expect(phaseOneState.dragonArenaPhase).toBe(1);
  expect(phaseOneState.dragonBossIntentKey).toBe("orbit_crystal_heal");

  const phaseTwoState = await page.evaluate(() => {
    window.MMDBG.setDragonArenaPhase(2);
    window.MMDBG.tick(10);
    return window.MMDBG.getState();
  });

  expect(phaseTwoState.dragonArenaPhase).toBe(2);
  expect(["dive_charge", "fireball_breath"]).toContain(phaseTwoState.dragonBossIntentKey);

  const phaseThreeState = await page.evaluate(() => {
    window.MMDBG.setDragonArenaPhase(3);
    window.MMDBG.tick(10);
    return window.MMDBG.getState();
  });

  expect(phaseThreeState.dragonArenaPhase).toBe(3);
  expect(["perch_frenzy", "low_sweep"]).toContain(phaseThreeState.dragonBossIntentKey);
});

test("Dragon boss can take direct debug damage", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    const before = window.MMDBG.getState();
    window.MMDBG.damageDragonBoss(25);
    const after = window.MMDBG.getState();
    return { before, after };
  });

  expect(state.before.dragonBossHp).toBeGreaterThan(state.after.dragonBossHp);
  expect(state.after.dragonBossHp).toBe(state.before.dragonBossHp - 25);
});


test("Dragon crystals heal the boss and can be destroyed", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    window.MMDBG.damageDragonBoss(40);
    const damaged = window.MMDBG.getState();
    window.MMDBG.tick(20);
    const healed = window.MMDBG.getState();
    window.MMDBG.destroyDragonCrystal(0);
    const afterCrystalBreak = window.MMDBG.getState();
    return { damaged, healed, afterCrystalBreak };
  });

  expect(state.damaged.dragonBossHp).toBe(260);
  expect(state.healed.dragonBossHp).toBeGreaterThan(state.damaged.dragonBossHp);
  expect(state.afterCrystalBreak.dragonAliveCrystalCount).toBe(3);
});

test("Dragon hazards and victory portal states are exposed", async ({ page }) => {
  await openDebugPage(page);

  const state = await page.evaluate(() => {
    window.MMDBG.enterDragonArena();
    window.MMDBG.setDragonArenaPhase(2);
    window.MMDBG.tick(18);
    const combat = window.MMDBG.getState();
    window.MMDBG.forceDragonVictory();
    window.MMDBG.tick(12);
    const victory = window.MMDBG.getState();
    return { combat, victory };
  });

  expect(state.combat.dragonHazardCount).toBeGreaterThan(0);
  expect(state.victory.dragonVictoryReady).toBeTruthy();
  expect(state.victory.dragonExitPortalReady).toBeTruthy();
});
