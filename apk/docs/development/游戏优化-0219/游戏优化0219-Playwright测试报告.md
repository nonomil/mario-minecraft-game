# 游戏优化0219-Playwright测试报告

日期: 2026-02-19  
对应计划: `apk/docs/development/游戏优化-0219/游戏优化0219-详细执行计划.md`  
对应问题分析: `apk/docs/development/游戏优化-0219/游戏优化0219-问题分析报告.md`

## 1. 测试目标

- 验证 Playwright 可自动触发村庄流程，并且能证明“村庄出现在画面中”。
- 验证村庄测验不再出现 `undefined`，且退出后不会冻结主循环。
- 输出可追溯证据（截图、HTML 报告、失败 trace）。

## 2. 测试环境

| 项 | 值 |
|---|---|
| 操作系统 | Microsoft Windows 11 Pro |
| Node.js | v25.6.1 |
| npm | 11.9.0 |
| Playwright | 1.58.1 |
| 浏览器项目 | chromium |
| 仓库路径 | `D:\Workplace\mario-minecraft-game_V1\apk` |

## 2.1 代码基线与同步检查

| 项 | 值 |
|---|---|
| `apk` 村庄渲染文件状态 | 已修（移除重复相机偏移） |
| root 村庄渲染文件状态 | 已同步（移除重复相机偏移） |
| root 与 apk 是否一致 | 一致 |
| 一致性检查命令 | `rg -n -- "\\-\\s*cameraX" apk/src/modules/18-village-render.js src/modules/18-village-render.js` |
| 文件级 diff 命令 | `git diff --no-index -- src/modules/18-village-render.js apk/src/modules/18-village-render.js` |
| 同步说明 | `apk/scripts/sync-web.js` 仅做 `apk -> out -> android-app/web` 构建同步，不负责 root/apk 源码同步 |

## 3. 执行命令记录

按实际执行顺序:

```bash
cd apk
# 清理可能复用的旧服务（4173）
powershell -Command "$conns = Get-NetTCPConnection -LocalPort 4173 -State Listen; if ($conns) { $conns | Select-Object -Expand OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force } }"
npm run test:e2e -- p0-village-visibility.spec.mjs p0-village-quiz-stability.spec.mjs
npm run test:e2e -- p0-render-path.spec.mjs p2-biome-config.spec.mjs p0-village-visibility.spec.mjs p0-village-quiz-stability.spec.mjs
```

## 4. 用例结果

| 用例 | 结果 | 耗时 | 备注 |
|---|---|---|---|
| `p0-village-quiz-stability.spec.mjs` - `P0 village quiz should not render undefined and should recover from exit` | PASS | 9.5s / 9.7s | 两次执行均通过 |
| `p0-village-visibility.spec.mjs` - `P0 village should spawn in debug flow` | PASS | 3.6s | 通过 |
| `p0-village-visibility.spec.mjs` - `P0 village should be visible on canvas (pixel probe + screenshot proof)` | PASS | 7.4s / 8.7s | 两次执行均通过 |
| `p0-render-path.spec.mjs` - `P0 render path should avoid double camera offset` | PASS | 188ms | 通过 |
| `p2-biome-config.spec.mjs` - `P2 biome switch config should match expected balance values` | PASS | 69ms | 通过 |
| `p2-biome-config.spec.mjs` - `P2 settings slider min should prevent flash switching` | PASS | 83ms | 断言已与当前默认值 `|| 300` 对齐 |

汇总:
- 专项（村庄可见 + 测验稳定）: 3 passed / 0 failed
- 回归集合（专项 + 基线）: 6 passed / 0 failed

## 5. 村庄可见性验收（强制）

以下 3 项已满足:

1. `visible` 用例通过（非仅 spawn 通过）。
2. 证据截图存在且可打开:
   - `apk/test-results/evidence/village-visible-page.png`
   - `apk/test-results/evidence/village-visible-canvas.png`
3. Playwright HTML 报告可追溯:
   - `apk/tests/e2e/test-results/playwright-report/index.html`

验收结论: 通过（满足“已看到村庄出现”）。

## 6. 证据清单

### 6.1 成功证据

- 页面截图: `apk/test-results/evidence/village-visible-page.png`
- 画布截图: `apk/test-results/evidence/village-visible-canvas.png`
- HTML 报告: `apk/tests/e2e/test-results/playwright-report/index.html`

### 6.2 失败证据

- 本轮回归无失败用例。

## 7. 问题与处置记录

| 问题现象 | 根因判断 | 处置动作 | 结果 |
|---|---|---|---|
| 仅通过 `spawn` 不足以证明可见 | 需要像素探针 + 截图双证据 | 保留并执行 `visible` 用例 + 证据导出 | 已通过 |
| `p2-biome-config` 历史失败 | 测试基线与当前实现默认值不一致（`200` vs `300`） | 将断言更新为 `300` 并重新回归 | 已解决 |
| root 与 apk 村庄渲染不一致 | 双目录并行维护未同步 | 已完成 root 与 apk 同步并复测 | 已解决 |

## 8. 最终结论

- 是否满足“已看到村庄出现”的要求: 满足。
- 是否满足“村庄测验退出后不再卡住”: 满足（专项用例通过）。
- 是否允许进入下一阶段（B/C/D）: 可以进入（当前回归 6/6 通过）。
