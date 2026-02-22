export async function openDebugPage(page) {
  await page.goto("/tests/debug-pages/GameDebug.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMDBG !== "undefined");
  await page.waitForFunction(() => window.MMDBG.ready(), null, { timeout: 30_000 });
  await page.evaluate(() => {
    window.MMDBG.ensureRunning();
    window.MMDBG.setGodMode(true);
  });
}

export async function getDebugState(page) {
  return page.evaluate(() => window.MMDBG.getState());
}

export async function forceBoss(page, bossType) {
  return page.evaluate((boss) => {
    window.MMDBG.ensureRunning();
    const frame = document.getElementById("game");
    const w = frame && frame.contentWindow ? frame.contentWindow : null;
    if (w && w.bossArena && w.bossArena.active && typeof w.bossArena.exit === "function") {
      w.bossArena.exit();
    }
    window.MMDBG.spawnBoss(boss);
    return window.MMDBG.getState();
  }, bossType);
}

