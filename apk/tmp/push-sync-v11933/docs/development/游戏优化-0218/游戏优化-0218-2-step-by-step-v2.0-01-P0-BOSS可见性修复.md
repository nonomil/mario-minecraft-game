# v2.0-P0：BOSS可见性修复（最高优先级）

## 0. 目标

修复“主角掉血但看不到BOSS/弹幕”的致命问题。

## 0.1 基线约束（执行前）

1. 本文档所有代码修改仅限 `apk/src/*`。  
2. 若在根目录 `src/*` 发现同名文件，不进行修改。  
3. 提交前检查变更路径，必须全部是 `apk/` 前缀。

## 1. Step 0：基线核对（执行前）

命令核对：
1. 检查 `draw()` 是否有 `ctx.translate(-cameraX, 0)`。  
2. 检查 `renderBossSystem()` 是否把 `cameraX` 继续传给 `bossArena.renderBoss/renderProjectiles`。  
3. 检查 BOSS `render()` 是否内部执行 `x - camX`。

判定：
1. 若同时满足 1+2+3，则是“相机偏移重复处理”路径（Path-A）。  
2. 若不满足，则进入 Path-B（补缺修正）。

## 2. Path-A（当前仓库大概率路径）

### Step A1：统一“只偏移一次”原则

涉及文件：
- `src/modules/14-renderer-entities.js`

操作：
1. 在 `renderBossSystem()` 中，保留当前 `draw()` 的 `translate(-cameraX,0)` 模式。  
2. 调用 `bossArena.renderBoss(ctx, 0)` 和 `bossArena.renderProjectiles(ctx, 0)`。  

### Step A2：可视范围手动验证

验证点：
1. 2000分触发凋零后，BOSS本体可见。  
2. 凋零弹幕可见，位置与碰撞一致。  
3. 玩家受击与视觉一致（不再“空受击”）。

## 3. Path-B（若后续分支代码不同）

### Step B1：若未传 `camX`

操作：
1. 若 `draw()` 无 `translate`，则将 `cameraX` 作为 `camX` 传入。  
2. 若 `draw()` 有 `translate`，则 `camX` 必须传 `0`。

### Step B2：避免 `NaN` 兜底

操作：
1. 在关键 `render(ctx, camX)` 内增加轻量兜底：`const cx = Number(camX) || 0`。  
2. 用 `cx` 参与坐标计算，防止异常参数导致整帧不可见。

## 4. 验收标准（P0）

1. 凋零/恶魂/烈焰人/凋零骷髅都可见。  
2. BOSS弹幕可见且命中一致。  
3. 无“看不见敌人但掉血”的反馈复现。  
4. 无新报错（控制台不出现 BOSS render 相关 NaN 异常）。
