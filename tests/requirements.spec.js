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

test("闇€姹?: 璇嶅簱/寮曟搸涓嶅穿婧冧笖鍙姞杞借瘝搴撳寘", async ({ page, baseURL }) => {
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

test("闇€姹?: 鍒囨崲璇嶅簱鍚庡彲娓呯悊鏃у崟璇嶉亾鍏峰苟缁х画鐢熸垚", async ({ page, baseURL }) => {
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

test("闇€姹?: 瑁呭绯荤粺鍙┛鎴?鍗镐笅鎶ょ敳骞跺悓姝ヨ€愪箙", async ({ page, baseURL }) => {
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

test("闇€姹?: 鍌€鍎¤窡闅忓弬鏁扮敓鏁?鍙埗閫犱笖followDelay涓?0)", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req5");

  await page.evaluate(() => {
    window.MMWG_TEST_API.setState({ inventory: { iron: 10 } });
    window.MMWG_TEST_API.actions.tryCraft("iron_golem");
  });

  const state = await page.evaluate(() => window.MMWG_TEST_API.getState());
  expect(state.golemCount).toBeGreaterThan(0);
  expect(state.firstGolemFollowDelay).toBe(30);
});

test("闇€姹?: 閫熷害妗ｄ綅鍙皟鏁村苟褰卞搷绉诲姩閫熷害鍙傛暟", async ({ page, baseURL }) => {
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

test("闇€姹?: 璐﹀彿绯荤粺绾湰鍦板瓨鍌紝瀛樻。鍙啓鍏ocalStorage", async ({ page, baseURL }) => {
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

test("闇€姹?: 瀛︿範澧炲己-鎸戞垬寮圭獥鍙墦寮€骞跺彲瀹屾垚鍏抽棴", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req8");

  await page.evaluate(() => {
    window.startLearningChallenge({ en: "cat", zh: "mao" }, "choice", "test");
  });

  const modal = page.locator("#challenge-modal");
  await expect(modal).toBeVisible();

  await page.evaluate(() => window.completeLearningChallenge(true));
  await expect(modal).not.toBeVisible();
});

test("闇€姹?: 妯睆瀹夊叏鍖哄彉鍖栧悗鍦伴潰涓庤鑹蹭粛鍦ㄥ彲瑙嗗尯", async ({ browser, baseURL }) => {
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

test("新增需求: 中文朗读默认开启", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req_new_zh_tts");
  const enabled = await page.evaluate(() => {
    const state = window.MMWG_TEST_API.getState();
    return !!state?.settings?.speechZhEnabled;
  });
  expect(enabled).toBe(true);
});

test("新增需求: 宝箱掉落南瓜时同箱附带2个雪块", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req_new_chest_bundle");

  const result = await page.evaluate(() => {
    if (typeof Chest !== "function") return { ok: false, reason: "Chest unavailable" };

    const oldGetLootConfig = getLootConfig;
    const oldPickChestRarity = pickChestRarity;
    const oldPickWeightedLoot = pickWeightedLoot;
    const oldRandom = Math.random;
    const prevPumpkin = Number(inventory?.pumpkin || 0);
    const prevSnow = Number(inventory?.snow_block || 0);

    try {
      getLootConfig = () => ({
        chestRarities: [{ rarity: "common", weight: 1 }],
        chestTables: { common: [{ item: "pumpkin", weight: 1, min: 1, max: 1 }] },
        chestRolls: { twoDropChance: 0, threeDropChance: 0 },
      });
      pickChestRarity = () => "common";
      pickWeightedLoot = () => ({ item: "pumpkin", min: 1, max: 1 });
      Math.random = () => 0.99;

      if (!inventory || typeof inventory !== "object") return { ok: false, reason: "inventory unavailable" };
      inventory.pumpkin = prevPumpkin;
      inventory.snow_block = prevSnow;

      const chest = new Chest(player.x + 30, groundY);
      chest.open();

      return {
        ok: true,
        pumpkinGain: Number(inventory.pumpkin || 0) - prevPumpkin,
        snowGain: Number(inventory.snow_block || 0) - prevSnow,
      };
    } catch (e) {
      return { ok: false, reason: String(e && e.message ? e.message : e) };
    } finally {
      getLootConfig = oldGetLootConfig;
      pickChestRarity = oldPickChestRarity;
      pickWeightedLoot = oldPickWeightedLoot;
      Math.random = oldRandom;
    }
  });

  expect(result.ok).toBe(true);
  expect(result.pumpkinGain).toBeGreaterThanOrEqual(1);
  expect(result.snowGain).toBeGreaterThanOrEqual(2);
});

test("新增需求: 平台侧向碰撞后可反向脱困", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req_new_side_escape");

  const result = await page.evaluate(() => {
    if (typeof update !== "function" || typeof Platform !== "function") {
      return { ok: false, reason: "update/platform unavailable" };
    }

    const backup = {
      x: player.x,
      y: player.y,
      velX: player.velX,
      velY: player.velY,
      grounded: player.grounded,
      jumpCount: player.jumpCount,
      right: !!keys.right,
      left: !!keys.left,
    };

    const testPlatform = new Platform(player.x + player.width - 1, player.y, blockSize, Math.max(blockSize, player.height), "grass");
    platforms.push(testPlatform);

    try {
      player.velX = -3;
      player.velY = 0;
      player.grounded = true;
      keys.left = true;
      keys.right = false;

      const startX = player.x;
      for (let i = 0; i < 5; i++) update();
      const escaped = player.x < startX - 0.5;

      return { ok: true, escaped };
    } catch (e) {
      return { ok: false, reason: String(e && e.message ? e.message : e) };
    } finally {
      const idx = platforms.indexOf(testPlatform);
      if (idx >= 0) platforms.splice(idx, 1);
      player.x = backup.x;
      player.y = backup.y;
      player.velX = backup.velX;
      player.velY = backup.velY;
      player.grounded = backup.grounded;
      player.jumpCount = backup.jumpCount;
      keys.right = backup.right;
      keys.left = backup.left;
    }
  });

  expect(result.ok).toBe(true);
  expect(result.escaped).toBe(true);
});

test("新增需求: 樱花低分阶段不触发中毒提示", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req_new_no_poison_low_score");

  const result = await page.evaluate(() => {
    if (typeof BeeEnemy !== "function") return { ok: false, reason: "BeeEnemy unavailable" };

    const oldShowFloatingText = showFloatingText;
    const oldScore = score;
    const logs = [];
    try {
      score = 100;
      showFloatingText = (text, ...rest) => {
        logs.push(String(text || ""));
        return oldShowFloatingText(text, ...rest);
      };
      const bee = new BeeEnemy(player.x + 10, player.y);
      bee.attackCooldown = 0;
      bee.update(player);
      return {
        ok: true,
        poisonGate: typeof canApplyPoisonEffect === "function" ? canApplyPoisonEffect() : null,
        hasPoisonText: logs.some(t => t.includes("中毒")),
      };
    } catch (e) {
      return { ok: false, reason: String(e && e.message ? e.message : e) };
    } finally {
      showFloatingText = oldShowFloatingText;
      score = oldScore;
    }
  });

  expect(result.ok).toBe(true);
  expect(result.poisonGate).toBe(false);
  expect(result.hasPoisonText).toBe(false);
});

test("新增需求: 村庄休息改为交互触发，不再自动弹窗", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req_new_village_rest_interact");

  const result = await page.evaluate(() => {
    const oldVillages = Array.isArray(activeVillages) ? [...activeVillages] : [];
    const oldScore = score;
    try {
      score = 500;
      activeVillages = [{
        id: 999,
        x: player.x - 40,
        width: 220,
        biomeId: "forest",
        style: { buildingColors: { wall: "#8B6914", roof: "#2E7D32", door: "#5D4037" }, groundColor: "#6D4C41" },
        buildings: [{ type: "bed_house", x: player.x - 10, w: 80, h: 60 }],
        npcs: [],
        decorations: [],
        visited: false,
        restUsed: false,
        questCompleted: false,
        saved: false
      }];

      updateVillages();
      return {
        hasRestPromptEl: !!document.getElementById("rest-prompt"),
        promptVisible: typeof restPromptVisible !== "undefined" ? !!restPromptVisible : null
      };
    } finally {
      activeVillages = oldVillages;
      score = oldScore;
    }
  });

  expect(result.hasRestPromptEl).toBe(false);
  expect(result.promptVisible).toBe(false);
});

test("新增需求: 词组打乱题保留空格并使用phrase样式", async ({ page, baseURL }) => {
  await loginAndBoot(page, baseURL, "req_new_phrase_unscramble");

  const result = await page.evaluate(() => {
    const challenge = generateUnscrambleChallenge({ en: "look after", zh: "照顾" });
    if (!challenge) return { ok: false };
    return {
      ok: true,
      hasPhraseClass: String(challenge.questionHtml || "").includes("challenge-fill-word phrase"),
      hasSpaceInOption: Array.isArray(challenge.options) && challenge.options.some(opt => String(opt?.text || "").includes(" ")),
      answerHasSpace: String(challenge.answer || "").includes(" ")
    };
  });

  expect(result.ok).toBe(true);
  expect(result.hasPhraseClass).toBe(true);
  expect(result.hasSpaceInOption).toBe(true);
  expect(result.answerHasSpace).toBe(true);
});

