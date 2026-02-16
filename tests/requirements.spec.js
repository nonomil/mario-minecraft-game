const { test, expect } = require("@playwright/test");

async function loginAndBoot(page, baseURL, username = "e2e_user") {
  page.on("pageerror", (err) => {
    // eslint-disable-next-line no-console
    console.log("[pageerror]", err && err.message ? err.message : String(err));
  });
  page.on("console", (msg) => {
    // eslint-disable-next-line no-console
    console.log(`[console.${msg.type()}]`, msg.text());
  });

  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {}
  });

  await page.goto(`${baseURL}/apk/Game.html`, { waitUntil: "domcontentloaded" });

  // Wait until core test hooks are ready. New bootstrap flow may already enter gameplay.
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

test("需求1: 词库/引擎不崩溃且可加载词库包", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req1");

  const packId = await page.evaluate(() => {
    const packs = window.MMWG_VOCAB_MANIFEST?.packs || [];
    return packs[0]?.id || null;
  });
  expect(packId).toBeTruthy();

  await page.evaluate(async (id) => {
    await window.MMWG_TEST_API.actions.setActiveVocabPack(id);
  }, packId);

  const state = await page.evaluate(() => window.MMWG_TEST_API.getState());
  expect(state.activeVocabPackId).toBe(packId);
  expect(state.wordCount).toBeGreaterThan(0);
});

test("需求2: 切换词库后可清理旧单词道具并继续生成", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req2");

  await page.evaluate(() => {
    // Create at least one in-world word item.
    window.MMWG_TEST_API.actions.spawnWordItemNearPlayer();
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().wordItemsCount > 0);

  await page.evaluate(() => window.MMWG_TEST_API.actions.clearOldWordItems());
  await page.waitForFunction(() => window.MMWG_TEST_API.getState().wordItemsCount === 0);
});

test("需求3: 积分兑换生命(积分复活)扣分并恢复血量/无敌帧", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req3");

  await page.evaluate(() => {
    window.MMWG_TEST_API.setState({ score: 600, playerInvincibleTimer: 0 });
    window.MMWG_TEST_API.actions.reviveWithScore();
  });

  const state = await page.evaluate(() => window.MMWG_TEST_API.getState());
  expect(state.score).toBe(100);
  expect(state.playerHp).toBeGreaterThan(0);
  expect(state.playerInvincibleTimer).toBeGreaterThan(0);
});

test("需求4: 装备系统可穿戴/卸下护甲并同步耐久", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req4");

  await page.evaluate(() => {
    window.MMWG_TEST_API.setState({
      equipment: { armor: null, armorDurability: 0 },
      armorInventory: [{ id: "leather", durability: 80 }],
    });
  });

  const equipped = await page.evaluate(() => window.MMWG_TEST_API.actions.equipArmor("leather"));
  expect(equipped).toBe(true);

  let state = await page.evaluate(() => window.MMWG_TEST_API.getState());
  expect(state.equipment.armor).toBe("leather");
  expect(state.equipment.armorDurability).toBe(80);
  expect(state.armorInventory.length).toBe(0);

  await page.evaluate(() => window.MMWG_TEST_API.actions.unequipArmor());
  state = await page.evaluate(() => window.MMWG_TEST_API.getState());
  expect(state.equipment.armor).toBeNull();
  expect(state.armorInventory.some((a) => a.id === "leather")).toBe(true);
});

test("需求5: 傀儡跟随参数生效(可制造且followDelay为30)", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req5");

  await page.evaluate(() => {
    window.MMWG_TEST_API.setState({ inventory: { iron: 10 } });
    window.MMWG_TEST_API.actions.tryCraft("iron_golem");
  });

  const state = await page.evaluate(() => window.MMWG_TEST_API.getState());
  expect(state.golemCount).toBeGreaterThan(0);
  expect(state.firstGolemFollowDelay).toBe(30);
});

test("需求6: 速度档位可调整并影响移动速度参数", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req6");

  const baseSpeed = await page.evaluate(() => window.MMWG_TEST_API.getState().movementSpeed);
  expect(typeof baseSpeed).toBe("number");

  await page.evaluate(() => {
    window.MMWG_TEST_API.setState({ settings: { movementSpeedLevel: "fast" } });
    window.MMWG_TEST_API.actions.applySpeedSetting();
  });
  const fastSpeed = await page.evaluate(() => window.MMWG_TEST_API.getState().movementSpeed);
  expect(fastSpeed).toBeGreaterThan(baseSpeed);

  await page.evaluate(() => {
    window.MMWG_TEST_API.setState({ settings: { movementSpeedLevel: "slow" } });
    window.MMWG_TEST_API.actions.applySpeedSetting();
  });
  const slowSpeed = await page.evaluate(() => window.MMWG_TEST_API.getState().movementSpeed);
  expect(slowSpeed).toBeLessThan(fastSpeed);
});

test("需求7: 账号系统纯本地存储，存档可写入localStorage", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req7");

  await page.evaluate(() => {
    window.MMWG_TEST_API.setState({ score: 1234, inventory: { diamond: 7 } });
    window.MMWG_TEST_API.actions.saveCurrentProgress();
  });

  const saved = await page.evaluate(() => {
    const id = localStorage.getItem("mmwg_current_account");
    const list = JSON.parse(localStorage.getItem("mmwg_accounts") || "[]");
    const account = list.find((a) => a.id === id);
    return {
      hasId: !!id,
      currentCoins: account?.progress?.currentCoins ?? null,
      currentDiamonds: account?.progress?.currentDiamonds ?? null,
      currentPack: account?.vocabulary?.currentPack ?? null,
    };
  });

  expect(saved.hasId).toBe(true);
  expect(saved.currentCoins).toBe(1234);
  expect(saved.currentDiamonds).toBe(7);
  expect(typeof saved.currentPack).toBe("string");
});

test("需求8: 学习增强-挑战弹窗可打开并可完成关闭", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req8");

  await page.evaluate(() => {
    window.startLearningChallenge({ en: "cat", zh: "mao" }, "choice", "test");
  });

  const modal = page.locator("#challenge-modal");
  await expect(modal).toBeVisible();

  await page.evaluate(() => window.completeLearningChallenge(true));
  await expect(modal).not.toBeVisible();
});

test("需求9: 横屏安全区变化后地面与角色仍在可视区", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    viewport: { width: 915, height: 412 },
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Mobile Safari/537.36",
  });
  const page = await context.newPage();
  await loginAndBoot(page, baseURL, "req9");

  const before = await page.evaluate(() => {
    const inv = document.querySelector(".inventory-bar");
    const invRect = inv ? inv.getBoundingClientRect() : null;
    const playerRef = typeof player !== "undefined" ? player : null;
    return {
      groundY: typeof groundY === "number" ? groundY : null,
      playerBottom: playerRef ? playerRef.y + playerRef.height : null,
      invTop: invRect?.top ?? null,
      canvasHeight: document.getElementById("gameCanvas")?.height ?? null,
    };
  });

  expect(before.groundY).not.toBeNull();
  expect(before.playerBottom).not.toBeNull();
  expect(before.invTop).not.toBeNull();
  expect(before.playerBottom).toBeLessThanOrEqual(before.invTop + 2);

  await page.evaluate(() => {
    document.documentElement.style.setProperty("--safe-top", "20px");
    document.documentElement.style.setProperty("--safe-bottom", "48px");
    window.dispatchEvent(new Event("resize"));
  });
  await page.waitForTimeout(800);

  const after = await page.evaluate(() => {
    const inv = document.querySelector(".inventory-bar");
    const invRect = inv ? inv.getBoundingClientRect() : null;
    const playerRef = typeof player !== "undefined" ? player : null;
    return {
      groundY: typeof groundY === "number" ? groundY : null,
      playerBottom: playerRef ? playerRef.y + playerRef.height : null,
      invTop: invRect?.top ?? null,
      canvasHeight: document.getElementById("gameCanvas")?.height ?? null,
      safeBottom: getComputedStyle(document.documentElement).getPropertyValue("--safe-bottom").trim(),
    };
  });

  expect(after.safeBottom).toBe("48px");
  expect(after.groundY).not.toBeNull();
  expect(after.playerBottom).not.toBeNull();
  expect(after.invTop).not.toBeNull();
  expect(after.playerBottom).toBeLessThanOrEqual(after.invTop + 2);
  expect(after.groundY).toBeLessThan(after.canvasHeight);

  await context.close();
});
