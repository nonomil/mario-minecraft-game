# largebase-structured-scan — 大型代码库结构化扫描

## 目标流程总览

本 skill 与 Cartographer 插件协同工作，分两层完成代码库扫描：

- **Cartographer**：架构概览层，并行 Sonnet 子代理读文件 → 生成 `docs/CODEBASE_MAP.md` → 写入 `CLAUDE.md`，每次会话零成本获取上下文
- **largebase-structured-scan**：深度分析层，Codex 生成结构化 JSON → SQLite 索引 → 影响矩阵 + 约束校验，支持按需深度查询

---

## 完整执行流程

```mermaid
flowchart TD
    Start([用户触发扫描]) --> PhaseA

    subgraph PhaseA["Phase A：预检（CC 执行）"]
        A1[定义扫描范围\nscope_paths / topic / mode] --> A2
        A2{检查 docs/CODEBASE_MAP.md\n是否存在且 ≤7天?}
        A2 -->|存在且新鲜| A3[读取 Map 作为 --refs 传入]
        A2 -->|不存在或过期| A4[调用 Cartographer\n生成/刷新 CODEBASE_MAP.md]
        A4 --> A3
        A3 --> A5[初始化扫描目录\nscan.py scan --mode M4]
        A5 --> A6{scan.db 已创建?}
        A6 -->|是| PhaseB
        A6 -->|否| ERR1[❌ 中断：补跑 scan 命令]
    end

    subgraph PhaseB["Phase B：Codex 深度扫描"]
        B1[Codex 读取 CODEBASE_MAP.md\n+ scope 目录文件] --> B2
        B2[生成 scan-data.json\n含 00-06 全部文档] --> B3
        B3{scan-data.json 存在?}
        B3 -->|是| PhaseC
        B3 -->|否| ERR2[❌ 中断：禁止宣称扫描完成]
    end

    subgraph PhaseC["Phase C：数据入库"]
        C1[scan.py load\n写入 SQLite] --> C2
        C2{输出含 OK 数据加载完成?}
        C2 -->|是| PhaseD
        C2 -->|否| ERR3[❌ 中断：检查 JSON 格式]
    end

    subgraph PhaseD["Phase D：查询验证 + 路由"]
        D1[scan.py query\n验证数据库可查] --> D2
        D2[scan.py export-to-claude-md\n摘要写入 CLAUDE.md] --> D3
        D3{06-exec-brief 建议任务数?}
        D3 -->|=1| R1[→ claude-workflow-complex.md]
        D3 -->|≥2| R2[→ claude-workflow-parallel.md]
        D3 -->|缺陷主导| R3[→ claude-workflow-debug.md]
    end
```

---

## Cartographer 与 largebase-scan 分工

```mermaid
graph LR
    subgraph Cartographer["🗺️ Cartographer（架构概览层）"]
        C1[scan-codebase.py\n统计 token 数] --> C2
        C2[按 150k token 分组] --> C3
        C3[并行派发 Sonnet 子代理\n每组独立读文件分析]
        C3 --> C4[Opus 合成报告]
        C4 --> C5[docs/CODEBASE_MAP.md]
        C5 --> C6[CLAUDE.md 自动摘要\n每次会话零成本读取]
    end

    subgraph LargeScan["🔬 largebase-scan（深度分析层）"]
        L1[scan.py scan\n初始化 scan.db] --> L2
        L2[Codex 读 CODEBASE_MAP.md\n+ 业务文件] --> L3
        L3[生成 scan-data.json\n00-06 扫描包] --> L4
        L4[scan.py load\n写入 SQLite] --> L5
        L5[(scan.db\n影响矩阵/约束/API)]
        L5 --> L6[scan.py query\n按需深度查询]
    end

    Cartographer -->|CODEBASE_MAP.md 作为 --refs| LargeScan
```

---

## 并行扫描架构（Cartographer 内部）

```mermaid
sequenceDiagram
    participant Opus as Opus（编排者）
    participant Scanner as scan-codebase.py
    participant S1 as Sonnet Agent 1
    participant S2 as Sonnet Agent 2
    participant S3 as Sonnet Agent N
    participant Map as CODEBASE_MAP.md

    Opus->>Scanner: 运行扫描器，获取文件树+token数
    Scanner-->>Opus: 114 files, 274k tokens
    Opus->>Opus: 按 150k token 分组规划
    Note over Opus: 单条消息同时派发所有子代理（CRITICAL）
    par 并行执行
        Opus->>S1: 分析 .claude/ 目录（~140k tokens）
        Opus->>S2: 分析 docs/ + image-merger/（~134k tokens）
        Opus->>S3: 分析 其他模块...
    end
    S1-->>Opus: 模块分析报告
    S2-->>Opus: 模块分析报告
    S3-->>Opus: 模块分析报告
    Opus->>Opus: 合成所有报告\n去重 + 识别横切关注点
    Opus->>Map: 写入 docs/CODEBASE_MAP.md
```

---

## 扫描产物结构

```mermaid
graph TD
    Root["docs/scan/YYYY-MM-DD-topic/"] --> M["00-scan-meta.json\n扫描元数据+统计"]
    Root --> A["01-architecture.md\n目录职责+模块清单+入口点"]
    Root --> D["02-dataflow.md\n数据结构+数据流+存储层"]
    Root --> API["03-api-surface.md\n公共API+调用关系+兼容策略"]
    Root --> RC["04-reference-constraints.md\n文档冲突+约束汇总"]
    Root --> IM["05-impact-matrix.md\n修改点→直接影响→间接影响→验证点"]
    Root --> EB["06-exec-brief.md\n风险TopN+任务拆分+路由建议"]
    Root --> JSON["scan-data.json\n机器可读汇总（推荐）"]
    Root --> DB[("scan.db\nSQLite 索引\nM2/M3/M4 必产出")]

    style DB fill:#f9f,stroke:#333
    style JSON fill:#bbf,stroke:#333
```

---

## 扫描模式选择

| 模式 | 使用时机 | 输出文件 | 成本 |
|------|---------|----------|------|
| M1 | 新功能接入，摸清目录与入口 | 00, 01, 06 | 低 |
| M2 | 涉及存储/索引/转换/同步 | 00, 01, 02, 05, 06 | 中 |
| M3 | 公共函数签名或模块契约变更 | 00, 01, 03, 05, 06 | 中 |
| M4 | 大规模重构或迁移 | 全部 00-06 + scan-data.json | 高 |

---

## 三层数据架构

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" width="600" height="320">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#0891b2;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#059669;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#10b981;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <rect x="40" y="20" width="520" height="80" rx="12" fill="url(#g1)"/>
  <text x="300" y="52" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="sans-serif">Layer 3：展示层</text>
  <text x="300" y="76" text-anchor="middle" fill="#e0e7ff" font-size="13" font-family="sans-serif">Markdown 报告（01-06）— 人类可读，IDE 直接查看</text>
  <text x="300" y="115" text-anchor="middle" fill="#6366f1" font-size="22" font-family="sans-serif">↑ 生成自</text>
  <rect x="40" y="130" width="520" height="80" rx="12" fill="url(#g2)"/>
  <text x="300" y="162" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="sans-serif">Layer 2：查询层</text>
  <text x="300" y="186" text-anchor="middle" fill="#e0f2fe" font-size="13" font-family="sans-serif">SQLite（scan.db）— 索引+联查，scan.py query 按需检索</text>
  <text x="300" y="225" text-anchor="middle" fill="#0891b2" font-size="22" font-family="sans-serif">↑ 加载自</text>
  <rect x="40" y="240" width="520" height="60" rx="12" fill="url(#g3)"/>
  <text x="300" y="266" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="sans-serif">Layer 1：存储层</text>
  <text x="300" y="286" text-anchor="middle" fill="#d1fae5" font-size="13" font-family="sans-serif">JSON（scan-data.json）— 机器可读，Codex 生成，schema 校验</text>
</svg>

---

## 执行命令速查

```bash
# Step 1：初始化扫描目录
python .claude/skills/largebase-structured-scan/scan.py scan \
  --mode M4 \
  --scope .claude docs image-merger \
  --topic codebase-full-scan \
  --refs docs/CODEBASE_MAP.md

# Step 2：Codex 生成 scan-data.json（见 templates/codex-prompt-M4.txt）

# Step 3：写入 SQLite
python .claude/skills/largebase-structured-scan/scan.py load \
  --load docs/scan/YYYY-MM-DD-codebase-full-scan/scan-data.json \
  --db   docs/scan/YYYY-MM-DD-codebase-full-scan/scan.db

# Step 4：验证查询
python .claude/skills/largebase-structured-scan/scan.py query \
  --query hybrid_search \
  --type all \
  --db docs/scan/YYYY-MM-DD-codebase-full-scan/scan.db

# Step 5（可选）：摘要写入 CLAUDE.md
python .claude/skills/largebase-structured-scan/scan.py export-to-claude-md \
  --db docs/scan/YYYY-MM-DD-codebase-full-scan/scan.db \
  --claude-md CLAUDE.md
```

---

## 已知问题与修复状态

| 问题 | 状态 | 说明 |
|------|------|------|
| Cartographer 未安装 | ✅ 已修复 | git clone 到 `.claude/plugins/cartographer/` |
| tiktoken 缺失 | ✅ 已修复 | `pip install tiktoken` |
| pwsh 不可用 | ⚠️ 待修复 | `run_largebase_scan.ps1` 无法运行，需 Python 替代脚本 |
| bash hook 路径错误 | ⚠️ 待修复 | `.claude/plugins/` 下子 git 仓库导致 hook 路径解析失败 |
| Cartographer 串行派发 | ⚠️ 待修复 | 应在单条消息中同时派发所有 Sonnet 子代理 |
| Codex MCP 超时 | ⚠️ 待验证 | scan-data.json 尚未生成 |

---

## 反模式（避免）

| 错误做法 | 后果 | 正确做法 |
|---------|------|---------|
| 串行派发 Sonnet 子代理 | 扫描时间翻倍 | 单条消息并行派发所有子代理 |
| 扫描后继续全库 grep | 重复消耗上下文 | 直接查询 scan.db |
| 输出只有散文 | 无法自动化处理 | 强制 JSON + 表格 |
| 不做参考文档冲突检测 | 实现与文档不一致 | 必须产出 04 文档 |
| 未生成影响矩阵就改码 | 回归范围失控 | 先完成 05 文档 |
| scope_paths 使用 `.` | 引入 .git 等噪声 | 明确指定业务目录 |
