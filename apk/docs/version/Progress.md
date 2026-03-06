## v1.19.10（发布日期：2026-03-06）
- 类型：FEATURE（消耗性装备系统 + 长按触发机制 + Debuff 系统）
- APK 版本：versionName = 1.19.10，versionCode = 65（buildNumber = 65）
- 主要完成项：
  - 消耗性装备槽：独立于主武器的装备位，支持背景素材。
  - 长按触发：通过 Pointer Events API 实现攻击键长按逻辑。
  - Debuff 系统：配置驱动的状态效果，带视觉反馈与抗堆叠机制。
  - 粒子池优化：对象池化处理火花粒子，提升性能。
  - UI 增强：HUD 联动显示与 CSS 动画反馈。
- 验证结果：
  - 手动测试长按触发、粒子效果、Debuff 伤害逻辑。
  - 验证版本号同步与 PWA 缓存刷新。

## v1.19.9（发布日期：2026-03-04）
- 类型：PATCH（并行开发合入 + 性能/存档/配置加固 + PWA/TTS 链路完善）
- APK 版本：versionName = 1.19.9，versionCode = 64（buildNumber = 64）
- 主要完成项：
  - 并行开发合入：UI 基础设施、PWA 基础设施、音效系统增强、TTS Provider 抽象与落地。
  - 性能优化：主循环性能监控、碰撞检测 early-exit、异常处理与状态恢复。
  - 存档与配置加固：存档版本管理/压缩、备份恢复、配置加载校验与兜底。
  - PWA：Service Worker 引导与缓存策略版本化，并与 `version.json` 联动，减少旧缓存问题。
  - 修复：`12-challenges.js` 异常捕获语法问题。
- 验证结果：
  - `tools/build-singlefile.js` 单文件构建链路通过（无残留 `src/modules/*` 外链脚本）。
  - APK 构建与发布由 GitHub Actions 执行并产出 release apk。

## v1.18.56（发布日期：2026-02-25）
- 类型：PATCH（APK 触控图标与位置对齐修复 + 发布说明链路修正）
- APK 版本：versionName = 1.18.56，versionCode = 56（推送后由 Actions 自动递增）
- 主要完成项：
  - 触控区 7 个按钮图标回退为 `v1.18.42` 目标样式。
  - HUD 顶部“重读/暂停”图标恢复为 `🔊`。
  - 移除 `text-size-adjust` 相关样式，降低 WebView 下图标缩放偏差。
  - 补齐发布说明文档：`v1.18.54`、`v1.18.55`、`v1.18.56`。
  - 发布 workflow 改为优先读取 `apk/docs/release/发布说明-v<version>.md` 作为 GitHub Release 说明。
- 验证结果：
  - 已执行构建与文件一致性核对，待 GitHub Actions 完成 APK 构建产物验证。

## v1.18.55（发布日期：2026-02-24）
- 类型：PATCH（推送脚本可用性修复）
- APK 版本：versionName = 1.18.55，versionCode = 55
- 主要完成项：
  - `push.bat` 自动模式、dry-run 与无暂停参数行为修复。

## v1.18.54（发布日期：2026-02-24）
- 类型：PATCH（HUD/触控布局对齐发布）
- APK 版本：versionName = 1.18.54，versionCode = 54
- 主要完成项：
  - 发布 HUD 与触控尺寸对齐改动。

## v1.18.53（发布日期：2026-02-24）
- 类型：PATCH（HUD 尺寸对齐 + 平台高度约束）
- APK 版本：versionName = 1.18.53，versionCode = 53
- 主要完成项：
  - HUD/单词/触控按钮字体与尺寸对齐 v1.18.42。
  - 悬浮/云/微平台高度限制为屏幕高度 50%，且纵向堆叠最多 2 格。
  - 新增 HUD 字体/触控按钮尺寸回归用例。
  - 新增平台高度与堆叠限制回归用例。
- 验证结果：
  - 本机 Playwright 端口 4173 权限受限，未执行自动化测试（由 Actions 构建后验证）。

## v1.18.46（发布日期：2026-02-23）
- 类型：PATCH（开局弹窗文案修正 + APK 构建同步）
- APK 版本：versionName = 1.18.46，versionCode = 46
- 主要完成项：
  - 开局弹窗标题去重，仅保留顶部主标题。
  - 副标题增加一句：挑战关卡，获取奖励与新武器。
  - build:apk / build:apk:release 先执行 build + sync，确保 APK 与网页资源一致。
- 验证结果：
  - 手动确认 `apk/Game.html` 与 APK 构建后的内容一致（build 后）。
## v1.18.34（发布日期：2026-02-21）
- 类型：PATCH（词库发布链路加固 + 初中/补充包质量修复）
- APK 版本：versionName = 1.18.34，versionCode = 34
- 主要完成项：
  - 修复 `words/vocabs/manifest.js` 的路径映射异常，消除词库文件路径解析风险。
  - 强化 `vocab-db` 发布链路：
    - `publish` 增加 `dedup + validate + audit`
    - `validate` 增加 `missing chinese` 失败闸门
    - `publish` 在审计存在 BLOCKER 时失败（作用域：初中与两个补充包）
  - 修复 `import.mjs` 图片导入逻辑为增量合并，避免覆盖历史图片。
  - 初中/补充包数据清洗：
    - 清除占位符短语翻译
    - 补齐空短语
    - 统一 `stage/category/difficulty` 字段
- 验证结果：
  - `npm run vocab:db:import` 通过（missingFiles=0）
  - `npm run vocab:db:publish` 通过
  - `npm run test:e2e -- tests/e2e/specs/p0-vocab-pack-switch.spec.mjs` 通过
## v1.18.33（发布日期：2026-02-21）
- 类型：PATCH（初中词库分级与短语补齐）
- APK 版本：versionName = 1.18.33，versionCode = 33
- 主要完成项：
  - 初中词库新增三档：`vocab.junior_high.basic` / `vocab.junior_high.intermediate` / `vocab.junior_high.advanced`。
  - 保留完整包 `vocab.junior_high`，并重生成词条短语字段，支持“单词 + 短语”显示链路。
  - 新增文件：
    - `words/vocabs/05_初中/junior_high_basic.js`
    - `words/vocabs/05_初中/junior_high_intermediate.js`
    - `words/vocabs/05_初中/junior_high_advanced.js`
  - 更新 E2E：`p0-vocab-pack-switch.spec.mjs`，验证初中四个包可切换。
## v1.18.32（发布日期：2026-02-21）
- 类型：PATCH（词库系统扩展 + 初中词库上线）
- APK 版本：versionName = 1.18.32，versionCode = 32
- 主要完成项：
  - 完成 `vocab-db` 工具增强：支持本地文件导入、CSV/TSV 解析、外部导入字段补全与按需激活。
  - 新增 `export-pack` 工具：可从数据库按 `source_pack` 导出运行时词库 JS 并自动挂载 `manifest`。
  - 联网调研并导入初中词库，发布 `vocab.junior_high`。
  - 联网调研并下载幼儿园/小学外部词表，完成对比、去重导入与补充包生成：
    - `vocab.kindergarten.supplement`
    - `vocab.elementary_lower.supplement`
  - 词库切换 E2E 用例通过：`p0-vocab-pack-switch.spec.mjs`。
  - 发布前校验通过：`vocab:db:publish`、`vocab:db:dedup`。
## v1.18.22（发布日期：2026-02-20）
- 类型：PATCH（0220 多版本需求合并）
- 版本策略：
  - 当前仓库基线更新至 `1.18.21`
  - 推送后由 GitHub Actions 自动 patch 递增并发布 `1.18.22`
- 主要完成项：
  - 需求13：村庄/室内文案与显示优化，村民尺寸上调
  - 需求14：BOSS 血量翻倍、血条阶段文案优化、BOSS 战武器锁定为剑
  - 需求15：商人屋交易（卖材料换钻石）与护甲商店（钻石购买护甲）
  - 需求16：末影珍珠 60 秒隐身（隐身期间免受伤害）
  - 需求17：门禁小 BOSS 轮换机制（不再固定凋零）
  - 防晒霜机制：5 钻购买，180 秒，联动沙漠/地狱/火山/岩浆伤害逻辑
## v1.18.17（发布日期：2026-02-20）
- 类型：PATCH
- APK 版本：versionName = 1.18.17，versionCode = 17（由 CI 发布流程自动递增）
- 主要变更
  - 需求12：室内模式保留角色形象，进入后角色位于中间位置。
  - 室内左右移动速度限制为正常最高速度的 50%。
  - 室内交互点重排：门口在一侧、床/单词测试点在另一侧。
  - 改为“靠近自动触发”交互：门口自动离开、床自动休息、词屋自动开始测试。
  - 增加室内文字提示（门口/床/测试点）。

---
## 历史记录说明
- 以前版本记录曾在 Windows 终端编码链路中发生了不可逆的字符替换（例如：`?` / 乱码占位符 / 乱码片段）。
- 为避免误导与继续污染，已暂时移除该段文本；后续可从旧仓库或备份 commit 恢复。

