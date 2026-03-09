import { test, expect } from "@playwright/test";
test.describe("背包物品使用稳定性", () => {
  test("材料与装备使用不应抛出异常", async ({ page }) => {
    await page.goto("/Game.html");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(() => typeof window.useInventoryItem === "function", null, { timeout: 30_000 });
    await page.waitForTimeout(1200);

    const skipBtn = page.locator("#btn-overlay-skip");
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click({ force: true });
      await page.waitForTimeout(200);
    }

    const result = await page.evaluate(() => {
      const w = window;

      const materials = [
        "gunpowder",
        "ender_pearl",
        "string",
        "rotten_flesh",
        "shell",
        "coal",
        "dragon_egg",
        "starfish",
        "gold",
        "echo_shard",
        "mushroom",
        "stick",
        "flower",
        "pumpkin",
        "iron",
        "sculk_vein"
      ];

      const equipment = ["stone_sword", "iron_pickaxe", "arrow"];
      const allItems = [...materials, ...equipment];
      const failures = [];

      for (const key of allItems) {
        try {
          w.eval(`
if (typeof inventory === "undefined") throw new Error("inventory_missing");
inventory["${key}"] = Math.max(10, Number(inventory["${key}"]) || 0);
if ("${key}" === "string") inventory.string = Math.max(10, Number(inventory.string) || 0);
if ("${key}" === "stick") {
  inventory.stick = Math.max(10, Number(inventory.stick) || 0);
  inventory.string = Math.max(10, Number(inventory.string) || 0);
}
if ("${key}" === "echo_shard") inventory.echo_shard = Math.max(6, Number(inventory.echo_shard) || 0);
if ("${key}" === "mushroom") inventory.mushroom = Math.max(4, Number(inventory.mushroom) || 0);
if ("${key}" === "shell") inventory.shell = Math.max(6, Number(inventory.shell) || 0);
if ("${key}" === "iron") inventory.iron = Math.max(6, Number(inventory.iron) || 0);
if ("${key}" === "sculk_vein") inventory.sculk_vein = Math.max(6, Number(inventory.sculk_vein) || 0);
if ("${key}" === "pumpkin") inventory.pumpkin = Math.max(2, Number(inventory.pumpkin) || 0);
if ("${key}" === "arrow") inventory.arrow = Math.max(10, Number(inventory.arrow) || 0);
if ("${key}" === "dragon_egg" && Array.isArray(enemies)) {
  enemies.length = 0;
  enemies.push({ x: cameraX + 20, y: groundY - 20, width: 16, height: 16, remove: false });
}
useInventoryItem("${key}");
`);
        } catch (e) {
          failures.push({ item: key, error: String(e && e.message ? e.message : e) });
        }
      }

      return { failures };
    });

    expect(result.failures).toEqual([]);
  });

  test("随机连续使用材料与装备不应出现卡死或异常", async ({ page }) => {
    await page.goto("/Game.html");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(() => typeof window.useInventoryItem === "function", null, { timeout: 30_000 });
    await page.waitForTimeout(1200);

    const skipBtn = page.locator("#btn-overlay-skip");
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click({ force: true });
      await page.waitForTimeout(200);
    }

    const summary = await page.evaluate(() => {
      const itemPool = [
        "gunpowder",
        "ender_pearl",
        "string",
        "rotten_flesh",
        "shell",
        "coal",
        "dragon_egg",
        "starfish",
        "gold",
        "echo_shard",
        "mushroom",
        "stick",
        "flower",
        "pumpkin",
        "iron",
        "sculk_vein",
        "stone_sword",
        "iron_pickaxe",
        "arrow"
      ];
      const armorPool = ["leather", "chainmail", "iron", "gold", "diamond", "netherite"];
      const failures = [];

      const prepareInventory = () => {
        if (typeof inventory === "undefined") return;
        inventory.gunpowder = Math.max(20, Number(inventory.gunpowder) || 0);
        inventory.ender_pearl = Math.max(20, Number(inventory.ender_pearl) || 0);
        inventory.string = Math.max(30, Number(inventory.string) || 0);
        inventory.rotten_flesh = Math.max(20, Number(inventory.rotten_flesh) || 0);
        inventory.shell = Math.max(30, Number(inventory.shell) || 0);
        inventory.coal = Math.max(20, Number(inventory.coal) || 0);
        inventory.dragon_egg = Math.max(20, Number(inventory.dragon_egg) || 0);
        inventory.starfish = Math.max(20, Number(inventory.starfish) || 0);
        inventory.gold = Math.max(20, Number(inventory.gold) || 0);
        inventory.echo_shard = Math.max(30, Number(inventory.echo_shard) || 0);
        inventory.mushroom = Math.max(30, Number(inventory.mushroom) || 0);
        inventory.stick = Math.max(40, Number(inventory.stick) || 0);
        inventory.flower = Math.max(20, Number(inventory.flower) || 0);
        inventory.pumpkin = Math.max(20, Number(inventory.pumpkin) || 0);
        inventory.iron = Math.max(40, Number(inventory.iron) || 0);
        inventory.sculk_vein = Math.max(30, Number(inventory.sculk_vein) || 0);
        inventory.stone_sword = Math.max(1, Number(inventory.stone_sword) || 0);
        inventory.iron_pickaxe = Math.max(1, Number(inventory.iron_pickaxe) || 0);
        inventory.arrow = Math.max(40, Number(inventory.arrow) || 0);
      };

      const prepareArmor = () => {
        if (!Array.isArray(armorInventory)) return;
        if (armorInventory.length > 0) return;
        armorInventory.push(
          { id: "leather", durability: 100 },
          { id: "iron", durability: 100 },
          { id: "diamond", durability: 100 }
        );
      };

      for (let i = 0; i < 320; i++) {
        try {
          prepareInventory();
          prepareArmor();
          if (Array.isArray(enemies) && i % 15 === 0) {
            enemies.length = 0;
            enemies.push({ x: cameraX + 30, y: groundY - 30, width: 16, height: 16, remove: false });
          }
          const item = itemPool[Math.floor(Math.random() * itemPool.length)];
          useInventoryItem(item);
          if (i % 20 === 0 && typeof hideInventoryModal === "function") hideInventoryModal();
          if (i % 25 === 0 && typeof showInventoryModal === "function") showInventoryModal();
          if (i % 30 === 0 && typeof equipArmorFromBackpack === "function") {
            const armor = armorPool[Math.floor(Math.random() * armorPool.length)];
            equipArmorFromBackpack(armor);
          }
          if (i % 45 === 0 && typeof unequipArmorFromBackpack === "function") {
            unequipArmorFromBackpack();
          }
        } catch (e) {
          failures.push({ step: i, error: String(e && e.message ? e.message : e) });
        }
      }

      const modalVisible = typeof inventoryModalEl !== "undefined" && inventoryModalEl
        ? inventoryModalEl.classList.contains("visible")
        : false;
      const pauseValue = typeof pauseStack !== "undefined" ? Number(pauseStack) : -1;
      if (modalVisible && pauseValue <= 0) failures.push({ step: "state", error: "modal_visible_but_pause_stack_empty" });
      if (!modalVisible && pauseValue > 0) failures.push({ step: "state", error: "pause_stack_leak" });

      return { failures, pauseValue, modalVisible };
    });

    expect(summary.failures).toEqual([]);
  });
});
