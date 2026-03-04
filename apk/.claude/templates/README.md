# 模板文件指南

本目录包含 Claude Code + Codex MCP 协作中使用的模板文件。

---

## 📋 模板文件列表

### 1. `largebase-scan-pack-template.md`
**用途**：大型代码库扫描包的 Markdown 模板

**何时使用**：
- 执行 `claude-workflow-largebase.md` 中的结构化扫描
- 需要产出 00-06 扫描包时

**包含内容**：
- `00-scan-meta.json` — 元数据（扫描时间、范围、工具版本）
- `01-architecture.md` — 架构概览（模块划分、依赖关系）
- `02-dataflow.md` — 数据流（数据如何流动、转换）
- `03-api-surface.md` — API 表面（公开接口、签名）
- `04-reference-constraints.md` — 约束条件（性能、安全、兼容性）
- `05-impact-matrix.md` — 影响矩阵（修改影响范围）
- `06-exec-brief.md` — 执行摘要（关键发现、建议）

**输出格式**：Markdown + JSON

**参考**：见 `claude-workflow-largebase.md` 中的"扫描包标准"

---

### 2. `largebase-scan.schema.json`
**用途**：扫描包 JSON 数据的 Schema 定义

**何时使用**：
- 验证扫描结果的数据结构
- 确保扫描包符合规范

**包含内容**：
- 元数据字段定义
- 架构数据结构
- 数据流数据结构
- API 表面数据结构
- 约束条件数据结构
- 影响矩阵数据结构

**格式**：JSON Schema

**验证方法**：
```bash
python -m jsonschema -i scan-data.json largebase-scan.schema.json
```

---

### 3. `largebase-scan.sample.json`
**用途**：扫描包 JSON 数据的示例

**何时使用**：
- 学习扫描包的数据格式
- 作为参考实现

**包含内容**：
- 完整的扫描包示例数据
- 所有字段的示例值
- 注释说明各字段含义

**格式**：JSON

**用途**：参考和学习

---

### 4. `parallel-impact-scope-template.md`
**用途**：并行任务影响范围表模板

**何时使用**：
- 执行 `claude-workflow-parallel.md` 中的并行开发
- 需要定义多个任务的影响范围时

**包含内容**：
- 任务 ID 和名称
- 修改文件列表
- 影响范围（哪些模块受影响）
- 风险评估（潜在问题）
- 验证计划（如何验证修改）
- 合并顺序（任务执行顺序）

**格式**：Markdown 表格

**示例**：
```markdown
| 任务 ID | 文件 | 影响范围 | 风险 | 验证 |
|--------|------|---------|------|------|
| T1 | src/auth.ts | 认证模块 | 低 | 单元测试 |
| T2 | src/api.ts | API 模块 | 中 | 集成测试 |
```

**参考**：见 `claude-workflow-parallel.md` 中的"影响范围分析"

---

## 🔄 模板使用流程

### 大型库扫描流程
1. 读取 `largebase-scan-pack-template.md`
2. 按模板结构产出 00-06 扫描包
3. 使用 `largebase-scan.schema.json` 验证数据结构
4. 参考 `largebase-scan.sample.json` 确保格式正确

### 并行开发流程
1. 读取 `parallel-impact-scope-template.md`
2. 为每个任务填写影响范围表
3. 使用表格定义任务边界和验证计划
4. 按表格中的合并顺序执行任务

---

## 📝 模板定制

### 添加新模板
1. 在本目录下创建新文件（命名规则：`[用途]-template.[格式]`）
2. 在本文档中记录用途和使用方式
3. 在对应工作流文档中引用

### 修改现有模板
1. 编辑模板文件
2. 更新本文档中的说明
3. 确保向后兼容（不破坏现有使用）

---

## 🔗 相关文档

- `../workflows/claude-workflow-largebase.md` — 大型库工作流（使用扫描包模板）
- `../workflows/claude-workflow-parallel.md` — 并行开发工作流（使用影响范围模板）
- `../workflows/claude-workflow-constants.md` — 全局约束（扫描包标准）
- `../README.md` — .claude 目录完整指南
