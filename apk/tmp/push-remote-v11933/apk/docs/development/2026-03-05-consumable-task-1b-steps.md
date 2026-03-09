# Task-1b: 长按检测 - 详细实施步骤

> 生成日期：2026-03-05
> Worktree: task-1b
> 分支: feat/consumable-input
> 预估改动: ~90 行
> 依赖: task-1a（需要全局变量 equippedConsumable）

---

## 任务概述

实现消耗品系统的输入检测机制：
1. 扩展触摸控制，支持长按检测
2. 区分短按（普通攻击）和长按（使用消耗品）
3. 添加长按进度条视觉反馈

**关键约束**：
- 不修改现有武器攻击逻辑
- 长按阈值 800ms
- 长按进度条使用 CSS 动画
- 支持触摸和鼠标事件

---

## 涉及文件

| 文件 | 操作 | 改动类型 | 预估行数 |
|------|------|---------|---------|
| `src/modules/16-events.js` | 修改 | 添加长按检测 | ~90 |
| **总计** | - | - | **~90** |

---

## 前置依赖

### 来自 task-1a 的接口
- `equippedConsumable` 全局变量（在 01-config.js 中定义）
- `CONSUMABLES_CONFIG` 全局变量（在 01-config.js 中定义）

### 验证依赖
在开始开发前，确认以下变量已定义：
```javascript
// 在浏览器控制台输入
console.log(typeof equippedConsumable);  // 应该输出 "object"
console.log(typeof CONSUMABLES_CONFIG);  // 应该输出 "object"
```

---

## 实施步骤

### Step 1: 实现 bindTapOrHold 函数

**文件**: `src/modules/16-events.js`
**操作**: 在 `wireTouchControls()` 函数中添加 `bindTapOrHold` 函数
**说明**: 扩展现有的 `bindTap` 和 `bindHold` 机制，支持短按/长按区分

**插入位置**: 在 `wireTouchControls()` 函数内，`bindLongPress` 函数之后（第 531 行之后）

**完整代码**:
```javascript
    /**
     * 绑定短按/长按双重检测
     * @param {string} action - 按钮的 data-action 属性值
     * @param {Function} onTap - 短按回调（< holdThreshold）
     * @param {Function} onHold - 长按回调（≥ holdThreshold）
     * @param {number} holdThreshold - 长按阈值（毫秒）
     */
    function bindTapOrHold(action, onTap, onHold, holdThreshold = 800) {
        const btn = root.querySelector(`[data-action="${action}"]`);
        if (!btn) return;

        let pressStartTime = 0;
        let holdTimer = null;
        let isHolding = false;
        let progressEl = btn.querySelector('.hold-progress');

        // 如果按钮内没有进度条元素，创建一个
        if (!progressEl) {
            progressEl = document.createElement('div');
            progressEl.className = 'hold-progress';
            progressEl.style.cssText = `
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
            `;
            btn.appendChild(progressEl);
        }

        const startPress = (e) => {
            if (e) e.preventDefault();
            pressStartTime = Date.now();
            isHolding = false;

            // 显示进度条动画
            if (progressEl) {
                progressEl.style.display = 'block';
                progressEl.style.animation = `hold-fill ${holdThreshold}ms linear`;
            }

            holdTimer = setTimeout(() => {
                isHolding = true;
                onHold();
                // 隐藏进度条
                if (progressEl) {
                    progressEl.style.display = 'none';
                    progressEl.style.animation = '';
                }
            }, holdThreshold);
        };

        const endPress = (e) => {
            if (e) e.preventDefault();
            clearTimeout(holdTimer);

            // 隐藏进度条
            if (progressEl) {
                progressEl.style.display = 'none';
                progressEl.style.animation = '';
            }

            const duration = Date.now() - pressStartTime;
            if (!isHolding && duration < holdThreshold) {
                onTap(); // 短按触发普通攻击
            }
        };

        const cancelPress = (e) => {
            if (e) e.preventDefault();
            clearTimeout(holdTimer);
            if (progressEl) {
                progressEl.style.display = 'none';
                progressEl.style.animation = '';
            }
        };

        // 检测手指移出按钮区域
        const checkMove = (e) => {
            if (!e.touches || e.touches.length === 0) return;
            const touch = e.touches[0];
            const rect = btn.getBoundingClientRect();
            if (touch.clientX < rect.left || touch.clientX > rect.right ||
                touch.clientY < rect.top || touch.clientY > rect.bottom) {
                cancelPress(e);
            }
        };

        // 优先使用 Pointer Events（更好的跨平台支持）
        const supportsPointer = (typeof window !== "undefined") && ("PointerEvent" in window);
        if (supportsPointer) {
            btn.addEventListener("pointerdown", e => {
                startPress(e);
                try { btn.setPointerCapture(e.pointerId); } catch {}
            }, { passive: false });
            btn.addEventListener("pointerup", endPress, { passive: false });
            btn.addEventListener("pointercancel", cancelPress, { passive: false });
            btn.addEventListener("lostpointercapture", cancelPress);
            return;
        }

        // Fallback for older browsers
        btn.addEventListener("touchstart", startPress, { passive: false });
        btn.addEventListener("touchend", endPress, { passive: false });
        btn.addEventListener("touchcancel", cancelPress, { passive: false });
        btn.addEventListener("touchmove", checkMove, { passive: false });
        btn.addEventListener("mousedown", startPress, { passive: false });
        btn.addEventListener("mouseup", endPress, { passive: false });
        btn.addEventListener("mouseleave", cancelPress);
    }
```

**验证**:
- [ ] `bindTapOrHold` 函数正确定义
- [ ] 支持 Pointer Events 和 Touch Events
- [ ] 进度条元素自动创建（如果不存在）
- [ ] 手指移出按钮区域时取消长按

---

### Step 2: 替换现有的 attack 按钮绑定

**文件**: `src/modules/16-events.js`
**操作**: 在 `wireTouchControls()` 函数末尾，替换 `bindTap("attack", ...)` 这一行
**说明**: 使用 `bindTapOrHold` 替代 `bindTap`，支持长按使用消耗品

**修改位置**: 在 `wireTouchControls()` 函数末尾，找到 `bindTap("attack", ...)` 这一行（约第 545 行）

**原代码**:
```javascript
    bindTap("attack", () => { handleAttack("tap"); });
```

**修改为**:
```javascript
    // 使用 bindTapOrHold 替代 bindTap，支持长按使用消耗品
    bindTapOrHold("attack",
        () => { handleAttack("tap"); },  // 短按：普通攻击
        () => {                           // 长按：使用消耗品
            if (typeof useEquippedConsumable === "function") {
                useEquippedConsumable();
            } else {
                console.warn("[Input] useEquippedConsumable not defined yet (will be implemented in task-3)");
            }
        },
        800  // 长按阈值 800ms
    );
```

**验证**:
- [ ] 短按触发 `handleAttack("tap")`
- [ ] 长按触发 `useEquippedConsumable()`（如果已定义）
- [ ] 长按期间显示进度条动画
- [ ] 手指移出按钮区域时取消长按

---

## 验收标准

### 功能验收
- [ ] `bindTapOrHold` 函数正确区分短按/长按
- [ ] 短按攻击按钮触发普通攻击
- [ ] 长按攻击按钮 800ms 触发消耗品使用（如果 `useEquippedConsumable` 已定义）
- [ ] 长按期间显示进度条动画（如果 CSS 已添加）
- [ ] 手指移出按钮区域时取消长按
- [ ] 支持 Pointer Events 和 Touch Events（向后兼容）

### 代码质量
- [ ] 语法检查通过（`node -c src/modules/16-events.js`）
- [ ] 无 ESLint 警告（如果项目有配置）
- [ ] 代码风格与现有代码一致
- [ ] 注释清晰，说明关键逻辑

### 兼容性
- [ ] 不影响现有武器攻击逻辑
- [ ] 不影响现有触摸控制（左右移动、跳跃、切换武器等）
- [ ] 移动端触摸长按正常工作
- [ ] 桌面端鼠标长按正常工作

### 性能
- [ ] 长按检测不影响帧率
- [ ] 进度条动画使用 CSS（不占用 JS 主线程）

---

## 测试步骤

### 1. 语法检查
```bash
node -c src/modules/16-events.js
```

### 2. 功能测试（手动）

#### 测试 1：短按攻击
1. 打开 `Game.html`
2. 短按攻击按钮（< 800ms）
3. 验证：玩家执行普通攻击动作

#### 测试 2：长按检测
1. 长按攻击按钮（≥ 800ms）
2. 验证：控制台输出警告（因为 `useEquippedConsumable` 未定义）
3. 预期输出：`[Input] useEquippedConsumable not defined yet (will be implemented in task-3)`

#### 测试 3：进度条动画（需要 CSS，task-3 实现）
1. 长按攻击按钮（不松开）
2. 验证：按钮内显示绿色圆形进度条（如果 CSS 已添加）
3. 松开按钮，进度条消失

#### 测试 4：取消长按
1. 按下攻击按钮
2. 在 800ms 内移出按钮区域
3. 验证：不触发任何动作，进度条消失

#### 测试 5：多点触控
1. 同时按下多个按钮
2. 验证：每个按钮独立工作，不互相干扰

### 3. 集成测试（需等待 task-3 完成）
- 装备消耗品后，长按攻击按钮能正确使用消耗品
- 使用后消耗品数量减少，UI 同步更新

---

## 提交规范

```bash
# 提交前检查
git diff --stat  # 确认改动量 ≤ 200 行

# 提交
git add src/modules/16-events.js
git commit -m "$(cat <<'EOF'
feat(input): 实现长按检测机制

- 在 16-events.js 中添加 bindTapOrHold 函数
- 支持短按（普通攻击）和长按（使用消耗品）区分
- 长按阈值 800ms，长按期间显示进度条动画
- 支持 Pointer Events 和 Touch Events（向后兼容）
- 手指移出按钮区域时取消长按

改动量: ~90 行
相关任务: task-1b, feat/consumable-input
依赖: task-1a (需要 equippedConsumable 全局变量)
EOF
)"
```

---

## 已知限制

1. **CSS 动画未实现**: 本 task 不修改 `Game.html`，进度条动画由 task-3 统一添加
2. **useEquippedConsumable 未定义**: 该函数在 task-3 中实现，本 task 仅预留接口
3. **UI 未更新**: 消耗品槽 UI 在 task-3 中实现

---

## 下一步

完成本 task 后，需要等待：
- task-2（Debuff 系统 + 粒子扩展）完成
- task-3（UI + 集成测试）完成

task-3 依赖 task-1a, task-1b, task-2 全部完成。

---

## 参考资料

- Plan 文档：`docs/plan/plan-2026-03-05-inventory-item-usage.md`
- 解耦审查报告：`docs/plan/2026-03-05-decoupling-review.md`
- task-1a 文档：`docs/development/2026-03-05-consumable-task-1a-steps.md`
- 现有 wireTouchControls 函数：`src/modules/16-events.js` (第 450-550 行)
- 现有 bindTap 函数：`src/modules/16-events.js` (第 480-495 行)
