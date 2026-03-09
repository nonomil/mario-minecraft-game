const { test, expect } = require("@playwright/test");

async function loginAndBoot(page, baseURL, username = "p2_visual_user") {
  await page.addInitScript(() => {
    try { localStorage.clear(); } catch {}
  });

  await page.goto(`${baseURL}/apk/Game.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.MMWG_TEST_API && window.MMWG_STORAGE));

  await page.evaluate(async (name) => {
    const state = window.MMWG_TEST_API.getState();
    if (!state.currentAccount) {
      const existing = window.MMWG_STORAGE.getAccountList().find((a) => a.username === name);
      const account = existing || window.MMWG_STORAGE.createAccount(name);
      await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    }
    if (!window.MMWG_TEST_API.getState().startedOnce) {
      window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    }
  }, username);

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true);
}

test("P2: 四个BOSS均可触发且可渲染", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "p2_all_boss");

  const checks = await page.evaluate(() => {
    const types = ["wither", "ghast", "blaze", "wither_skeleton"];
    const nameMap = {
      wither: "凋零",
      ghast: "恶魂",
      blaze: "烈焰人",
      wither_skeleton: "凋零骷髅"
    };
    const rows = [];
    for (const t of types) {
      bossArena.enter(t);
      const b = bossArena.boss;
      rows.push({
        type: t,
        active: bossArena.active,
        nameOk: String(b?.name || "").includes(nameMap[t]),
        hasRender: typeof b?.render === "function",
        hasPhaseChange: typeof b?.onPhaseChange === "function",
        hasCustomProjectileRender: typeof b?.renderProjectile === "function"
      });
      bossArena.exit();
    }
    return rows;
  });

  expect(checks).toHaveLength(4);
  for (const c of checks) {
    expect(c.active).toBe(true);
    expect(c.nameOk).toBe(true);
    expect(c.hasRender).toBe(true);
    expect(c.hasPhaseChange).toBe(true);
  }

  // wither/ghast 应具备自定义弹幕渲染
  const wither = checks.find((c) => c.type === "wither");
  const ghast = checks.find((c) => c.type === "ghast");
  expect(wither?.hasCustomProjectileRender).toBe(true);
  expect(ghast?.hasCustomProjectileRender).toBe(true);
});

test("P2: 统一阶段反馈在不同BOSS上生效", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "p2_phase_feedback");

  const result = await page.evaluate(() => {
    const types = ["ghast", "blaze", "wither_skeleton"];
    const out = [];

    for (const t of types) {
      bossArena.enter(t);
      const b = bossArena.boss;
      if (!b) {
        out.push({ type: t, ok: false });
        continue;
      }

      b.hp = Math.floor(b.maxHp * (b.phaseThresholds?.[0] || 0.6));
      b.updatePhase();

      out.push({
        type: t,
        phase: b.phase,
        invuln: b.phaseInvulnerableTimer,
        flash: bossArena.phaseFlashTimer,
        banner: bossArena.phaseBannerText || ""
      });
      bossArena.exit();
    }

    return out;
  });

  expect(result).toHaveLength(3);
  for (const row of result) {
    expect(row.phase).toBe(2);
    expect(row.invuln).toBeGreaterThan(0);
    expect(row.flash).toBeGreaterThan(0);
    expect(row.banner).toContain("阶段 2");
  }
});
