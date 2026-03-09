# 发布工作流使用指南

## 快速开始

### 方式 1：使用自动化脚本（推荐）

```bash
# 运行发布脚本
node .claude/skills/release-and-push.mjs
```

脚本会自动：
1. ✅ 检查 git 状态
2. 📊 提取提交记录
3. 📝 生成 Release Notes
4. 🔢 更新版本号
5. 💾 提交更改
6. 🚀 推送到远程

### 方式 2：手动执行

```bash
# 1. 查看待发布的提交
git log --oneline v1.19.34..HEAD

# 2. 更新版本号（编辑 package.json）
# "version": "1.19.35"

# 3. 创建 Release Notes
# 在 docs/release/ 创建 RELEASE_NOTES_v1.19.35.md

# 4. 提交
git add package.json docs/release/RELEASE_NOTES_v1.19.35.md
git commit -m "release: v1.19.35"

# 5. 推送
./push.bat --yes --no-pause
```

## 目录结构

```
mario-minecraft-game_APK_V1.19.8/
├── package.json                          # 版本号定义
├── push.bat                              # 推送脚本
├── .claude/
│   └── skills/
│       ├── release-and-push.md          # Skill 文档
│       └── release-and-push.mjs         # 自动化脚本
└── docs/
    └── release/
        ├── README.md                     # Release Notes 管理指南
        ├── RELEASE_NOTES_v1.19.34.md    # 当前版本
        └── old/                          # 历史版本归档
```

## Release Notes 模板

```markdown
# Release Notes - v1.19.35

**发布日期**: 2026-03-10

## 📋 变更概述
简要描述本次发布的主要内容

## ✨ 新功能
- 新功能 1
- 新功能 2

## 🐛 Bug 修复
- 修复 1
- 修复 2

## 🔧 优化改进
- 优化 1
- 优化 2

## 📝 文档更新
- 文档 1
- 文档 2

## 🎯 下一步计划
- 计划 1
- 计划 2

---

**完整变更**: X commits
```

## 提交信息规范

使用 Conventional Commitsn
- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档更新
- `style:` - 代码格式（不影响功能）
- `refactor:` - 重构
- `perf:` - 性能优化
- `test:` - 测试相关
- `chore:` - 构建/工具链
- `release:` - 版本发布

示例：
```bash
git commit -m "feat: add dragon egg hatching system"
git commit -m "fix: resolve vocab pack switching issue"
git commit -m "docs: update release workflow guide"
```

## 版本号规则

语义化版本 (Semantic Versioning)：`MAJOR.MINOR.PATCH`

- **MAJOR (1)**: 重大架构变更或不兼容更新
- **MINOR (19)**: 新功能添加，向后兼容
- **PATCH (34)**: Bug 修复和小优化

当前版本：`v1.19.34`

## push.bat 参数

```bash
# 自动确认，不暂停
./push.bat --yes --no-pause

# 仅同步到主仓库，不推送
./push.bat --sync-only

# 强制推送（谨慎使用）
./push.bat --force

# 指定主仓库路径
./push.bat --main-repo "G:\path\to\mario-minecraft-game_V1"

# 指定推送模式
./push.bat --mode auto    # 自动检测代理（默认）
./push.bat --mode proxy   # 强制使用代理
./push.bat --mode direct  # 强制直连
```

## 推送流程说明

`push.bat` 执行流程：

1. **检测项目类型**
   - APK-only 项目 → 同步到主仓库 `mario-minecraft-game_V1/apk/`
   - 主仓库项目 → 直接推送

2. **同步到主仓库**（APK-only 项目）
   ```bash
   # 切换主仓库到 main 分支
   # 更新主仓库（pull --ff-only）
   # 复制文件到 apk/ 目录
   # 提交：sync(apk): publish from apk-only repo
   ```

3. **推送到 GitHub**
   - 自动检测代理（127.0.0.1:10808）
   - 失败时自动重试（schannel/openssl/socks5）
   - 推送成功后触发 GitHub Actions

4. **GitHub Actions**
   - 自动构建 APK
   - 运行测试
   - 部署到 GitHub Pages（如果配置）

## 常见问题

### Q: 推送失败怎么办？

**A:** 检查以下几点：
1. 网络连接是否正常
2. 代理是否运行（127.0.0.1:10808）
3. GitHub 认证是否有效
4. 是否有未提交的更改

### Q: 如何回滚版本？

**A:**
```bash
# 回退到上一个版本
git reset --hard HEAD~1

# 或回退到指定版本
git reset --hard v1.19.33

# 强制推送（谨慎！）
git push --force-with-lease origin main
```

### Q: Release Notes 写错了怎么办？

**A:**
```bash
# 修改 Release Notes
vim docs/release/RELEASE_NOTES_v1.19.34.md

# 修正提交
git add docs/release/RELEASE_NOTES_v1.19.34.md
git commit --amend --no-edit

# 推送（如果已推送，需要 force）
git push --force-with-lease origin main
```

### Q: 如何跳过某些提交不写入 Release Notes？

**A:** 使用 `chore:` 或 `ci:` 前缀，自动化脚本会跳过这些提交。

### Q: 主仓库同步失败怎么办？

**A:**
```bash
# 检查主仓库状态
cd G:\UserCode\Mario_Minecraft\mario-minecraft-game_V1
git status

# 如果有未提交的更改，先处理
git stash
# 或
git commit -am "WIP: save changes"

# 然后重新运行 push.bat
```

## 最佳实践

1. **发布前检查**
   - 运行所有测试：`npm test`
   - 检查代码质量
   - 确认所有功能正常

2. **Release Notes 质量**
   - 清晰描述变更内容
   - 面向用户，不要过于技术化
   - 包含重要的 Breaking Changes

3. **版本号管理**
   - 遵循语义化版本规范
   - 重大更新前打 tag
   - 保持版本号连续性

4. **提交规范**
   - 使用 Conventional Commits
   - 一个提交只做一件事
   - 提交信息清晰明确

5. **推送时机**
   - 避免在高峰期推送
   - 确保 CI/CD 资源充足
   - 关注 GitHub Actions 构建状态

## 相关文档

- [Release Notes 管理指南](docs/release/README.md)
- [Skill 文档](.claude/skills/release-and-push.md)
- [项目 CLAUDE.md](CLAUDE.md)
- [主仓库 README](../mario-minecraft-game_V1/README.md)

## 联系方式

遇到问题？
- 查看 GitHub Issues
- 检查 GitHub Actions 日志
- 查看 push.bat 输出日志
