# v1.8.11 版本发布状态

## ✅ 已完成

### 1. 版本号更新
- 版本: 1.8.10 → 1.8.11

### 2. Bug 修复
- 修复 Android APK 启动 1 秒后地面消失的问题
- 移除 `applySettingsToUI()` 中的双重重映射逻辑
- `applyConfig()` 已正确处理实体重映射，无需再调用 `realignWorldForViewport()`

### 3. 版本记录
- 更新 `apk/docs/version/CHANGELOG.md`
- 更新 `VERSION-STATUS.md`

## ⏳ 待完成

### 提交到 Git
```bash
git add .
git commit -m "fix(viewport): remove double remapping causing ground disappear after 1s in APK"
git push
```

## 🔄 下一步

1. **提交代码** - 提交修复到 git
2. **推送代码** - 推送到远程仓库
3. **测试验证** - 在 Android 设备上验证地面不再消失

---

**创建时间**: 2026-02-15
**状态**: 等待提交到 Git
