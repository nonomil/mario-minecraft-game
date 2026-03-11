# MVP Learning Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 以 Hybrid 分支策略把学习事件统一、门禁前微学习、龙蛋成长反馈完整落地，并在每个分支跑通 Playwright 验证后合回主项目。

**Architecture:** 先在 M1 分支建立 Learning Spine，把事件、统计和测试 API 接口稳定下来；再从主线拆出 M2 与 M3 两个依赖 M1 的功能分支，分别插入门禁前微学习与龙蛋成长反馈；最后在主项目执行统一回归与合并提交。

**Tech Stack:** Vanilla JavaScript, HTML5 Canvas, LocalStorage, Playwright, git worktree

---

### Task 1: Write The Design Docs Into The Branch

**Files:**
- Create: `docs/plans/2026-03-11-mvp-learning-integration-design.md`
- Create: `docs/plans/2026-03-11-mvp-learning-integration-implementation-plan.md`

**Step 1: Save the validated design**

- 写入已确认的 Hybrid 方案、M1/M2/M3 模块边界、事件结构、测试策略与合并策略。

**Step 2: Save this implementation plan**

- 把每个分支要修改的文件、测试入口、验证命令和提交点写清楚。

**Step 3: Verify docs are readable**

Run: `python -c "from pathlib import Path; print(Path('docs/plans/2026-03-11-mvp-learning-integration-design.md').read_text(encoding='utf-8')[:120])"`
Expected: 能正常输出中文标题和正文片段，无 `?` 或 `�`

**Step 4: Commit**

```bash
git add docs/plans/2026-03-11-mvp-learning-integration-design.md docs/plans/2026-03-11-mvp-learning-integration-implementation-plan.md
git commit -m "codex: add mvp learning integration design and plan"
```

### Task 2: M1 Learning Spine

**Files:**
- Modify: `src/modules/01-config.js`
- Modify: `src/modules/12-challenges.js`
- Modify: `src/modules/12-village-challenges.js`
- Modify: `src/modules/17-bootstrap.js`
- Test: `tests/e2e/specs/p1-learning-events-core.spec.mjs`

**Step 1: Write the failing Playwright test**

- 新建 `p1-learning-events-core.spec.mjs`
- 覆盖以下行为：
  - `MMWG_TEST_API.getState()` 暴露 `learningState`
  - 记录 `vocab/challenge/village` 事件后，累计统计会增长
  - 最近事件队列保留最新事件

**Step 2: Run test to verify it fails**

Run: `$env:MMWG_E2E_PORT='4176'; npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-learning-events-core.spec.mjs`
Expected: FAIL，提示 `learningState` 或事件记录接口不存在

**Step 3: Implement minimal Learning Spine**

- 在 `01-config.js` 新增：
  - `ensureLearningProgressState()`
  - `recordLearningEvent(payload)`
  - `getLearningStateSnapshot()`
- 在 `12-challenges.js` 成功/失败结算处写入 `challenge` 事件
- 在 `12-village-challenges.js` 结算处写入 `village` 事件
- 在新词首次收集路径写入 `vocab` 事件
- 复用 `showFloatingText()` 做最小反馈
- 在 `17-bootstrap.js` 测试 API 暴露 `learningState`

**Step 4: Run test to verify it passes**

Run: `$env:MMWG_E2E_PORT='4176'; npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-learning-events-core.spec.mjs`
Expected: PASS

**Step 5: Run regression around related flows**

Run: `$env:MMWG_E2E_PORT='4176'; npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p0-village-quiz-stability.spec.mjs tests/e2e/specs/p0-village-wordhouse-trigger.spec.mjs`
Expected: PASS

**Step 6: Commit**

```bash
git add src/modules/01-config.js src/modules/12-challenges.js src/modules/12-village-challenges.js src/modules/17-bootstrap.js tests/e2e/specs/p1-learning-events-core.spec.mjs
git commit -m "feat: add learning event spine for mvp loop"
```

### Task 3: Merge M1 To Main

**Files:**
- No direct file edits expected beyond merge result

**Step 1: Verify M1 branch status**

Run: `git status --short`
Expected: clean worktree

**Step 2: Merge into main**

Run: `git checkout main && git merge --no-ff codex/m1-learning-events`
Expected: merge succeeds without conflicts

**Step 3: Run mainline regression**

Run: `npm run build`
Run: `$env:MMWG_E2E_PORT='4176'; npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-learning-events-core.spec.mjs tests/e2e/specs/p0-village-quiz-stability.spec.mjs`
Expected: PASS

**Step 4: Commit**

- 如果 merge 产生 merge commit，保留 merge commit，不再追加无意义提交。

### Task 4: Create M2 Worktree

**Files:**
- Create worktree: `.worktrees/m2-gate-microlearn`

**Step 1: Create isolated worktree**

Run: `git worktree add .worktrees/m2-gate-microlearn -b codex/m2-gate-microlearn`
Expected: worktree created from latest `main`

**Step 2: Install dependencies**

Run: `npm install`
Expected: dependencies ready

**Step 3: Verify baseline**

Run: `npm run build`
Expected: PASS

### Task 5: M2 Gate Microlearn

**Files:**
- Modify: `src/modules/01-config.js`
- Modify: `src/modules/06-biome.js`
- Modify: `src/modules/12-challenges.js`
- Modify: `src/modules/13-game-loop.js`
- Modify: `src/modules/17-bootstrap.js`
- Test: `tests/e2e/specs/p1-gate-microlearn.spec.mjs`

**Step 1: Write the failing Playwright test**

- 新建 `p1-gate-microlearn.spec.mjs`
- 覆盖以下行为：
  - 触发 `startBiomeGate()` 时先出现 1 题微学习
  - 正确作答后门禁战继续
  - 获得 1 层护盾
  - 首次受击消耗护盾，不掉血

**Step 2: Run test to verify it fails**

Run: `$env:MMWG_E2E_PORT='4177'; npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-gate-microlearn.spec.mjs`
Expected: FAIL，微学习或护盾状态不存在

**Step 3: Implement minimal gate preview flow**

- 在 `06-biome.js` 把门禁进入逻辑拆成：
  - 先请求门禁前微学习
  - 完成后再进入 `bossArena.enterBiomeGate()`
- 在 `12-challenges.js` 增加“单题、6 秒、不自动重试、可回调”的挑战上下文
- 在 `01-config.js` 增加门禁 Buff 状态
- 在 `13-game-loop.js` 的 `damagePlayer()` 中消费护盾
- 在 `17-bootstrap.js` 暴露 `gatePreview` / `gateBuff` 测试状态

**Step 4: Run test to verify it passes**

Run: `$env:MMWG_E2E_PORT='4177'; npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-gate-microlearn.spec.mjs`
Expected: PASS

**Step 5: Run related regression**

Run: `$env:MMWG_E2E_PORT='4177'; npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-debug-page-actions.spec.mjs tests/e2e/specs/p0-village-wordgate-toggle.spec.mjs`
Expected: PASS

**Step 6: Commit**

```bash
git add src/modules/01-config.js src/modules/06-biome.js src/modules/12-challenges.js src/modules/13-game-loop.js src/modules/17-bootstrap.js tests/e2e/specs/p1-gate-microlearn.spec.mjs
git commit -m "feat: add biome gate microlearn shield"
```

### Task 6: Create M3 Worktree

**Files:**
- Create worktree: `.worktrees/m3-dragon-growth`

**Step 1: Create isolated worktree**

Run: `git worktree add .worktrees/m3-dragon-growth -b codex/m3-dragon-growth`
Expected: worktree created from latest `main`

**Step 2: Install dependencies**

Run: `npm install`
Expected: dependencies ready

**Step 3: Verify baseline**

Run: `npm run build`
Expected: PASS

### Task 7: M3 Dragon Growth

**Files:**
- Modify: `src/modules/01-config.js`
- Modify: `src/modules/10-ui.js`
- Modify: `src/modules/12-challenges.js`
- Modify: `src/modules/12-village-challenges.js`
- Modify: `src/modules/17-bootstrap.js`
- Test: `tests/e2e/specs/p1-dragon-growth.spec.mjs`

**Step 1: Write the failing Playwright test**

- 新建 `p1-dragon-growth.spec.mjs`
- 覆盖以下行为：
  - 事件累计会增加龙蛋成长值
  - 跨过阈值后阶段升级
  - HUD 文案同步更新

**Step 2: Run test to verify it fails**

Run: `$env:MMWG_E2E_PORT='4178'; npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-dragon-growth.spec.mjs`
Expected: FAIL，龙蛋成长状态或 HUD 不存在

**Step 3: Implement minimal dragon growth feedback**

- 在 `01-config.js` 增加成长阈值、贡献规则、阶段计算
- 在统一事件写入后累计龙蛋成长值
- 在 `10-ui.js` 创建/刷新轻量 HUD
- 在事件路径中显示 `🐉 龙蛋成长 +X`
- 在 `17-bootstrap.js` 暴露 `dragonEgg` 状态

**Step 4: Run test to verify it passes**

Run: `$env:MMWG_E2E_PORT='4178'; npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-dragon-growth.spec.mjs`
Expected: PASS

**Step 5: Run related regression**

Run: `$env:MMWG_E2E_PORT='4178'; npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-summon-dragon-and-gunpowder.spec.mjs tests/e2e/specs/p1-debug-page-actions.spec.mjs`
Expected: PASS

**Step 6: Commit**

```bash
git add src/modules/01-config.js src/modules/10-ui.js src/modules/12-challenges.js src/modules/12-village-challenges.js src/modules/17-bootstrap.js tests/e2e/specs/p1-dragon-growth.spec.mjs
git commit -m "feat: add dragon growth feedback from learning"
```

### Task 8: Merge M2 And M3 Back To Main

**Files:**
- No direct file edits expected beyond merge result

**Step 1: Merge M2**

Run: `git checkout main && git merge --no-ff codex/m2-gate-microlearn`
Expected: merge succeeds

**Step 2: Merge M3**

Run: `git merge --no-ff codex/m3-dragon-growth`
Expected: merge succeeds

**Step 3: If conflicts appear**

- 停下，逐个文件确认 M1/M2/M3 意图后再解冲突
- 解冲突后立即重跑相关 Playwright

### Task 9: Final Mainline Verification

**Files:**
- Optionally modify: `docs/plan/开发执行/primary-mvp-execution/2026-03-10-小学英语MVP执行记录.md`

**Step 1: Run fresh build**

Run: `npm run build`
Expected: PASS

**Step 2: Run final Playwright suite**

Run: `$env:MMWG_E2E_PORT='4179'; npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-learning-events-core.spec.mjs tests/e2e/specs/p1-gate-microlearn.spec.mjs tests/e2e/specs/p1-dragon-growth.spec.mjs tests/e2e/specs/p0-village-quiz-stability.spec.mjs tests/e2e/specs/p1-summon-dragon-and-gunpowder.spec.mjs tests/e2e/specs/p1-debug-page-actions.spec.mjs`
Expected: PASS

**Step 3: Update execution record if needed**

- 把分支、测试结果、遗留风险补回 `docs/plan/开发执行/primary-mvp-execution/2026-03-10-小学英语MVP执行记录.md`

**Step 4: Final commit**

```bash
git add docs/plan/开发执行/primary-mvp-execution/2026-03-10-小学英语MVP执行记录.md
git commit -m "codex: finalize mvp learning integration rollout"
```
