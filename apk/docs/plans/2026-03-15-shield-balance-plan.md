# Shield Balance & Auto-Equip Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement low-cost wooden shields with 2x render size, reduced durability, and auto-equip chaining when a shield breaks.

**Architecture:** Update shield constants and crafting recipe in `13-game-loop.js`, update render geometry in `14-renderer-entities.js`, and add a Playwright test that validates crafting, durability, and auto-reequip behavior.

**Tech Stack:** JavaScript (game modules), Playwright (E2E tests).

---

### Task 1: Add failing shield balance test (TDD)

**Files:**
- Create: `tests/e2e/specs/p1-shield-balance.spec.mjs`

**Step 1: Write the failing test**

```js
import { test, expect } from "@playwright/test";

async function boot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");
  await page.evaluate(async () => {
    const username = `pw_shield_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });
  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
}

test("P1 wooden shield crafting and auto-reequip", async ({ page }) => {
  await boot(page);
  const snapshot = await page.evaluate(() => {
    inventory.stick = 5;
    inventory.iron = 0;
    const crafted = tryCraft("shield");
    return {
      crafted,
      shieldCount: Number(inventory.shield) || 0,
      maxDurability: Number(shieldState.maxDurability) || 0,
      durability: Number(shieldState.durability) || 0
    };
  });

  expect(snapshot.crafted).toBe(true);
  expect(snapshot.shieldCount).toBe(1);
  expect(snapshot.maxDurability).toBe(50);
  expect(snapshot.durability).toBe(50);

  const failed = await page.evaluate(() => {
    inventory.stick = 4;
    inventory.iron = 0;
    const crafted = tryCraft("shield");
    return { crafted, shieldCount: Number(inventory.shield) || 0 };
  });
  expect(failed.crafted).toBe(false);
  expect(failed.shieldCount).toBe(1);

  const afterHit = await page.evaluate(() => {
    inventory.shield = 2;
    shieldState.equipped = true;
    shieldState.maxDurability = 50;
    shieldState.durability = 1;
    damagePlayer(20, 0);
    return {
      shieldCount: Number(inventory.shield) || 0,
      equipped: !!shieldState.equipped,
      durability: Number(shieldState.durability) || 0
    };
  });
  expect(afterHit.shieldCount).toBe(1);
  expect(afterHit.equipped).toBe(true);
  expect(afterHit.durability).toBe(50);
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/p1-shield-balance.spec.mjs --config tests/e2e/playwright.config.mjs`  
Expected: FAIL (crafting/values/auto-reequip not implemented yet).

**Step 3: Commit**

```bash
git add tests/e2e/specs/p1-shield-balance.spec.mjs
git commit -m "test: add shield balance coverage (docs/plans/2026-03-15-shield-balance-plan.md)"
```

---

### Task 2: Implement shield balance + auto-reequip logic

**Files:**
- Modify: `src/modules/13-game-loop.js`

**Step 1: Update shield constants and recipe**

```js
const SHIELD_DAMAGE_REDUCTION = 0.30;
const SHIELD_DURABILITY_COST = 10;
const SHIELD_MAX_DURABILITY = 50;

const RECIPES = {
  // ...
  shield: { stick: 5 },
  // ...
};
```

**Step 2: Auto-reequip on break**

```js
if (shieldEquipped) {
  shieldState.durability = Math.max(0, Number(shieldState.durability) - SHIELD_DURABILITY_COST);
  if (shieldState.durability <= 0) {
    inventory.shield = Math.max(0, (Number(inventory.shield) || 0) - 1);
    if (Number(inventory.shield) > 0) {
      shieldState.equipped = true;
      shieldState.maxDurability = SHIELD_MAX_DURABILITY;
      shieldState.durability = SHIELD_MAX_DURABILITY;
      showToast("🛡️ 盾牌破损，已自动续用");
    } else {
      shieldState.equipped = false;
      showToast("🛡️ 盾牌已损坏");
    }
  }
}
```

**Step 3: HUD 显示数量 + 耐久**

```js
const shieldCount = Math.max(0, Number(inventory.shield) || 0);
const parts = [`盾牌 ${shieldCount} · ${shieldDurability}/${shieldMaxDurability}`];
```

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/specs/p1-shield-balance.spec.mjs --config tests/e2e/playwright.config.mjs`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/13-game-loop.js
git commit -m "feat: balance wooden shield usage (docs/plans/2026-03-15-shield-balance-plan.md)"
```

---

### Task 3: Enlarge hand-held shield render

**Files:**
- Modify: `src/modules/14-renderer-entities.js`

**Step 1: Adjust shield geometry**

```js
function drawSteveShield(x, y, scale, facingRight, palette, pose, shieldEquipped) {
  if (!shieldEquipped) return;
  const sizeScale = 2;
  const shieldW = 8 * sizeScale;
  const shieldH = 11 * sizeScale;
  const shieldX = facingRight ? arm.x - 1 - (shieldW - 8) * 0.5 : arm.x - 3 - (shieldW - 8) * 0.5;
  const shieldY = arm.y + 3 - (shieldH - 11) * 0.5;
  // keep existing draw calls with updated shieldW/shieldH/shieldX/shieldY
}
```

**Step 2: Run render smoke check (optional)**

Run: `npx playwright test tests/e2e/specs/p1-steve-visual-smoke.spec.mjs --config tests/e2e/playwright.config.mjs`  
Expected: PASS.

**Step 3: Commit**

```bash
git add src/modules/14-renderer-entities.js
git commit -m "feat: enlarge shield render (docs/plans/2026-03-15-shield-balance-plan.md)"
```

---

### Task 4: Verification

**Step 1: Run targeted tests**

Run:
- `npx playwright test tests/e2e/specs/p1-shield-balance.spec.mjs --config tests/e2e/playwright.config.mjs`
- `npx playwright test tests/e2e/specs/pinyin-quiz-basic.spec.mjs --config tests/e2e/playwright.config.mjs`

Expected: PASS.

**Step 2: Final commit if needed**

```bash
git status -sb
```
