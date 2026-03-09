# 并行开发任务总览

> **创建时间：** 2026-03-04
> **最后更新：** 2026-03-04
> **扫描包来源：** docs/scan/2026-03-04-full-codebase-scan/

---

## 📊 任务概览

基于代码库扫描结果（M4 全量扫描），将后续开发工作拆分为 3 个独立任务。

| 任务ID | 任务名称 | 优先级 | 工作量 | 风险 | 状态 | 依赖 |
|--------|---------|--------|--------|------|------|------|
| TASK-1 | [核心系统优化](task-1-core-system-optimization.md) | 高 | 3-5天 | 高 | 待开始 | 无 |
| TASK-2 | [存储与配置增强](task-2-storage-config-enhancement.md) | 中 | 2-3天 | 中 | 待开始 | 无 |
| TASK-3 | [词汇与音频改进](task-3-vocab-audio-improvement.md) | 低 | 2-3天 | 低 | 待开始 | TASK-1 |

**并行策略**：
- ✓ TASK-1 和 TASK-2 可并行执行（文件无交集）
- ⚠️ TASK-3 依赖 TASK-1 完成（共享游戏循环）

---

## 🎯 任务详情

### TASK-1：核心系统优化

**目标**：优化游戏核心系统，提升性能和稳定性。

**涉及模块**：
- 游戏循环 (13-game-loop.js)
- 物理引擎 (06-physics.js)
- 碰撞检测 (18-collision.js)

**关键改进**：
- 游戏循环解耦（更新/渲染分离）
- 物理引擎性能优化（空间分区）
- 错误处理增强

**预期收益**：
- 性能提升 ≥20%
- 可测试性提升
- 稳定性提升

**详细计划**：[task-1-core-system-optimization.md](task-1-core-system-optimization.md)

---

### TASK-2：存储与配置增强

**目标**：增强存档系统可靠性和配置加载健壮性。

**涉及模块**：
- 存储系统 (storage.js)
- 配置加载 (01-config.js)
- 存档管理 (19-save.js)

**关键改进**：
- 存档版本管理和迁移
- 存档压缩（减少 30%+ 大小）
- LocalStorage 配额检测
- 配置加载错误处理
- 存档损坏自动恢复

**预期收益**：
- 存档可靠性提升
- 存档大小减少 ≥30%
- 配置加载容错性提升

**详细计划**：[task-2-storage-config-enhancement.md](task-2-storage-config-enhancement.md)

---

### TASK-3：词汇与音频改进

**目标**：改进词汇学习系统和音频体验。

**涉及模块**：
- 词汇系统 (04-vocab.js)
- 音频系统 (03-audio.js)
- UI系统 (10-ui.js)

**关键改进**：
- TTS 测试和诊断工具
- 挑战音效
- 词汇旋转算法优化（间隔重复）
- 学习统计和进度追踪
- UI 优化

**预期收益**：
- 词汇重复率降低
- 学习效果提升
- 用户体验改善

**依赖**：必须等待 TASK-1 完成（共享游戏循环代码）

**详细计划**：[task-3-vocab-audio-improvement.md](task-3-vocab-audio-improvement.md)

---

## 📂 文件改动矩阵

| 文件 | TASK-1 | TASK-2 | TASK-3 | 冲突风险 |
|------|--------|--------|--------|----------|
| src/modules/13-game-loop.js | ✓ 主要 | - | ✓ 次要 | 中（TASK-3 依赖 TASK-1） |
| src/modules/06-physics.js | ✓ 主要 | - | - | 无 |
| src/modules/18-collision.js | ✓ 主要 | - | - | 无 |
| src/storage.js | - | ✓ 主要 | - | 无 |
| src/modules/01-config.js | - | ✓ 主要 | - | 无 |
| src/modules/19-save.js | - | ✓ 主要 | - | 无 |
| src/modules/04-vocab.js | - | - | ✓ 主要 | 无 |
| src/modules/03-audio.js | - | - | ✓ 主要 | 无 |
| src/modules/10-ui.js | - | - | ✓ 主要 | 无 |
| config/game.json | ✓ 次要 | - | - | 无 |
| Game.html | - | - | ✓ 次要 | 无 |

**结论**：TASK-1 和 TASK-2 完全无文件交集，可安全并行。

---

## 🔄 执行流程

### 阶段 1：并行启动（Day 1）

**同时启动**：
- TASK-1 Phase 1：游戏循环解耦
- TASK-2 Phase 1：存档系统增强

**预期产出**：
- TASK-1：游戏循环拆分完成
- TASK-2：存档版本管理完成

---

### 阶段 2：并行推进（Day 2-3）

**继续并行**：
- TASK-1 Phase 2：物理引擎优化
- TASK-2 Phase 2：配置加载增强

**预期产出**：
- TASK-1：物理性能提升 ≥20%
- TASK-2：配置加载容错完成

---

### 阶段 3：收尾与验证（Day 4-5）

**TASK-1 收尾**：
- Phase 3：错误处理增强
- 最终测试与验证

**TASK-2 收尾**：
- Phase 3：错误恢复机制
- 最终测试与验证

**预期产出**：
- TASK-1 完成并通过所有测试
- TASK-2 完成并通过所有测试

---

### 阶段 4：TASK-3 启动（Day 6+）

**前置条件**：TASK-1 必须完成

**执行**：
- TASK-3 Phase 1：音频系统增强
- TASK-3 Phase 2：词汇系统改进
- TASK-3 Phase 3：UI 改进

**预期产出**：
- TASK-3 完成并通过所有测试

---

## ✅ 全局完成定义（DoD）

所有任务完成必须满足：

### 代码质量
- [ ] 所有任务的自动化测试通过
- [ ] 所有任务的手工测试清单通过
- [ ] 代码已 Review（如需要）
- [ ] 无明显的代码异味

### 性能指标
- [ ] TASK-1：性能提升 ≥20%
- [ ] TASK-2：存档大小减少 ≥30%
- [ ] TASK-3：词汇重复率 <10%

### 文档更新
- [ ] 所有任务计划文档状态已更新
- [ ] CLAUDE.md 已更新（如有架构变更）
- [ ] 操作日志已记录

### 集成验证
- [ ] 三个任务集成后无冲突
- [ ] 完整回归测试通过
- [ ] 主流程无退化

---

## 🧪 集成测试计划

### 测试环境
- 浏览器：Chrome, Firefox, Safari, Edge
- 设备：桌面、平板、手机
- 操作系统：Windows, macOS, Android, iOS

### 测试场景
1. **核心游戏流程**
   - 启动游戏 → 进入关卡 → 收集词汇 → 完成关卡 → 保存进度

2. **存档系统**
   - 保存游戏 → 退出 → 重新加载 → 验证进度

3. **词汇学习**
   - 收集词汇 → 听发音 → 查看统计 → 切换词汇包

4. **配置管理**
   - 修改设置 → 保存 → 重新加载 → 验证设置

5. **错误恢复**
   - 模拟存档损坏 → 验证自动恢复
   - 模拟配置加载失败 → 验证 fallback
   - 模拟游戏循环错误 → 验证降级策略

---

## 📊 进度追踪

### 任务状态看板

| 任务 | Phase 1 | Phase 2 | Phase 3 | 验证 | 状态 |
|------|---------|---------|---------|------|------|
| TASK-1 | ⬜ 待开始 | ⬜ 待开始 | ⬜ 待开始 | ⬜ 待开始 | 待开始 |
| TASK-2 | ⬜ 待开始 | ⬜ 待开始 | ⬜ 待开始 | ⬜ 待开始 | 待开始 |
| TASK-3 | ⬜ 待开始 | ⬜ 待开始 | ⬜ 待开始 | ⬜ 待开始 | 待开始 |

**图例**：⬜ 待开始 | 🟦 进行中 | ✅ 已完成 | ❌ 失败

### 更新规则
- 每个任务的负责人更新各自任务文档的状态字段
- 每日同步更新本总览文档的进度看板
- 遇到阻塞问题立即在操作日志中记录

---

## 🚨 风险管理

### 已识别风险

| 风险ID | 风险描述 | 影响 | 概率 | 缓解措施 | 负责任务 |
|--------|---------|------|------|----------|----------|
| R1 | 游戏循环重构导致性能退化 | 高 | 中 | 性能基准测试 + 分阶段发布 | TASK-1 |
| R2 | 存档迁移失败导致用户进度丢失 | 高 | 低 | 完整的备份机制 + 充分测试 | TASK-2 |
| R3 | TASK-3 与 TASK-1 集成冲突 | 中 | 中 | TASK-3 等待 TASK-1 完成 | TASK-3 |
| R4 | TTS 在某些浏览器不可用 | 中 | 中 | Fallback 机制 + 诊断工具 | TASK-3 |
| R5 | 物理参数调整影响游戏平衡 | 中 | 高 | A/B 测试 + 可回滚配置 | TASK-1 |

### 应急预案
- **性能退化**：回滚到优化前版本，重新评估优化方案
- **存档损坏**：启用自动恢复机制，必要时提供手动恢复工具
- **集成冲突**：暂停 TASK-3，优先解决冲突
- **测试失败**：暂停合并，修复问题后重新测试

---

## 📝 操作日志

_记录全局关键操作和问题_

### 2026-03-04
- 完成代码库 M4 全量扫描
- 创建三个并行任务计划文档
- 创建任务总览文档

<!-- 追加日志到此处 -->

---

## 📚 参考文档

- [扫描包](../scan/2026-03-04-full-codebase-scan/)
  - [00-scan-meta.json](../scan/2026-03-04-full-codebase-scan/00-scan-meta.json)
  - [01-architecture.md](../scan/2026-03-04-full-codebase-scan/01-architecture.md)
  - [02-dataflow.md](../scan/2026-03-04-full-codebase-scan/02-dataflow.md)
  - [03-api-surface.md](../scan/2026-03-04-full-codebase-scan/03-api-surface.md)
  - [04-reference-constraints.md](../scan/2026-03-04-full-codebase-scan/04-reference-constraints.md)
  - [05-impact-matrix.md](../scan/2026-03-04-full-codebase-scan/05-impact-matrix.md)
  - [06-exec-brief.md](../scan/2026-03-04-full-codebase-scan/06-exec-brief.md)
  - [scan.db](../scan/2026-03-04-full-codebase-scan/scan.db)
- [CLAUDE.md](../../CLAUDE.md)
- [历史教训](../../tasks/lessons.md)
