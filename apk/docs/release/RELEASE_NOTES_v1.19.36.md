# Release Notes - v1.19.36

## 摘要
本次更新重点在于人物角色形象的全面优化、发布流程的自动化集成以及文档结构的重组，同时修复了词表切换的相关问题。

## 变更详情

### 核心功能 (Features)
- **人物角色形象优化**: 刷新了人物角色视觉效果，并同步更新了相关设计文档。
- **发布自动化**: 集成了 `release-and-push` 技能，支持自动递增版本、生成发布说明及一键推送。
- **发布门禁**: 引入了 Lane E 发布门禁机制，增强发布稳定性。

### 修复 (Bug Fixes)
- **词表切换**: 修复了启动器与 APK 中的词表切换逻辑，解决了旧版词表 ID 导致的切换失败问题。
- **Git 忽略**: 将 `.worktrees` 目录加入忽略列表，防止工作树文件干扰主仓库。

### 文档与维护 (Docs & Maintenance)
- **文档重构**: 重新组织了文档目录结构，将 Release Notes 统一移至 `docs/release/`。
- **发布指南**: 新增了详尽的发布工作流指南及 Release Notes 管理手册。
- **清理**: 清理了过时的遗留文件，保持仓库整洁。

## Git 提交记录 (v1.19.28..HEAD)
- `ffe7ec6`: Merge branch 'codex/character-visuals-0310'
- `6b50a2a`: docs: add character visuals docs
- `d7598cd`: feat: refresh character visuals
- `9b3b9e1`: fix: ignore .worktrees directory
- `88f8b20`: docs: add comprehensive release workflow guide
- `fb28129`: feat: integrate lane e release gate
- `8fd8de0`: feat: add release-and-push skill for automated version releases
- `874800d`: docs: add release notes management guide
- `142d733`: chore: reorganize release notes to docs/release directory
- `55f4659`: fix: resolve vocab switching in launcher and apk
- `2894e48`: fix: resolve vocab pack switching legacy ids
- `ea1b9d9`: chore: reorganize documentation structure and cleanup legacy files
