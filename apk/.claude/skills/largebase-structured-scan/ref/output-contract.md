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

## 结构化要求

- 以表格或 JSON 为主，避免长篇散文
- 关键结论要可追溯：文件路径、函数名、行号、文档来源
- 无法确认的信息必须显式标注为"信息缺口"，不得猜测

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
