# Prompt Pack

## 固定参数

```text
model: "gpt-5.3-codex"
sandbox: "danger-full-access"
approval-policy: "on-failure"
```

## 全量扫描（M4）

```text
## Context
- 项目根目录：[DEV_DIR]
- 需求主题：[TOPIC]
- 扫描范围：[SCOPE]
- 参考文档：
  - [path1]：[用途]
  - [path2]：[用途]
- 输出目录：docs/scan/[YYYY-MM-DD]-[TOPIC]/

## Task
只做扫描分析，不修改源码。生成：
- 00-scan-meta.json
- 01-architecture.md
- 02-dataflow.md
- 03-api-surface.md
- 04-reference-constraints.md
- 05-impact-matrix.md
- 06-exec-brief.md
- 可选 scan-data.json（遵循 schema）

## Output Rules
- 表格优先，散文最少
- 每个高风险点必须绑定回归验证点
- 每个结论必须可追溯到文件/函数/行号或参考文档
- 信息不足时写入“信息缺口”，不要猜测

## Constraints
- 不执行业务代码
- 不修改源码
- 仅写 docs/scan 目录
```

## 多参考文档融合（独立调用）

```text
## Context
- 参考文档：
  - [doc1]
  - [doc2]
  - [doc3]
- 需求主题：[TOPIC]

## Task
输出：
1) 文档冲突矩阵
2) 约束汇总（带来源）
3) 实现必须遵守清单
4) 文档待更新位置

## Output Rules
- 冲突矩阵必须给出“建议采用版本+理由”
- 约束汇总必须标明对本需求的直接影响
```
