# Largebase Scan Pack 模板

> 输出目录：`docs/scan/YYYY-MM-DD-[topic]/`

## 00-scan-meta.json

```json
{
  "topic": "",
  "mode": "M1|M2|M3|M4",
  "scope": [],
  "reference_docs": [],
  "generated_at": "",
  "stats": {
    "modules": 0,
    "entry_points": 0,
    "public_apis": 0,
    "core_data_structures": 0
  }
}
```

## 01-architecture.md

### 目录职责图（2层）

```text
project/
├── src/           # 业务主目录
│   ├── module_a/  # ...
│   └── module_b/  # ...
├── tests/         # 测试
└── docs/          # 文档
```

### 模块清单

| 模块/文件 | 职责 | 对外符号 | 依赖模块 |
|----------|------|---------|---------|
| `src/x.py` | | | |

### 入口点清单

| 入口 | 类型 | 触发方式 | 调用链前3步 |
|------|------|---------|------------|
| `main()` | CLI | `python x.py` | `main -> ...` |

## 02-dataflow.md

### 核心数据结构

| 结构 | 字段 | 类型 | 用途 | 文件:行号 |
|------|------|------|------|----------|
| `Record` | `id` | `str` | 主键 | `src/x.py:10` |

### 主流程数据流

| 流程名 | 输入 | 处理链路 | 输出 | 副作用 |
|-------|------|---------|------|-------|
| `search_flow` | query | parse -> score -> merge | result list | sqlite read |

### 存储层清单

| 存储 | 类型 | Schema/格式 | 读写位置 |
|------|------|------------|---------|
| `memory.sqlite` | SQLite | `files/chunks/...` | `scripts/memory.py:xxx` |

## 03-api-surface.md

### 公共 API 签名

| 名称 | 签名 | 文件:行号 | 调用方 |
|------|------|----------|-------|
| `hybrid_search` | `(conn, query, top_k, min_score)` | `scripts/memory.py:413` | `cmd_search` |

### 调用关系（公共接口）

```text
cmd_search
  └── hybrid_search
      ├── vector_search
      └── fts_search
```

### 兼容策略

| 接口变更 | 影响范围 | 兼容方案 |
|---------|---------|---------|
| 增加参数 | 旧调用方 | 参数默认值 |

## 04-reference-constraints.md

### 文档冲突矩阵

| 文档A | 文档B | 冲突点 | 建议采用 | 理由 |
|------|------|-------|---------|------|
| `README.md` | `config.md` | 默认值不一致 | `config.md` | 更新时间更新 |

### 约束汇总

| 约束来源 | 约束内容 | 对需求影响 |
|---------|---------|-----------|
| `references/config.md` | `CHUNK_MAX_CHARS=1600` | 分块逻辑变更需同步 |

### 文档待更新

| 文档 | 章节 | 原因 |
|------|------|------|
| `references/config.md` | 参数表 | 新增参数 |

## 05-impact-matrix.md

| 修改点 | 直接影响 | 间接影响 | 回归验证点 | 风险等级 |
|-------|---------|---------|-----------|---------|
| `chunk_markdown()` | 索引内容变化 | 检索排序变化 | 重建索引后查询一致性 | 高 |

## 06-exec-brief.md

- 建议拆分任务数：`N`
- 最高风险点：`...`
- 可先落地低风险模块：`...`
- 推荐路由：`complex | parallel | debug`
- 信息缺口：
  - `...`

## scan.db（M2/M3/M4 推荐）

- 由 `scan.py load --load scan-data.json --db scan.db` 生成
- 至少包含表：`modules`、`functions`、`impact_items`
