# 大型代码库扫描方案对比与改进

## 问题分析

### 当前 largebase.md 的不足

| 问题 | 表现 | 影响 |
|------|------|------|
| 信息压缩不足 | 全是 Markdown 表格 | 大扫描包时难以查询 |
| 无机器可读格式 | 只有 Markdown | CC 需手动解析，易出错 |
| 无索引/搜索 | 线性查找 | 查找信息低效 |
| 无增量能力 | 每次重新扫描 | 浪费 Codex token |
| 无结构化存储 | 散文 + 表格混合 | 无法自动化处理 |

### memory-system 的优势

```
memory-system 架构：
Markdown 文件 → Python 脚本 → SQLite 存储 → 向量+全文搜索
```

- ✓ 结构化存储（SQLite）
- ✓ 快速查询（索引）
- ✓ 混合搜索（向量+全文）
- ✓ 增量索引（SHA256 哈希）
- ✓ 机器可读（JSON/BLOB）

## 改进方案

### 架构设计

```
Codex 扫描
    ↓
输出 JSON 数据
    ↓
Python 脚本解析
    ↓
SQLite 存储 + 索引
    ↓
生成 Markdown 报告
    ↓
CC 基于报告制定 Plan
```

### 数据流

1. **Phase A：预检（CC）**
   - 确认范围、模式、参考文档
   - 生成预检清单

2. **Phase B：Codex 扫描**
   - 调用 Codex 执行扫描
   - 输出 JSON 数据 + Markdown 报告

3. **Phase C：数据库构建（Python）**
   - 解析 JSON
   - 写入 SQLite
   - 生成索引

4. **Phase D：质量检查（CC）**
   - 验证输出完整性
   - 检查关键信息

5. **Phase E：路由决策（CC）**
   - 根据执行摘要路由
   - 复用 scan.db 的结构化数据做快速查询

### 输出交付物

```
docs/scan/YYYY-MM-DD-[topic]/
├── 00-scan-meta.json          # 元数据 + 统计
├── 01-architecture.md         # 目录结构 + 模块清单
├── 02-dataflow.md             # 数据结构 + 数据流
├── 03-api-surface.md          # 公共 API + 调用关系
├── 04-reference-constraints.md # 文档冲突 + 约束
├── 05-impact-matrix.md        # 修改点 → 影响范围
├── 06-exec-brief.md           # 风险 + 任务拆分建议
├── scan.db                    # SQLite 数据库（可选）
└── scan-data.json             # 结构化数据汇总
```

### 数据库 Schema

8 个核心表：
- `scan_meta` — 扫描元数据
- `modules` — 模块清单
- `functions` — 公共函数
- `dataflows` — 数据流
- `data_structures` — 数据结构
- `constraints` — 约束汇总
- `impact_items` — 影响矩阵
- `reference_docs` — 参考文档

### 查询能力

```bash
# 查询函数
python3 scan.py query --query "hybrid_search" --db docs/scan/2025-02-26-topic/scan.db

# 查询模块依赖
SELECT * FROM modules WHERE dependencies LIKE '%module_b%'

# 查询影响范围
SELECT * FROM impact_items WHERE change_point = 'function_x'
```

## 与 memory-system 的对比

| 维度 | memory-system | largebase-scan |
|------|---------------|----------------|
| 用途 | 跨会话记忆搜索 | 代码库结构分析 |
| 数据源 | Markdown 文件 | Codex 扫描输出 |
| 存储 | SQLite + 向量 | SQLite + JSON |
| 搜索 | 向量+全文混合 | 结构化查询 |
| 增量 | SHA256 哈希 | 扫描日期 |
| 输出 | 搜索结果 | Markdown 报告 |

## 格式选择

### JSON vs YAML vs Markdown

| 格式 | 优点 | 缺点 | 用途 |
|------|------|------|------|
| JSON | 机器可读、通用、87% API 使用 | 不易手写 | 机器处理、存储 |
| YAML | 易读、易写 | 解析复杂、性能差 | 配置文件 |
| Markdown | 易读、易展示 | 无结构、难查询 | 人类阅读 |

**方案：三层结构**
- 存储层：JSON（机器可读）
- 数据库层：SQLite（快速查询）
- 展示层：Markdown（人类可读）

## 实施路径

### 已完成

✓ `SKILL.md` — skill 说明文档
✓ `schema.json` — SQLite schema 定义
✓ `scan.py` — Python 扫描脚本（骨架）
✓ `templates/codex-prompt-M1.txt` — M1 模式 Prompt 模板
✓ `templates/codex-prompt-M2.txt` — M2 数据流扫描模板
✓ `templates/codex-prompt-M3.txt` — M3 API 表面扫描模板
✓ `templates/codex-prompt-M4.txt` — M4 全量深度扫描模板

### 待完成

- [ ] `scan.py` 完善：Markdown 报告自动生成、增量索引

## 与 claude-workflow-largebase.md 的衔接

当前 largebase.md 中的 Codex Prompt 应改为：

```
## 使用 Skill

优先调用 largebase-structured-scan skill：

python3 .claude/skills/largebase-structured-scan/scan.py \
  --mode M1 \
  --scope src/ \
  --topic "feature-x"

然后按 skill 的 Phase 2-5 流程执行。
```

## 反模式（避免）

| 错误做法 | 后果 | 正确做法 |
|---------|------|---------|
| 扫描后继续全库 grep | 重复消耗上下文 | 直接查询 scan.db |
| 输出只有散文 | 无法自动化处理 | 强制 JSON + 表格 |
| 不做参考文档冲突检测 | 实现与文档不一致 | 必须产出 04 文档 |
| 未生成影响矩阵就改码 | 回归范围失控 | 先完成 05 文档 |

## 总结

改进方案通过引入 SQLite + JSON 的三层结构，解决了当前 Markdown 表格方案的查询效率和自动化处理问题。参考 memory-system 的设计模式，既保留了人类可读的 Markdown 报告，又提供了机器可读的结构化数据和快速查询能力。

Sources:
- [JSON vs XML vs YAML: Complete Comparison Guide 2025](https://jsonconsole.com/blog/json-vs-xml-vs-yaml-complete-comparison-data-format-selection-2025)
- [Code Mapping & AI Tools for Modern Development](https://developex.com/blog/intelligent-codebase-tools/)
- [ast-grep/ast-grep: ⚡A CLI tool for code structural search, lint and rewriting](https://github.com/ast-grep/ast-grep)
