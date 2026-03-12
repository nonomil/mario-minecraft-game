# Pinyin + Hanzi Learning Optimization Design

**Date:** 2026-03-12  
**Goal:** 为学前/一年级（内地教材体系）建立“拼音学习 + 汉字学习”双轨优化方案，覆盖入口、词库、关联结构与测验题型。  
**Confirmed Direction:** Hybrid（国家标准边界 + 高频场景排序）。

---

## 1. Existing Context

现有项目已有以下基础可复用：

- 入口与模式：`src/modules/08-account.js` 提供“英语/汉字学习”模式选择。
- 词库组织：`words/vocabs/manifest.js` 已支持 `mode: "chinese"` 的汉字包。
- 拼音显示：`src/modules/09-vocab.js` 与 `src/modules/16-events.js` 已支持 `showPinyin` 设置。
- 挑战系统：`src/modules/12-challenges.js` 已有中文模式题型与题目生成逻辑。

---

## 2. Goals

- 首页第一弹窗提供“英语/汉字/拼音学习”入口，拼音为新增独立模式。
- `幼儿园汉字` 词库保留规模但替换不常用或不适龄内容。
- 新增拼音词库与关联数据，覆盖声母、韵母、整体认读与声调。
- 汉字与拼音测验题型与英语明显区分，强调认形、认音与辨析。
- 兼容现有英语与汉字流程，不做大规模重构。

## Non-Goals

- 不重写既有英语学习与挑战系统。
- 不引入新大型 UI 模块或复杂账户体系变更。
- 不在本轮引入语音识别或外部语音服务依赖。

---

## 3. User Flow

1. 启动游戏 → 首页第一弹窗展示学习模式选择（英语/汉字/拼音）。
2. 选择“拼音学习”进入拼音词库学习流程。
3. 拼音学习以“拼读 + 例字 + 例词 + 图示”为主线。
4. 测验阶段根据模式触发对应题型与候选生成策略。

---

## 4. Data Model

### 4.1 Pinyin Entry Shape

```js
{
  word: "bā",
  pinyin: "bā",
  base: "ba",
  chinese: "八",
  english: "eight",
  examples: [{ word: "八月", english: "August" }],
  homophones: ["八", "吧"],
  nearPhones: ["pa", "ma"],
  stage: "kindergarten",
  difficulty: "basic",
  mode: "pinyin"
}
```

### 4.2 Hanzi Relations Shape

```js
{
  "日": { similar: ["目", "白"], pictograph: true },
  "木": { similar: ["本", "末"], pictograph: true }
}
```

### 4.3 Pinyin Relations Shape

```js
{
  "ba": {
    tones: ["bā", "bá", "bǎ", "bà"],
    homophones: ["八", "吧", "巴"],
    near: ["pa", "ma"]
  }
}
```

---

## 5. Quiz Design

### Hanzi Quiz Types

- 认形：图片/释义 → 选汉字
- 认音：拼音 → 选汉字
- 补字：词语缺字 → 选汉字
- 形近辨析：形近字池 → 选目标字

### Pinyin Quiz Types

- 拼音识别：汉字/图片 → 选拼音
- 声调辨别：同音拼音 → 选正确声调
- 拼读组合：声母 + 韵母 → 选完整拼音
- 同音/近音：同音字/近音拼音 → 选匹配项

---

## 6. Data Pipeline & QA

- 以《通用规范汉字表》为字表边界，结合一年级语文识字目标做筛选。
- 拼音生成基于《汉语拼音方案》规则。
- 自动校验：字段完整性、重复率、词语长度、冷僻字占比。
- 人工复核：高频生活词优先、幼龄适配性检查。

---

## 7. Risks & Guards

- **词库质量漂移**：引入“自动校验脚本 + 人工复核清单”双轨控制。
- **模式耦合**：所有新逻辑只在 `languageMode === "pinyin"` 或 `mode === "pinyin"` 下生效。
- **体验负担**：拼音题目题量小、反馈快、失败无惩罚。
