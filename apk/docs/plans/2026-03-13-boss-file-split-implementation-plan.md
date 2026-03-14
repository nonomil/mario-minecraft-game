# Boss File Split Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `15-entities-boss.js` 拆分为“core + shared + 单 Boss 文件”，保持功能不变并通过 Playwright debug 测试。

**Architecture:** 通过新增模块文件承载基类、共享视觉工具和各 Boss 类，`Game.html` 重新排序 script，保证全局依赖一致；原文件保留最小内容或空壳但不删除。

**Tech Stack:** 原生 JS/Canvas、Playwright E2E。

---

### Task 1: 备份原文件并制造 RED（脚本指向新模块但尚未创建）

**Files:**
- Modify: `Game.html`
- Create: `tmp/backup/15-entities-boss.js.<timestamp>.bak`

**Step 1: Write the failing test**

修改 `Game.html`，用新模块脚本占位替换 `15-entities-boss.js`（此时新模块尚未创建）。  

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "GameDebug controls should expose a working MMDBG API" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL（脚本未找到或 Boss 依赖缺失）

**Step 3: Create backup**

用 Python 复制原文件到 `tmp/backup/15-entities-boss.js.<timestamp>.bak`（UTF-8）。

**Step 4: Commit**

```bash
git add Game.html tmp/backup/15-entities-boss.js.<timestamp>.bak
git commit -m "chore: prepare boss file split backup"
```

---

### Task 2: 拆出 Core + Shared

**Files:**
- Create: `src/modules/15-entities-boss-core.js`
- Create: `src/modules/15-entities-boss-shared.js`
- Modify: `src/modules/15-entities-boss.js`（移除 core/shared 内容）

**Step 1: Write the failing test**

运行同一条 E2E 用例仍应 FAIL（此时还未加入 Boss 类文件）。

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "GameDebug controls should expose a working MMDBG API" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL

**Step 3: Write minimal implementation**

- 将 `BOSS_REGISTRY`、`DEFAULT_BOSS_REWARDS`、`Boss` 基类移入 core
- 将共享视觉函数/常量移入 shared
- 原文件删去已迁移内容

**Step 4: Run test to verify it still fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "GameDebug controls should expose a working MMDBG API" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL（Boss 类尚未迁移）

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss-core.js src/modules/15-entities-boss-shared.js src/modules/15-entities-boss.js
git commit -m "refactor: split boss core and shared modules"
```

---

### Task 3: 拆出各 Boss 类

**Files:**
- Create: `src/modules/15-entities-boss-wither.js`
- Create: `src/modules/15-entities-boss-ghast.js`
- Create: `src/modules/15-entities-boss-blaze.js`
- Create: `src/modules/15-entities-boss-wither-skeleton.js`
- Create: `src/modules/15-entities-boss-warden.js`
- Create: `src/modules/15-entities-boss-evoker.js`
- Modify: `src/modules/15-entities-boss.js`
- Modify: `Game.html`

**Step 1: Write the failing test**

保留 `Game.html` 中新脚本顺序（core + shared + 各 Boss 类），但 Boss 类文件尚未创建 → 仍失败。

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Boss debug spawn smoke: blaze" --config tests/e2e/playwright.config.mjs`  
Expected: FAIL

**Step 3: Write minimal implementation**

- 将每个 Boss 类移入对应文件
- `Game.html` 中按顺序加载
- 原文件删除各 Boss 类实现

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs -g "Boss debug spawn smoke: blaze" --config tests/e2e/playwright.config.mjs`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/15-entities-boss-*.js src/modules/15-entities-boss.js Game.html
git commit -m "refactor: split boss classes into modules"
```

---

### Task 4: 全量验证

**Files:**
- None

**Step 1: Run verification**

```bash
npx playwright test tests/e2e/specs/boss-debug-controls.spec.mjs --config tests/e2e/playwright.config.mjs
npx playwright test tests/e2e/specs/p0-render-path.spec.mjs --config tests/e2e/playwright.config.mjs
npx playwright test tests/e2e/specs/p2-biome-config.spec.mjs --config tests/e2e/playwright.config.mjs
```

Expected: PASS

**Step 2: Commit**

```bash
git commit -m "chore: verify boss file split e2e"
```
