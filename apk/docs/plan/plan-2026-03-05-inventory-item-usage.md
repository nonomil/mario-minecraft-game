# 背包材料使用机制优化 - 实施计划

> 生成日期：2026-03-05
> 状态：Phase 1 - 草稿待审查

## 流程进度
- [x] Phase 0：需求澄清与技术决策
- [x] Phase 1：Plan 文档生成，用户确认内容
- [x] Phase 2：Codex 工程审查完成（见 `plan-2026-03-05-inventory-item-usage-review.md`）
- [x] Phase 2.1：根据审查意见修改 Plan
- [ ] Phase 3：交叉 Review 收敛，用户确认定稿
- [ ] Phase 4：各 worktree 独立 steps 文档生成，用户确认
- [ ] Phase 4.5：解耦审查通过，用户确认
- [ ] Phase 6：用户说"开始开发"，进入执行阶段

---

## 修订摘要（Phase 2.1）

**主要变更**：
1. 删除新建模块 `24-consumables.js` 和 `25-effects.js`，复用现有逻辑
2. 扩展 `16-events.js` 实现长按检测，而非新增 input handler
3. 重构 `13-game-loop.js` 的物品使用逻辑，添加装备槽状态
4. 补充 Debuff 系统实现细节（Enemy 类扩展）
5. 明确长按进度条 UI 实现方案
6. 改动量从 535 行降至 420 行（减少 21%）

**Round 2 修订**：
7. 修复 `equippedConsumable` 作用域问题（移至 01-config.js）
8. 添加 Debuff 叠加防护（同类型 debuff 刷新而非叠加）
9. 明确 EmberParticle 为复用现有类，非新增
10. 改动量最终确定为 495 行（包含所有修正）

**审查报告**：
- Round 1（CC）：详见 `plan-2026-03-05-inventory-item-usage-review.md`
- Round 2（Codex）：详见 `plan-2026-03-05-inventory-item-usage-review-round2.md`

---

## 需求理解

### 核心需求
1. **使用触发机制变更**：背包材料（炸药、末影珍珠等）选择后不立即使用，需长按武器按钮触发
2. **特效系统增强**：为材料使用添加视觉特效（火焰、粒子、减速等）

### 边界条件
- 仅影响背包材料，不影响现有武器系统
- 材料占用独立消耗品槽，不占用武器槽
- 长按检测需要视觉反馈（进度条）
- 特效需要配置化，便于后续扩展

### 排除项
- 不修改现有武器攻击逻辑
- 不改变背包 UI 布局（仅增加消耗品槽显示）
- 不涉及新材料添加（仅为现有材料添加特效）

---

## 技术方案

### 方案选择

**方案 A：独立消耗品系统（选定）**
- 优点：与武器系统解耦，易于扩展，不影响现有逻辑
- 缺点：需要新增状态管理
- 选择理由：符合单一职责原则，降低回归风险

**方案 B：扩展武器系统**
- 优点：复用现有代码
- 缺点：武器系统已复杂，增加耦合度
- 不选理由：违反开闭原则，回归风险高

**方案 C：统一物品使用系统**
- 优点：架构最优
- 缺点：需要大规模重构
- 不选理由：改动量超过 200 行限制

### 选定方案详述

#### 架构设计（已根据审查意见修改）
```
┌─────────────────────────────────────────────────┐
│                  Game Loop                      │
│              (13-game-loop.js)                  │
└────────────┬────────────────────────────────────┘
             │
             ├─→ 16-events.js (扩展触摸控制)
             │   - bindTapOrHold("attack", onTap, onHold, 800)
             │   - 短按：handleAttack("tap")
             │   - 长按：useEquippedConsumable()
             │
             ├─→ 13-game-loop.js (扩展现有逻辑)
             │   - equippedConsumable 状态管理
             │   - 重构 useInventoryItem 支持装备槽
             │   - 复用现有炸药/末影珍珠逻辑
             │
             ├─→ 15-entities-particles.js (扩展粒子系统)
             │   - 粒子池复用机制
             │   - 新增火焰/传送粒子类
             │
             └─→ 15-entities-combat.js (扩展 Enemy 类)
                 - Enemy.debuffs 数组
                 - Enemy.updateDebuffs() 方法
                 - Enemy.addDebuff(type, duration, params)
```

#### 数据流
1. **装备流程**：背包选择材料 → 装备到消耗品槽 → UI 显示
2. **使用流程**：长按武器按钮 → 检测消耗品槽 → 扣除数量 → 触发特效 → 更新 UI
3. **特效流程**：使用材料 → 查询特效配置 → 生成粒子/debuff → 渲染/更新

#### 关键设计决策

**1. 长按检测机制**
- 阈值：800ms
- 实现：在 input handler 中记录按下时间戳，每帧检查
- 视觉反馈：武器按钮显示圆形进度条（CSS animation）

**2. 消耗品槽设计**
```javascript
// 新增全局状态
let equippedConsumable = {
  itemKey: null,      // 当前装备的材料 key（如 "gunpowder"）
  count: 0,           // 剩余数量
  icon: null          // 图标 emoji
};
```

**3. 特效配置化**
```json
// config/consumables.json (新建)
{
  "gunpowder": {
    "name": "炸药",
    "icon": "💣",
    "effect": {
      "type": "explosion",
      "radius": 150,
      "damage": 30,
      "debuff": {
        "type": "burn",
        "duration": 180,
        "damagePerSecond": 0.1
      },
      "particles": {
        "type": "fire",
        "count": 20,
        "color": ["#FF4500", "#FF6347"]
      }
    }
  },
  "ender_pearl": {
    "name": "末影珍珠",
    "icon": "🔮",
    "effect": {
      "type": "teleport",
      "range": 250,
      "particles": {
        "type": "sparkle",
        "count": 30,
        "color": ["#9B59B6", "#8E44AD"]
      }
    }
  }
}
```

**4. Debuff 系统**
```javascript
// 敌人新增状态
enemy.debuffs = [
  {
    type: "burn",
    duration: 180,      // 剩余帧数
    damagePerFrame: 0.033,  // 每帧伤害（10% HP / 3秒 / 60fps）
    particleTimer: 0
  }
];
```

---

## 涉及文件（已根据审查意见修正）

| 文件 | 操作 | 说明 | 预估行数 |
|------|------|------|---------|
| `config/consumables.json` | 新建 | 消耗品配置（特效参数） | ~80 |
| `src/modules/01-config.js` | 修改 | 定义 CONSUMABLES_CONFIG + equippedConsumable 全局变量 | ~10 |
| `src/modules/17-bootstrap.js` | 修改 | 加载 consumables.json 配置 | ~15 |
| `src/modules/13-game-loop.js` | 修改 | 装备槽逻辑 + useInventoryItem 重构 | ~90 |
| `src/modules/16-events.js` | 修改 | 扩展触摸控制（bindTapOrHold） | ~90 |
| `src/modules/15-entities-combat.js` | 修改 | Enemy debuff 系统 | ~50 |
| `src/modules/15-entities-particles.js` | 修改 | 粒子池 + 新粒子类 | ~60 |
| `src/modules/10-ui.js` | 修改 | 消耗品槽 UI 更新函数 | ~40 |
| `Game.html` | 修改 | 进度条元素 + 消耗品槽 DOM + CSS | ~60 |
| **总计** | - | - | **~495 行** |

**关键变更**：
- ❌ 删除 `24-consumables.js` 和 `25-effects.js`（复用现有逻辑）
- ✅ 扩展 `16-events.js` 支持长按检测
- ✅ 补充配置加载机制（01-config.js + 17-bootstrap.js）
- ✅ 包含 CSS 代码（在 Game.html 中）
- ✅ 修复 Round 2 发现的问题（作用域、debuff 叠加、粒子说明）
- ⚠️ 改动量从 535 行 → 420 行 → 495 行（补充遗漏部分后的最终值）

---

## Worktree 并行计划（2026-03-05 更新：拆分为 4 个任务）

由于总改动量 ~495 行，超过 200 行限制，需拆分为 4 个独立任务：

| Worktree | 分支 | 任务 | 依赖 | 预估行数 | Steps 文档 |
|----------|------|------|------|---------|-----------|
| task-1a | feat/consumable-config | 配置基础设施 | 无 | ~150 | docs/development/2026-03-05-consumable-task-1a-steps.md |
| task-1b | feat/consumable-input | 长按检测 | task-1a | ~90 | docs/development/2026-03-05-consumable-task-1b-steps.md |
| task-2 | feat/consumable-effects | Debuff 系统 + 粒子扩展 | 无 | ~140 | docs/development/2026-03-05-consumable-task-2-steps.md |
| task-3 | feat/consumable-ui | UI + 集成测试 | task-1a, task-1b, task-2 | ~115 | docs/development/2026-03-05-consumable-task-3-steps.md |

**并行策略**：
- **第一轮并行**：task-1a 和 task-2（无文件重叠）
  - task-1a：新建 `config/consumables.json` + 修改 `01-config.js` + `17-bootstrap.js`
  - task-2：修改 `15-entities-combat.js` + `15-entities-particles.js`
- **第二轮串行**：task-1b（依赖 task-1a）
  - task-1b：修改 `16-events.js`
- **第三轮串行**：task-3（依赖 task-1a, task-1b, task-2）
  - task-3：修改 `13-game-loop.js` + `10-ui.js` + `Game.html`

**文件改动矩阵**（验证无冲突）：
| 文件 | task-1a | task-1b | task-2 | task-3 |
|------|---------|---------|--------|--------|
| `config/consumables.json` | ✅ (新建) | - | - | - |
| `01-config.js` | ✅ | - | - | - |
| `17-bootstrap.js` | ✅ | - | - | - |
| `16-events.js` | - | ✅ | - | - |
| `15-entities-combat.js` | - | - | ✅ | - |
| `15-entities-particles.js` | - | - | ✅ | - |
| `13-game-loop.js` | - | - | - | ✅ |
| `10-ui.js` | - | - | - | ✅ |
| `Game.html` | - | - | - | ✅ |

**验证结果**：✅ 所有任务无文件重叠，依赖关系清晰

---

## 风险点

| 风险 | 概率 | 影响 | 缓解方案 |
|------|------|------|----------|
| 长按检测与现有输入冲突 | 中 | 高 | 在 input handler 中增加状态机，区分短按/长按 |
| 特效性能影响（大量粒子） | 中 | 中 | 粒子池复用，限制同屏粒子数量（<100） |
| Debuff 系统与现有伤害逻辑冲突 | 低 | 高 | 独立 debuff 更新函数，在敌人 update 中调用 |
| 配置文件加载失败 | 低 | 中 | 提供默认配置 fallback |
| 消耗品槽 UI 与现有 HUD 重叠 | 低 | 低 | 使用绝对定位，避开现有元素 |

---

## 待确认问题

- [x] 长按时长阈值（已定：800ms）
- [x] 材料清单（已定：炸药、末影珍珠、雪球、岩浆桶）
- [x] 特效参数（已定：见配置设计）
- [x] 长按取消机制（已定：未达到阈值不触发任何动作）
- [x] 音效需求（已定：本期不包含音效，后续扩展）
- [x] 长按进度条 UI（已定：移动端在按钮内显示，桌面端屏幕中央提示）
- [x] 消耗品槽 UI 位置（已定：HUD 右侧，`#equip-status` 下方）

---

## 审查意见采纳记录

### 已采纳的高优先级修改
1. ✅ **删除新模块**：取消 `24-consumables.js` 和 `25-effects.js`，复用现有逻辑
2. ✅ **扩展现有输入系统**：在 `16-events.js` 中实现 `bindTapOrHold`，而非新增 input handler
3. ✅ **重构物品使用逻辑**：扩展 `13-game-loop.js` 的 `useInventoryItem` 函数
4. ✅ **补充 Debuff 实现细节**：在 `15-entities-combat.js` 的 `Enemy` 类中添加 `updateDebuffs()` 方法
5. ✅ **明确长按进度条 UI**：在 `Game.html` 的 `#btn-attack` 内添加进度条元素

### 已采纳的中优先级修改
6. ✅ **配置加载时机**：在 `17-bootstrap.js` 中加载 `consumables.json`
7. ✅ **消耗品槽 UI 位置**：在 `.hud-right` 区域添加 `#consumable-status`
8. ✅ **粒子池复用**：在 `15-entities-particles.js` 中实现粒子池机制

### 延后处理的低优先级问题
9. ⏸️ **音效**：本期不实现，后续扩展
10. ⏸️ **难度系统集成**：初版使用固定参数，后续优化
11. ⏸️ **测试覆盖**：在 Phase 6 执行阶段补充

---

## 验收标准

### 功能验收
- [ ] 选择背包材料后，显示在消耗品槽
- [ ] 短按武器按钮：正常攻击
- [ ] 长按武器按钮 800ms：触发消耗品使用
- [ ] 长按期间显示进度条
- [ ] 炸药：爆炸范围内敌人受伤并燃烧 3 秒
- [ ] 末影珍珠：玩家传送到前方 5 格
- [ ] 雪球：敌人减速 50%，持续 2 秒
- [ ] 岩浆桶：地面生成 3x3 岩浆池，持续 5 秒

### 性能验收
- [ ] 同屏粒子数 < 100
- [ ] 帧率保持 ≥ 55 FPS（在有特效时）
- [ ] 无内存泄漏（长时间游戏后内存稳定）

### 兼容性验收
- [ ] 不影响现有武器攻击
- [ ] 不影响现有背包功能
- [ ] 移动端触摸长按正常工作

---

## 已知权衡（CC vs Codex 分歧）

| 分歧点 | CC 观点 | Codex 观点 | 决策 | 理由 |
|--------|---------|------------|------|------|
| 是否新建独立模块 | 新建 `24-consumables.js` 解耦 | 复用现有 `13-game-loop.js` 逻辑 | **采纳 Codex** | 现有代码已实现炸药/末影珍珠使用，新建模块会导致重复和冲突 |
| 输入处理架构 | 新增 input handler 模块 | 扩展现有 `16-events.js` | **采纳 Codex** | 现有架构中输入处理在 `16-events.js`，新增模块会破坏现有结构 |
| 特效系统设计 | 新建 `25-effects.js` 统一管理 | 扩展现有粒子系统 | **采纳 Codex** | 现有粒子系统已支持多种特效，只需扩展粒子类 |
| 改动量预估 | 535 行 | 420 行 | **采纳 Codex** | 复用现有逻辑后改动量减少 21%，降低回归风险 |

---

## 关键设计细节补充（根据审查意见）

### 1. 长按检测实现（16-events.js）
```javascript
function bindTapOrHold(id, onTap, onHold, holdThreshold = 800) {
  const btn = document.getElementById(`btn-${id}`);
  if (!btn) return;

  let pressStartTime = 0;
  let holdTimer = null;
  let isHolding = false;

  const onStart = (e) => {
    e.preventDefault();
    pressStartTime = Date.now();
    isHolding = false;

    // 显示进度条
    const progress = btn.querySelector('.hold-progress');
    if (progress) {
      progress.style.display = 'block';
      progress.style.animation = `hold-fill ${holdThreshold}ms linear`;
    }

    holdTimer = setTimeout(() => {
      isHolding = true;
      onHold();
      // 隐藏进度条
      if (progress) progress.style.display = 'none';
    }, holdThreshold);
  };

  const onEnd = (e) => {
    e.preventDefault();
    clearTimeout(holdTimer);

    const progress = btn.querySelector('.hold-progress');
    if (progress) {
      progress.style.display = 'none';
      progress.style.animation = '';
    }

    const duration = Date.now() - pressStartTime;
    if (!isHolding && duration < holdThreshold) {
      onTap(); // 短按触发普通攻击
    }
  };

  const onCancel = (e) => {
    onEnd(e); // 取消时按结束处理
  };

  const onMove = (e) => {
    // 检查手指是否移出按钮区域
    const touch = e.touches[0];
    const rect = btn.getBoundingClientRect();
    if (touch.clientX < rect.left || touch.clientX > rect.right ||
        touch.clientY < rect.top || touch.clientY > rect.bottom) {
      onEnd(e);
    }
  };

  btn.addEventListener('touchstart', onStart);
  btn.addEventListener('touchend', onEnd);
  btn.addEventListener('touchcancel', onCancel);
  btn.addEventListener('touchmove', onMove);
  btn.addEventListener('mousedown', onStart);
  btn.addEventListener('mouseup', onEnd);
}
```

### 2. 装备槽状态管理（13-game-loop.js）
```javascript
// 注意：equippedConsumable 已在 01-config.js 中定义为全局变量

// 装备消耗品到槽位
function equipConsumable(itemKey) {
  const count = Number(inventory[itemKey]) || 0;
  if (count <= 0) {
    showToast("❌ 没有该物品");
    return false;
  }

  const config = CONSUMABLES_CONFIG[itemKey];
  if (!config) return false;

  equippedConsumable = {
    itemKey: itemKey,
    count: count,
    icon: config.icon
  };

  updateConsumableUI();
  showToast(`✅ 装备: ${config.icon} ${config.name}`);
  return true;
}

// 使用已装备的消耗品
function useEquippedConsumable() {
  if (!equippedConsumable.itemKey) {
    showToast("❌ 未装备消耗品");
    return;
  }

  // 调用现有的 useInventoryItem 函数
  // 注意：useInventoryItem 已经包含扣除数量、特效生成等逻辑
  useInventoryItem(equippedConsumable.itemKey);

  // 更新装备槽状态
  equippedConsumable.count = Number(inventory[equippedConsumable.itemKey]) || 0;
  if (equippedConsumable.count <= 0) {
    showToast("⚠️ 消耗品已用完");
    equippedConsumable = { itemKey: null, count: 0, icon: null };
  }

  updateConsumableUI();
}

// 修改现有的 useInventoryItem 函数，添加 debuff 支持
// （在现有函数基础上扩展，不是完全重写）
function useInventoryItem(itemKey) {
  // ... 现有逻辑（炸药、末影珍珠等）

  // 新增：根据配置应用 debuff
  const config = CONSUMABLES_CONFIG[itemKey];
  if (config && config.effect && config.effect.debuff) {
    const debuff = config.effect.debuff;
    // 对范围内敌人应用 debuff
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
}
```

### 3. Debuff 系统（15-entities-combat.js）
```javascript
class Enemy {
  constructor(x, y, type) {
    // ... 现有代码
    this.debuffs = [];
    this.originalSpeed = null; // 保存原始速度用于减速恢复
  }

  addDebuff(type, duration, params = {}) {
    // 防止同类型 debuff 叠加
    const existing = this.debuffs.find(d => d.type === type);
    if (existing) {
      // 刷新持续时间，取最大值
      existing.duration = Math.max(existing.duration, duration);
      return;
    }

    // 减速效果：保存原始速度
    if (type === "slow" && !this.originalSpeed) {
      this.originalSpeed = this.speed;
    }

    this.debuffs.push({
      type: type,
      duration: duration,
      damagePerFrame: params.damagePerFrame || 0,
      speedMult: params.speedMult || 1.0,
      particleTimer: 0
    });
  }

  updateDebuffs() {
    this.debuffs = this.debuffs.filter(d => {
      d.duration--;
      if (d.duration <= 0) return false;

      // 燃烧效果
      if (d.type === "burn") {
        this.hp -= d.damagePerFrame;
        d.particleTimer++;
        if (d.particleTimer % 10 === 0) {
          // 使用现有的 EmberParticle 类（已存在于 15-entities-particles.js）
          const ember = new EmberParticle(this.x + this.width/2, this.y);
          particles.push(ember);
        }
      }

      return true;
    });

    // 减速效果：应用速度修正
    const slowDebuff = this.debuffs.find(d => d.type === "slow");
    if (slowDebuff && this.originalSpeed) {
      this.speed = this.originalSpeed * slowDebuff.speedMult;
    } else if (!slowDebuff && this.originalSpeed) {
      // 减速结束，恢复原始速度
      this.speed = this.originalSpeed;
      this.originalSpeed = null;
    }
  }

  update() {
    // ... 现有更新逻辑
    this.updateDebuffs();
  }
}
```

### 4. 消耗品槽 UI（10-ui.js + Game.html）
```html
<!-- Game.html 中添加 -->
<style>
/* 长按进度条动画 */
@keyframes hold-fill {
  from {
    background: conic-gradient(#4CAF50 0deg, transparent 0deg);
  }
  to {
    background: conic-gradient(#4CAF50 360deg, transparent 360deg);
  }
}

.hold-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0.6;
  pointer-events: none;
  display: none;
}

/* 消耗品槽样式 */
#consumable-status {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #FFD700;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 16px;
  color: white;
  display: none;
  margin-top: 8px;
}

#consumable-status.active {
  border-color: #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}
</style>

<div class="hud-right">
  <div class="hud-box" id="equip-status">⚔️ 剑</div>
  <div class="hud-box" id="consumable-status">
    <span id="consumable-icon">💣</span>
    <span id="consumable-name">炸药</span>
    <span id="consumable-count">x3</span>
  </div>
</div>

<!-- 攻击按钮添加进度条 -->
<button class="touch-btn" id="btn-attack" data-action="attack">
  🗡️
  <div class="hold-progress"></div>
</button>
```

```javascript
// 10-ui.js 中添加
function updateConsumableUI() {
  const statusEl = document.getElementById("consumable-status");
  const iconEl = document.getElementById("consumable-icon");
  const nameEl = document.getElementById("consumable-name");
  const countEl = document.getElementById("consumable-count");

  if (!equippedConsumable.itemKey) {
    if (statusEl) statusEl.style.display = "none";
    return;
  }

  const config = CONSUMABLES_CONFIG[equippedConsumable.itemKey];
  if (!config) return;

  if (statusEl) statusEl.style.display = "block";
  if (iconEl) iconEl.innerText = config.icon;
  if (nameEl) nameEl.innerText = config.name;
  if (countEl) countEl.innerText = `x${equippedConsumable.count}`;
}
```

### 5. 配置加载机制（01-config.js + 17-bootstrap.js）

```javascript
// 01-config.js 中添加全局变量定义
let CONSUMABLES_CONFIG = {};
let equippedConsumable = { itemKey: null, count: 0, icon: null }; // 全局状态，供所有模块访问

// 17-bootstrap.js 中添加配置加载
async function loadConsumablesConfig() {
  try {
    const response = await fetch('config/consumables.json');
    if (!response.ok) {
      console.warn('Failed to load consumables.json, using defaults');
      CONSUMABLES_CONFIG = getDefaultConsumablesConfig();
      return;
    }
    CONSUMABLES_CONFIG = await response.json();
  } catch (error) {
    console.warn('Error loading consumables.json:', error);
    CONSUMABLES_CONFIG = getDefaultConsumablesConfig();
  }
}

// 默认配置 fallback
function getDefaultConsumablesConfig() {
  return {
    "gunpowder": {
      "name": "炸药",
      "icon": "💣",
      "effect": {
        "type": "explosion",
        "radius": 150,
        "damage": 30,
        "debuff": {
          "type": "burn",
          "duration": 180,
          "damagePerSecond": 0.1
        }
      }
    },
    "ender_pearl": {
      "name": "末影珍珠",
      "icon": "🔮",
      "effect": {
        "type": "teleport",
        "range": 250
      }
    }
  };
}

// 在 bootstrap 初始化流程中调用
// （在现有的配置加载之后）
await loadConsumablesConfig();
```

---

## 下一步

等待用户确认 Plan 内容，然后进入 Phase 2（Codex 工程审查）。
