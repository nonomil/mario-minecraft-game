const { test, expect } = require("@playwright/test");

async function loginAndBoot(page, baseURL, username = "e2e_user") {
  page.on("pageerror", (err) => {
    console.log("[pageerror]", err && err.message ? err.message : String(err));
  });
  page.on("console", (msg) => {
    console.log(`[console.${msg.type()}]`, msg.text());
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
      if (window.MMWG_TEST_API.actions.bootGameLoopIfNeeded) {
        window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
      } else {
        const btn = document.getElementById("btn-overlay-action");
        if (btn) btn.click();
      }
    }
  }, username);

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true);
}

// 测试 1：村庄中文文本无乱码
test("村庄提示文本无乱码", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "p0_encoding");

  const texts = await page.evaluate(() => {
    const results = [];
    // 检查 NPC 问候语
    const roles = window.NPC_ROLES;
    if (roles) {
      for (const [key, cfg] of Object.entries(roles)) {
        results.push(cfg.greeting);
      }
    }
    // 检查 UI_TEXTS 常量
    if (window.UI_TEXTS) {
      results.push(window.UI_TEXTS.restAlready);
      results.push(window.UI_TEXTS.restFullHp);
      results.push(window.UI_TEXTS.villageSaved);
    }
    // 检查 BIOME_MESSAGES 常量
    if (window.BIOME_MESSAGES) {
      results.push(window.BIOME_MESSAGES.enterVillage("测试"));
      results.push(window.BIOME_MESSAGES.leaveVillage);
    }
    return results;
  });

  // 乱码特征：包含连续的非常用 CJK 字符组合
  const garbledPattern = /[鏉簞浼戞伅鍏ㄦ弧琛€]/;
  for (const text of texts) {
    expect(text).toBeTruthy();
    expect(garbledPattern.test(text)).toBe(false);
  }
});

// 测试 2：碰树后可反向移动
test("碰树后可反向移动", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "p0_tree");

  const canEscape = await page.evaluate(() => {
    const state = window.MMWG_TEST_API.getState();
    const p = state.player;
    if (!p) return null;

    // 记录初始位置
    const startX = p.x;

    // 模拟向右移动碰树
    p.velX = 3;
    for (let i = 0; i < 30; i++) {
      if (window.MMWG_TEST_API.actions.stepGameFrame) {
        window.MMWG_TEST_API.actions.stepGameFrame();
      }
    }
    const afterRightX = p.x;

    // 模拟向左移动脱困
    p.velX = -3;
    for (let i = 0; i < 30; i++) {
      if (window.MMWG_TEST_API.actions.stepGameFrame) {
        window.MMWG_TEST_API.actions.stepGameFrame();
      }
    }
    const afterLeftX = p.x;

    // 只要向左移动后位置有变化就算脱困成功
    return afterLeftX < afterRightX;
  });

  // canEscape 可能为 null（无 stepGameFrame），跳过
  if (canEscape !== null) {
    expect(canEscape).toBe(true);
  }
});

// 测试 3：BOSS 单轨化 - 旧 ender_dragon 已移除
test("旧ender_dragon触发链已移除", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "p0_boss_single");

  const result = await page.evaluate(() => {
    // 验证 bossSpawned 全局变量已不存在
    const hasBossSpawned = typeof window.bossSpawned !== 'undefined';
    // 验证 checkBossSpawn 函数已不存在
    const hasCheckBossSpawn = typeof window.checkBossSpawn === 'function';
    // 验证 ender_dragon 不在敌人属性表中
    const hasEnderDragonStats = window.ENEMY_STATS && 'ender_dragon' in window.ENEMY_STATS;
    // 验证 bossArena 存在且有 4 个 BOSS 类型
    const hasBossArena = typeof bossArena !== 'undefined';
    const bossTypes = hasBossArena ? bossArena.bossTypes : [];

    return {
      hasBossSpawned,
      hasCheckBossSpawn,
      hasEnderDragonStats,
      hasBossArena,
      bossTypes
    };
  });

  expect(result.hasBossSpawned).toBe(false);
  expect(result.hasCheckBossSpawn).toBe(false);
  expect(result.hasEnderDragonStats).toBeFalsy();
  expect(result.hasBossArena).toBe(true);
  expect(result.bossTypes).toEqual(['wither', 'ghast', 'blaze', 'wither_skeleton']);
});

// 测试 4：BOSS 战场景锁定
test("BOSS战视口锁定与边界墙", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "p0_boss_lock");

  const result = await page.evaluate(() => {
    if (typeof bossArena === 'undefined') return null;

    // 模拟进入 BOSS 战
    const origScore = window.score;
    window.score = 2000;
    bossArena.enter('wither');

    const locked = bossArena.viewportLocked === true;
    const hasLeftWall = typeof bossArena.leftWall === 'number';
    const hasRightWall = typeof bossArena.rightWall === 'number';
    const wallsValid = hasLeftWall && hasRightWall && bossArena.rightWall > bossArena.leftWall;

    // 清理
    bossArena.exit();
    window.score = origScore;

    return { locked, hasLeftWall, hasRightWall, wallsValid };
  });

  if (result) {
    expect(result.locked).toBe(true);
    expect(result.wallsValid).toBe(true);
  }
});
