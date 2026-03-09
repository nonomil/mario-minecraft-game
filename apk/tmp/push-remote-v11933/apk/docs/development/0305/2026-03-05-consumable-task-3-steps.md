# Task-3: 消耗品 UI + 集成测试 - 实施步骤

> 生成日期：2026-03-05（2026-03-05 更新）
> Worktree: task-3
> 分支: feat/consumable-ui
> 预估改动: ~115 行
> 依赖: task-1a (配置基础设施), task-1b (长按检测), task-2 (Debuff+粒子)

---

## 任务概述

### 目标
实现消耗品系统的 UI 显示和集成逻辑，确保与 task-1a（配置）、task-1b（长按检测）和 task-2（Debuff+粒子）协同工作。

### 依赖关系
- **依赖 task-1a**：需要 `CONSUMABLES_CONFIG` 和 `equippedConsumable` 全局变量
- **依赖 task-1b**：需要长按检测机制（`bindTapOrHold`）
- **依赖 task-2**：需要 `Enemy.addDebuff()` 和粒子系统扩展
- **执行顺序**：必须在 task-1a, task-1b, task-2 全部合并后执行

### 核心功能
1. 实现装备槽逻辑（`equipConsumable()` 和 `useEquippedConsumable()`）
2. 扩展 `useInventoryItem` 支持 debuff（`13-game-loop.js`）
3. 实现消耗品槽 UI 更新函数（`10-ui.js`）
4. 添加 UI 元素和样式（`Game.html`）
5. 集成测试确认所有 task 协同工作

### 改动量
- 预估：~115 行
- 分布：
  - `13-game-loop.js`：~15 行（扩展 useInventoryItem）
  - `10-ui.js`：~40 行（UI 更新函数）
  - `Game.html`：~60 行（CSS + DOM）

---

## 涉及文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/modules/13-game-loop.js` | 修改 | 装备槽逻辑 + 扩展 useInventoryItem 支持 debuff |
| `src/modules/10-ui.js` | 修改 | 消耗品槽 UI 更新函数 |
| `Game.html` | 修改 | 进度条元素 + 消耗品槽 DOM + CSS |

---

## 前置依赖验证

### 来自 task-1a 的接口
- `CONSUMABLES_CONFIG` 全局变量（在 01-config.js 中定义）
- `equippedConsumable` 全局变量（在 01-config.js 中定义）
- `config/consumables.json` 配置文件

### 来自 task-1b 的接口
- `bindTapOrHold` 函数（在 16-events.js 中定义）
- 长按检测机制（800ms 阈值）

### 来自 task-2 的接口
- `Enemy.addDebuff(type, duration, params)` 方法
- `Enemy.updateDebuffs()` 方法
- 粒子系统扩展（EmberParticle 等）

### 验证依赖
在开始开发前，确认以下变量和函数已定义：
```javascript
// 在浏览器控制台输入
console.log(typeof CONSUMABLES_CONFIG);  // 应该输出 "object"
console.log(typeof equippedConsumable);  // 应该输出 "object"
console.log(Object.keys(CONSUMABLES_CONFIG).length);  // 应该输出 4

// 检查 Enemy 类是否有 addDebuff 方法
const testEnemy = enemies[0];
console.log(typeof testEnemy?.addDebuff);  // 应该输出 "function"
```

---

## 实施步骤

### Step 1: 实现装备槽逻辑

**文件**: `src/modules/13-game-loop.js`

**说明**: 添加 `equipConsumable()` 和 `useEquippedConsumable()` 函数，管理消耗品装备和使用。

**插入位置**: 在 `useInventoryItem` 函数之前（约第 1000 行）

**完整代码**:
```javascript
// ============================================
// 消耗品装备槽逻辑（新增）
// ============================================

/**
 * 装备消耗品到槽位
 * @param {string} itemKey - 材料 key（如 "gunpowder"）
 * @returns {boolean} 是否装备成功
 */
function equipConsumable(itemKey) {
  const count = Number(inventory[itemKey]) || 0;
  if (count <= 0) {
    showToast("❌ 没有该物品");
    return false;
  }

  const config = CONSUMABLES_CONFIG[itemKey];
  if (!config) {
    console.warn('[Consumable] Unknown item:', itemKey);
    return false;
  }

  equippedConsumable = {
    itemKey: itemKey,
    count: count,
    icon: config.icon
  };

  updateConsumableUI();
  showToast(`✅ 装备: ${config.icon} ${config.name}`);
  return true;
}

/**
 * 使用已装备的消耗品
 */
function useEquippedConsumable() {
  if (!equippedConsumable.itemKey) {
    showToast("❌ 未装备消耗品");
    return;
  }

  // 调用现有的 useInventoryItem 函数
  useInventoryItem(equippedConsumable.itemKey);

  // 更新装备槽状态
  equippedConsumable.count = Number(inventory[equippedConsumable.itemKey]) || 0;
  if (equippedConsumable.count <= 0) {
    showToast("⚠️ 消耗品已用完");
    equippedConsumable = { itemKey: null, count: 0, icon: null };
  }

  updateConsumableUI();
}
```

**验证**:
- [ ] `equipConsumable` 函数正确装备消耗品
- [ ] `useEquippedConsumable` 函数正确使用消耗品
- [ ] 消耗品用完后自动卸载

---

### Step 2: 扩展物品使用逻辑支持 Debuff

**文件**: `src/modules/13-game-loop.js`

**说明**: 扩展现有的 `useInventoryItem` 函数，根据配置对范围内敌人应用 debuff。

**修改位置**: 在 `useInventoryItem` 函数末尾添加 debuff 应用逻辑。

**完整代码**:
```javascript
// 在 useInventoryItem 函数末尾添加以下代码
// （保留现有的炸药、末影珍珠等逻辑，只在末尾追加）

function useInventoryItem(itemKey) {
  // ... 现有逻辑（炸药爆炸、末影珍珠传送等）...

  // ============================================
  // 新增：根据配置应用 Debuff
  // ============================================
  const config = CONSUMABLES_CONFIG[itemKey];
  if (config && config.effect && config.effect.debuff) {
    const debuff = config.effect.debuff;
    const effectRadius = config.effect.radius || 150;

    // 对范围内敌人应用 debuff
    enemies.forEach(enemy => {
      const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (dist < effectRadius) {
        enemy.addDebuff(
          debuff.type,
          debuff.duration,
          {
            damagePerFrame: debuff.damagePerSecond ? debuff.damagePerSecond / 60 : 0,
            speedMult: debuff.speedMult || 1.0
          }
        );
      }
    });
  }
}
```

**验证**:
- [ ] 炸药使用后，范围内敌人受到燃烧 debuff
- [ ] 雪球使用后，范围内敌人受到减速 debuff
- [ ] Debuff 参数从配置文件正确读取

---

### Step 3: 实现消耗品槽 UI 更新函数

**文件**: `src/modules/10-ui.js`

**说明**: 添加 `updateConsumableUI` 函数，根据 `equippedConsumable` 状态更新 UI 显示。

**修改位置**: 在文件末尾添加新函数。

**完整代码**:
```javascript
// ============================================
// 消耗品槽 UI 更新（新增）
// ============================================

/**
 * 更新消耗品槽 UI 显示
 */
function updateConsumableUI() {
  const statusEl = document.getElementById("consumable-status");
  const iconEl = document.getElementById("consumable-icon");
  const nameEl = document.getElementById("consumable-name");
  const countEl = document.getElementById("consumable-count");

  // 未装备消耗品时隐藏
  if (!equippedConsumable.itemKey) {
    if (statusEl) {
      statusEl.style.display = "none";
      statusEl.classList.remove("active");
    }
    return;
  }

  // 获取配置
  const config = CONSUMABLES_CONFIG[equippedConsumable.itemKey];
  if (!config) {
    console.warn('[UI] Unknown consumable:', equippedConsumable.itemKey);
    return;
  }

  // 更新 UI 元素
  if (statusEl) {
    statusEl.style.display = "block";
    statusEl.classList.add("active");
  }
  if (iconEl) iconEl.innerText = config.icon;
  if (nameEl) nameEl.innerText = config.name;
  if (countEl) countEl.innerText = `x${equippedConsumable.count}`;
}
```

**验证**:
- [ ] 未装备消耗品时，消耗品槽隐藏
- [ ] 装备消耗品后，消耗品槽显示正确的图标、名称和数量
- [ ] 使用消耗品后，数量实时更新

---

### Step 4: 添加 UI 元素和样式

**文件**: `Game.html`

**说明**: 添加消耗品槽 DOM 元素、长按进度条元素和相关 CSS 样式。

#### 4.1 添加 CSS 样式

**修改位置**: 在 `<style>` 标签内添加 CSS（找到现有的 `.hud-box` 样式附近）

**完整代码（CSS 部分）**:
```css
/* ============================================
   消耗品系统样式（新增）
   ============================================ */

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
  z-index: 1;
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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  white-space: nowrap;
}

#consumable-status.active {
  border-color: #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.8);
  }
}

#consumable-icon {
  font-size: 20px;
  margin-right: 6px;
}

#consumable-name {
  margin-right: 8px;
}

#consumable-count {
  color: #FFD700;
  font-weight: bold;
}
```

#### 4.2 添加消耗品槽 DOM 元素

**修改位置**: 在 HUD 右侧区域添加消耗品槽元素（找到 `.hud-right` 或 `#equip-status`）

**完整代码（DOM 部分）**:
```html
<!-- 在 .hud-right 区域内，#equip-status 下方添加 -->
<div class="hud-right">
  <div class="hud-box" id="equip-status">⚔️ 剑</div>

  <!-- 消耗品槽（新增） -->
  <div class="hud-box" id="consumable-status">
    <span id="consumable-icon">💣</span>
    <span id="consumable-name">炸药</span>
    <span id="consumable-count">x3</span>
  </div>
</div>
```

#### 4.3 添加进度条元素

**修改位置**: 在攻击按钮内添加进度条元素（找到 `#btn-attack`）

**完整代码（进度条部分）**:
```html
<!-- 修改现有的攻击按钮，添加进度条子元素 -->
<button class="touch-btn" id="btn-attack" data-action="attack">
  🗡️
  <div class="hold-progress"></div>
</button>
```

**验证**:
- [ ] CSS 样式正确添加
- [ ] 消耗品槽 DOM 元素正确添加
- [ ] 进度条元素正确添加到攻击按钮内

---

## 验收标准

### 功能验收
- [ ] 选择背包材料后，调用 `equipConsumable()` 成功装备
- [ ] 短按攻击按钮：正常攻击（task-1b 功能）
- [ ] 长按攻击按钮 800ms：触发 `useEquippedConsumable()`
- [ ] 使用炸药：敌人受到燃烧 debuff（task-2 功能）
- [ ] 使用雪球：敌人受到减速 debuff（task-2 功能）
- [ ] 使用后消耗品数量减少，UI 同步更新
- [ ] 消耗品用完后自动卸载，UI 隐藏
- [ ] 长按进度条动画正常显示

### 集成验收
- [ ] 配置加载成功（task-1a）
- [ ] 长按检测正常工作（task-1b）
- [ ] Debuff 系统正常工作（task-2）
- [ ] UI 显示正确
- [ ] 所有功能协同工作，无冲突

### 性能验收
- [ ] UI 更新不影响帧率（保持 ≥ 55 FPS）
- [ ] 无内存泄漏（长时间游戏后内存稳定）

### 兼容性验收
- [ ] 不影响现有武器攻击逻辑
- [ ] 不影响现有背包功能
- [ ] 移动端触摸长按正常工作
- [ ] 桌面端鼠标长按正常工作

---

## 测试步骤

### 1. 前置依赖测试
```javascript
// 在浏览器控制台输入：
console.log(CONSUMABLES_CONFIG);  // 应该显示 4 个消耗品配置
console.log(equippedConsumable);  // 应该显示 { itemKey: null, count: 0, icon: null }
console.log(typeof enemies[0]?.addDebuff);  // 应该输出 "function"
```

### 2. 装备槽测试
```javascript
// 在控制台手动装备消耗品
equipConsumable('gunpowder');
// 检查消耗品槽是否显示 "💣 炸药 x[数量]"

// 手动卸载
equippedConsumable = { itemKey: null, count: 0, icon: null };
updateConsumableUI();
// 检查消耗品槽是否隐藏
```

### 3. 集成测试
```
1. 打开背包，选择炸药
2. 检查消耗品槽显示 "💣 炸药 x[数量]"
3. 短按攻击按钮 → 应该正常攻击（挥剑）
4. 长按攻击按钮 800ms → 应该使用炸药
5. 检查：
   - 炸药数量减 1
   - 范围内敌人受到伤害
   - 敌人身上出现火焰粒子（燃烧效果）
   - 敌人 HP 持续下降 3 秒
6. 重复测试雪球（减速效果）
```

### 4. Debuff 叠加测试
```
1. 对同一敌人连续使用 2 次炸药
2. 检查敌人只有 1 个燃烧 debuff（不叠加）
3. 第二次使用应刷新持续时间
4. 在控制台查看：
   console.log(enemies[0].debuffs);
   // 应该只有 1 个 burn debuff
```

---

## 提交规范

```bash
# 提交前检查
git diff --stat  # 确认改动量 ≤ 200 行

# 提交
git add src/modules/13-game-loop.js
git add src/modules/10-ui.js
git add Game.html
git commit -m "$(cat <<'EOF'
feat(ui): 实现消耗品 UI 和集成逻辑

- 在 13-game-loop.js 中添加 equipConsumable 和 useEquippedConsumable 函数
- 扩展 useInventoryItem 支持 debuff 应用
- 在 10-ui.js 中添加 updateConsumableUI 函数
- 在 Game.html 中添加消耗品槽 DOM 和 CSS 样式
- 添加长按进度条动画

改动量: ~115 行
相关任务: task-3, feat/consumable-ui
依赖: task-1a, task-1b, task-2
EOF
)"
```

---

## 注意事项

### 1. 依赖顺序
- **必须先合并 task-1a, task-1b, task-2**，再开始 task-3 开发
- task-3 依赖的函数：
  - `CONSUMABLES_CONFIG` (task-1a)
  - `equippedConsumable` (task-1a)
  - `bindTapOrHold` (task-1b)
  - `Enemy.addDebuff()` (task-2)
  - `EmberParticle` 类 (task-2)

### 2. 全局变量作用域
- `equippedConsumable` 在 `01-config.js` 中定义，所有模块可访问
- `CONSUMABLES_CONFIG` 在 `17-bootstrap.js` 中加载，游戏启动后可用
- 不要在其他模块中重复定义这些变量

### 3. UI 元素定位
- 消耗品槽在 `.hud-right` 区域，`#equip-status` 下方
- 使用 `margin-top: 8px` 与装备槽保持间距
- 进度条在 `#btn-attack` 内部，使用绝对定位覆盖按钮

### 4. CSS 动画性能
- 使用 `conic-gradient` 实现圆形进度条
- 使用 CSS animation 而非 JavaScript 动画（性能更好）
- 进度条隐藏时设置 `display: none` 避免不必要的渲染

---

## 回滚方案

如果集成测试失败，按以下顺序回滚：

1. **检查依赖**：确认 task-1a, task-1b, task-2 已正确合并
2. **检查全局变量**：确认 `equippedConsumable` 和 `CONSUMABLES_CONFIG` 可访问
3. **逐步测试**：
   - 先测试装备槽逻辑
   - 再测试 UI 显示
   - 最后测试集成功能
4. **完全回滚**：如果无法修复，执行 `git reset --hard HEAD~1`

---

## 完成标志

- [ ] 所有文件修改完成
- [ ] 装备槽逻辑测试通过
- [ ] UI 显示测试通过
- [ ] 长按进度条测试通过
- [ ] 集成测试通过（与 task-1a, task-1b, task-2 协同）
- [ ] Debuff 应用测试通过
- [ ] 性能验收通过
- [ ] 代码审查通过
- [ ] 提交 commit

---

## 相关文档

- Plan 文档：`docs/plan/plan-2026-03-05-inventory-item-usage.md`
- 解耦审查报告：`docs/plan/2026-03-05-decoupling-review.md`
- Task-1a 文档：`docs/development/2026-03-05-consumable-task-1a-steps.md`
- Task-1b 文档：`docs/development/2026-03-05-consumable-task-1b-steps.md`
- Task-2 文档：`docs/development/2026-03-05-consumable-task-2-steps.md`
