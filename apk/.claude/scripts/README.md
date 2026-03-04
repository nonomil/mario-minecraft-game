# 脚本文件指南

本目录包含 Claude Code + Codex MCP 协作中使用的自动化脚本。所有脚本通过 Hook 机制触发。

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
            "command": "python .claude/scripts/auto_checkpoint_commit.py"
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
            "command": "python .claude/scripts/append_changelog_draft.py"
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
            "command": "python .claude/scripts/pre_merge_scope_guard.py --base main"
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
python -m json.tool ../settings.local.json

# 检查脚本语法
python -m py_compile auto_checkpoint_commit.py
```

---

## 📋 Hook 配置最佳实践

### 1. 使用相对路径
```json
{
  "command": "python .claude/scripts/auto_checkpoint_commit.py"
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
python .claude/scripts/auto_checkpoint_commit.py

# CHANGELOG 更新
python .claude/scripts/append_changelog_draft.py

# 合并前检查
python .claude/scripts/pre_merge_scope_guard.py --base main
```

### 调试脚本
```bash
# 预览模式
python .claude/scripts/auto_checkpoint_commit.py --dry-run

# 详细输出
python .claude/scripts/auto_checkpoint_commit.py --verbose

# 强制执行
python .claude/scripts/auto_checkpoint_commit.py --force
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

- `../settings.local.json` — Hook 配置文件
- `../workflows/claude-workflow-parallel.md` — 并行开发工作流（使用 pre_merge_scope_guard）
- `../workflows/claude-workflow-constants.md` — 全局约束
- `../README.md` — .claude 目录完整指南
- `../MIGRATION-GUIDE.md` — 迁移指南（包含脚本配置示例）
