# 参考文档目录

> 本目录包含 AI 开发工作流的完整参考文档，供用户阅读理解。
> 这些文档是 `.claude/workflows/` 工作流文件的详细版本，包含更多背景说明、模板示例和实操指南。

---

## 文档索引

| 编号 | 文件 | 内容 | 对应 workflow |
|------|------|------|--------------|
| 00 | 工作流体系总览 | 核心理念、工具角色、全流程图、Review 质量体系、200行约束 | — (总览) |
| 01 | 快速上手指南 | 新手操作手册，从安装到第一个任务 | — (入门) |
| 02 | AI软件开发全流程 | 10步开发流程、工具角色矩阵、田忌赛马策略、上下文刷新 | claude-workflow-complex.md |
| 03 | 环境配置与协作规范 | CLI安装、MCP注册、AGENTS.md模板、故障排除 | claude-workflow-constants.md |
| 04 | 资料调研搜索模板 | 10轮迭代搜索、多工具并行、验证实验 | claude-workflow-research.md |
| 05 | 需求分析与计划生成模板 | CoT+ToT模板、ADR格式、3轮解耦审查 | claude-workflow-complex.md |
| 06 | 功能分支开发流程模板 | Phase 0-10完整流程、3轮Review协议、版本发布、CI验证 | claude-workflow-parallel.md |
| 07 | 复杂问题调试模板 | 7阶段调试、架构分析、交叉验证、回归验证 | claude-workflow-debug.md |
| 08 | 简单任务快速开发流程 | 6条复杂度判断、模式升级触发条件 | root claude.md |
| 09 | Skills生态与安装指南 | Skills安装方法、superpowers详解、引入优先级 | claude-workflow-constants.md |
| 10 | 自动化工作流-Git与文档维护 | Git提交自动化、文档维护、Hook配置 | — (自动化) |
| 11 | 安全防护与自动化工具配置 | dcg/damage-control、claudekit、Hooks配置组合 | claude-workflow-constants.md |
| 12 | AI工作流规范（精简版） | 工作流精简版，适合快速参考 | root claude.md |

---

## 使用说明

- 这些文档面向**用户阅读**，不会被 AI 自动加载
- AI 工作时使用 `.claude/workflows/` 中的精简版工作流文件
- 当需要深入了解某个阶段的细节时，参考对应编号的文档
- 文档按开发流程顺序编号：总览 → 配置 → 调研 → 计划 → 开发 → 调试 → 自动化
