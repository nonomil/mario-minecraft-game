# Release Notes - v1.19.37

## 摘要
本次更新改进了合成台的视觉效果与调试注入机制，修复了乘骑飞龙时的崩溃问题，并同步更新了 Codex 协作规范。

## 变更详情

### 核心功能 (Features)
- **合成台改进**: 优化了合成台模态框的视觉呈现，并引入了调试注入机制，便于开发调试。

### 修复 (Bug Fixes)
- **飞龙乘骑修复**: 解决了在特定情况下从飞龙背部下来时可能导致的程序崩溃，并优化了相关视觉效果。
- **Codex 规范更新**: 更新了 `AGENTS.md` 中的协作约束，提升了插件间协作的稳定性。

## Git 提交记录 (v1.19.36..HEAD)
- `4bb0432`: codex: improve crafting modal + debug injection (docs/plan/人物角色形象优化/2026-03-10-crafting-debug-injection.md)
- `0c3a886`: fix: update codex constraints (AGENTS.md)
- `cd1e240`: fix: dragon dismount crash and visuals
