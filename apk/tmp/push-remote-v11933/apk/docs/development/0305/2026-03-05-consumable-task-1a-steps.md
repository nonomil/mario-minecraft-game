# Task-1a: 配置基础设施 - 详细实施步骤

> 生成日期：2026-03-05
> Worktree: task-1a
> 分支: feat/consumable-config
> 预估改动: ~150 行
> 依赖: 无（可与 task-2 并行）

---

## 任务概述

实现消耗品系统的配置基础设施：
1. 创建消耗品配置文件（特效参数）
2. 定义全局状态变量
3. 实现配置加载机制（含 fallback）

**关键约束**：
- 配置加载失败时使用默认配置
- 全局变量在所有模块加载前初始化
- 提供完整的 4 种消耗品配置

---

## 涉及文件

| 文件 | 操作 | 改动类型 | 预估行数 |
|------|------|---------|---------|
| `config/consumables.json` | 新建 | 配置文件 | ~80 |
| `src/modules/01-config.js` | 修改 | 添加全局变量 | ~10 |
| `src/modules/17-bootstrap.js` | 修改 | 添加加载函数 | ~60 |
| **总计** | - | - | **~150** |

---

## 实施步骤

### Step 1: 创建消耗品配置文件

**文件**: `config/consumables.json`
**操作**: 新建文件
**说明**: 定义 4 种消耗品的特效参数（炸药、末影珍珠、雪球、龙蛋）

**完整代码**:
```json
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
    "icon": "🥚",
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
// ============================================
// 消耗品系统全局变量（新增）
// ============================================

// 消耗品配置（从 config/consumables.json 加载）
let CONSUMABLES_CONFIG = {};

// 当前装备的消耗品状态
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
// ============================================
// 消耗品配置加载（新增）
// ============================================

/**
 * 默认消耗品配置（fallback）
 */
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
            "icon": "🥚",
            "effect": {
                "type": "dragon_breath",
                "radius": 9999,
                "damage": 50
            }
        }
    };
}

/**
 * 加载消耗品配置
 */
async function loadConsumablesConfig() {
    try {
        const response = await fetch('config/consumables.json', { cache: "no-store" });
        if (!response.ok) {
            console.warn('[Config] Failed to load consumables.json, using defaults');
            CONSUMABLES_CONFIG = getDefaultConsumablesConfig();
            return;
        }
        CONSUMABLES_CONFIG = await response.json();
        console.log('[Config] Loaded consumables.json:', Object.keys(CONSUMABLES_CONFIG).length, 'items');
    } catch (error) {
        console.warn('[Config] Error loading consumables.json:', error);
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

    // ===== 新增：加载消耗品配置 =====
    await loadConsumablesConfig();

    gameConfig = mergeDeep(defaultGameConfig, loadedGame);
    // ... 后续代码保持不变
```

**验证**:
- [ ] `loadConsumablesConfig()` 在 `Promise.all` 之后调用
- [ ] 配置加载失败时使用默认配置
- [ ] 控制台输出加载成功日志

---

## 验收标准

### 功能验收
- [ ] `config/consumables.json` 格式正确，包含 4 种消耗品配置
- [ ] `CONSUMABLES_CONFIG` 全局变量可在其他模块访问
- [ ] `equippedConsumable` 全局变量可在其他模块访问
- [ ] 配置加载成功，控制台输出 `[Config] Loaded consumables.json: 4 items`
- [ ] 配置加载失败时使用默认配置（不影响游戏启动）

### 代码质量
- [ ] 语法检查通过（`node -c src/modules/01-config.js src/modules/17-bootstrap.js`）
- [ ] 无 ESLint 警告（如果项目有配置）
- [ ] 代码风格与现有代码一致
- [ ] 注释清晰，说明关键逻辑

### 兼容性
- [ ] 不影响现有游戏启动流程
- [ ] 不影响现有配置加载（game.json, controls.json 等）

### 性能
- [ ] 配置加载不阻塞游戏启动
- [ ] 加载时间 < 100ms

---

## 测试步骤

### 1. 语法检查
```bash
node -c src/modules/01-config.js
node -c src/modules/17-bootstrap.js
```

### 2. 功能测试
```javascript
// 打开 Game.html，在浏览器控制台输入：

// 测试 1：检查配置加载
console.log(CONSUMABLES_CONFIG);
// 应该显示 4 个消耗品配置

// 测试 2：检查全局变量
console.log(equippedConsumable);
// 应该显示 { itemKey: null, count: 0, icon: null }

// 测试 3：检查配置结构
console.log(CONSUMABLES_CONFIG.gunpowder);
// 应该显示炸药的完整配置

// 测试 4：检查 fallback 机制
// 临时重命名 config/consumables.json，刷新页面
// 控制台应显示警告，但游戏正常启动
```

### 3. 集成测试（需等待 task-1b, task-2, task-3 完成）
- 长按攻击按钮时能正确读取配置
- UI 显示正确的消耗品图标和名称
- 使用消耗品时能正确应用特效参数

---

## 提交规范

```bash
# 提交前检查
git diff --stat  # 确认改动量 ≤ 200 行

# 提交
git add config/consumables.json
git add src/modules/01-config.js
git add src/modules/17-bootstrap.js
git commit -m "$(cat <<'EOF'
feat(config): 实现消耗品配置基础设施

- 新建 config/consumables.json 定义 4 种消耗品特效参数
- 在 01-config.js 中定义 CONSUMABLES_CONFIG 和 equippedConsumable 全局变量
- 在 17-bootstrap.js 中实现配置加载机制（含 fallback）
- 配置加载失败时使用默认配置，不影响游戏启动

改动量: ~150 行
相关任务: task-1a, feat/consumable-config
EOF
)"
```

---

## 已知限制

1. **UI 未实现**: 消耗品槽 UI 在 task-3 中实现
2. **长按检测未实现**: 在 task-1b 中实现
3. **Debuff 系统未实现**: 在 task-2 中实现
4. **集成逻辑未实现**: 在 task-3 中实现

---

## 下一步

完成本 task 后，可以并行进入：
- task-1b（长按检测，依赖 task-1a）
- task-2（Debuff 系统 + 粒子扩展，可与 task-1a 并行）

task-3（UI + 集成测试）依赖 task-1a, task-1b, task-2 全部完成。

---

## 参考资料

- Plan 文档：`docs/plan/plan-2026-03-05-inventory-item-usage.md`
- 解耦审查报告：`docs/plan/2026-03-05-decoupling-review.md`
- 现有配置加载：`src/modules/17-bootstrap.js` (第 37-80 行)
- 现有全局变量：`src/modules/01-config.js` (第 1-806 行)
