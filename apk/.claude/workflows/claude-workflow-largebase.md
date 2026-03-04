# claude-workflow-largebase｜大型代码库与多参考文档流程（结构化数据版）

> 本文档中的所有规则遵循 `claude-workflow-constants.md` 中的全局约束
> 适用：源码文件多、跨模块改动、多份参考文档并存、需要先产出"可消费的数据文档"再规划实施。
> 目标：让 Codex 先生成结构化扫描包，Claude/CC 再基于扫描包写 Plan，避免盲目搜索。
> 核心：三层结构（JSON 存储 + SQLite 查询 + Markdown 展示），参考 memory-system 设计。
> 推荐：在该场景优先调用技能 `largebase-structured-scan`（见 `.claude/skills/largebase-structured-scan/SKILL.md`）。
> 详细分析：`.claude/skills/largebase-structured-scan/ANALYSIS.md`

---

## 1. 触发与跳过

满足任意一条即进入本流程：
- 递归代码文件数 > 20（按扫描路径递归统计，不只看根目录）
- 根目录文件少但子目录层级深，且递归目录数 > 8 且代码文件数 > 10
- 需求涉及 3 个及以上模块
- Markdown/参考文档较多（`.md` 文件 > 20，或与需求直接相关文档 >= 3）
- 关键词出现：重构、迁移、整合、全局替换、跨模块、架构梳理、影响分析、先扫描、结构化扫描
- 用户显式要求"先扫描/先产出结构化文档/先看影响范围"
- 当前会话无法在 2 次以内定位完整影响范围

满足任意一条可跳过：
- 仅改动单文件且 diff 预估 < 80 行
- 用户明确要求"不要扫描，直接改"
- 当前会话已经有最新扫描包（同一需求、同一分支）

统计口径（强制）：
- "代码文件数"必须按用户指定 `scope_paths` 递归统计
- 代码文件默认包含：`.py .js .ts .tsx .jsx .java .go .rs .cpp .c .h .cs .php .rb .kt .swift .scala`
- 文档文件默认包含：`.md .mdx .rst .txt`
- 未指定路径时，默认按项目根目录 `.` 递归统计

---

## 2. 标准交付物（扫描包）

扫描包目录（必须统一）：

`docs/scan/YYYY-MM-DD-[topic]/`

| 文件 | 类型 | 必须内容 | 用途 |
|------|------|----------|------|
| `00-scan-meta.json` | JSON | 扫描范围、模式、统计信息、版本时间 | 追踪本次扫描上下文 |
| `01-architecture.md` | Markdown 表格 | 目录职责、模块清单、入口点 | 给 Plan 提供改动边界 |
| `02-dataflow.md` | Markdown 表格 + 流程文本 | 核心数据结构、数据流、存储层 | 判断数据改动风险 |
| `03-api-surface.md` | Markdown 表格 | 公共 API、调用关系、兼容策略 | 控制接口变更风险 |
| `04-reference-constraints.md` | Markdown 表格 | 文档冲突、约束汇总、必改文档 | 管理多文档一致性 |
| `05-impact-matrix.md` | Markdown 表格 | 修改点→直接影响→间接影响→验证点 | 指导任务拆分与测试 |
| `06-exec-brief.md` | Markdown 列表 | 风险 TopN、建议拆任务数、推荐路由 | 给后续工作流落地 |
| `scan.db` | SQLite | 结构化查询索引（由 `scan.py load` 生成） | 支持快速检索、聚合和交叉查询 |

机器可读文件：
- `scan-data.json`：结构化汇总（建议遵循 `docs/templates/largebase-scan.schema.json`）
- `scan.db`：M2/M3/M4 模式推荐必产出，M1 可选

---

## 3. 扫描模式选择

| 模式 | 使用时机 | 输出文件 | 成本 |
|------|---------|----------|------|
| `M1-架构` | 新功能接入，优先摸清目录与入口 | `00,01,06` | 低 |
| `M2-数据` | 涉及存储/索引/转换/同步 | `00,01,02,05,06` | 中 |
| `M3-接口` | 公共函数签名或模块契约变更 | `00,01,03,05,06` | 中 |
| `M4-全量` | 大规模重构或迁移 | 全部 `00-06` + 可选 `scan-data.json` | 高 |

---

## 4. 执行流程（强制顺序）

### Step 0：可选增强 — Cartographer / 本地 Extract

> 此步骤为**可选增强**，不阻塞扫描流程。

1. 检查 `docs/CODEBASE_MAP.md` 是否存在且 `Generated at` ≤ 7 天
2. **若可用**：将其加入 `--refs` 参数，直接进入 Step 1
3. **若不可用**：提示用户选择：
   - **A) 本地 extract**（零 AI 成本，推荐）：`scan.py extract --scope ... --topic ...`
   - **B) Cartographer**（需已安装，AI 级语义分析）
   - **C) 跳过**，直接进入扫描
4. 选 A → Step 2 前自动执行 extract，产出 `extract-data.json` + `CODEBASE_MAP.md`
5. 选 B → 尝试 Cartographer，失败则回退到 A
6. 选 C → 直接 Step 1

---

### Step 1: 强制 API 成本提示（触发条件满足时必须执行）

**触发条件**（满足任意一条即触发）：

| 指标 | 阈值 | 说明 |
|------|------|------|
| 预估总 tokens | > 500,000 | 约 50 万 tokens |
| 代码文件数 | > 300 | `.py/.js/.ts` 等业务代码文件 |
| Markdown/文档数 | > 50 | `.md/.rst/.txt` 等文档 |
| 用户明确关键词 | - | "大型代码库"、"全量扫描"、"重构整个项目"等 |

**强制提示内容**：
```markdown
⚠️ 大规模扫描即将开始，Token 消耗预警 ⚠️

预估扫描规模：
- 代码文件数：[N] 个
- 文档文件数：[N] 个
- 预估总 Tokens：[N] tokens
- 按当前 API 计费约：[X] 元
- 推荐使用子代理数：[N] 个

强烈建议切换到低成本 API 执行扫描！

操作步骤：
1. 暂停当前任务
2. 修改 ~/.claude/settings.json 切换为低成本 API profile
   示例配置：
   {
     "api": {
       "profile": "aliyun"  // 或 baichuan/deepseek 等低成本选项
     }
   }
3. 重启 Claude Code
4. 重新触发扫描

扫描完成后我会提醒你切换回高质量 API。

确认继续请回复："使用当前 API 继续"
切换后请回复："已切换 API，继续扫描"
```

**门禁规则**：
- 达到触发条件时，**必须**显示上述提示并等待用户明确回复
- 用户未回复前，禁止进入 Step 2
- 用户选择"使用当前 API 继续"需记录在 `00-scan-meta.json` 的 `api_choice: "user_confirmed_current"`
- 扫描完成后，必须在路由前再次提示："扫描已完成。如之前切换了低成本 API，请现在切换回高质量 API 继续开发"

---

### Step 2: 定义扫描范围与初始化（CC 执行）

**前置条件**：Step 0 已完成（CODEBASE_MAP.md 已就绪或已记录回退原因）

1. 定义扫描范围：目录、分支、需求主题。
   - 支持多路径：`scope_paths = [src/, services/, docs/, references/]`
   - 用户可显式指定只扫某些子目录（例如只扫 `apps/payments` + `docs/payments`）
   - 禁止把 `.` 作为 `scope_paths`（会把 `.git`、历史产物目录等噪声引入扫描）
   - 禁止包含 `.git`、`node_modules`、`.venv`、`docs/scan` 等非业务目录
2. 选择模式：`M1/M2/M3/M4`。
3. 确认输出目录：`docs/scan/YYYY-MM-DD-[topic]/`。
4. 确认"只扫描不改码"约束。
5. 执行初始化脚本（优先）：
   - `pwsh .claude/scripts/run_largebase_scan.ps1 -scan_mode [M1|M2|M3|M4] -scan_topic [topic] -scope_paths [paths...] -reference_docs [docs...]`
   - 若脚本返回 `[STOP] 未发现 scan-data.json`，必须先补齐 `scan-data.json` 再继续。

预检模板：

```markdown
## Scan Preflight
- Topic: [topic]
- Scope Paths:
  - [path_a]
  - [path_b]
- Include Docs: [true|false]
- Mode: [M1|M2|M3|M4]
- Reference Docs:
  - [path]: [用途]
  - [path]: [用途]
- Constraints:
  - 不执行业务代码
  - 不修改源码
  - 仅写 docs/scan 目录
```

---

### Step 3: 代码结构扫描（Codex）

执行策略：
- 若 `CODEBASE_MAP.md` 可用：先读 Map，再补扫当前需求增量。
- 若 Map 不可用：先尝试 Cartographer 刷新；仍不可用再按原流程执行结构扫描。

门禁约束（强制）：
- Phase A 成功后，不得通过重复全库 `find/ls/glob` 代替 Phase B/Phase C 的结构化产出。
- 允许补充读取，但必须直接服务于 `scan-data.json` 与 `00-06` 生成。
- 未产出 `scan-data.json` 与 `00-06` 前，禁止宣称"扫描完成"。
- 触发 `run_largebase_scan.ps1` 的 `[STOP]` 后，不得继续做无关文件遍历，必须优先补齐扫描产物。

要求输出：
- 目录职责图（2 层）
- 模块清单（职责、导出符号、依赖）
- 入口点清单（触发方式、调用链前 3 步）

M1 与 Cartographer Markdown 兼容规则：
- 输入可直接使用 `docs/CODEBASE_MAP.md`（Markdown）作为架构来源，不强制先转 JSON。
- 输出仍保持本流程统一合同：`00-scan-meta.json`、`01-architecture.md`、`06-exec-brief.md`。
- 映射要求：
  - `CODEBASE_MAP.md` 的模块/目录章节 → `01-architecture.md` 的模块清单
  - `CODEBASE_MAP.md` 的入口点/调用链信息 → `01-architecture.md` 的入口点清单
  - `CODEBASE_MAP.md` 的风险或注意事项 → `06-exec-brief.md` 的风险 TopN
- 若 Map 信息不足，允许补充增量扫描，但不得跳过 `01` 与 `06` 的结构化输出。

### Phase C：数据与 API 扫描（Codex，按模式选）

数据维度：
- 核心数据结构（字段、类型、用途）
- 数据流（输入→处理→输出）
- 存储层与配置常量

接口维度：
- 公共 API 签名清单（文件:行号）
- 调用关系图（仅公共接口）
- 兼容策略（默认值/适配层/双写期）

### Phase D：参考文档融合（Codex）

必须输出：
- 文档冲突矩阵
- 需求约束汇总
- "实现必须遵守"清单
- 文档同步更新清单

### Phase E：影响矩阵与执行摘要（Codex + CC）

1. 生成 `05-impact-matrix.md`
2. 生成 `06-exec-brief.md`
3. CC 根据执行摘要路由：
   - 建议任务数 `=1` → `claude-workflow-complex.md`（跳过其 Phase 0）
   - 建议任务数 `>=2` → `claude-workflow-parallel.md`
   - 扫描结论以缺陷修复为主 → `claude-workflow-debug.md`
4. 若当前使用低成本 API 扫描，CC 必须在路由前提示：
   ```
   扫描已完成，所有产物已生成。
   如果你之前切换了低成本 API，请现在切换回高质量 API（如 yunyi profile），然后重启 CC 继续审查和开发。
   ```

---

## 5. Codex Prompt 模板（可直接复制）

> 固定参数（不得更改）：
> `model: "gpt-5.3-codex"` / `sandbox: "danger-full-access"` / `approval-policy: "on-failure"`

### 5.1 全量扫描模板（M4）

```text
## Context
- 项目根目录：[DEV_DIR]
- 需求主题：[TOPIC]
- 扫描范围（可多路径）：[SCOPE_PATHS]
- 参考文档：
  - [path1]：[用途]
  - [path2]：[用途]
- 输出目录：docs/scan/[YYYY-MM-DD]-[TOPIC]/

    ## Task
    只进行扫描和分析，不修改源码。输出以下文件：
    1. 00-scan-meta.json
    2. 01-architecture.md
    3. 02-dataflow.md
    4. 03-api-surface.md
    5. 04-reference-constraints.md
    6. 05-impact-matrix.md
    7. 06-exec-brief.md
    8. scan-data.json（按 schema）
    9. scan.db（由 scan.py load 从 scan-data.json 生成）

## Output Contract
- 以表格为主，散文最少
- 每个"影响项"都要有对应"验证点"
- 必须给出"建议拆分任务数"及理由
- 每个文档结尾附"信息缺口"列表（如果有）

## Constraints
- 不执行业务代码
- 不修改源码文件
- 仅写 docs/scan 目录
```

### 5.2 多参考文档融合模板（独立调用）

```text
## Context
- 参考文档：
  - [doc_path_1]：[用途]
  - [doc_path_2]：[用途]
  - [doc_path_3]：[用途]
- 需求主题：[TOPIC]

## Task
提取与需求直接相关的约束并检测冲突，输出：
1) 文档冲突矩阵
2) 约束汇总
3) 实现必须遵守清单
4) 文档待同步更新位置

## Output Rules
- 冲突矩阵必须给"建议采用版本 + 理由"
- 所有约束必须标注来源文档
- 输出风格：结构化表格，不输出大段解释
```

---

## 6. 输出质量门禁（CC 必查）

`00-scan-meta.json` 检查：
- 是否记录模式、范围、参考文档、生成时间
- 是否包含文件统计（模块数、入口点数、公共 API 数）

`01-05` 文档检查：
- 是否均为结构化表格主导
- 是否有"文件/函数/行号"级别引用
- 是否覆盖本次需求关键词
- 是否给出缺口与不确定项

`06-exec-brief.md` 检查：
- 是否明确任务拆分数
- 是否明确最高风险点
- 是否给出下一流程路由建议

`scan.db` 检查（M2/M3/M4）：
- 是否可打开并包含核心表（modules/functions/impact_items）
- 是否可执行基本查询（函数名或模块名查询有结果/可返回空且不报错）

若任何一项失败：
- 禁止进入开发阶段
- 通过 `codex_reply` 要求补齐，不允许 CC 自行脑补

**验证门禁**（进入开发路由前必须自问）：
- ✓ 「Staff Engineer 看到这份扫描包会认为足够完整吗？」
- ✓ 扫描过程中发现的可复用经验/陷阱 → 写入 `tasks/lessons.md`

> 参见 `claude-workflow-constants.md` 中的「Self-Improvement 全局规则」

---

## 7. memory-system 参考示例（精简）

以 `D:\Workplace\Code\memory-system` 为例，扫描包里至少应出现：

`01-architecture.md`：
- 模块：`scripts/memory.py`
- 参考文档：`references/config.md`
- 入口点：`index/search/add/status/cleanup` 子命令

`02-dataflow.md`：
- 核心存储：`memory.sqlite`（`files/chunks/chunks_fts`）
- 增量策略：基于 SHA256 跳过未变化文件
- 检索链路：向量检索 + FTS 混合评分

`04-reference-constraints.md`：
- 关键参数：`CHUNK_MAX_CHARS`、`VECTOR_WEIGHT`、`DEFAULT_MIN_SCORE`
- 约束影响：参数变更触发重建索引或召回变化

---

## 8. 反模式

| 错误做法 | 后果 | 正确做法 |
|---------|------|---------|
| 扫描结论只有散文 | 不能用于后续自动化提取 | 强制产出表格+JSON |
| 扫描后继续全库 grep | 重复消耗上下文 | 只读扫描包中列出的目标文件 |
| 初始化后反复 `find/ls/glob` | 流程停留在浏览阶段，无法闭环 | 必须推进到 `scan-data.json -> load -> query` |
| 不做参考文档冲突检测 | 实现与文档不一致 | 先产出 `04-reference-constraints.md` |
| 未生成影响矩阵就开始改码 | 回归范围失控 | 先完成 `05-impact-matrix.md` |

---

## 9. 与 Skill 的衔接

在大型代码库场景，建议优先触发 `.claude/skills/largebase-structured-scan/SKILL.md`。

该 skill 提供：
- `extract` 子命令：本地零 token 提取代码结构（import/函数/类/入口点）
- `scan` + `load` + `query`：结构化扫描全链路
- `export-to-claude-md`：扫描摘要自动写入 CLAUDE.md
- 统一输出合同（`00-06` 扫描包）
- Cartographer 可选集成（用户自选）
