# 词库扩充与图片展示改造计划

目标：在保持“可双击离线运行”的前提下，大规模扩充本项目词库；在设置中可选择词库/自动随机；并在游戏中为当前单词显示对应图片（实现方式参考 `MineCraft学单词游戏-v2`）。

更新时间：2026-02-01

---

## 1. 现状与约束

### 1.1 当前项目现状（Minecraft_Mario_Words_Game）
- 词库来源：默认内置少量单词（`src/defaults.js -> MMWG_DEFAULTS.words`），运行时会尝试 `fetch("../words/words-base.json")` 加载外部 JSON。
- 离线双击运行的关键约束：`file://` 协议下 `fetch` 往往会失败（浏览器安全策略），因此当前实现会自动回退到内置默认词库。
- 词库数据结构：`{ en, zh }`，无图片字段。
- 学习进度：`progress.words[en]` 形式按英文单词记忆次数，未区分词库来源，容易产生跨词库“同词不同义/不同难度”冲突。

### 1.2 参考项目能力（MineCraft学单词游戏-v2）
- 词库数据更丰富：`word/chinese/phonetic/phrase/difficulty/category/imageURLs[]`。
- 图片展示策略：
  - 若图片来自 `minecraft.wiki` 的 File 页面，通过 MediaWiki API 转成直链图片 URL；
  - 加载失败时展示占位图；
  - 图片可点击打开来源页面。
- 为 `file://` 兼容：采用“脚本注入加载词库 JS”的方式，避免 `fetch local json` 问题。

### 1.3 本次改造必须满足
- 仍然支持直接双击 `Game.html` 运行（不强制本地服务器）。
- 支持大量词库：按类别/难度组织，设置里可选，支持随机/混合模式。
- 支持单词图片展示：兼容网络图片与占位图；不阻塞游戏运行。
- 源词库 `d:\WorkPlace\Html\单词库` 很杂乱：需要重新整理输出为“干净的、可维护的”结构，并按要求给每个文件夹添加 README（后续执行阶段完成）。

---

## 2. 总体方案（高层架构）

### 2.1 词库资源形态：以“脚本注入的 JS 词库包”为主
原因：保持 `file://` 可运行。

- 新增：`words/vocabs/` 存放“词库包 JS”文件（非 ES Module），每个包导出到 `window.MMWG_VOCABS[packId]`。
- 新增：`words/vocabs/manifest.json`（或 `manifest.js`）提供词库列表与元信息（名称、阶段、难度、分类、是否带图片等）。
- 新增：`src/vocab-loader.js`（或集成到 `src/main.js`）负责按需注入 `<script src="...">` 加载词库包，并提供缓存避免重复加载。

兼容：继续保留 `words/words-base.json` 加载逻辑作为“开发/服务器模式”入口，但离线模式优先走词库包加载。

### 2.2 词条统一数据模型（兼容旧结构）
统一成内部使用的 `WordEntry`：
- `id`: string（建议：`standardized` 或 `packId:standardized`）
- `en`: string（展示用英文）
- `zh`: string（中文）
- `phonetic?`: string
- `phrase?`: string
- `phraseZh?`: string
- `difficulty?`: "basic" | "intermediate" | "advanced" | ...（或 A1/A2/B1）
- `category?`: string
- `stage?`: string（kindergarten / elementary_lower / ...）
- `images?`: Array<{ url: string, pageUrl?: string, filename?: string, type?: string }>
- `source?`: { name: string, url?: string, license?: string }

适配规则：
- 旧 `{ en, zh }`：映射到 `{ en, zh, id=enLower }`，images 为空。
- v2 风格 `{ word, chinese, imageURLs }`：映射到 `{ en=word, zh=chinese, images=imageURLs }`。

### 2.3 设置面板新增词库与图片选项
在现有设置中新增：
- 词库选择（单选下拉）：例如“幼儿园基础”“幼儿园全量”“小学低年级”“Minecraft 基础”“随机（每次开始随机）”“混合（从多词库混合抽取）”
- 随机模式配置：
  - `randomStrategy`: "perRun"（每次进入游戏随机选一个包） / "perSpawn"（每次生成单词随机选包） / "mixWeighted"（按权重混合）
  - `selectedPacks`: string[]（混合模式下勾选的包）
- 图片显示开关：`showWordImage: boolean`
- 图片加载策略：
  - `imageQuality`: "low" | "medium" | "high"（只影响 URL 参数/选取第几张图，不改变核心逻辑）
  - `imageClickOpenSource: boolean`

### 2.4 游戏内图片展示位置与交互
优先方案：复用现有 `word-card`（弹出的单词卡片）区域，在卡片内新增图片区域：
- 单词出现/拾取时：更新卡片文字 + 图片；
- 图片加载异步进行：先占位，成功则替换；
- 图片可点击：打开来源页面（若有 pageUrl）。

---

## 3. 词库组织与清洗方案（从“单词库”输出到本项目）

### 3.1 目标目录结构（输出到本项目）
在 `Minecraft_Mario_Words_Game/words` 下新增：
- `words/vocabs/manifest.json`
- `words/vocabs/kindergarten/`
  - `basic.pack.js`
  - `study.pack.js`
  - `nature.pack.js`
  - `daily.pack.js`
  - `communication.pack.js`
  - `general.pack.js`
  - `README.md`
- `words/vocabs/elementary/`
  - `lower.pack.js`
  - `upper.pack.js`
  - `README.md`
- `words/vocabs/minecraft/`
  - `basic.pack.js`
  - `intermediate.pack.js`
  - `advanced.pack.js`
  - `README.md`
- `words/vocabs/games/`
  - `mario.pack.js`
  - `pokemon.pack.js`
  - `animal_crossing_characters.pack.js`
  - ...
  - `README.md`

备注：
- `README.md` 的内容后续执行阶段生成（用户要求“每个文件夹添加 readme 文档”）。
- 每个 pack 文件仅负责定义数据，不做逻辑代码。

### 3.2 源数据筛选策略（单词库太杂乱的处理）
从 `d:\WorkPlace\Html\单词库` 中选择“可控、干净、可追溯”的子集作为第一批导入：
- 优先导入：
  - `vocabularies/stage/stage_kindergarten.js`
  - `vocabularies/stage/stage_elementary_lower.js`
  - `vocabularies/stage/stage_elementary_upper.js`
  - `vocabularies/minecraft/*.js`
  - `vocabularies/game_vocabularies/*/*.js`（按游戏分包）
- 暂不导入（仅保留在源目录，输出时剔除）：
  - `backups/`、`cleanup_backups/`、各种 `*.backup*`、拆分文件 `stage_split/`、脚本工具 `*.py`、压缩包 `*.zip/*.7z`、临时报告 `*.txt`

### 3.3 数据清洗与规范化规则
对每个词条执行规范化：
- 文字字段：
  - `word/standardized/en`：trim、转小写（保留原展示大小写可选）、去除多余空格；
  - 允许短语（如 `brush teeth`），但 `standardized` 统一为单空格分隔；
  - `chinese/zh`：trim；若出现乱码字符（如 `�`）标记为脏数据并剔除或进入待修复清单。
- 去重：
  - 同一 pack 内按 `standardized` 去重；
  - 跨 pack 不强制去重，但 `id` 建议包含 `packId:` 前缀，避免进度冲突。
- 图片字段：
  - 保留 `imageURLs[0]` 作为默认展示；
  - 若图片 URL 指向“页面”而非直链：记录为 `pageUrl`，并在运行时尝试转换为直链；
  - 对明显不可用/受限链接先进入“待修复列表”（后续可自动巡检）。

### 3.4 清洗输出（执行阶段会实现）
输出结果包含：
- `manifest.json`：列出所有 packs 的 `id/title/stage/difficulty/category/wordCount/hasImages/source` 等。
- 每个 pack：`*.pack.js`，内容形如：
  - `window.MMWG_VOCABS = window.MMWG_VOCABS || {};`
  - `window.MMWG_VOCABS["kindergarten.basic"] = [ ...WordEntry... ];`

---

## 4. 接入实现步骤（不在本计划阶段改代码；后续按步骤执行）

### 4.1 UI 改造（Game.html / styles.css）
1) 在设置面板新增词库选项区块：
- 下拉选择当前词库
- “随机/混合”开关与多选列表（混合模式）
- “显示图片”开关

2) 在 `word-card` 内新增图片容器：
- `<img id="word-card-image" ...>` 或 `<div id="word-card-image">`（根据样式决定）

### 4.2 运行时词库加载器（main.js）
新增能力：
- `loadVocabManifest()`：读取 `manifest`（离线优先：script 注入 manifest.js；在线可 fetch manifest.json）。
- `loadVocabPack(packId)`：注入对应 `*.pack.js`，并从 `window.MMWG_VOCABS[packId]` 取数组。
- `setActiveVocabulary(strategy/settings)`：根据设置决定 `wordDatabase` 来源：
  - 单包：`wordDatabase = packWords`
  - perSpawn：每次 `pickWordForSpawn()` 随机从一个包抽取
  - mixWeighted：从多个包合并或按权重抽取
- 在词库切换后重建 `wordPicker`（当前实现 `wordPicker` 按 `wordDatabase` 构建）。

### 4.3 图片展示逻辑（main.js）
新增能力：
- `getWordImage(wordObj)`：返回 `{ imageUrl, pageUrl }` 或 null。
- `convertToDirectImageUrl()`：参考 v2 的 MediaWiki API 转换逻辑（仅在需要时调用）。
- `showWordCard(wordObj)` 扩展：同步更新文字；异步更新图片；失败用占位图。

### 4.4 进度数据迁移
将 `progress.words` 的 key 从 `en` 升级为 `wordId`（建议 `packId:standardized`），并提供兼容迁移：
- 读取旧结构时：若存在 `progress.words["cat"]`，在当前 pack 下映射为 `progress.words["kindergarten.basic:cat"]` 或 `global:cat`。
- 保留一段时间的双写/兼容读取，避免丢失老存档。

---

## 5. 分阶段交付（建议）

### Phase A（先可用，再扩充）
- 完成 manifest + pack loader + 设置下拉选择（先导入 2~3 个 pack 验证链路）
- 完成图片展示（先支持直链图片与占位图）

### Phase B（大规模导入 + 清洗）
- 从 `单词库` 导入 kindergarten / elementary / minecraft / games 的主要 packs
- 生成每个分类文件夹的 README（包含：来源、覆盖范围、难度、维护方式）

### Phase C（体验与稳定性）
- 增加图片链接容错与缓存（localStorage 简易缓存直链转换结果）
- 增加“词库健康检查”（可选脚本：统计缺失中文、图片不可达率、重复率）
- 为小朋友优化默认配置：随机策略、图片开关、学习干扰控制

---

## 6. 验收与验证清单

- 双击 `Game.html`：
  - 能进入游戏且无报错；
  - 能在设置里看到词库列表；
  - 选择不同词库后，生成的单词确实来自对应词库；
  - 打开“随机/混合”后行为符合策略定义。
- 图片展示：
  - 有图片的词条能显示图片；
  - 图片加载失败显示占位图，不影响游戏；
  - 可点击打开来源页面（如果存在 pageUrl）。
- 性能：
  - 大词库下仍能流畅运行；
  - 词库切换不会导致长时间卡顿（必要时延迟加载/分包）。

