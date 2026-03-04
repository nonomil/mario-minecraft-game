---
name: largebase-structured-scan
description: >
  Use when 需要先对大型代码库或多参考文档项目做结构化扫描，再进入规划或开发阶段。
  触发信号：递归代码文件数较多、Markdown/参考文档较多、跨 3 个及以上模块、
  重构/迁移/整合、命中"先扫描、影响分析"等关键词、或用户显式要求先扫描。
---

# largebase-structured-scan

## Overview

先扫描、后开发。统一产出 `00-06` 扫描包 + 可选 `scan-data.json` + `scan.db`，
让后续流程基于结构化数据而不是全库盲搜。

---

## 模式选择

| 模式 | 使用时机 | 必须产物 |
|------|---------|---------|
| M1 | 新功能接入，摸清目录与入口 | 00, 01, 06 |
| M2 | 涉及存储/索引/转换/同步 | 00, 01, 02, 05, 06 |
| M3 | 公共函数签名或模块契约变更 | 00, 01, 03, 05, 06 |
| M4 | 大规模重构或迁移 | 全部 00-06 + scan-data.json + scan.db |

---

## Workflow

### Step 1：初始化扫描目录与数据库

```bash
python .claude/skills/largebase-structured-scan/scan.py scan \
  --mode M4 \
  --scope src docs references \
  --topic refactor-core \
  --refs docs/api.md docs/config.md
```

输出：
- `docs/scan/YYYY-MM-DD-refactor-core/` 目录
- 空 `scan.db`（含 schema）
- 下一步 Prompt 提示（含模板路径）

### Step 2：调用 Codex 生成扫描数据

必填参数：
```javascript
{
  model: "gpt-5.3-codex",
  sandbox: "danger-full-access",
  "approval-policy": "on-failure"
}
```

Prompt 模板路径：`references/prompt-pack.md` 或对应模式的 `templates/codex-prompt-{MODE}.txt`

Codex 输出目标：
- `docs/scan/YYYY-MM-DD-[topic]/scan-data.json`
- `docs/scan/YYYY-MM-DD-[topic]/00-06` 各文档

### Step 3：Schema 校验 + 写入 SQLite

```bash
python .claude/skills/largebase-structured-scan/scan.py load \
  --load docs/scan/YYYY-MM-DD-refactor-core/scan-data.json \
  --db   docs/scan/YYYY-MM-DD-refactor-core/scan.db
```

- `load` 命令会先执行 schema 校验，失败时输出缺失字段列表并终止，不会静默跳过
- 校验通过后写入所有表，并在 `scan_meta` 写入 `load_validated=true`

### Step 4：按需查询扫描结果

```bash
# 通用搜索
python .claude/skills/largebase-structured-scan/scan.py query \
  --query hybrid_search \
  --type all \
  --db docs/scan/YYYY-MM-DD-refactor-core/scan.db

# 影响链路联查（最常用）
python .claude/skills/largebase-structured-scan/scan.py query \
  --query run_pipeline \
  --type impact-chain \
  --db docs/scan/YYYY-MM-DD-refactor-core/scan.db
```

查询类型：`all` / `function` / `module` / `entry` / `constraint` / `impact` / `dataflow` / `impact-chain`

### Step 5：输出合同校验并路由

校验规则详见 `references/output-contract.md`。

路由规则：
- 任务数 = 1 → `claude-workflow-complex.md`（可跳过其 Phase 0，直接用扫描结论）
- 任务数 ≥ 2 → `claude-workflow-parallel.md`
- 扫描发现缺陷主导 → `claude-workflow-debug.md`

---

## Output Contract

```text
docs/scan/YYYY-MM-DD-[topic]/
├── 00-scan-meta.json           必须
├── 01-architecture.md          必须
├── 02-dataflow.md              M2/M4 必须
├── 03-api-surface.md           M3/M4 必须
├── 04-reference-constraints.md M2/M3/M4 必须
├── 05-impact-matrix.md         M2/M3/M4 必须
├── 06-exec-brief.md            必须
├── scan-data.json              M4 必须，其他可选
└── scan.db                     M2/M3/M4 必须
```

---

## Guardrails

- 不执行业务代码，不修改源码文件
- 扫描结论必须能追溯到文件/函数/行号或文档来源
- 扫描后优先查询 `scan.db`，避免重复全库搜索
- `load` 失败时不得跳过校验直接使用不完整数据
- `--scope` 支持多个路径；建议把源码目录和关键文档目录都纳入扫描范围
- 如果 `scan.db` 中 `module_count = 0`，则视为空库，不触发 checkpoint 提交

---

## References

- `references/prompt-pack.md`
- `references/output-contract.md`
- `templates/codex-prompt-M1.txt`
- `templates/codex-prompt-M2.txt`
- `templates/codex-prompt-M3.txt`
- `templates/codex-prompt-M4.txt`
