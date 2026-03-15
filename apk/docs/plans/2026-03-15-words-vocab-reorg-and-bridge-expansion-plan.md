# Words Vocab Reorg & Bridge Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand bridge vocab (语文/数学/英语) to target规模（800/1200/1200），完成内容级别重复扫描与幼儿园迁移清单，并保证可用性验证通过。

**Architecture:** 用一个轻量 Python 扫描脚本生成重复与迁移清单；幼小衔接三科继续采用“基础清单 + 组合生成”的方式扩充，避免大规模手工列表；E2E 通过 Playwright 检查最小数量阈值。

**Tech Stack:** JavaScript (vocab files), Python 3 (scan), Playwright (E2E).

---

### Task 1: 增加桥接词库规模校验测试（TDD）

**Files:**
- Create: `tests/e2e/specs/bridge-vocab-expansion.spec.mjs`

**Step 1: Write the failing test**

```js
import { test, expect } from '@playwright/test';

test('bridge vocab minimum counts', async ({ page }) => {
  await page.goto('http://localhost:4173/Game.html');
  await page.evaluate(() => window.setActiveVocabPack('vocab.bridge.full'));
  const counts = await page.evaluate(() => ({
    lang: window.BRIDGE_VOCAB_LANGUAGE?.length || 0,
    math: window.BRIDGE_VOCAB_MATH?.length || 0,
    eng: window.BRIDGE_VOCAB_ENGLISH?.length || 0,
    full: window.BRIDGE_VOCAB_FULL?.length || 0
  }));
  expect(counts.lang).toBeGreaterThanOrEqual(800);
  expect(counts.math).toBeGreaterThanOrEqual(1200);
  expect(counts.eng).toBeGreaterThanOrEqual(1200);
  expect(counts.full).toBeGreaterThanOrEqual(3000);
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/specs/bridge-vocab-expansion.spec.mjs --config tests/e2e/playwright.config.mjs`  
Expected: FAIL (counts below thresholds).

**Step 3: Commit**

```bash
git add tests/e2e/specs/bridge-vocab-expansion.spec.mjs
git commit -m "test: add bridge vocab expansion thresholds"
```

---

### Task 2: 内容级别重复扫描 + 幼儿园迁移清单

**Files:**
- Create: `tools/vocab/scan_vocab_duplicates.py`
- Modify: `docs/plans/2026-03-15-words-vocab-content-audit.md`

**Step 1: Write the scan script (initial version)**

```python
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[2]
VOCAB_ROOT = ROOT / "words" / "vocabs"

def normalize(text):
    return re.sub(r"[^0-9a-zA-Z\u4e00-\u9fff]+", "", text or "").lower()

def collect_vocab_files():
    return [p for p in VOCAB_ROOT.rglob("*.js") if "_archive" not in p.parts]

def extract_terms(text):
    # naive extractor for "word"/"chinese"/"english" fields
    items = re.findall(r"(?:word|chinese|english)\\s*:\\s*['\"]([^'\"]+)['\"]", text)
    return [normalize(i) for i in items if i.strip()]

def main():
    dup = {}
    for path in collect_vocab_files():
        terms = extract_terms(path.read_text(encoding="utf-8"))
        for t in terms:
            dup.setdefault(t, set()).add(str(path.relative_to(ROOT)))
    dup = {k: sorted(v) for k, v in dup.items() if len(v) > 1}
    (ROOT / "tmp").mkdir(exist_ok=True)
    (ROOT / "tmp" / "vocab_duplicates.json").write_text(
        json.dumps(dup, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

if __name__ == "__main__":
    main()
```

**Step 2: Run scan and update audit doc**

Run: `python tools/vocab/scan_vocab_duplicates.py`  
Update: append summary + “幼儿园迁移清单草案”到 `docs/plans/2026-03-15-words-vocab-content-audit.md`.

**Step 3: Commit**

```bash
git add tools/vocab/scan_vocab_duplicates.py docs/plans/2026-03-15-words-vocab-content-audit.md
git commit -m "docs: update vocab audit with duplicate scan and migration list"
```

---

### Task 3: 扩充幼小衔接-语文（到 800+）

**Files:**
- Modify: `words/vocabs/08_幼小衔接/幼小衔接_语文.js`

**Step 1: Update generator sources**

```js
const EXTRA_BASE_WORDS = [
  // 追加：家庭/校园/自然/礼貌表达等常用词
];
const EXTRA_EXPRESSIONS = [
  // 追加：常用短语/礼貌句式/日常问候
];
```

**Step 2: Run test to verify it still fails or improves**

Run: `npx playwright test tests/e2e/specs/bridge-vocab-expansion.spec.mjs --config tests/e2e/playwright.config.mjs`  
Expected: FAIL but language count closer to 800.

**Step 3: Commit**

```bash
git add words/vocabs/08_幼小衔接/幼小衔接_语文.js
git commit -m "feat: expand bridge language vocab"
```

---

### Task 4: 扩充幼小衔接-数学/英语（到 1200+）

**Files:**
- Modify: `words/vocabs/08_幼小衔接/幼小衔接_数学.js`
- Modify: `words/vocabs/08_幼小衔接/幼小衔接_英语.js`

**Step 1: Update math/english generators**

```js
// math: 时间/货币/图形/规律/统计模块追加
// english: 高频词 + 教室场景 + 动作形容词追加
```

**Step 2: Run test to verify it passes**

Run: `npx playwright test tests/e2e/specs/bridge-vocab-expansion.spec.mjs --config tests/e2e/playwright.config.mjs`  
Expected: PASS.

**Step 3: Commit**

```bash
git add words/vocabs/08_幼小衔接/幼小衔接_数学.js words/vocabs/08_幼小衔接/幼小衔接_英语.js
git commit -m "feat: expand bridge math and english vocab"
```

---

### Task 5: 汇总验证

**Step 1: Run targeted E2E**

Run: `npx playwright test tests/e2e/specs/bridge-vocab-expansion.spec.mjs --config tests/e2e/playwright.config.mjs`  
Expected: PASS.

**Step 2: Optional smoke checks**

Run: `npx playwright test tests/e2e/specs/android-pinyin-mode.spec.mjs --config tests/e2e/playwright.config.mjs`  
Expected: PASS.
