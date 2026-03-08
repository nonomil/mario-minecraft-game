import { test, expect } from "@playwright/test";

async function openDebug(page) {
  await page.goto(`/tests/debug-pages/GameDebug.html?ts=${Date.now()}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6000);
}

async function gameEval(page, expression) {
  return page.evaluate((expr) => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!w) throw new Error("game_window_missing");
    return w.eval(expr);
  }, expression);
}

async function dispatchLongPressAttack(page, durationMs = 900) {
  await page.evaluate(async (holdMs) => {
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    if (!w) throw new Error("game_window_missing");
    const button = w.document.querySelector('[data-action="attack"]');
    if (!button) throw new Error("attack_button_missing");
    button.dispatchEvent(new w.PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      pointerId: 31,
      pointerType: "touch"
    }));
    await new Promise((resolve) => setTimeout(resolve, holdMs));
    button.dispatchEvent(new w.PointerEvent("pointerup", {
      bubbles: true,
      cancelable: true,
      pointerId: 31,
      pointerType: "touch"
    }));
  }, durationMs);
}

test("debug page buttons mutate real game state", async ({ page }) => {
  await openDebug(page);

  await gameEval(page, "enemies.length = 0; inventory.diamond = 0; true;");

  await page.locator("#biome").selectOption("snow");
  await page.locator("#btnBiome").click();
  await expect.poll(() => gameEval(page, "currentBiome")).toBe("snow");

  await page.locator("#enemy").selectOption("zombie");
  await page.locator("#btnEnemy").click();
  const enemyState = await gameEval(page, "({ count: enemies.length, lastType: enemies[enemies.length - 1]?.type || null })");
  expect(enemyState.count).toBeGreaterThan(0);
  expect(enemyState.lastType).toBe("zombie");

  await expect(page.locator("#item")).toHaveJSProperty("tagName", "SELECT");
  await page.locator("#item").selectOption("diamond");
  await page.locator("#count").fill("5");
  await page.locator("#btnItem").click();
  await expect.poll(() => gameEval(page, "inventory.diamond || 0")).toBe(5);

  const itemOptions = await page.locator("#item option").evaluateAll((options) => options.map((option) => ({
    value: option.value,
    label: (option.textContent || "").trim()
  })));
  expect(itemOptions.some((entry) => entry.value === "dragon_egg" && entry.label.includes("\u9f99\u86cb"))).toBeTruthy();
});

test("debug page gate mode and dragon boss option should drive real scene state", async ({ page }) => {
  await openDebug(page);

  await page.locator("#biome").selectOption("deep_dark");
  await page.locator("#boss").selectOption("warden");
  await page.locator("#btnBossGate").click();

  await expect.poll(() => gameEval(page, `({
    biome: typeof currentBiome !== "undefined" ? currentBiome : null,
    bossActive: !!(bossArena && bossArena.active),
    encounter: bossArena && bossArena.currentEncounter ? bossArena.currentEncounter.source : null,
    environmentId: bossArena && bossArena.environmentController ? bossArena.environmentController.environmentId : null
  })`)).toMatchObject({
    biome: "deep_dark",
    bossActive: true,
    encounter: "biome_gate",
    environmentId: "deep_dark"
  });

  const bossOptions = await page.locator("#boss option").evaluateAll((options) => options.map((option) => option.value));
  expect(bossOptions).toContain("ender_dragon");

  await page.locator("#boss").selectOption("ender_dragon");
  await page.locator("#btnBoss").click();

  await expect.poll(() => gameEval(page, `({
    biome: typeof currentBiome !== "undefined" ? currentBiome : null,
    dragonArenaActive: !!(endDragonArena && endDragonArena.active),
    dragonName: endDragonArena && endDragonArena.dragon ? endDragonArena.dragon.name : null
  })`)).toMatchObject({
    biome: "end",
    dragonArenaActive: true,
    dragonName: "Ender Dragon"
  });
});

test("debug page god mode should prevent direct player damage", async ({ page }) => {
  await openDebug(page);

  await page.evaluate(() => {
    window.MMDBG.ensureRunning();
  });

  await gameEval(page, `(() => {
    if (typeof playerHp === "undefined") return null;
    playerHp = 5;
    return playerHp;
  })()`);

  await page.evaluate(() => {
    window.MMDBG.setGodMode(true);
  });
  await gameEval(page, `(() => {
    if (typeof damagePlayer === "function") damagePlayer(2, 0);
    return typeof playerHp !== "undefined" ? playerHp : null;
  })()`);
  await expect.poll(() => gameEval(page, 'typeof playerHp !== "undefined" ? playerHp : null')).toBe(5);

  await page.evaluate(() => {
    window.MMDBG.setGodMode(false);
  });
  await gameEval(page, `(() => {
    if (typeof damagePlayer === "function") damagePlayer(2, 0);
    return typeof playerHp !== "undefined" ? playerHp : null;
  })()`);
  await expect.poll(() => gameEval(page, 'typeof playerHp !== "undefined" ? playerHp : null')).toBeLessThan(5);
});


test("debug page can prepare dragon egg for manual long-press summon", async ({ page }) => {
  await openDebug(page);

  await gameEval(page, "inventory.dragon_egg = 0; equippedConsumable = { itemKey: null, count: 0, icon: null }; dragonList.length = 0; true;");

  await page.locator("#btnDragonEquip").click();

  await expect.poll(() => gameEval(page, `({
    dragonEgg: Number(inventory.dragon_egg) || 0,
    equipped: equippedConsumable && equippedConsumable.itemKey ? equippedConsumable.itemKey : null
  })`)).toMatchObject({
    dragonEgg: 1,
    equipped: "dragon_egg"
  });

  await expect(page.locator("#status")).toContainText("equipped=dragon_egg");

  await dispatchLongPressAttack(page, 900);

  await expect.poll(() => gameEval(page, `({
    dragonCount: Array.isArray(dragonList) ? dragonList.length : 0,
    riding: !!ridingDragon,
    remainingEgg: Number(inventory.dragon_egg) || 0
  })`)).toMatchObject({
    dragonCount: 1,
    remainingEgg: 0
  });

  const dragonState = await gameEval(page, `({
    dragonCount: Array.isArray(dragonList) ? dragonList.length : 0,
    riding: !!ridingDragon,
    remainingEgg: Number(inventory.dragon_egg) || 0
  })`);
  expect(dragonState.dragonCount).toBe(1);
  await expect(page.locator("#status")).toContainText("dragons=1");
});



