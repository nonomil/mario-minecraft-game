# Phase 4.5: 解耦审查报告

> 审查时间：2026-03-05
> 审查对象：3 个 worktree 任务的独立性验证

---

## ❌ 审查结论：未通过（发现文件冲突）

### 冲突详情

#### 冲突 1：`01-config.js` 重复修改
- **task-1 Step 2**（第 119-142 行）：添加全局变量 `CONSUMABLES_CONFIG` 和 `equippedConsumable`
- **task-3 Step 2**（第 140-163 行）：添加相同的全局变量定义
- **冲突类型**：完全重复，会导致合并冲突
- **影响**：task-1 和 task-3 无法并行开发

#### 冲突 2：`17-bootstrap.js` 重复修改
- **task-1 Step 3**（第 145-224 行）：添加 `loadConsumablesConfig()` 和 `getDefaultConsumablesConfig()` 函数
- **task-3 Step 3**（第 167-266 行）：添加相同的配置加载函数
- **冲突类型**：完全重复，会导致合并冲突
- **影响**：task-1 和 task-3 无法并行开发

#### 冲突 3：`config/consumables.json` 归属不明确
- **task-1 Step 1**（第 42-110 行）：创建配置文件（4 种消耗品）
- **task-3 Step 1**（第 55-136 行）：创建配置文件（4 种消耗品）
- **冲突类型**：重复创建，内容略有差异（图标不同）
- **影响**：task-1 和 task-3 无法并行开发

---

## 修正方案

### 方案 A：task-1 负责所有基础设施（推荐）

**原则**：基础设施（配置、全局变量、加载机制）由 task-1 统一负责，task-3 只负责 UI 层。

#### 修改 task-1（保持不变）
- ✅ Step 1: 创建 `config/consumables.json`
- ✅ Step 2: 在 `01-config.js` 定义全局变量
- ✅ Step 3: 在 `17-bootstrap.js` 实现配置加载
- ✅ Step 4: 在 `16-events.js` 实现长按检测

#### 修改 task-3（删除重复步骤）
- ❌ ~~Step 1: 创建 `config/consumables.json`~~（由 task-1 负责）
- ❌ ~~Step 2: 定义全局变量~~（由 task-1 负责）
- ❌ ~~Step 3: 实现配置加载~~（由 task-1 负责）
- ✅ Step 4 → 新 Step 1: 扩展 `useInventoryItem` 支持 debuff
- ✅ Step 5 → 新 Step 2: 实现 `updateConsumableUI` 函数
- ✅ Step 6 → 新 Step 3: 添加 UI 元素和样式

#### 修改 task-2（保持不变）
- ✅ 无需修改，task-2 完全独立

#### 更新后的文件改动矩阵

| 文件 | task-1 | task-2 | task-3 |
|------|--------|--------|--------|
| `config/consumables.json` | ✅ (新建) | - | - |
| `01-config.js` | ✅ | - | - |
| `17-bootstrap.js` | ✅ | - | - |
| `16-events.js` | ✅ | - | - |
| `15-entities-combat.js` | - | ✅ | - |
| `15-entities-particles.js` | - | ✅ | - |
| `13-game-loop.js` | - | - | ✅ |
| `10-ui.js` | - | - | ✅ |
| `Game.html` | - | - | ✅ |

**验证结果**：✅ 无文件重叠，task-1 和 task-2 可并行

---

### 方案 B：task-3 负责所有基础设施（不推荐）

**缺点**：
- task-3 依赖 task-1 和 task-2，如果 task-3 还负责基础设施，会导致 task-1 无法独立测试
- task-1 的长按检测需要 `equippedConsumable` 全局变量，如果由 task-3 定义，task-1 无法编译通过

**结论**：不可行

---

## 依赖关系验证

### 当前依赖图（修正前）
```
task-1 ──┐
         ├──> task-3
task-2 ──┘

问题：task-1 和 task-3 有文件冲突，无法并行
```

### 修正后依赖图
```
task-1 ──┐
         ├──> task-3
task-2 ──┘

✅ task-1 和 task-2 完全独立，可并行
✅ task-3 依赖 task-1 和 task-2，串行执行
✅ 无循环依赖
```

---

## 改动量验证

### task-1（修正后）
- `config/consumables.json`: ~80 行（新建）
- `01-config.js`: ~10 行（添加全局变量）
- `17-bootstrap.js`: ~60 行（配置加载 + fallback）
- `16-events.js`: ~90 行（长按检测）
- **总计**: ~240 行 ⚠️ **超过 200 行限制**

### task-2（无变化）
- `15-entities-combat.js`: ~90 行（Debuff 系统）
- `15-entities-particles.js`: ~50 行（粒子池）
- **总计**: ~140 行 ✅

### task-3（修正后）
- `13-game-loop.js`: ~15 行（扩展 useInventoryItem）
- `10-ui.js`: ~40 行（UI 更新函数）
- `Game.html`: ~60 行（DOM + CSS）
- **总计**: ~115 行 ✅

---

## ⚠️ 新问题：task-1 超过 200 行限制

### 解决方案：进一步拆分 task-1

#### 方案 A：拆分为 task-1a 和 task-1b
- **task-1a**（基础设施）：`config/consumables.json` + `01-config.js` + `17-bootstrap.js`（~150 行）
- **task-1b**（长按检测）：`16-events.js`（~90 行）
- **依赖关系**：task-1b 依赖 task-1a（需要全局变量）

#### 方案 B：将配置文件移到 task-3
- **task-1**：`01-config.js` + `17-bootstrap.js` + `16-events.js`（~160 行）
- **task-3**：`config/consumables.json` + `13-game-loop.js` + `10-ui.js` + `Game.html`（~195 行）
- **问题**：task-1 的 `17-bootstrap.js` 需要加载 `config/consumables.json`，如果文件由 task-3 创建，task-1 无法独立测试

---

## 推荐方案：采用方案 A（拆分为 4 个任务）

### 最终任务拆分

| Worktree | 分支 | 任务 | 依赖 | 预估行数 |
|----------|------|------|------|---------|
| task-1a | feat/consumable-config | 配置基础设施 | 无 | ~150 |
| task-1b | feat/consumable-input | 长按检测 | task-1a | ~90 |
| task-2 | feat/consumable-effects | Debuff + 粒子 | 无 | ~140 |
| task-3 | feat/consumable-ui | UI + 集成 | task-1a, task-1b, task-2 | ~115 |

### 并行策略
- **第一轮并行**：task-1a 和 task-2（无文件重叠）
- **第二轮并行**：task-1b（依赖 task-1a）
- **第三轮串行**：task-3（依赖所有前置任务）

### 文件改动矩阵（最终版）

| 文件 | task-1a | task-1b | task-2 | task-3 |
|------|---------|---------|--------|--------|
| `config/consumables.json` | ✅ | - | - | - |
| `01-config.js` | ✅ | - | - | - |
| `17-bootstrap.js` | ✅ | - | - | - |
| `16-events.js` | - | ✅ | - | - |
| `15-entities-combat.js` | - | - | ✅ | - |
| `15-entities-particles.js` | - | - | ✅ | - |
| `13-game-loop.js` | - | - | - | ✅ |
| `10-ui.js` | - | - | - | ✅ |
| `Game.html` | - | - | - | ✅ |

**验证结果**：✅ 所有任务无文件重叠

---

## 验收标准

### 解耦验证通过条件
- [x] 文件改动矩阵无重叠
- [x] 依赖关系形成 DAG（无循环）
- [x] 每个任务 ≤ 200 行
- [ ] 每个任务可独立测试（需补充测试策略）

### 遗留问题
1. **测试策略未定义**：每个任务完成后如何验证？
   - task-1a: 配置加载成功，控制台输出日志
   - task-1b: 长按检测触发，进度条动画显示
   - task-2: Debuff 系统工作，敌人受到持续伤害
   - task-3: UI 显示正确，集成测试通过

2. **task-1 原文档需要更新**：删除 Step 1-3，只保留 Step 4（长按检测）

3. **task-3 原文档需要更新**：删除 Step 1-3，重新编号

4. **需要新建 task-1a 文档**：配置基础设施实施步骤

---

## 下一步行动

### 选项 A：接受 4 任务拆分方案（推荐）
1. 新建 `docs/development/2026-03-05-consumable-task-1a-steps.md`
2. 更新 `docs/development/2026-03-05-consumable-task-1-steps.md`（重命名为 task-1b）
3. 更新 `docs/development/2026-03-05-consumable-task-3-steps.md`（删除重复步骤）
4. 更新 `docs/plan/plan-2026-03-05-inventory-item-usage.md` 的 Worktree 并行计划表
5. 用户确认后进入 Phase 6（创建 worktree 并执行）

### 选项 B：接受 task-1 超过 200 行（不推荐）
- 风险：违反单次任务 ≤ 200 行的硬约束
- 后果：如果开发中发现问题，回滚成本高

### 选项 C：重新设计任务拆分（高成本）
- 回到 Phase 1 重新规划
- 预估时间：1-2 小时

---

## 审查签名

- **审查者**：Claude Code
- **审查时间**：2026-03-05
- **审查结论**：❌ 未通过，需要修正文件冲突并重新拆分任务
- **推荐方案**：选项 A（4 任务拆分）
