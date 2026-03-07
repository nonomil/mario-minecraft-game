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
    if (!button) throw new Error('attack_button_missing');
    button.dispatchEvent(new w.PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      pointerId: 31,
      pointerType: "touch"
    }));
    await new Promise(resolve => setTimeout(resolve, holdMs));
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
  await page.getByRole("button", { name: "切换群系" }).click();
  await expect.poll(() => gameEval(page, "currentBiome")).toBe("snow");

  await page.locator("#enemy").selectOption("zombie");
  await page.getByRole("button", { name: "生成敌人" }).click();
  const enemyState = await gameEval(page, "({ count: enemies.length, lastType: enemies[enemies.length - 1]?.type || null })");
  expect(enemyState.count).toBeGreaterThan(0);
  expect(enemyState.lastType).toBe("zombie");

  await page.locator("#item").fill("diamond");
  await page.locator("#count").fill("5");
  await page.getByRole("button", { name: "给予物品" }).click();
  await expect.poll(() => gameEval(page, "inventory.diamond || 0")).toBe(5);
});


test("debug page can prepare dragon egg for manual long-press summon", async ({ page }) => {
  await openDebug(page);

  await gameEval(page, "inventory.dragon_egg = 0; equippedConsumable = { itemKey: null, count: 0, icon: null }; dragonList.length = 0; true;");

  await page.getByRole("button", { name: "龙蛋并装备（长按攻击召唤）" }).click();

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
