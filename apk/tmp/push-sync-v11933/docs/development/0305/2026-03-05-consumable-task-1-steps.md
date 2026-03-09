# Task 1: 长按检测 + 配置加载

> 生成日期：2026-03-05
> Worktree: task-1
> 分支: feat/consumable-input
> 预估改动: ~195 行
> 依赖: 无（可并行开发）

---

## 任务概述

实现消耗品系统的基础设施：
1. 创建消耗品配置文件（特效参数）
2. 定义全局状态变量
3. 实现配置加载机制（含 fallback）
4. 扩展触摸控制，支持长按检测

**关键约束**：
- 不修改现有武器攻击逻辑
- 长按阈值 800ms
- 配置加载失败时使用默认配置
- 长按进度条使用 CSS 动画

---

## 涉及文件

| 文件 | 操作 | 改动类型 | 预估行数 |
|------|------|---------|---------|
| `config/consumables.json` | 新建 | 配置文件 | ~80 |
| `src/modules/01-config.js` | 修改 | 添加全局变量 | ~10 |
| `src/modules/17-bootstrap.js` | 修改 | 添加加载函数 | ~15 |
| `src/modules/16-events.js` | 修改 | 添加长按检测 | ~90 |
| **总计** | - | - | **~195** |

---

## 实施步骤

### Step 1: 创建消耗品配置文件

**文件**: `config/consumables.json`
**操作**: 新建文件
**说明**: 定义炸药和末影珍珠的特效参数（初版仅支持这两种）

**完整代码**:
```json
{
  "gunpowder": {
    "name": "炸药",
    "icon": "💥",
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
    "icon": "🟣",
    "effect": {
      "type": "teleport",
      "range": 250,
      "particles": {
        "type": "sparkle",
        "count": 30,
        "color": ["#9B59B6", "#8E44AD"]
      }
    }
  },
  "string": {
    "name": "蜘蛛丝",
    "icon": "🕸️",
    "effect": {
      "type": "trap",
      "radius": 100,
      "debuff": {
        "type": "slow",
        "duration": 300,
        "speedMult": 0.2
      }
    }
  },
  "dragon_egg": {
    "name": "龙蛋",
    "icon": "🐉",
    "effect": {
      "type": "dragon_breath",
      "radius": 9999,
      "damage": 50,
      "particles": {
        "type": "purple_flame",
        "count": 50,
        "color": ["#8B00FF", "#9932CC"]
      }
    }
  }
}
```

**验证**:
- [ ] 文件格式正确，可被 `JSON.parse()` 解析
- [ ] 包含 4 种消耗品配置（gunpowder, ender_pearl, string, dragon_egg）
- [ ] 每个配置包含 name, icon, effect 字段

---

### Step 2: 定义全局变量

**文件**: `src/modules/01-config.js`
**操作**: 在文件末尾（第 806 行之后）添加
**说明**: 定义 `CONSUMABLES_CONFIG` 和 `equippedConsumable` 全局变量

**插入位置**: 在 `let lastDamageFrame = 0;` 之后

**完整代码**:
```javascript
// ===== 消耗品系统 =====
let CONSUMABLES_CONFIG = {}; // 从 config/consumables.json 加载
let equippedConsumable = {
    itemKey: null,      // 当前装备的材料 key（如 "gunpowder"）
    count: 0,           // 剩余数量
    icon: null          // 图标 emoji
};
```

**验证**:
- [ ] 变量在文件末尾正确定义
- [ ] `CONSUMABLES_CONFIG` 初始化为空对象
- [ ] `equippedConsumable` 包含 itemKey, count, icon 三个字段

---

### Step 3: 实现配置加载机制

**文件**: `src/modules/17-bootstrap.js`
**操作**: 在 `start()` 函数中添加配置加载
**说明**: 在现有配置加载之后，添加 `consumables.json` 加载逻辑

#### 3.1 添加默认配置 fallback 函数

**插入位置**: 在 `start()` 函数之前（第 37 行之前）

**完整代码**:
```javascript
function getDefaultConsumablesConfig() {
    return {
        "gunpowder": {
            "name": "炸药",
            "icon": "💥",
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
            "icon": "🟣",
            "effect": {
                "type": "teleport",
                "range": 250
            }
        }
    };
}

async function loadConsumablesConfig() {
    try {
        const response = await fetch('config/consumables.json', { cache: "no-store" });
        if (!response.ok) {
            console.warn('Failed to load consumables.json, using defaults');
            CONSUMABLES_CONFIG = getDefaultConsumablesConfig();
            return;
        }
        CONSUMABLES_CONFIG = await response.json();
        console.log('[Config] Loaded consumables.json:', Object.keys(CONSUMABLES_CONFIG).length, 'items');
    } catch (error) {
        console.warn('Error loading consumables.json:', error);
        CONSUMABLES_CONFIG = getDefaultConsumablesConfig();
    }
}
```

#### 3.2 在 start() 函数中调用加载

**插入位置**: 在 `start()` 函数的 `Promise.all` 之后（第 45 行之后）

**修改方式**: 在现有配置加载完成后，添加一行调用

**完整代码**:
```javascript
async function start() {
    const [loadedGame, loadedControls, loadedLevels, loadedWords, loadedBiomes, loadedVillage] = await Promise.all([
        loadJsonWithFallback("config/game.json", defaultGameConfig),
        loadJsonWithFallback("config/controls.json", defaultControls),
        loadJsonWithFallback("config/levels.json", defaultLevels),
        loadJsonWithFallback("words/words-base.json", defaultWords),
        loadJsonWithFallback("config/biomes.json", { switch: DEFAULT_BIOME_SWITCH, biomes: DEFAULT_BIOME_CONFIGS }),
        loadJsonWithFallback("config/village.json", { enabled: true }).catch(() => ({ enabled: true }))
    ]);

    // 加载消耗品配置（新增）
    await loadConsumablesConfig();

    gameConfig = mergeDeep(defaultGameConfig, loadedGame);
    // ... 后续代码保持不变
```

**验证**:
- [ ] `loadConsumablesConfig()` 在 `Promise.all` 之后调用
- [ ] 配置加载失败时使用默认配置
- [ ] 控制台输出加载成功日志

---

### Step 4: 实现长按检测函数

**文件**: `src/modules/16-events.js`
**操作**: 在 `wireTouchControls()` 函数中添加 `bindTapOrHold` 函数
**说明**: 扩展现有的 `bindTap` 和 `bindHold` 机制，支持短按/长按区分

#### 4.1 添加 bindTapOrHold 函数

**插入位置**: 在 `wireTouchControls()` 函数内，`bindLongPress` 函数之后（第 531 行之后）

**完整代码**:
```javascript
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
        btn.addEventListener("mousedown", startPress, { passive: false });
        btn.addEventListener("mouseup", endPress, { passive: false });
        btn.addEventListener("mouseleave", cancelPress);
    }
```

#### 4.2 替换现有的 attack 按钮绑定

**修改位置**: 在 `wireTouchControls()` 函数末尾，找到 `bindTap("attack", ...)` 这一行（第 545 行）

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
                console.warn("[Input] useEquippedConsumable not defined yet");
            }
        },
        800  // 长按阈值 800ms
    );
```

**验证**:
- [ ] `bindTapOrHold` 函数正确定义
- [ ] 短按触发 `handleAttack("tap")`
- [ ] 长按触发 `useEquippedConsumable()`（如果已定义）
- [ ] 长按期间显示进度条动画
- [ ] 手指移出按钮区域时取消长按

---

### Step 5: 添加 CSS 动画（可选，task-3 会完整实现）

**文件**: `Game.html`（本 task 暂不修改，仅记录接口）
**说明**: 长按进度条动画由 CSS `@keyframes` 定义，task-3 会在 `Game.html` 中添加

**CSS 接口定义**（供参考）:
```css
@keyframes hold-fill {
  from {
    background: conic-gradient(#4CAF50 0deg, transparent 0deg);
  }
  to {
    background: conic-gradient(#4CAF50 360deg, transparent 360deg);
  }
}
```

**注意**: 本 task 不修改 `Game.html`，CSS 由 task-3 统一添加。

---

### Step 6: 语法检查与提交

#### 6.1 语法检查

**命令**:
```bash
node -c src/modules/01-config.js
node -c src/modules/17-bootstrap.js
node -c src/modules/16-events.js
```

**验证**:
- [ ] 所有文件语法检查通过
- [ ] 无 SyntaxError 或 ReferenceError

#### 6.2 功能自检

**手动测试步骤**:
1. 打开 `Game.html`，检查控制台是否有配置加载日志
2. 检查 `CONSUMABLES_CONFIG` 是否正确加载（在控制台输入 `CONSUMABLES_CONFIG`）
3. 检查 `equippedConsumable` 是否已定义（在控制台输入 `equippedConsumable`）
4. 长按攻击按钮，观察是否有进度条动画（如果 CSS 已添加）

**验证**:
- [ ] 配置加载成功，控制台输出 `[Config] Loaded consumables.json: 4 items`
- [ ] `CONSUMABLES_CONFIG` 包含 4 个物品配置
- [ ] `equippedConsumable` 初始值为 `{ itemKey: null, count: 0, icon: null }`

#### 6.3 提交代码

**命令**:
```bash
git add config/consumables.json
git add src/modules/01-config.js
git add src/modules/17-bootstrap.js
git add src/modules/16-events.js
git commit -m "$(cat <<'EOF'
feat: 实现长按检测和消耗品配置加载

- 新建 config/consumables.json 定义 4 种消耗品特效参数
- 在 01-config.js 中定义 CONSUMABLES_CONFIG 和 equippedConsumable 全局变量
- 在 17-bootstrap.js 中实现配置加载机制（含 fallback）
- 在 16-events.js 中扩展触摸控制，支持短按/长按区分
- 长按阈值 800ms，长按期间显示进度条动画

改动量: ~195 行
EOF
)"
```

**验证**:
- [ ] diff 行数 ≤ 200 行
- [ ] 提交信息清晰描述改动内容
- [ ] 所有新增文件已添加到 git

---

## 验收标准

### 功能验收
- [ ] `config/consumables.json` 格式正确，包含 4 种消耗品配置
- [ ] `CONSUMABLES_CONFIG` 全局变量可在其他模块访问
- [ ] `equippedConsumable` 全局变量可在其他模块访问
- [ ] 配置加载成功，控制台输出日志
- [ ] 配置加载失败时使用默认配置（不影响游戏启动）
- [ ] `bindTapOrHold` 函数正确区分短按/长按
- [ ] 短按攻击按钮触发普通攻击
- [ ] 长按攻击按钮触发 `useEquippedConsumable()`（如果已定义）
- [ ] 长按期间显示进度条动画（如果 CSS 已添加）
- [ ] 手指移出按钮区域时取消长按

### 代码质量
- [ ] 语法检查通过（`node -c`）
- [ ] 无 ESLint 警告（如果项目有配置）
- [ ] 代码风格与现有代码一致
- [ ] 注释清晰，说明关键逻辑

### 兼容性
- [ ] 不影响现有武器攻击逻辑
- [ ] 不影响现有触摸控制（左右移动、跳跃、切换武器等）
- [ ] 支持 Pointer Events 和 Touch Events（向后兼容）

### 性能
- [ ] 配置加载不阻塞游戏启动
- [ ] 长按检测不影响帧率
- [ ] 进度条动画使用 CSS（不占用 JS 主线程）

---

## 已知限制

1. **CSS 动画未实现**: 本 task 不修改 `Game.html`，进度条动画由 task-3 统一添加
2. **useEquippedConsumable 未定义**: 该函数在 task-3 中实现，本 task 仅预留接口
3. **UI 未更新**: 消耗品槽 UI 在 task-3 中实现

---

## 下一步

完成本 task 后，进入 task-2（Debuff 系统 + 粒子扩展）或 task-3（UI + 集成测试）。

task-1 和 task-2 可并行开发（无文件重叠），task-3 依赖前两者完成。
