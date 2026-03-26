# .codex 快速上手

## 第一步

- 阅读 `CODEX.md` 明确主流程
- 阅读 `.codex/workflows/README.md` 选择对应工作流
- 默认计划目录统一为 `docs/plans/`

## 第二步

- 需求提出后，由 Codex 负责澄清、计划、编码、验证
- Claude Code 只在需要时作为第二评审或补充能力介入

## 第三步

```bash
python .codex/scripts/validate_codex_workflow_modes.py
```

## 兼容说明

- `.claude/QUICKSTART.md` 仅保留旧路径兼容
- 历史参考文档保留在 `.claude/reference/`
