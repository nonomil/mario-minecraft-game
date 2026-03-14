# BOSS 优化分轮 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 按 Wither Skeleton → Wither → Ghast → Warden → Evoker 的顺序逐个完成优化，并在每个 BOSS 后完成验证与提交。

**Architecture:** 仅在对应 BOSS 模块内实现节奏与机制变化，调试入口放在 `tests/debug-pages/GameDebug.html`，回归验证统一使用 `boss-debug-controls.spec.mjs` 并按 BOSS 粒度追加断言。

**Tech Stack:** 原生 JS/Canvas、Playwright E2E。

---

### Task 1: Wither Skeleton —— 突进冲刺 + 反击窗口 + 调试接口

**Files:**
- Modify: `src/modules/15-entities-boss-wither-skeleton.js`
- Modify: `tests/debug-pages/GameDebug.html`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**

在 `boss-debug-controls.spec.mjs` 增加测试：

```js
test("Wither skeleton dash should telegraph and recover", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "wither_skeleton");
  await setBossPhase(page, 2);
  await page.evaluate(() => window.MMDBG.triggerWitherSkeletonDash());
  await tickGame(page, 10);
  let state = await getDebugState(page);
  expect(state.bossIntentKey).toBe("dash_charge");
  await tickGame(page, 50);
  state = await getDebugState(page);
  expect(state.bossIntentKey).toBe("dash_recover");
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Wither skeleton dash should telegraph and recover" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL（MMDBG 方法或 intent 不存在）

**Step 3: Write minimal implementation**

在 `15-entities-boss-wither-skeleton.js` 添加冲刺状态与后摇：

```js
this.dashState = "idle";
this.dashChargeFrames = 36;
this.dashRecoverFrames = 60;
this.dashCooldown = 0;
```

在 `updateBehavior` 中插入：

```js
if (this.dashState === "charge") { this.setIntent("dash_charge"); ... }
if (this.dashState === "recover") { this.setIntent("dash_recover"); ... }
```

在 `GameDebug.html` 添加：

```js
triggerWitherSkeletonDash() {
  withGame((w) => {
    const boss = w.bossArena?.boss;
    if (boss && typeof boss.startDash === "function") boss.startDash();
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Wither skeleton dash should telegraph and recover" --config tests/e2e/playwright.config.mjs`  
Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e/specs/boss-debug-controls.spec.mjs tests/debug-pages/GameDebug.html src/modules/15-entities-boss-wither-skeleton.js
git commit -m "feat: add wither skeleton dash rhythm (docs/plans/2026-03-14-boss-optimization-rounds.md)"
```

---

### Task 2: Wither —— 护盾期 + 破盾窗口 + 调试接口

**Files:**
- Modify: `src/modules/15-entities-boss-wither.js`
- Modify: `tests/debug-pages/GameDebug.html`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**

```js
test("Wither shield should open a punish window", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "wither");
  await setBossPhase(page, 2);
  await page.evaluate(() => window.MMDBG.triggerWitherShieldBreak());
  const state = await getDebugState(page);
  expect(state.bossIntentKey).toBe("shield_break");
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Wither shield should open a punish window" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL

**Step 3: Write minimal implementation**

在 `15-entities-boss-wither.js` 新增护盾状态：

```js
this.shieldActive = false;
this.shieldBreakTimer = 0;
```

在 `updateBehavior` 中按 Phase 2/3 控制护盾与破盾窗口，并在破盾时：

```js
this.setIntent("shield_break");
this.stunTimer = 120;
```

在 `GameDebug.html` 添加 `triggerWitherShieldBreak()`，强制进入破盾窗口。

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Wither shield should open a punish window" --config tests/e2e/playwright.config.mjs`  
Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e/specs/boss-debug-controls.spec.mjs tests/debug-pages/GameDebug.html src/modules/15-entities-boss-wither.js
git commit -m "feat: add wither shield window (docs/plans/2026-03-14-boss-optimization-rounds.md)"
```

---

### Task 3: Ghast —— 强化反弹硬直 + 安全点节奏

**Files:**
- Modify: `src/modules/15-entities-boss-ghast.js`
- Modify: `tests/debug-pages/GameDebug.html`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**

```js
test("Ghast reflect should enforce a longer stun window", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "ghast");
  await page.evaluate(() => window.MMDBG.triggerGhastReflect());
  const state = await getDebugState(page);
  expect(state.bossIntentKey).toBe("stunned");
  expect(state.bossStunTimer).toBeGreaterThan(90);
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Ghast reflect should enforce a longer stun window" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL

**Step 3: Write minimal implementation**

在 `15-entities-boss-ghast.js` 中：

```js
this.reflectStunDuration = 120;
```

并在 `GameDebug.html` 中新增 `triggerGhastReflect()`，强制触发 `onReflectedHit`。

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Ghast reflect should enforce a longer stun window" --config tests/e2e/playwright.config.mjs`  
Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e/specs/boss-debug-controls.spec.mjs tests/debug-pages/GameDebug.html src/modules/15-entities-boss-ghast.js
git commit -m "feat: tune ghast reflect window (docs/plans/2026-03-14-boss-optimization-rounds.md)"
```

---

### Task 4: Warden —— 声波前摇与打断窗口

**Files:**
- Modify: `src/modules/15-entities-boss-warden.js`
- Modify: `tests/debug-pages/GameDebug.html`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**

```js
test("Warden sonic cast should expose a warning intent", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "warden");
  await page.evaluate(() => window.MMDBG.triggerWardenSonicCast());
  const state = await getDebugState(page);
  expect(state.bossIntentKey).toBe("sonic_warn");
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Warden sonic cast should expose a warning intent" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL

**Step 3: Write minimal implementation**

在 `15-entities-boss-warden.js` 中新增 `sonic_warn` 前摇：

```js
this.sonicWarnFrames = 18;
```

在 `startSonicCast` 里先进入 `sonic_warn`，到点后再 `sonic_cast`；并提供 `triggerWardenSonicCast()` 调试入口。

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Warden sonic cast should expose a warning intent" --config tests/e2e/playwright.config.mjs`  
Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e/specs/boss-debug-controls.spec.mjs tests/debug-pages/GameDebug.html src/modules/15-entities-boss-warden.js
git commit -m "feat: add warden sonic warning (docs/plans/2026-03-14-boss-optimization-rounds.md)"
```

---

### Task 5: Evoker —— 护盾 + 召唤波次 + 输出窗口

**Files:**
- Modify: `src/modules/15-entities-boss-evoker.js`
- Modify: `tests/debug-pages/GameDebug.html`
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`

**Step 1: Write the failing test**

```js
test("Evoker shield window should expose an output intent", async ({ page }) => {
  await openDebugPage(page);
  await forceBoss(page, "evoker");
  await page.evaluate(() => window.MMDBG.triggerEvokerShieldBreak());
  const state = await getDebugState(page);
  expect(state.bossIntentKey).toBe("shield_break");
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Evoker shield window should expose an output intent" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL

**Step 3: Write minimal implementation**

在 `15-entities-boss-evoker.js` 中增加护盾开关与小怪波次；破盾时设置 `shield_break`：

```js
this.shieldActive = false;
this.summonWaveTimer = 0;
```

并提供 `triggerEvokerShieldBreak()` 调试入口。

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Evoker shield window should expose an output intent" --config tests/e2e/playwright.config.mjs`  
Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e/specs/boss-debug-controls.spec.mjs tests/debug-pages/GameDebug.html src/modules/15-entities-boss-evoker.js
git commit -m "feat: add evoker shield wave rhythm (docs/plans/2026-03-14-boss-optimization-rounds.md)"
```
