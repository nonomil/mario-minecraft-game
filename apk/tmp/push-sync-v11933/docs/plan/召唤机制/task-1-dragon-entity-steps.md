# Task 1: EnderDragon 实体类实现 - 开发步骤

> Worktree: task-1-dragon-entity
> 分支: feat/summon-dragon-entity
> 预估: ~130行，2-3小时
> 依赖: 无

## 目标

实现 EnderDragon 和 EnderDragonFireball 类，更新投射物碰撞检测以支持 dragonList。

## 涉及文件

- `src/modules/15-entities-combat.js`（+130行）

## Step-by-Step 实施步骤

### Step 1: 创建 EnderDragon 类基础结构（~40行）

**位置**: `15-entities-combat.js` 末尾，在现有类之后

**实现内容**:
```javascript
class EnderDragon extends Entity {
  constructor(x, y) {
    super(x, y, 64, 48); // 尺寸：64x48
    this.hp = 30;
    this.maxHp = 30;
    this.speed = 2.5;
    this.faction = "golem"; // 友军阵营
    this.rideable = true;
    this.rider = null;
    this.fireballCooldown = 0;
    this.velX = 0;
    this.velY = 0;
    this.color = "#8B00FF"; // 紫色
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (typeof showFloatingText === 'function') {
      showFloatingText(`-${amount}`, this.x, this.y - 10);
    }
    if (this.hp <= 0) this.die();
  }

  die() {
    this.remove = true;
    // 如果有骑手，通知下龙（由 13-game-loop.js 处理）
    if (typeof showToast === 'function') {
      showToast("💀 末影龙已死亡");
    }
  }
}
```

**验收**:
- [ ] EnderDragon 类可以实例化
- [ ] takeDamage 方法正确减少血量
- [ ] 血量归零时 remove 标志设为 true

---

### Step 2: 实现 EnderDragon 移动逻辑（~30行）

**位置**: EnderDragon 类中新增 update 方法

**实现内容**:
```javascript
update(playerRef) {
  // 如果有骑手，由骑手控制移动（在 13-game-loop.js 中处理）
  if (this.rider) {
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

  // 边界限制（需要 cameraX, canvas, groundY 全局变量）
  if (typeof cameraX !== 'undefined' && typeof canvas !== 'undefined') {
    this.x = Math.max(cameraX - 50, Math.min(this.x, cameraX + canvas.width + 50));
  }
  if (typeof groundY !== 'undefined') {
    this.y = Math.max(50, Math.min(this.y, groundY - this.height - 50));
  }

  // 冷却计时
  if (this.fireballCooldown > 0) {
    this.fireballCooldown--;
  }
}
```

**验收**:
- [ ] 无骑手时末影龙自动跟随玩家
- [ ] 末影龙不会飞出屏幕边界
- [ ] fireballCooldown 正确递减

---

### Step 3: 实现火球发射方法（~15行）

**位置**: EnderDragon 类中新增 shootFireball 方法

**实现内容**:
```javascript
shootFireball(targetX, targetY) {
  if (this.fireballCooldown > 0) return false;

  const fireball = new EnderDragonFireball(
    this.x + this.width / 2,
    this.y + this.height / 2,
    targetX,
    targetY
  );

  if (typeof projectiles !== 'undefined') {
    projectiles.push(fireball);
  }

  this.fireballCooldown = 60; // 1秒冷却
  return true;
}
```

**验收**:
- [ ] 冷却时间内无法发射火球
- [ ] 火球正确添加到 projectiles 数组
- [ ] 冷却时间设置为60帧

---

### Step 4: 创建 EnderDragonFireball 类（~30行）

**位置**: `15-entities-combat.js` 中，DragonFireball 类之后

**实现内容**:
```javascript
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
        if (typeof showFloatingText === 'function') {
          showFloatingText(`-${this.damage}`, e.x, e.y - 10);
        }

        // AOE 伤害
        for (const target of enemyList) {
          if (target.remove || target === e) continue;
          const dist = Math.hypot(target.x - this.x, target.y - this.y);
          if (dist <= this.aoeRadius) {
            const aoeDamage = Math.round(this.damage * 0.5);
            target.takeDamage(aoeDamage);
            if (typeof showFloatingText === 'function') {
              showFloatingText(`-${aoeDamage}`, target.x, target.y - 10);
            }
          }
        }

        this.remove = true;
        return;
      }
    }

    // BOSS 碰撞检测（复用现有逻辑）
    if (typeof bossArena !== 'undefined' && bossArena.active && bossArena.boss && bossArena.boss.alive) {
      const b = bossArena.boss;
      if (rectIntersect(this.x, this.y, this.width, this.height, b.x, b.y, b.width, b.height)) {
        b.takeDamage(this.damage);
        this.remove = true;
        return;
      }
    }

    if (this.lifetime <= 0) this.remove = true;
  }
}
```

**验收**:
- [ ] 火球命中敌人造成25点直接伤害
- [ ] AOE范围内敌人受到12点伤害（50%）
- [ ] 火球可以攻击BOSS
- [ ] faction="player" 不会伤害玩家和傀儡

---

### Step 5: 更新投射物碰撞检测支持 dragonList（~15行）

**位置**: `Projectile.update()` 方法中，faction="enemy" 分支

**修改内容**:
```javascript
// 在 Projectile.update() 的 faction === "enemy" 分支中
// 原有代码：检查 golemList 碰撞
for (const g of golemList) {
  if (rectIntersect(this.x, this.y, this.width, this.height, g.x, g.y, g.width, g.height)) {
    g.takeDamage(this.damage);
    this.remove = true;
    return;
  }
}

// 新增：检查 dragonList 碰撞
if (typeof dragonList !== 'undefined') {
  for (const d of dragonList) {
    if (!d.remove && rectIntersect(this.x, this.y, this.width, this.height, d.x, d.y, d.width, d.height)) {
      d.takeDamage(this.damage);
      this.remove = true;
      return;
    }
  }
}
```

**验收**:
- [ ] 敌方投射物可以攻击末影龙
- [ ] 末影龙受到伤害时正确减少血量
- [ ] 不影响现有 golemList 碰撞检测

---

## 测试检查清单

### 单元测试
- [ ] EnderDragon 实例化成功
- [ ] takeDamage 正确减少血量
- [ ] 血量归零时 remove=true
- [ ] update 方法正确跟随玩家
- [ ] shootFireball 冷却机制正常
- [ ] EnderDragonFireball 正确计算 AOE 伤害

### 集成测试
- [ ] 敌方投射物可以攻击末影龙
- [ ] 末影龙火球可以攻击敌人和BOSS
- [ ] 末影龙火球不会伤害玩家
- [ ] 边界限制正常工作

### 兼容性测试
- [ ] 不影响现有 SnowGolem 系统
- [ ] 不影响现有 Projectile 系统
- [ ] 不影响现有敌人AI

---

## 注意事项

1. **全局变量依赖**: 确保 `cameraX`, `canvas`, `groundY`, `projectiles`, `dragonList` 在作用域内
2. **类型检查**: 使用 `typeof` 检查全局变量是否存在
3. **边界情况**: 处理 `dragonList` 未定义的情况
4. **性能**: AOE 伤害计算使用 `Math.hypot` 而非 `Math.sqrt`

---

## 完成标准

- [ ] 所有代码通过语法检查：`node -c src/modules/15-entities-combat.js`
- [ ] 所有测试检查清单项通过
- [ ] 代码风格与现有代码一致
- [ ] 无 console 警告或错误
- [ ] 提交信息：`feat(entities): add EnderDragon and EnderDragonFireball classes`
