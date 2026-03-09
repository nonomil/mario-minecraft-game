import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_cave_light_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
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

test("P1 cave lighting runtime expands player vision radius when torch contract increases", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    if (!player) return { ok: false, reason: "player missing" };
    currentBiome = "cave";
    globalThis.getPlayerTorchLightRadius = () => 0;

    const withoutTorch = getPlayerVisionRadiusForBiome("cave");
    const rawDarkness = Number(getBiomeById("cave")?.effects?.darkness) || 0;
    const overlayDarkness = getBiomeDarknessOverlayAlpha(getBiomeById("cave"));

    globalThis.getPlayerTorchLightRadius = () => 220;
    const withTorch = getPlayerVisionRadiusForBiome("cave");

    return { ok: true, withoutTorch, withTorch, rawDarkness, overlayDarkness };
  });

  expect(result.ok, result.reason || "setup failed").toBeTruthy();
  expect(result.withoutTorch).toBe(150);
  expect(result.withTorch).toBeGreaterThan(result.withoutTorch + 120);
  expect(result.overlayDarkness).toBeLessThan(result.rawDarkness);
});

test("P1 cave lighting runtime adds extra light holes for placed torches", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    if (!player) return { ok: false, reason: "player missing" };
    currentBiome = "cave";
    player.x = 260;
    player.y = groundY - (player.height || 40);
    globalThis.getPlayerTorchLightRadius = () => 0;
    if (Array.isArray(torches)) torches.length = 0;
    torches.push({
      x: player.x + 160,
      y: player.y + 18,
      lightRadius: 150,
      remove: false,
      render() {},
      update() {}
    });

    const radii = [];
    const fakeCtx = {
      save() {},
      restore() {},
      fillRect() {},
      beginPath() {},
      arc() {},
      fill() {},
      createRadialGradient(_x0, _y0, _r0, _x1, _y1, r1) {
        radii.push(r1);
        return { addColorStop() {} };
      },
      set fillStyle(_value) {},
      get fillStyle() {
        return "";
      },
      set globalCompositeOperation(_value) {},
      get globalCompositeOperation() {
        return "source-over";
      }
    };

    renderBiomePostEffects(fakeCtx, cameraX);
    return { ok: true, radii };
  });

  expect(result.ok, result.reason || "setup failed").toBeTruthy();
  expect(result.radii.length).toBeGreaterThanOrEqual(2);
  expect(result.radii.some((radius) => radius >= 175)).toBeTruthy();
  expect(result.radii.some((radius) => radius >= 145 && radius <= 155)).toBeTruthy();
});

test("P1 cave biome is registered and can be switched to directly", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    const caveBiome = getBiomeById("cave");
    if (!caveBiome || caveBiome.id !== "cave") {
      return { ok: false, reason: "cave biome missing", biomeId: caveBiome?.id || null };
    }

    currentBiome = "forest";
    applyBiomeTransition(caveBiome, Math.max(1200, Number(score) || 0), false);

    return {
      ok: true,
      biome: currentBiome,
      visionRadius: getPlayerVisionRadiusForBiome(currentBiome),
      overlayDarkness: getBiomeDarknessOverlayAlpha(getBiomeById(currentBiome))
    };
  });

  expect(result.ok, result.reason || "cave switch failed").toBeTruthy();
  expect(result.biome).toBe("cave");
  expect(result.visionRadius).toBeGreaterThan(0);
  expect(result.overlayDarkness).toBeGreaterThan(0);
});
