# Pinyin + Hanzi Learning Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 增加拼音学习模式、完善幼儿园汉字词库、引入关联驱动的测验题型，覆盖学前/一年级学习路径。  
**Architecture:** 以 `languageMode` 作为总开关，新增 `pinyin` 模式；在现有词库与挑战系统上做增量扩展，避免改动英语流程。  
**Tech Stack:** Vanilla JS modules, HTML overlay UI, vocab JS packs, Node unit tests, Playwright E2E.

---

### Task 1: Add Pinyin Mode Selection & Persistence

**Files:**
- Modify: `Game.html`
- Modify: `src/modules/08-account.js`
- Modify: `src/modules/16-events.js`
- Modify: `src/defaults.js`
- Modify: `src/storage.js`
- Modify: `src/modules/09-vocab.js`
- Modify: `src/modules/17-bootstrap.js`
- Test: `tests/e2e/specs/pinyin-mode-basic.spec.mjs`

**Step 1: Write the failing test**

```js
import { test, expect } from "@playwright/test";

test("Pinyin mode appears in overlay and persists", async ({ page }) => {
  await page.goto("http://localhost:4173/Game.html");
  await page.waitForLoadState("networkidle");

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState("networkidle");

  await expect(page.locator("#btn-overlay-language-pinyin")).toBeVisible();
  await page.click("#btn-overlay-language-pinyin");

  const current = page.locator("#overlay-language-current");
  await expect(current).toContainText("拼音学习");

  const settings = await page.evaluate(() => JSON.parse(localStorage.getItem("mmwg:settings")));
  expect(settings.languageMode).toBe("pinyin");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- --grep "Pinyin mode appears"`  
Expected: FAIL with missing selector `#btn-overlay-language-pinyin`.

**Step 3: Implement minimal UI & settings changes**

```html
<!-- Game.html: add a pinyin option next to english/chinese -->
<button class="game-btn overlay-mode-btn" id="btn-overlay-language-pinyin" type="button">
  <span class="overlay-mode-badge">PY</span>
  <span class="overlay-mode-copy">
    <span class="overlay-mode-title">拼音学习</span>
    <span class="overlay-mode-desc">拼音主显示 · 汉字辅助</span>
  </span>
</button>
```

```js
// src/defaults.js
languageMode: "english"

// src/storage.js
if (localStorage.getItem("languageMode") === null) {
  localStorage.setItem("languageMode", "english");
}

// src/modules/09-vocab.js
const allowed = ["english", "chinese", "bilingual", "pinyin"];
if (!allowed.includes(String(merged.languageMode || ""))) merged.languageMode = "english";
```

```js
// src/modules/08-account.js
const pyBtn = document.getElementById("btn-overlay-language-pinyin");
if (pyBtn) {
  pyBtn.addEventListener("click", () => {
    settings.languageMode = "pinyin";
    if (typeof saveSettings === "function") saveSettings();
    updateLanguageModeDisplay();
    showToast("已切换到拼音学习模式");
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- --grep "Pinyin mode appears"`  
Expected: PASS.

**Step 5: Commit**

```bash
git add Game.html src/modules/08-account.js src/modules/09-vocab.js src/modules/16-events.js src/modules/17-bootstrap.js src/defaults.js src/storage.js tests/e2e/specs/pinyin-mode-basic.spec.mjs
git commit -m "codex: initial implementation of pinyin mode selection"
```

---

### Task 2: Add Pinyin Vocab Pack + Manifest

**Files:**
- Create: `words/vocabs/07_拼音/常用拼音.js`
- Modify: `words/vocabs/manifest.js`
- Test: `tests/unit/pinyin-pack-regression.test.mjs`
- Modify: `tests/unit/vocab-pack-switch-regression.test.mjs`

**Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function loadPack() {
  const context = { console };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(read("words/vocabs/07_拼音/常用拼音.js"), context);
  return vm.runInContext("PINYIN_CORE_PACK", context);
}

const pack = loadPack();
assert.ok(Array.isArray(pack) && pack.length > 0, "拼音词库应存在且非空");
for (const entry of pack) {
  assert.ok(entry.pinyin && entry.base, `拼音条目必须包含 pinyin/base: ${entry.word}`);
  assert.equal(entry.mode, "pinyin", "拼音条目应标记为 pinyin 模式");
}
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/unit/pinyin-pack-regression.test.mjs`  
Expected: FAIL because pack file does not exist.

**Step 3: Create vocab pack + manifest entry**

```js
// words/vocabs/07_拼音/常用拼音.js
function createPinyinEntry({ pinyin, base, chinese, english, examples, homophones = [], nearPhones = [] }) {
  return {
    word: pinyin,
    pinyin,
    base,
    chinese,
    english,
    examples: Array.isArray(examples) ? examples : [],
    homophones,
    nearPhones,
    difficulty: "basic",
    stage: "kindergarten",
    mode: "pinyin",
    imageURLs: []
  };
}

const PINYIN_CORE_PACK = [
  createPinyinEntry({
    pinyin: "bā",
    base: "ba",
    chinese: "八",
    english: "eight",
    examples: [{ word: "八月", english: "August" }],
    homophones: ["八", "吧"],
    nearPhones: ["pa", "ma"]
  })
];
```

```js
// words/vocabs/manifest.js
window.vocabManifest.packs.push({
  id: "vocab.kindergarten.pinyin",
  title: "幼儿园拼音",
  stage: "kindergarten",
  difficulty: "basic",
  level: "full",
  weight: 1,
  mode: "pinyin",
  type: "pinyin",
  file: "words/vocabs/07_拼音/常用拼音.js",
  globals: ["PINYIN_CORE_PACK"]
});
```

**Step 4: Run test to verify it passes**

Run: `node --test tests/unit/pinyin-pack-regression.test.mjs`  
Expected: PASS.

**Step 5: Commit**

```bash
git add words/vocabs/07_拼音/常用拼音.js words/vocabs/manifest.js tests/unit/pinyin-pack-regression.test.mjs tests/unit/vocab-pack-switch-regression.test.mjs
git commit -m "codex: initial implementation of pinyin vocab pack"
```

---

### Task 3: Add Hanzi & Pinyin Relations Data

**Files:**
- Create: `words/vocabs/06_汉字/汉字关联.js`
- Create: `words/vocabs/07_拼音/拼音关联.js`
- Test: `tests/unit/hanzi-relations-regression.test.mjs`
- Test: `tests/unit/pinyin-relations-regression.test.mjs`

**Step 1: Write the failing tests**

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function load(relPath, globalName) {
  const context = { console };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8"), context);
  return vm.runInContext(globalName, context);
}

const hanziRelations = load("words/vocabs/06_汉字/汉字关联.js", "HANZI_RELATIONS");
assert.ok(hanziRelations["日"], "汉字关联应至少包含基础象形字");
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/unit/hanzi-relations-regression.test.mjs`  
Expected: FAIL because relation files do not exist.

**Step 3: Create relation datasets**

```js
// words/vocabs/06_汉字/汉字关联.js
const HANZI_RELATIONS = {
  "日": { similar: ["目", "白"], pictograph: true },
  "木": { similar: ["本", "末"], pictograph: true }
};
```

```js
// words/vocabs/07_拼音/拼音关联.js
const PINYIN_RELATIONS = {
  "ba": { tones: ["bā", "bá", "bǎ", "bà"], homophones: ["八", "吧"], near: ["pa", "ma"] }
};
```

**Step 4: Run tests to verify they pass**

Run: `node --test tests/unit/hanzi-relations-regression.test.mjs`  
Run: `node --test tests/unit/pinyin-relations-regression.test.mjs`  
Expected: PASS.

**Step 5: Commit**

```bash
git add words/vocabs/06_汉字/汉字关联.js words/vocabs/07_拼音/拼音关联.js tests/unit/hanzi-relations-regression.test.mjs tests/unit/pinyin-relations-regression.test.mjs
git commit -m "codex: initial implementation of hanzi and pinyin relations"
```

---

### Task 4: Audit + Update Kindergarten Hanzi Pack

**Files:**
- Modify: `words/vocabs/06_汉字/幼儿园汉字.js`
- Modify: `tests/unit/kindergarten-hanzi-regression.test.mjs`
- Create: `tools/vocab-db/audit-hanzi-kindergarten.mjs`

**Step 1: Write the failing audit**

```js
// tools/vocab-db/audit-hanzi-kindergarten.mjs
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

const context = { console, window: {} };
vm.createContext(context);
vm.runInContext(read("words/vocabs/06_汉字/幼儿园汉字.js"), context);
const pack = vm.runInContext("kindergartenHanzi", context);

const suspect = pack.filter((entry) => /[^\\u4e00-\\u9fff]/.test(entry.word));
if (suspect.length > 0) {
  console.error("Suspect hanzi entries:", suspect.slice(0, 10));
  process.exit(1);
}
```

**Step 2: Run audit to verify it fails when bad data exists**

Run: `node tools/vocab-db/audit-hanzi-kindergarten.mjs`  
Expected: FAIL if non-standard entries are still present.

**Step 3: Replace non-common entries**

```js
// words/vocabs/06_汉字/幼儿园汉字.js
createHanziEntry({ character: "家", pinyin: "jiā", english: "home", examples: [["回家", "go home"]] });
```

**Step 4: Run audit + unit test**

Run: `node tools/vocab-db/audit-hanzi-kindergarten.mjs`  
Run: `node --test tests/unit/kindergarten-hanzi-regression.test.mjs`  
Expected: PASS.

**Step 5: Commit**

```bash
git add words/vocabs/06_汉字/幼儿园汉字.js tools/vocab-db/audit-hanzi-kindergarten.mjs tests/unit/kindergarten-hanzi-regression.test.mjs
git commit -m "claude-review: fix edge cases in kindergarten hanzi pack"
```

---

### Task 5: Add Pinyin + Hanzi Quiz Routing

**Files:**
- Modify: `src/modules/12-challenges.js`
- Modify: `src/modules/09-vocab.js`
- Test: `tests/e2e/specs/pinyin-quiz-basic.spec.mjs`

**Step 1: Write the failing test**

```js
import { test, expect } from "@playwright/test";

test("Pinyin quiz renders pinyin prompts", async ({ page }) => {
  await page.goto("http://localhost:4173/Game.html");
  await page.waitForLoadState("networkidle");

  await page.evaluate(() => {
    localStorage.setItem("mmwg:settings", JSON.stringify({ languageMode: "pinyin" }));
  });
  await page.reload();
  await page.waitForLoadState("networkidle");

  await expect(page.locator(".challenge-title")).toContainText("拼音");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- --grep "Pinyin quiz renders"`  
Expected: FAIL because quiz does not support pinyin mode.

**Step 3: Add routing logic**

```js
// src/modules/12-challenges.js
function getLanguageModeSafe() {
  const mode = settings.languageMode || "english";
  return ["english", "chinese", "bilingual", "pinyin"].includes(mode) ? mode : "english";
}

function buildChallengeByMode() {
  const mode = getLanguageModeSafe();
  if (mode === "pinyin") return buildPinyinChallenge();
  if (mode === "chinese") return buildHanziChallenge();
  return buildEnglishChallenge();
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- --grep "Pinyin quiz renders"`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/12-challenges.js src/modules/09-vocab.js tests/e2e/specs/pinyin-quiz-basic.spec.mjs
git commit -m "codex: initial implementation of pinyin quiz routing"
```
