---
name: largebase-structured-scan
description: Use when 需要先对大型代码库或多参考文档项目做结构化扫描，再进入规划或开发阶段。触发信号：递归代码文件数较多、Markdown/参考文档较多、跨3个及以上模块、重构/迁移/整合、命中"先扫描、影响分析"等关键词、或用户显式要求先扫描。
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

**连续执行规则**：步骤之间无需用户确认，必须连续执行，仅在 Step 0 提示和硬门禁失败时停下。

---

### Step 0：可选增强 — Cartographer 检测

> 此步骤为**可选增强**，不阻塞扫描流程。

1. 检查 `docs/CODEBASE_MAP.md` 是否存在且 `Generated at` ≤ 7 天
2. **若可用**：提示用户 `"检测到 CODEBASE_MAP.md 可用，将作为参考文档 --refs 传入"`，直接进入 Step 1
3. **若不可用**：提示用户选择：
   ```
   未检测到 CODEBASE_MAP.md，请选择：
     A) 使用本地 extract 命令生成（零 AI 成本，推荐）
     B) 运行 Cartographer 生成（需已安装，AI 级语义分析）
     C) 跳过，直接进入扫描
   ```
4. 选 A → Step 1 后自动执行 Step 1.5
5. 选 B → 尝试执行 Cartographer，成功则用其产物，失败则回退到 A
6. 选 C → 直接进入 Step 1

---

### Step 1：初始化扫描目录与数据库

```bash
python .claude/skills/largebase-structured-scan/scan.py scan \
  --mode M4 \
  --scope src docs references \
  --topic refactor-core \
  --refs docs/CODEBASE_MAP.md docs/api.md
```

**硬门禁**：输出必须包含 `[OK] 扫描初始化完成`，否则停止。

**约束**：`--scope` 禁止使用 `.` 作为全仓范围，必须显式列出业务目录。

---

### Step 1.5：本地结构预提取（推荐，零 AI Token）

```bash
python .claude/skills/largebase-structured-scan/scan.py extract \
  --scope src docs references \
  --topic refactor-core
```

产出：
- `extract-data.json`：模块/函数/导入关系（兼容 `load` 命令）
- `CODEBASE_MAP.md`：Markdown 格式导航地图
- `docs/CODEBASE_MAP.md`：全局副本

此步骤零 AI token，为 Step 2 提供结构化输入，减少 Codex 扫描时的探索开销。

---

### Step 2：生成扫描数据

**策略选择**：

> **自动判断**：`extract` 完成后，CC 读取 `extract-data.json` 的模块数：
> - 模块数 < 5 → **策略 A**（单 Codex）
> - 模块数 ≥ 5 且用户未明确反对 → **策略 C**（并行 Codex，加快速度）
> - Codex 不可用 → **策略 B**（CC 兜底）

#### 策略 A：单 Codex（默认，模块数 < 5）

1. 检查 `mcp__codex__codex` 工具是否可用
2. 调用 Codex，使用 `references/prompt-pack.md` 模板
3. 必填参数：`model: "gpt-5.3-codex"`, `sandbox: "danger-full-access"`, `approval-policy: "on-failure"`
4. 若 Step 1.5 的 `extract-data.json` 存在，在 Prompt 中引用其模块清单和函数列表
5. 输出 `scan-data.json` 和 `00-06` 文档

**失败后** → 策略 B

#### 策略 B：CC 直接执行（兜底）

1. 读取 `extract-data.json`（或 `CODEBASE_MAP.md`）提取模块信息
2. 按模板逐个生成 `00-06` 文件
3. 基于 extract-data 生成 `scan-data.json`

#### 策略 C：并行多 Codex（模块数 ≥ 5，大型代码库加速）

按 `extract-data.json` 的模块清单拆分 scope，CC **同时**调起多个 Codex：

```text
模块清单：[src/core, src/api, src/ui, services/auth, services/payment, docs]
    ↓ CC 按模块拆分（每个 Codex 负责 1-2 个模块）
Codex-1: --scope src/core            → scan-data-core.json
Codex-2: --scope src/api src/ui      → scan-data-api.json
Codex-3: --scope services/auth ...  → scan-data-svc.json
Codex-4: --scope docs               → scan-data-docs.json
    ↓ 等待全部完成后：
scan.py merge --inputs scan-data-core.json scan-data-api.json scan-data-svc.json scan-data-docs.json \
              --output scan-data.json
```

**注意**：
- 策略 C 不要求 Codex 完全同时启动，CC 可以顺序触发；等全部完成后再 merge
- merge 命令自动去重（按 name+path+line 三键），重叠扫描不产生重复数据
- merge 后执行 `load` 写入 `scan.db`，流程与策略 A 完全相同

**硬门禁**：`scan-data.json` 必须存在，否则不得宣称"已完成扫描"。

---

### Step 3：Schema 校验 + 写入 SQLite

```bash
python .claude/skills/largebase-structured-scan/scan.py load \
  --load docs/scan/YYYY-MM-DD-refactor-core/scan-data.json \
  --db docs/scan/YYYY-MM-DD-refactor-core/scan.db
```

- `load` 会先校验 JSON schema，失败时输出缺失字段列表并终止
- 校验通过后写入所有表，`scan_meta` 写入 `load_validated=true`

---

### Step 4：查询扫描结果

```bash
python .claude/skills/largebase-structured-scan/scan.py query \
  --query hybrid_search --type all \
  --db docs/scan/YYYY-MM-DD-refactor-core/scan.db
```

查询类型：`all` / `function` / `module` / `constraint` / `impact` / `dataflow`

---

### Step 5：导出摘要到 CLAUDE.md（默认执行）

```bash
python .claude/skills/largebase-structured-scan/scan.py export-to-claude-md \
  --db docs/scan/YYYY-MM-DD-refactor-core/scan.db \
  --claude-md CLAUDE.md
```

- 将核心模块、关键约束和高风险影响点写入 CLAUDE.md 的标记区块
- 重复执行会覆盖同一标记块，不会追加重复内容
- **此步骤默认执行**，确保后续会话零成本获取扫描上下文

---

### Step 6：输出合同校验并路由

校验规则：`references/output-contract.md`

路由：
- 任务数 `=1` → `claude-workflow-complex.md`（可跳过其 Phase 0）
- 任务数 `>=2` → `claude-workflow-parallel.md`
- 缺陷修复主导 → `claude-workflow-debug.md`
- **lessons 联动**（可选但推荐）：扫描过程中发现的架构陷阱、文档冲突等经验写入 `tasks/lessons.md`

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
├── extract-data.json           本地提取（推荐）
├── scan-data.json              M4 必须，其他可选
└── scan.db                     M2/M3/M4 必须
```

---

## Guardrails

- 不执行业务代码，不修改源码文件
- 扫描结论必须能追溯到文件/函数/行号或文档来源
- 扫描后优先查询 `scan.db` 或 `extract-data.json`，避免重复全库搜索
- `load` 失败时不得跳过校验直接使用不完整数据
- `--scope` 禁止包含 `.git`、`node_modules`、`.venv`、`docs/scan` 等非业务目录

---

## References

- `references/prompt-pack.md`
- `references/output-contract.md`
- `templates/codex-prompt-M1.txt` ~ `M4.txt`
