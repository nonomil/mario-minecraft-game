﻿﻿# 幼小衔接词库扩充 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 补齐幼小衔接总词库的语文/数学/英语模块覆盖，并用测试保证各模块数量与字段完整性。

**Architecture:** 扩展 `words/vocabs/08_幼小衔接/幼小衔接总词库.js`，新增语文词语/古诗/表达，以及数学/英语各模块条目；新增模块覆盖测试与最小数量校验。

**Tech Stack:** Vanilla JS vocab packs + Node VM tests (mjs).

---

### Task 1: 新增模块覆盖数量测试（红）

**Files:**
- Create: `tests/unit/bridge-vocab-coverage.test.mjs`

**Step 1: Write the failing test**

```javascript
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runInContext(context, relPath) {
  vm.runInContext(read(relPath), context, { filename: relPath });
}

function loadBridgePack() {
  const context = { console };
  context.window = context;
  vm.createContext(context);
  runInContext(context, "words/vocabs/06_??/?????.js");
  runInContext(context, "words/vocabs/07_??/????.js");
  runInContext(context, "words/vocabs/08_????/???????.js");
  return vm.runInContext("BRIDGE_VOCAB_FULL", context) || [];
}

const pack = loadBridgePack();
assert.ok(pack.length > 0, "bridge vocab pack should not be empty");

const moduleCounts = {};
for (const entry of pack) {
  if (!entry || !entry.subject || !entry.module) continue;
  const key = `${entry.subject}::${entry.module}`;
  moduleCounts[key] = (moduleCounts[key] || 0) + 1;
}

const requiredCounts = [
  ["language", "??", 200],
  ["language", "??", 120],
  ["language", "??", 40],
  ["math", "????", 20],
  ["math", "????", 20],
  ["math", "????", 20],
  ["math", "?????", 20],
  ["math", "?????", 20],
  ["math", "????", 20],
  ["english", "??", 40],
  ["english", "????", 40],
  ["english", "??", 40],
  ["english", "??", 40]
];

for (const [subject, moduleName, minCount] of requiredCounts) {
  const key = `${subject}::${moduleName}`;
  const actual = moduleCounts[key] || 0;
  assert.ok(
    actual >= minCount,
    `${key} should have at least ${minCount} entries, got ${actual}`
  );
}
```

**Step 2: Run test to verify it fails**

Run: `node tests/unit/bridge-vocab-coverage.test.mjs`  
Expected: FAIL（当前 math/english 与语文新模块数量不足）

**Step 3: Commit**

```bash
git add tests/unit/bridge-vocab-coverage.test.mjs
git commit -m "test: add bridge vocab coverage checks"
```

---

### Task 2: 扩充幼小衔接总词库（绿）

**Files:**
- Modify: `words/vocabs/08_????/???????.js`

**Step 1: Add language word/poem/expression entries**

添加 `词语/古诗/表达` 三类条目，满足数量要求。  
字段要求：
- `subject: "language"`
- `module: "??" | "??" | "??"`
- `word/chinese/pinyin` 均必填
- `mode: "chinese"`
- `tags` 中为约 80 条标记 `??` 或 `??`

**Step 2: Add math entries (120 total)**

添加 6 个模块各 20 条。字段要求：
- `subject: "math"`
- `module` 对应模块
- `word` 中文概念词
- `concept` 或 `keywords` 至少一个
- `mode: "chinese"`

**Step 3: Add english entries (160 total)**

添加 4 个模块各 40 条。字段要求：
- `subject: "english"`
- `module` 对应模块
- `word` 与 `english` 一致
- `mode: "english"`
- `phonics` 对自然拼读/发音条目填写

**Step 4: Run tests to verify pass**

Run:
- `node tests/unit/bridge-vocab-pack.test.mjs`
- `node tests/unit/bridge-vocab-coverage.test.mjs`

Expected: PASS

**Step 5: Commit**

```bash
git add words/vocabs/08_????/???????.js
git commit -m "feat: expand bridge vocab coverage"
```

---

### Task 3: 回归测试（仅相关）

**Files:**
- No changes

**Step 1: Run focused tests**

Run:
- `node tests/unit/bridge-vocab-pack.test.mjs`
- `node tests/unit/bridge-vocab-coverage.test.mjs`
- `node tests/unit/vocab-pack-switch-regression.test.mjs`
- `node tests/unit/pinyin-pack-regression.test.mjs`

Expected: PASS

---

## Notes
- 词条应以低年级高频生活用语为主，避免偏难/过长内容。
- `控笔/描红` 作为 `tags` 处理，不单设模块。
