# .codex 目录结构与工作流指南

本目录是当前仓库的 **Codex 主入口**。

> 当前默认模式：**Codex 主导，Claude Code 辅助**。
> 工作流、脚本、模板、项目内技能资料统一以 `.codex/` 为准。
> `.claude/` 仅保留 Claude Code 项目级兼容配置、历史参考和旧路径桥接。

---

## 当前入口

- 主说明：`.codex/README.md`
- 快速上手：`.codex/QUICKSTART.md`
- 迁移说明：`.codex/项目迁移指南.md`
- 工作流索引：`.codex/workflows/README.md`
- 脚本索引：`.codex/scripts/README.md`
- 模板索引：`.codex/templates/README.md`
- 路径迁移表：`.codex/path-migration-map.md`

## 目录职责

- `.codex/workflows/`：默认工作流文档
- `.codex/scripts/`：Codex 主流程脚本与验证器
- `.codex/templates/`：计划、扫描、并行影响范围模板
- `.codex/skills/`：项目内技能资料与结构化扫描资源

## 与 `.claude/` 的关系

- `.claude/reference/`：保留历史参考资料
- `.claude/settings.local.json`：保留 Claude Code 项目级兼容配置
- `.claude/workflows/`、`.claude/scripts/`：仅保留旧路径桥接

## 推荐验证

```bash
python .codex/scripts/audit_active_docs_terms.py
python .codex/scripts/validate_doc_call_graph.py
python .codex/scripts/validate_codex_workflow_modes.py
```
