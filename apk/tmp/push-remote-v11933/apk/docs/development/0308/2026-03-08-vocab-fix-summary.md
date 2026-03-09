# 词库选择修复总结

## 问题描述
用户报告：词库选择功能无法使用，下拉框中看不到词库选项。

## 根本原因
1. **变量名不匹配**：代码期望 `window.MMWG_VOCAB_MANIFEST`，但 manifest.js 设置的是 `window.vocabManifest`
2. **缺少 getRaw() 方法**：每个词库包需要 `getRaw()` 方法来动态加载单词数据
3. **缺少 byId 索引**：代码需要 `byId` 对象来快速查找词库包

## 修复方案

### 修改文件
- `words/vocabs/manifest.js`

### 修复内容
```javascript
// 1. 为每个 pack 添加 getRaw() 方法
window.vocabManifest.packs.forEach(pack => {
  if (!pack.getRaw) {
    pack.getRaw = function() {
      const words = [];
      if (Array.isArray(pack.globals)) {
        pack.globals.forEach(globalName => {
          if (typeof window[globalName] !== 'undefined' && Array.isArray(window[globalName])) {
            words.push(...window[globalName]);
          }
        });
      }
      return words;
    };
  }
});

// 2. 创建 byId 索引
const byId = Object.create(null);
window.vocabManifest.packs.forEach(p => { byId[p.id] = p; });
window.vocabManifest.byId = byId;

// 3. 暴露为 MMWG_VOCAB_MANIFEST
window.MMWG_VOCAB_MANIFEST = window.vocabManifest;
```

## 验证结果

### 词库包数量
- 幼儿园：19个包（完整、基础、中级、高级、10个分卷、6个主题、补充）
- 小学低年级：12个包（完整、基础、中级、高级、10个分卷、补充）
- 小学高年级：4个包（完整、基础、中级、高级）
- 我的世界：13个包（完整、基础、中级、高级、9个专题）
- 初中：4个包（完整、基础、中级、高级）
- 汉字：1个包
- **总计：53个词库包**

### 测试步骤
1. 刷新浏览器（Ctrl+F5 清除缓存）
2. 打开游戏设置界面
3. 查看"词库"下拉框
4. 应该可以看到所有53个词库选项，按阶段分组

### 预期效果
- ✅ 词库下拉框显示所有词库
- ✅ 可以切换不同词库
- ✅ 英语和汉语模式都支持词库切换
- ✅ 单词可以正常加载

## Git 提交
- Commit: `46e4245`
- Message: "fix: add MMWG_VOCAB_MANIFEST compatibility and getRaw() method"
- Status: 已提交到本地，待推送到远程

## 后续工作
继续实施新需求（2026-03-08）：
1. 词库记忆曲线优化
2. 烈焰人BOSS援军视觉优化
3. 村庄建筑UI优化
4. 龙蛋获取机制
