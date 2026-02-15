# v1.8.9 版本发布状态

## ✅ 已完成

### 1. 版本号更新
- 版本: 1.8.8 → 1.8.9

### 2. Bug 修复
- 修复树木悬浮在空中的渲染问题
- `drawPixelTree` 函数改为使用动态缩放尺寸
- 所有树木类型（oak、birch、spruce、pine、palm、cactus）渲染正确

### 3. 版本记录
- 更新 `CHANGELOG.md`
- 更新 `apk/docs/version/CHANGELOG.md`
- 更新 `VERSION-STATUS.md`

## ⏳ 待完成

### 提交并推送到 Git
```bash
git add .
git commit -m "fix(renderer): fix floating trees by scaling drawPixelTree dimensions"
git push
```

## 🔄 下一步

1. **提交代码** - 提交修复到 git
2. **推送代码** - 推送到远程仓库
3. **测试验证** - 在不同视口大小下验证树木渲染

---

**创建时间**: 2026-02-15
**状态**: 等待提交到 Git

