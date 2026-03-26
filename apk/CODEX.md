# Codex 主导协作规范（主入口）

> 生效日期：2026-03-06  
> 本文件定义本项目默认协作模式：**Codex 主控，Claude Code 辅助**。

---

## 0. 加载说明（重要）

- `AGENTS.md` 是 Codex 的项目级执行约束入口
- `CODEX.md` 默认作为人类可读主规范，不保证自动加载
- 若需自动纳入 Codex 指令，请在 `~/.codex/config.toml` 配置：
  - `project_doc_fallback_filenames = ["CODEX.md"]`

---

## 1. 角色定义（默认）

- **Codex（主控）**：需求澄清、方案设计、代码实现、验证、代码审查、交付总结
- **Claude Code（辅助）**：作为被 Codex 调用的能力节点（MCP Server/子能力），用于补充分析、交叉验证和特定工具能力
- **冲突裁决**：若文档描述冲突，以本文件为准

---

## 2. 默认执行顺序

1. Codex 读取需求并复述
2. Codex 判断复杂度并选择工作流
3. Codex 主动实现（必要时调用 Claude Code）
4. Codex 完成验证与审查结论
5. Codex 输出可执行结果与下一步建议

---

## 3. Codex 调用 Claude Code

推荐通过 MCP 方式将 Claude Code 作为可调用能力挂到 Codex：

```toml
[mcp_servers.claude]
command = "claude"
args = ["mcp", "serve"]
```

Windows 机器如果 `claude` 不在 PATH，必须改为当前环境中实际可执行的 `claude.exe` 绝对路径。
注意：`C:\Users\Administrator\.claude\` 通常是 Claude Code 的配置目录，不是可执行文件目录。
应先确认 `claude.exe` 的真实安装位置，再写入配置，例如：

```toml
[mcp_servers.claude]
command = "D:\\path\\to\\claude.exe"
args = ["mcp", "serve"]
```

调用原则：

- Codex 优先完成主流程，不将决策权外包
- 仅在需要补充能力时调用 Claude Code
- 调用前明确 Scope、Constraints、Acceptance

### Linus 三问（强制自检）

在进入实现、重构、修复和审查结论前，Codex 必须先回答这三问：

1. 这是真实问题还是想象的问题？
2. 有没有更简单的做法？
3. 会不会破坏现有功能或向后兼容性？

只有三问都回答清楚，才进入下一步执行。

---

## 4. 兼容旧文档约定

为兼容历史 `.claude/workflows/codex-workflow-*.md` 文档，临时采用以下映射：

- 文档中的“由 Claude Code 担任主导”统一解释为“Codex 主导”
- 文档中的“调用 Codex”统一解释为“Codex 直接执行，必要时调用 Claude Code”
- 若旧文档未更新且与本文件冲突，按本文件执行

---

## 5. 初始化目标

- 建立 Codex 主导的入口与路由
- 保留历史文档作为参考，不删除、不重命名
- 后续增量迭代集中到 `.codex/workflows/` 与本文件

---
---
## 6. 活动入口与历史资料

- 默认目录索引：`.codex/README.md`
- 默认工作流索引：`.codex/workflows/README.md`
- 默认执行入口：`AGENTS.md`、`CODEX.md`、`CLAUDE.md`、`.codex/workflows/*.md`
- 默认计划目录：`docs/plans/`
- 默认验证总览：`docs/verification/2026-03-07-workflow-verification-overview.md`
- 历史参考目录：`.claude/reference/`、`AI开发-PLan-Program-Debug-Claude和Codex协作/`
- 历史目录中的旧命名和旧表述只用于追溯，不参与默认工作流路由
- `.claude/` 仅保留 Claude Code 兼容配置、历史参考和旧路径桥接

---

## 7. 验收与验证索引

- 工作流验收总览：`docs/verification/2026-03-07-workflow-verification-overview.md`
- 中文触发速查表：`docs/verification/2026-03-07-workflow-trigger-cheatsheet.md`
- 触发词矩阵验证：`docs/verification/2026-03-07-workflow-trigger-validation.md`
- 冲突提示词压力测试：`docs/verification/2026-03-07-workflow-conflict-stress-test.md`
- 当前强化计划：`docs/plans/2026-03-07-codex-led-workflow-hardening.md`
- 当前结构化扫描：`docs/scan/2026-03-07-codex-led-workflow-hardening/`
