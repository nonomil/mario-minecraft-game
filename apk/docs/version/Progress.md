## v1.18.3（发布日期：2026-02-18）
- 类型：PATCH
- APK 版本：versionName = 1.18.3，versionCode = 104
- 主要变更
  - 樱花丛林树形优化为普通绿树 + 散落樱花花瓣
  - 单词测验长句/短语显示优化：长文本自适应字号与换行
  - 修复题目中长短语空格显示问题，统一单词间距
## v1.18.2（发布日期：2026-02-18）
- 类型：PATCH
- APK 版本：versionName = 1.18.2，versionCode = 103
- 主要变更
  - 修复草方块碰撞卡死、默认启用中文朗读、长词选项自适应缩放
  - 南瓜+雪块宝箱同出、樱花低分禁止中毒、村庄交互重构
  - 词组打乱顺序保留空格并缩小字体
## v1.18.1（发布日期：2026-02-17）
- 类型：PATCH
- APK 版本：versionName = 1.18.1，versionCode = 102
- 主要变更
  - 调试页增强：群系轮次设置、挑战快捷触发、更多敌人生成、状态面板扩展
  - 群系调试接口新增：`setBiomeVisitRound()`、`getBiomeVisitCountSnapshot()`、`getBiomeStayDebugInfo()`
  - 全量回归测试稳定性修复：`biomes-fullrun.spec.js` 与 `p0-stability.spec.js`
  - 全量 Playwright 测试通过（31/31）
## v1.18.0（发布日期：2026-02-17）
- 类型：MINOR
- APK 版本：versionName = 1.18.0，versionCode = 101
- 主要变更
  - 凋零重绘：T 形三头骨架、阶段演出、凋零之首弹幕、冲撞冲击波
  - 恶魂/烈焰人/凋零骷髅视觉重绘：外观、动作和状态反馈统一增强
  - 阶段反馈统一：阶段切换短暂无敌 + 阶段提示条 + 屏幕闪白
  - 新增 Playwright P2 测试：`tests/p2-wither-boss.spec.js`、`tests/p2-boss-visual.spec.js`
## v1.17.0（发布日期：2026-02-17）
- 类型：MINOR
- APK 版本：versionName = 1.17.0，versionCode = 100
- 主要变更
  - 群系难度分级：引入轮次计数 + 敌人分层表，首轮降低压制感
  - 群系最小停留：双阈值（分数+时间）防止快速切走
  - 海洋生态修正：禁爆 + 禁树 + 新增大型水草/珊瑚装饰
  - 火山贴地修正：黑曜石柱锚点统一（底部对齐地面向上延伸）
  - 单词挑战 UI：自适应字号 + 断词 + 按钮样式优化
  - 新增 Playwright P1 体验测试
## v1.16.0（发布日期：2026-02-17）
- 类型：MINOR
- APK 版本：versionName = 1.16.0，versionCode = 99
- 主要变更
  - 中文乱码治理：修复 18-village.js 全量乱码，建立文案集中管理（BIOME_MESSAGES / UI_TEXTS）
  - BOSS 单轨化：下线旧 ender_dragon 触发链，统一 bossArena 链路
  - 树碰撞修复：方向判定 + 推离修正，解决碰树后双向卡死
  - BOSS 场景锁定：视口锁定 + 边界墙，BOSS 战不可逃离
  - 新增 Playwright P0 稳定性测试
## v1.15.7（发布日期：2026-02-17）
- 类型：PATCH
- APK 版本：versionName = 1.15.7，versionCode = 98
- 主要变更
  - 修复樱花丛林/蘑菇岛卡死根因：GiantMushroom.onCollision() gravity 取值加完整类型检查和 NaN 防护
  - incrementMushroomBounce 调用加 try-catch 保护，防止交互链异常中断主循环
  - HotSpring steamParticles 加防御性初始化和 null 安全访问
  - RAF 循环加顶层 try-catch 护栏：异常时暂停游戏 + 显示错误覆盖层，不再无声卡死
  - 新增 Playwright 全流程遍历测试：cherry_grove 和 mushroom_island 各 8 秒持续行走 + 群系切换验证
  - 19/19 测试全部通过
## v1.15.5（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.15.5，versionCode = 96
- 主要变更
  - 单词库选择增加难度分级：每个词库类别拆分为初级/中级/高级/完整四个选项
  - 设置界面词库下拉菜单改为 optgroup 分组显示，按类别归类
  - manifest.js 从 4 个 pack 扩展为 16 个 pack（4 类别 × 4 级别）
  - renderVocabSelect() 重构为分组渲染逻辑
## v1.15.4（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.15.4，versionCode = 95
- 主要变更
  - 步骤1机制补齐：静音鞋（sculk_vein x5 合成）
  - 深暗噪音接入静音鞋减噪与耐久消耗逻辑
  - 天空之城新增左风/右风/上升气流风场，含边界与粒子可视化
  - 上升气流新增云平台奖励点与宝箱投放
  - 环境审查文档同步更新，修正步骤实现状态
## v1.15.3（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.15.3，versionCode = 94
- 主要变更
  - 补齐存档石碑交互与村庄检查点落盘
  - 补齐 6 类特色建筑交互与单次触发限制
  - 存档石碑增加已存档高亮渲染反馈
  - 新增村庄专项集成测试（save stone / special building）
  - 地狱高温与入场伤害接入 fireResistance buff 免伤
  - 同步更新村庄设计实施状态文档（v1.8.4 / v1.8.5）

## v1.15.2（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.15.2，versionCode = 93
- 主要变更
  - 粒子对象池落地：群系粒子与天气粒子复用实例，减少频繁创建/销毁
  - 游戏循环接入统一粒子发射入口（气泡/末影珍珠/龙息）
  - 保留回退路径，兼容未池化场景，避免运行时回归

## v1.15.1（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.15.1，versionCode = 92
- 主要变更
  - 地狱环境补齐：新增易碎平台机制（踩踏后破裂坠落）
  - 地狱浮空/微平台按概率生成易碎平台
  - 主循环补充易碎平台更新与回收逻辑
  - 渲染层新增易碎平台裂纹与预警反馈
  - 校准 v1.11.2 / v1.11.3 / v1.5.2 对应计划文档状态

## v1.15.0（发布日期：2026-02-16）
- 类型：MINOR
- APK 版本：versionName = 1.15.0，versionCode = 91
- 主要变更
  - 答错后展示正确答案+发音，学习模式答错不扣分可重试
  - 词卡新增例句展示（phrase/phraseZh）
  - 间隔复习算法增强：质量感知三级间隔（correct_fast/correct_slow/wrong）
  - 新增多字母填空和字母排序两种题型
  - 难度曲线平滑化：相邻 tier 线性插值
  - 游戏结束界面展示本局高频词汇
  - 词卡时长可配置、挑战频率语义化选项
  - 装饰物/粒子纳入屏幕外节流
  - 高温掉血改为真实时间计时（Date.now）
## v1.11.1（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.11.1，versionCode = 87
- 主要变更
  - 修复 BOSS/村庄状态在游戏重启时未重置的问题
  - 修复 villageConfig/settings/biomeConfigs 空值检查缺失导致的崩溃
  - 修复 showFloatingText() 缺少颜色参数支持，浮动文字现在支持彩色显示
  - 统一 apk 与 root 目录的 BOSS/村庄代码（以 apk 完善版为准）
  - 复制 GameDebug.html 调试工具到 root 目录
## v1.11.0（发布日期：2026-02-16）
- 类型：MINOR
- APK 版本：versionName = 1.11.0，versionCode = 86
- 主要变更
  - 新增 BOSS 竞技场系统：4个BOSS（凋零/恶魂/烈焰人/凋零骷髅），分别在 2000/4000/6000/8000 分触发
  - BOSS 支持2阶段狂暴、投射物、HP条、死亡奖励
  - 新增村庄系统：每500分生成一个村庄，含休息/学习/存档/特殊4种建筑
  - 村庄学习挑战：4选1答题，全对奖励钻石
  - 村庄NPC村民行走与对话
  - 新增 config/village.json 配置文件
## v1.10.3（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.10.3，versionCode = 85
- 主要变更
  - 同步版本号到 1.10.3
  - 更新版本记录（CHANGELOG / Progress）
## v1.10.2（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.10.2，versionCode = 84
- 主要变更
  - 宝箱掉落数量调整：1/2/3件概率改为 60%/30%/10%
  - 钻石掉率与掉落数量下调
  - 新增 word_card 掉落：给少量积分并展示单词，不增加背包物品
  - 新增 empty 掉落：普通宝箱可出现空箱提示
## v1.10.1（发布日期：2026-02-16）
- 类型：MINOR
- APK 版本：versionName = 1.10.1，versionCode = 83
- 主要变更
  - 深暗之域新增 Warden（含近战重击与音波）
  - 新增噪音系统（跳跃/攻击/受伤/感测器触发，满值召唤Warden）
  - 新增深暗视野限制遮罩与灵魂灯扩光
  - 深暗装饰扩展：古城遗迹柱、幽匿脉络地表
## v1.10.0（发布日期：2026-02-16）
- 类型：MINOR
- APK 版本：versionName = 1.10.0，versionCode = 82
- 主要变更
  - 火山群系背景重绘：替换通用三角山为火山锥体轮廓
  - 新增火山口发光与烟尘效果
  - 新增地表岩浆坑洞与冒泡视觉
  - 新增火山灰飘落与垂直热浪扭曲效果
## v1.9.3（发布日期：2026-02-16）
- 类型：MINOR
- APK 版本：versionName = 1.9.3，versionCode = 81
- 主要变更
  - 新增 tests/debug-pages/GameDebug.html 调试页
  - 支持群系/分数/BOSS/村庄/敌人/物品的一键调试
  - 新增无敌模式切换与实时状态面板
## v1.9.2（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.9.2，versionCode = 80
- 主要变更
  - 打通新敌人生成链路：spawnEnemyByDifficulty() 优先接入 spawnBiomeEnemy()
  - 打通新敌人渲染链路：drawEnemy() 新增 piglin/bee/fox/spore_bug/magma_cube/fire_spirit/sculk_worm/shadow_stalker
## v1.9.1（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.9.1，versionCode = 79
- 主要变更
  - 打通新装饰生成链路：generateBiomeDecorations() 接入 spawnBiomeDecoration()
  - 补充树渲染：支持 brown_mushroom/red_mushroom/cherry
## v1.9.0（发布日期：2026-02-16）
- 类型：MINOR
- APK 版本：versionName = 1.9.0，versionCode = 78
- 主要变更
  - 接入 15-entities-boss.js 到页面与离线打包链路，恢复 BOSS 触发能力
  - 补齐村庄默认配置：villageEnabled/villageFrequency/villageAutoSave
  - 旧存档兼容：normalizeSettings() 自动回填村庄设置字段
## v1.8.17（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.8.17，versionCode = 77
- 主要变更
  - 修复 `19-biome-visuals.js` 的 `ctx.ellipse` 参数缺失导致的首页崩溃
  - 解决“地面闪现后消失、控制无响应”的主循环中断问题
- 提交记录
  - `41fd9e0` fix(v1.8.17): fix biome visuals ellipse crash on homepage

## v1.8.16（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.8.16，versionCode = 76
- 主要变更
  - 接入 `19-biome-visuals.js` 到运行时模块链路
- 提交记录
  - `630173a` feat(v1.8.16): wire biome visual effects module into runtime

## v1.8.15（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.8.15，versionCode = 75
- 主要变更
  - 接入 `18-interaction-chains.js` 到运行时模块链路
- 提交记录
  - `9e1ea07` feat(v1.8.15): wire biome interaction chains into runtime

## v1.8.14（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.8.14，versionCode = 74
- 主要变更
  - 海洋环境可跳跃（低速“游泳感”）并下调移动速度
  - 火山/地狱环境持续伤害下调到每分钟半格血
- 提交记录
  - `65988b5` fix(v1.8.14): rebalance ocean swim controls and volcano/nether heat damage

## v1.8.13（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.8.13，versionCode = 73
- 主要变更
  - 修复敌人递归更新与装饰稳定性问题
- 提交记录
  - `ec53c02` fix(v1.8.13): resolve enemy recursion and decoration stability issues

## v1.8.12（发布日期：2026-02-16）
- 类型：PATCH
- APK 版本：versionName = 1.8.12，versionCode = 72
- 主要变更
  - 修复村庄挑战流程卡死与结算异常
- 提交记录
  - `fab7bf8` fix(v1.8.12): repair village challenge flow and village creation stability
## v1.8.7（发布日期：2026-02-15）

- 类型：PATCH
- APK 版本：versionName = 1.8.7，versionCode = 67
- 主要变更
  - 修复：移动设备模式下登录界面无法进入（localStorage 异常/脚本错误导致初始化中断）
  - 修复：脚本重复与缺失加载导致的 VILLAGE_STYLES 重复声明、ENEMY_STATS 未定义
  - 修复：村庄渲染脚本语法错误导致的渲染中断
  - 修复：移动端 UI 缩放导致 groundY 计算偏差，地面显示异常
- 技术改进
  - 启动前重新应用视口配置，确保缩放与物理尺寸一致
  - 本地服务增加路径解码与越界拦截

## v1.8.6（发布日期：2026-02-15）

- 类型：PATCH
- APK 版本：versionName = 1.8.6，versionCode = 66
- 主要变更
  - 修复：海洋地图下气泡粒子导致的移动卡住
  - 修复：水下气泡粒子生命周期回收，避免粒子累积
- 技术改进
  - 气泡粒子更新逻辑在主循环处理，渲染阶段仅绘制

## v1.8.5（发布日期：2026-02-15）

- 类型：PATCH
- APK 版本：versionName = 1.8.5，versionCode = 64
- 主要变更
  - 完整：村庄系统全部功能
  - 集成测试：6种群系村庄×4种建筑功能
  - Bug 修复：NPC边界、存档数据、Buff计时、交互提示
  - 优化：村庄懒渲染、NPC更新频率、单词缓存
  - 完善：新手引导、村庄成就、村庄统计
  - 村庄功能：休息（回血+单词）、学习屋（挑战+奖励）、存档（检查点）、特色建筑（群系buff）
  - 安全区：村庄内不刷怪
  - NPC：2个村民（迎接者+教师）+对话气泡
  - Buff系统：抗冰冻、抗火、沙漠保护、灯塔照明
- 技术改进
  - 全部6个版本（v1.8.0~v1.8.5）测试通过
  - 移动端适配验证
  - 性能优化验证（帧率、内存、回收）

## v1.8.4（发布日期：2026-02-15）

- 类型：MINOR
- APK 版本：versionName = 1.8.4，versionCode = 63
- 主要变更
  - 新增：存档石碑与特色建筑
  - 村庄存档石碑交互：点击保存游戏进度
  - 浮动显示功能（浮字提示）
  - 6种特色建筑渲染：图书馆、温泉、水站、铁匠铺、灯塔、酿造台
  - 特色建筑图标映射与群系风格绑定
  - 18-village-render.js：drawVillageSpecialBuilding() 实现
  - 18-village.js：handleVillageInteraction() 支持 save_stone
  - styles.css：village-opt-btn 样式
  - 提交所有更改

3c8f9d9 chore(village): v1.8.5 集成测试与完善+村庄系统完成
9cafa2b feat(village): v1.8.4 存档石碑+特色建筑+存档交互
c56f3b4 feat(village): v1.8.4 存档石碑+特色建筑+存档交互
9845d57 feat(village): v1.8.3 单词学习屋+字母填空挑战+群系奖励
4af7ada feat(village): v1.8.2 休息系统+床屋回血
2d9c2ec feat(village): v1.8.0 村庄基础框架+区域生成+建筑渲染
6c0ad2c chore: 更新 package.json 版本号至 v1.7.0
c97954a feat: v1.7.0 群系敌人与装饰设计完整实现
099eed9 feat: v1.6.9 群系视觉效果规范完整实现
8f39e7d feat: v1.6.8 蘑菇岛停留惩罚机制
62fed2f feat: v1.6.7 群系交互链系统完整实现
b11ef12 chore: 更新 apk/android-app/package.json 版本至 v1.6.5

# 版本更新记录

## v1.6.5 (2026-02-15)

### ✨ 新功能

- **学习系统完整集成** - 从 v1.6.0 到 v1.6.4 的完整学习系统优化
  - 答题数据结构扩展，记录每个单词的答题统计
  - 宝箱绑定学习，消除随机打断心流
  - 环境单词标签，实现零压力的被动浸入式学习
  - Biome 切换复习，基于间隔重复算法巩固记忆
  - 个人资料面板扩展，可视化学习成长
  - 单词本功能，查看所有答题单词的掌握程度

### 🔧 技术改进

- 完成全功能集成测试，确认所有功能正常运行
- 验证数据持久化机制，LocalStorage 保存正常
- 确认所有配置开关正常工作
- 性能测试通过，无卡顿现象
- 各功能间集成效果良好

---

## v1.6.4 (2026-02-15)

### ✨ 新功能

- **个人资料面板扩展** - 可视化学习成长
  - 个人资料面板显示答题统计（次数、正确率、单词数）
  - 新增单词本功能，查看所有答题单词
  - 单词按掌握程度排序（需复习的在前）
  - 颜色标记：红色（<50%）、黄色（50-79%）、绿色（≥80%）
  - 显示每个单词的答对/答错次数

### 🔧 技术改进

- `showProfileModal()` 调用 `getChallengeStats()` 显示统计数据
- 新增 `showVocabBook()` 和 `hideVocabBook()` 函数
- 单词本按正确率排序，优先显示需复习的单词
- 单词本显示掌握程度图标（✓/◐/✗）
- 空状态提示用户如何开始答题

---

## v1.6.3 (2026-02-15)

### ✨ 新功能

- **Biome 切换复习** - 利用 biome 切换触发快速复习
  - Biome 切换时触发快速复习（3题）
  - 基于间隔重复算法选择复习单词
  - 优先复习错误率高和久未复习的单词
  - 全对奖励：+90分 +1💎
  - 新增 reviewOnBiomeSwitch 配置项

### 🔧 技术改进

- 新增 `getWordsForReview()` 函数，基于间隔重复算法选择单词
- `updateCurrentBiome()` 中延迟触发复习（1.5秒）
- 新增复习流程控制：`maybeShowReview()`, `showReviewWord()`, `finishReview()`
- `completeLearningChallenge()` 新增复习分支处理
- 复习过程保持游戏暂停，不受伤害

---

## v1.6.2 (2026-02-15)

### ✨ 新功能

- **环境单词标签** - 零压力的被动浸入式学习
  - 敌人/物品上方显示英文名标签
  - 新增 ENTITY_NAMES 映射表（30+实体）
  - 新增 drawEntityLabel() 通用渲染函数
  - 支持敌人、傀儡、宝箱等实体
  - 新增 showEnvironmentWords 配置项

### 🔧 技术改进

- 新建 `entity-names.js` 定义实体英文名映射表
- `14-renderer-entities.js`：新增 drawEntityLabel() 函数
- `drawEnemy()` 和 `drawGolem()` 调用标签绘制
- `14-renderer-main.js`：宝箱渲染处调用标签绘制
- 标签带黑色描边，确保在任何背景下清晰可见
- 标签位置避开血条，避免视觉重叠

---

## v1.6.1 (2026-02-15)

### ✨ 新功能

- **宝箱绑定学习** - 将学习融入游戏自然节奏
  - 宝箱开启前触发答题，消除随机弹窗
  - 答对提升宝箱稀有度（common→rare→epic→legendary）
  - 答错也能开箱，降低学习压力
  - 关闭随机 Challenge 触发，避免双重打断
  - 新增 chestLearningEnabled 配置项

### 🔧 技术改进

- 修改 `handleInteraction()` 拦截宝箱开启
- `completeLearningChallenge()` 新增 Chest 分支处理
- `Chest.open()` 支持稀有度提升逻辑
- `maybeTriggerLearningChallenge()` 跳过随机触发
- 新增 `pickNextWord()` 随机取词函数

---

## v1.6.0 (2026-02-15)

### ✨ 新功能

- **学习系统优化 - 答题数据结构扩展** - 为后续学习系统优化提供数据基础
  - 新增 `challengeStats` 数据结构，记录每个单词的答题统计
  - 记录答对次数、答错次数、最后答题时间
  - 新增 `getChallengeStats()` 函数，返回总体统计数据
  - 数据持久化到 LocalStorage

### 🔧 技术改进

- `src/modules/09-vocab.js`：normalizeProgress() 中初始化 challengeStats 结构
- `src/modules/09-vocab.js`：新增 getChallengeStats() 统计查询函数
- `src/modules/12-challenges.js`：completeLearningChallenge() 中记录答题统计

---

## v1.4.1 (2026-02-15)

### ✨ 新功能

- **恶魂BOSS** - 第二个BOSS，核心机制为火球反弹
  - 恶魂BOSS（25血，8字形飘移轨迹）
  - 火球反弹机制：玩家近战攻击可将火球打回，变蓝飞向BOSS
  - 反弹火球命中造成3点伤害
  - 哭泣状态：累计受击10次后暂停攻击5秒
  - 随机突进攻击（有预警提示）
  - 三阶段战斗：攻击频率和弹幕数量递增
  - 分数达到4000时自动触发

### 🔧 技术改进

- GhastBoss 类：8字形移动、火球发射、突进、哭泣状态
- Boss基类 updateProjectiles 支持反弹弹幕碰撞BOSS
- performMeleeAttack 新增火球反弹检测逻辑
- 反弹火球蓝色拖尾视觉效果

---

## v1.4.0 (2026-02-14)

### ✨ 新功能

- **BOSS战系统** - 全新的BOSS战框架 + 凋零BOSS
  - BOSS基类与战场管理器：支持阶段切换、血条UI、奖励结算
  - 凋零BOSS：三阶段战斗（警戒→暴怒→狂暴）
  - 阶段一：缓慢飘移，每3秒发射黑球
  - 阶段二：变红，扇形弹幕+冲刺攻击
  - 阶段三：固定中央，全方位追踪弹
  - 分数达到2000时自动触发BOSS战
  - 击败获得500分+5铁块+钻石盔甲

### 🔧 技术改进

- 新增 `15-entities-boss.js` 模块：Boss基类、BossArena、WitherBoss
- 近战攻击可对BOSS造成伤害
- 弓箭可对BOSS造成伤害
- BOSS血条显示当前阶段
- BOSS弹幕系统（黑球、追踪弹）

---

## v1.3.2 (2026-02-14)

### ✨ 新功能

- **召唤系统重构** - 移除旧召唤按钮，改为背包点击召唤
  - 🎃 点击南瓜(×1)召唤雪傀儡
  - 🧱 点击铁块(×3)召唤铁傀儡
  - 背包中显示召唤提示（南瓜→⛄，铁块×3→🗿）
  - 材料不足时显示当前数量提示

### 🔧 技术改进

- 移除旧的独立召唤按钮（🗿）及其HTML/事件/键盘快捷键
- 召唤消耗量调整：铁块10→3，南瓜10→1
- 南瓜不再作为回血物品，改为纯召唤材料

---

## v1.3.1 (2026-02-14)

### ✨ 新功能

- **背包物品点击交互** - 背包中物品可直接点击使用
  - 🥩🍖🍲 点击食物回血1点生命，3秒冷却防误点
  - 🛡️ 点击盔甲从背包直接装备穿戴
  - 支持卸下当前护甲
  - 满血时食物/回血物品灰显不可用
  - 冷却中食物半透明并显示⏳标识

### 🔧 技术改进

- 食物冷却计时器集成到游戏主循环
- 背包装备区重构：支持点击装备/卸下盔甲
- 新增 `equipArmorFromBackpack`、`unequipArmorFromBackpack` 全局函数

---

## v1.3.0 (2026-02-14)

### ✨ 新功能

- **食物回血系统** - 新增三种食物物品
  - 🥩 牛肉：宝箱掉落，回复1点生命
  - 🍖 羊肉：宝箱掉落，回复1点生命
  - 🍲 蘑菇煲：稀有宝箱掉落，回复1点生命
  - 背包中点击食物即可使用回血
  - 新增 `FOOD_TYPES` 常量定义

### 🔧 技术改进

- 更新宝箱掉落表，common 级别新增牛肉/羊肉，rare 级别新增蘑菇煲
- 扩展物品系统：INVENTORY_TEMPLATE、ITEM_LABELS、ITEM_ICONS、INVENTORY_CATEGORIES

---

## v1.2.24 (2025-02-14)

### 🐛 Bug 修复

- **修复地面不显示问题** - 调整脚本加载顺序，确保实体类在游戏逻辑模块之前加载
  - 将 `15-entities-*.js` 移到 `11-game-init.js` 之前
  - 添加调试日志到 `generatePlatform()` 函数

### 🎨 UI/UX 改进

- **重构背包功能** - 改为弹出式按钮
  - 从第一行 HUD 移除背包显示
  - 在左侧添加背包按钮（金币下方）
  - 与其他功能按钮保持一致的交互方式
  - 删除不再使用的 `.hud-inventory-btn` CSS 样式

### 🛠️ 开发体验优化

- **添加开发环境配置**
  - 新增 `package.json` 配置 npm 脚本
  - 创建 `dev.bat` 简化开发启动
  - 添加完整的开发指南文档
  - 创建快速参考文档

- **整理项目结构**
  - 创建 `tests/debug-pages/` 目录
  - 移动所有测试 HTML 文件到测试目录
  - 添加测试页面说明文档
  - 主目录更清晰，只保留核心文件

### 📝 文档

- 新增 `开发指南.md` - 完整的开发流程说明
- 新增 `快速参考.md` - 常用命令快速查阅
- 新增 `tests/debug-pages/README.md` - 测试页面说明
- 新增 `ui-layout-test.html` - UI 布局测试页面

### 🔧 技术改进

- 优化开发流程，推荐使用浏览器直接测试
- 仅在需要时构建 APK，提高开发效率
- 添加多个调试页面辅助开发

---

## v1.2.23 (之前版本)

### 功能

- 基础游戏功能
- 单词学习系统
- 背包和装备系统
- 多生物群系
- 敌人和战斗系统

---

## 版本号说明

版本号格式：`主版本.次版本.修订号`

- **主版本**：重大功能更新或架构变更
- **次版本**：新功能添加或重要改进
- **修订号**：Bug 修复和小改进








