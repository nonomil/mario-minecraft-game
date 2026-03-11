import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_steve_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
  await page.waitForFunction(() => {
    try { return typeof player !== "undefined" && !!player; } catch { return false; }
  }, null, { timeout: 30_000 });
}

test("P1 Steve visual smoke should expose the Classic Steve++ palette across core states", async ({ page }) => {
  await openGameAndBoot(page);

  const scenarios = await page.evaluate(() => {
    const toHex = (value) => value.toLowerCase();
    const scanColors = (pixels) => {
      const colors = new Set();
      for (let index = 0; index < pixels.length; index += 4) {
        const alpha = pixels[index + 3];
        if (alpha < 250) continue;
        const r = pixels[index].toString(16).padStart(2, "0");
        const g = pixels[index + 1].toString(16).padStart(2, "0");
        const b = pixels[index + 2].toString(16).padStart(2, "0");
        colors.add(`#${r}${g}${b}`);
      }
      return Array.from(colors);
    };

    const renderSnapshot = (options) => {
      const prevGameFrame = gameFrame;
      const prevPlayer = {
        width: player.width,
        height: player.height,
        velX: player.velX,
        facingRight: player.facingRight,
        isAttacking: player.isAttacking
      };
      const prevShield = {
        equipped: shieldState.equipped,
        durability: shieldState.durability,
        maxDurability: shieldState.maxDurability
      };
      const prevInventoryShield = inventory.shield;
      const prevEquipment = {
        armor: playerEquipment.armor,
        armorDurability: playerEquipment.armorDurability
      };
      const prevBuffs = window.playerBuffs ? JSON.parse(JSON.stringify(window.playerBuffs)) : null;
      const previousFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

      try {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        gameFrame = 24;
        player.width = 52;
        player.height = 104;
        player.velX = options.walking ? 3 : 0;
        player.facingRight = !!options.facingRight;
        player.isAttacking = !!options.attacking;
        shieldState.equipped = !!options.shield;
        shieldState.durability = options.shield ? 100 : 0;
        shieldState.maxDurability = 100;
        inventory.shield = options.shield ? 1 : 0;
        playerEquipment.armor = options.armor || null;
        playerEquipment.armorDurability = options.armor ? 100 : 0;
        if (typeof getPlayerBuffStore === "function") {
          const buffs = getPlayerBuffStore();
          if (options.sunscreen) buffs.sunscreen = { expiresAt: Date.now() + 60_000 };
          else delete buffs.sunscreen;
        }
        drawSteve(48, 18, !!options.facingRight, !!options.attacking);
        return scanColors(ctx.getImageData(0, 0, canvas.width, canvas.height).data).map(toHex);
      } finally {
        ctx.restore();
        ctx.putImageData(previousFrame, 0, 0);
        gameFrame = prevGameFrame;
        player.width = prevPlayer.width;
        player.height = prevPlayer.height;
        player.velX = prevPlayer.velX;
        player.facingRight = prevPlayer.facingRight;
        player.isAttacking = prevPlayer.isAttacking;
        shieldState.equipped = prevShield.equipped;
        shieldState.durability = prevShield.durability;
        shieldState.maxDurability = prevShield.maxDurability;
        inventory.shield = prevInventoryShield;
        playerEquipment.armor = prevEquipment.armor;
        playerEquipment.armorDurability = prevEquipment.armorDurability;
        if (typeof getPlayerBuffStore === "function") {
          const buffs = getPlayerBuffStore();
          Object.keys(buffs).forEach((key) => delete buffs[key]);
          if (prevBuffs) Object.assign(buffs, prevBuffs);
        }
      }
    };

    return {
      facingRight: renderSnapshot({ facingRight: true }),
      facingLeft: renderSnapshot({ facingRight: false }),
      shielded: renderSnapshot({ facingRight: true, shield: true }),
      armored: renderSnapshot({ facingRight: true, armor: "iron" }),
      sunscreen: renderSnapshot({ facingRight: true, sunscreen: true })
    };
  });

  const classicCore = ["#3a281b", "#d4a07a", "#4ea7d9", "#4c4a96", "#d6b35a"];
  for (const color of classicCore) {
    expect(scenarios.facingRight).toContain(color);
    expect(scenarios.facingLeft).toContain(color);
    expect(scenarios.shielded).toContain(color);
    expect(scenarios.armored).toContain(color);
  }

  expect(scenarios.shielded).toContain("#b0bec5");
  expect(scenarios.sunscreen).toContain("#f3d6be");
  expect(scenarios.sunscreen).toContain("#e9f6ff");
});
