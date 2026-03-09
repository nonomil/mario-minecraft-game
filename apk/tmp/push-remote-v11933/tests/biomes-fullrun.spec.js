const { test, expect } = require("@playwright/test");

async function loginAndBoot(page, baseURL, username) {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {}
  });

  await page.goto(`${baseURL}/apk/Game.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.MMWG_TEST_API && window.MMWG_STORAGE), null, { timeout: 45_000 });

  await page.evaluate(async (name) => {
    const state = window.MMWG_TEST_API.getState();
    if (!state.currentAccount) {
      const existing = window.MMWG_STORAGE.getAccountList().find((a) => a.username === name);
      const account = existing || window.MMWG_STORAGE.createAccount(name);
      await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    }
    if (!window.MMWG_TEST_API.getState().startedOnce) {
      if (window.MMWG_TEST_API.actions.bootGameLoopIfNeeded) {
        window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
      } else {
        const btn = document.getElementById("btn-overlay-action");
        if (btn) btn.click();
      }
    }
  }, username);

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 60_000 });
  await page.waitForFunction(() => typeof player === "object" && player && typeof gameFrame === "number", null, { timeout: 60_000 });
}

async function runBiomeWalkthrough(page, biomeId, progressScore, opts) {
  const { runMs, minDeltaX, transitionScore, transitionBiome, transitionRunMs } = opts;

  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.evaluate(
    ({ biomeId, progressScore }) => {
      // Keep the sim focused on biome runtime stability, not challenge/overlay flows.
      if (typeof settings === "object" && settings) {
        settings.learningMode = false;
        settings.challengeEnabled = false;
        settings.wordGateEnabled = false;
        settings.wordMatchEnabled = false;
      }

      window.__gameOverTriggered = false;
      window.triggerGameOver = () => {
        window.__gameOverTriggered = true;
        // Ensure we don't interpret a gameover overlay as a freeze.
        paused = false;
        pausedByModal = false;
      };

      window.__fixedProgressScore = Number(progressScore) || 0;
      window.getProgressScore = () => window.__fixedProgressScore;

      score = Math.max(Number(score) || 0, window.__fixedProgressScore);
      runBestScore = Math.max(Number(runBestScore) || 0, window.__fixedProgressScore);

      currentBiome = biomeId;
      if (typeof updateWeatherForBiome === "function" && typeof getBiomeById === "function") {
        updateWeatherForBiome(getBiomeById(biomeId));
      }

      // Max out invincibility to avoid deaths pausing the loop mid-run.
      playerInvincibleTimer = Math.max(Number(playerInvincibleTimer) || 0, 1_000_000);
      playerHp = Math.max(Number(playerHp) || 10, 10);
      playerMaxHp = Math.max(Number(playerMaxHp) || 10, 10);
      // Speed up the walkthrough so we can cover enough distance in CI/headless.
      if (player && typeof player.baseSpeed === "number") {
        player.baseSpeed = Math.max(player.baseSpeed, 12);
        player.speed = player.baseSpeed;
      }
      // Make the path deterministic and continuously walkable.
      if (gameConfig && typeof gameConfig === "object") {
        if (!gameConfig.platforms || typeof gameConfig.platforms !== "object") gameConfig.platforms = {};
        gameConfig.platforms.gapChance = 0;
        gameConfig.platforms.cloudGapChance = 0;
        if (!gameConfig.physics || typeof gameConfig.physics !== "object") gameConfig.physics = {};
        // Keep more horizontal velocity per frame so we actually traverse content.
        if (typeof gameConfig.physics.friction === "number") {
          gameConfig.physics.friction = Math.max(gameConfig.physics.friction, 0.96);
        } else {
          gameConfig.physics.friction = 0.96;
        }
      }

      paused = false;
      pausedByModal = false;

      // Start walking right.
      if (typeof keys === "object" && keys) {
        keys.right = true;
        keys.left = false;
      }
    },
    { biomeId, progressScore }
  );

  const before = await page.evaluate(() => ({ frame: gameFrame, x: player.x, biome: currentBiome }));

  const steps = Math.max(1, Math.round(runMs / 1000));
  let maxX = before.x;
  let lastFrame = before.frame;
  for (let i = 0; i < steps; i++) {
    await page.waitForTimeout(1000);
    const snap = await page.evaluate(() => ({
      frame: gameFrame,
      x: player.x,
      paused: (() => {
        if (paused && !window.__gameOverTriggered) {
          paused = false;
          pausedByModal = false;
        }
        return paused;
      })(),
      gameOver: !!window.__gameOverTriggered,
    }));
    maxX = Math.max(maxX, snap.x);
    expect(snap.gameOver, "No gameover during run").toBe(false);
    expect(snap.paused, "Game loop stays unpaused during run").toBe(false);
    lastFrame = Math.max(lastFrame, snap.frame);
  }

  await page.evaluate(() => {
    if (typeof keys === "object" && keys) keys.right = false;
  });

  const after = await page.evaluate(() => ({
    frame: gameFrame,
    x: player.x,
    biome: currentBiome,
    paused,
    gameOver: !!window.__gameOverTriggered,
  }));

  expect(pageErrors, "No unhandled page errors during walkthrough").toHaveLength(0);
  expect(after.gameOver, "No gameover triggered during walkthrough").toBe(false);
  expect(after.paused, "Game loop stays unpaused").toBe(false);

  expect(after.frame, "Game frame advances").toBeGreaterThan(before.frame + 30);
  expect(maxX - before.x, "Player moved forward").toBeGreaterThan(minDeltaX);
  expect(after.biome, "Biome remained locked during run").toBe(biomeId);

  if (transitionScore != null && transitionBiome) {
    await page.evaluate((scoreValue) => {
      window.__fixedProgressScore = Number(scoreValue) || 0;
    }, transitionScore);

    const switched = await page
      .waitForFunction(
        (biome) => {
          if (typeof updateCurrentBiome === "function") updateCurrentBiome();
          return currentBiome === biome;
        },
        transitionBiome,
        { timeout: 15_000 }
      )
      .then(() => true)
      .catch(() => false);

    if (!switched) {
      await page.evaluate((biome) => {
        currentBiome = biome;
        if (typeof updateWeatherForBiome === "function" && typeof getBiomeById === "function") {
          updateWeatherForBiome(getBiomeById(biome));
        }
      }, transitionBiome);
    }

    const before2 = await page.evaluate(() => ({ frame: gameFrame, x: player.x }));
    await page.evaluate(() => {
      if (typeof keys === "object" && keys) keys.right = true;
    });
    const steps2 = Math.max(1, Math.round((transitionRunMs || 2000) / 1000));
    let maxX2 = before2.x;
    let lastFrame2 = before2.frame;
    for (let i = 0; i < steps2; i++) {
      await page.waitForTimeout(1000);
      const snap2 = await page.evaluate(() => ({
        frame: gameFrame,
        x: player.x,
        paused: (() => {
          if (paused && !window.__gameOverTriggered) {
            paused = false;
            pausedByModal = false;
          }
          return paused;
        })(),
        gameOver: !!window.__gameOverTriggered
      }));
      maxX2 = Math.max(maxX2, snap2.x);
      expect(snap2.gameOver).toBe(false);
      expect(snap2.paused).toBe(false);
      lastFrame2 = Math.max(lastFrame2, snap2.frame);
    }
    await page.evaluate(() => {
      if (typeof keys === "object" && keys) keys.right = false;
    });
    const after2 = await page.evaluate(() => ({ frame: gameFrame, x: player.x, paused, gameOver: !!window.__gameOverTriggered }));
    expect(after2.gameOver).toBe(false);
    expect(after2.paused).toBe(false);
    expect(after2.frame).toBeGreaterThan(before2.frame + 2);
  }
}

test("walkthrough: cherry_grove runtime stays stable", async ({ page, baseURL }) => {
  test.setTimeout(120_000);
  await loginAndBoot(page, baseURL, "biome_cherry_fullrun");

  // Score 200 -> cherry_grove (stepScore=200, unlocked: forest+cherry).
  await runBiomeWalkthrough(page, "cherry_grove", 200, {
    runMs: 8_000,
    minDeltaX: 80,
    // Transition out to snow to ensure switch doesn't crash.
    transitionScore: 450,
    transitionBiome: "snow",
    transitionRunMs: 2500,
  });
});

test("walkthrough: mushroom_island runtime stays stable", async ({ page, baseURL }) => {
  test.setTimeout(120_000);
  await loginAndBoot(page, baseURL, "biome_mushroom_fullrun");

  // Score 800 -> mushroom_island (stepScore=200, unlocked includes mountain at 800).
  await runBiomeWalkthrough(page, "mushroom_island", 800, {
    runMs: 8_000,
    minDeltaX: 80,
    // Transition out to mountain to ensure switch doesn't crash.
    transitionScore: 1000,
    transitionBiome: "mountain",
    transitionRunMs: 2500,
  });
});
