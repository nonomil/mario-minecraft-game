# 03 - API Surface

> 生成时间: 2026-03-04T20:23
> 扫描范围: src, config, docs

## 公共 API 清单（核心函数，共609个）

### 存储 API (src/storage.js)

| 函数名 | 签名 | 文件:行号 | 调用者 | 兼容策略 |
|--------|------|-----------|--------|----------|
| `clone` | `clone(value)` | src/storage.js:45 | 多处 | 不可变，深拷贝逻辑 |
| `exportSaveCode` | `exportSaveCode()` | src/storage.js:149 | UI导出按钮 | 返回格式不可变（Base64） |
| `importSaveCode` | `importSaveCode(code)` | src/storage.js:163 | UI导入按钮 | 必须向后兼容旧存档格式 |

### 配置 API (src/modules/01-config.js)

| 函数名 | 签名 | 文件:行号 | 调用者 | 兼容策略 |
|--------|------|-----------|--------|----------|
| `loadJsonWithFallback` | `loadJsonWithFallback(path, fallback)` | src/modules/01-config.js:14 | 游戏初始化 | 新增参数必须有默认值 |

### 工具 API (src/modules/02-utils.js)

| 函数名 | 签名 | 文件:行号 | 调用者 | 兼容策略 |
|--------|------|-----------|--------|----------|
| `mergeDeep` | `mergeDeep(target, source)` | src/modules/02-utils.js:4 | 配置合并 | 不可变，递归合并逻辑 |
| `clamp` | `clamp(value, min, max)` | src/modules/02-utils.js:18 | 物理计算 | 不可变，纯函数 |
| `parseKeyCodes` | `parseKeyCodes(raw)` | src/modules/02-utils.js:22 | 输入处理 | 返回格式不可变 |

### 音频 API (src/modules/03-audio.js)

| 函数名 | 签名 | 文件:行号 | 调用者 | 兼容策略 |
|--------|------|-----------|--------|----------|
| `ensureAudioContext` | `ensureAudioContext()` | src/modules/03-audio.js:4 | 游戏初始化 | 单例模式，幂等 |
| `ensureSpeechReady` | `ensureSpeechReady()` | src/modules/03-audio.js:11 | TTS初始化 | 异步，返回Promise |
| `speakNativeTts` | `speakNativeTts(tts, text, lang, rate)` | src/modules/03-audio.js:81 | 词汇学习 | 参数顺序不可变 |
| `setupBgm` | `setupBgm()` | src/modules/03-audio.js:151 | 游戏初始化 | 幂等，可重复调用 |
| `unlockAudio` | `unlockAudio()` | src/modules/03-audio.js:179 | 用户首次交互 | 必须在用户手势中调用 |

### 词汇 API (src/modules/04-vocab.js)

| 函数名 | 签名 | 文件:行号 | 调用者 | 兼容策略 |
|--------|------|-----------|--------|----------|
| `loadVocabPack` | `loadVocabPack(packId)` | 推测 | 游戏初始化 | 异步，返回Promise |
| `getNextWord` | `getNextWord()` | 推测 | 词汇卡片生成 | 防重复逻辑，状态依赖 |

### 渲染 API (src/modules/05-render.js)

| 函数名 | 签名 | 文件:行号 | 调用者 | 兼容策略 |
|--------|------|-----------|--------|----------|
| `renderFrame` | `renderFrame(ctx, gameState)` | 推测 | 游戏循环 | Canvas 2D API，参数顺序不可变 |

### 物理 API (src/modules/06-physics.js)

| 函数名 | 签名 | 文件:行号 | 调用者 | 兼容策略 |
|--------|------|-----------|--------|----------|
| `applyGravity` | `applyGravity(entity)` | 推测 | 游戏循环 | 修改传入对象，副作用 |
| `checkCollision` | `checkCollision(a, b)` | 推测 | 碰撞检测 | AABB算法，纯函数 |

### 游戏循环 API (src/modules/13-game-loop.js)

| 函数名 | 签名 | 文件:行号 | 调用者 | 兼容策略 |
|--------|------|-----------|--------|----------|
| `startGame` | `startGame()` | 推测 | Game.html | 入口点，不可变 |
| `gameLoop` | `gameLoop(timestamp)` | 推测 | requestAnimationFrame | 标准签名，不可变 |

## 调用关系图（核心路径）

```
Game.html
  └─> startGame() [13-game-loop.js]
       ├─> loadJsonWithFallback() [01-config.js]
       ├─> loadVocabPack() [04-vocab.js]
       ├─> setupBgm() [03-audio.js]
       └─> gameLoop() [13-game-loop.js]
            ├─> processInput() [14-input.js]
            ├─> applyGravity() [06-physics.js]
            ├─> checkCollision() [18-collision.js]
            ├─> updateEnemies() [08-enemy.js]
            └─> renderFrame() [05-render.js]
```

## 兼容性策略

| 场景 | 策略 | 示例 |
|------|------|------|
| 新增配置参数 | 提供默认值，向后兼容 | `loadJsonWithFallback(path, fallback = {})` |
| 修改存档格式 | 版本号 + 迁移函数 | `importSaveCode` 检测版本并转换 |
| 修改函数签名 | 保留旧签名，新增重载 | 不推荐，优先使用可选参数 |
| 删除废弃API | 先标记 deprecated，至少保留2个版本 | 添加 console.warn |

## 高风险 API（修改影响大）

| API | 风险等级 | 原因 | 调用者数量（估算） |
|-----|---------|------|-------------------|
| `gameLoop` | 高 | 核心循环，影响所有游戏逻辑 | 1（但被频繁调用） |
| `checkCollision` | 高 | 物理引擎基础，影响所有碰撞 | 10+ |
| `renderFrame` | 高 | 渲染入口，影响所有视觉 | 1（但被频繁调用） |
| `loadJsonWithFallback` | 中 | 配置加载，影响初始化 | 5+ |
| `speakNativeTts` | 中 | TTS核心，影响词汇学习 | 3+ |
| `exportSaveCode` | 低 | 存档导出，独立功能 | 1 |

## 信息缺口

- 未完整列出全部 609 个函数（仅列出核心 API）
- 未分析每个函数的实际调用者数量（需运行时分析）
- 未确认所有函数的参数类型和返回值
- 部分函数签名为"推测"，需代码审查确认
