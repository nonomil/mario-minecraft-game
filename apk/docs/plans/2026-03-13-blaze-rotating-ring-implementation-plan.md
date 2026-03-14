# Blaze Rotating Ring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在烈焰人战斗中实现“旋转火焰阵 + 移动安全区 + 惩罚窗口”，并提供可控调试与 E2E 验证。

**Architecture:** 在 `BlazeBoss` 内新增环形技能状态机（telegraph/active/punish/cooldown）与可配置参数，渲染层负责预警与旋转环可读性。Debug 页面提供可控开关与参数注入，并在 `MMDBG.getState()` 输出 ring 状态与参数快照用于测试。

**Tech Stack:** 原生 JS/Canvas 游戏逻辑，Playwright E2E（`tests/e2e`）。

---

### Task 1: 添加 Blaze 环形技能的调试与测试入口（先失败）

**Files:**
- Modify: `tests/e2e/specs/boss-debug-controls.spec.mjs`
- Modify: `tests/debug-pages/GameDebug.html`

**Step 1: Write the failing test**

```javascript
test('Blaze rotating ring debug flow should expose ring state and config', async ({ page }) => {
  await page.goto('/tests/debug-pages/GameDebug.html');
  await page.waitForFunction(() => window.MMDBG && window.MMDBG.ready && window.MMDBG.ready());
  await page.evaluate(() => window.MMDBG.spawnBoss('blaze'));
  await page.evaluate(() => window.MMDBG.setBlazeRingConfig({ enabled: true, speed: 0.12, gapSize: 1.2 }));
  await page.evaluate(() => window.MMDBG.forceBlazeRing());

  await page.waitForFunction(() => {
    const state = window.MMDBG.getState();
    return state && state.bossId === 'blaze' && state.bossRingState === 'telegraph';
  });

  const snapshot = await page.evaluate(() => window.MMDBG.getState());
  expect(snapshot.bossRingSpeed).toBeCloseTo(0.12, 2);
  expect(snapshot.bossRingGapSize).toBeCloseTo(1.2, 2);
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Blaze rotating ring debug flow" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL（`setBlazeRingConfig`/`forceBlazeRing` 不存在或 `bossRingState` 不输出）

**Step 3: Write minimal implementation**

- 在 `tests/debug-pages/GameDebug.html` 中新增：
  - `window.MMDBG.setBlazeRingConfig({ enabled, speed, gapSize })`
  - `window.MMDBG.forceBlazeRing()`（先只设置 boss 标记，等待后续实现）
  - `getState()` 返回 `bossRingState`、`bossRingSpeed`、`bossRingGapSize`

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Blaze rotating ring debug flow" --config tests/e2e/playwright.config.mjs`  
Expected: PASS（字段存在且可读）

**Step 5: Commit**

```bash
git add tests/e2e/specs/boss-debug-controls.spec.mjs tests/debug-pages/GameDebug.html
git commit -m "test: add blaze ring debug flow coverage"
```

---

### Task 2: 在 BlazeBoss 中加入环形技能状态机与配置

**Files:**
- Modify: `src/modules/15-entities-boss.js`

**Step 1: Write the failing test**

扩展上一条测试，验证 `forceBlazeRing()` 后 `bossRingState` 会在 1 秒内从 `telegraph` 进入 `active`。  
Expected: FAIL（状态不会推进）

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Blaze rotating ring debug flow" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL（状态未变化）

**Step 3: Write minimal implementation**

- 在 `BlazeBoss` 新增字段（避免魔数，集中常量）：
  - `ringEnabled`, `ringState`, `ringTimer`
  - `ringGapSize`, `ringSpeed`, `ringInnerRadius`, `ringOuterRadius`
  - `ringDamageCooldown`, `ringDamageTimer`
- 增加状态推进逻辑（`telegraph -> active -> punish -> cooldown`）
- 支持 `forceBlazeRing()` 触发 `telegraph`

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Blaze rotating ring debug flow" --config tests/e2e/playwright.config.mjs`  
Expected: PASS（状态推进）

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "feat: add blaze ring state machine"
```

---

### Task 3: 旋转环伤害判定与惩罚窗口

**Files:**
- Modify: `src/modules/15-entities-boss.js`

**Step 1: Write the failing test**

在 Playwright 里将玩家位置置于“环形带内且不在缺口”，验证 `bossRingState === active` 时玩家 HP 下降；  
然后将玩家位置置于缺口，验证不受伤。  
Expected: FAIL（无判定或不区分缺口）

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Blaze rotating ring damage" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL

**Step 3: Write minimal implementation**

- 添加环形判定函数（角度与半径双条件）
- 添加命中冷却，避免连续帧叠伤
- `punish` 期间降低烈焰人移动或提高承伤（提供明确反击窗口）

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Blaze rotating ring damage" --config tests/e2e/playwright.config.mjs`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "feat: add blaze ring damage and punish window"
```

---

### Task 4: 旋转环渲染与可读性增强

**Files:**
- Modify: `src/modules/15-entities-boss.js`

**Step 1: Write the failing test**

添加一条 E2E 截图对比：`telegraph` 与 `active` 画面像素差异明显（环体与缺口可见）。  
Expected: FAIL（缺少渲染/视觉差异）

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Blaze rotating ring visual" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL

**Step 3: Write minimal implementation**

- `telegraph`：环外圈半透明 + 缺口亮弧
- `active`：旋转环 + 缺口可见
- `punish`：短暂闪白或“破绽”浮字

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Blaze rotating ring visual" --config tests/e2e/playwright.config.mjs`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss.js tests/e2e/specs/boss-debug-controls.spec.mjs
git commit -m "feat: add blaze ring telegraph visuals"
```

---

### Task 5: 文档与调试说明补充

**Files:**
- Modify: `tests/e2e/README.md`
- Modify: `docs/plans/2026-03-13-blaze-rotating-ring-design.md`

**Step 1: Write the failing test**

不需要测试（文档改动）。

**Step 2: Update docs**

- README 增加 ring debug 说明和 E2E grep 示例
- 设计文档补充“调试接口字段与含义”

**Step 3: Commit**

```bash
git add tests/e2e/README.md docs/plans/2026-03-13-blaze-rotating-ring-design.md
git commit -m "docs: document blaze ring debug usage"
```
