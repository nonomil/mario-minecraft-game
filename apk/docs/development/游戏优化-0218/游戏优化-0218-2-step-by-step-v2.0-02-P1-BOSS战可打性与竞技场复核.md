# v2.0-P1：BOSS战可打性与竞技场复核

## 0. 目标

在 P0 可见性修复后，确保“能打赢、体验公平、边界稳定”。

## 1. Step 1：飞行BOSS可打性兜底

涉及文件：
- `src/modules/04-weapons.js`
- `src/modules/15-entities-boss.js`

### Step 1-1：开战资源检查

操作：
1. 在 `bossArena.enter()` 处检测 `bossType` 是否飞行型（`wither/ghast/blaze`）。  
2. 若 `inventory.arrow` 低于阈值（建议 8~12），执行兜底方案：
- 方案A（推荐）：补足到最小箭量；
- 方案B：只提示并给短时近战增益（次选）。

### Step 1-2：提示与可理解性

操作：
1. 开战 toast 明确“飞行BOSS建议弓箭”。  
2. 箭不足提示去重，避免连续刷屏。

## 2. Step 2：竞技场机制复核（不是重做）

涉及文件：
- `src/modules/15-entities-boss.js`
- `src/modules/13-game-loop.js`

操作：
1. 复核 `viewportLocked/leftWall/rightWall` 生效时机。  
2. 复核 `bossArena.exit()` 是否始终释放相机锁。  
3. 在异常退出（死亡/暂停/报错）路径下增加锁状态清理兜底。

## 3. Step 3：命中与受击一致性

涉及文件：
- `src/modules/04-weapons.js`
- `src/modules/15-entities-combat.js`
- `src/modules/15-entities-boss.js`

操作：
1. 近战命中凋零窗口检查（碰撞箱与渲染位置一致）。  
2. 远程箭矢命中BOSS判定检查。  
3. 反弹弹幕命中BOSS判定检查。

## 4. 验收标准（P1）

1. 飞行BOSS开战后，玩家始终可进行有效攻击。  
2. 竞技场锁定/解除稳定，无“锁死相机”遗留。  
3. 受击、命中、视觉表现一致，无明显“幽灵判定”。
