## v1.2.12（发布日期：2026-02-06）
- 类型：PATCH
- Hotfix：修复账号登录页“连接”按钮无响应（启动阶段异常导致 initLoginScreen 未完成事件绑定）。
- QA：新增 Playwright 端到端(E2E)测试覆盖需求 1~8（`npm test`）。
- APK 版本：versionName = 1.2.12，versionCode = 25
- 构建方式：本地构建
- 主要变更
  - 词库与设置打通：manifest 恢复 byId、setActiveVocabPack 支持多文件、词库预览/切换提示、保存时清屏并立刻生成新词
  - 死亡复活与学习流程：积分复活按钮、学习挑战/词语匹配 modal、word gate、account/achievement/storage/auto-save、复活保留分数
  - 装备与 AI 完善：宝箱装备掉落、双击装备 UI、盔甲减伤/更新、傀儡跳跃+掉落恢复、移动速度档位及 armor HUD、hud/learning UI 完善
- 安装说明
  - 覆盖安装请保持签名一致并提升 versionCode
- 备注
  - 本次版本对表内所有学习增强需求做了实现与整理，建议同步发布 GitHub Release（见 tag v1.2.12）

## v1.2.11（发布日期：2026-02-05）
- 类型：PATCH
- APK 版本：versionName = 1.2.11，versionCode = 24
- 主要变更
  - 词库更新：整合 v1.2.10 最新词库，修复格式与内容问题
  - 修复：修复部分单词发音与显示异常

## v1.2.10（发布日期：2026-02-05）
- 类型：PATCH
- APK 版本：versionName = 1.2.10，versionCode = 23
- 主要变更
  - 修复全屏显示底部物品栏在部分设备被遮挡问题
  - 词库文件全量扫描并修复语法/格式问题
  - 补齐缺失的翻译，统一同步到 `apk/词库`

## v1.2.9（发布日期：2026-02-05）
- 类型：PATCH
- APK 版本：versionName = 1.2.9，versionCode = 22
- 主要变更
  - 设置页操作提示升级为“图标 + 按键 + 文字”，并复用到启动/暂停弹窗
  - 修复 Progress.md 文件头部乱码（添加 UTF-8 类型标识并修正内容）

## v1.2.8（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.8，versionCode = 21
- 主要变更
  - 优化设置页操作提示：图标 + 按键 + 文字（并在启动弹窗复用）

## v1.2.7（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.7，versionCode = 20
- 主要变更
  - 修复与优化：界面文案/显示、操作提示与移动端适配相关问题

# 版本修订记录（Progress）

> 目的：记录每个版本的变更摘要与版本信息，确保与 APK 版本号保持一致

## 版本编号与规范
采用语义化版本：`MAJOR.MINOR.PATCH`
- **MAJOR**：重大版本变更（系统/架构/资源大改、核心玩法重构等）
- **MINOR**：新增功能（新关卡、新机制、新模式等）
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

## v1.2.6（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.6，versionCode = 19
- 主要变更
  - 修复 APK 版本不发音的问题：在原生端自动注册并调用 Capacitor TextToSpeech 插件；Web Speech/在线 TTS 作为兜底
  - App 隐藏到后台时自动停止背景音乐；回到前台按设置恢复播放

## v1.2.5（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.5，versionCode = 18
- 主要变更
  - 修复部分设备单词朗读不触发的问题：增加 voices 就绪检测与重试，确保中英文朗读恢复

## v1.2.4（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.4，versionCode = 17
- 主要变更
  - 全屏适配稳定性增强：使用 visualViewport + safe-area 计算可用画布尺寸，并监听 visualViewport 变化修正（减少越用越超出屏幕的问题）
  - 设置页新增游戏难度选择（自适应/固定档位），并移除顶部 HUD 的难度/新手提示
  - 触屏按钮增加半透明白色圆圈并扩大点击范围，提升手机操作手感
  - 设置面板可滚动，保存按钮置顶（sticky）

## v1.2.3（发布日期：2026-02-04）
- 类型：PATCH
- APK 版本：versionName = 1.2.3，versionCode = 16
- 主要变更
  - 修复部分环境下启动报错导致无人物/无场景无法点击的问题（可选配置缺失时不再崩溃）
  - 修复配置文件加载路径，确保 Web / APK 构建目录下均能正确读取 config/words
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

