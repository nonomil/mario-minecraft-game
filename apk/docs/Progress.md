# 版本修订记录（Progress）

> 目的：记录每个版本的变更摘要与版本信息，确保与 APK 版本号保持一致。

## 版本编号与规范
采用语义化版本：`MAJOR.MINOR.PATCH`
- **MAJOR**：重大版本变更（系统/架构/资源大改、核心玩法重构等）
- **MINOR**：新增功能（新关卡/新机制/新模式等）
- **PATCH**：小范围修复与优化（bug 修复、微 UI 调整、体验优化等）

> 对应关系：
> - **Android**：`versionName` = 语义化版本；`versionCode` 每次发布 +1
> - **版本记录**：每次发布新增一条版本记录，且必须与 `versionName` 一致

## 模板（复制使用）
```markdown
## vX.Y.Z（发布日期：YYYY-MM-DD）
- 类型：MAJOR / MINOR / PATCH
- APK 版本：versionName = X.Y.Z，versionCode = N
- 构建方式：本地 / CI（GitHub Actions）
- 主要变更
  - ...
  - ...
- 安装说明
  - 如需覆盖安装，请保持同签名且提升 versionCode
- 备注
  - ...
```

## 修订记录

## v1.2.3（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.3，versionCode = 16
- 主要变更
  - 修复部分环境下启动报错导致“无人物/无场景/无法点击”的问题（可选配置缺失时不再崩溃）
  - 修复配置文件加载路径，确保 Web 与 APK 构建目录下均能正确读取 config/words
  - 修复设置页操作提示乱码，积分图标改为金币显示

## v1.2.2（发布日期：2026-02-03）
- 类型：PATCH
- APK 版本：versionName = 1.2.2，versionCode = 15
- 主要变更
  - 修复部分 UI 文本乱码/编码问题
  - 修复分辨率适配与 APK 构建流程问题
  - 完善 GitHub Actions 自动构建 APK workflow

## v1.2.1（发布日期：2026-02-03）
- 类型：PATCH
- APK 版本：versionName = 1.2.1，versionCode = 14
- 主要变更
  - 修复铁镐挖地提示乱码
  - 宝箱不再额外弹出单词（仅掉落资源/道具/血量/分数）
  - 修复部分 UI 文本乱码
  - 触发 GitHub Actions 重新编译 APK

## v1.2.0（发布日期：2026-02-03）
- 类型：MINOR
- APK 版本：versionName = 1.2.0，versionCode = 13
- 构建方式：本地构建 + Release 签名
- 主要变更
  - 新增地下洞穴/矿洞玩法与敌人
  - 增强敌人 AI（远程/近战等行为）
  - 新增游戏难度（易/中/难）与实时效果调整
  - 优化性能与资源加载
- 安装说明
  - 如需覆盖安装，请保持同签名且提升 versionCode
