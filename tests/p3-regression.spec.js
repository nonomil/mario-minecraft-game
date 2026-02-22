const { test, expect } = require("@playwright/test");

/**
 * P3 回归验证：BOSS可见性 + 可打性 + 群系切换平衡
 * 覆盖 P0/P1/P2 所有改动的自动化验证
 */

async function loginAndBoot(page, baseURL, username = "p3_regression_user") {
  page.on("pageerror", (err) => {
    console.log("[pageerror]", err?.message || String(err));
  });

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

// ============================================================
// P0 验证：BOSS渲染不再双重偏移
// ============================================================

test.describe("P0: BOSS渲染可见性", () => {

  test("renderBossSystem 传 camX=0（无双重偏移）", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p0_render");

    const result = await page.evaluate(() => {
      // 检查 renderBossSystem 函数源码是否包含 camX=0
      if (typeof renderBossSystem !== "function") return { exists: false };
      const src = renderBossSystem.toString();
      return {
        exists: true,
        passesZero: src.includes("0)") && !src.includes("cameraX)"),
        source: src.slice(0, 300)
      };
    });

    expect(result.exists).toBe(true);
    expect(result.passesZero).toBe(true);
  });

  test("四个BOSS均可见：render(ctx,0) 不产生 NaN 坐标", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p0_visible");

    const results = await page.evaluate(() => {
      const types = ["wither", "ghast", "blaze", "wither_skeleton"];
      const rows = [];
      for (const t of types) {
        bossArena.enter(t);
        const b = bossArena.boss;
        if (!b) { rows.push({ type: t, ok: false }); bossArena.exit(); continue; }

        // 模拟 render(ctx, 0) 的坐标计算
        const camX = 0;
        const drawX = b.x - camX;
        const drawY = b.y + (b.floatOffset || 0);
        rows.push({
          type: t,
          ok: !isNaN(drawX) && !isNaN(drawY),
          drawX, drawY,
          alive: b.alive,
          hasRender: typeof b.render === "function"
        });
        bossArena.exit();
      }
      return rows;
    });

    expect(results).toHaveLength(4);
    for (const r of results) {
      expect(r.ok).toBe(true);
      expect(r.hasRender).toBe(true);
    }
  });

  test("BOSS弹幕坐标不产生 NaN", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p0_proj");

    const result = await page.evaluate(() => {
      bossArena.enter("wither");
      const b = bossArena.boss;
      if (!b) return null;

      // 手动触发一次攻击产生弹幕
      b.attackTimer = 9999;
      b.update({ x: 400, y: 300, width: 32, height: 48 });

      const projCoords = b.bossProjectiles.map(p => ({
        x: p.x - 0, // camX = 0
        y: p.y,
        valid: !isNaN(p.x) && !isNaN(p.y)
      }));
      bossArena.exit();
      return { count: projCoords.length, allValid: projCoords.every(p => p.valid) };
    });

    expect(result).not.toBeNull();
    expect(result.allValid).toBe(true);
  });
});

// ============================================================
// P1 验证：飞行BOSS可打性兜底 + 竞技场状态重置
// ============================================================

test.describe("P1: 飞行BOSS可打性与竞技场", () => {

  test("飞行BOSS开战自动补给弓箭", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p1_arrow");

    const result = await page.evaluate(() => {
      // 清空弓箭
      inventory.bow = 0;
      inventory.arrow = 0;

      const flyingTypes = ["wither", "ghast", "blaze"];
      const rows = [];
      for (const t of flyingTypes) {
        inventory.bow = 0;
        inventory.arrow = 0;
        bossArena.enter(t);
        rows.push({
          type: t,
          bow: inventory.bow,
          arrow: inventory.arrow,
          hasBow: (inventory.bow || 0) >= 1,
          hasMinArrows: (inventory.arrow || 0) >= 12
        });
        bossArena.exit();
      }
      return rows;
    });

    expect(result).toHaveLength(3);
    for (const r of result) {
      expect(r.hasBow).toBe(true);
      expect(r.hasMinArrows).toBe(true);
    }
  });

  test("非飞行BOSS不补给弓箭", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p1_no_arrow");

    const result = await page.evaluate(() => {
      inventory.bow = 0;
      inventory.arrow = 0;
      bossArena.enter("wither_skeleton");
      const bow = inventory.bow;
      const arrow = inventory.arrow;
      bossArena.exit();
      return { bow, arrow };
    });

    expect(result.bow).toBe(0);
    expect(result.arrow).toBe(0);
  });

  test("竞技场视口锁定与边界墙正确设置", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p1_arena");

    const result = await page.evaluate(() => {
      bossArena.enter("wither");
      const locked = bossArena.viewportLocked;
      const hasWalls = bossArena.leftWall < bossArena.rightWall;
      const wallWidth = bossArena.rightWall - bossArena.leftWall;
      bossArena.exit();
      return { locked, hasWalls, wallWidth };
    });

    expect(result.locked).toBe(true);
    expect(result.hasWalls).toBe(true);
    expect(result.wallWidth).toBeGreaterThan(0);
  });

  test("竞技场退出后状态完全释放", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p1_exit");

    const result = await page.evaluate(() => {
      bossArena.enter("wither");
      bossArena.exit();
      return {
        active: bossArena.active,
        viewportLocked: bossArena.viewportLocked,
        boss: bossArena.boss
      };
    });

    expect(result.active).toBe(false);
    expect(result.viewportLocked).toBe(false);
    expect(result.boss).toBeNull();
  });

  test("initGame 重置 bossArena 全部状态", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p1_reset");

    const result = await page.evaluate(() => {
      bossArena.enter("ghast");
      // 模拟 initGame 重置
      if (typeof initGame === "function") {
        initGame();
      }
      return {
        active: bossArena.active,
        viewportLocked: bossArena.viewportLocked,
        boss: bossArena.boss,
        leftWall: bossArena.leftWall,
        rightWall: bossArena.rightWall
      };
    });

    expect(result.active).toBe(false);
    expect(result.viewportLocked).toBe(false);
    expect(result.boss).toBeNull();
  });

  test("没有箭提示节流不刷屏", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p1_toast");

    const result = await page.evaluate(() => {
      const hasThrottle = typeof showNoArrowToast === "function";
      if (!hasThrottle) return { hasThrottle: false };
      // 连续调用多次，检查节流
      let callCount = 0;
      const origShowToast = window.showToast;
      window.showToast = () => { callCount++; };
      for (let i = 0; i < 10; i++) showNoArrowToast();
      window.showToast = origShowToast;
      return { hasThrottle: true, callCount };
    });

    expect(result.hasThrottle).toBe(true);
    // 10次调用，节流后应该只触发很少次数（理论上1次，因为 gameFrame 不变）
    expect(result.callCount).toBeLessThanOrEqual(2);
  });
});

// ============================================================
// P2 验证：群系切换平衡
// ============================================================

test.describe("P2: 群系切换节奏平衡", () => {

  test("stepScore 已调整为 300", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p2_step");

    const result = await page.evaluate(() => {
      const cfg = typeof getBiomeSwitchConfig === "function" ? getBiomeSwitchConfig() : null;
      return { stepScore: cfg?.stepScore || null };
    });

    expect(result.stepScore).toBe(300);
  });

  test("火山 minStay 已拉长（score>=320, timeSec>=70）", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p2_volcano");

    const result = await page.evaluate(() => {
      const cfg = typeof getBiomeSwitchConfig === "function" ? getBiomeSwitchConfig() : null;
      const volcano = cfg?.minStay?.volcano;
      return {
        score: volcano?.score || 0,
        timeSec: volcano?.timeSec || 0
      };
    });

    expect(result.score).toBeGreaterThanOrEqual(320);
    expect(result.timeSec).toBeGreaterThanOrEqual(70);
  });

  test("地狱 minStay 已拉长（score>=360, timeSec>=75）", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p2_nether");

    const result = await page.evaluate(() => {
      const cfg = typeof getBiomeSwitchConfig === "function" ? getBiomeSwitchConfig() : null;
      const nether = cfg?.minStay?.nether;
      return {
        score: nether?.score || 0,
        timeSec: nether?.timeSec || 0
      };
    });

    expect(result.score).toBeGreaterThanOrEqual(360);
    expect(result.timeSec).toBeGreaterThanOrEqual(75);
  });

  test("canLeaveBiome 在 minStay 未满足时阻止切换", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p2_block");

    const result = await page.evaluate(() => {
      if (typeof canLeaveBiome !== "function") return { hasFn: false };
      // 设置当前群系为 volcano，刚进入
      const prevBiome = currentBiome;
      currentBiome = "volcano";
      biomeEntryScore = score;
      biomeEntryTime = Date.now();
      // 立即检查：应该不允许离开
      const blocked = !canLeaveBiome(score);
      // 恢复
      currentBiome = prevBiome;
      return { hasFn: true, blocked };
    });

    expect(result.hasFn).toBe(true);
    expect(result.blocked).toBe(true);
  });

  test("biomeSwitchStepScore 设置下限为 150", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p2_limit");

    const result = await page.evaluate(() => {
      if (typeof normalizeSettings !== "function") return null;
      // normalizeSettings 接收 raw 参数，返回归一化后的对象
      const normalized = normalizeSettings({ biomeSwitchStepScore: 50 });
      return { corrected: normalized.biomeSwitchStepScore };
    });

    expect(result).not.toBeNull();
    expect(result.corrected).toBeGreaterThanOrEqual(150);
  });

  test("12个群系全部有 minStay 配置", async ({ page, baseURL }) => {
    await loginAndBoot(page, baseURL, "p3_p2_all");

    const result = await page.evaluate(() => {
      const cfg = typeof getBiomeSwitchConfig === "function" ? getBiomeSwitchConfig() : null;
      if (!cfg?.minStay) return null;
      const order = cfg.order || [];
      const missing = order.filter(id => !cfg.minStay[id]);
      return { total: order.length, missing, allHave: missing.length === 0 };
    });

    expect(result).not.toBeNull();
    expect(result.total).toBeGreaterThanOrEqual(12);
    expect(result.allHave).toBe(true);
  });
});

// ============================================================
// P3 综合：BOSS全流程回归
// ============================================================

test.describe("P3: BOSS全流程回归", () => {

  const bossTypes = [
    { type: "wither", name: "凋零", score: 2000 },
    { type: "ghast", name: "恶魂", score: 4000 },
    { type: "blaze", name: "烈焰人", score: 6000 },
    { type: "wither_skeleton", name: "凋零骷髅", score: 8000 }
  ];

  for (const boss of bossTypes) {
    test(`${boss.name}: 触发→可见→可打→结算`, async ({ page, baseURL }) => {
      await loginAndBoot(page, baseURL, `p3_full_${boss.type}`);

      const result = await page.evaluate((cfg) => {
        // 1. 触发
        bossArena.enter(cfg.type);
        const b = bossArena.boss;
        if (!b) return { step: "enter", ok: false };

        // 2. 可见性：render 坐标不为 NaN
        const drawX = b.x - 0; // camX = 0
        const drawY = b.y + (b.floatOffset || 0);
        if (isNaN(drawX) || isNaN(drawY)) return { step: "visible", ok: false };

        // 3. 可打性：有 takeDamage 方法且能扣血
        if (typeof b.takeDamage !== "function") return { step: "damage", ok: false };
        const hpBefore = b.hp;
        b.takeDamage(1);
        const hpAfter = b.hp;
        const damaged = hpAfter < hpBefore;

        // 4. 结算：击杀后 onVictory 触发
        b.hp = 0;
        b.alive = false;
        const scoreBefore = score;
        bossArena.onVictory();
        const scoreAfter = score;
        const rewarded = scoreAfter > scoreBefore;

        bossArena.exit();

        return {
          step: "complete",
          ok: true,
          name: b.name,
          visible: true,
          damaged,
          rewarded,
          viewportReleased: !bossArena.viewportLocked
        };
      }, boss);

      expect(result.ok).toBe(true);
      expect(result.name).toContain(boss.name);
      expect(result.visible).toBe(true);
      expect(result.damaged).toBe(true);
      expect(result.rewarded).toBe(true);
      expect(result.viewportReleased).toBe(true);
    });
  }
});
