# 并行开发详细执行计划

> 生成时间：2026-03-04
> 参考来源：`docs/plans/2026-3-4-软件开发执行计划包/`
> 目标：将 vA/vB/vC/vD 四个版本重新分析，识别真正可并行的任务单元

---

## 📊 任务依赖分析矩阵

### 原始版本划分回顾

| 版本 | 优先级 | 工时 | 核心功能 | 涉及文件 |
|------|--------|------|----------|----------|
| vA | P0 | 4-6h | 设置页测试发音、档案页备份/恢复、学习统计正确率 | Game.html, 16-events.js, 08-account.js, 12-challenges.js |
| vB | P1 | 6-10h | 7天趋势、周对比、弱词入口、成就深化、挑战音效 | 08-account.js, 01-config.js, 03-audio.js, 12-challenges.js, 16-events.js |
| vC | P1 | 4-8h | TTS诊断、自检入口、SW注册、版本缓存 | 03-audio.js, 16-events.js, 17-bootstrap.js, service-worker.js |
| vD | P2 | 6-12h | TTS抽象、provider接管、mini占位、构建目标注入 | 03-audio.js, src/tts/*, scripts/sync-web.js |

### 文件冲突分析

**高冲突文件（多个版本同时修改）：**
- `03-audio.js`: vB(音效) + vC(诊断) + vD(provider重构) ⚠️ **严重冲突**
- `16-events.js`: vA(测试发音按钮) + vB(音效开关) + vC(自检按钮) ⚠️ **中度冲突**
- `08-account.js`: vA(正确率统计) + vB(趋势/成就) ⚠️ **中度冲突**
- `12-challenges.js`: vA(speakWord调用) + vB(音效触发) ⚠️ **轻度冲突**

**独立文件（无冲突）：**
- `17-bootstrap.js`: 仅 vC 修改
- `service-worker.js`: 仅 vC 修改
- `src/tts/*`: 仅 vD 新建
- `scripts/sync-web.js`: 仅 vD 修改
- `01-config.js`: 仅 vB 修改

---

## 🔄 重新划分：真正可并行的任务组

### 策略：按文件边界和依赖关系重新分组

#### **并行组 A：账号统计增强（独立）**
**包含任务：**
- vA-Task3: 学习统计正确率
- vB-Task1: 7天学习趋势
- vB-Task2: 本周 vs 上周对比
- vB-Task4: 成就维度深化

**涉及文件：**
- `08-account.js`（主要）
- `01-config.js`（成就配置）
- `Game.html`（档案页UI）

**工时预估：** 6-8h
**依赖：** 无
**验收标准：**
- [ ] 正确率显示无 NaN
- [ ] 趋势图渲染正常
- [ ] 成就进度可更新
- [ ] 回归测试通过：`opt-0226-task5-learning-stats.spec.mjs`

---

#### **并行组 B：存档与UI增强（独立）**
**包含任务：**
- vA-Task2: 档案页备份/恢复快捷入口
- vB-Task3: 弱词行动入口（占位）

**涉及文件：**
- `08-account.js`（wireProfileModal 部分）
- `09-vocab.js`（弱词逻辑占位）
- `Game.html`（档案页按钮）

**工时预估：** 2-3h
**依赖：** 无
**验收标准：**
- [ ] 档案页可直接备份/恢复
- [ ] 弱词按钮存在且有占位提示
- [ ] 回归测试通过：`opt-0226-task1-save-transfer.spec.mjs`

---

#### **并行组 C：PWA 基础设施（独立）**
**包含任务：**
- vC-Task3: 补齐 SW 注册
- vC-Task4: 版本化缓存策略

**涉及文件：**
- `17-bootstrap.js`
- `service-worker.js`
- `version.json`

**工时预估：** 3-4h
**依赖：** 无
**验收标准：**
- [ ] DevTools 可见 SW 注册
- [ ] 缓存版本号绑定正确
- [ ] 回归测试通过：`opt-0226-task7-pwa.spec.mjs`

---

#### **串行组 D1：音频系统基础（必须先完成）**
**包含任务：**
- vA-Task1: 设置页测试发音按钮（UI + 事件绑定）
- vC-Task1: TTS 诊断 API
- vC-Task2: 设置页语音自检入口

**涉及文件：**
- `03-audio.js`（增加 diagnoseTts）
- `16-events.js`（测试发音 + 自检按钮）
- `Game.html`（设置页UI）

**工时预估：** 4-5h
**依赖：** 无
**验收标准：**
- [ ] 测试发音按钮可用
- [ ] diagnoseTts 返回正确对象
- [ ] 自检UI可渲染结果

---

#### **串行组 D2：音频系统增强（依赖 D1）**
**包含任务：**
- vB-Task5: 挑战音效增强

**涉及文件：**
- `03-audio.js`（新增 playChallengeCorrectSfx/WrongSfx）
- `12-challenges.js`（答题结果触发音效）
- `16-events.js`（音效开关）
- `Game.html`（设置项）

**工时预估：** 3-4h
**依赖：** 串行组 D1 完成
**验收标准：**
- [ ] 答对/答错有不同音效
- [ ] 音效开关有效

---

#### **串行组 E：TTS Provider 重构（依赖 D1+D2）**
**包含任务：**
- vD-Task1: 创建 TTS 抽象目录
- vD-Task2: 接管 03-audio.js
- vD-Task3: 实现 mini provider 占位
- vD-Task4: 构建目标注入

**涉及文件：**
- `src/tts/index.js`（新）
- `src/tts/provider-web.js`（新）
- `src/tts/provider-apk.js`（新）
- `src/tts/provider-mini.js`（新）
- `03-audio.js`（重构）
- `scripts/sync-web.js`
- `config/platform-target.json`（新）

**工时预估：** 6-12h
**依赖：** 串行组 D1 + D2 完成（确保音频系统稳定后再重构）
**验收标准：**
- [ ] Web/APK 发音不退化
- [ ] target 切换有效
- [ ] 回归测试通过：`opt-0226-task1-save-transfer.spec.mjs`, `opt-0226-task2-review.spec.mjs`

---

## 🌳 Git Worktree 并行开发方案

### Worktree 划分（基于并行组）

```
主分支: main
├── worktree-A: feature/parallel-account-stats     (并行组 A)
├── worktree-B: feature/parallel-save-ui           (并行组 B)
├── worktree-C: feature/parallel-pwa               (并行组 C)
└── worktree-D: feature/serial-audio-system        (串行组 D1 → D2 → E)
```

### 执行顺序

**阶段 1：并行开发（同时进行）**
- Worktree A、B、C 同时开发（无文件冲突）
- Worktree D 开始 D1 任务

**阶段 2：串行开发（D 分支内部串行）**
- Worktree D 完成 D1 → 开始 D2 → 开始 E

**阶段 3：合并与验证**
- A、B、C 完成后各自测试、提交、打包
- D 完成 D1+D2 后测试、提交、打包
- 按优先级合并：A → B → C → D(D1+D2) → D(E)

---

## ✅ 每个 Worktree 的完成定义（DoD）

### 通用 DoD（所有 worktree 必须满足）
- [ ] 功能可见（页面可操作）
- [ ] 异常可见（失败有提示）
- [ ] 关键测试通过（自动化 + 手工）
- [ ] 无主流程回归（进入游戏 → 暂停 → 继续 → 存档）
- [ ] 代码已提交到本地分支
- [ ] 已打包备份（tar.gz 或 zip）
- [ ] 文档已更新（本计划文档中勾选对应任务）

### 特定 DoD

**Worktree A（账号统计）：**
- [ ] 正确率、趋势、成就进度全部可见
- [ ] 回归测试：`opt-0226-task5-learning-stats.spec.mjs` + `opt-0226-task6-achievement-progress.spec.mjs`

**Worktree B（存档UI）：**
- [ ] 档案页快捷入口可用
- [ ] 回归测试：`opt-0226-task1-save-transfer.spec.mjs`

**Worktree C（PWA）：**
- [ ] SW 注册成功，DevTools 可见
- [ ] 回归测试：`opt-0226-task7-pwa.spec.mjs`

**Worktree D（音频系统）：**
- [ ] D1 完成：测试发音 + 自检可用
- [ ] D2 完成：挑战音效可用
- [ ] E 完成：provider 切换无回归
- [ ] 回归测试：`opt-0226-task1-save-transfer.spec.mjs` + `opt-0226-task2-review.spec.mjs`

---

## 📦 打包备份规范

每个 worktree 完成后执行：

```bash
# 在 worktree 目录内
cd /path/to/worktree-X

# 确认改动
git status
git diff --stat

# 提交
git add [具体文件]
git commit -m "feat(parallel-X): [描述]"

# 打包备份（包含 .git）
cd ..
tar -czf worktree-X-$(date +%Y%m%d-%H%M%S).tar.gz worktree-X/

# 或使用 zip（Windows 友好）
7z a -tzip worktree-X-$(date +%Y%m%d-%H%M%S).zip worktree-X/
```

备份文件命名规范：
- `worktree-A-account-stats-20260304-143000.tar.gz`
- `worktree-B-save-ui-20260304-150000.tar.gz`
- `worktree-C-pwa-20260304-153000.tar.gz`
- `worktree-D-audio-d1-20260304-160000.tar.gz`
- `worktree-D-audio-d2-20260304-170000.tar.gz`
- `worktree-D-audio-e-20260304-190000.tar.gz`

---

## 🔀 合并策略

### 合并顺序（按优先级和依赖）

1. **Worktree A（账号统计）** → main
   - 优先级 P0，无依赖，先合并

2. **Worktree B（存档UI）** → main
   - 优先级 P0，无依赖，次合并

3. **Worktree C（PWA）** → main
   - 优先级 P1，无依赖，第三合并

4. **Worktree D（音频 D1+D2）** → main
   - 优先级 P0+P1，第四合并

5. **Worktree D（音频 E）** → main
   - 优先级 P2，最后合并

### 合并前检查清单

每次合并前必须执行：

```bash
# 1. 切换到主分支
git checkout main

# 2. 确认主分支干净
git status

# 3. 合并 worktree 分支
git merge --no-ff feature/parallel-X -m "merge: integrate parallel-X"

# 4. 解决冲突（如有）
# 手动编辑冲突文件
git add [冲突文件]
git commit -m "merge: resolve conflicts from parallel-X"

# 5. 运行全量回归测试
npx playwright test -c tests/e2e/playwright.config.mjs

# 6. 手工验证主流程
# 进入游戏 → 暂停 → 继续 → 存档 → 设置 → 档案

# 7. 确认无问题后推送（可选）
# git push origin main
```

### 冲突预防

**预期冲突点：**
- `03-audio.js`: D1/D2/E 之间可能有冲突（但在同一 worktree 内串行，无冲突）
- `16-events.js`: A/C/D1 可能有轻微冲突（不同函数内，易解决）
- `08-account.js`: A/B 可能有轻微冲突（不同函数内，易解决）

**冲突解决原则：**
1. 保留所有功能（不删除任何一方的代码）
2. 按功能模块分段（用注释标注来源）
3. 合并后立即测试该文件相关功能

---

## 📋 进度跟踪表（可勾选）

### 阶段 1：并行开发

#### Worktree A（账号统计）
- [ ] 创建 worktree：`git worktree add ../worktree-A feature/parallel-account-stats`
- [ ] vA-Task3: 学习统计正确率
- [ ] vB-Task1: 7天学习趋势
- [ ] vB-Task2: 本周 vs 上周对比
- [ ] vB-Task4: 成就维度深化
- [ ] 运行回归测试
- [ ] 提交代码
- [ ] 打包备份
- [ ] 标记为"待合并"

#### Worktree B（存档UI）
- [ ] 创建 worktree：`git worktree add ../worktree-B feature/parallel-save-ui`
- [ ] vA-Task2: 档案页备份/恢复快捷入口
- [ ] vB-Task3: 弱词行动入口（占位）
- [ ] 运行回归测试
- [ ] 提交代码
- [ ] 打包备份
- [ ] 标记为"待合并"

#### Worktree C（PWA）
- [ ] 创建 worktree：`git worktree add ../worktree-C feature/parallel-pwa`
- [ ] vC-Task3: 补齐 SW 注册
- [ ] vC-Task4: 版本化缓存策略
- [ ] 运行回归测试
- [ ] 提交代码
- [ ] 打包备份
- [ ] 标记为"待合并"

#### Worktree D - 阶段 D1（音频基础）
- [ ] 创建 worktree：`git worktree add ../worktree-D feature/serial-audio-system`
- [ ] vA-Task1: 设置页测试发音按钮（UI）
- [ ] vA-Task1: 设置页测试发音按钮（事件绑定）
- [ ] vC-Task1: TTS 诊断 API
- [ ] vC-Task2: 设置页语音自检入口
- [ ] 运行回归测试
- [ ] 提交代码（D1 阶段）
- [ ] 打包备份（D1）

### 阶段 2：串行开发（Worktree D 内部）

#### Worktree D - 阶段 D2（音频增强）
- [ ] vB-Task5: 挑战音效增强（新增音效函数）
- [ ] vB-Task5: 挑战音效增强（答题触发）
- [ ] vB-Task5: 挑战音效增强（设置开关）
- [ ] 运行回归测试
- [ ] 提交代码（D2 阶段）
- [ ] 打包备份（D2）

#### Worktree D - 阶段 E（TTS Provider 重构）
- [ ] vD-Task1: 创建 TTS 抽象目录
- [ ] vD-Task2: 接管 03-audio.js
- [ ] vD-Task3: 实现 mini provider 占位
- [ ] vD-Task4: 构建目标注入
- [ ] 运行回归测试
- [ ] 提交代码（E 阶段）
- [ ] 打包备份（E）
- [ ] 标记为"待合并"

### 阶段 3：合并与验证

- [ ] 合并 Worktree A → main
- [ ] 运行全量回归测试（A 合并后）
- [ ] 合并 Worktree B → main
- [ ] 运行全量回归测试（B 合并后）
- [ ] 合并 Worktree C → main
- [ ] 运行全量回归测试（C 合并后）
- [ ] 合并 Worktree D（D1+D2）→ main
- [ ] 运行全量回归测试（D1+D2 合并后）
- [ ] 合并 Worktree D（E）→ main
- [ ] 运行全量回归测试（E 合并后）
- [ ] 手工验证主流程（完整游戏流程）
- [ ] 清理 worktree：`git worktree remove ../worktree-X`
- [ ] 归档备份文件到 `docs/archive/2026-03-04-parallel-dev-backups/`

---

## 🚨 风险与应对

### 风险 1：Worktree D 内部串行时间过长
**影响：** D1+D2+E 累计 13-21h，可能拖慢整体进度
**应对：**
- D1+D2 完成后先合并，E 单独作为后续版本
- 或将 E 拆分为更小的子任务，分批合并

### 风险 2：合并时出现意外冲突
**影响：** 合并耗时增加，可能引入 bug
**应对：**
- 每次合并前运行 `git diff main..feature/parallel-X` 预览改动
- 使用 `git merge --no-commit` 先预演合并
- 准备回滚点：合并前打 tag `pre-merge-X`

### 风险 3：某个 worktree 测试失败
**影响：** 阻塞合并流程
**应对：**
- 该 worktree 暂不合并，继续修复
- 其他 worktree 继续合并
- 修复完成后单独合并

---

## 📝 文档维护

### 本计划文档更新规则
- 每完成一个任务，立即勾选对应 checkbox
- 每次合并后，更新"阶段 3"进度
- 遇到问题时，在"风险与应对"章节追加记录

### 相关文档
- 原始计划：`docs/plans/2026-3-4-软件开发执行计划包/`
- 历史教训：`tasks/lessons.md`
- 代码库地图：`docs/CODEBASE_MAP.md`

---

## 🎯 最终交付物

1. **代码交付：**
   - 主分支包含所有功能
   - 所有测试通过
   - 无已知回归问题

2. **备份交付：**
   - 4-6 个 worktree 备份文件（tar.gz/zip）
   - 归档到 `docs/archive/2026-03-04-parallel-dev-backups/`

3. **文档交付：**
   - 本计划文档（所有 checkbox 已勾选）
   - 更新 `tasks/lessons.md`（记录本次并行开发经验）
   - 更新 `docs/CODEBASE_MAP.md`（如有架构变化）

---

## ✨ 总结

**并行效率提升：**
- 原串行总工时：20-36h
- 并行后总工时：约 15-25h（节省 25-30%）

**关键成功因素：**
1. 按文件边界重新划分任务（避免冲突）
2. 识别真正的依赖关系（D1 → D2 → E 必须串行）
3. 每个 worktree 独立测试、备份（降低风险）
4. 按优先级合并（P0 先行，P2 最后）

**下一步行动：**
请确认本计划是否符合预期，确认后我将开始执行。
