import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "allow" });

test("P0 launcher reset page should clear stale service workers before entering Game.html", async ({ page }) => {
  await page.goto("/Game.html?seed-sw=1", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof navigator.serviceWorker !== "undefined");

  await page.evaluate(async () => {
    const existing = await navigator.serviceWorker.getRegistrations();
    await Promise.all(existing.map((registration) => registration.unregister()));
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    await navigator.serviceWorker.register("/service-worker.js");
    await navigator.serviceWorker.ready;
  });

  await expect.poll(async () => {
    return await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length);
  }).toBeGreaterThan(0);

  await page.goto("/dev-reset.html?target=%2FGame.html%3Flauncher_test%3D1", { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/Game\.html\?launcher_test=1/);

  const state = await page.evaluate(async () => ({
    controller: !!navigator.serviceWorker.controller,
    registrations: (await navigator.serviceWorker.getRegistrations()).length,
    hasNormalizeVocabSelectionId: typeof normalizeVocabSelectionId === "function"
  }));

  expect(state.hasNormalizeVocabSelectionId).toBe(true);
  expect(state.controller).toBe(false);
  expect(state.registrations).toBe(0);
});
