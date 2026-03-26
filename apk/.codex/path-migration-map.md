# Path Migration Map

本文档用于说明当前仓库从旧路径到 `.codex/` 主入口的迁移关系，帮助核对哪些目录仍然保留为兼容层，哪些目录已经成为默认入口。

| 路径 | 当前角色 | 状态 | 说明 |
| --- | --- | --- | --- |
| `CODEX.md` / `CLAUDE.md` | 顶层入口说明 | 活跃 | 统一指向 `.codex/` |
| `.codex/README.md` | 主说明文档 | 活跃 | 默认入口 |
| `.codex/QUICKSTART.md` | 快速开始文档 | 活跃 | 默认入口 |
| `.codex/项目迁移指南.md` | 迁移说明 | 活跃 | 默认入口 |
| `.codex/workflows/*` | 工作流定义 | 活跃 | 默认入口 |
| `.codex/scripts/*` | 验证与模拟脚本 | 活跃 | 默认入口 |
| `.claude/README.md` | 兼容入口说明 | 兼容 | 桥接到 `.codex/` |
| `.claude/QUICKSTART.md` | 兼容快速上手 | 兼容 | 桥接到 `.codex/` |
| `.claude/安装插件和技能.md` | 兼容迁移文档 | 兼容 | 桥接到 `.codex/` |
| `.claude/workflows/*` | 兼容工作流索引 | 兼容 | 桥接到 `.codex/workflows/*` |
| `.claude/scripts/*.py` | 兼容脚本入口 | 兼容 | 桥接到 `.codex/scripts/*` |
| `.claude/reference/*` | 历史参考资料 | 历史 | 仅用于兼容和追溯 |
| `AI开发-PLan-Program-Debug-Claude和Codex协作/*` | 历史资料目录 | 历史 | 仅用于兼容和追溯 |
| `.claude/settings.local.json` | Claude Code 项目配置 | 保留 | 不参与默认路由 |

## 推荐阅读顺序

- 先看 `.codex/README.md`
- 再看 `.codex/workflows/README.md`
- 最后运行 `.codex/scripts/validate_codex_workflow_modes.py`
