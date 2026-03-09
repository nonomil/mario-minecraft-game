# Release Notes - v1.19.25

**发布日期**: 2026-03-08

## 🐛 Bug 修复

### 高级设置按钮修复
修复了高级设置按钮点击无响应的问题。

#### 问题根因
- Game.html 文件包含 390 个 UTF-8 智能引号（`"` U+201D）而非标准 ASCII 双引号（`"` U+0022）
- 导致 HTML 解析器无法正确创建 DOM 元素
- JavaScript 的 `getElementById()` 无法找到 `#advanced-settings-modal` 元素

#### 修复内容
- 将所有智能引号替换为标准 ASCII 引号
- 替换了 390 个智能右引号和相关智能单引号
- 验证高级设置模态框正确显示

#### 影响范围
- ✅ 高级设置按钮现在可以正常点击
- ✅ 高级设置面板正确弹出，包含 6 个分组的设置项
- ✅ 所有 HTML 元素 ID 现在可以被 JavaScript 正确识别

## 📝 相关提交

```
850b9a9 fix: replace smart quotes with standard ASCII quotes in Game.html
581e0b5 fix: correct quote characters in settings interface
bf0a880 feat: reorganize settings interface into main and advanced panels
```

## 🧪 测试验证

使用 Playwright 自动化测试验证：
- ✓ 高级设置模态框元素正确创建
- ✓ 点击按钮后模态框正确显示（display: flex）
- ✓ CSS 类 `visible` 正确添加
- ✓ `aria-hidden` 正确设置为 `"false"`

## 📋 测试建议

1. 刷新浏览器（Ctrl+F5 清除缓存）
2. 进入游戏，点击 ⚙️ 设置按钮
3. 点击设置面板顶部的「高级设置」按钮
4. 应该能看到包含以下 6 个分组的高级设置面板：
   - 📖 词库管理
   - 🎯 学习策略
   - 💪 挑战设置
   - 🔊 语音设置
   - 🖥️ 界面设置
   - ⚙️ 其他设置

---

**完整更新日志**: https://github.com/nonomil/minecraft_words_apk/compare/v1.19.24...v1.19.25
