# 01 - Architecture

> 生成时间: 2026-03-04T20:23
> 扫描范围: src, config, docs

## 目录职责（2层）

| 目录 | 职责 | 文件数 | LOC |
|------|------|--------|-----|
| `src/` | 游戏核心逻辑、模块化功能 | 34 | 21005 |
| `src/modules/` | 21个游戏模块（01-21） | 21 | ~18000 |
| `src/config/` | 配置加载器 | 1 | ~50 |
| `config/` | JSON配置文件（游戏机制、生物群系、关卡） | ~10 | N/A |
| `docs/` | 文档、计划、扫描结果 | 217 | N/A |

## 模块清单

| 模块 | 路径 | 职责 | 导出符号（前20） | 依赖 | 文件数 | LOC |
|------|------|------|------------------|------|--------|-----|
| `src` | `src` | 游戏主模块，包含存储、配置、音频、渲染、物理、游戏循环等 | clone, exportSaveCode, importSaveCode, loadJsonWithFallback, mergeDeep, clamp, parseKeyCodes, ensureAudioContext, ensureSpeechReady, ensureSpeechVoices, pickVoice, getNativeTts, speakNativeTts, normalizeSpeechText, buildOnlineTtsUrl, playOnlineTtsSequence, setupBgm, applyBgmSetting, unlockAudio, ... (共609个) | 无外部依赖 | 34 | 21005 |

## 入口点清单

| 名称 | 类型 | 触发方式 | 文件位置 | 调用链（前3步） |
|------|------|----------|----------|----------------|
| Game Loop | HTML/JS | 打开 Game.html | `src/modules/13-game-loop.js` | 1. 加载配置 → 2. 初始化游戏状态 → 3. requestAnimationFrame 循环 |

## 关键模块说明

### src/modules/ (21个模块)

| 模块文件 | 职责 |
|---------|------|
| `01-config.js` | 全局配置与默认值 |
| `02-utils.js` | 工具函数（mergeDeep, clamp, parseKeyCodes） |
| `03-audio.js` | 音频系统（BGM、TTS、语音合成） |
| `04-vocab.js` | 词汇系统（加载、旋转、防重复） |
| `05-render.js` | Canvas 2D 渲染 |
| `06-physics.js` | 物理引擎（重力、碰撞、AABB） |
| `07-player.js` | 玩家控制（移动、跳跃、双跳） |
| `08-enemy.js` | 敌人AI与生成 |
| `09-item.js` | 道具系统（金币、词汇卡片） |
| `10-ui.js` | UI渲染（HUD、菜单、设置） |
| `11-biome.js` | 生物群系系统 |
| `12-level.js` | 关卡管理 |
| `13-game-loop.js` | 核心游戏循环 |
| `14-input.js` | 输入处理（键盘、触摸） |
| `15-camera.js` | 相机滚动 |
| `16-particle.js` | 粒子效果 |
| `17-animation.js` | 动画系统 |
| `18-collision.js` | 碰撞检测 |
| `19-save.js` | 存档管理 |
| `20-achievement.js` | 成就系统 |
| `21-tutorial.js` | 教程系统 |

### config/ (JSON配置)

| 文件 | 用途 |
|------|------|
| `game.json` | 物理参数、评分、难度、战利品表 |
| `biomes.json` | 生物群系定义（草原、雪地、洞穴、森林、沙漠） |
| `controls.json` | 键盘/触摸控制映射 |
| `levels.json` | 关卡进度 |

## 信息缺口

- 未扫描 `android-app/` 目录（Capacitor Android 构建）
- 未扫描 `words/vocabs/` 目录（词汇包）
- 未分析模块间的实际调用关系（需运行时分析或深度静态分析）
