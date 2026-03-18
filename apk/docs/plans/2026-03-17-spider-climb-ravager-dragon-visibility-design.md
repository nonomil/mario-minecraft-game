# 蜘蛛攀爬 + Ravager 替代唤魔者 + 末影龙竞技场可见性修复 设计

日期：2026-03-17

## 背景
- 蜘蛛无法攀爬树干或草方块侧面，追击体验偏弱。
- 唤魔者 BOSS 在实战中导致卡住与体验问题，需要替换。
- 末影龙竞技场内主角不可见且难以操作。

## 目标
- 蜘蛛可攀爬树干与 grass 平台侧面，并能爬上平台顶面继续追击。
- 移除唤魔者出场，替换为地面型 Ravager BOSS，战斗节奏清晰且不易卡人。
- 末影龙竞技场内主角始终可见且可操作。

## 非目标
- 不改动其他敌人的 AI 行为。
- 不重做末影龙竞技场整体坐标或渲染体系。
- 不对 BOSS 奖励体系做大幅调整，仅新增 Ravager 对应配置。

## 设计概览
### 1) 蜘蛛攀爬
- 仅在蜘蛛 AI 内新增攀爬状态，不改全局物理。
- 触发条件：蜘蛛与树干矩形或 grass 平台侧面发生碰撞。
- 行为：进入 climb 状态后优先向上移动，达到顶面或失去接触即退出。

### 2) Ravager BOSS（替代唤魔者）
- Ravager 为地面冲锋型 BOSS：蓄力 → 冲锋 → 硬直 → 循环。
- 近身咆哮造成短暂击退与小额伤害。
- 冲锋撞墙或到达边界触发短暂眩晕与咆哮，模拟被格挡后眩晕的节奏。

### 3) 末影龙竞技场可见性修复
- 进入竞技场时保存玩家原坐标与速度，并把玩家重定位到竞技场中心可视区域。
- 战斗期间对玩家坐标做边界夹紧，确保始终可见。
- 退出竞技场时恢复进入前坐标与速度。

## 关键行为细节
### 蜘蛛攀爬
- climb 速度：climbSpeed = speed * 0.9，可微调。
- climb 超时保护：超过 90 帧仍未到顶面则退出 climb，避免无限爬升。

### Ravager BOSS
- 状态机：stalk → charge_windup → charge_dash → recovery。
- 近身时触发 roar，造成击退与轻微伤害。
- 冲锋过程中限制在竞技场范围内，避免穿出边界。

### 末影龙竞技场
- 若玩家坐标出现 NaN 或异常，回退到竞技场中心并清零速度。

## 数据流与边界
- 蜘蛛：读取 trees 与 platforms 中的 grass，进行侧面判定；顶部落稳后回到 chase 或 patrol。
- Ravager：注册到 BOSS 核心与环境定义，奖励与战场逻辑复用现有 bossArena 流程。
- 末影龙竞技场：进入时保存 player 状态；战斗时 clamp；退出时还原。

## 具体改动清单
- src/modules/15-entities-combat.js
  - 增加蜘蛛攀爬状态与树干或草方块侧面检测。
- src/modules/15-entities-boss-ravager.js
  - 新增 RavagerBoss 实现。
- src/modules/15-entities-boss-core.js
  - BOSS_REGISTRY 与奖励配置加入 ravager，并移除 evoker。
- src/modules/15-entities-boss-environments.js
  - 增加 ravager 环境定义，复用现有 hazard。
- Game.html
  - 引入 ravager 模块脚本。
- src/modules/15-entities-boss-dragon.js
  - 进入与退出竞技场时保存并恢复玩家坐标。
  - 竞技场期间 clamp 玩家坐标。

## 风险与缓解
- 蜘蛛攀爬卡墙：增加超时退出与失去接触退出。
- Ravager 冲锋穿模：冲锋时强制 clamp 到竞技场边界。
- 竞技场重定位导致意外位移：退出时恢复原坐标。

## 验收与测试
- 蜘蛛可沿树干与 grass 平台侧面爬上顶面。
- 唤魔者不再出现，Ravager 在原阈值出现且节奏正常。
- 末影龙竞技场内玩家始终可见与可操作，退出后位置恢复。

## 参考
- https://minecraft.wiki/w/Ravager
- https://www.minecraft.net/en-us/article/meet-ravager
