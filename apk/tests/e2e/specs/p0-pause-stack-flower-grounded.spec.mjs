import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_pause_stack_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
  await page.waitForFunction(() => {
    try {
      return typeof player !== "undefined" && !!player;
    } catch {
      return false;
    }
  }, null, { timeout: 30_000 });
}

test("P0 nested modals keep game paused until all are closed", async ({ page }) => {
  await openGameAndBoot(page);

  const snapshot = await page.evaluate(() => {
    if (typeof setOverlay === "function") setOverlay(false);
    paused = false;

    if (typeof showInventoryModal !== "function" || typeof hideInventoryModal !== "function") {
      return { ok: false, reason: "inventory modal API missing" };
    }
    if (typeof showArmorSelectUI !== "function" || typeof hideArmorSelectUI !== "function") {
      return { ok: false, reason: "armor modal API missing" };
    }

    showInventoryModal();
    showArmorSelectUI();
    const afterOpen = {
      paused: !!paused,
      inventoryVisible: !!document.getElementById("inventory-modal")?.classList.contains("visible"),
      armorVisible: !!document.getElementById("armor-select-modal")?.classList.contains("visible")
    };

    hideArmorSelectUI();
    const afterCloseArmor = {
      paused: !!paused,
      inventoryVisible: !!document.getElementById("inventory-modal")?.classList.contains("visible"),
      armorVisible: !!document.getElementById("armor-select-modal")?.classList.contains("visible")
    };

    hideInventoryModal();
    const afterCloseInventory = {
      paused: !!paused,
      inventoryVisible: !!document.getElementById("inventory-modal")?.classList.contains("visible"),
      armorVisible: !!document.getElementById("armor-select-modal")?.classList.contains("visible")
    };

    return { ok: true, afterOpen, afterCloseArmor, afterCloseInventory };
  });

  expect(snapshot.ok, snapshot.reason || "modal snapshot failed").toBeTruthy();
  expect(snapshot.afterOpen.paused).toBeTruthy();
  expect(snapshot.afterOpen.inventoryVisible).toBeTruthy();
  expect(snapshot.afterOpen.armorVisible).toBeTruthy();
  expect(snapshot.afterCloseArmor.inventoryVisible).toBeTruthy();
  expect(snapshot.afterCloseArmor.paused).toBeTruthy();
  expect(snapshot.afterCloseInventory.paused).toBeFalsy();
});

test("P0 flower decoration should be rooted on ground", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    if (typeof generateBiomeDecorations !== "function") {
      return { ok: false, reason: "generateBiomeDecorations missing" };
    }

    const originalRandom = Math.random;
    Math.random = () => 0.2;
    try {
      decorations = [];
      const biome = {
        id: "forest",
        decorations: { flower: 1 },
        treeTypes: { oak: 1 }
      };
      generateBiomeDecorations(200, groundY, 120, biome);
      const flower = Array.isArray(decorations) ? decorations.find(d => d && d.type === "flower") : null;
      if (!flower) return { ok: false, reason: "flower not generated" };
      return {
        ok: true,
        flowerY: Number(flower.y) || 0,
        flowerH: Number(flower.height) || 0,
        bottom: (Number(flower.y) || 0) + (Number(flower.height) || 0),
        groundY: Number(groundY) || 0
      };
    } finally {
      Math.random = originalRandom;
    }
  });

  expect(result.ok, result.reason || "flower check failed").toBeTruthy();
  expect(Math.abs(result.bottom - result.groundY)).toBeLessThanOrEqual(1);
});
