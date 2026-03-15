import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

async function boot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");
  await page.evaluate(async () => {
    const username = `pw_shield_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });
  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
}

test("P1 wooden shield crafting and auto-reequip", async ({ page }) => {
  await boot(page);
  const snapshot = await page.evaluate(() => {
    inventory.stick = 5;
    inventory.iron = 0;
    const crafted = tryCraft("shield");
    return {
      crafted,
      shieldCount: Number(inventory.shield) || 0,
      maxDurability: Number(shieldState.maxDurability) || 0,
      durability: Number(shieldState.durability) || 0
    };
  });

  expect(snapshot.crafted).toBe(true);
  expect(snapshot.shieldCount).toBe(1);
  expect(snapshot.maxDurability).toBe(50);
  expect(snapshot.durability).toBe(50);

  const failed = await page.evaluate(() => {
    inventory.stick = 4;
    inventory.iron = 0;
    const crafted = tryCraft("shield");
    return { crafted, shieldCount: Number(inventory.shield) || 0 };
  });
  expect(failed.crafted).toBe(false);
  expect(failed.shieldCount).toBe(1);

  const afterHit = await page.evaluate(() => {
    inventory.shield = 2;
    shieldState.equipped = true;
    shieldState.maxDurability = 50;
    shieldState.durability = 1;
    damagePlayer(20, 0);
    return {
      shieldCount: Number(inventory.shield) || 0,
      equipped: !!shieldState.equipped,
      durability: Number(shieldState.durability) || 0
    };
  });
  expect(afterHit.shieldCount).toBe(1);
  expect(afterHit.equipped).toBe(true);
  expect(afterHit.durability).toBe(50);
});

test("P1 shield render scale is doubled", async ({ page }) => {
  await boot(page);
  const info = await page.evaluate(() => {
    inventory.shield = 1;
    shieldState.equipped = true;
    shieldState.durability = 10;
    const pose = getStevePose(true, false);
    drawSteveShield(0, 0, 1, true, getStevePalette(false), pose, true);
    return window.MMWG_SHIELD_RENDER_INFO || null;
  });
  expect(info).toBeTruthy();
  expect(info.scale).toBe(2);
  expect(info.width).toBe(16);
  expect(info.height).toBe(22);
});

test("P1 android web shield recipe uses sticks only", async () => {
  const htmlPath = path.resolve(process.cwd(), "android-app/web/index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");

  const modalItemsMatch = html.match(/CRAFTING_MODAL_SELECTABLE_ITEMS\s*=\s*\[([^\]]+)\]/);
  expect(modalItemsMatch).not.toBeNull();
  const modalItemsText = modalItemsMatch ? modalItemsMatch[1] : "";
  expect(modalItemsText).not.toContain("iron");

  const recipeMatch = html.match(/CRAFTING_RECIPE_DEFINITIONS[\s\S]*?shield\s*:\s*\{[\s\S]*?ingredients\s*:\s*\{([^}]+)\}/);
  expect(recipeMatch).not.toBeNull();
  const ingredientText = recipeMatch ? recipeMatch[1] : "";
  expect(ingredientText).toContain("stick: 5");
  expect(ingredientText).not.toContain("iron");

  const recipesMatch = html.match(/RECIPES\s*=\s*\{[\s\S]*?shield\s*:\s*\{([^}]+)\}/);
  expect(recipesMatch).not.toBeNull();
  const recipesText = recipesMatch ? recipesMatch[1] : "";
  expect(recipesText).toContain("stick: 5");
  expect(recipesText).not.toContain("iron");
});
