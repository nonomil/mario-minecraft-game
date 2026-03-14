﻿﻿# 幼小衔接词库大档扩充（A+B 方案）执行计划

## Summary
在 worktree 中将“幼小衔接总词库”扩充到大档规模，并建立外部候选池（仅关键词、非直接入库），同时进行乱码扫描与 Playwright debug 验证，确保拼音/汉字/英语模式显示正常。外部来源只用于方向与候选池，不直接写入运行时词库。参考课程标准与语文教学指导作为模块结构依据，并使用公开练习资料提取题型关键词。citeturn2search0turn2search1

## Implementation Changes
1. **词库扩充（运行时）**
   - 目标规模（大档）：
     - 语文：词语≥1000、表达≥600、古诗≥150  
     - 数学：每模块≥150  
     - 英语：每模块≥250  
   - 语文扩充策略：
     - 以 `幼儿园汉字` 的 `examples` 词组为基础扩容。
     - 额外引入 `幼儿园完整词库` 的 `chinese`（长度 2–4 且所有字可映射拼音）作为补充词语池。
     - 扩大表达模板：增加前缀/场景/动作词模板，并结合更大的词语池组合生成口语短语，筛选后截取 600。
     - 古诗题目扩展：扩充季节/自然/场景词表，并组合生成标题，筛掉无法拼音映射的词，截取 ≥150。
   - 数学扩充策略：
     - 以 6 模块为单元扩展词表，每模块新增 150+ 条“概念词 + 关键词”组合，覆盖数与运算/逻辑推理/量与统计/图形与空间/应用题专项/综合实践。
     - 参考幼小衔接数学训练常见维度（观察/判断/推理/空间等）补充关键词与题型术语，仅写入运行时词库的高频术语。citeturn0search1
   - 英语扩充策略：
     - **字母模块**：使用“字母 + 字母形态 + 字母组合”扩容到 ≥250（A-Z/a-z/Aa/常见字母组合如 sh/ch/th 等）。
     - **自然拼读**：扩充 CVC/CVCE/复合音节词，覆盖常见拼读规则。
     - **发音**：扩充常见音素/辅音连读/元音组合到 ≥250。
     - **单词**：扩充高频幼小衔接词汇 ≥250。
   - 保持原 `mode` 枚举不变，仅扩充条目数量与覆盖。

2. **外部候选池（仅关键词，非运行时）**
   - 语文/数学/英语从公开练习资料与教学指导中提取“题型关键词/概念词/模块关键词”，仅写入候选池，不直接写入运行时词库。citeturn2search0turn2search1turn0search1
   - 英语候选池通过 `vocab:db:import:external` 导入为 `inactive` 状态，`sourcePack` 设为 `vocab.bridge.candidates`。
   - 语文/数学候选池以 CSV/文本报告保存，待人工审核再入库。

3. **乱码扫描**
   - 对 `幼小衔接总词库.js` 及本次新增文档/候选池文件做 `?`/`U+FFFD` 扫描。
   - 文档保持 UTF‑8 BOM，确保 Windows 编辑器可读。

4. **文档同步（不移动，仅复制）**
   - 将 worktree 中“扩充设计/实施计划”复制到主项目：  
     `docs/plan/幼小衔接设计/2026-03-13-幼小衔接词库扩充-design.md`  
     `docs/plan/幼小衔接设计/2026-03-13-幼小衔接词库扩充-implementation.md`  

## Public API / Interface Changes
- 无新增运行时 API；仅扩充词库数据与覆盖阈值测试。
- `mode` 仍限制为 `english/chinese/bilingual/pinyin`。

## Test Plan
1. 单元测试：
   - `tests/unit/bridge-vocab-pack.test.mjs`
   - `tests/unit/bridge-vocab-coverage.test.mjs`（阈值更新为大档）
   - `tests/unit/vocab-pack-switch-regression.test.mjs`
   - `tests/unit/pinyin-pack-regression.test.mjs`
   - `tests/unit/pinyin-display-mode.test.mjs`
2. Playwright Debug（聚焦词库显示与切换）：
   - `tests/e2e/specs/p1-debug-page-actions.spec.mjs`
   - `tests/e2e/specs/pinyin-mode-basic.spec.mjs`
   - `tests/e2e/specs/pinyin-quiz-basic.spec.mjs`
   - `tests/e2e/specs/p0-vocab-pack-switch.spec.mjs`

## Assumptions
- 外部资料只用于候选池关键词，不直接进入运行时词库。citeturn2search0turn2search1
- 字母模块允许包含字母组合（sh/ch/th 等）以达到大档数量。
- 运行时词库优先使用内部词源与可拼音映射词条，保证拼音显示正确性。
- 不移动/重命名任何文件，仅复制文档到目标目录。
