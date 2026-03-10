# 合成模式菜单重构 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复合成面板“卡住”问题，并按方案 C 完成菜单重构与多选交互。

**Architecture:** 统一 `inventory-modal` 样式规则，使 `crafting-modal` 正常显示/隐藏；在合成面板中增加配方填充与材料多选控制，状态提示实时反馈。

**Tech Stack:** HTML + CSS + JS（Canvas 游戏 UI）。

---

### Task 1: 修复合成面板显示/隐藏

**Files:**
- Modify: `src/styles/20-touch-controls.css`

**Steps:**
1. 将 `#inventory-modal` 样式升级为 `.inventory-modal` 通用规则
2. `visible` 状态改为 `.inventory-modal.visible`
3. 复查 `#crafting-modal` 在关闭时是否真正 `display: none`

---

### Task 2: 更新合成菜单结构（方案 C）

**Files:**
- Modify: `Game.html`

**Steps:**
1. 增加“已选材料栏 + 芯片容器”
2. 增加“自动填充”按钮
3. 保留原配方区、材料区与合成按钮

---

### Task 3: 改造合成交互逻辑

**Files:**
- Modify: `src/modules/01-config.js`
- Modify: `src/modules/16-events.js`
- Modify: `src/modules/13-game-loop.js`

**Steps:**
1. 新增 DOM 引用与按钮事件绑定
2. 增加配方选择、自动填充、材料 `+ / −` 调节
3. 更新渲染逻辑：配方高亮、缺少/多选提示、按钮状态

---

### Task 4: 样式细化

**Files:**
- Modify: `src/styles/20-touch-controls.css`

**Steps:**
1. 配方卡 hover/active 高亮
2. 已选材料芯片样式
3. 材料卡 `+ / −` 控件布局

---

### Task 5: Playwright 调试验证

**Steps:**
1. 打开合成面板 → 选择配方/材料
2. 使用 `+ / −` 调整数量
3. 合成成功后关闭面板，确认不再阻挡点击
