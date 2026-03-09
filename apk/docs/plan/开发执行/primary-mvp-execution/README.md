# 小学英语 MVP 执行包（Worktree）

> worktree 路径：`G:\UserCode\worktrees\mario-minecraft-game_APK_V1.19.8\primary-mvp-execution`
> 分支：`codex/primary-mvp-execution`
> 目标：在隔离 worktree 中推进小学英语主线第一阶段最小闭环实现

---

## 1. 这个目录的用途

这个目录不是产品设计文档目录，而是：

> **真正进入开发执行阶段后的 worktree 实施包。**

它承接的范围只包括当前最高优先级的小学英语主线第一阶段：

1. 学习事件统一
2. BOSS / 门禁战前 `1` 题微学习
3. 龙蛋成长反馈

---

## 2. 当前提供的文档

- `docs/plan/开发执行/primary-mvp-execution/2026-03-10-小学英语MVP实施计划-v1-串行版.md`
- `docs/plan/开发执行/primary-mvp-execution/2026-03-10-小学英语MVP实施计划-v2-批次版.md`
- `docs/plan/开发执行/primary-mvp-execution/2026-03-10-小学英语MVP执行记录.md`

---

## 3. 推荐使用方式

### 如果追求稳

先看：

- `2026-03-10-小学英语MVP实施计划-v1-串行版.md`

适合：

- 一步一步改
- 尽量降低耦合风险
- 每做完一块就回归

### 如果追求效率

再看：

- `2026-03-10-小学英语MVP实施计划-v2-批次版.md`

适合：

- 用批次推进
- 一次做一组“能被玩家感知”的闭环

### 每次动手前后都要更新

- `2026-03-10-小学英语MVP执行记录.md`

这份文档用于：

- 勾选已完成项
- 记录验证结果
- 记录卡点和遗留问题

---

## 4. 当前状态

本 worktree 已完成：

- [x] 新分支创建
- [x] worktree 创建
- [x] 轻量基线构建通过（`npm run build`）
- [ ] Batch 1 代码实施
- [ ] Batch 2 代码实施
- [ ] Batch 3 代码实施

---

## 5. 一句话结论

这个目录就是：

> **把“设计已经成熟”的小学英语主线，真正转换成 step-by-step 可执行开发任务的工作区。**
