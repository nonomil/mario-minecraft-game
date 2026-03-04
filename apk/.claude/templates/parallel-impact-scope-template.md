# 并行任务文件影响范围表模板（worktree-first）

> 用途：在并行开发前，定义每个任务允许改动范围与共享文件 owner，供 `verify_parallel_scope.py` 校验。

## 使用步骤

1. 复制本模板到：`docs/development/[feature]-impact-scope.md`
2. 按实际任务填写表格
3. 合并前对每个任务执行范围门禁脚本

```bash
python .claude/scripts/verify_parallel_scope.py \
  --table docs/development/[feature]-impact-scope.md \
  --task [task-id] \
  --base [main-or-master-or-develop]
```

## 文件影响范围表

| 任务 | worktree | 允许改动路径 | 共享文件 | owner |
|---|---|---|---|---|
| task-a | `.worktree/task-a` | `src/auth/**` | - | - |
| task-b | `.worktree/task-b` | `src/payment/**` | - | - |
| task-c | `.worktree/task-c` | `src/notify/**` | `src/utils.py` | task-c |
| task-d | `.worktree/task-d` | `src/report/**` | `src/utils.py` | task-c |

## 填写规则（硬约束）

- 无共享文件：`共享文件` 与 `owner` 均填 `-`
- 有共享文件：必须指定唯一 owner
- 非 owner 任务不得修改共享文件
- `允许改动路径` 支持目录（如 `src/auth/**`）与单文件（如 `pyproject.toml`）
- 每个任务都必须在表中有且仅有一行

## 给 Opus/CC 的拆任务提示词（可直接复用）

```text
请输出并行任务拆分结果，并同时生成“文件影响范围表”，列格式固定为：
任务 | worktree | 允许改动路径 | 共享文件（无则填"-"）| owner（无共享文件则填"-"）。
如果存在共享文件，必须指定唯一 owner，并说明非 owner 禁止修改。
```
