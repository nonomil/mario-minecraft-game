﻿# 幼小衔接词库设计 Implementation Plan（A+B 扩充）

版本：2026-03-13

## 目标
- 在 worktree 中完成幼小衔接总词库的大档扩充，并保留旧包兼容。
- 建立外部候选池（仅关键词），不直接进入运行时词库。
- 进行乱码扫描并完成 Playwright debug 验证。

## 执行步骤
1. 读取现有词库与 manifest，确认包加载与 mode 枚举不变。
2. 更新 manifest：将 幼儿园完整词库.js 纳入 vocab.bridge.full 及旧包文件列表，保证拼音映射可用。
3. 扩充语文：基于幼儿园汉字 examples 与幼儿园完整词库中文条目扩充词语；表达用模板组合；古诗用季节与场景组合生成标题。
4. 扩充数学：六大模块各补充高频概念与题型关键词，确保每模块数量达标。
5. 扩充英语：字母、自然拼读、发音、单词四模块扩容，并补充常见字母组合与拼读规则。
6. 候选池：整理语文与数学题型关键词为 CSV；英语候选池导入为 inactive。
7. 乱码扫描：检查词库文件、候选池与文档是否存在乱码或问号替代字符。
8. 更新单元测试阈值与回归用例，确保包映射与模式切换正确。
9. 运行 Playwright debug 测试，覆盖拼音模式、测验与包切换。

## 关键文件
- words/vocabs/08_幼小衔接/幼小衔接总词库.js
- words/vocabs/manifest.js
- tests/unit/bridge-vocab-coverage.test.mjs
- reports/vocab_db/bridge_candidates_zh_math.csv
- reports/vocab_db/bridge_candidates_en.csv

## 测试命令（示例）
    =4290
    npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p1-debug-page-actions.spec.mjs tests/e2e/specs/pinyin-mode-basic.spec.mjs tests/e2e/specs/pinyin-quiz-basic.spec.mjs tests/e2e/specs/p0-vocab-pack-switch.spec.mjs --reporter=line

## 验收要点
- 语文/数学/英语模块数量达到大档阈值。
- 旧包 ID 可正常映射到新总包。
- 拼音模式弹窗与测验显示正确。
- 文档与词库文件无乱码。
