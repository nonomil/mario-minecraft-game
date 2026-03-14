﻿# 烈焰人旋转火焰阵设计

## 背景与目标
- 目标：提升烈焰人战斗的可学习性、节奏感和可读性，同时维持现有火焰主题风格。
- 约束：不新增额外攻击形态，改造现有 `castFlameRing()` 为阶段化“旋转火焰阵 + 移动安全区 + 惩罚窗口”。

## 设计原则
- 3~5 秒内可感知“即将发生什么”。
- 高伤害技能必须有明确预警。
- 至少有 1 个可反击窗口，并可稳定复现。
- 不叠加过多视觉噪音，保证安全区可读。

## 机制设计概述
### 状态机
`idle -> telegraph -> active -> punish -> cooldown`

- **telegraph（0.8s）**：出现半透明环与缺口提示，环不造成伤害。
- **active（4~5s）**：环开始旋转，缺口为安全区；玩家需跟随缺口移动。
- **punish（1.5~2s）**：烈焰人短暂停滞或承伤提升，形成反击窗口。
- **cooldown（6~8s）**：回到常规火球/旋风节奏。

### 伤害判定
- 环形带有内外半径，玩家处于“带区域”且不在缺口角度范围时受伤。
- 伤害设命中冷却，避免连续帧叠伤造成秒杀。
- 缺口角度范围固定，但旋转速度随阶段提升。

### 阶段节奏
- Phase2：旋转速度中等、缺口宽一些，强调可学习性。
- Phase3：旋转速度更快、缺口略收窄，强化压力但仍可读。

## 视觉与反馈
- **telegraph**：环边缘高亮，缺口用亮弧 + 方向粒子/箭头提示。
- **active**：环持续旋转，缺口位置始终可见。
- **punish**：烈焰人短暂闪白或“破绽”浮字提示。

## 调试与验证
### 调试接口
- `blazeRing.enabled`：启用/禁用旋转阵
- `blazeRing.speed`：旋转速度
- `blazeRing.gapSize`：安全区角度
- `window.MMDBG.setBlazeRingConfig({ enabled, speed, gapSize })`：调试配置入口
- `window.MMDBG.forceBlazeRing()`：强制进入旋转阵流程
- `window.MMDBG.getState()`：返回 `bossRingState / bossRingSpeed / bossRingGapSize`

### 验证要点
- 进入战斗 3~5 秒能看到清晰预警。
- 缺口可读，能跟随躲避。
- punish 期间有明确可输出窗口。
- Debug 可稳定触发该流程。
