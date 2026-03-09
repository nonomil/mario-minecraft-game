# 背包材料使用机制优化 - 工程审查报告

> 审查日期：2026-03-05
> 审查人：Claude (Sonnet 4.6)
> 审查对象：`plan-2026-03-05-inventory-item-usage.md`

---

## 审查结论

**总体评估**：方案存在多个高优先级问题，需要重大修改后才能实施。

**核心问题**：
1. 长按检测机制与现有输入系统冲突（高风险）
2. 消耗品系统与现有物品使用逻辑重复（架构问题）
3. 缺少关键实现细节（输入处理、状态管理）
4. 模块编号冲突（24/25 已被占用）

---

## 高优先级问题

### 1. 长按检测与现有输入系统冲突 ⚠️

**问题描述**：
- 现有代码中攻击按钮已经通过 `bindTap("attack", () => { handleAttack("tap"); })` 绑定（16-events.js:545）
- `bindTap` 是点击事件，不支持长按检测
- Plan 中提到"在 input handler 中记录按下时间戳"，但现有架构中**没有独立的 input handler 模块**
- 输入处理分散在 `16-events.js`（事件绑定）和 `13-game-loop.js`（键盘状态）

**影响**：
- 需要重构现有的触摸控制系统，将 `bindTap` 改为支持长按的机制
- 可能破坏现有武器攻击逻辑（弓箭蓄力、近战攻击）
- 移动端和桌面端需要分别处理

**建议**：
1. **不要新增 input handler 模块**，而是扩展 `16-events.js` 中的 `bindTap` 为 `bindTapOrHold`
2. 参考现有的 `bindLongPress` 函数（16-events.js:484-531），但需要支持"短按=攻击，长按=使用消耗品"的双重逻辑
3. 在 `handleAttack` 函数中增加长按检测分支：
   ```javascript
   function handleAttack(mode = "tap", holdDuration = 0) {
     if (holdDuration >= 800 && equippedConsumable.itemKey) {
       useConsumable();
       return;
     }
     // 原有攻击逻辑
   }
   ```

---

### 2. 消耗品系统与现有物品使用逻辑重复 🔄

**问题描述**：
- 现有代码中**已经实现了炸药和末影珍珠的使用逻辑**（13-game-loop.js:1036-1065）
- 炸药：`inventory.gunpowder -= 1; bombs.push(new Bomb(...))`
- 末影珍珠：`inventory.ender_pearl -= 1; player.x += direction * teleportDist`
- 现有逻辑通过背包 UI 点击触发，Plan 中要改为长按武器按钮触发

**影响**：
- 两套使用逻辑会导致状态不一致
- 现有的 `useInventoryItem(itemKey)` 函数（13-game-loop.js:1018-1150）已经包含冷却系统、特效生成
- 新增的 `24-consumables.js` 会与现有逻辑冲突

**建议**：
1. **不要新建 `24-consumables.js`**，而是重构现有的 `useInventoryItem` 函数
2. 将 `equippedConsumable` 状态添加到 `01-config.js` 的全局变量中
3. 修改 `useInventoryItem` 支持两种触发方式：
   - 背包 UI 点击：直接使用
   - 长按武器按钮：检查 `equippedConsumable.itemKey` 后使用
4. 特效生成逻辑已经存在（末影珍珠的粒子效果在 1056-1058 行），只需扩展

---

### 3. 模块编号冲突 📛

**问题描述**：
- Plan 中提到新建 `src/modules/24-consumables.js` 和 `25-effects.js`
- 但根据 CLAUDE.md，现有模块是 `01-21`，编号 24/25 可能与未来扩展冲突
- 没有检查是否已存在这些编号的模块

**影响**：
- 可能覆盖现有文件
- 破坏模块加载顺序

**建议**：
1. 检查 `src/modules/` 目录，确认 24/25 是否已被占用
2. 如果已占用，使用下一个可用编号（如 22/23）
3. 更新 `Game.html` 中的脚本加载顺序

---

### 4. Debuff 系统实现细节缺失 🐛

**问题描述**：
- Plan 中提到"敌人新增 `debuffs` 数组"（line 148-156），但没有说明：
  - 如何在现有 `Enemy` 类中集成？
  - `Enemy.update()` 方法如何调用 debuff 更新？
  - 多个 debuff 叠加如何处理？
  - Debuff 粒子效果如何渲染？

**影响**：
- 实现时会遇到大量未定义行为
- 可能与现有敌人 AI 逻辑冲突（Enemy.update 在 15-entities-combat.js:151-177）

**建议**：
1. 在 `15-entities-combat.js` 的 `Enemy` 类中添加：
   ```javascript
   constructor() {
     // ...
     this.debuffs = [];
   }

   updateDebuffs() {
     this.debuffs = this.debuffs.filter(d => {
       d.duration--;
       if (d.duration <= 0) return false;
       if (d.type === "burn") {
         this.hp -= d.damagePerFrame;
         if (gameFrame % 10 === 0) {
           emitGameParticle("ember", this.x, this.y);
         }
       }
       return true;
     });
   }
   ```
2. 在 `Enemy.update()` 末尾调用 `this.updateDebuffs()`

---

### 5. 长按进度条 UI 实现缺失 🎨

**问题描述**：
- Plan 中提到"武器按钮显示圆形进度条（CSS animation）"（line 95）
- 但没有说明：
  - 进度条 DOM 元素在哪里？
  - 如何与触摸按钮（`#btn-attack`）关联？
  - 桌面端键盘长按如何显示进度条？

**影响**：
- 用户无法感知长按进度，体验差
- 移动端和桌面端行为不一致

**建议**：
1. 在 `Game.html` 的 `#btn-attack` 内部添加进度条元素：
   ```html
   <button class="touch-btn" id="btn-attack" data-action="attack">
     🗡️
     <div class="hold-progress" style="display:none;"></div>
   </button>
   ```
2. 在 CSS 中添加圆形进度条动画（使用 `conic-gradient` 或 SVG）
3. 桌面端在屏幕中央显示进度提示

---

## 中优先级问题

### 6. 特效配置文件加载时机未定义 ⏱️

**问题描述**：
- Plan 中新建 `config/consumables.json`，但没有说明何时加载
- 现有配置文件在 `17-bootstrap.js` 中通过 `loadJsonWithFallback` 加载

**建议**：
- 在 `17-bootstrap.js` 的配置加载阶段添加 `consumables.json` 加载逻辑
- 提供默认配置 fallback（如 Plan 中 line 108-143 的 JSON）

---

### 7. 消耗品槽 UI 位置未明确 📍

**问题描述**：
- Plan 中提到"消耗品槽 UI 显示"（line 171），但没有说明：
  - 在 HUD 的哪个位置？
  - 与现有的 `#equip-status`（武器显示）如何区分？
  - 移动端和桌面端布局是否一致？

**建议**：
- 在 `Game.html` 的 `.hud-right` 区域添加新元素：
  ```html
  <div class="hud-box" id="consumable-status">💣 炸药 x3</div>
  ```
- 在 `10-ui.js` 中添加 `updateConsumableUI()` 函数

---

### 8. 粒子池复用机制未实现 ♻️

**问题描述**：
- Plan 中提到"粒子池复用，限制同屏粒子数量（<100）"（line 198）
- 但现有粒子系统（15-entities-particles.js）没有池化机制，直接 `particles.push(new Particle())`

**建议**：
- 在 `15-entities-particles.js` 中添加粒子池：
  ```javascript
  const particlePool = {
    fire: [],
    sparkle: []
  };

  function getParticle(type) {
    const pool = particlePool[type] || [];
    return pool.find(p => p.remove) || new FireParticle(0, 0);
  }
  ```

---

### 9. 音效缺失 🔊

**问题描述**：
- Plan 中"待确认问题"提到音效（line 210），但没有明确是否实现
- 现有代码中有 `playHitSfx()` 函数，但没有爆炸音、传送音

**建议**：
- 如果实现音效，需要在 `03-audio.js` 中添加音效播放函数
- 如果不实现，在 Plan 中明确标注"本期不包含音效"

---

## 低优先级问题

### 10. 配置参数硬编码 🔢

**问题描述**：
- Plan 中的特效参数（爆炸半径 150、伤害 30、燃烧持续 180 帧）直接写在配置文件中
- 没有与现有的 `config/game.json` 中的难度系统关联

**建议**：
- 将消耗品伤害纳入难度系统，受 `enemyDamageMult` 影响
- 或者在 `consumables.json` 中添加难度缩放参数

---

### 11. 测试覆盖不足 🧪

**问题描述**：
- Plan 中的验收标准（line 217-236）只有功能测试，没有回归测试
- 没有提到如何测试"不影响现有武器攻击"

**建议**：
- 在 `tests/` 目录添加专门的消耗品测试用例
- 运行现有的 `opt-0226-*.spec.mjs` 测试确保无回归

---

### 12. 长按取消机制未定义 ↩️

**问题描述**：
- Plan 中"待确认问题"提到长按取消（line 211），但没有明确行为
- 如果用户长按到 700ms 后松开，是否触发普通攻击？

**建议**：
- 明确定义：长按未达到 800ms 阈值时，**不触发任何动作**（既不攻击也不使用消耗品）
- 或者：长按未达到阈值时，触发普通攻击（向后兼容）

---

## 无问题项（已验证）

### ✅ 方案选择合理
- 独立消耗品系统与武器系统解耦，符合单一职责原则
- 避免了大规模重构（方案 C）

### ✅ 数据流清晰
- 装备流程、使用流程、特效流程逻辑正确（line 86-88）

### ✅ 风险识别完整
- 风险表（line 193-201）覆盖了主要技术风险

### ✅ 并行策略正确
- task-1 和 task-2 无文件重叠，可并行开发

---

## 关键修改建议

### 修改 1：重新设计输入处理架构

**当前 Plan**：
```
├─→ Input Handler (新增长按检测)
│   - 检测武器按钮长按（800ms）
```

**修改后**：
```
├─→ 16-events.js (扩展现有 bindTap)
│   - bindTapOrHold("attack", onTap, onHold, 800)
│   - onTap: handleAttack("tap")
│   - onHold: useEquippedConsumable()
```

---

### 修改 2：复用现有物品使用逻辑

**当前 Plan**：
```
新建 src/modules/24-consumables.js (~150 行)
```

**修改后**：
```
修改 src/modules/13-game-loop.js
- 添加 equippedConsumable 状态
- 重构 useInventoryItem 支持装备槽
- 新增 useEquippedConsumable() 函数 (~30 行)
```

---

### 修改 3：集成 Debuff 到现有 Enemy 类

**当前 Plan**：
```
修改 src/modules/15-entities-combat.js (~60 行)
```

**修改后**：
```
修改 src/modules/15-entities-combat.js (~40 行)
- Enemy 构造函数添加 this.debuffs = []
- Enemy.update() 末尾调用 this.updateDebuffs()
- 新增 Enemy.updateDebuffs() 方法
- 新增 Enemy.addDebuff(type, duration, params) 方法
```

---

## 预估改动量修正

| 文件 | 原预估 | 修正后 | 说明 |
|------|--------|--------|------|
| `config/consumables.json` | 80 | 80 | 不变 |
| `src/modules/13-game-loop.js` | 30 | 80 | 增加：装备槽逻辑 + 长按检测 |
| `src/modules/24-consumables.js` | 150 | **删除** | 复用现有逻辑 |
| `src/modules/25-effects.js` | 120 | **删除** | 特效已在现有代码中 |
| `src/modules/15-entities-combat.js` | 60 | 40 | 减少：只需 debuff 系统 |
| `src/modules/15-entities-particles.js` | 40 | 60 | 增加：粒子池 + 新粒子类 |
| `src/modules/10-ui.js` | 50 | 70 | 增加：消耗品槽 UI + 进度条 |
| `src/modules/16-events.js` | **新增** | 80 | 扩展触摸控制 |
| `Game.html` | 5 | 10 | 增加：进度条元素 |
| **总计** | 535 | **420** | 减少 115 行 |

---

## 实施建议

### 阶段 1：原型验证（1 个 worktree）
- 在独立分支实现长按检测 + 炸药使用
- 验证输入系统改动不影响现有攻击
- 预估：~150 行

### 阶段 2：完整实现（2 个 worktree 并行）
- Worktree A：消耗品系统 + UI（~180 行）
- Worktree B：Debuff 系统 + 特效（~160 行）

### 阶段 3：集成测试
- 合并后运行完整测试套件
- 根据 lessons.md 第 18-22 条，必须运行语法检查和完整测试

---

## 总结

**必须修改的问题**：
1. 重新设计长按检测机制（高）
2. 复用现有物品使用逻辑（高）
3. 解决模块编号冲突（高）
4. 补充 Debuff 实现细节（高）
5. 实现长按进度条 UI（高）

**建议优化的问题**：
6. 明确配置加载时机（中）
7. 确定消耗品槽 UI 位置（中）
8. 实现粒子池复用（中）

**可延后的问题**：
9. 音效实现（低）
10. 难度系统集成（低）
11. 测试覆盖（低）
12. 长按取消行为（低）

**预估改动量**：从 535 行降至 420 行（减少 21%）

**风险评估**：修改后风险从"高"降至"中"，主要风险点在输入系统重构。
