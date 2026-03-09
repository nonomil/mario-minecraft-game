# Task 2: 骑乘系统集成 - 开发步骤

> Worktree: task-2-riding-system
> 分支: feat/summon-dragon-riding
> 预估: ~125行，3-4小时
> 依赖: Task 1（需要 EnderDragon 类）

## 目标

实现骑乘系统、龙蛋使用逻辑、下龙保护机制、末影龙渲染。

## 涉及文件

- `src/modules/13-game-loop.js`（+105行）
- `src/modules/14-renderer-entities.js`（+20行）
- `config/consumables.json`（+5行）

## Step-by-Step 实施步骤

### Step 1: 添加全局状态变量（~10行）

**位置**: `13-game-loop.js` 顶部，其他全局变量之后

**实现内容**:
```javascript
// 末影龙系统
let dragonList = [];
let ridingDragon = null;
let skipPlayerGravity = false;
let dismountInvincibleFrames = 0;
```

**验收**:
- [ ] 变量声明无语法错误
- [ ] 变量初始值正确

---

### Step 2: 实现龙蛋使用逻辑（~25行）

**位置**: `13-game-loop.js` 中，消耗品使用函数区域

**实现内容**:
```javascript
function useDragonEgg() {
  // 检查是否已有末影龙
  if (dragonList.length > 0) {
    showToast("⚠️ 已有末影龙存在");
    return false;
  }

  // 检查龙蛋数量
  if ((inventory.dragon_egg || 0) <= 0) {
    showToast("❌ 没有龙蛋");
    return false;
  }

  // 消耗龙蛋
  inventory.dragon_egg--;
  if (typeof updateInventoryUI === 'function') {
    updateInventoryUI();
  }

  // 召唤末影龙
  const dragon = new EnderDragon(player.x + 50, player.y - 100);
  dragonList.push(dragon);
  showToast("🐉 召唤末影龙");
  return true;
}
```

**验收**:
- [ ] 已有末影龙时提示并返回 false
- [ ] 无龙蛋时提示并返回 false
- [ ] 成功召唤时消耗龙蛋并创建末影龙
- [ ] 末影龙出现在玩家附近

---

### Step 3: 实现下龙逻辑（~15行）

**位置**: `13-game-loop.js` 中，useDragonEgg 之后

**实现内容**:
```javascript
function dismountRider(rider) {
  if (!ridingDragon) return;

  ridingDragon.rider = null;
  ridingDragon = null;

  // 给予缓降效果
  rider.velY = -2;

  // 无敌帧
  dismountInvincibleFrames = 60;

  showToast("⬇️ 已下龙");
}
```

**验收**:
- [ ] 下龙后 ridingDragon 设为 null
- [ ] 玩家获得向上速度（缓降）
- [ ] 无敌帧设置为60

---

### Step 4: 实现火球发射逻辑（~10行）

**位置**: `13-game-loop.js` 中，dismountRider 之后

**实现内容**:
```javascript
function dragonShootFireball() {
  if (!ridingDragon) return false;

  const dir = player.facingRight ? 1 : -1;
  const targetX = ridingDragon.x + dir * 300;
  const targetY = ridingDragon.y;

  return ridingDragon.shootFireball(targetX, targetY);
}
```

**验收**:
- [ ] 未骑乘时返回 false
- [ ] 火球朝玩家面向方向发射
- [ ] 调用末影龙的 shootFireball 方法

---

### Step 5: 在主循环中更新末影龙（~20行）

**位置**: `13-game-loop.js` 的 `update()` 函数中，敌人更新之后

**实现内容**:
```javascript
// 更新末影龙
for (const dragon of dragonList) {
  if (dragon.remove) continue;
  dragon.update(player);
}
dragonList = dragonList.filter(d => !d.remove);

// 下龙无敌帧
if (dismountInvincibleFrames > 0) {
  dismountInvincibleFrames--;
}
```

**验收**:
- [ ] 末影龙每帧正确更新
- [ ] 已移除的末影龙被过滤
- [ ] 无敌帧正确递减

---

### Step 6: 实现骑乘状态管理（~35行）

**位置**: `13-game-loop.js` 的 `update()` 函数中，末影龙更新之后

**实现内容**:
```javascript
// 骑乘逻辑
if (ridingDragon) {
  // 检查末影龙是否还存在
  if (ridingDragon.remove || !dragonList.includes(ridingDragon)) {
    dismountRider(player);
  } else {
    // 同步玩家位置
    player.x = ridingDragon.x + (ridingDragon.width - player.width) / 2;
    player.y = ridingDragon.y - player.height;
    player.velX = 0;
    player.velY = 0;

    // 控制末影龙移动
    const moveSpeed = ridingDragon.speed;
    if (keys.ArrowLeft || keys.KeyA) {
      ridingDragon.x -= moveSpeed;
      player.facingRight = false;
    }
    if (keys.ArrowRight || keys.KeyD) {
      ridingDragon.x += moveSpeed;
      player.facingRight = true;
    }
    if (keys.ArrowUp || keys.KeyW) {
      ridingDragon.y -= moveSpeed;
    }
    if (keys.ArrowDown || keys.KeyS) {
      ridingDragon.y += moveSpeed;
    }

    // 边界限制
    ridingDragon.x = Math.max(cameraX - 50, Math.min(ridingDragon.x, cameraX + canvas.width + 50));
    ridingDragon.y = Math.max(50, Math.min(ridingDragon.y, groundY - ridingDragon.height - 50));

    // 跳过玩家重力更新
    skipPlayerGravity = true;
  }
} else {
  skipPlayerGravity = false;

  // 检测上龙
  for (const dragon of dragonList) {
    if (rectIntersect(player.x, player.y, player.width, player.height, dragon.x, dragon.y, dragon.width, dragon.height)) {
      ridingDragon = dragon;
      dragon.rider = player;
      showToast("🐉 骑乘末影龙");
      break;
    }
  }
}
```

**验收**:
- [ ] 骑乘时玩家位置正确同步
- [ ] WASD 控制末影龙移动
- [ ] 末影龙不会飞出边界
- [ ] 末影龙死亡时自动下龙
- [ ] 碰撞检测正确触发上龙

---

### Step 7: 修改玩家重力更新（~5行）

**位置**: `13-game-loop.js` 的 `update()` 函数中，玩家物理更新部分

**修改内容**:
```javascript
// 玩家重力更新（骑乘时跳过）
if (!skipPlayerGravity) {
  // 原有重力逻辑
  // ...
}
```

**验收**:
- [ ] 骑乘时玩家不受重力影响
- [ ] 下龙后重力正常恢复

---

### Step 8: 绑定攻击键到火球发射（~5行）

**位置**: `13-game-loop.js` 的攻击键处理部分

**修改内容**:
```javascript
// 在攻击键处理中
if (ridingDragon) {
  dragonShootFireball();
} else {
  // 原有攻击逻辑
}
```

**验收**:
- [ ] 骑乘时攻击键发射火球
- [ ] 未骑乘时攻击键正常工作

---

### Step 9: 实现末影龙渲染（~20行）

**位置**: `14-renderer-entities.js` 中，傀儡渲染之后

**实现内容**:
```javascript
// 渲染末影龙
if (typeof dragonList !== 'undefined') {
  for (const dragon of dragonList) {
    if (dragon.remove) continue;

    const screenX = dragon.x - cameraX;
    const screenY = dragon.y;

    // 绘制末影龙身体
    ctx.fillStyle = dragon.color || "#8B00FF";
    ctx.fillRect(screenX, screenY, dragon.width, dragon.height);

    // 绘制血条
    const hpRatio = dragon.hp / dragon.maxHp;
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(screenX, screenY - 10, dragon.width, 4);
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(screenX, screenY - 10, dragon.width * hpRatio, 4);

    // 绘制图标
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "24px Arial";
    ctx.fillText("🐉", screenX + dragon.width / 2 - 12, screenY + dragon.height / 2 + 8);
  }
}
```

**验收**:
- [ ] 末影龙正确显示在屏幕上
- [ ] 血条正确显示当前血量
- [ ] 龙图标居中显示

---

### Step 10: 更新 consumables.json（~5行）

**位置**: `config/consumables.json` 中，dragon_egg 配置

**修改内容**:
```json
"dragon_egg": {
  "name": "龙蛋",
  "icon": "🥚",
  "effect": {
    "type": "summon_dragon",
    "description": "召唤末影龙"
  }
}
```

**验收**:
- [ ] JSON 格式正确
- [ ] type 设置为 summon_dragon

---

## 测试检查清单

### 单元测试
- [ ] useDragonEgg 正确检查数量限制
- [ ] dismountRider 正确设置无敌帧
- [ ] dragonShootFireball 正确发射火球
- [ ] 骑乘状态正确同步玩家位置

### 集成测试
- [ ] 使用龙蛋成功召唤末影龙
- [ ] 跳到末影龙身上自动骑乘
- [ ] WASD 控制末影龙移动
- [ ] 攻击键发射火球
- [ ] 末影龙死亡时自动下龙
- [ ] 下龙后玩家安全落地（无敌帧+缓降）
- [ ] 同时只能存在1只末影龙

### 兼容性测试
- [ ] 不影响正常玩家移动
- [ ] 不影响正常攻击
- [ ] 不影响其他消耗品使用

---

## 注意事项

1. **依赖检查**: 确保 Task 1 已完成，EnderDragon 类可用
2. **全局变量**: 确保 `keys`, `player`, `inventory`, `cameraX`, `canvas`, `groundY` 在作用域内
3. **边界情况**: 处理末影龙死亡时玩家正在骑乘的情况
4. **性能**: 骑乘状态检查在主循环中，注意性能影响

---

## 完成标准

- [ ] 所有代码通过语法检查：`node -c src/modules/13-game-loop.js src/modules/14-renderer-entities.js`
- [ ] JSON 配置文件格式正确
- [ ] 所有测试检查清单项通过
- [ ] 代码风格与现有代码一致
- [ ] 无 console 警告或错误
- [ ] 提交信息：`feat(riding): implement dragon riding system and rendering`
