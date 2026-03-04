# UI 并行 Worktree 计划索引

日期：2026-03-04  
用途：为 UI 优化提供多版本并行开发计划，以及一个可直接执行的总合并计划。

## 文件清单

1. `parallel-plan-v1-conservative.md`
- 3 个 worktree
- 冲突风险最低
- 交付速度中等

2. `parallel-plan-v2-balanced.md`
- 4 个 worktree（推荐）
- 速度与风险平衡

3. `parallel-plan-v3-aggressive.md`
- 5 个 worktree
- 速度最快，协同成本最高

4. `parallel-plan-merged-master.md`
- 合并后的主执行计划
- 默认执行参考

## 使用方式

1. 先阅读 `parallel-plan-merged-master.md`。
2. 人力不足时使用 V1。
3. 同步机制成熟且人力充足时可使用 V3。
4. 任何版本实施前先冻结基线测试结果。
