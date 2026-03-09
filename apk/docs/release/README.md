# Release Notes 管理

本目录统一管理所有版本的发布说明文档。

## 目录结构

```
docs/release/
├── README.md                      # 本文件
├── RELEASE_NOTES_v1.19.*.md      # 当前活跃版本的发布说明
├── release-notes.md               # 发布说明汇总
├── SIGNING.md                     # APK 签名说明
└── old/                           # 历史版本归档
    ├── v1.19.13.md ~ v1.19.23.md
    └── 发布说明-v1.18.*.md
```

## 命名规范

### 当前版本（v1.19.24+）
- 格式：`RELEASE_NOTES_v{major}.{minor}.{patch}.md`
- 示例：`RELEASE_NOTES_v1.19.34.md`
- 语言：中文

### 历史版本
- 旧格式：`发布说明-v{version}.md` 或 `v{version}.md`
- 已归档到 `old/` 目录

## 发布工作流

### 1. 准备发布
```bash
# 确保所有更改已提交
git status

# 查看自上次版本以来的提交
git log --oneline v1.19.33..HEAD
```

### 2. 更新版本号
编辑 `package.json`：
```json
{
  "version": "1.19.35"  // 递增版本号
}
```

### 3. 创建发布说明
在 `docs/release/` 创建新文件：
```bash
# 文件名格式
RELEASE_NOTES_v1.19.35.md
```

### 4. 发布说明模板
```markdown
# Release Notes - v1.19.35

**发布日期**: YYYY-MM-DD

## 📋 变更概述
简要描述本次发布的主要内容

## ✨ 新功能
- 功能1
- 功能2

## 🐛 Bug 修复
- 修复1
- 修复2

## 🔧 优化改进
- 优化1
- 优化2

## 📝 文档更新
- 文档1
- 文档2

## 🎯 下一步计划
- 计划1
- 计划2

---

**完整变更**: git log v1.19.34..v1.19.35 --oneline
```

### 5. 提交并推送
```bash
# 提交版本更新
git add package.json docs/release/RELEASE_NOTES_v1.19.35.md
git commit -m "release: v1.19.35"

# 推送到远程仓库（会自动同步到主仓库）
./push.bat --yes --no-pause
```

### 6. 验证发布
- 检查 GitHub 仓库是否已更新
- 验证 GitHub Actions 构建状态
- 确认主仓库 `mario-minecraft-game_V1/apk/` 已同步

## 版本号规则

采用语义化版本 (Semantic Versioning)：

- **Major (1)**: 重大架构变更或不兼容更新
- **Minor (19)**: 新功能添加，向后兼容
- **Patch (34)**: Bug 修复和小优化

当前版本系列：`v1.19.x`

## 归档规则

当版本号跨越 Minor 版本时（如从 v1.19.x 到 v1.20.x），将旧版本移至 `old/` 目录：

```bash
# 归档 v1.19.24-v1.19.34
mv docs/release/RELEASE_NOTES_v1.19.{24..34}.md docs/release/old/
```

## 相关文件

- `package.json`: 版本号定义
- `push.bat`: 自动推送脚本
- `docs/version/CHANGELOG.md`: 详细变更日志
- `version.json`: 版本元数据

## 注意事项

1. **不要在根目录创建 RELEASE_NOTES**: 统一放在 `docs/release/`
2. **版本号必须同步**: `package.json` 和 Release Notes 文件名必须一致
3. **推送前检查**: 确保 Release Notes 内容完整且准确
4. **自动化流程**: `push.bat` 会自动同步到主仓库并触发 CI/CD
