# 项目进展文档 (Project Progress)

本文档记录了 **Minecraft Mario Words Game** 的开发历程与关键更新。

**版本号**：2026-02-01.1

## 已完成阶段 (Completed)

### 6. 生态群系、敌人与生命系统
- **生态群系切换**：改为按分数阶段切换，切换周期支持设置配置；顺序与解锁规则统一由 `config/biomes.json` 管理。
- **地形与平台优化**：新增可控的浮空草方块与台阶式小平台生成，避免不可达/堵路情况。
- **敌人多样化**：按分数区间和群系随机生成怪物，刷新率提升，造型更接近 Minecraft 像素风。
- **生命值系统**：玩家生命与最大生命上限引入到配置；受伤扣分、宝箱可掉落回血与生命上限提升。
- **关卡冲突修复**：停用旧的 100 分自动切关逻辑，避免与生态切换逻辑冲突。
### 1. 基础架构重构与离线运行优化
- **移除模块限制**：将 ES6 Module 结构调整为传统的 script 引入，解决了本地双击文件运行时由于 CORS 策略导致的加载失败问题。
- **配置同步降级**：实现了 `loadJsonWithFallback` 机制，在外部 JSON 配置文件加载失败时自动使用 `src/defaults.js` 中的默认配置，确保游戏随时可用。
- **本地存储集成**：通过 `src/storage.js` 实现了 LocalStorage 读写，支持玩家设置（如语速、音量、操作偏好）的持久化。

### 2. 操作体验升级 (多端适配)
- **触控系统**：为移动设备添加了屏幕虚拟按键（左、右、跳跃、攻击、设置），使用 Pointer Events 优化了长按与响应速度。
- **键盘映射统一**：
  - `←` / `→`：移动
  - `Space` / `↑`：跳跃（支持二段跳）
  - `J`：攻击
  - `Y`：打开宝箱/交互
  - `Esc`：暂停/菜单
- **运动反馈优化**：根据用户反馈，增加了 **动作速度 (Motion Scale)** 调节选项，允许玩家自由调整角色移动和跳跃的灵活性。

### 3. 学习逻辑优化
- **单词重复预防**：引入了智能词库轮询机制，确保在一轮单词练习中不会重复出现已学过的单词，提高学习效率。
- **语音增强**：优化了语音合成的触发逻辑，增加了单词出现时的自动播报功能。

### 4. UI/UX 改进
- **新手引导**：添加了全屏遮罩引导页 (Onboarding Overlay)，方便小朋友快速理解操作方式。
- **响应式缩放**：实现了基于窗口大小的自动缩放 (UI Scale)，确保在平板和手机上都有良好的视觉体验。
- **自动暂停**：当浏览器失去焦点时自动暂停游戏，防止意外死亡。

### 5. 多词库、轮换与图片展示
- **首批词库接入**：导入幼儿园 6 包 + 小学低/高年级 + Minecraft 基础词库，并通过 `words/vocabs/manifest.js` 统一管理。
- **词库选择与加权轮换**：设置里可指定固定词库，也可选择“随机词库（加权轮换）”；启动时按权重与历史运行次数衰减规则轮换，避免反复出现同一词库。
- **词库完成度**：以“本词库收集到的不同单词数 / 本词库总单词数”为口径，收集完自动切换到下一个词库（按 manifest 顺序）。
- **图片策略**：在线加载图片；若在线失败，自动使用内置占位图保证体验不中断。
- **重复策略优化**：单词优先出新词，并按更合理的间隔重复出现，减少刷屏式重复。

## 当前进展 (Current)
- [x] 支持多词库管理、词库选择与加权轮换。
- [x] 支持词库完成度与自动切换。
- [x] 支持单词图片展示与失败占位图。

## 本地 Git 记录 (Local Git Log)
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
- [ ] **难度曲线**：根据玩家掌握程度自动调整平台间距或敌人速度。
- [ ] **美术资源扩展**：引入更多 Minecraft 风格的方块和马里奥风格的敌人。
- [ ] **更多词库**：继续按主题/难度扩充词库，并补齐更一致的图片映射策略。
- [ ] **激励系统**：增加收集金币解锁新角色或装备的功能。

---
*更新日期：2026-02-01*
