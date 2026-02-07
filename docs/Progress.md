# 项目进展文档 (Project Progress)

本文档记录了 **Minecraft Mario Words Game** 的开发历程与关键更新。
**版本**：2026-02-02.1

## 已完成阶段 (Completed)

### 6. 生态群系、敌人与生命系统
- **生态群系切换**：改为按分数阶段切换，切换周期支持设置配置；顺序与解锁规则统一由 `config/biomes.json` 管理
- **地形与平台优化**：新增可控的浮空草方块与台阶式小平台生成，避免不可达或堵路情况
- **敌人多样化**：按分数区间和群系随机生成怪物，刷新率提升，造型更接近 Minecraft 像素风
- **生命值系统**：玩家生命与最大生命上限引入到配置；受伤扣分、宝箱可掉落回血与生命上限提升
- **关卡冲突修复**：停用旧的 100 分自动切关逻辑，避免与生态切换逻辑冲突
### 7. 难度曲线与宝箱稀有度优化
- **难度阶梯**：按分数区间切换难度层级，敌人伤害、血量、数量按层级动态调整
- **动态难度 (DDA)**：低血量时降低敌人压力并提升补给；长时间无受伤则适度提高挑战
- **宝箱稀有度**：引入普通、稀有、史诗、传说稀有度，掉落表与多掉落概率支持配置
- **难度提示**：HUD 显示当前难度等级，切换时提示玩家
- **进度分数**：难度与群系切换按“本局最高分”推进，避免受伤扣分导致难度或环境来回跳变
### 8. UI与离线单文件优化
- **血量显示**：上限调整为 10 心，心形缩小并双排展示，宝箱回血与上限提升会即时刷新
- **发音节奏**：英文默认语速提升，并在拾取蓝色方块后优先立即播报英文
- **蓝色方块间距**：添加最小生成间隔，避免出现过密
- **召唤按钮**：物品栏第一格增加“召唤傀儡”按钮，逻辑与 X 键一致
- **离线单文件**：生成 `out/Game.offline.html`，可在本地 `file://` 直接运行

### 9. 武器/物品栏与触控调整
- **武器初始**：默认带弓和 5 支箭，可立即切换武器并查看当前弓箭数量
- **栏位重组**：去除木斧和骨头，弓与箭分开显示；系统已识别背包里的箭来解锁武器
- **触控优化**：虚拟左右按钮下移与地面齐平，去掉圆角边框，保持操作简洁
- **进度提示**：HUD 增加武器信息条，显示当前武器与箭数，切换或 PVP 反馈清晰

### 10. APK 可更新安装与横屏全屏优化
- **Release 签名密钥**：统一 Secrets 名称为 ANDROID_KEYSTORE_BASE64，并同步 workflow 配置
- **APK 可更新安装**：补齐 Release 签名配置，确保同一签名下可直接覆盖安装更新，避免反复卸载
- **横屏全屏与缩放**：同步移动端横屏全屏策略，使用 `visualViewport` 计算缩放，减少黑边与裁切
- **触控按钮重做**：按“我的世界安卓端”风格改成更大的白色半透明圆形按钮，并上移到地面上方，降低遮挡

### 1. 基础架构重构与离线运行优化
- **移除模块限制**：将 ES6 Module 结构调整为传统的 script 引入，解决了本地双击文件运行时由于 CORS 策略导致的加载失败问题
- **配置同步降级**：实现了 `loadJsonWithFallback` 机制，在外部 JSON 配置文件加载失败时自动使用 `src/defaults.js` 中的默认配置，确保游戏随时可用
- **本地存储集成**：通过 `src/storage.js` 实现了 LocalStorage 读写，支持玩家设置（如语速、音量、操作偏好）的持久化
### 2. 操作体验升级 (多端适配)
- **触控系统**：为移动设备添加了屏幕虚拟按键（左、右、跳跃、攻击、设置），使用 Pointer Events 优化了长按与响应速度
- **键盘映射统一**：
  - `←` / `→`：移动
  - `Space` / `↑`：跳跃（支持二段跳）
  - `J`：攻击
  - `Y`：打开宝箱/交互
  - `Esc`：暂停菜单
- **运动反馈优化**：根据用户反馈，增加 **动作速度 (Motion Scale)** 调节选项，允许玩家自由调整角色移动和跳跃的灵活性
### 3. 学习逻辑优化
- **单词重复预防**：引入了智能词库轮询机制，确保在一轮单词练习中不会重复出现已学过的单词，提高学习效率
- **语音增强**：优化了语音合成的触发逻辑，增加了单词出现时的自动播报功能
### 4. UI/UX 改进
- **新手引导**：添加了全屏遮罩引导 (Onboarding Overlay)，方便小朋友快速理解操作方式
- **响应式缩放**：实现了基于窗口大小的自动缩放 (UI Scale)，确保在平板和手机上都有良好的视觉体验
- **自动暂停**：当浏览器失去焦点时自动暂停游戏，防止意外死亡
### 5. 多词库、轮换与图片展示
- **首批词库接入**：导入幼儿园 6 级 + 小学高年级 + Minecraft 基础词库，并通过 `words/vocabs/manifest.js` 统一管理
- **词库选择与加权轮换**：设置里可指定固定词库，也可选择“随机词库（加权轮换）”；启动时按权重与历史运行次数衰减规则轮换，避免反复出现同一词库
- **词库完成度**：以“本词库收集到的不同单词数 / 本词库总单词数”为口径，收集完自动切换到下一个词库（按 manifest 顺序）
- **图片策略**：在线加载图片；若在线失败，自动使用内置占位图保证体验不中断
- **重复策略优化**：单词优先出新词，并按更合理的间隔重复出现，减少刷屏式重复
## 当前进展 (Current)
- [x] 支持多词库管理、词库选择与加权轮换
- [x] 支持词库完成度与自动切换
- [x] 支持单词图片展示与失败占位图
## 本地 Git 记录 (Local Git Log)
- f8efd47 Update UI, offline build, and voice pacing
- 8169ae8 Bump version and sync progress log
- a41195d Stabilize progression for biome and difficulty
- 8169ae8 Bump version and sync progress log
- a41195d Stabilize progression for biome and difficulty
- 55a65fb Update progress for difficulty system
- 80adfd6 Add difficulty tiers and loot tuning
- 98f7bef Add HP system and chest healing rewards
- 6746102 Penalize player score on enemy contact
- 93bd244 Disable legacy level scene switching
- cc4d1d6 Increase enemy spawn rate
- b16e6dd Improve enemy variety and Minecraft-like sprites
- 858530c Constrain grass micro platforms to be jumpable
- 8be91e7 Make biome switch configurable and add micro platforms
- 0888563 Redesign biome switching to be score-driven
- e30796a Adjust biome switch gate and chest loot
- 700a331 Add biome environment expansion
- 7307516 Implement golem and enemy system

## 未来规划 (Future)
- [ ] **难度曲线**：根据玩家掌握程度自动调整平台间距或敌人速度
- [ ] **美术资源扩展**：引入更像 Minecraft 风格的方块和马里奥风格的敌人
- [ ] **更多词库**：继续按主题或难度扩充词库，并补齐更一致的图片映射策略
- [ ] **激励系统**：增加收集金币解锁新角色或装备的功能
---
*更新日期：2026-02-02*
