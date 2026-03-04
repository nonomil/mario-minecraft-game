# claude-workflow-parallel｜多功能并行开发流程

> 本文档中的所有规则遵循 `claude-workflow-constants.md` 中的全局约束
> 触发条件：任务数 ≥ 2 且可解耦，需要多个 worktree 同时开发
> 入口：从 `claude.md` 场景路由跳转至此
> 注意：并行开发通常也是复杂模式，先完成 `claude-workflow-complex.md` Phase 1-4.5 再进入此文档
> **路径常量**：本文档中所有 worktree 路径使用 `[WORKTREE_BASE]` 占位符，实际值读取 `claude-workflow-constants.md` 中的 `WORKTREE_BASE` 常量（默认：`worktrees`）
> **分支模式**：根据 `BRANCH_MODE` 常量调整行为（`temporary` = 临时分支模式，`bare` = Bare Repo 模式）

---

## 核心原则

- **解耦是前提**：未通过解耦审查，不得创建 worktree 开始并行
- **Codex 长上下文优势**：每个 worktree 的 Codex Session 独立，互不干扰
- **文件边界即任务边界**：两个任务不得同时修改同一文件
- **文件影响范围表必须产出**：进入 Phase 2 前，必须有一张表列明每个任务允许改动的路径、共享文件及 owner
- **共享文件唯一 owner**：有共享文件时必须指定唯一 owner，非 owner 任务不得修改该文件
- **合并顺序**：先合并无共享文件任务，最后合并共享文件 owner 任务

---

## 并行开发流程（3阶段）

### Phase 1：解耦确认（来自 complex 流程 Phase 4.5）

必须满足以下全部条件才能开始并行：

```markdown
## 解耦确认清单
- [ ] 每个任务的修改文件列表互不重叠（或重叠部分已明确声明 owner 并排定串行顺序）
- [ ] 任务依赖关系形成 DAG（无循环依赖）
- [ ] 每个任务有独立的 *-steps.md 文件
- [ ] 并行批次已确定（哪些可同时跑，哪些必须串行）
- [ ] 已产出文件影响范围表（含共享文件 owner 指定）
- [ ] 用户已确认"开始开发"
```

文件影响范围表（必须产出）：

- 模板：`docs/templates/parallel-impact-scope-template.md`
- 产物：`docs/development/[feature]-impact-scope.md`
- 复制命令（Windows PowerShell）：
```powershell
Copy-Item docs/templates/parallel-impact-scope-template.md docs/development/[feature]-impact-scope.md
```

让 Opus/CC 在拆任务时同步产出，在 prompt 里加：
```text
同时输出文件影响范围表，列格式固定为：
任务 | worktree | 允许改动路径 | 共享文件（无则填"-"）| owner（无共享文件则填"-"）。
若存在共享文件，必须指定唯一 owner，并声明非 owner 禁止修改。
```

并行执行计划表（来自 Plan 文档）：

| 批次 | 任务 | Worktree | 依赖 |
|------|------|----------|------|
| 批次1（并行） | task-1, task-2 | [WORKTREE_BASE]/task-1, [WORKTREE_BASE]/task-2 | 无 |
| 批次2（串行） | task-3 | [WORKTREE_BASE]/task-3 | 批次1完成 |

---

### Phase 2：创建 Worktree + 分配任务

先执行仓库状态门禁（必须）：

```bash
cd [DEV_DIR]
git status --short
```

若存在未提交改动：
- 停止创建 worktree，先向用户汇报改动列表
- 让用户选择：提交 / 暂存（仅用户明确同意）/ 放弃（高风险，需明确确认）

仅在仓库状态可继续时，执行：

**根据 BRANCH_MODE 选择创建方式：**

### 若 BRANCH_MODE = temporary（临时分支模式）

```bash
cd [DEV_DIR]

# 按批次创建（批次1示例）
git worktree add [WORKTREE_BASE]/task-1 -b feat/[feature]-task-1
git worktree add [WORKTREE_BASE]/task-2 -b feat/[feature]-task-2

git worktree list   # 验证
```

### 若 BRANCH_MODE = bare（Bare Repo 模式）

在 Bare Repo 模式下，worktree 直接创建在项目根目录下（平铺结构）：

```bash
cd [PROJECT_ROOT]   # 注意：不是 [DEV_DIR]，而是项目根目录

# 按批次创建（批次1示例）
# 直接在根目录下创建分支文件夹
git worktree add task-1 -b feat/[feature]-task-1
git worktree add task-2 -b feat/[feature]-task-2

git worktree list   # 验证
```

**目录结构对比：**

| 模式 | 创建的 worktree 路径 |
|------|---------------------|
| temporary | `[PROJECT_ROOT]/worktrees/task-1/` |
| bare | `[PROJECT_ROOT]/task-1/` |

每个 worktree 独立启动 Codex Session：

**Session cwd 根据 BRANCH_MODE 设置：**

| BRANCH_MODE | Codex Session cwd |
|-------------|-------------------|
| temporary | `[DEV_DIR]/[WORKTREE_BASE]/task-1` |
| bare | `[PROJECT_ROOT]/task-1` |

```
# worktree-task-1 的 Codex Session
mcp__codex__codex({
  model: "gpt-5.3-codex",
  sandbox: "danger-full-access",
  "approval-policy": "on-failure",
  cwd: "[根据 BRANCH_MODE 选择上方对应路径]",
  prompt: "
    ## Context
    - 技术栈：[语言/框架/版本]
    - Steps 文档：docs/development/[feature]-task-1-steps.md
    - 本 worktree 负责的任务：[task-1 描述]
    - 不得修改的文件：[task-2 负责的文件列表]

    ## Task
    按 steps 文档逐任务执行，每个任务完成后 git commit，然后继续下一个。

    ## Constraints
    - 范围：仅限 steps 文档中指定的文件
    - 不引入新依赖
    - 每次 commit 前确认 diff ≤ 200 行

    ## Acceptance
    - [ ] 所有任务完成并提交
    - [ ] pytest / npm test 全部通过
  "
})
// 保存 threadId-task-1
```

**每个 worktree 内部的 TDD 执行循环遵循 `AI开发-PLan-Program-Debug-Claude和Codex协作/05-ClaudeCode+Codex+Git Worktree-功能分支开发流程模板.md` Phase 3，包括：**
- 步骤 3.1：CC Plan Mode 搜索现有代码，回答 Linus 三问
- 步骤 3.4.5：每个任务完成后必须执行多轮 Review（CC 轮次1 + Codex 轮次2），连续 2 轮无新问题才可提交
- Diff 上限：每次 commit 前 `git diff --stat` 确认 ≤ 200 行

---

### Phase 3：监控 + 合并

**CC 监控各 worktree 进度：**

根据 `BRANCH_MODE` 选择正确的路径：

```bash
# 若 BRANCH_MODE = temporary:
git -C [DEV_DIR]/[WORKTREE_BASE]/task-1 log --oneline -5
git -C [DEV_DIR]/[WORKTREE_BASE]/task-2 log --oneline -5

# 若 BRANCH_MODE = bare:
git -C [PROJECT_ROOT]/task-1 log --oneline -5
git -C [PROJECT_ROOT]/task-2 log --oneline -5
```

**批次1完成后，串行执行批次2：**
- 确认批次1所有 worktree 测试通过
- 创建批次2的 worktree
- 批次2的 Codex Session 可以读取批次1的产出

**合并顺序（由 CC 决定）：**

在执行任何 `git merge --no-ff` 之前，必须先输出并等待用户回复"确认合并"：

```
即将合并 [BRANCH_NAME] → main，变更摘要：

变更文件（N 个）：[列表]
Commit 列表（N 条）：[列表]
CI 状态：✅ 通过 / ❌ 未通过 / ⏳ 未验证

请回复"确认合并"后执行。
```

合并前范围门禁（每个任务分支都要执行）：

```bash
python .claude/scripts/verify_parallel_scope.py \
  --table docs/development/[feature]-impact-scope.md \
  --task task-1 \
  --base main
```
注：若仓库默认主分支不是 `main`（如 `master`/`develop`），请替换 `--base` 参数。

规则：
- 返回非 0（失败）时，禁止执行 merge
- 必须先修复范围越界或 owner 冲突，再次校验
- 通过后再执行“确认合并”流程

```bash
cd [DEV_DIR]
git switch main
git pull --ff-only

# 按依赖顺序合并
git merge --no-ff feat/[feature]-task-1 -m "feat: merge task-1"
# 运行测试确认无回归
pytest / npm test

git merge --no-ff feat/[feature]-task-2 -m "feat: merge task-2"
# 运行测试确认无回归

# 清理 worktree（根据 BRANCH_MODE 选择路径）

## 若 BRANCH_MODE = temporary:
git worktree remove [WORKTREE_BASE]/task-1
git worktree remove [WORKTREE_BASE]/task-2

## 若 BRANCH_MODE = bare:
git worktree remove task-1
git worktree remove task-2

git branch -d feat/[feature]-task-1 feat/[feature]-task-2
```

**冲突处理：**
- 出现冲突 → 立即停止自动合并，CC 先汇报冲突文件与原因（解耦不充分？）
- 冲突必须人工处理，不允许 Codex 自动批量解冲突后直接提交
- 解决冲突后重新运行全量测试与关键 E2E
- 冲突频繁 → 回到解耦审查，重新拆分任务

---

## Session 管理（防止降智）

```
# 每个 worktree 保存各自的 threadId
# threadId-task-1 = "xxx-1"
# threadId-task-2 = "xxx-2"

# 单个 Session 执行超过 3 个任务 → 开新 Session，重新提供 context
# 发现明显低质量输出 → 立即重启 Session
```

---

## 止损规则

- 并行中发现文件冲突 → 停止，回到解耦审查重新拆分
- 某个 worktree Codex 连续失败 3 次 → CC 接管该 worktree，手动处理
- 合并冲突超过 3 处 → 停止合并，分析根因，考虑串行化

---

## 补充：完整发布流程扩展（参考 reference/06）

> 以下阶段补充并行开发完成合并后的完整发布流程，与上方 Phase 1-3 衔接。
> 占位符说明见 reference/06 前置信息表。

---

### Phase 0：读取 Plan 文档

```bash
cat [PLAN_FILE]
```

进入并行开发前必须确认：

- [ ] 所有任务数量和顺序
- [ ] 每个任务涉及的文件路径
- [ ] 测试命令和预期结果
- [ ] 任务间的依赖关系

---

### Phase 1 补充：未提交改动的完整处理

现有 Phase 2 已包含门禁检查，此处补充完整的三选项流程和风险说明：

| 选项 | 命令 | 风险 | 前提 |
|------|------|------|------|
| A 提交 | `git add -A && git commit -m "chore: save wip before [BRANCH_NAME]"` | 低 | 改动是完整功能 |
| B 暂存 | `git stash -u -m "wip: before [BRANCH_NAME]"` | 中（`-u` 会收走未跟踪文件） | 用户明确同意 |
| C 放弃 | `git checkout -- .` | **高（不可恢复）** | 用户明确确认 |

处理后验证：`git status --short` 预期无输出。

---

### Phase 4：版本号更新 + CHANGELOG

所有并行任务合并到 main 后，统一更新版本号。

| 文件类型 | 更新方式 |
|----------|----------|
| `package.json` | `npm version minor --no-git-tag-version` |
| `version.json` | 手动编辑：新功能 minor+1，修复 patch+1，破坏性 major+1 |
| `CMakeLists.txt` | 修改 `PROJECT_VERSION_MAJOR/MINOR/PATCH` |

更新 CHANGELOG.md：

```markdown
## [新版本号] - YYYY-MM-DD

### Added
- [功能1简述]

### Fixed
- [修复1简述]
```

```bash
git add [VERSION_FILE] CHANGELOG.md
git commit -m "chore: bump version to [新版本号]"
```

---

### Phase 5：Release Notes + 推送分支

**5.1 生成 Release 说明**

创建 `docs/releases/[新版本号].md`，包含：概述、新功能、修复、技术变更、已知问题、提交记录。

```bash
git add docs/releases/[新版本号].md
git commit -m "docs: add release notes for [新版本号]"
```

**5.2 push-branch.bat（Windows 代理检测）**

在 `[DEV_DIR]` 下创建 `push-branch.bat`，核心逻辑：
- 检测当前分支（禁止在 main 上执行）
- 探测 `127.0.0.1:1080` 代理是否可用
- 代理可用 → `git -c http.proxy=... push`；不可用 → `git -c http.version=HTTP/1.1 push`

```bash
git add push-branch.bat && git commit -m "chore: add push-branch.bat"
```

**5.3 推送**

```bash
push-branch.bat   # 或 git push origin [BRANCH_NAME]
```

---

### Phase 6：CI 验证

| 构建类型 | 验证方式 |
|----------|----------|
| Android APK | 远端 CI：push 自动触发或手动 `gh run list` / `gh run watch [run_id]` 监控 |
| CMake exe | 本地：`cmake -B build` → `cmake --build build --config Debug` → `ctest -C Debug --output-on-failure` → Release 构建 |
| npm/web | 本地：`node scripts/sync-web.js` 或 `npm run build`，验证输出文件 |

失败处理：查看日志 → worktree 中修复 → push → 重新触发。

---

### Phase 7：合并到 main + 验证

```bash
cd [PROJECT_ROOT]
git switch main
git pull --ff-only origin main
git merge --no-ff [BRANCH_NAME] -m "feat: merge [BRANCH_NAME] - [功能简述]"
```

合并后运行全量测试（npm test / ctest）确认无回归。冲突处理：`git status` → 解决 → `git add && git merge --continue`。

---

### Phase 8：更新 main 版本号 + CHANGELOG

```bash
cat [VERSION_FILE]   # 确认版本号（功能分支已更新则通常无需重复）
```

更新 CHANGELOG 追加 Merged 记录：

```markdown
## [版本号] - YYYY-MM-DD

### Merged
- feat: merge [BRANCH_NAME] - [功能简述]
```

```bash
git add CHANGELOG.md && git commit -m "chore: update CHANGELOG for [版本号]"
```

---

### Phase 9：推送 main + 等待 CI

```bash
push.bat --mode auto --yes --no-pause   # 或 git push origin main
```

等待验证：
- CI APK 构建 → `gh run list --limit 5`
- GitHub Pages（如有）
- Release 页面：确认 APK 文件 + Release 说明均已发布

---

### Phase 10：总结报告 + Plan 文档勾选 + worktree 清理

**10.1 计划文档打勾**

打开 `[PLAN_FILE]`，将完成的 `[ ]` 改为 `[x]`。

**10.2 生成总结报告**

创建 `docs/development/YYYY-MM-DD-[BRANCH_NAME]-summary.md`，包含：

- 完成情况表（任务 / 状态 / 备注）
- 详细修改点（文件、函数、测试用例数）
- 遇到的问题及解决方案
- 生成的文件清单
- 构建结果（APK / exe / Pages）
- 后续建议

**10.3 清理 worktree**

```bash
cd [DEV_DIR]   # temporary 模式
# 或 cd [PROJECT_ROOT]   # bare 模式

# 根据 BRANCH_MODE 选择路径
git worktree remove [WORKTREE_BASE]/[BRANCH_NAME]   # temporary
git worktree remove [BRANCH_NAME]                   # bare

git branch -d [BRANCH_NAME]   # 可选
```

**10.4 自我改进联动（必做）**

必须将并行开发中遇到的文件冲突、依赖遗漏、解耦不足等经验写入 `tasks/lessons.md`。

> 参见 `claude-workflow-constants.md` 中的「Self-Improvement 全局规则」

---

### 合并确认清单模板

在执行任何 `git merge --no-ff` 之前，AI 必须先输出以下内容并等待用户回复"确认合并"：

```
即将合并 [BRANCH_NAME] → main，变更摘要：

变更文件（N 个）：
  M  src/xxx.js
  A  docs/releases/x.x.x.md
  ...

Commit 列表（N 条）：
  abc1234 feat: 功能描述1
  def5678 feat: 功能描述2
  ...

CI 状态：✅ 通过 / ❌ 未通过 / ⏳ 未验证

请回复"确认合并"后执行，或说明需要调整的内容。
```
