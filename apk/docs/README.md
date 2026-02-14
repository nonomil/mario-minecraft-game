# 文档目录

本目录包含项目的所有文档，按类别组织。

## 📁 目录结构

### version/ - 版本管理
- `CHANGELOG.md` - 版本更新记录
- `Progress.md` - 历史版本详细记录
- `VERSION-STATUS.md` - 当前版本发布状态

### release/ - 发布相关
- `发布总结-v1.2.24.md` - v1.2.24 版本发布总结
- `SIGNING.md` - APK 签名说明

### guide/ - 开发指南
- `开发指南.md` - 完整的开发流程文档
- `快速参考.md` - 常用命令快速查阅

### development/ - 开发文档
- `VOCAB_DEBUG_GUIDE.md` - 词库调试指南
- `优化.md` - 优化建议和待办事项
- `apk-git-export.md` - APK 导出说明

### assets/ - 资源文档
- `AI_ART_PROMPTS.md` - AI 绘图提示词
- `app-icon-1024.png` - 应用图标

## 📖 快速导航

### 新手入门
1. 阅读 [开发指南](guide/开发指南.md)
2. 查看 [快速参考](guide/快速参考.md)
3. 了解 [版本记录](version/Progress.md)

### 开发调试
- [词库调试](development/VOCAB_DEBUG_GUIDE.md)
- [优化建议](development/优化.md)

### 版本发布
- [版本更新记录](version/CHANGELOG.md)
- [发布流程](release/发布总结-v1.2.24.md)
- [APK 签名](release/SIGNING.md)

### 资源设计
- [AI 绘图提示词](assets/AI_ART_PROMPTS.md)
- [应用图标](assets/app-icon-1024.png)

## 🔄 文档维护

### 添加新文档
根据文档类型放入对应目录：
- 版本相关 → `version/`
- 发布相关 → `release/`
- 开发指南 → `guide/`
- 开发文档 → `development/`
- 资源文档 → `assets/`

### 更新文档
- 版本发布时更新 `version/CHANGELOG.md` 和 `version/Progress.md`
- 开发流程变更时更新 `guide/` 下的文档
- 新增功能或优化建议更新 `development/优化.md`

## 📝 文档规范

- 使用 Markdown 格式
- 文件名使用有意义的描述
- 中文文档使用中文文件名
- 英文文档使用英文文件名
- 保持文档结构清晰
- 及时更新过时内容
