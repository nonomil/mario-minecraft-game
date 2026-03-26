# Codex Prompt 模板统一说明

所有模式共享同一顶层 JSON 结构，字段命名统一。
差异仅在于**必须输出哪些字段**，已在每个模板末尾的 Required Fields 标注。

---

## codex-prompt-M1.txt

```
## Context
- 项目根目录：[DEV_DIR]
- 需求主题：[TOPIC]
- 扫描范围（可多路径）：[SCOPE_PATHS]
- 扫描模式：M1（快速架构扫描）

## Task
只做扫描分析，不修改源码。重点输出模块清单、入口点、目录约定。

## 输出格式（JSON）

{
  "scan_meta": {
    "topic": "[TOPIC]",
    "mode": "M1",
    "scope": ["[SCOPE_PATH_1]"],
    "reference_docs": [],
    "generated_at": "2026-02-28T12:00:00Z",
    "stats": {
      "modules": 0,
      "entry_points": 0,
      "public_apis": 0,
      "core_data_structures": 0
    }
  },
  "modules": [
    {
      "id": "mod:src/core",
      "path": "src/core",
      "name": "core",
      "responsibility": "一句话职责",
      "exported_symbols": ["run_pipeline"],
      "dependencies": ["src/adapters"],
      "file_count": 5,
      "loc": 1200
    }
  ],
  "entry_points": [
    {
      "id": "ep:cli_main",
      "name": "cli_main",
      "type": "cli",
      "file_path": "src/main.py",
      "line_number": 42,
      "trigger": "python -m app.main",
      "call_chain": ["main", "run_pipeline", "execute_stage"]
    }
  ]
}

## Required Fields
- scan_meta（含 topic / mode / generated_at）
- modules（含 path / name / responsibility）
- entry_points（含 name / type / file_path）

## Constraints
- 不执行任何代码，不修改任何文件
- 输出总长度 ≤ 300 行
- 必须包含所有 Required Fields
```

---

## codex-prompt-M2.txt

```
## Context
- 项目根目录：[DEV_DIR]
- 需求主题：[TOPIC]
- 扫描范围（可多路径）：[SCOPE_PATHS]
- 扫描模式：M2（数据流扫描）
- 参考文档：
  - [doc_path_1]：[用途]
  - [doc_path_2]：[用途]

## Task
只做扫描分析，不修改源码。重点覆盖数据结构、数据流、关键约束和影响矩阵。

## 输出格式（JSON）

{
  "scan_meta": {
    "topic": "[TOPIC]",
    "mode": "M2",
    "scope": ["[SCOPE_PATH_1]"],
    "reference_docs": ["[doc_path_1]"],
    "generated_at": "2026-02-28T12:00:00Z",
    "stats": { "modules": 0, "entry_points": 0, "public_apis": 0, "core_data_structures": 0 }
  },
  "modules": [
    {
      "id": "mod:src/store",
      "path": "src/store",
      "name": "store",
      "responsibility": "持久化层",
      "exported_symbols": ["save_record"],
      "dependencies": [],
      "file_count": 3,
      "loc": 400
    }
  ],
  "data_structures": [
    {
      "name": "state_store",
      "fields": [
        {"name": "id", "type": "string", "purpose": "主键"},
        {"name": "updated_at", "type": "datetime", "purpose": "更新时间"}
      ],
      "storage_layer": "src/store/models.py"
    }
  ],
  "data_flows": [
    {
      "name": "ingest_flow",
      "input": "raw_event",
      "stages": ["parse", "validate", "persist"],
      "output": "normalized_record",
      "side_effects": ["write db", "emit log"]
    }
  ],
  "reference_constraints": [
    {
      "source": "docs/config.md",
      "constraint": "BATCH_SIZE <= 500",
      "impact": "超限会导致写入失败",
      "conflict_with": "",
      "adopt": "docs/config.md",
      "priority": "high"
    }
  ],
  "impact_matrix": [
    {
      "change_point": "normalize_event",
      "direct_impact": "字段映射变化",
      "indirect_impact": "查询聚合结果可能变化",
      "validation_point": "回放样本数据并比对聚合结果",
      "risk_level": "high"
    }
  ]
}

## Required Fields
- scan_meta / modules / data_structures / data_flows
- reference_constraints（至少一条，无法确认时写"信息缺口"）
- impact_matrix（每条必须含 validation_point）

## Constraints
- 不执行业务代码，不修改任何源码文件
- 必须标注来源文件或文档（文件:行号优先）
- 信息不足时写明缺口，不得猜测
```

---

## codex-prompt-M3.txt

```
## Context
- 项目根目录：[DEV_DIR]
- 需求主题：[TOPIC]
- 扫描范围（可多路径）：[SCOPE_PATHS]
- 扫描模式：M3（API 表面扫描）
- 参考文档：
  - [doc_path_1]：[用途]

## Task
只做扫描分析，不修改源码。重点输出公共接口、调用关系、兼容策略和影响矩阵。

## 输出格式（JSON）

{
  "scan_meta": {
    "topic": "[TOPIC]",
    "mode": "M3",
    "scope": ["[SCOPE_PATH_1]"],
    "reference_docs": ["[doc_path_1]"],
    "generated_at": "2026-02-28T12:00:00Z",
    "stats": { "modules": 0, "entry_points": 0, "public_apis": 0, "core_data_structures": 0 }
  },
  "modules": [
    {
      "id": "mod:src/api",
      "path": "src/api",
      "name": "api",
      "responsibility": "提供外部接口",
      "exported_symbols": ["create_item", "get_item"],
      "dependencies": ["src/service"],
      "file_count": 2,
      "loc": 300
    }
  ],
  "entry_points": [
    {
      "id": "ep:router_post_items",
      "name": "router_post_items",
      "type": "http-route",
      "file_path": "src/api/router.py",
      "line_number": 20,
      "trigger": "POST /items",
      "call_chain": ["router_post_items", "create_item", "save_item"]
    }
  ],
  "api_surface": [
    {
      "name": "create_item",
      "signature": "(payload: dict) -> dict",
      "file_path": "src/api/items.py",
      "line_number": 88,
      "called_by": ["router_post_items"],
      "calls": ["save_item"],
      "is_public": true,
      "compatibility_strategy": "新增参数必须有默认值"
    }
  ],
  "reference_constraints": [
    {
      "source": "docs/api.md",
      "constraint": "create_item 返回字段必须包含 id",
      "impact": "影响客户端反序列化",
      "conflict_with": "",
      "adopt": "docs/api.md",
      "priority": "high"
    }
  ],
  "impact_matrix": [
    {
      "change_point": "create_item signature",
      "direct_impact": "调用方编译或运行失败风险",
      "indirect_impact": "SDK 兼容层需要同步",
      "validation_point": "契约测试 + 冒烟调用",
      "risk_level": "high"
    }
  ]
}

## Required Fields
- scan_meta / modules / entry_points / api_surface
- reference_constraints（至少一条）
- impact_matrix（每条必须含 validation_point）
- api_surface 每条必须包含 signature 与 file_path + line_number

## Constraints
- 不执行业务代码，不修改任何源码文件
- 每个高风险影响项必须有可执行验证点
```

---

## codex-prompt-M4.txt

```
## Context
- 项目根目录：[DEV_DIR]
- 需求主题：[TOPIC]
- 扫描范围（可多路径）：[SCOPE_PATHS]
- 扫描模式：M4（全量深度扫描）
- 参考文档：
  - [doc_path_1]：[用途]
  - [doc_path_2]：[用途]
  - [doc_path_3]：[用途]

## Task
只做扫描分析，不修改源码。生成完整扫描包，覆盖架构、数据、API、约束、影响和执行摘要。
必须同时产出 00-06 扫描文档与 scan-data.json。

## 输出格式（JSON）

{
  "scan_meta": {
    "topic": "[TOPIC]",
    "mode": "M4",
    "scope": ["[SCOPE_PATH_1]", "[SCOPE_PATH_2]"],
    "reference_docs": ["[doc_path_1]", "[doc_path_2]"],
    "generated_at": "2026-02-28T12:00:00Z",
    "stats": { "modules": 0, "entry_points": 0, "public_apis": 0, "core_data_structures": 0 }
  },
  "modules": [ /* 同 M1 格式 */ ],
  "entry_points": [ /* 同 M3 格式 */ ],
  "data_structures": [ /* 同 M2 格式 */ ],
  "data_flows": [ /* 同 M2 格式 */ ],
  "api_surface": [ /* 同 M3 格式 */ ],
  "reference_constraints": [ /* 同 M2 格式 */ ],
  "impact_matrix": [ /* 同 M2 格式，每条必须含 validation_point */ ]
}

## Required Fields
- 以上全部字段，缺任意一项即为失败
- impact_matrix 每条必须含 validation_point
- reference_constraints 每条冲突必须给出 adopt 建议

## Constraints
- 不执行业务代码，不修改任何源码文件
- 结论需可追溯到文件/函数/行号或参考文档来源
- 信息不足时写"信息缺口"，不得猜测
```
