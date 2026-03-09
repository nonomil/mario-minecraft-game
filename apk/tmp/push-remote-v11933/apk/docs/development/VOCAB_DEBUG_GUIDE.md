# 单词库切换问题调试指南

## 问题描述
在设置中切换单词库后，单词库不生效或没有切换。

## 已添加的调试日志

我已经在代码中添加了详细的调试日志，可以通过浏览器控制台查看。

### 如何查看调试日志

1. **在浏览器中打开游戏**
   - 如果是 Web 版本：直接在浏览器中打开 `Game.html`
   - 如果是 APK 版本：需要使用 Chrome 远程调试

2. **打开浏览器控制台**
   - Chrome/Edge: 按 `F12` 或 `Ctrl+Shift+I`
   - 查看 "Console" 标签

3. **查看日志输出**
   - 所有词库相关的日志都以 `[Vocab]` 开头
   - 所有设置相关的日志都以 `[Settings]` 开头
   - 所有存储相关的日志都以 `[Storage]` 开头

## 调试步骤

### 步骤 1: 检查 Manifest 是否加载

打开游戏后，在控制台中查找：
```
[Vocab] Manifest loaded: {version: "...", packs: Array(4), byId: {...}}
[Vocab] Engine initialized with packs: ["vocab.kindergarten", "vocab.elementary_lower", ...]
```

**如果没有看到这些日志**：
- 问题：`manifest.js` 文件没有正确加载
- 解决：检查 `words/vocabs/manifest.js` 文件是否存在
- 检查浏览器控制台是否有 JavaScript 错误

### 步骤 2: 检查词库选择器渲染

打开设置面板后，查找：
```
[Vocab] Rendered select with 4 packs, current: auto
```

**如果看到 "Cannot render select - engine not available"**：
- 问题：词库引擎未初始化
- 返回步骤 1

### 步骤 3: 切换词库并保存

1. 在设置中选择一个词库（例如"我的世界"）
2. 点击"保存"按钮
3. 查看控制台日志：

```
[Settings] Save started
[Settings] Vocab changed from auto to vocab.minecraft
[Settings] Settings saved to localStorage
[Storage] Settings saved: {
  "vocabSelection": "vocab.minecraft",
  ...
}
[Settings] Applying vocab pack: vocab.minecraft
[Vocab] setActiveVocabPack called with selection: vocab.minecraft
[Vocab] Picked pack ID: vocab.minecraft
[Vocab] Activated pack: vocab.minecraft title: 我的世界
[Vocab] Loading 13 files
[Vocab] getRaw() returned 1234 words
[Vocab] Loaded 1234 unique words into wordDatabase
[Vocab] Rendered select with 4 packs, current: vocab.minecraft
[Vocab] Pack switch complete
[Settings] Save complete
```

### 步骤 4: 验证词库是否生效

1. 关闭设置面板
2. 开始游戏或继续游戏
3. 观察出现的单词是否来自选择的词库

## 常见问题和解决方案

### 问题 1: 词库文件加载失败

**症状**：
```
[Vocab] Loading 13 files
[Vocab] Error loading pack: ...
[Vocab] No words loaded from pack: vocab.minecraft
```

**原因**：词库文件路径错误或文件不存在

**解决**：
1. 检查 `words/vocabs/04_我的世界/` 目录下的文件是否存在
2. 检查 `manifest.js` 中的文件路径是否正确
3. 检查浏览器控制台是否有 404 错误

### 问题 2: getRaw() 返回 0 个单词

**症状**：
```
[Vocab] getRaw() returned 0 words
```

**原因**：词库文件中的全局变量未定义

**解决**：
1. 检查词库文件是否正确定义了全局变量
2. 例如 `minecraft_advancements.js` 应该定义 `MINECRAFT_8_____ADVANCEMENTS_`
3. 检查 `manifest.js` 中的 `getRaw()` 函数是否引用了正确的变量名

### 问题 3: 设置未保存到 localStorage

**症状**：
```
[Settings] Settings saved to localStorage
```
但刷新页面后设置丢失

**原因**：浏览器禁用了 localStorage 或处于隐私模式

**解决**：
1. 检查浏览器设置，确保允许网站存储数据
2. 退出隐私/无痕模式
3. 在控制台中手动检查：
   ```javascript
   localStorage.getItem('mmwg:settings')
   ```

### 问题 4: 词库切换后单词没有变化

**症状**：词库切换成功，但游戏中的单词还是旧词库的

**原因**：`wordPicker` 缓存了旧的单词

**解决**：
- 代码中已经在切换词库时重置 `wordPicker = null`
- 如果问题仍然存在，检查是否有其他地方缓存了单词

## 手动测试命令

在浏览器控制台中可以手动测试：

### 查看当前词库
```javascript
console.log("Active pack:", activeVocabPackId);
console.log("Word database size:", wordDatabase.length);
console.log("Settings:", settings.vocabSelection);
```

### 手动切换词库
```javascript
await setActiveVocabPack("vocab.minecraft");
```

### 查看所有可用词库
```javascript
console.log(vocabManifest.packs.map(p => ({ id: p.id, title: p.title })));
```

### 清除所有设置
```javascript
localStorage.removeItem('mmwg:settings');
localStorage.removeItem('mmwg:vocabState');
localStorage.removeItem('mmwg:progress');
location.reload();
```

## APK 版本调试

如果是 APK 版本，需要使用 Chrome 远程调试：

1. **启用 USB 调试**
   - 在 Android 设备上：设置 > 开发者选项 > USB 调试

2. **连接设备**
   - 用 USB 线连接手机和电脑
   - 在电脑上打开 Chrome 浏览器
   - 访问 `chrome://inspect`

3. **选择应用**
   - 在设备列表中找到 "mario-minecraft-game"
   - 点击 "inspect"

4. **查看日志**
   - 在打开的 DevTools 中查看 Console 标签
   - 按照上述步骤进行调试

## 修复总结

本次修复包含以下改进：

1. **动态加载 Manifest**
   - `ensureVocabEngine()` 现在会在每次调用时检查 `window.MMWG_VOCAB_MANIFEST`
   - 解决了 manifest.js 加载时序问题

2. **详细的调试日志**
   - 词库加载的每个步骤都有日志输出
   - 设置保存和应用的过程都有日志
   - 存储操作都有日志

3. **异步处理**
   - 设置保存函数改为 `async`
   - 使用 `await` 等待词库切换完成

4. **错误处理**
   - 捕获并输出词库加载错误
   - 提供更明确的错误信息

## 下一步

如果按照以上步骤仍然无法解决问题，请：

1. 复制完整的控制台日志
2. 说明具体的操作步骤
3. 说明期望的行为和实际的行为
4. 提供浏览器版本和设备信息

---

**文档版本**：1.0
**创建日期**：2026-02-08
**适用版本**：v1.2.15+
