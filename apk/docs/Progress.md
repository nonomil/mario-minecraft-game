## v1.2.23（发布日期：2026-02-12）
- 类型：PATCH
- APK 版本：versionName = 1.2.23，versionCode = 36
- 主要变更
  - 重构：main.js 拆分为 20 个模块文件，单个文件不超过 1000 行
  - 重构：14-renderer.js 拆分为 main/entities/decorations 三个文件
  - 重构：15-entities.js 拆分为 base/decorations/particles/combat 四个文件
  - 清理：删除重复的模块文件，统一使用 src/modules/ 目录结构
  - 优化：代码组织更清晰，便于维护和协作开发

## v1.2.22（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.22，versionCode = 35
- 主要变更
  - 文档：补充优化事项（游戏结束存档、复活方式选择等）
## v1.2.21（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.21，versionCode = 34
- 主要变更
  - 修复：强制横屏模式，避免横竖屏切换导致的全屏显示问题
  - 修复：groundY 计算使用正确的物品栏高度（70px 而非 48px）
  - 新增：视口变化时的世界坐标重映射功能（remapWorldCoordinates）
  - 优化：AndroidManifest.xml 添加 screenOrientation="sensorLandscape"

## v1.2.19（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.19，versionCode = 32
- 主要变更
  - 修复：横屏全屏显示超出屏幕问题，groundY 计算改为基于 canvas 高度减去物品栏高度
  - 修复：单词库切换不生效问题，词库文件加载改为顺序加载（避免并行加载时脚本未执行完毕）
  - 修复：单词图片不显示问题，添加网络安全配置允许加载外部图片资源
  - 优化：main.core.js 中 applyResponsiveCanvas 函数同步修复 groundY 计算
  - 新增：network_security_config.xml 配置文件，支持 img.icons8.com、twemoji.maxcdn.com 等图片域名

## v1.2.18（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.18，versionCode = 31
- 主要变更
  - 修复：APK 构建时词库文件提取正则表达式错误，解决单词库无法加载问题
  - 修复：横屏全屏时地面超出屏幕问题，将地面高度设置为物品栏上边框位置
  - 优化：地面位置计算更加合理，适配不同屏幕尺寸

## v1.2.17（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.17，versionCode = 30
- 主要变更
  - 修复：单词库文件夹和文件名改为英文，解决 APK 中文路径加载失败问题
  - 修复：移除 FLAG_LAYOUT_NO_LIMITS 标志，解决全屏模式下内容超出屏幕的问题
  - 优化：更新 manifest.js 中所有词库文件路径为英文路径
  - 文档：同步主项目文档到 apk/docs 目录

## v1.2.16（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.16，versionCode = 29
- 主要变更
  - 修复：单词库切换问题深度修复，解决 Manifest 加载时序问题
  - 新增：调试指南文档 `docs/VOCAB_DEBUG_GUIDE.md`
  - 新增：AI 绘图提示词文档 `docs/AI_ART_PROMPTS.md`
  - 优化：添加完整的调试日志系统（[Vocab]、[Settings]、[Storage] 标签）

## v1.2.15（发布日期：2026-02-08）
- 类型：PATCH
- APK 版本：versionName = 1.2.15，versionCode = 28
- 主要变更
  - 修复：单词库切换不生效问题，设置保存函数改为异步
  - 修复：横屏全屏适配问题，物品栏和触控按钮添加安全区域支持
  - 优化：Android 端添加刘海屏/挖孔屏支持
  - 优化：改进不同手机型号的屏幕兼容性

## v1.2.14（发布日期：2026-02-06）
- 类型：PATCH
- APK 版本：versionName = 1.2.14，versionCode = 27
- 主要变更
  - 需求9：海洋场景改为海草/海洋装饰，不再生成树木；海洋敌人替换为溺尸/河豚
  - 需求10：学习测验优化为字母填空选择题，时长调整为 15s
  - 需求11：单词连线复活倒计时防交互中断，仅一次机会；地狱持续扣血改为入场扣血
  - 新增：背包入口与背包面板（基础展示）

## v1.2.13（发布日期：2026-02-06）
- 类型：PATCH
- APK 版本：versionName = 1.2.13，versionCode = 26
- 主要变更
  - 修复：运行中分辨率变化导致“重新开始/闪退”的问题，改为自动暂停并提示
  - 修复：游戏结束时“积分复活”按钮缺失，分数不足时显示禁用提示
  - 优化：入场弹窗改为两页自动切换，支持档案选择/继续/重玩
  - 优化：英文 TTS 恢复发音（原生/浏览器/在线兜底）
  - 资源：更新应用图标（mipmap 全密度）

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


