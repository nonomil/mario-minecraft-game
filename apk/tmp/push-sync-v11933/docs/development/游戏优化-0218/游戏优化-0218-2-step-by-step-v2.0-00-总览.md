# 游戏优化-0218-2 Step-by-Step 计划（v2.0 总览）

日期：2026-02-18  
基线：以当前仓库代码为准（`apk/src/modules` 与 `apk/config`）

## 0. 先决说明（避免基线冲突）

你最新消息里的部分“代码事实”与当前仓库不一致。执行时按“实时代码检查结果”推进：

1. `viewportLocked/leftWall/rightWall`：当前代码存在。  
2. `canLeaveBiome/minStay`：当前代码存在，且 `config/biomes.json` 已有 `minStay`。  
3. BOSS不可见根因：当前更像“相机偏移重复处理”而非“renderBoss未传camX”。  

因此本计划采用“双轨”：
1. 先做 `Step 0` 自动核对基线。  
2. 再按 `Path-A(当前代码)` 或 `Path-B(若后续分支缺失逻辑)` 执行。

## 0.1 强制基线规则（新增）

1. 本轮实现、修复、回归一律以 `apk/*` 为唯一代码基线。  
2. 禁止把根目录 `src/*` 作为执行目标（仅可用于历史对照）。  
3. 所有变更文件路径必须以 `apk/` 开头。

## 0.2 Step 0 核对命令（可直接复制）

```powershell
# 1) 根目录 src（预期：可能无匹配）
rg -n "viewportLocked|leftWall|rightWall|canLeaveBiome|minStay" "src/modules"

# 2) apk 基线（预期：有匹配）
rg -n "viewportLocked|leftWall|rightWall|canLeaveBiome|minStay" "apk/src/modules" "apk/config/biomes.json"

# 3) 关键文件分叉规模（用于确认不能混用）
git diff --no-index -- "src/modules/06-biome.js" "apk/src/modules/06-biome.js" | Measure-Object -Line
git diff --no-index -- "src/modules/13-game-loop.js" "apk/src/modules/13-game-loop.js" | Measure-Object -Line
git diff --no-index -- "src/modules/15-entities-boss.js" "apk/src/modules/15-entities-boss.js" | Measure-Object -Line
```

## 1. 版本文件清单

1. `游戏优化-0218-2-step-by-step-v2.0-01-P0-BOSS可见性修复.md`  
2. `游戏优化-0218-2-step-by-step-v2.0-02-P1-BOSS战可打性与竞技场复核.md`  
3. `游戏优化-0218-2-step-by-step-v2.0-03-P2-群系切换平衡.md`  
4. `游戏优化-0218-2-step-by-step-v2.0-04-P3-逐Boss回归与发布.md`

## 2. 执行顺序

1. Step 0：基线核对（必须）  
2. P0：先修 BOSS 可见性（致命）  
3. P1：补可打性与竞技场复核  
4. P2：群系切换平衡  
5. P3：全量回归与发布记录

## 3. 总体DoD

1. 不再出现“掉血但看不到BOSS”。  
2. 飞行BOSS战至少存在一种稳定可行攻击路径。  
3. 火山/地狱停留体感拉长，但不拖沓。  
4. 四个BOSS可打、可见、可结算，且无明显回归。
