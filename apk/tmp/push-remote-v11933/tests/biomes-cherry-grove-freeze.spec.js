const { test, expect } = require("@playwright/test");

test("cherry_grove: spawning cherry tree does not throw", async ({ page }) => {
  await page.goto("/apk/Game.html", { waitUntil: "load" });
  await page.waitForFunction(() => typeof spawnBiomeDecoration === "function");

  const res = await page.evaluate(() => {
    const orig = Math.random;
    Math.random = () => 0.1; // roll < 0.25 => CherryTree branch
    let err = null;
    const before = decorations.length;
    try {
      spawnBiomeDecoration("cherry_grove", 800, groundY, groundY);
    } catch (e) {
      err = String(e && e.message ? e.message : e);
    } finally {
      Math.random = orig;
    }
    const after = decorations.length;
    const lastType = after > 0 ? decorations[after - 1].type : null;
    return { err, before, after, lastType };
  });

  expect(res.err).toBeNull();
  expect(res.after).toBeGreaterThan(res.before);
  expect(res.lastType).toBe("cherry");
});

test("mushroom_island: spawning giant mushroom does not throw", async ({ page }) => {
  await page.goto("/apk/Game.html", { waitUntil: "load" });
  await page.waitForFunction(() => typeof spawnBiomeDecoration === "function");

  const res = await page.evaluate(() => {
    const orig = Math.random;
    Math.random = () => 0.1; // roll < 0.35 => GiantMushroom branch
    let err = null;
    const before = decorations.length;
    try {
      spawnBiomeDecoration("mushroom_island", 900, groundY, groundY);
    } catch (e) {
      err = String(e && e.message ? e.message : e);
    } finally {
      Math.random = orig;
    }
    const after = decorations.length;
    const last = after > 0 ? decorations[after - 1] : null;
    return { err, before, after, lastType: last ? last.type : null, lastInteractive: last ? !!last.interactive : null };
  });

  expect(res.err).toBeNull();
  expect(res.after).toBeGreaterThan(res.before);
  expect(res.lastType).toBe("giant_mushroom");
  expect(res.lastInteractive).toBe(true);
});

