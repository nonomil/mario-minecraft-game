# 04 - Reference Constraints

> 生成时间: 2026-03-04T20:23
> 扫描范围: src, config, docs
> 参考文档: CLAUDE.md, docs/scan/2026-03-04-full-codebase-scan/CODEBASE_MAP.md

## 文档冲突矩阵

| 约束主题 | 文档A | 文档B | 冲突描述 | 建议采用 | 理由 |
|---------|-------|-------|----------|----------|------|
| 活跃开发目录 | CLAUDE.md: `mario-minecraft-game_V1/apk/` | 当前项目: `mario-minecraft-game_APK_V1.19.8/` | 路径不一致 | 当前项目路径 | CLAUDE.md 描述的是旧版本结构 |
| 模块数量 | CLAUDE.md: 21个模块（01-21） | extract-data: 1个模块 | 统计口径不同 | 21个模块（逻辑划分） | extract 将所有 src 视为单模块，实际有21个功能模块 |

**结论**: 无严重冲突，主要是路径差异和统计口径差异。

## 约束汇总（带来源）

| 约束ID | 来源文档 | 约束内容 | 对本次扫描的影响 | 必须遵守 |
|--------|---------|----------|-----------------|---------|
| C1 | CLAUDE.md | 技术栈: Pure HTML5/CSS3/JavaScript (ES6), Canvas API, Web Audio/Speech Synthesis API, LocalStorage | 扫描范围限定为前端代码，无后端 | ✓ |
| C2 | CLAUDE.md | 活跃开发区: `mario-minecraft-game_V1/apk/` | 当前项目路径不同，需调整 | ✓ |
| C3 | CLAUDE.md | 核心模块: `src/modules/01-21` | 扫描需覆盖所有21个模块 | ✓ |
| C4 | CLAUDE.md | 配置驱动设计: `config/*.json` | 扫描需包含配置文件 | ✓ |
| C5 | CLAUDE.md | 词汇包结构: `words/vocabs/*/manifest.json + words.json` | 未扫描词汇包目录 | ✗ (信息缺口) |
| C6 | CLAUDE.md | 游戏循环模式: 单体循环 `13-game-loop.js` | 扫描需识别入口点 | ✓ |
| C7 | CLAUDE.md | 物理系统: 重力、双跳、土狼时间、跳跃缓冲、AABB碰撞 | 扫描需覆盖物理模块 | ✓ |
| C8 | CLAUDE.md | 存储: LocalStorage wrapper in `storage.js` | 扫描需覆盖存储API | ✓ |

## 实现必须遵守清单

| 规则ID | 规则内容 | 来源 | 验证方式 |
|--------|---------|------|----------|
| R1 | 所有配置必须通过 `loadJsonWithFallback` 加载，提供默认值 | CLAUDE.md + 01-config.js | 代码审查 |
| R2 | 词汇包必须在 `words/vocabs/manifest.js` 中注册 | CLAUDE.md | 检查 manifest.js |
| R3 | 游戏循环使用 requestAnimationFrame，不使用 setInterval | 游戏开发最佳实践 | 代码审查 |
| R4 | 音频必须在用户手势后解锁（`unlockAudio`） | Web Audio API 限制 | 测试 |
| R5 | LocalStorage 写入必须处理配额超限异常 | 浏览器限制 | 代码审查 + 测试 |
| R6 | Canvas 渲染必须使用相机滚动系统 | 15-camera.js | 代码审查 |
| R7 | 碰撞检测使用 AABB 算法 | CLAUDE.md | 代码审查 |

## 文档同步更新清单

| 文档路径 | 需更新内容 | 原因 | 优先级 |
|---------|-----------|------|--------|
| CLAUDE.md | 更新项目路径为 `mario-minecraft-game_APK_V1.19.8` | 路径不一致 | 高 |
| CLAUDE.md | 更新扫描摘要区块（SCAN_SUMMARY_START/END） | 本次扫描产生新数据 | 高 |
| CLAUDE.md | 补充词汇包扫描结果（如果后续扫描） | 当前未扫描 words/vocabs/ | 中 |
| docs/CODEBASE_MAP.md | 创建全局代码地图 | 当前不存在 | 中 |

## 参考文档质量评估

| 文档 | 完整性 | 准确性 | 时效性 | 问题 |
|------|--------|--------|--------|------|
| CLAUDE.md | 80% | 90% | 中（2天前扫描） | 路径不一致，部分目录未扫描 |
| CODEBASE_MAP.md | N/A | N/A | N/A | 不存在 |
| extract-data.json | 100% | 95% | 高（刚生成） | 统计口径与逻辑划分不同 |

## 约束冲突解决记录

| 冲突ID | 冲突描述 | 解决方案 | 决策人 | 决策时间 |
|--------|---------|----------|--------|----------|
| CF1 | CLAUDE.md 路径 vs 实际路径 | 以实际项目路径为准，更新 CLAUDE.md | CC | 2026-03-04 |
| CF2 | 模块数统计差异 | 采用逻辑划分（21个模块），而非物理文件统计 | CC | 2026-03-04 |

## 信息缺口

- 未扫描 `words/vocabs/` 目录，无法验证词汇包约束
- 未扫描 `android-app/` 目录，无法验证 Capacitor 集成约束
- 未分析测试覆盖率，无法验证测试约束
