# 脚本文件指南

> 当前模式：Codex 主导，Claude Code 辅助。若本文档存在旧角色描述，请按 `CODEX.md` 解释。


本目录包含 Codex + Claude Code MCP 协作中使用的自动化脚本。所有脚本通过 Hook 机制触发。

> 这些 Hook 仅在 Claude Code 会话触发。Codex 主流程不依赖本目录脚本。

> 当前新增的主流程校验脚本由 Codex 直接运行：
> - `audit_active_docs_terms.py`：审计活动文档是否仍含旧流程残留
> - `validate_doc_call_graph.py`：验证主入口、工作流索引、兼容层桥接是否真实连通
> - `scan_codex_workflow_repo.py`：扫描全仓文件名、目录名与内容残留
> - `validate_codex_workflow_modes.py`：验证 init/review/debug/research/largebase/parallel/complex 路由

---

## 📜 脚本文件列表

### 1. `auto_checkpoint_commit.py`
**用途**：自动检查点提交

**触发条件**：会话结束时（Stop Hook）

**功能**：
- 检查是否有未提交的改动
- 生成时间戳提交信息（格式：`checkpoint: HH:MM`）
- 自动执行 git commit

**配置**：
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "async": true,
            "timeout": 30,
            "command": "python .codex/scripts/auto_checkpoint_commit.py"
          }
        ]
      }
    ]
  }
}
```

**使用场景**：
- 长时间工作后自动保存进度
- 避免丢失未提交的改动
- 保持 git 历史的连续性

**命令行选项**：
```bash
python auto_checkpoint_commit.py --dry-run  # 预览将执行的操作
python auto_checkpoint_commit.py --force    # 强制提交（即使没有改动）
```

---

### 2. `append_changelog_draft.py`
**用途**：追加 CHANGELOG 草稿

**触发条件**：git commit 后（PostToolUse Hook）

**功能**：
- 解析最新的 git 提交信息
- 根据提交信息生成 CHANGELOG 条目
- 追加到 CHANGELOG.md（或创建新文件）

**配置**：
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash(git commit*)",
        "hooks": [
          {
            "type": "command",
            "async": true,
            "timeout": 30,
            "command": "python .codex/scripts/append_changelog_draft.py"
          }
        ]
      }
    ]
  }
}
```

**使用场景**：
- 自动生成 CHANGELOG 条目
- 保持 CHANGELOG 与提交信息同步
- 减少手动维护工作

**提交信息格式**（Conventional Commits）：
```
feat: 新功能描述
fix: 修复描述
docs: 文档更新
refactor: 重构描述
perf: 性能优化
test: 测试相关
chore: 杂务
```

**生成的 CHANGELOG 格式**：
```markdown
## [Unreleased]

### Added
- 新功能描述

### Fixed
- 修复描述

### Changed
- 重构描述
```

---

### 3. `pre_merge_scope_guard.py`
**用途**：合并前范围守卫

**触发条件**：git merge 前（PreToolUse Hook）

**功能**：
- 验证合并范围是否在允许的范围内
- 检查影响范围表（docs/development/[feature]-impact-scope.md）
- 防止超范围合并

**配置**：
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git merge*)",
        "hooks": [
          {
            "type": "command",
            "timeout": 30,
            "command": "python .codex/scripts/pre_merge_scope_guard.py --base main"
          }
        ]
      }
    ]
  }
}
```

**使用场景**：
- 并行开发时防止任务越界
- 确保合并的改动符合计划
- 保护主分支的完整性

**命令行选项**：
```bash
python pre_merge_scope_guard.py --base main              # 指定基础分支
python pre_merge_scope_guard.py --base main --strict    # 严格模式
python pre_merge_scope_guard.py --dry-run               # 预览检查结果
```

**影响范围表格式**：
```markdown
| 任务 ID | 文件 | 影响范围 | 风险 |
|--------|------|---------|------|
| T1 | src/auth.ts | 认证模块 | 低 |
```

---

### 4. `audit_active_docs_terms.py`
**用途**：活动文档命名与引用审计

**触发条件**：工作流文件改名后 / 发布前自检

**功能**：
- 校验 `.codex/workflows/` 下关键 `codex-workflow-*.md` 文件是否完整
- 审计活动文档中是否残留旧工作流命名（Claude 前缀）
- 校验 `codex-workflow-*.md` 引用是否可解析
- 校验 `mcp__codex__codex` 仅出现在允许的兼容说明文档

**命令行示例**：
```bash
python .codex/scripts/audit_active_docs_terms.py
```

---

### 5. `simulate_codex_workflows.py`
**用途**：模拟各工作流的路由与阶段执行

**触发条件**：流程演练 / 培训 / 改名后快速回归验证

**功能**：
- 按 `--workflow` 指定单个工作流或 `all` 全量模拟
- 按 `--request` + `--auto-route` 模拟路由决策
- 输出每个工作流阶段执行日志（text/json）
- 启动前校验工作流文档是否完整（可 `--skip-verify` 跳过）

**命令行示例**：
```bash
python .codex/scripts/simulate_codex_workflows.py \
  --workflow all \
  --format text

python .codex/scripts/simulate_codex_workflows.py \
  --request "线上报错，测试失败" \
  --auto-route \
  --format json
```

---

## 🔧 脚本管理

### 添加新脚本
1. 在本目录下创建新脚本文件（`.py` 格式）
2. 在脚本中实现主要功能
3. 在 `settings.local.json` 中配置 Hook
4. 在本文档中记录用途和配置

### 修改现有脚本
1. 编辑脚本文件
2. 测试修改（使用 `--dry-run` 选项）
3. 更新本文档中的说明
4. 确保向后兼容

### 测试脚本
```bash
# 预览模式
python auto_checkpoint_commit.py --dry-run

# 验证 JSON 配置
python -m json.tool ../../.claude/settings.local.json

# 检查脚本语法
python -m py_compile auto_checkpoint_commit.py
```

---

## 📋 Hook 配置最佳实践

### 1. 使用相对路径
```json
{
  "command": "python .codex/scripts/auto_checkpoint_commit.py"
}
```

### 2. 设置合理的超时
```json
{
  "timeout": 30  // 秒
}
```

### 3. 使用异步执行（不阻塞主流程）
```json
{
  "async": true
}
```

### 4. 多平台支持
```json
{
  "matcher": "Bash(git commit*)",  // Linux/Mac
  "matcher": "Shell(git commit*)", // Windows PowerShell
  "matcher": "PowerShell(git commit*)"  // Windows PowerShell
}
```

---

## 🚀 常见操作

### 手动执行脚本
```bash
# 检查点提交
python .codex/scripts/auto_checkpoint_commit.py

# CHANGELOG 更新
python .codex/scripts/append_changelog_draft.py

# 合并前检查
python .codex/scripts/pre_merge_scope_guard.py --base main

# 活动文档审计
python .codex/scripts/audit_active_docs_terms.py

# 工作流模拟
python .codex/scripts/simulate_codex_workflows.py --workflow all
```

### 调试脚本
```bash
# 预览模式
python .codex/scripts/auto_checkpoint_commit.py --dry-run

# 详细输出
python .codex/scripts/auto_checkpoint_commit.py --verbose

# 强制执行
python .codex/scripts/auto_checkpoint_commit.py --force
```

### 禁用 Hook
临时禁用 Hook（编辑 `settings.local.json`）：
```json
{
  "hooks": {
    "Stop": []  // 清空 Hook 列表
  }
}
```

---

## 🔗 相关文档

- `../../.claude/settings.local.json` — Hook 配置文件
- `../workflows/codex-workflow-parallel.md` — 并行开发工作流（使用 pre_merge_scope_guard）
- `../workflows/codex-workflow-constants.md` — 全局约束
- `../README.md` — .claude 目录完整指南
- `../path-migration-map.md` — 迁移指南（包含脚本配置示例）
