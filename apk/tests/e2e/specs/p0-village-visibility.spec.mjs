import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_village_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof window.paused !== "undefined") window.paused = false;
    if (typeof window.pausedByModal !== "undefined") window.pausedByModal = false;
    if (typeof window.setOverlay === "function") window.setOverlay(false);
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

async function spawnVillageAndFocus(page) {
  return page.evaluate(() => {
    if (typeof bootGameLoopIfNeeded === "function") bootGameLoopIfNeeded();
    if (typeof resumeGameFromOverlay === "function") resumeGameFromOverlay();
    if (typeof setOverlay === "function") setOverlay(false);
    if (typeof paused !== "undefined") paused = false;
    if (typeof pausedByModal !== "undefined") pausedByModal = false;

    if (typeof settings !== "undefined" && settings) settings.villageEnabled = true;
    const interval = Number(villageConfig?.spawnScoreInterval) || 500;
    const targetScore = Math.max(500, interval);

    // Use large world coordinates to catch camera-offset rendering regressions.
    if (typeof player === "undefined" || !player) return { ok: false, reason: "player missing" };
    player.x = 4000;
    score = targetScore;
    runBestScore = Math.max(Number(runBestScore) || 0, targetScore);
    currentBiome = "forest";
    cameraX = Math.max(0, player.x - (Number(cameraOffsetX) || 300));

    if (Array.isArray(activeVillages)) activeVillages.length = 0;
    if (villageSpawnedForScore && typeof villageSpawnedForScore === "object") {
      for (const k in villageSpawnedForScore) delete villageSpawnedForScore[k];
    }

    if (typeof maybeSpawnVillage !== "function") return { ok: false, reason: "maybeSpawnVillage missing" };
    maybeSpawnVillage(targetScore, player.x);

    const village = Array.isArray(activeVillages) ? activeVillages[0] : null;
    if (!village) return { ok: false, reason: "no village spawned" };

    // Move camera to village area so it must be visible on canvas.
    player.x = village.x + 10;
    cameraX = Math.max(0, player.x - (Number(cameraOffsetX) || 300));

    return {
      ok: true,
      villageX: Number(village.x) || 0,
      villageWidth: Number(village.width) || 0,
      cameraX: Number(cameraX) || 0
    };
  });
}

async function probeVillagePixels(page) {
  return page.evaluate(async () => {
    const village = Array.isArray(activeVillages) ? activeVillages[0] : null;
    if (!village) return { ok: false, reason: "village missing for probe" };
    const building = Array.isArray(village.buildings) ? village.buildings[0] : null;
    if (!building) return { ok: false, reason: "village building missing" };

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    if (!ctx || !canvas) return { ok: false, reason: "canvas missing" };

    const points = [
      {
        sx: Math.round((Number(building.x) || 0) + (Number(building.w) || 80) * 0.5 - (Number(cameraX) || 0)),
        sy: Math.round((Number(groundY) || 530) - (Number(building.h) || 60) * 0.5)
      },
      {
        sx: Math.round((Number(building.x) || 0) + 12 - (Number(cameraX) || 0)),
        sy: Math.round((Number(groundY) || 530) - (Number(building.h) || 60) + 12)
      },
      {
        sx: Math.round((Number(building.x) || 0) + (Number(building.w) || 80) - 12 - (Number(cameraX) || 0)),
        sy: Math.round((Number(groundY) || 530) - (Number(building.h) || 60) + 12)
      }
    ];

    for (const p of points) {
      if (p.sx < 0 || p.sx >= canvas.width || p.sy < 0 || p.sy >= canvas.height) {
        return {
          ok: false,
          reason: "probe point out of canvas",
          sample: { sx: p.sx, sy: p.sy, width: canvas.width, height: canvas.height }
        };
      }
    }

    const readPixel = ({ sx, sy }) => {
      const px = ctx.getImageData(sx, sy, 1, 1).data;
      return [px[0], px[1], px[2], px[3]];
    };

    const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => resolve()));

    const originalEnabled = settings?.villageEnabled;
    if (settings) settings.villageEnabled = true;
    await nextFrame();
    const withVillage = points.map(readPixel);

    if (settings) settings.villageEnabled = false;
    await nextFrame();
    const withoutVillage = points.map(readPixel);

    if (settings) settings.villageEnabled = originalEnabled;
    await nextFrame();

    const deltas = withVillage.map((rgba, i) => {
      const b = withoutVillage[i];
      const dr = Math.abs(rgba[0] - b[0]);
      const dg = Math.abs(rgba[1] - b[1]);
      const db = Math.abs(rgba[2] - b[2]);
      const da = Math.abs(rgba[3] - b[3]);
      return dr + dg + db + da;
    });

    const maxDelta = Math.max(...deltas);
    const looksLikeVillageWall = maxDelta >= 80;

    return {
      ok: true,
      looksLikeVillageWall,
      sample: {
        points,
        withVillage,
        withoutVillage,
        deltas,
        maxDelta
      },
      village: { x: village.x, width: village.width },
      cameraX
    };
  });
}

async function probeVillagePixelsLegacy(page) {
  return page.evaluate(() => {
    const village = Array.isArray(activeVillages) ? activeVillages[0] : null;
    if (!village) return { ok: false, reason: "village missing for probe" };
    const building = Array.isArray(village.buildings) ? village.buildings[0] : null;
    if (!building) return { ok: false, reason: "village building missing" };

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    if (!ctx || !canvas) return { ok: false, reason: "canvas missing" };

    const sx = Math.round((Number(building.x) || 0) + 15 - (Number(cameraX) || 0));
    const sy = Math.round((Number(groundY) || 530) - (Number(building.h) || 60) + 15);
    const inBounds = sx >= 0 && sx < canvas.width && sy >= 0 && sy < canvas.height;
    if (!inBounds) {
      return {
        ok: false,
        reason: "probe point out of canvas",
        sample: { sx, sy, width: canvas.width, height: canvas.height }
      };
    }

    const pixel = ctx.getImageData(sx, sy, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const a = pixel[3];

    // Forest village wall colors roughly: #6B4226 or #B8945A
    const looksLikeVillageWall =
      a > 0 &&
      r >= 90 && r <= 210 &&
      g >= 50 && g <= 170 &&
      b >= 20 && b <= 130;

    return {
      ok: true,
      looksLikeVillageWall,
      sample: { sx, sy, rgba: [r, g, b, a] },
      village: { x: village.x, width: village.width },
      cameraX
    };
  });
}

test("P0 village should spawn in debug flow", async ({ page }) => {
  await openGameAndBoot(page);
  const result = await spawnVillageAndFocus(page);
  expect(result.ok, result.reason || "spawnVillageAndFocus failed").toBeTruthy();
  expect(result.villageWidth).toBeGreaterThan(0);
});

test("P0 village should be visible on canvas (pixel probe + screenshot proof)", async ({ page }) => {
  await openGameAndBoot(page);
  const spawn = await spawnVillageAndFocus(page);
  expect(spawn.ok, spawn.reason || "spawnVillageAndFocus failed").toBeTruthy();

  // Wait a few frames for render.
  await page.waitForTimeout(600);

  const probe = await probeVillagePixels(page);
  expect(probe.ok, probe.reason || "probeVillagePixels failed").toBeTruthy();
  expect(probe.looksLikeVillageWall, `Unexpected village probe rgba: ${JSON.stringify(probe.sample)}`).toBeTruthy();

  const evidenceDir = path.join(process.cwd(), "test-results", "evidence");
  await fs.mkdir(evidenceDir, { recursive: true });
  const pageShot = path.join(evidenceDir, "village-visible-page.png");
  const canvasShot = path.join(evidenceDir, "village-visible-canvas.png");

  await page.screenshot({ path: pageShot, fullPage: true });
  await page.locator("#gameCanvas").screenshot({ path: canvasShot });
});
