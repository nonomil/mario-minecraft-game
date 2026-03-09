# 双语模式合并问题分析

> 日期：2026-03-06
> 状态：阻塞 - 项目结构不兼容

## 问题描述

尝试将 `feat/bilingual-merge` 分支合并到 `main` 分支时，发现两个分支使用完全不同的项目结构，无法直接合并。

## 结构对比

### Worktree 分支 (feat/bilingual-merge, 基于 commit 256ad75)

**入口文件**: `index.html` (完整游戏页面)
**脚本结构**:
```
js/
├── config.js
├── data-migration.js
├── spelling.js
├── vocabulary.js
├── settings.js
├── tts-adapter.js
├── mobile-ui-manager.js
└── ...
```

**脚本引用示例**:
```html
<script src="js/config.js"></script>
<script src="js/vocabulary.js"></script>
<script src="js/spelling.js"></script>
```

### 当前 Main 分支 (commit 128dcd8)

**入口文件**: `Game.html` (完整游戏页面)
**重定向文件**: `index.html` (仅重定向到 Game.html)
**脚本结构**:
```
src/
├── modules/
│   ├── 01-config.js
│   ├── 09-vocab.js
│   ├── 12-challenges.js
│   └── ...
├── storage.js
├── defaults.js
└── tts/
```

**脚本引用示例**:
```html
<script src="src/modules/01-config.js"></script>
<script src="src/modules/09-vocab.js"></script>
<script src="src/modules/12-challenges.js"></script>
```

## 根本原因

Worktree 是从一个旧版本的项目创建的，该版本使用 `index.html` + `js/` 结构。而当前 main 分支已经重构为 `Game.html` + `src/modules/` 结构。

双语功能的所有开发工作（4个任务 + 集成测试）都是基于旧结构完成的，与当前 main 分支完全不兼容。

## 合并尝试结果

```bash
git merge --allow-unrelated-histories feat/bilingual-merge
```

**结果**: 2240+ 文件冲突，包括：
- 所有 JS 文件（结构完全不同）
- HTML 入口文件（index.html vs Game.html）
- 所有二进制资源文件
- 配置文件

## 解决方案选项

### 选项 A：重新开发（推荐）

**步骤**:
1. 基于当前 main 分支创建新的 worktree
2. 参考 `.worktrees/task-merge` 中的实现逻辑
3. 将双语功能适配到 `src/modules/` 结构
4. 重新实现以下模块：
   - `src/modules/09-vocab.js` - 添加双语词汇加载
   - `src/modules/12-challenges.js` - 添加 TTS 语言切换
   - `src/modules/10-ui.js` - 添加拼音显示和语言模式选择
   - `src/storage.js` - 添加数据迁移逻辑
   - `Game.html` - 添加首启引导页

**优点**:
- 代码结构正确，符合当前项目架构
- 避免大量合并冲突
- 可以复用测试用例

**缺点**:
- 需要重新编写代码（但可以参考现有实现）
- 预计需要 2-3 天

**工作量估算**:
- 数据迁移: 0.5天
- 词汇系统适配: 1天
- UI 和 TTS 集成: 1天
- 测试和修复: 0.5天

### 选项 B：查找兼容分支

**步骤**:
1. 查找是否存在使用 `index.html` + `js/` 结构的活跃分支
2. 将双语功能合并到该分支
3. 该分支再合并到 main（如果需要）

**优点**:
- 可以直接使用已完成的代码

**缺点**:
- 可能不存在这样的分支
- 即使存在，最终还是需要适配到 main 的新结构

### 选项 C：手动移植核心文件

**步骤**:
1. 识别双语功能的核心改动
2. 手动将这些改动移植到 `src/modules/` 对应文件
3. 调整文件路径和模块引用

**核心改动文件映射**:
```
worktree                    →  main branch
js/vocabulary.js            →  src/modules/09-vocab.js
js/spelling.js              →  src/modules/12-challenges.js
js/data-migration.js        →  src/storage.js (新增迁移函数)
js/config.js                →  src/modules/01-config.js
js/settings.js              →  src/modules/10-ui.js
js/tts-adapter.js           →  src/tts/index.js
index.html                  →  Game.html
tools/add-pinyin.js         →  tools/add-pinyin.js (直接复制)
words/vocabs/06_汉字/       →  words/vocabs/06_汉字/ (直接复制)
```

**优点**:
- 可以复用大部分代码逻辑
- 比完全重写快

**缺点**:
- 需要仔细对比和调整
- 容易遗漏细节
- 仍需要完整测试

## 建议

**推荐选项 A（重新开发）**，理由：

1. **代码质量**: 确保代码符合当前项目架构
2. **可维护性**: 避免技术债务
3. **测试覆盖**: 可以复用现有测试用例，确保功能正确
4. **时间成本**: 虽然需要重写，但有清晰的参考实现，实际工作量可控

## 已完成的工作价值

虽然无法直接合并，但以下成果仍然有价值：

1. **需求文档和设计** ✅
   - `docs/plan/plan-2026-03-06-bilingual-learning-mode.md`
   - `docs/development/2026-03-06-bilingual-contract.md`
   - 设计思路和数据结构设计可以直接复用

2. **测试用例** ✅
   - `tests/e2e/bilingual-mode.spec.mjs`
   - 测试逻辑完全可以复用，只需调整文件路径

3. **词汇数据** ✅
   - `words/vocabs/06_汉字/幼儿园汉字.js` - 可以直接复制
   - `tools/add-pinyin.js` - 可以直接复制

4. **实现逻辑参考** ✅
   - 所有核心算法和业务逻辑都已验证
   - 重新实现时可以直接参考，大幅减少开发时间

## 下一步行动

等待用户选择解决方案：
- 选项 A: 基于当前 main 重新开发
- 选项 B: 查找兼容分支
- 选项 C: 手动移植

## 教训记录

**问题**: Worktree 创建时未验证基础分支与目标分支的结构兼容性

**改进措施**:
1. 创建 worktree 前必须验证基础分支与目标合并分支的结构一致性
2. 对于长期项目，定期同步 worktree 基础分支与 main 分支
3. 在并行开发开始前，明确验证项目入口文件和目录结构

此教训应记录到 `tasks/lessons.md`。
