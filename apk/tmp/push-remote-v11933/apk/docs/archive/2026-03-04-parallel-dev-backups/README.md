# 并行开发备份目录

> **创建时间：** 2026-03-04
> **用途：** 存放各 worktree 完成后的打包备份文件

---

## 📦 预期备份文件清单

### Worktree A（账号统计增强）
- [ ] `worktree-A-account-stats-YYYYMMDD-HHMMSS.tar.gz` 或 `.zip`
- **预估大小：** ~50MB
- **完成时间：** _待填写_

### Worktree B（存档与UI增强）
- [ ] `worktree-B-save-ui-YYYYMMDD-HHMMSS.tar.gz` 或 `.zip`
- **预估大小：** ~50MB
- **完成时间：** _待填写_

### Worktree C（PWA 基础设施）
- [ ] `worktree-C-pwa-YYYYMMDD-HHMMSS.tar.gz` 或 `.zip`
- **预估大小：** ~50MB
- **完成时间：** _待填写_

### Worktree D（音频系统 - 3 个阶段）
- [ ] `worktree-D-audio-d1-YYYYMMDD-HHMMSS.tar.gz` 或 `.zip`（D1 阶段）
- [ ] `worktree-D-audio-d2-YYYYMMDD-HHMMSS.tar.gz` 或 `.zip`（D2 阶段）
- [ ] `worktree-D-audio-e-YYYYMMDD-HHMMSS.tar.gz` 或 `.zip`（E 阶段）
- **预估大小：** 每个 ~50MB
- **完成时间：** _待填写_

---

## 📋 备份文件命名规范

```
worktree-{标识}-{功能名}-{时间戳}.{格式}

示例：
- worktree-A-account-stats-20260304-143000.tar.gz
- worktree-B-save-ui-20260304-150000.zip
- worktree-C-pwa-20260304-153000.tar.gz
- worktree-D-audio-d1-20260304-160000.tar.gz
```

---

## ✅ 备份验证清单

每个备份文件必须包含：
- [ ] 完整的 worktree 目录结构
- [ ] `.git` 目录（包含完整提交历史）
- [ ] 所有源代码文件
- [ ] 配置文件
- [ ] 测试文件

---

## 🔍 备份文件使用说明

### 解压备份
```bash
# tar.gz 格式
tar -xzf worktree-A-account-stats-20260304-143000.tar.gz

# zip 格式
unzip worktree-A-account-stats-20260304-143000.zip
# 或
7z x worktree-A-account-stats-20260304-143000.zip
```

### 恢复 worktree
```bash
# 解压后，可以直接在解压目录工作
cd worktree-A/
git status
git log

# 或者将改动应用到主分支
git diff main > changes.patch
cd /path/to/main/repo
git apply changes.patch
```

---

## 📝 备份记录

_Master Agent 在此记录实际生成的备份文件_

<!-- Master Agent 追加备份记录到此处 -->
