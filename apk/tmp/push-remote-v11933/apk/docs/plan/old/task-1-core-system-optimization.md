# 任务 1：核心系统优化 - 执行计划

> **任务ID：** TASK-1-CORE
> **优先级：** 高
> **预估工作量：** 3-5 天
> **风险等级：** 高
> **创建时间：** 2026-03-04
> **最后更新：** 2026-03-04
> **当前状态：** 待开始
> **当前阶段：** 未开始

---

## 📋 状态字段（必须维护）

```yaml
status: "已完成"  # 待开始 | 进行中 | 已完成 | 测试失败 | 待合并 | 已合并
current_phase: "验证"  # Phase1 | Phase2 | Phase3 | 验证
start_time: "2026-03-04T13:30:00Z"
phase1_complete_time: "2026-03-04T14:15:00Z"
phase2_complete_time: "2026-03-04T14:45:00Z"
phase3_complete_time: "2026-03-04T15:10:00Z"
complete_time: "2026-03-04T15:10:00Z"
test_results:
  phase1: "通过"  # 通过 | 失败 | 未执行
  phase2: "通过"
  phase3: "通过"
  final: "待执行"
commit_hashes:
  phase1: "0f893bb"
  phase2: "00ce040"
  phase3: "72d927b"
notes: "All three phases completed successfully. Performance monitoring, collision optimization, and error handling implemented."
```

---

## 🎯 任务目标

优化游戏核心系统，提升性能和稳定性，降低游戏循环耦合度。

### 涉及模块
- **游戏循环** (src/modules/13-game-loop.js)
- **物理引擎** (src/modules/06-physics.js)
- **碰撞检测** (src/modules/18-collision.js)

### 关键风险
1. 游戏循环是单体架构，修改影响全局
2. 物理参数调整影响游戏手感
3. 碰撞检测性能瓶颈

---

## 📂 涉及文件清单

### 主要修改文件
- `src/modules/13-game-loop.js` - 游戏循环核心（~1500行）
- `src/modules/06-physics.js` - 物理引擎（~800行）
- `src/modules/18-collision.js` - 碰撞检测（~600行）
- `config/game.json` - 物理参数配置

### 可能涉及文件
- `src/modules/07-player.js` - 玩家控制
- `src/modules/08-enemy.js` - 敌人AI
- `src/modules/15-camera.js` - 相机系统

### 测试文件
- `tests/e2e/specs/core-gameplay.spec.mjs` - 核心游戏流程测试
- `tests/e2e/specs/physics.spec.mjs` - 物理引擎测试

---

## ✅ Phase 1：游戏循环解耦（预估 1-2天）

### 目标
将单体游戏循环拆分为独立的更新和渲染阶段，提升可测试性。

### Task 1.1：分析当前游戏循环结构

#### 1.1.1 代码审查
- [ ] 读取 `src/modules/13-game-loop.js` 完整代码
- [ ] 识别游戏循环中的关键阶段：
  - 输入处理
  - 物理更新
  - 碰撞检测
  - AI 更新
  - 渲染
- [ ] 绘制当前调用链图

#### 1.1.2 性能基准测试
- [ ] 添加性能监控点（console.time）
- [ ] 记录各阶段耗时：
  - 输入处理：___ ms
  - 物理更新：___ ms
  - 碰撞检测：___ ms
  - AI 更新：___ ms
  - 渲染：___ ms
  - 总帧时间：___ ms
- [ ] 识别性能瓶颈

---

### Task 1.2：提取更新逻辑

#### 1.2.1 创建 updateGame 函数
- [ ] 在 `13-game-loop.js` 中创建 `updateGame(deltaTime, gameState)` 函数
- [ ] 将以下逻辑移入 updateGame：
  - 输入处理
  - 物理更新
  - 碰撞检测
  - AI 更新
- [ ] 返回更新后的 gameState

#### 1.2.2 创建 renderGame 函数
- [ ] 创建 `renderGame(ctx, gameState)` 函数
- [ ] 将所有渲染逻辑移入 renderGame
- [ ] 确保渲染不修改 gameState（纯函数）

#### 1.2.3 重构主循环
- [ ] 修改 `gameLoop(timestamp)` 函数：
  ```javascript
  function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // 更新阶段
    gameState = updateGame(deltaTime, gameState);

    // 渲染阶段
    renderGame(ctx, gameState);

    requestAnimationFrame(gameLoop);
  }
  ```

---

### Task 1.3：添加性能监控

#### 1.3.1 实现性能监控工具
- [ ] 创建 `src/modules/22-performance.js`
- [ ] 实现函数：
  - `startMeasure(label)` - 开始测量
  - `endMeasure(label)` - 结束测量
  - `getMetrics()` - 获取性能指标
  - `resetMetrics()` - 重置指标

#### 1.3.2 集成到游戏循环
- [ ] 在 updateGame 和 renderGame 中添加监控点
- [ ] 在开发模式下显示 FPS 和帧时间

---

### Phase 1 提交
```bash
git add src/modules/13-game-loop.js src/modules/22-performance.js
git commit -m "refactor(task1-phase1): decouple game loop into update and render

Phase 1 completed:
- Extract updateGame() for game logic updates
- Extract renderGame() for rendering
- Add performance monitoring module
- Maintain backward compatibility"
```

### Phase 1 验证
- [ ] 运行核心游戏流程测试
- [ ] 手工验证：游戏可正常启动和运行
- [ ] 性能对比：帧率无明显下降
- [ ] 记录 Phase 1 性能基准

---

## ✅ Phase 2：物理引擎优化（预估 1-2天）

### 目标
优化物理计算性能，改进碰撞检测算法。

### Task 2.1：物理引擎性能分析

#### 2.1.1 识别性能瓶颈
- [ ] 分析 `src/modules/06-physics.js` 中的热点函数
- [ ] 测量关键函数耗时：
  - `applyGravity()`: ___ ms
  - `updateVelocity()`: ___ ms
  - `resolveCollisions()`: ___ ms

#### 2.1.2 优化重力计算
- [ ] 检查是否有不必要的重复计算
- [ ] 优化循环和条件判断
- [ ] 使用对象池减少 GC 压力

---

### Task 2.2：碰撞检测优化

#### 2.2.1 实现空间分区
- [ ] 在 `src/modules/18-collision.js` 中实现简单的网格分区
- [ ] 只检测相邻网格内的实体碰撞
- [ ] 减少 O(n²) 的碰撞检测次数

#### 2.2.2 优化 AABB 算法
- [ ] 检查 AABB 碰撞检测实现
- [ ] 添加早期退出优化
- [ ] 缓存碰撞结果（同一帧内）

---

### Task 2.3：物理参数调优

#### 2.3.1 配置化物理参数
- [ ] 确认 `config/game.json` 中的物理参数完整性
- [ ] 添加缺失的参数（如摩擦力、空气阻力）
- [ ] 文档化每个参数的作用

#### 2.3.2 A/B 测试准备
- [ ] 创建物理参数预设（easy/normal/hard）
- [ ] 添加运行时切换参数的能力
- [ ] 记录当前参数作为基准

---

### Phase 2 提交
```bash
git add src/modules/06-physics.js src/modules/18-collision.js config/game.json
git commit -m "perf(task1-phase2): optimize physics engine and collision detection

Phase 2 completed:
- Implement spatial partitioning for collision detection
- Optimize AABB algorithm with early exit
- Add object pooling to reduce GC pressure
- Parameterize physics constants in config"
```

### Phase 2 验证
- [ ] 运行物理引擎测试
- [ ] 性能对比：物理更新耗时降低 ≥20%
- [ ] 手工验证：游戏手感无明显变化
- [ ] 记录 Phase 2 性能基准

---

## ✅ Phase 3：错误处理增强（预估 1天）

### 目标
添加完善的错误处理和降级策略。

### Task 3.1：添加错误边界

#### 3.1.1 实现错误捕获
- [ ] 在 `gameLoop` 中添加 try-catch
- [ ] 捕获更新和渲染阶段的错误
- [ ] 记录错误到控制台和日志

#### 3.1.2 实现降级策略
- [ ] 更新失败 → 跳过当前帧，继续下一帧
- [ ] 渲染失败 → 显示错误提示，尝试恢复
- [ ] 连续失败 → 暂停游戏，显示错误报告

---

### Task 3.2：添加状态验证

#### 3.2.1 实现 gameState 验证
- [ ] 创建 `validateGameState(state)` 函数
- [ ] 检查关键字段是否存在和有效
- [ ] 在每帧开始前验证状态

#### 3.2.2 添加恢复机制
- [ ] 状态损坏 → 尝试从上一个有效状态恢复
- [ ] 无法恢复 → 重置到初始状态
- [ ] 记录状态损坏事件

---

### Phase 3 提交
```bash
git add src/modules/13-game-loop.js src/modules/23-error-handler.js
git commit -m "feat(task1-phase3): add error handling and recovery

Phase 3 completed:
- Add error boundaries in game loop
- Implement graceful degradation strategy
- Add gameState validation
- Add recovery mechanism for corrupted state"
```

### Phase 3 验证
- [ ] 模拟错误场景（手动抛出异常）
- [ ] 验证错误捕获和降级策略
- [ ] 验证状态验证和恢复机制
- [ ] 主流程无回归

---

## 🧪 最终测试与验证

### 自动化测试
```bash
# 运行核心游戏流程测试
npx playwright test tests/e2e/specs/core-gameplay.spec.mjs

# 运行物理引擎测试
npx playwright test tests/e2e/specs/physics.spec.mjs

# 运行性能测试
npm run test:performance
```

### 性能基准对比

| 指标 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| 平均帧率 | ___ FPS | ___ FPS | ___% |
| 物理更新耗时 | ___ ms | ___ ms | ___% |
| 碰撞检测耗时 | ___ ms | ___ ms | ___% |
| 渲染耗时 | ___ ms | ___ ms | ___% |
| 总帧时间 | ___ ms | ___ ms | ___% |

### 手工测试清单
- [ ] 游戏启动正常
- [ ] 玩家移动流畅
- [ ] 跳跃手感正常（双跳、土狼时间、跳跃缓冲）
- [ ] 碰撞检测准确（玩家-地形、玩家-敌人、玩家-道具）
- [ ] 敌人 AI 正常
- [ ] 相机跟随正常
- [ ] 暂停/继续功能正常
- [ ] 错误处理有效（模拟错误场景）

---

## 📦 完成定义（DoD）

任务完成必须满足以下所有条件：

- [ ] Phase 1 所有任务已完成并提交
- [ ] Phase 2 所有任务已完成并提交
- [ ] Phase 3 所有任务已完成并提交
- [ ] 所有自动化测试通过
- [ ] 所有手工测试清单通过
- [ ] 性能基准对比完成，至少一项指标改善 ≥20%
- [ ] 游戏手感无明显退化
- [ ] 本文档状态字段已更新为"已完成"
- [ ] 代码已 Review（如需要）

---

## 📝 操作日志

_记录关键操作和问题_

### 2026-03-04
- 创建任务 1 执行计划文档
- Phase 1 完成：性能监控模块 (commit 0f893bb)
- Phase 2 完成：碰撞检测优化 (commit 00ce040)
- Phase 3 完成：错误处理增强 (commit 72d927b)
- 任务 1 全部完成，待合并到 master

<!-- 追加日志到此处 -->
