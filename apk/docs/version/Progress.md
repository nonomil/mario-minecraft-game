## v1.6.1（发布日期：2026-02-15）
- 类型：MINOR
- APK 版本：versionName = 1.6.1，versionCode = 54
- 主要变更
  - 新增：学习系统 - 宝箱绑定学习
  - 宝箱开启前触发答题，消除随机弹窗打断心流
  - 答对提升宝箱稀有度（common→rare→epic→legendary）
  - 答错也能开箱，降低学习压力
  - 关闭随机 Challenge 触发，保留 WordGate 机制
  - 新增 chestLearningEnabled 配置项
- 技术改进
  - 13-game-loop.js：handleInteraction() 中拦截宝箱开启
  - 12-challenges.js：completeLearningChallenge() 新增 Chest 分支处理
  - 12-challenges.js：maybeTriggerLearningChallenge() 跳过随机触发
  - 15-entities-base.js：Chest.open() 支持稀有度提升逻辑
  - 09-vocab.js：新增 pickNextWord() 随机取词函数
  - defaults.js：新增 chestLearningEnabled 配置项

## v1.6.0（发布日期：2026-02-15）
- 类型：MINOR
- APK 版本：versionName = 1.6.0，versionCode = 53
- 主要变更
  - 新增：学习系统优化 - 答题数据结构扩展
  - 新增：challengeStats 数据结构记录答题统计（答对/答错次数、最后答题时间）
  - 新增：getChallengeStats() 统计查询函数
  - 为后续学习系统优化提供数据基础
- 技术改进
  - 09-vocab.js：normalizeProgress() 中初始化 challengeStats
  - 09-vocab.js：新增 getChallengeStats() 函数返回答题统计数据
  - 12-challenges.js：completeLearningChallenge() 中记录答题统计

## v1.5.7（发布日期：2026-02-15）
- 类型：PATCH
- APK 版本：versionName = 1.5.7，versionCode = 52
- 主要变更
  - 修复：傀儡生命周期优化 - 只持续一个环境周期
  - 新增：雪傀儡在沙漠环境3秒后融化（气泡粒子效果）
  - 新增：离开召唤群系时傀儡自动消失（显示👋告别动画）
- 技术改进
  - Golem构造函数：添加spawnBiome和meltTimer属性
  - update方法：群系检测逻辑
  - 雪傀儡沙漠融化机制

## v1.5.6（发布日期：2026-02-15）
- 类型：MINOR
- APK 版本：versionName = 1.5.6，versionCode = 51
- 主要变更
  - 新增：🐉 龙蛋龙息 - 全屏50伤害，冷却12秒
  - 新增：⭐ 海星幸运星 - 30秒宝箱稀有度+1，冷却90秒
  - 新增：🪙 黄金交易 - 猪灵交易（铁×2/箭×4/末影珍珠×1）
- 技术改进
  - 龙蛋：遍历屏幕内敌人造成伤害，30个ember粒子
  - 海星：gameState全局状态管理，宝箱rarityBoost提升
  - 黄金：随机交易逻辑，无冷却

## v1.5.5（发布日期：2026-02-15）
- 类型：MINOR
- APK 版本：versionName = 1.5.5，versionCode = 50
- 主要变更
  - 新增：🥩 腐肉诱饵 - 吸引敌人200px范围3秒，冷却4秒
  - 新增：🐚 贝壳护盾 - 2秒无敌，消耗3个，冷却20秒（平衡性调整）
  - 新增：🪨 煤矿火把 - 照亮150px范围8秒，冷却3秒
- 技术改进
  - FleshBait类：吸引敌人逻辑
  - Torch类：光源渲染+闪烁效果
  - 贝壳护盾复用playerInvincibleTimer

## v1.5.4（发布日期：2026-02-15）
- 类型：MINOR
- APK 版本：versionName = 1.5.4，versionCode = 49
- 主要变更
  - 物品栏UI优化：自适应高度calc(60vh-120px)、触摸滚动优化、48px触控区域
  - 物品冷却系统：全局计时器管理、统一冷却配置
  - 新增：💥 火药炸弹 - 投掷爆炸，120px范围30伤害，破坏树木，冷却5秒
  - 新增：🟣 末影珍珠传送 - 传送200px穿越障碍，冷却8秒
  - 新增：🕸️ 蜘蛛丝陷阱 - 减速敌人80%持续5秒，消耗2个，冷却6秒
- 技术改进
  - ITEM_COOLDOWNS配置、itemCooldownTimers全局计时器
  - Bomb、WebTrap、ExplosionParticle实体类
  - 敌人webbed计时器、减速机制
  - ITEM_DESCRIPTIONS物品描述数据

## v1.5.3（发布日期：2026-02-15）
- 类型：MINOR
- APK 版本：versionName = 1.5.3，versionCode = 48
- 主要变更
  - 新增：末地（The End）环境 - 低重力、传送门、末影螨、潜影贝炮台、紫水晶加速buff
  - 新增：低重力物理（0.65x重力、1.5x跳跃）
  - 新增：🟣 末地传送门 - 紫色漩涡，传送至随机安全平台，3秒冷却
  - 新增：末影螨（3HP飞行追踪敌人）
  - 新增：潜影贝炮台（5HP固定炮台，开合循环，追踪弹幕，关闭时无敌）
  - 新增：⚡ 紫水晶 - 5秒速度buff
  - 新增：EndParticle粒子、末地环境渲染（深紫色虚空+星星）
- 技术改进
  - updateEndEnvironment、renderEndEnvironment
  - EndPortal、Endermite、ShulkerTurret类
  - 末地石方块渲染、低重力应用

## v1.5.2（发布日期：2026-02-15）
- 类型：MINOR
- APK 版本：versionName = 1.5.2，versionCode = 47
- 主要变更
  - 新增：地狱环境升级 - 高温伤害、岩浆即死、灵魂沙减速、红蘑菇回血
  - 新增：地狱高温伤害 - 每10秒0.5心，下界合金护甲免疫
  - 新增：岩浆池（lava_pool）- 瞬间死亡
  - 新增：灵魂沙减速 - 50%移动速度+下沉视觉
  - 新增：红蘑菇自动采集 - 回复1心
  - 新增：热浪视觉效果 - 屏幕边缘红色渐变
- 技术改进
  - updateNetherEnvironment、checkSoulSandEffect
  - renderNetherHeatEffect、checkLavaCollision
  - spawnNetherMushrooms、updateNetherMushrooms、renderNetherMushrooms

## v1.5.1（发布日期：2026-02-15）
- 类型：MINOR
- APK 版本：versionName = 1.5.1，versionCode = 46
- 主要变更
  - 新增：海洋生物 - 鳕鱼（友好）、乌贼（中性墨汁喷射）
  - 新增：CodFish - 8字形游泳，逃离玩家，掉落生鱼
  - 新增：Squid - 墨汁喷射（2秒屏幕黑屏），3HP
  - 新增：生鱼食物 - 回复1心
  - 新增：海洋生物近战攻击支持
- 技术改进
  - CodFish、Squid类
  - spawnOceanCreatures、updateOceanCreatures、renderOceanCreatures
  - renderInkEffect全屏遮罩

## v1.5.0（发布日期：2026-02-15）
- 类型：MINOR
- APK 版本：versionName = 1.5.0，versionCode = 45
- 主要变更
  - 新增：海洋游泳系统 - 水下垂直移动
  - 新增：水下物理 - 70%水平速度、慢速下沉、水阻力
  - 新增：海洋环境渲染 - 深蓝渐变背景、光束效果、波浪表面
  - 新增：气泡粒子系统 - 游泳时产生气泡
- 技术改进
  - WATER_PHYSICS常量配置
  - isUnderwater分支移动逻辑
  - renderOceanEnvironment、renderSwimBubbles

## v1.4.3（发布日期：2026-02-15）
- 类型：MINOR
- APK 版本：versionName = 1.4.3，versionCode = 44
- 主要变更
  - 新增：凋零骷髅BOSS（40HP，近战肉搏，格挡破防）
  - 新增：三连击系统 - 横扫→下劈→突刺
  - 新增：跳斩AOE - 冲刺→跳跃→落地AOE伤害
  - 新增：格挡机制 - 7次攻击破防，3秒眩晕
  - 新增：眩晕状态 - 受到1.5倍伤害
  - 新增：召唤骷髅 - HP<30%时召唤4个骷髅
- 技术改进
  - WitherSkeletonBoss类（状态机AI）
  - startCombo、executeComboStep、startJumpAttack
  - takeDamage覆盖（格挡逻辑）
  - summonMinions、updateMinions、damageMinionAt

## v1.4.2（发布日期：2026-02-15）
- 类型：MINOR
- APK 版本：versionName = 1.4.2，versionCode = 43
- 主要变更
  - 新增：烈焰人BOSS（28HP，火球三连射，召唤小烈焰人）
  - 新增：火焰旋风 - Phase2+连续发射3连发火球
  - 新增：火柱追踪 - Phase2+地面升起3个追踪火柱
  - 新增：召唤小烈焰人 - Phase3召唤2个mini-blaze
  - 新增：50%伤害减免 - 小烈焰人存活时
- 技术改进
  - BlazeBoss类（浮空移动）
  - fireballBurst队列系统
  - spawnFireColumns、updateFireColumns
  - summonMinions、updateMinions、damageMinionAt

## v1.4.1（发布日期：2026-02-15）
- 类型：PATCH
- APK 版本：versionName = 1.4.1，versionCode = 42
- 构建方式：CI（GitHub Actions）
- 主要变更
  - 新增：恶魂BOSS（25血，8字形飘移，火球反弹机制）
  - 新增：火球反弹 - 玩家近战攻击可将火球打回BOSS
  - 新增：反弹火球变蓝，命中BOSS造成3点伤害
  - 新增：哭泣状态 - 累计受击10次后暂停攻击5秒
  - 新增：随机突进攻击（有预警提示）
  - 新增：分数达到4000时自动触发恶魂BOSS战
- 技术改进
  - 新增 GhastBoss 类（8字形移动、火球、突进、哭泣）
  - Boss基类 updateProjectiles 支持反弹弹幕→BOSS碰撞
  - performMeleeAttack 新增火球反弹检测
  - 反弹火球蓝色拖尾视觉效果

## v1.4.0（发布日期：2026-02-14）
- 类型：MINOR
- APK 版本：versionName = 1.4.0，versionCode = 41
- 构建方式：CI（GitHub Actions）
- 主要变更
  - 新增：BOSS战系统框架 + 凋零BOSS
  - 新增：BOSS基类支持三阶段切换、血条UI、奖励结算
  - 新增：凋零BOSS三阶段战斗（黑球→扇形弹幕+冲刺→追踪弹）
  - 新增：分数达到2000时自动触发BOSS战
  - 新增：近战攻击、弓箭可对BOSS造成伤害
  - 新增：BOSS击败奖励（500分+5铁块+钻石盔甲）
- 技术改进
  - 新增 `15-entities-boss.js` 模块
  - BossArena 管理器：checkSpawn、enter、exit、onVictory
  - WitherBoss：updateBehavior、shootBlackBall、shootTrackingBalls、startCharge

## v1.3.2（发布日期：2026-02-14）
- 类型：PATCH
- APK 版本：versionName = 1.3.2，versionCode = 40
- 构建方式：CI（GitHub Actions）
- 主要变更
  - 重构：移除旧的独立召唤按钮（🗿），改为背包点击召唤
  - 新增：点击南瓜(×1)召唤雪傀儡
  - 新增：点击铁块(×3)召唤铁傀儡
  - 新增：背包中显示召唤提示（南瓜→⛄，铁块×3→🗿）
  - 调整：南瓜不再作为回血物品，改为纯召唤材料
- 技术改进
  - 移除 Game.html 中 #btn-summon-golem 按钮
  - 移除 16-events.js 中召唤按钮事件绑定
  - 移除 17-bootstrap.js 中 X 键召唤快捷键
  - 召唤消耗量调整：铁块 10→3，南瓜 10→1

## v1.3.1（发布日期：2026-02-14）
- 类型：PATCH
- APK 版本：versionName = 1.3.1，versionCode = 39
- 构建方式：CI（GitHub Actions）
- 主要变更
  - 新增：背包物品点击交互 - 食物回血与盔甲装备
  - 新增：点击食物回血1点生命，3秒冷却防误点
  - 新增：满血时食物/回血物品灰显不可用，冷却时显示⏳
  - 新增：点击盔甲从背包直接装备穿戴，支持卸下护甲
  - 优化：背包装备区重构，支持点击装备/卸下操作
- 技术改进
  - 食物冷却计时器（foodCooldown）集成到游戏主循环
  - 新增 equipArmorFromBackpack、unequipArmorFromBackpack 全局函数
  - 背包渲染增加物品状态视觉反馈（灰显/半透明）

## v1.2.24（发布日期：2025-02-14）
- 类型：PATCH
- APK 版本：versionName = 1.2.24，versionCode = 37
- 构建方式：CI（GitHub Actions）
- 主要变更
  - 修复：地面不显示问题（调整脚本加载顺序，实体类在游戏逻辑模块之前加载）
  - 重构：背包 UI 改为弹出式按钮，移到左侧金币下方
  - 优化：开发环境配置（添加 npm 脚本、dev.bat 启动脚本）
  - 优化：项目结构整理（测试文件移到 tests/debug-pages/ 目录）
  - 文档：新增开发指南、快速参考、版本更新记录（CHANGELOG.md）
- 技术改进
  - 调整 Game.html 脚本加载顺序（15-entities-*.js 移到 11-game-init.js 之前）
  - 添加 .btn-group-left 样式类，支持左侧按钮布局
  - 清理不再使用的 .hud-inventory-btn CSS 样式
  - 添加 ui-layout-test.html 测试页面
- 开发体验
  - 推荐使用浏览器直接测试（npm run dev），90% 功能可验证
  - 仅在需要时构建 APK（测试 Android 特定功能、设备兼容性、发布版本）
  - 完善调试工具和测试页面

## v1.2.23（发布日期：2026-02-12）
- 类型：PATCH
- APK 版本：versionName = 1.2.23，versionCode = 36
- 主要变更
  - 重构：main.js 拆分为 20 个模块文件，单个文件不超过 1000 行
  - 重构：14-renderer.js 拆分为 main/entities/decorations 三个文件
  - 重构：15-entities.js 拆分为 base/decorations/particles/combat 四个文件
  - 清理：删除重复的模块文件，统一使用 src/modules/ 目录结构
  - 优化：代码组织更清晰，便于维护和协作开发

## v1.2.22（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.22，versionCode = 35
- 主要变更
  - 文档：补充优化事项（游戏结束存档、复活方式选择等）
## v1.2.21（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.21，versionCode = 34
- 主要变更
  - 修复：强制横屏模式，避免横竖屏切换导致的全屏显示问题
  - 修复：groundY 计算使用正确的物品栏高度（70px 而非 48px）
  - 新增：视口变化时的世界坐标重映射功能（remapWorldCoordinates）
  - 优化：AndroidManifest.xml 添加 screenOrientation="sensorLandscape"

## v1.2.19（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.19，versionCode = 32
- 主要变更
  - 修复：横屏全屏显示超出屏幕问题，groundY 计算改为基于 canvas 高度减去物品栏高度
  - 修复：单词库切换不生效问题，词库文件加载改为顺序加载（避免并行加载时脚本未执行完毕）
  - 修复：单词图片不显示问题，添加网络安全配置允许加载外部图片资源
  - 优化：main.core.js 中 applyResponsiveCanvas 函数同步修复 groundY 计算
  - 新增：network_security_config.xml 配置文件，支持 img.icons8.com、twemoji.maxcdn.com 等图片域名

## v1.2.18（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.18，versionCode = 31
- 主要变更
  - 修复：APK 构建时词库文件提取正则表达式错误，解决单词库无法加载问题
  - 修复：横屏全屏时地面超出屏幕问题，将地面高度设置为物品栏上边框位置
  - 优化：地面位置计算更加合理，适配不同屏幕尺寸

## v1.2.17（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.17，versionCode = 30
- 主要变更
  - 修复：单词库文件夹和文件名改为英文，解决 APK 中文路径加载失败问题
  - 修复：移除 FLAG_LAYOUT_NO_LIMITS 标志，解决全屏模式下内容超出屏幕的问题
  - 优化：更新 manifest.js 中所有词库文件路径为英文路径
  - 文档：同步主项目文档到 apk/docs 目录

## v1.2.16（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.16，versionCode = 29
- 主要变更
  - 修复：单词库切换问题深度修复，解决 Manifest 加载时序问题
  - 新增：调试指南文档 `docs/VOCAB_DEBUG_GUIDE.md`
  - 新增：AI 绘图提示词文档 `docs/AI_ART_PROMPTS.md`
  - 优化：添加完整的调试日志系统（[Vocab]、[Settings]、[Storage] 标签）

## v1.2.15（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.15，versionCode = 28
- 主要变更
  - 修复：单词库切换不生效问题，设置保存函数改为异步
  - 修复：横屏全屏适配问题，物品栏和触控按钮添加安全区域支持
  - 优化：Android 端添加刘海屏/挖孔屏支持
  - 优化：改进不同手机型号的屏幕兼容性

## v1.2.14（发布日期：2026-02-06）
- 类型：PATCH
- APK 版本：versionName = 1.2.14，versionCode = 27
- 主要变更
  - 需求9：海洋场景改为海草/海洋装饰，不再生成树木；海洋敌人替换为溺尸/河豚
  - 需求10：学习测验优化为字母填空选择题，时长调整为 15s
  - 需求11：单词连线复活倒计时防交互中断，仅一次机会；地狱持续扣血改为入场扣血
  - 新增：背包入口与背包面板（基础展示）

## v1.2.13（发布日期：2026-02-06）
- 类型：PATCH
- APK 版本：versionName = 1.2.13，versionCode = 26
- 主要变更
  - 修复：运行中分辨率变化导致“重新开始/闪退”的问题，改为自动暂停并提示
  - 修复：游戏结束时“积分复活”按钮缺失，分数不足时显示禁用提示
  - 优化：入场弹窗改为两页自动切换，支持档案选择/继续/重玩
  - 优化：英文 TTS 恢复发音（原生/浏览器/在线兜底）
  - 资源：更新应用图标（mipmap 全密度）

## v1.2.12（发布日期：2026-02-06）
- 类型：PATCH
- Hotfix：修复账号登录页“连接”按钮无响应（启动阶段异常导致 initLoginScreen 未完成事件绑定）。
- QA：新增 Playwright 端到端(E2E)测试覆盖需求 1~8（`npm test`）。
- APK 版本：versionName = 1.2.12，versionCode = 25
- 构建方式：本地构建
- 主要变更
  - 词库与设置打通：manifest 恢复 byId、setActiveVocabPack 支持多文件、词库预览/切换提示、保存时清屏并立刻生成新词
  - 死亡复活与学习流程：积分复活按钮、学习挑战/词语匹配 modal、word gate、account/achievement/storage/auto-save、复活保留分数
  - 装备与 AI 完善：宝箱装备掉落、双击装备 UI、盔甲减伤/更新、傀儡跳跃+掉落恢复、移动速度档位及 armor HUD、hud/learning UI 完善
- 安装说明
  - 覆盖安装请保持签名一致并提升 versionCode
- 备注
  - 本次版本对表内所有学习增强需求做了实现与整理，建议同步发布 GitHub Release（见 tag v1.2.12）

## v1.2.11（发布日期：2026-02-05）
- 类型：PATCH
- APK 版本：versionName = 1.2.11，versionCode = 24
- 主要变更
  - 词库更新：整合 v1.2.10 最新词库，修复格式与内容问题
  - 修复：修复部分单词发音与显示异常

## v1.2.10（发布日期：2026-02-05）
- 类型：PATCH
- APK 版本：versionName = 1.2.10，versionCode = 23
- 主要变更
  - 修复全屏显示底部物品栏在部分设备被遮挡问题
  - 词库文件全量扫描并修复语法/格式问题
  - 补齐缺失的翻译，统一同步到 `apk/词库`

## v1.2.9（发布日期：2026-02-05）
- 类型：PATCH
- APK 版本：versionName = 1.2.9，versionCode = 22
- 主要变更
  - 设置页操作提示升级为“图标 + 按键 + 文字”，并复用到启动/暂停弹窗
  - 修复 Progress.md 文件头部乱码（添加 UTF-8 类型标识并修正内容）

## v1.2.8（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.8，versionCode = 21
- 主要变更
  - 优化设置页操作提示：图标 + 按键 + 文字（并在启动弹窗复用）

## v1.2.7（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.7，versionCode = 20
- 主要变更
  - 修复与优化：界面文案/显示、操作提示与移动端适配相关问题

# 版本修订记录（Progress）

> 目的：记录每个版本的变更摘要与版本信息，确保与 APK 版本号保持一致

## 版本编号与规范
采用语义化版本：`MAJOR.MINOR.PATCH`
- **MAJOR**：重大版本变更（系统/架构/资源大改、核心玩法重构等）
- **MINOR**：新增功能（新关卡、新机制、新模式等）
- **PATCH**：小范围修复与优化（bug 修复、微 UI 调整、体验优化等）

> 对应关系：
> - **Android**：`versionName` = 语义化版本；`versionCode` 每次发布 +1
> - **版本记录**：每次发布新增一条版本记录，且必须与 `versionName` 一致

## 模板（复制使用）
```markdown
## vX.Y.Z（发布日期：YYYY-MM-DD）
- 类型：MAJOR / MINOR / PATCH
- APK 版本：versionName = X.Y.Z，versionCode = N
- 构建方式：本地 / CI（GitHub Actions）
- 主要变更
  - ...
  - ...
- 安装说明
  - 如需覆盖安装，请保持同签名且提升 versionCode
- 备注
  - ...
```

## 修订记录

## v1.2.6（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.6，versionCode = 19
- 主要变更
  - 修复 APK 版本不发音的问题：在原生端自动注册并调用 Capacitor TextToSpeech 插件；Web Speech/在线 TTS 作为兜底
  - App 隐藏到后台时自动停止背景音乐；回到前台按设置恢复播放

## v1.2.5（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.5，versionCode = 18
- 主要变更
  - 修复部分设备单词朗读不触发的问题：增加 voices 就绪检测与重试，确保中英文朗读恢复

## v1.2.4（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.4，versionCode = 17
- 主要变更
  - 全屏适配稳定性增强：使用 visualViewport + safe-area 计算可用画布尺寸，并监听 visualViewport 变化修正（减少越用越超出屏幕的问题）
  - 设置页新增游戏难度选择（自适应/固定档位），并移除顶部 HUD 的难度/新手提示
  - 触屏按钮增加半透明白色圆圈并扩大点击范围，提升手机操作手感
  - 设置面板可滚动，保存按钮置顶（sticky）

## v1.2.3（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.3，versionCode = 16
- 主要变更
  - 修复部分环境下启动报错导致无人物/无场景无法点击的问题（可选配置缺失时不再崩溃）
  - 修复配置文件加载路径，确保 Web / APK 构建目录下均能正确读取 config/words
  - 修复设置页操作提示乱码，积分图标改为金币显示

## v1.2.2（发布日期：2026-02-03）
- 类型：PATCH
- APK 版本：versionName = 1.2.2，versionCode = 15
- 主要变更
  - 修复部分 UI 文本乱码/编码问题
  - 修复分辨率适配与 APK 构建流程问题
  - 完善 GitHub Actions 自动构建 APK workflow

## v1.2.1（发布日期：2026-02-03）
- 类型：PATCH
- APK 版本：versionName = 1.2.1，versionCode = 14
- 主要变更
  - 修复铁镐挖地提示乱码
  - 宝箱不再额外弹出单词（仅掉落资源/道具/血量/分数）
  - 修复部分 UI 文本乱码
  - 触发 GitHub Actions 重新编译 APK

## v1.2.0（发布日期：2026-02-03）
- 类型：MINOR
- APK 版本：versionName = 1.2.0，versionCode = 13
- 构建方式：本地构建 + Release 签名
- 主要变更
  - 新增地下洞穴/矿洞玩法与敌人
  - 增强敌人 AI（远程/近战等行为）
  - 新增游戏难度（易/中/难）与实时效果调整
  - 优化性能与资源加载
- 安装说明
  - 如需覆盖安装，请保持同签名且提升 versionCode


