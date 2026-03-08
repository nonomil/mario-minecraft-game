# Task-2: Debuff 系统 + 粒子扩展 - 详细实施步骤

> 生成日期：2026-03-05
> Worktree: task-2
> 分支: feat/consumable-effects
> 预估行数: ~140
> 依赖: 无（可与 task-1 并行）

---

## 任务概述

为敌人系统添加 Debuff 机制（燃烧、减速），并扩展粒子系统以支持特效渲染。本任务与 task-1 完全解耦，可并行开发。

### 核心功能
1. **Debuff 系统**：Enemy 类支持多种 debuff 效果
2. **燃烧效果**：持续伤害 + EmberParticle 粒子
3. **减速效果**：速度修正 + 原始速度保存/恢复
4. **Debuff 防护**：同类型 debuff 刷新而非叠加
5. **粒子池**：复用粒子对象，提升性能

### 涉及文件
- `src/modules/15-entities-combat.js` - Enemy 类扩展（~90 行）
- `src/modules/15-entities-particles.js` - 粒子池机制（~50 行）

---

## 实施步骤

### Step 1: Enemy 类添加 Debuff 状态（15-entities-combat.js）

**位置**：Enemy 构造函数（第 105-132 行）

**操作**：在构造函数末尾添加 debuff 相关状态

```javascript
class Enemy extends Entity {
    constructor(x, y, type = "zombie", range = 120) {
        const stats = ENEMY_STATS[type] || ENEMY_STATS.zombie;
        const size = stats.size || { w: 32, h: 32 };
        const diff = getDifficultyState();
        super(x, y, size.w, size.h);
        this.type = type;
        this.startX = x;
        this.startY = y;
        this.range = range;
        this.hp = Math.max(1, Math.round(stats.hp * diff.enemyHpMult));
        this.maxHp = this.hp;
        this.speed = stats.speed;
        this.damage = Math.max(1, Math.round(stats.damage * diff.enemyDamageMult));
        this.attackType = stats.attackType;
        this.color = stats.color;
        this.drops = stats.drops || [];
        this.scoreValue = Math.max(1, Math.round((stats.scoreValue || gameConfig.scoring.enemy) * diff.scoreMultiplier));
        this.dir = 1;
        this.state = "patrol";
        this.attackCooldown = 0;
        this.explodeTimer = 0;
        this.teleportCooldown = 0;
        this.phaseChanged = false;
        this.velY = 0;
        this.grounded = false;
        this.webbed = 0; // 蛛网减速计时器

        // ===== 新增：Debuff 系统状态 =====
        this.debuffs = [];           // Debuff 数组
        this.originalSpeed = null;   // 保存原始速度用于减速恢复
    }

    // ... 其他方法保持不变
}
```

**验收**：
- [ ] Enemy 实例包含 `debuffs` 数组
- [ ] Enemy 实例包含 `originalSpeed` 属性

---

### Step 2: 实现 addDebuff 方法（15-entities-combat.js）

**位置**：Enemy 类中，takeDamage 方法之后（第 149 行后）

**操作**：添加 addDebuff 方法，支持防叠加逻辑

```javascript
    die() {
        this.remove = true;
        this.y = 1000;
        if (Math.random() < 0.6 && this.drops.length) {
            const drop = this.drops[Math.floor(Math.random() * this.drops.length)];
            dropItem(drop, this.x, this.y);
        }
        addScore(this.scoreValue);
        recordEnemyKill(this.type);
    }

    // ===== 新增：添加 Debuff 方法 =====
    addDebuff(type, duration, params = {}) {
        // 防止同类型 debuff 叠加
        const existing = this.debuffs.find(d => d.type === type);
        if (existing) {
            // 刷新持续时间，取最大值
            existing.duration = Math.max(existing.duration, duration);
            return;
        }

        // 减速效果：保存原始速度（仅首次）
        if (type === "slow" && this.originalSpeed === null) {
            this.originalSpeed = this.speed;
        }

        // 添加新 debuff
        this.debuffs.push({
            type: type,
            duration: duration,
            damagePerFrame: params.damagePerFrame || 0,
            speedMult: params.speedMult || 1.0,
            particleTimer: 0
        });
    }

    update(playerRef) {
        // ... 现有代码保持不变
    }
```

**验收**：
- [ ] 同类型 debuff 不会叠加，只刷新持续时间
- [ ] 减速 debuff 首次添加时保存原始速度
- [ ] debuff 对象包含 type, duration, damagePerFrame, speedMult, particleTimer

---

### Step 3: 实现 updateDebuffs 方法（15-entities-combat.js）

**位置**：addDebuff 方法之后

**操作**：添加 updateDebuffs 方法，处理燃烧伤害、粒子生成、速度修正

```javascript
    addDebuff(type, duration, params = {}) {
        // ... 上一步的代码
    }

    // ===== 新增：更新 Debuff 状态 =====
    updateDebuffs() {
        // 过滤过期 debuff
        this.debuffs = this.debuffs.filter(d => {
            d.duration--;
            if (d.duration <= 0) return false;

            // 燃烧效果：持续伤害 + 粒子
            if (d.type === "burn") {
                this.hp -= d.damagePerFrame;
                d.particleTimer++;

                // 每 10 帧生成一个火焰粒子
                if (d.particleTimer % 10 === 0) {
                    // 使用现有的 EmberParticle 类（已存在于 15-entities-particles.js）
                    if (typeof particles !== 'undefined' && typeof EmberParticle !== 'undefined') {
                        const ember = new EmberParticle(
                            this.x + this.width / 2 + (Math.random() - 0.5) * this.width,
                            this.y + Math.random() * this.height
                        );
                        particles.push(ember);
                    }
                }
            }

            return true;
        });

        // 减速效果：应用速度修正
        const slowDebuff = this.debuffs.find(d => d.type === "slow");
        if (slowDebuff && this.originalSpeed !== null) {
            this.speed = this.originalSpeed * slowDebuff.speedMult;
        } else if (!slowDebuff && this.originalSpeed !== null) {
            // 减速结束，恢复原始速度
            this.speed = this.originalSpeed;
            this.originalSpeed = null;
        }

        // 检查燃烧致死
        if (this.hp <= 0 && !this.remove) {
            this.die();
        }
    }

    update(playerRef) {
        // ... 现有代码保持不变
    }
```

**验收**：
- [ ] 燃烧 debuff 每帧扣除 HP
- [ ] 每 10 帧生成一个 EmberParticle
- [ ] 减速 debuff 修改敌人速度
- [ ] 减速结束后恢复原始速度
- [ ] 燃烧致死时调用 die() 方法

---

### Step 4: 在 Enemy.update 中调用 updateDebuffs（15-entities-combat.js）

**位置**：Enemy.update 方法（第 151-177 行）

**操作**：在 update 方法末尾添加 updateDebuffs 调用

```javascript
    update(playerRef) {
        if (this.remove || this.y > 900) return;
        switch (this.type) {
            case "zombie":
                this.updateZombie(playerRef);
                break;
            case "spider":
                this.updateSpider(playerRef);
                break;
            case "creeper":
                this.updateCreeper(playerRef);
                break;
            case "skeleton":
                this.updateSkeleton(playerRef);
                break;
            case "enderman":
                this.updateEnderman(playerRef);
                break;
            default:
                this.updateBasic();
        }

        this.applyGravity();
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.teleportCooldown > 0) this.teleportCooldown--;
        if (this.webbed > 0) this.webbed--;

        // ===== 新增：更新 Debuff 状态 =====
        this.updateDebuffs();
    }
```

**验收**：
- [ ] 每帧调用 updateDebuffs
- [ ] Debuff 效果在敌人移动逻辑之后应用

---

### Step 5: 粒子池机制（15-entities-particles.js）

**位置**：文件末尾（第 785 行后）

**操作**：添加粒子池类和全局实例

```javascript
let bombs = [];
let webTraps = [];
let fleshBaits = [];
let torches = [];

// ===== 新增：粒子池机制 =====

/**
 * 粒子池 - 复用粒子对象以提升性能
 */
class ParticlePool {
    constructor(ParticleClass, initialSize = 20) {
        this.ParticleClass = ParticleClass;
        this.pool = [];
        this.active = [];

        // 预创建粒子对象
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(new ParticleClass(0, 0));
        }
    }

    /**
     * 获取粒子（从池中复用或新建）
     */
    get(x, y) {
        let particle;
        if (this.pool.length > 0) {
            particle = this.pool.pop();
            particle.reset(x, y);
        } else {
            particle = new this.ParticleClass(x, y);
        }
        this.active.push(particle);
        return particle;
    }

    /**
     * 回收粒子到池中
     */
    update() {
        this.active = this.active.filter(p => {
            if (p.remove || p.life <= 0) {
                p.remove = false;
                this.pool.push(p);
                return false;
            }
            return true;
        });
    }

    /**
     * 清空所有活跃粒子
     */
    clear() {
        this.pool.push(...this.active);
        this.active = [];
    }
}

// 全局粒子池实例
const particlePools = {
    ember: new ParticlePool(EmberParticle, 30),
    explosion: new ParticlePool(ExplosionParticle, 20),
    sparkle: new ParticlePool(SparkleParticle, 20),
    bubble: new ParticlePool(BubbleParticle, 15),
    dust: new ParticlePool(DustParticle, 15),
    leaf: new ParticlePool(LeafParticle, 15),
    snowflake: new ParticlePool(Snowflake, 15),
    rain: new ParticlePool(RainParticle, 20),
    end: new ParticlePool(EndParticle, 15)
};

/**
 * 获取粒子（优先从池中获取）
 * @param {string} type - 粒子类型
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @returns {Particle} 粒子实例
 */
function getPooledParticle(type, x, y) {
    const pool = particlePools[type];
    if (pool) {
        return pool.get(x, y);
    }
    // 降级：直接创建（用于未池化的粒子类型）
    console.warn(`Particle type "${type}" not pooled, creating new instance`);
    return new Particle(x, y, type);
}

/**
 * 更新所有粒子池（回收过期粒子）
 * 应在游戏主循环中调用
 */
function updateParticlePools() {
    for (const key in particlePools) {
        particlePools[key].update();
    }
}

/**
 * 清空所有粒子池
 */
function clearParticlePools() {
    for (const key in particlePools) {
        particlePools[key].clear();
    }
}
```

**验收**：
- [ ] ParticlePool 类正确实现 get/update/clear 方法
- [ ] 全局 particlePools 对象包含所有粒子类型
- [ ] getPooledParticle 函数可获取池化粒子
- [ ] updateParticlePools 函数可回收过期粒子

---

## 集成说明

### 与 task-1 的接口约定

**task-1 提供**：
- `CONSUMABLES_CONFIG` 全局配置对象（在 01-config.js 中定义）
- 配置结构示例：
  ```javascript
  {
    "gunpowder": {
      "effect": {
        "debuff": {
          "type": "burn",
          "duration": 180,
          "damagePerSecond": 0.1
        }
      }
    }
  }
  ```

**task-2 提供**：
- `Enemy.addDebuff(type, duration, params)` 方法
- `getPooledParticle(type, x, y)` 函数
- `updateParticlePools()` 函数

**集成点**（task-3 负责）：
```javascript
// 在 13-game-loop.js 的 useInventoryItem 函数中
const config = CONSUMABLES_CONFIG[itemKey];
if (config && config.effect && config.effect.debuff) {
    const debuff = config.effect.debuff;
    enemies.forEach(enemy => {
        const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        if (dist < (config.effect.radius || 150)) {
            enemy.addDebuff(
                debuff.type,
                debuff.duration,
                {
                    damagePerFrame: debuff.damagePerSecond / 60,
                    speedMult: debuff.speedMult || 1.0
                }
            );
        }
    });
}
```

---

## 验收标准

### 功能验收
- [ ] Enemy 实例可添加多个 debuff
- [ ] 同类型 debuff 不叠加，只刷新持续时间
- [ ] 燃烧 debuff 每帧扣除 HP，每 10 帧生成火焰粒子
- [ ] 减速 debuff 修改敌人速度，结束后恢复原始速度
- [ ] 粒子池正确复用粒子对象

### 性能验收
- [ ] 粒子池减少 GC 压力（通过 Chrome DevTools Memory Profiler 验证）
- [ ] 同屏 100 个粒子时帧率 ≥ 55 FPS

### 代码质量
- [ ] 无 ESLint 错误
- [ ] 无 console.error 输出
- [ ] 所有方法包含 JSDoc 注释（可选，建议在 task-3 统一补充）

---

## 测试建议

### 单元测试（手动）
```javascript
// 在浏览器控制台中测试
const enemy = new Enemy(100, 100, "zombie");

// 测试 1：添加燃烧 debuff
enemy.addDebuff("burn", 180, { damagePerFrame: 0.1 });
console.assert(enemy.debuffs.length === 1, "应添加 1 个 debuff");
console.assert(enemy.debuffs[0].type === "burn", "debuff 类型应为 burn");

// 测试 2：同类型 debuff 不叠加
enemy.addDebuff("burn", 120, { damagePerFrame: 0.1 });
console.assert(enemy.debuffs.length === 1, "同类型 debuff 不应叠加");
console.assert(enemy.debuffs[0].duration === 180, "应保留最大持续时间");

// 测试 3：减速效果
const originalSpeed = enemy.speed;
enemy.addDebuff("slow", 120, { speedMult: 0.5 });
enemy.updateDebuffs();
console.assert(enemy.speed === originalSpeed * 0.5, "速度应减半");

// 测试 4：减速恢复
enemy.debuffs = [];
enemy.updateDebuffs();
console.assert(enemy.speed === originalSpeed, "速度应恢复");
console.assert(enemy.originalSpeed === null, "originalSpeed 应重置");

// 测试 5：粒子池
const particle1 = getPooledParticle("ember", 100, 100);
const particle2 = getPooledParticle("ember", 200, 200);
console.assert(particle1 instanceof EmberParticle, "应返回 EmberParticle 实例");
console.assert(particle2 instanceof EmberParticle, "应返回 EmberParticle 实例");
```

### 集成测试（需等待 task-3 完成）
- 使用炸药攻击敌人，验证燃烧效果
- 使用雪球攻击敌人，验证减速效果
- 长时间游戏，验证无内存泄漏

---

## 风险点与缓解

| 风险 | 概率 | 影响 | 缓解方案 |
|------|------|------|----------|
| 燃烧伤害过高导致敌人秒死 | 中 | 中 | 使用配置化参数，便于调整 |
| 粒子池未正确回收导致内存泄漏 | 低 | 高 | 在 updateParticlePools 中强制回收 |
| 减速效果与现有 webbed 状态冲突 | 低 | 中 | webbed 和 debuff 独立处理，互不影响 |
| EmberParticle 未定义导致报错 | 低 | 高 | 添加类型检查：`typeof EmberParticle !== 'undefined'` |

---

## 提交规范

```bash
# 提交前检查
git diff --stat  # 确认改动量 ≤ 200 行

# 分步提交（推荐）
git add src/modules/15-entities-combat.js
git commit -m "feat(combat): add debuff system to Enemy class

- Add debuffs array and originalSpeed state
- Implement addDebuff method with anti-stacking logic
- Implement updateDebuffs method for burn/slow effects
- Integrate updateDebuffs into Enemy.update loop

Related: task-2, feat/consumable-effects"

git add src/modules/15-entities-particles.js
git commit -m "feat(particles): add particle pool mechanism

- Implement ParticlePool class for object reuse
- Create global particlePools for all particle types
- Add getPooledParticle helper function
- Add updateParticlePools for lifecycle management

Related: task-2, feat/consumable-effects"
```

---

## 完成检查清单

- [ ] Step 1: Enemy 构造函数添加 debuff 状态
- [ ] Step 2: 实现 addDebuff 方法
- [ ] Step 3: 实现 updateDebuffs 方法
- [ ] Step 4: 在 Enemy.update 中调用 updateDebuffs
- [ ] Step 5: 实现粒子池机制
- [ ] 所有验收标准通过
- [ ] 手动测试通过
- [ ] 代码已提交到 feat/consumable-effects 分支
- [ ] 改动量 ≤ 200 行（实际约 140 行）

---

## 参考资料

- Plan 文档：`docs/plan/plan-2026-03-05-inventory-item-usage.md`
- 现有 Enemy 类：`src/modules/15-entities-combat.js` (第 105-287 行)
- 现有粒子系统：`src/modules/15-entities-particles.js` (第 1-785 行)
- EmberParticle 类：`src/modules/15-entities-particles.js` (第 78-90 行)
