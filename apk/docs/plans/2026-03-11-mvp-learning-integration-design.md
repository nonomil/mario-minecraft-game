# MVP Learning Integration Design

**Date:** 2026-03-11

**Goal:** 把“收词 / 普通学习挑战 / 村庄训练 / 门禁前微学习 / 龙蛋成长反馈”串成一条可测试、可分支隔离、可逐步合并的学习主线。

**Confirmed Direction:** 采用 `Hybrid` 组织方式。先在 `codex/m1-learning-events` 上落地学习事件地基，再从主线拆出 `codex/m2-gate-microlearn` 与 `codex/m3-dragon-growth` 并行开发，最后回主项目统一回归。

---

## 1. Existing Context

当前项目已经具备可复用的三块基础：

1. `src/modules/12-challenges.js` 已有普通学习挑战弹层、计时、正误处理与词门解锁逻辑。
2. `src/modules/06-biome.js` + `src/modules/15-entities-boss.js` 已有 Biome Gate 与门禁 BOSS 切换流程。
3. `src/modules/12-village-challenges.js` + `src/modules/18-village.js` 已有村庄题库、奖励与轻量 Buff 基础。

这意味着本次实现不需要新建一套独立系统，而是要在现有流程之间插入一层统一学习编排与最小反馈。

---

## 2. Options Considered

### Option A: 各模块分别加本地状态

- 优点：每个模块改动集中，上手快。
- 缺点：事件语义不统一，M2/M3 需要重复接线，后续统计和测试都容易漂移。

### Option B: 新建独立 `learning-manager` 大模块

- 优点：结构最完整，未来扩展方便。
- 缺点：一次性改动过大，跨模块注入点多，不适合这次 MVP。

### Option C: 在现有全局状态上补一层轻量 Learning Spine

- 优点：最贴合当前项目结构；能复用现有挑战 UI、门禁触发和村庄 Buff；便于用 worktree 分阶段推进。
- 缺点：需要谨慎控制全局状态字段，避免把 MVP 做成半套框架。

**Recommendation:** 采用 Option C。只加一条轻量 Learning Spine，不重构现有玩法骨架。

---

## 3. Branch Layout

### M1: `codex/m1-learning-events`

- 目标：统一学习事件结构，补最小可见反馈，给测试 API 暴露状态。
- 主要文件：
  - `src/modules/01-config.js`
  - `src/modules/12-challenges.js`
  - `src/modules/12-village-challenges.js`
  - `src/modules/17-bootstrap.js`
  - `tests/e2e/specs/`

### M2: `codex/m2-gate-microlearn`

- 目标：Biome Gate 进入前强制 1 题微学习，答对给 1 层开局护盾。
- 主要文件：
  - `src/modules/01-config.js`
  - `src/modules/06-biome.js`
  - `src/modules/12-challenges.js`
  - `src/modules/13-game-loop.js`
  - `src/modules/17-bootstrap.js`
  - `tests/e2e/specs/`

### M3: `codex/m3-dragon-growth`

- 目标：学习结果推动龙蛋成长值与阶段反馈，显示轻量 HUD/浮字。
- 主要文件：
  - `src/modules/01-config.js`
  - `src/modules/10-ui.js`
  - `src/modules/12-challenges.js`
  - `src/modules/12-village-challenges.js`
  - `src/modules/17-bootstrap.js`
  - `tests/e2e/specs/`

---

## 4. M1 Design: Learning Event Spine

### Event Shape

统一事件结构如下：

```js
{
  eventType: "learning",
  source: "vocab" | "challenge" | "village",
  wordKey: string | null,
  themeKey: string | null,
  result: "success" | "partial" | "fail",
  ts: number,
  meta: object
}
```

### State Placement

把学习事件状态放进 `progress.learning`，避免再开一套新的持久化 key。MVP 只保留：

- `events`: 最近事件队列
- `totals`: 各来源累计统计
- `dragonEgg`: 龙蛋成长值与阶段
- `gatePreview`: 门禁前微学习状态

### Event Producers

- `vocab`：首次收集新单词时记录成功事件
- `challenge`：普通学习挑战完成时记录成功/失败事件
- `village`：村庄训练结算时记录成功/partial/失败事件

### Minimal Feedback

M1 不引入新大弹窗，只复用已有轻提示：

- 收词成功：`📘 图鉴 +1`
- 学习挑战成功：`🎓 学习成功`
- 村庄训练完成：`🏘️ 村庄训练 +1`

这些反馈通过统一事件记录函数触发，后续 M3 也可以复用同一路径叠加龙蛋成长提示。

---

## 5. M2 Design: Gate Microlearn

### Trigger Point

真实触发点放在 `startBiomeGate(fromBiomeId, toBiomeId)` 之前，而不是 `13-game-loop.js`。

原因：

- Biome Gate 已在 `06-biome.js` 做好进入判定。
- 在真正进入 BOSS Arena 前插 1 题，最符合“门前微学习”的用户感知。
- 这样不会污染普通 BOSS 战，也不会和村庄/词门逻辑混淆。

### Question Strategy

复用 `12-challenges.js` 已有的 `translate` 题型：

- 题量：1 题
- 时限：6 秒
- 不自动重试
- 答错不扣分、不掉钻石、不再循环补题

### Reward Shape

默认奖励选用“1 层护盾”，理由：

- 对玩家感知最强
- 实现风险最低
- 可直接在 `damagePlayer()` 内消费

护盾规则：

- 只作用于门禁战开局
- 吸收 1 次伤害
- 被触发后立即移除
- 超时自动失效

### Gate Flow

1. 玩家满足群系切换条件
2. 先弹出 1 题微学习
3. 回答完成后进入门禁 BOSS 战
4. 若答对，带着 1 层护盾进入战斗

---

## 6. M3 Design: Dragon Growth

### Contribution Rules

默认成长值贡献：

- `vocab success` → `+2`
- `challenge success` → `+1`
- `village success` → `+3`
- `village partial` → `+1`
- 失败事件默认 `+0`

### Stage Thresholds

- Stage 1: `20`
- Stage 2: `50`
- Stage 3: `100`

MVP 只做阶段反馈，不做完整成长树或新技能树。

### Player Feedback

M3 的反馈保持轻量：

- 浮字：`🐉 龙蛋成长 +X`
- 阶段切换：Toast + HUD 文案更新
- HUD：右上角或现有 HUD 附近增加一个小状态块，显示当前阶段与进度

### Non-Goals

- 不改变现有龙蛋消耗品基础行为
- 不重做召唤龙/骑龙系统
- 不新增独立龙蛋背包、养成界面、动画树

---

## 7. Testing Strategy

每个阶段都要求：

1. 先补对应 Playwright 回归测试
2. 先看测试失败，再写实现
3. 每个分支完成后运行该分支的新测试 + 相关旧测试
4. 合并回主项目后跑一轮总回归

计划中的关键测试：

- M1：学习事件写入、统计暴露、轻反馈可见
- M2：门禁前 1 题微学习、答对得护盾、护盾可消费
- M3：成长值累计、阶段升级、HUD 文案更新

---

## 8. Merge Strategy

1. 在 `codex/m1-learning-events` 完成设计文档、实施计划、M1 代码、测试、提交
2. 合并 `codex/m1-learning-events` 到 `main`
3. 从最新 `main` 分出 `codex/m2-gate-microlearn`
4. 从最新 `main` 分出 `codex/m3-dragon-growth`
5. 分别测试、提交、合并
6. 回主项目运行最终构建和 Playwright 回归

---

## 9. Key Risks And Guards

- `06-biome.js` / `15-entities-boss.js` 是高耦合区，M2 只插入“前置一道题 + 继续门禁”这一个动作，不改门禁主状态机。
- `12-challenges.js` 现有错误分支会自动重试，M2 必须允许“单题结算后直接继续”，避免卡住门禁流程。
- `progress` 已承载多种存档数据，Learning Spine 只新增嵌套字段，不改旧字段语义。
- 参考 `tasks/lessons.md`，每次合并后必须做语法/构建/Playwright 回归，避免 worktree 合并引入隐藏错误。
