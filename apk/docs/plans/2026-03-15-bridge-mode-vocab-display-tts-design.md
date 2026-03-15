# 幼小衔接：三科词库 + 显示/发音规则调整

## Summary
- 拆分幼小衔接词库为语文/数学/英语三套，并引入三科轮询作为默认选择。
- 幼小衔接显示改为中文为主、拼音为辅；发音优先中文。
- 数学词条不弹单词卡，仅作为挑战/测试流程插入。

## Goals
- 新增独立词库：幼小衔接-语文/数学/英语，可在设置中固定选择。
- 默认采用三科轮询（仅在幼小衔接模式时）。
- 统一幼小衔接显示与发音规则，避免拼音/英文误占主显示。
- 数学词条不打断流程，不弹单词卡。

## Non-Goals
- 不调整现有英语/汉字/拼音词库结构。
- 不改变非幼小衔接模式的显示与发音逻辑。

## Vocab Structure
- 现有 幼小衔接总词库.js 内部已有：
  - BRIDGE_LANGUAGE_PACK（语文）
  - BRIDGE_MATH_PACK（数学）
  - BRIDGE_ENGLISH_PACK（英语）
- 新增导出数组：
  - BRIDGE_VOCAB_LANGUAGE / BRIDGE_VOCAB_MATH / BRIDGE_VOCAB_ENGLISH
- manifest.js 新增三科独立 pack：
  - ocab.bridge.language / ocab.bridge.math / ocab.bridge.english

## Default Selection & Rotation
- 新增虚拟选择项：ocab.bridge.auto（语文/数学/英语轮询，仅作为设置值，不作为真实 pack）。
- 幼小衔接模式首次选择时：默认设置为 ocab.bridge.auto。
- 轮询策略：只在三科 pack 内切换，不影响其他 stage 的 auto。

## Display Rules (Pinyin Mode)
- 圆圈/世界词/浮字：显示中文。
- 词卡：第一行中文、第二行拼音。
- 英语 pack：英文为主，拼读/音标为辅（延续英语规则）。
- 数学 pack：不弹词卡，仅作为挑战/测试插入。

## TTS Rules (Pinyin Mode)
- 优先朗读中文（zh-CN）。
- 若中文为空，允许英文兜底；不读拼音。

## Implementation Touchpoints
- words/vocabs/08_幼小衔接/幼小衔接总词库.js：导出三科数组。
- words/vocabs/manifest.js：新增三科 pack 与虚拟轮询选项（settings 专用）。
- src/modules/09-vocab.js：
  - 处理 ocab.bridge.auto 轮询
  - 调整 getDisplayContent/getBridgeDisplayContent 在 pinyin 模式下的显示顺序
- src/modules/12-challenges.js：
  - getWordDisplayContentSafe 同步显示规则
  - getSpeakSequence 改为中文优先
  - showWordCard 跳过数学词条
- src/modules/14-renderer-main.js：圆圈显示取主显示文本（已是 primaryText）。

## Testing
- Playwright 新增/更新用例：
  - 幼小衔接默认三科轮询
  - 圆圈显示中文、词卡中文+拼音顺序
  - 数学词条不弹词卡
  - pinyin 模式发音中文优先（英文兜底）

## Assumptions
- ocab.bridge.auto 只用于设置，不会加入 manifest.packs。
- 数学词条仍参与挑战/闯关逻辑。
