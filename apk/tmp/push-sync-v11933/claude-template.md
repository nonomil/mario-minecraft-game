# Mario × Minecraft 英语学习游戏 - 项目结构文档

## 项目概览
基于 HTML5 Canvas 的横版闯关游戏，融合 Minecraft 主题与英语单词学习，支持打包为 Android APK。玩家在不同生物群系中闯关、战斗 BOSS、收集物品，同时完成单词学习挑战。

## 技术栈
- **语言**: JavaScript (ES6+), HTML5, CSS3
- **核心技术**: Canvas 2D API, Web Audio API, Speech Synthesis API
- **移动端**: Capacitor (打包为 Android APK)
- **构建工具**: Node.js 22+, Gradle (Android)
- **测试**: Playwright (E2E 测试)
- **存储**: LocalStorage (游戏进度与设置)

## 目录结构
```
mario-minecraft-game_APK_V1.19.8/
├── Game.html                 # 游戏主入口（浏览器直接打开）
├── index.html                # PWA 入口
├── src/                      # 核心游戏逻辑
│   ├── modules/              # 游戏模块（01-21 编号）
│   ├── styles.css            # 游戏样式
│   └── config/               # 配置加载器
├── config/                   # JSON 配置文件
│   ├── game.json             # 游戏机制配置
│   ├── biomes.json           # 生物群系定义
│   ├── controls.json         # 控制映射
│   ├── levels.json           # 关卡配置
│   └── village.json          # 村庄配置
├── words/                    # 词库系统
│   ├── vocabs/               # 分级词库包
│   └── db/                   # 词库数据库（SQLite）
├── audio/                    # 音频资源
├── tools/                    # 开发工具
│   ├── serve-apk.mjs         # 开发服务器
│   ├── build-singlefile.js   # 单文件打包
│   └── vocab-db/             # 词库管理工具
├── scripts/                  # 构建脚本
│   └── sync-web.js           # 同步到 Android
├── android-app/              # Capacitor Android 项目
│   ├── android/              # Android 原生工程
│   └── web/                  # Web 资源（同步目标）
├── tests/                    # 测试套件
│   └── e2e/                  # Playwright E2E 测试
├── docs/                     # 项目文档
├── .claude/                  # Claude Code 工作流配置
└── .github/workflows/        # CI/CD 配置
```

## 核心模块说明

### 游戏引擎模块 (src/modules/)
| 模块 | 文件 | 职责 |
|------|------|------|
| 配置系统 | 01-config.js | 全局配置与默认值 |
| 工具函数 | 02-utils.js | 通用工具函数 |
| 音频系统 | 03-audio.js | 背景音乐与音效管理 |
| 武器系统 | 04-weapons.js | 武器切换与攻击逻辑 |
| 难度系统 | 05-difficulty.js | 难度缩放与平衡 |
| 生物群系 | 06-biome.js | 群系切换与环境效果 |
| 视口管理 | 07-viewport.js | 相机跟随与滚动 |
| 账户系统 | 08-account.js | 用户数据与进度 |
| 词库系统 | 09-vocab.js | 词库加载与轮换 |
| UI 系统 | 10-ui.js | 界面渲染与交互 |
| 游戏初始化 | 11-game-init.js | 游戏启动流程 |
| 学习挑战 | 12-challenges.js | 单词挑战题型 |
| 村庄挑战 | 12-village-challenges.js | 村庄学习屋挑战 |
| **游戏主循环** | 13-game-loop.js | 核心游戏循环（入口） |
| 渲染系统 | 14-renderer-*.js | 装饰/实体/主渲染 |
| 物理系统 | 15-physics.js | 碰撞检测与重力 |
| 敌人系统 | 16-enemies.js | 敌人生成与 AI |
| BOSS 系统 | 17-boss.js | BOSS 战斗逻辑 |
| 村庄系统 | 18-village.js | 村庄生成与 NPC |
| 背包系统 | 19-inventory.js | 物品管理与使用 |
| 宝箱系统 | 20-chest.js | 宝箱生成与掉落 |
| 存档系统 | 21-storage.js | LocalStorage 封装 |

### 配置驱动设计 (config/)
- **game.json**: 物理参数、评分规则、难度分级、掉落表、敌人生成规则
- **biomes.json**: 12 个生物群系定义（森林/樱花林/雪地/沙漠/蘑菇岛/山地/海洋/火山/下界/深暗/末地/天空之城）
- **controls.json**: 键盘/触控映射
- **levels.json**: 关卡进度配置
- **village.json**: 村庄建筑与 NPC 配置

### 词库系统 (words/)
- **vocabs/**: 分级词库包（幼儿园/小学低年级/小学高年级/我的世界主题）
- **db/**: SQLite 词库数据库（支持 CRUD、去重、审计、导入导出）
- **manifest.js**: 词库包注册清单

### 构建与部署
- **tools/build-singlefile.js**: 生成离线单文件 HTML（内联所有资源）
- **scripts/sync-web.js**: 同步 Web 资源到 `android-app/web/`
- **android-app/**: Capacitor 项目，打包为 APK
- **.github/workflows/android.yml**: GitHub Actions 自动构建与发布

## 关键流程

### 游戏启动流程
1. 加载 `config/*.json` 配置文件
2. 加载词库 manifest 和用户设置（LocalStorage）
3. 初始化 Canvas、音频、UI
4. 进入游戏主循环（`src/modules/13-game-loop.js`）

### 游戏主循环（requestAnimationFrame）
```
输入处理 → 物理更新 → 碰撞检测 → 敌人 AI → BOSS 逻辑 →
群系切换 → 村庄生成 → 渲染（背景/实体/UI） → 下一帧
```

### 词库轮换机制
- 支持手动选择词库包或自动轮换（`vocabSelection=auto`）
- 词条带防重复机制（已学习的词不会立即重复出现）
- 支持英文/中文双语朗读（优先 TTS，回退到在线音频）

### Android 打包流程
```bash
npm run build              # 生成离线单文件
npm run sync               # 同步到 android-app/web/
cd android-app/android
./gradlew assembleDebug    # 构建 APK
```

## 开发注意事项

### 代码组织
- **模块编号**: `src/modules/` 按 01-21 编号，反映加载顺序和依赖关系
- **配置优先**: 游戏行为尽量通过 JSON 配置，避免硬编码
- **单文件入口**: `Game.html` 是浏览器直接打开的入口，`index.html` 是 PWA 入口

### 性能优化
- Canvas 渲染使用脏矩形优化
- 敌人/装饰物超出视口时不渲染
- 词库按需加载，避免一次性加载所有词条

### 移动端适配
- 触控按键布局在 `src/styles.css` 中配置
- 支持手机/平板显示模式切换（`deviceMode: auto/phone/tablet`）
- 使用 Capacitor 原生 TTS（优于 Web Speech API）

### 词库管理
- 使用 SQLite 数据库管理词条（`words/db/words.db`）
- 提供完整的 CRUD 工具链（`npm run vocab:db:*`）
- 支持从外部词表导入（CSV/JSON）

### 测试
- E2E 测试使用 Playwright（`npm run test:e2e`）
- 测试服务器运行在 `http://localhost:4173`

### CI/CD
- GitHub Actions 自动构建 APK（`.github/workflows/android.yml`）
- 发布到 `apk-latest` Release（自动更新）
- 支持 Debug 和 Release 签名

## 模块依赖关系

### 核心依赖链
```
01-config.js (全局配置)
  ↓
02-utils.js (工具函数)
  ↓
03-audio.js, 04-weapons.js, 05-difficulty.js, 06-biome.js
  ↓
07-viewport.js, 08-account.js, 09-vocab.js
  ↓
10-ui.js, 11-game-init.js
  ↓
12-challenges.js, 12-village-challenges.js
  ↓
13-game-loop.js (主循环，依赖所有模块)
  ↓
14-renderer-*.js, 15-physics.js, 16-enemies.js, 17-boss.js
  ↓
18-village.js, 19-inventory.js, 20-chest.js, 21-storage.js
```

### 外部依赖
- **配置文件**: `config/*.json` → 所有模块
- **词库系统**: `words/vocabs/` → `09-vocab.js`
- **音频资源**: `audio/` → `03-audio.js`

## 当前任务
<!-- 在此记录当前正在进行的开发任务 -->

## 最近修改
<!-- 在此记录最近的重要修改 -->
- 2026-03-04: 初始化项目，添加 Claude Code 工作流配置
