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



export async function setBossPhase(page, phase) {
  return page.evaluate((value) => {
    window.MMDBG.setBossPhase(value);
    return window.MMDBG.getState();
  }, phase);
}

export async function setBossHpRatio(page, ratio) {
  return page.evaluate((value) => {
    window.MMDBG.setBossHpRatio(value);
    return window.MMDBG.getState();
  }, ratio);
}

export async function setBossState(page, state) {
  return page.evaluate((value) => {
    window.MMDBG.setBossState(value);
    return window.MMDBG.getState();
  }, state);
}

export async function tickGame(page, frames = 1) {
  return page.evaluate((value) => {
    window.MMDBG.tick(value);
    return window.MMDBG.getState();
  }, frames);
}
