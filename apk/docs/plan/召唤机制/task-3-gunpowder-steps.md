# Task 3: 火药效果增强 - 开发步骤

> Worktree: task-3-gunpowder
> 分支: feat/gunpowder-enhancement
> 预估: ~50行，1-2小时
> 依赖: 无（可与 Task 1 并行）

## 目标

增强火药效果，保留原有爆炸伤害，新增前方200px地面火焰区域。

## 涉及文件

- `src/modules/04-weapons.js`（+50行）

## Step-by-Step 实施步骤

### Step 1: 添加全局火焰区域数组（~5行）

**位置**: `04-weapons.js` 顶部或 `13-game-loop.js` 全局变量区域

**实现内容**:
```javascript
// 火焰区域系统
let fireZones = [];
```

**验收**:
- [ ] 变量声明无语法错误
- [ ] 初始值为空数组

---

### Step 2: 实现地面火焰生成函数（~25行）

**位置**: `04-weapons.js` 中，现有武器函数之后

**实现内容**:
```javascript
function createGroundFire(centerX, centerY, forwardRange, width, duration) {
  const dir = player.facingRight ? 1 : -1;
  const startX = centerX;
  const endX = centerX + dir * forwardRange;
  const fireCount = Math.floor(forwardRange / 20); // 每20px一个火焰

  for (let i = 0; i <= fireCount; i++) {
    const x = startX + (endX - startX) * (i / fireCount);
    const y = groundY - 10; // 地面位置

    // 创建火焰区域
    const fireZone = {
      x: x,
      y: y,
      width: 20,
      height: 20,
      duration: duration,
      damagePerFrame: 0.1,
      type: "fire",
      particleTimer: 0
    };

    fireZones.push(fireZone);

    // 生成初始火焰粒子
    if (typeof particles !== 'undefined' && typeof EmberParticle !== 'undefined') {
      for (let j = 0; j < 3; j++) {
        particles.push(new EmberParticle(x + Math.random() * 20, y));
      }
    }
  }
}
```

**验收**:
- [ ] 火焰区域正确生成在地面
- [ ] 火焰数量根据范围计算
- [ ] 初始粒子正确生成

---

### Step 3: 实现火焰区域更新函数（~20行）

**位置**: `04-weapons.js` 中，createGroundFire 之后

**实现内容**:
```javascript
function updateFireZones() {
  if (!fireZones || fireZones.length === 0) return;

  for (const zone of fireZones) {
    zone.duration--;

    // 对范围内敌人造成伤害
    if (typeof enemies !== 'undefined') {
      for (const enemy of enemies) {
        if (enemy.remove) continue;
        if (rectIntersect(enemy.x, enemy.y, enemy.width, enemy.height, zone.x, zone.y, zone.width, zone.height)) {
          // 使用现有 debuff 系统
          if (typeof enemy.addDebuff === 'function') {
            enemy.addDebuff("burn", 60, { damagePerFrame: zone.damagePerFrame });
          } else {
            // 降级方案：直接伤害
            enemy.hp -= zone.damagePerFrame;
          }
        }
      }
    }

    // 生成持续粒子
    zone.particleTimer++;
    if (zone.particleTimer % 10 === 0 && typeof particles !== 'undefined' && typeof EmberParticle !== 'undefined') {
      particles.push(new EmberParticle(zone.x + Math.random() * zone.width, zone.y));
    }
  }

  // 清理过期火焰
  fireZones = fireZones.filter(z => z.duration > 0);
}
```

**验收**:
- [ ] 火焰区域正确对敌人造成伤害
- [ ] 持续生成火焰粒子
- [ ] 过期火焰正确清理

---

### Step 4: 修改火药使用逻辑（~10行）

**位置**: `04-weapons.js` 或 `13-game-loop.js` 中，火药使用函数

**修改内容**:
```javascript
// 查找现有的火药使用逻辑，通常类似：
function useGunpowder() {
  // 保留原有爆炸伤害逻辑
  // dealExplosionDamage(...) 或类似代码

  // 新增：生成地面火焰
  createGroundFire(
    player.x,
    player.y,
    200,  // 前方范围
    100,  // 宽度（暂未使用，预留）
    180   // 持续帧数（3秒）
  );

  showToast("💣 火药爆炸 + 地面火焰");
}
```

**验收**:
- [ ] 原有爆炸伤害保留
- [ ] 新增地面火焰效果
- [ ] 提示信息正确显示

---

### Step 5: 在主循环中调用火焰更新（~5行）

**位置**: `13-game-loop.js` 的 `update()` 函数中，粒子更新之后

**实现内容**:
```javascript
// 更新火焰区域
if (typeof updateFireZones === 'function') {
  updateFireZones();
}
```

**验收**:
- [ ] 火焰区域每帧正确更新
- [ ] 不影响其他系统更新

---

## 测试检查清单

### 单元测试
- [ ] createGroundFire 正确生成火焰区域
- [ ] updateFireZones 正确更新火焰状态
- [ ] 火焰区域正确清理过期项
- [ ] 粒子生成频率正确（每10帧）

### 集成测试
- [ ] 使用火药后前方地面起火
- [ ] 火焰持续3秒（180帧）
- [ ] 敌人进入火焰区域受到持续伤害
- [ ] 火焰粒子正确显示
- [ ] 保留原有爆炸伤害

### 性能测试
- [ ] 同时存在多个火焰区域不影响帧率
- [ ] 粒子数量控制在合理范围（建议监控 particles.length）
- [ ] 火焰区域数量限制（可选：最多50个）

### 兼容性测试
- [ ] 不影响其他消耗品使用
- [ ] 不影响敌人AI
- [ ] 不影响玩家移动

---

## 性能优化建议

### 可选优化1：限制火焰区域数量

**位置**: createGroundFire 函数开头

```javascript
function createGroundFire(centerX, centerY, forwardRange, width, duration) {
  // 限制最大火焰区域数量
  if (fireZones.length >= 50) {
    // 移除最旧的火焰
    fireZones.shift();
  }

  // 原有逻辑...
}
```

### 可选优化2：使用对象池

**位置**: 全局变量区域

```javascript
// 火焰区域对象池
const fireZonePool = [];

function getFireZone() {
  return fireZonePool.pop() || {};
}

function recycleFireZone(zone) {
  fireZonePool.push(zone);
}
```

---

## 注意事项

1. **全局变量依赖**: 确保 `player`, `groundY`, `enemies`, `particles`, `EmberParticle` 在作用域内
2. **类型检查**: 使用 `typeof` 检查全局变量和函数是否存在
3. **降级方案**: 如果 `addDebuff` 不存在，使用直接伤害
4. **性能监控**: 注意 `fireZones.length` 和 `particles.length`，避免过多对象

---

## 完成标准

- [ ] 所有代码通过语法检查：`node -c src/modules/04-weapons.js`
- [ ] 所有测试检查清单项通过
- [ ] 代码风格与现有代码一致
- [ ] 无 console 警告或错误
- [ ] 性能测试通过（帧率稳定）
- [ ] 提交信息：`feat(weapons): enhance gunpowder with ground fire effect`

---

## 可选扩展

如果时间允许，可以考虑以下增强：

1. **视觉效果**：火焰区域添加半透明红色覆盖层
2. **音效**：火焰燃烧音效
3. **交互**：玩家进入火焰区域也受到伤害（可选）
4. **配置化**：将火焰参数移到 `config/consumables.json`
