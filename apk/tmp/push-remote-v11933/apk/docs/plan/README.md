# 并行开发计划文档总览

> **创建时间：** 2026-03-04
> **最后更新：** 2026-03-04

---

## 📁 文档结构说明

本次并行开发共生成 **6 个计划文档**，分工明确，避免文档冲突：

### 1. 总览文档（只读参考）
- **[2026-03-04-parallel-development-plan.md](2026-03-04-parallel-development-plan.md)**
  - 任务依赖分析矩阵
  - 文件冲突分析
  - 并行组划分逻辑
  - 整体架构说明
  - **用途：** 各 Agent 参考，不修改

### 2. 主分支合并控制文档（Master Agent 管理）
- **[2026-03-04-master-merge-control.md](2026-03-04-master-merge-control.md)**
  - Worktree 状态监控
  - 合并决策逻辑
  - 合并前检查清单
  - 合并记录
  - 异常处理流程
  - **管理者：** Master Agent（主分支）
  - **更新频率：** 每次 worktree 状态变化时

### 3. Worktree 独立计划文档（各 Worktree Agent 管理）

#### 3.1 Worktree A（账号统计增强）
- **[worktree-A-account-stats-plan.md](worktree-A-account-stats-plan.md)**
  - 4 个任务清单（正确率、趋势、周对比、成就）
  - 涉及文件：`08-account.js`, `01-config.js`, `Game.html`
  - **管理者：** Worktree-A Agent
  - **提交策略：** 每完成一个任务提交一次，所有任务完成后打包

#### 3.2 Worktree B（存档与UI增强）
- **[worktree-B-save-ui-plan.md](worktree-B-save-ui-plan.md)**
  - 2 个任务清单（备份/恢复快捷入口、弱词入口占位）
  - 涉及文件：`08-account.js`, `09-vocab.js`, `Game.html`
  - **管理者：** Worktree-B Agent
  - **提交策略：** 每完成一个任务提交一次，所有任务完成后打包

#### 3.3 Worktree C（PWA 基础设施）
- **[worktree-C-pwa-plan.md](worktree-C-pwa-plan.md)**
  - 2 个任务清单（SW 注册、版本化缓存）
  - 涉及文件：`17-bootstrap.js`, `service-worker.js`, `version.json`
  - **管理者：** Worktree-C Agent
  - **提交策略：** 每完成一个任务提交一次，所有任务完成后打包

#### 3.4 Worktree D（音频系统串行开发）
- **[worktree-D-audio-system-plan.md](worktree-D-audio-system-plan.md)**
  - 3 个阶段（D1/D2/E），共 8 个任务
  - 涉及文件：`03-audio.js`, `16-events.js`, `12-challenges.js`, `src/tts/*`
  - **管理者：** Worktree-D Agent
  - **提交策略：** 每完成一个阶段提交一次并打包一次（共 3 次打包）

---

## 🔄 Agent 协作流程

### 阶段 1：并行开发启动

1. **Master Agent** 创建 4 个 worktree：
   ```bash
   git worktree add ../worktree-A feature/parallel-account-stats
   git worktree add ../worktree-B feature/parallel-save-ui
   git worktree add ../worktree-C feature/parallel-pwa
   git worktree add ../worktree-D feature/serial-audio-system
   ```

2. **Master Agent** 更新 `2026-03-04-master-merge-control.md`：
   - 将 4 个 worktree 状态标记为"进行中"
   - 记录创建时间

3. **各 Worktree Agent** 在各自 worktree 中开始工作：
   - Worktree-A Agent → `worktree-A-account-stats-plan.md`
   - Worktree-B Agent → `worktree-B-save-ui-plan.md`
   - Worktree-C Agent → `worktree-C-pwa-plan.md`
   - Worktree-D Agent → `worktree-D-audio-system-plan.md`

### 阶段 2：任务执行与状态更新

**各 Worktree Agent 的工作循环：**

```
WHILE (任务未全部完成) {
  1. 读取自己的计划文档
  2. 执行下一个任务
  3. 完成后提交 git（标注进展）
  4. 更新计划文档中的 checkbox
  5. 更新状态字段
  6. 如果所有任务完成：
     - 运行测试
     - 打包备份
     - 更新状态为"已完成"
     - 通知 Master Agent
}
```

**Master Agent 的监控循环：**

```
WHILE (有 worktree 未合并) {
  1. 读取 2026-03-04-master-merge-control.md
  2. 检查各 worktree 状态
  3. 如果有 worktree 状态为"已完成"：
     - 检查测试结果
     - 检查备份文件
     - 标记为"待合并"
     - 执行合并流程
  4. 更新合并控制文档
}
```

### 阶段 3：合并与验证

**Master Agent 合并流程：**

1. 按优先级顺序合并（A → B → C → D）
2. 每次合并前：
   - 读取 `2026-03-04-master-merge-control.md` 中的检查清单
   - 执行合并前检查
3. 合并后：
   - 运行全量回归测试
   - 更新合并记录
   - 更新 worktree 状态为"已合并"

---

## 📊 文档更新规则

### 各 Agent 只能修改自己管理的文档

| Agent | 可写文档 | 只读文档 |
|-------|---------|---------|
| Master Agent | `2026-03-04-master-merge-control.md` | 所有 worktree 计划文档 |
| Worktree-A Agent | `worktree-A-account-stats-plan.md` | 总览文档、合并控制文档 |
| Worktree-B Agent | `worktree-B-save-ui-plan.md` | 总览文档、合并控制文档 |
| Worktree-C Agent | `worktree-C-pwa-plan.md` | 总览文档、合并控制文档 |
| Worktree-D Agent | `worktree-D-audio-system-plan.md` | 总览文档、合并控制文档 |

### 状态字段更新规则

**Worktree Agent 必须维护的字段：**
```yaml
status: "待开始" | "进行中" | "已完成" | "测试失败" | "待合并" | "已合并"
start_time: "2026-03-04 14:00:00"
complete_time: "2026-03-04 16:30:00"
backup_file: "worktree-A-account-stats-20260304-163000.tar.gz"
test_result: "通过" | "失败" | "未执行"
test_log: "所有测试通过"
commit_hash: "abc123def456"
notes: "遇到的问题和解决方案"
```

**Master Agent 必须维护的字段：**
- 各 worktree 的状态监控
- 合并时间戳
- 合并提交 hash
- 冲突解决记录
- 验证结果

---

## 🚨 冲突避免机制

### 文档层面
- 每个 Agent 只写自己的文档 ✓
- Master Agent 只读 worktree 文档，不修改 ✓
- Worktree Agent 只读合并控制文档，不修改 ✓

### 代码层面
- Worktree A/B/C 并行开发，文件无交集 ✓
- Worktree D 内部串行（D1 → D2 → E），避免自我冲突 ✓
- 合并时按优先级顺序，逐个验证 ✓

### 通信机制
- Worktree Agent 完成后通过**状态字段**通知 Master Agent
- Master Agent 通过**读取状态字段**判断是否可以合并
- 无需实时通信，通过文档状态同步 ✓

---

## 📝 快速导航

### 我是 Master Agent，我应该：
1. 读取 [2026-03-04-master-merge-control.md](2026-03-04-master-merge-control.md)
2. 创建 4 个 worktree
3. 监控各 worktree 状态
4. 执行合并流程
5. 更新合并记录

### 我是 Worktree-A Agent，我应该：
1. 读取 [worktree-A-account-stats-plan.md](worktree-A-account-stats-plan.md)
2. 在 `../worktree-A/` 目录工作
3. 完成 4 个任务，每个任务提交一次 git
4. 所有任务完成后打包备份
5. 更新状态为"已完成"

### 我是 Worktree-B Agent，我应该：
1. 读取 [worktree-B-save-ui-plan.md](worktree-B-save-ui-plan.md)
2. 在 `../worktree-B/` 目录工作
3. 完成 2 个任务，每个任务提交一次 git
4. 所有任务完成后打包备份
5. 更新状态为"已完成"

### 我是 Worktree-C Agent，我应该：
1. 读取 [worktree-C-pwa-plan.md](worktree-C-pwa-plan.md)
2. 在 `../worktree-C/` 目录工作
3. 完成 2 个任务，每个任务提交一次 git
4. 所有任务完成后打包备份
5. 更新状态为"已完成"

### 我是 Worktree-D Agent，我应该：
1. 读取 [worktree-D-audio-system-plan.md](worktree-D-audio-system-plan.md)
2. 在 `../worktree-D/` 目录工作
3. 完成 3 个阶段（D1 → D2 → E），每个阶段提交一次 git 并打包一次
4. 所有阶段完成后更新状态为"已完成"

---

## ✅ 最终交付物

1. **代码交付：**
   - 主分支包含所有功能
   - 所有测试通过
   - 无已知回归问题

2. **备份交付：**
   - Worktree A: 1 个备份文件
   - Worktree B: 1 个备份文件
   - Worktree C: 1 个备份文件
   - Worktree D: 3 个备份文件（D1/D2/E 各一个）
   - 共 6 个备份文件，归档到 `docs/archive/2026-03-04-parallel-dev-backups/`

3. **文档交付：**
   - 所有计划文档的 checkbox 已勾选
   - 所有状态字段已填写
   - 合并记录完整
   - 历史教训已更新到 `tasks/lessons.md`

---

## 🎯 下一步行动

**请确认以上文档结构和协作流程是否符合预期。**

确认后，我将：
1. 创建备份目录 `docs/archive/2026-03-04-parallel-dev-backups/`
2. 等待你的指令开始执行（创建 worktree 或启动各 Agent）
