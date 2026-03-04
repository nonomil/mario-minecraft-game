# 02 - Dataflow

> 生成时间: 2026-03-04T20:23
> 扫描范围: src, config, docs

## 核心数据结构

| 名称 | 字段 | 类型 | 用途 | 来源文件 |
|------|------|------|------|----------|
| `gameState` | stage, score, lives, level, biome, player, enemies, items, particles | Object | 全局游戏状态 | `src/modules/13-game-loop.js` |
| `playerState` | x, y, vx, vy, onGround, canDoubleJump, health, inventory | Object | 玩家状态 | `src/modules/07-player.js` |
| `vocabPack` | id, name, grade, words[], manifest | Object | 词汇包数据 | `src/modules/04-vocab.js` |
| `config` | physics, scoring, difficulty, controls, biomes, levels | Object | 游戏配置（从JSON加载） | `src/modules/01-config.js` |
| `saveData` | progress, settings, achievements, stats | Object | 存档数据（LocalStorage） | `src/storage.js` |

## 主数据流

| 流程名称 | 输入 | 处理阶段 | 输出 | 副作用 |
|---------|------|----------|------|--------|
| **游戏初始化** | 配置文件路径 | 1. 加载 config/*.json → 2. 加载词汇包 manifest → 3. 读取 LocalStorage 设置 → 4. 初始化游戏状态 | gameState | 创建 AudioContext, 初始化 Canvas |
| **游戏循环** | 用户输入 + 当前 gameState | 1. 处理输入 → 2. 更新物理 → 3. 碰撞检测 → 4. 更新AI → 5. 渲染 | 下一帧 gameState | requestAnimationFrame 调度 |
| **词汇学习** | 玩家碰撞词汇卡片 | 1. 显示单词 → 2. TTS 发音 → 3. 记录学习进度 → 4. 更新分数 | 更新后的 playerState | 写入 LocalStorage |
| **存档保存** | 当前 gameState | 1. 序列化状态 → 2. 压缩（可选） → 3. 写入 LocalStorage | saveCode (Base64) | LocalStorage 写入 |
| **存档加载** | saveCode (Base64) | 1. 从 LocalStorage 读取 → 2. 解压 → 3. 反序列化 → 4. 验证 | 恢复的 gameState | 覆盖当前游戏状态 |

## 存储层清单

| 存储类型 | 键名 | 数据结构 | 读写位置 | 持久化策略 |
|---------|------|----------|----------|-----------|
| LocalStorage | `game_settings` | {bgm, sfx, language, difficulty} | `src/storage.js` | 每次设置变更时写入 |
| LocalStorage | `game_progress` | {level, score, achievements, stats} | `src/modules/19-save.js` | 关卡完成/手动保存时写入 |
| LocalStorage | `vocab_history` | {learnedWords[], lastRotation} | `src/modules/04-vocab.js` | 每次学习新单词时追加 |
| JSON 文件 | `config/*.json` | 游戏配置 | `src/modules/01-config.js` | 只读，启动时加载 |
| JSON 文件 | `words/vocabs/*/words.json` | 词汇包 | `src/modules/04-vocab.js` | 只读，按需加载 |

## 配置常量

| 常量名 | 默认值 | 用途 | 定义位置 |
|--------|--------|------|----------|
| `GRAVITY` | 0.8 | 重力加速度 | `config/game.json` |
| `JUMP_VELOCITY` | -12 | 跳跃初速度 | `config/game.json` |
| `PLAYER_SPEED` | 5 | 玩家移动速度 | `config/game.json` |
| `COYOTE_TIME` | 6 frames | 土狼时间（离开平台后仍可跳跃） | `config/game.json` |
| `JUMP_BUFFER` | 8 frames | 跳跃缓冲（提前按跳跃键） | `config/game.json` |
| `CHUNK_MAX_CHARS` | N/A | 词汇分块大小 | 信息缺口 |

## 数据流风险点

| 风险点 | 描述 | 影响范围 | 缓解措施 |
|--------|------|----------|----------|
| LocalStorage 配额 | 浏览器限制 5-10MB | 存档系统可能失败 | 压缩存档数据，定期清理历史 |
| 词汇包加载失败 | 网络错误或文件缺失 | 游戏无法启动 | Fallback 到默认词汇包 |
| 配置文件格式错误 | JSON 解析失败 | 游戏行为异常 | 使用 loadJsonWithFallback + 默认配置 |
| 存档数据损坏 | LocalStorage 被篡改 | 加载失败或游戏崩溃 | 验证存档格式，失败时重置 |

## 信息缺口

- 未分析词汇旋转算法的具体实现（防重复逻辑）
- 未确认 LocalStorage 的实际使用量
- 未分析 Canvas 渲染的性能瓶颈
