# BOSS 模块拆分设计

## 背景与目标
- `src/modules/15-entities-boss.js` 过长、职责混杂，影响维护与迭代。
- 目标：将 Boss 基类、共享工具、各 Boss 行为拆分为独立模块，降低耦合，提高可读性。
- 约束：保持现有全局脚本加载方式；不移动/删除旧文件，仅拆分并调整脚本顺序。

## 拆分原则
- 保持全局行为不变，确保 Boss 逻辑与渲染结果一致。
- 共享工具函数与常量集中管理，避免跨文件重复。
- 每个 Boss 独立成文件，确保职责单一。
- 原文件保留为“空壳或最小入口”，不再承载完整实现。

## 新模块划分
### 1) Core（基类与注册表）
`src/modules/15-entities-boss-core.js`
- `BOSS_REGISTRY`
- `DEFAULT_BOSS_REWARDS`
- `Boss` 基类与通用逻辑

### 2) Shared（共享工具与视觉）
`src/modules/15-entities-boss-shared.js`
- 共享渲染函数（如 drawBlazeFigure）
- 共享常量（如 BOSS_VISUAL_TOKENS）
- 通用小工具（不会产生 Boss 专属行为）

### 3) Boss Classes（具体 Boss）
`src/modules/15-entities-boss-<boss>.js`
- `wither` / `ghast` / `blaze` / `wither-skeleton` / `warden` / `evoker`
- 每个文件仅包含对应 Boss 类

## 脚本加载顺序（Game.html）
保持核心依赖顺序：
1. `15-entities-boss-environments.js`
2. `15-entities-boss-shared.js`
3. `15-entities-boss-core.js`
4. 各 Boss 文件（wither/ghast/blaze/wither-skeleton/warden/evoker）
5. `15-entities-boss-dragon.js`

## 依赖约束
- Boss 类只能依赖 core + shared + environments 中提供的全局函数/常量。
- shared 不可反向依赖 Boss 类，避免循环依赖。
- core 不可依赖具体 Boss 类。

## 备份策略
在拆分前复制原文件：
`tmp/backup/15-entities-boss.js.<timestamp>.bak`

## 验证策略
- Playwright E2E（boss-debug-controls / p0-render-path / p2-biome-config）
- Playwright debug 页面手动观察（必要时）
