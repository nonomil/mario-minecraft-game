# 2026-02-26 游戏优化执行计划

## 0. 执行路径（新增）

本计划按以下固定路径执行，禁止跳步：

1. `main` 工作区先清理
2. 新建 `worktree` + `feat/optimization-0226`
3. 在 `apk/` 落地 7 个任务（TDD，逐任务提交）
4. 推送功能分支
5. 功能分支 CI 验证 APK 构建通过
6. 合并到 `main`
7. 推送 `main`，触发正式发布流水线

## 1. 分支与目录

- 仓库根：`G:/UserCode/Mario_Minecraft/mario-minecraft-game_V1`
- 工作树：`G:/UserCode/Mario_Minecraft/worktree-optimization-0226`
- 分支：`feat/optimization-0226`
- 有效开发目录：`apk/`

## 2. 任务顺序

1. 存档导出/导入码
2. 关卡结束复盘
3. 移动端触控布局优化
4. 词库导入功能
5. 学习数据可视化 + 弱词清单
6. 成就系统深化
7. PWA 离线支持

## 3. 验证标准

- 每个任务至少有一个可复现验证命令
- `node scripts/sync-web.js` 成功
- Android Debug APK 可成功构建
- 功能分支 CI 通过后才允许合入 `main`

## 4. 合入规则

- 合并方式：`--no-ff`
- 合并前必须同步远端 `main`
- 合并后推送 `main` 触发正式 CI
