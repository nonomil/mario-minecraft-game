# Release Notes - v1.19.24

**发布日期**: 2026-03-08

## 🎯 主要更新

### 词库系统全面优化
本次更新完全重构了词库系统，大幅提升用户体验。

## ✨ 新功能

### 词库分类简化
- 从 53个词库包简化到 11个，更易选择
- 新分类结构：
  - 幼儿园（1个）
  - 小学：初级/中级/完整（3个）
  - 初中：初级/中级/完整（3个）
  - Minecraft：初级/中级/完整（3个）
  - 汉字（1个）

## 🐛 Bug 修复

### 词库选择功能修复
- 修复词库选择功能无法使用的问题
- 添加 `window.MMWG_VOCAB_MANIFEST` 兼容性支持
- 为所有词库包添加 `getRaw()` 方法
- 创建 `byId` 索引对象用于快速查找

### 词库加载修复
- 修复初中词库无法加载的问题（全局变量名不匹配）
- 修复小学词库无法加载的问题（全局变量名不匹配）
- 修复小学词库在设置界面不显示的问题（stage 标签不匹配）

### 全局变量名修正
- 小学初级：`VOCAB_ELEMENTARY_LOWER_BASIC` → `STAGE_ELEMENTARY_LOWER`
- 小学中级：`VOCAB_ELEMENTARY_UPPER_BASIC` → `STAGE_ELEMENTARY_UPPER`
- 小学完整：`MERGED_ELEMENTARY_VOCAB` → `MERGED_VOCABULARY`
- 初中初级：`VOCAB_JUNIOR_HIGH_BASIC` → `STAGE_JUNIOR_HIGH_BASIC`
- 初中中级：`VOCAB_JUNIOR_HIGH_INTERMEDIATE` → `STAGE_JUNIOR_HIGH_INTERMEDIATE`
- 初中完整：`VOCAB_JUNIOR_HIGH_FULL` → `STAGE_JUNIOR_HIGH`

### Stage 标签修正
- 更新词库选择界面的 stage 分类
- `elementary_lower`, `elementary_upper` → `elementary`
- 统一小学词库显示为"小学"分组

## 🧹 代码清理

### 删除重复文件
- 删除旧的 `vocabs/` 文件夹（46个文件，4.3MB）
- 保留 `words/vocabs/` 作为唯一词库目录
- 减少仓库大小，避免混淆

## 📝 文档更新

### 新增文档
- 词库修复总结文档
- 词库简化总结文档
- Stage 标签修复文档
- 设置界面优化方案
- 完整工作总结

## 🔧 技术改进

### 词库系统架构
- 统一词库 stage 命名规范
- 优化词库加载逻辑
- 改进词库选择界面渲染

## 📊 影响范围

### 用户可见变化
- ✅ 词库选择更简单直观
- ✅ 所有词库（包括初中和小学）都能正常使用
- ✅ 词库下拉框显示清晰的分组结构

### 开发者变化
- ✅ 词库系统代码更清晰
- ✅ 减少了重复文件
- ✅ 统一了命名规范

## 🎮 测试建议

1. 刷新浏览器（Ctrl+F5 清除缓存）
2. 打开游戏设置
3. 查看"词库"下拉框，应该显示：
   - 随机词库（按类别轮换）
   - 幼儿园
   - 小学（初级/中级/完整）
   - 初中（初级/中级/完整）
   - Minecraft（初级/中级/完整）
   - 幼儿园汉字
4. 测试每个词库是否能正常加载单词
5. 验证初中和小学词库功能正常

## 📦 相关提交

```
6119c09 docs: add final work summary for 2026-03-08
55fd2d3 docs: add vocab stage label fix documentation
aed5efd fix: update vocab select stage labels to match simplified classification
9107bbd docs: add 2026-03-08 work summary and settings optimization plan
e2773e7 fix: correct global variable names in vocabulary manifest
691938c chore: remove duplicate vocabs/ directory
30c5c5b refactor: adjust vocabulary classification per user feedback
7967c9f refactor: simplify vocabulary classification from 53 to 12 packs
46e4245 fix: add MMWG_VOCAB_MANIFEST compatibility and getRaw() method
```

## 🔜 下一步计划

- 设置界面优化（将常用设置放第一页）
- 词库记忆曲线优化
- BOSS 视觉效果优化
- 村庄建筑 UI 优化
- 龙蛋获取机制

---

**完整更新日志**: https://github.com/nonomil/minecraft_words_apk/compare/v1.19.23...v1.19.24
