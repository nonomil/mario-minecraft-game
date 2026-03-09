# 工程审查报告 - 末影龙召唤系统

> 审查日期：2026-03-06
> 审查人：Claude Code (CC)
> 状态：Phase 2 完成

## 1. 架构评估

**评分：4/5**

### 优点
- ✅ 复用现有 Entity 基类和 Projectile 系统，代码复用度高
- ✅ faction 机制已经成熟（enemy/golem/player），可直接使用
- ✅ golemList 管理方式与 SnowGolem 一致，兼容性好

### 问题与建议

**问题1：golemList 语义混淆**
- 当前：golemList 包含雪傀儡（SnowGolem）
- 计划：将 EnderDragon 也放入 golemList
- 问题：末影龙不是"傀儡"，语义上不匹配

**建议**：
```javascript
// 方案A：独立管理（推荐）
let dragonList = []; // 独立管理末影龙
// 优点：语义清晰，不影响现有 golemList 逻辑
// 缺点：需要在投射物碰撞检测中新增 dragonList 判断

// 方案B：重命名为 allyList（备选）
let allyList = []; // 统一管理友军实体（傀儡 + 末影龙）
// 优点：语义更准确
// 缺点：需要重构现有代码，改动范围大
```

**推荐：方案A（独立 dragonList）**，理由：
- 改动最小，只需在投射物 update 中新增 dragonList 碰撞检测
- 末影龙同时只有1只，管理简单
- 不影响现有 golemList 逻辑

---

**问题2：骑乘状态与重力系统冲突**
- 当前：`updateEntityGravity()` 对所有实体应用重力
- 计划：骑乘时 `player.grounded = false` 禁用重力
- 风险：玩家下龙后可能出现重力状态异常

**建议**：
```javascript
// 骑乘状态标记
let ridingDragon = null;

// 在 update() 中
if (ridingDragon) {
  // 同步位置
  player.x = ridingDragon.x + (ridingDragon.width - player.width) / 2;
  player.y = ridingDragon.y - player.height;

  // 关键：清空速度但不修改 grounded
  player.velX = 0;
  player.velY = 0;

  // 跳过重力更新
  skipPlayerGravity = true;
} else {
  skipPlayerGravity = false;
}

// 在玩家物理更新前检查
if (!skipPlayerGravity) {
  // 正常重力逻辑
}
```

---

## 2. 风险点分析

| 风险 | 严重度 | 概率 | 建议 |
|------|--------|------|------|
| 末影龙死亡时玩家悬空坠落伤害 | 高 | 高 | 下龙时给予短暂无敌帧（60帧）+ 缓降效果 |
| 骑乘时玩家碰撞箱异常 | 高 | 中 | 骑乘时禁用玩家与地形的碰撞，只保留敌人伤害判定 |
| 末影龙飞出屏幕边界 | 中 | 中 | 限制飞行范围：`cameraX - 50 < dragon.x < cameraX + canvas.width + 50` |
| 火焰粒子数量过多影响性能 | 中 | 高 | 使用对象池 + 限制同时存在数量（最多50个） |
| 火球 AOE 误伤友军 | 低 | 低 | faction="player" 已正确设置，但需确保不检测 golemList/dragonList |
| 多次召唤导致多只末影龙 | 中 | 中 | 使用龙蛋前检查 `dragonList.length > 0`，存在时提示"已有末影龙" |

---

## 3. 兼容性检查

### golemList 管理
**当前实现**（15-entities-combat.js）：
```javascript
// SnowGolem 在 golemList 中管理
// 投射物 update 中检查 golemList 碰撞
```

**建议修改**：
- 使用独立 `dragonList` 管理末影龙
- 在 `Projectile.update()` 中新增 dragonList 碰撞检测（faction="enemy" 时）

### faction 机制
**当前支持**：
- `enemy`：攻击玩家和 golemList
- `golem`：攻击 enemyList
- `player`：攻击 enemyList 和 BOSS

**兼容性**：✅ 完全兼容
- EnderDragonFireball 使用 `faction="player"`，逻辑已存在（第56-74行）

### 碰撞检测
**当前逻辑**：
- 玩家与敌人：`damagePlayer()`
- 玩家与地形：`updateEntityGravity()`
- 投射物与实体：`Projectile.update()`

**需要新增**：
```javascript
// 在 update() 主循环中
if (!ridingDragon) {
  // 检测玩家与末影龙碰撞（上龙）
  for (const dragon of dragonList) {
    if (rectIntersect(player, dragon)) {
      ridingDragon = dragon;
      showToast("🐉 骑乘末影龙");
      break;
    }
  }
}
```

---

## 4. 实施建议

### 任务拆分评估
**原计划**：
- Task 1：EnderDragon + EnderDragonFireball 类（120行）
- Task 2：骑乘逻辑 + 火药增强（155行）

**问题**：Task 2 改动过大（155行），建议拆分为3个任务

**优化后**：
| Task | 内容 | 文件 | 预估行数 | 依赖 |
|------|------|------|---------|------|
| Task 1 | EnderDragon + EnderDragonFireball 类 | 15-entities-combat.js | ~120 | 无 |
| Task 2 | 骑乘系统（上下龙、位置同步、控制） | 13-game-loop.js | ~80 | Task 1 |
| Task 3 | 火药增强 + 配置更新 | 04-weapons.js, consumables.json | ~50 | 无 |

**优点**：
- Task 3 与 Task 1/2 无依赖，可并行开发
- 每个任务 < 120行，符合简单模式标准
- 降低单次改动风险

### 遗漏点

1. **投射物碰撞检测更新**
   - 文件：`15-entities-combat.js` Projectile.update()
   - 需要：faction="enemy" 时检查 dragonList 碰撞
   - 预估：+10行

2. **末影龙渲染**
   - 文件：`src/modules/14-renderer-entities.js`
   - 需要：新增 dragonList 渲染逻辑
   - 预估：+20行

3. **龙蛋使用逻辑**
   - 文件：`13-game-loop.js` 或独立消耗品处理函数
   - 需要：检测龙蛋使用 → 召唤末影龙
   - 预估：+15行

4. **下龙保护机制**
   - 文件：`13-game-loop.js`
   - 需要：下龙时给予无敌帧 + 缓降效果
   - 预估：+10行

**更新后总行数**：~120 + 80 + 50 + 10 + 20 + 15 + 10 = **305行**

---

## 5. 关键代码建议

### 5.1 EnderDragon 类（15-entities-combat.js）

```javascript
class EnderDragon extends Entity {
  constructor(x, y) {
    super(x, y, 64, 48); // 尺寸：64x48
    this.hp = 30;
    this.maxHp = 30;
    this.speed = 2.5;
    this.faction = "golem"; // 友军阵营
    this.rideable = true;
    this.rider = null; // 当前骑手
    this.fireballCooldown = 0;
    this.velX = 0;
    this.velY = 0;
  }

  takeDamage(amount) {
    this.hp -= amount;
    showFloatingText(`-${amount}`, this.x, this.y - 10);
    if (this.hp <= 0) this.die();
  }

  die() {
    this.remove = true;
    // 如果有骑手，强制下龙
    if (this.rider) {
      dismountRider(this.rider);
    }
    showToast("💀 末影龙已死亡");
  }

  update(playerRef) {
    // 如果有骑手，由骑手控制移动
    if (this.rider) {
      // 移动逻辑在 13-game-loop.js 中处理
      return;
    }

    // 无骑手时：悬停在玩家附近
    const targetX = playerRef.x + 100;
    const targetY = playerRef.y - 80;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 20) {
      this.velX = (dx / dist) * this.speed;
      this.velY = (dy / dist) * this.speed;
      this.x += this.velX;
      this.y += this.velY;
    }

    // 边界限制
    this.x = clamp(this.x, cameraX - 50, cameraX + canvas.width + 50);
    this.y = clamp(this.y, 50, groundY - this.height - 50);
  }

  shootFireball(targetX, targetY) {
    if (this.fireballCooldown > 0) return false;

    const fireball = new EnderDragonFireball(
      this.x + this.width / 2,
      this.y + this.height / 2,
      targetX,
      targetY
    );
    projectiles.push(fireball);
    this.fireballCooldown = 60; // 1秒冷却
    return true;
  }
}

class EnderDragonFireball extends Projectile {
  constructor(x, y, targetX, targetY) {
    super(x, y, targetX, targetY, 3, "player");
    this.damage = 25;
    this.aoeRadius = 30;
    this.width = 16;
    this.height = 16;
  }

  update(playerRef, golemList, enemyList) {
    this.x += this.velX;
    this.y += this.velY;
    this.lifetime--;

    // 检测敌人碰撞
    for (const e of enemyList) {
      if (!e.remove && rectIntersect(this.x, this.y, this.width, this.height, e.x, e.y, e.width, e.height)) {
        // 直接伤害
        e.takeDamage(this.damage);
        showFloatingText(`-${this.damage}`, e.x, e.y - 10);

        // AOE 伤害
        for (const target of enemyList) {
          if (target.remove) continue;
          const dist = Math.hypot(target.x - this.x, target.y - this.y);
          if (dist <= this.aoeRadius && target !== e) {
            const aoeDamage = Math.round(this.damage * 0.5);
            target.takeDamage(aoeDamage);
            showFloatingText(`-${aoeDamage}`, target.x, target.y - 10);
          }
        }

        this.remove = true;
        return;
      }
    }

    if (this.lifetime <= 0) this.remove = true;
  }
}
```

### 5.2 骑乘系统（13-game-loop.js）

```javascript
// 全局状态
let dragonList = [];
let ridingDragon = null;
let dismountInvincibleFrames = 0; // 下龙无敌帧

// 在 update() 主循环中
function update() {
  if (paused) return;

  // 更新末影龙
  for (const dragon of dragonList) {
    if (dragon.remove) continue;
    dragon.update(player);
    if (dragon.fireballCooldown > 0) dragon.fireballCooldown--;
  }
  dragonList = dragonList.filter(d => !d.remove);

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
      ridingDragon.x = clamp(ridingDragon.x, cameraX - 50, cameraX + canvas.width + 50);
      ridingDragon.y = clamp(ridingDragon.y, 50, groundY - ridingDragon.height - 50);

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

  // 下龙无敌帧
  if (dismountInvincibleFrames > 0) {
    dismountInvincibleFrames--;
  }

  // 玩家重力更新（骑乘时跳过）
  if (!skipPlayerGravity) {
    // 原有重力逻辑
  }
}

function dismountRider(rider) {
  if (!ridingDragon) return;

  ridingDragon.rider = null;
  ridingDragon = null;

  // 给予缓降效果
  rider.velY = -2; // 轻微向上速度

  // 无敌帧
  dismountInvincibleFrames = 60;

  showToast("⬇️ 已下龙");
}

// 使用龙蛋
function useDragonEgg() {
  // 检查是否已有末影龙
  if (dragonList.length > 0) {
    showToast("⚠️ 已有末影龙存在");
    return false;
  }

  // 消耗龙蛋
  if ((inventory.dragon_egg || 0) <= 0) {
    showToast("❌ 没有龙蛋");
    return false;
  }

  inventory.dragon_egg--;
  updateInventoryUI();

  // 召唤末影龙
  const dragon = new EnderDragon(player.x + 50, player.y - 100);
  dragonList.push(dragon);
  showToast("🐉 召唤末影龙");
  return true;
}

// 发射火球（绑定到攻击键）
function dragonShootFireball() {
  if (!ridingDragon) return false;

  const dir = player.facingRight ? 1 : -1;
  const targetX = ridingDragon.x + dir * 300;
  const targetY = ridingDragon.y;

  return ridingDragon.shootFireball(targetX, targetY);
}
```

### 5.3 火药增强（04-weapons.js）

```javascript
// 地面火焰效果
function createGroundFire(centerX, centerY, forwardRange, width, duration) {
  const dir = player.facingRight ? 1 : -1;
  const startX = centerX;
  const endX = centerX + dir * forwardRange;
  const fireCount = Math.floor(forwardRange / 20); // 每20px一个火焰

  for (let i = 0; i <= fireCount; i++) {
    const x = startX + (endX - startX) * (i / fireCount);
    const y = groundY - 10; // 地面位置

    // 创建火焰区域（使用现有 debuff 系统）
    const fireZone = {
      x: x,
      y: y,
      width: 20,
      height: 20,
      duration: duration,
      damagePerFrame: 0.1,
      type: "fire"
    };

    // 添加到全局火焰区域列表
    if (typeof fireZones === 'undefined') {
      window.fireZones = [];
    }
    fireZones.push(fireZone);

    // 生成火焰粒子
    if (typeof particles !== 'undefined' && typeof EmberParticle !== 'undefined') {
      for (let j = 0; j < 3; j++) {
        particles.push(new EmberParticle(x, y));
      }
    }
  }
}

// 更新火焰区域（在 update() 中调用）
function updateFireZones() {
  if (typeof fireZones === 'undefined') return;

  for (const zone of fireZones) {
    zone.duration--;

    // 对范围内敌人造成伤害
    for (const enemy of enemies) {
      if (enemy.remove) continue;
      if (rectIntersect(enemy.x, enemy.y, enemy.width, enemy.height, zone.x, zone.y, zone.width, zone.height)) {
        enemy.addDebuff("burn", 60, { damagePerFrame: zone.damagePerFrame });
      }
    }

    // 生成粒子
    if (zone.duration % 10 === 0 && typeof particles !== 'undefined') {
      particles.push(new EmberParticle(zone.x + Math.random() * zone.width, zone.y));
    }
  }

  // 清理过期火焰
  fireZones = fireZones.filter(z => z.duration > 0);
}
```

---

## 6. 总体评价

### 可行性：**高**

技术方案整体可行，基于现有系统扩展，风险可控。

### 必须修改的点

1. **使用独立 dragonList**（而非 golemList）
2. **骑乘时不修改 player.grounded**，使用 skipPlayerGravity 标志
3. **下龙时给予无敌帧 + 缓降效果**
4. **任务拆分优化为3个任务**（实体类、骑乘系统、火药增强）
5. **新增遗漏文件**：14-renderer-entities.js（末影龙渲染）

### 可选优化

- 末影龙死亡动画
- 骑乘状态UI提示
- 火球发射音效
- 火焰粒子对象池优化

---

**Phase 2 完成，等待用户确认审查意见。**
