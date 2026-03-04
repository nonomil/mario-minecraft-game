# Output Contract

## 必须产物

| 编号 | 文件 | 验收标准 |
|------|------|---------|
| 00 | `00-scan-meta.json` | 包含模式、范围、参考文档、时间戳、统计信息 |
| 01 | `01-architecture.md` | 含目录职责、模块清单、入口点清单 |
| 02 | `02-dataflow.md` | 含核心结构、主数据流、存储层清单 |
| 03 | `03-api-surface.md` | 含公共 API、调用关系、兼容策略 |
| 04 | `04-reference-constraints.md` | 含冲突矩阵、约束汇总、文档更新点 |
| 05 | `05-impact-matrix.md` | 每个修改点均有直接/间接影响和验证点 |
| 06 | `06-exec-brief.md` | 明确任务拆分数、最高风险、下一流程建议 |
| DB | `scan.db` | M2/M3/M4 模式必须生成，可执行基础查询 |

## 可选产物（Cartographer 集成）

| 文件 | 触发条件 | 验收标准 |
|------|---------|---------|
| `docs/CODEBASE_MAP.md` | 已安装并运行 Cartographer | 文件可读取，包含 `Generated at:` 与 `Scope:` 元信息 |

## 结构化要求

- 以表格或 JSON 为主，避免长篇散文
- 关键结论要可追溯：文件路径、函数名、行号、文档来源
- 无法确认的信息必须显式标注为"信息缺口"，不得猜测

## Guardrails（Cartographer 并存）

- 若 `docs/CODEBASE_MAP.md` 可用，优先将其作为参考输入，再补充增量扫描。
- 若 `docs/CODEBASE_MAP.md` 不可用（缺失、过期、格式不完整、scope 不匹配），不可用视为缺失，必须回退原扫描流。
- `CODEBASE_MAP.md` 为可选产物，缺失本身不构成失败；仅在声明"已启用 Cartographer"但文件不可用时触发补齐。
- M1 允许直接消费 `CODEBASE_MAP.md`（Markdown），但最终仍必须输出本流程规定的结构化文档。

## 格式映射规则（M1 + Cartographer）

当 `docs/CODEBASE_MAP.md` 可用时，按以下规则映射到本流程输出：

| Cartographer 来源 | 映射目标 | 处理规则 |
|------------------|---------|---------|
| 模块/目录章节 | `01-architecture.md` 模块清单 | 直接引用，补充缺失字段 |
| 入口点/调用链信息 | `01-architecture.md` 入口点清单 | 提取函数名、文件路径、调用层级 |
| 数据流/依赖关系 | `02-dataflow.md` | 转换为数据流表格 |
| 风险/注意事项 | `06-exec-brief.md` 风险 TopN | 优先级排序，保留最高风险项 |
| 文件用途说明 | `00-scan-meta.json` refs | 作为参考文档来源记录 |

**约束**：
- 映射后仍需生成完整的 `00-06` 扫描包，不得跳过。
- 若 Map 信息不足，允许补充增量扫描，并在 `00-scan-meta.json` 中标注 `supplemental_scan: true`。

## 可选增强（CLAUDE.md 摘要导出）

- 可通过 `scan.py export-to-claude-md` 将扫描摘要写入 `CLAUDE.md`。
- 该增强不影响必须产物验收；仅在团队选择启用时执行。

## 失败判定

命中任意一条即判定失败，必须补充：

- 缺少任意必须文件
- 影响矩阵没有回归验证点
- 参考文档冲突无建议采用版本
- 执行摘要没有给任务拆分建议
- M2/M3/M4 模式未生成 `scan.db`
- `load` 命令执行后出现 schema 校验错误且未修正

## 模板对齐

- 报告模板：`.claude/templates/largebase-scan-pack-template.md`
- JSON Schema：`.claude/templates/largebase-scan.schema.json`

## 与 scan.py 的衔接

`load` 命令会对 JSON 文件执行 schema 校验，校验失败时输出缺失字段列表，不会静默跳过。
校验通过后写入 `scan.db`，并在 `scan_meta` 表写入 `load_validated=true`。
