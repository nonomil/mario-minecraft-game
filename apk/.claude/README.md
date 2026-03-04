# .claude 目录结构与工作流指南

本目录包含 Claude Code + Codex MCP 协作的全局配置、工作流文档、脚本和模板。

---

## 📁 目录结构

```
.claude/
├── README.md                              # 本文件 — 目录结构和使用指南
├── workflows/                             # 工作流文档（核心）
│   ├── claude-workflow-constants.md       # 全局硬约束与常量（单一真相来源）
│   ├── claude-workflow-complex.md         # 复杂开发流程
│   ├── claude-workflow-debug.md           # Debug 流程
│   ├── claude-workflow-research.md        # 研究调研流程
│   ├── claude-workflow-parallel.md        # 并行开发流程
│   └── claude-workflow-largebase.md       # 大型代码库流程
├── templates/                             # 模板文件
│   ├── largebase-scan-pack-template.md    # 大型库扫描包模板
│   ├── largebase-scan.schema.json         # 扫描包 JSON Schema
│   ├── largebase-scan.sample.json         # 扫描包示例
│   └── parallel-impact-scope-template.md  # 并行任务影响范围模板
├── scripts/                               # 自动化脚本
│   ├── auto_checkpoint_commit.py          # 自动检查点提交
│   ├── append_changelog_draft.py           # 追加 CHANGELOG 草稿
│   └── pre_merge_scope_guard.py            # 合并前范围守卫
├── reference/                             # 参考文档（用户阅读，AI 不自动加载）
│   ├── README.md                          # 参考文档索引
│   ├── 00-工作流体系总览.md               # 核心理念、工具角色、全流程图
│   ├── 01-快速上手指南.md                 # 新手操作手册
│   ├── 02-AI软件开发全流程.md             # 10步开发流程完整版
│   ├── 03-环境配置与协作规范.md           # CLI安装、AGENTS.md模板
│   ├── 04-资料调研搜索模板.md             # 10轮迭代搜索、多工具并行
│   ├── 05-需求分析与计划生成模板.md       # CoT+ToT模板、3轮解耦审查
│   ├── 06-功能分支开发流程模板.md         # Phase 0-10完整流程
│   ├── 07-复杂问题调试模板.md             # 7阶段调试完整版
│   ├── 08-简单任务快速开发流程.md         # 6条复杂度判断
│   ├── 09-Skills生态与安装指南.md         # Skills安装、生态、引入优先级
│   ├── 10-自动化工作流-Git与文档维护.md   # Git提交自动化
│   ├── 11-安全防护与自动化工具配置.md     # dcg、claudekit、Hooks配置
│   └── 12-AI工作流规范（精简版）.md       # 工作流精简版
├── skills/                                # 自定义技能
│   ├── commit/SKILL.md                    # 提交技能
│   ├── changelog/SKILL.md                 # CHANGELOG 技能
│   └── largebase-structured-scan/         # 大型库扫描技能
├── settings.local.json                    # 项目级 Hook 配置
└── hooks/                                 # Hook 脚本（可选）
    └── block-delete.py                    # 删除命令拦截脚本
```

---

## 📖 文件用途说明

### 核心文档

#### `workflows/claude-workflow-constants.md`
**用途**：全局硬约束与常量的单一真相来源

**包含内容**：
- Codex MCP 调用规范（必填参数、会话管理）
- 文件操作边界与删除禁令
- Codex 推理强度规则
- Superpowers 调用规范（Windows 绝对路径）
- Skill 选择规则
- Git 安全约束
- 角色边界（CC vs Codex）
- 工作流路由优先级
- 确认词与门禁
- 数据格式标准

**引用方式**：
```markdown
> 参见 `workflows/claude-workflow-constants.md` 中的"Codex MCP 调用规范"
```

**重要**：所有其他文档应引用此文档，而非复制规则。

---

#### `workflows/claude-workflow-complex.md`
**用途**：复杂开发流程（涉及 5+ 文件、跨模块、需求不明确）

**流程阶段**：
- Phase 0：扫描路由判断
- Phase 1：CC 生成 Plan 文档
- Phase 2：CC 调用 Codex 工程审查 Plan
- Phase 3：交叉 Review
- Phase 4：CC 调用 Codex 生成开发计划
- Phase 5：（可选）Opus 审查
- Phase 6：执行代码

**何时使用**：
- 涉及文件 > 3 个
- 预估 diff > 200 行
- 需求有歧义
- 跨多个模块

---

#### `workflows/claude-workflow-debug.md`
**用途**：Bug 调试流程

**流程**：
- 问题复现与诊断
- 根因分析
- 修复方案设计
- 实施与验证

**何时使用**：用户描述 bug / 错误 / 测试失败

---

#### `workflows/claude-workflow-research.md`
**用途**：研究调研流程

**流程**：
- 需求理解
- 信息收集
- 对比分析
- 建议输出

**何时使用**：用户说"调研/对比/选型/搜索/研究"

---

#### `workflows/claude-workflow-parallel.md`
**用途**：并行开发流程（多个独立任务）

**流程**：
- 任务解耦
- 影响范围分析
- 并行执行
- 合并验证

**何时使用**：任务数 ≥ 2 且可解耦

---

#### `workflows/claude-workflow-largebase.md`
**用途**：大型代码库流程

**流程**：
- 结构化扫描
- 架构分析
- 数据流分析
- 影响矩阵生成

**何时使用**：
- 递归代码文件 > 20
- 目录层级深且跨 3+ 模块
- Markdown 与参考文档较多
- 命中"重构迁移、影响分析"关键词

---

### 模板文件

#### `templates/largebase-scan-pack-template.md`
**用途**：大型库扫描包的 Markdown 模板

**包含**：
- 元数据
- 架构概览
- 数据流
- API 表面
- 约束条件
- 影响矩阵
- 执行摘要

---

#### `templates/largebase-scan.schema.json`
**用途**：扫描包 JSON 数据的 Schema 定义

**用于**：验证扫描结果的数据结构

---

#### `templates/parallel-impact-scope-template.md`
**用途**：并行任务影响范围表模板

**包含**：
- 任务 ID
- 修改文件列表
- 影响范围
- 风险评估
- 验证计划

---

### 脚本文件

#### `scripts/auto_checkpoint_commit.py`
**用途**：自动检查点提交

**触发**：会话结束时（Stop Hook）

**功能**：
- 检查未提交改动
- 生成时间戳提交信息
- 自动提交

**配置**：`.claude/settings.local.json` 中的 `Stop` Hook

---

#### `scripts/append_changelog_draft.py`
**用途**：追加 CHANGELOG 草稿

**触发**：git commit 后（PostToolUse Hook）

**功能**：
- 解析提交信息
- 生成 CHANGELOG 条目
- 追加到 CHANGELOG.md

**配置**：`.claude/settings.local.json` 中的 `PostToolUse` Hook

---

#### `scripts/pre_merge_scope_guard.py`
**用途**：合并前范围守卫

**触发**：git merge 前（PreToolUse Hook）

**功能**：
- 验证合并范围
- 检查影响范围表
- 防止超范围合并

**配置**：`.claude/settings.local.json` 中的 `PreToolUse` Hook

---

### 参考文档

> 面向用户阅读的详细参考文档，是 `workflows/` 精简版的完整版本。AI 不会自动加载这些文件。

| 编号 | 文件 | 内容 | 对应 workflow |
|------|------|------|--------------|
| 00 | 工作流体系总览 | 核心理念、工具角色、全流程图 | — (总览) |
| 01 | 快速上手指南 | 新手操作手册 | — (入门) |
| 02 | AI软件开发全流程 | 10步流程、角色矩阵、质量基线 | complex.md |
| 03 | 环境配置与协作规范 | CLI安装、AGENTS.md模板、故障排除 | constants.md |
| 04 | 资料调研搜索模板 | 10轮迭代搜索、多工具并行 | research.md |
| 05 | 需求分析与计划生成模板 | CoT+ToT模板、3轮解耦审查 | complex.md |
| 06 | 功能分支开发流程模板 | Phase 0-10完整流程、3轮Review | parallel.md |
| 07 | 复杂问题调试模板 | 7阶段调试、回归验证 | debug.md |
| 08 | 简单任务快速开发流程 | 6条复杂度判断 | root claude.md |
| 09 | Skills生态与安装指南 | Skills安装、生态、引入优先级 | constants.md |
| 10 | 自动化工作流 | Git提交自动化、文档维护 | — (自动化) |
| 11 | 安全防护与工具配置 | dcg、claudekit、Hooks配置 | constants.md |
| 12 | AI工作流规范（精简版） | 工作流精简版 | root claude.md |

**使用方式**：当需要深入了解某个阶段的细节时，参考对应编号的文档。

---

### 配置文件

#### `settings.local.json`
**用途**：项目级 Hook 配置

**包含**：
- 权限列表（允许的工具）
- PreToolUse Hook（合并前检查）
- PostToolUse Hook（提交后处理）
- Stop Hook（会话结束处理）

**示例**：
```json
{
  "permissions": {
    "allow": [
      "mcp__codex__codex",
      "Bash(git commit -m *)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git merge*)",
        "hooks": [
          {
            "type": "command",
            "command": "python .claude/scripts/pre_merge_scope_guard.py --base main"
          }
        ]
      }
    ]
  }
}
```

---

## 🔗 文件间的依赖关系

```
claude-workflow-constants.md（单一真相来源）
    ↓
    ├→ claude-workflow-complex.md
    ├→ claude-workflow-debug.md
    ├→ claude-workflow-research.md
    ├→ claude-workflow-parallel.md
    └→ claude-workflow-largebase.md

reference/（用户参考文档，workflows 的详细版本）
    ├→ 00-12 编号文档（按开发流程排序）
    └→ 各文档对应 workflows/ 中的精简版

templates/
    ├→ largebase-scan-pack-template.md
    ├→ largebase-scan.schema.json
    ├→ largebase-scan.sample.json
    └→ parallel-impact-scope-template.md

scripts/
    ├→ auto_checkpoint_commit.py
    ├→ append_changelog_draft.py
    └→ pre_merge_scope_guard.py

settings.local.json
    ├→ scripts/auto_checkpoint_commit.py
    ├→ scripts/append_changelog_draft.py
    └→ scripts/pre_merge_scope_guard.py
```

---

## 🚀 工作流执行流程

### 1. 需求讨论（强制门禁）
- 用户提出需求
- CC 复述需求、列出歧义
- 等待用户确认

### 2. 复杂度判断
根据以下标准判断：
- 涉及文件数 ≤ 3 个？
- 预估 diff ≤ 200 行？
- 需求明确，无歧义？
- 单模块内，不跨模块？

**满足全部 4 条** → 简单模式
**任意 1 条不满足** → 按路由表选择工作流

### 3. 工作流路由（优先级从高到低）

| 优先级 | 场景 | 触发条件 | 工作流文档 |
|--------|------|---------|-----------|
| 1 | Debug | 用户描述 bug / 错误 / 测试失败 | `claude-workflow-debug.md` |
| 2 | 研究调研 | 用户说"调研/对比/选型/搜索/研究" | `claude-workflow-research.md` |
| 3 | 大型代码库 | 递归代码文件 > 20 / 跨 3+ 模块 / 用户显式要求先扫描 | `claude-workflow-largebase.md` |
| 4 | 复杂开发 | 任意简单标准不满足 | `claude-workflow-complex.md` |
| 5 | 简单开发 | 满足全部 4 条简单标准 | 直接执行（无需读文档） |

### 4. 执行
- 按对应工作流文档执行
- 调用 Codex MCP（参见 `claude-workflow-constants.md`）
- 验证结果

### 5. 验证
- 测试通过
- 代码审查通过
- 文档更新完整
- 提交

---

## ✅ 快速检查清单

迁移或新项目时，确认以下文件存在：

```bash
# 检查工作流文档
ls -la .claude/workflows/claude-workflow-*.md

# 检查参考文档
ls -la .claude/reference/

# 检查模板
ls -la .claude/templates/

# 检查脚本
ls -la .claude/scripts/

# 检查配置
ls -la .claude/settings.local.json

# 验证引用
grep -r "claude-workflow-constants" ../claude.md
```

---

## 🔧 常见操作

### 添加新工作流
1. 在 `workflows/` 下创建 `claude-workflow-[name].md`
2. 在 `claude-workflow-constants.md` 中更新路由表
3. 在 `claude.md` 中更新场景路由表

### 修改全局约束
1. 编辑 `workflows/claude-workflow-constants.md`
2. 更新版本历史
3. 所有其他文档自动生效（因为它们引用此文档）

### 添加新脚本
1. 在 `scripts/` 下创建脚本
2. 在 `settings.local.json` 中配置 Hook
3. 在本文档中记录用途

### 添加新模板
1. 在 `templates/` 下创建模板
2. 在对应工作流文档中引用
3. 在本文档中记录用途

---

## 📝 版本历史

- **2026-02-27**：v2 — 合并参考文档
  - 创建 `.claude/reference/` 目录，合入 13 个参考文档（中文命名，按流程编号）
  - 合并缺失内容到 workflow 文件（research/debug/complex/parallel/constants）
  - 修复全局 CLAUDE.md 模型版本冲突（gpt-5-codex → gpt-5.3-codex）
  - 修复 Session ID 字段名冲突（conversationId → threadId）
- **2026-02-27**：v1 — 初版
  - 创建 `.claude/README.md`
  - 移动 `claude-workflow-constants.md` 到 `workflows/` 目录
  - 更新所有引用路径
  - 完整记录目录结构、文件用途、依赖关系、使用流程

---

## 🤝 支持

如遇问题，检查以下文件：
- `../claude.md` — Claude Code 工作流规范
- `../AGENTS.md` — Codex 插件规范
- `workflows/claude-workflow-constants.md` — 全局硬约束
- `settings.local.json` — Hook 配置
- `../MIGRATION-GUIDE.md` — 迁移指南
