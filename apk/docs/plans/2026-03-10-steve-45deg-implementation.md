# Steve 45° Right-Front Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `drawSteve` 由正面视觉调整为 45° 右前方（镜像兼容左前），提升立体感且不影响碰撞尺寸。

**Architecture:** 通过“近侧加宽/加亮、远侧收窄/加暗”的像素处理实现 3/4 视角；保持原有 26x52 外接尺寸和武器/护甲逻辑。

**Tech Stack:** JavaScript + Canvas 2D（`src/modules/14-renderer-entities.js`）。

---

### Task 1: 调整 Steve 头部 3/4 视觉

**Files:**
- Modify: `src/modules/14-renderer-entities.js`

**Step 1: 写（或更新）视觉回归说明**

记录变更目标与范围（见设计文档）。

**Step 2: 更新眼睛/鼻子/胡子位置**

- 近眼更完整，远眼收窄并向中心偏移  
- 鼻子与胡子向近侧偏移  
- 增加远侧脸颊阴影带

**Step 3: 本地目测验证**

启动游戏或运行现有渲染预览流程，观察 Steve 头部是否呈 45° 右前方。

---

### Task 2: 调整躯干与四肢 3/4 视觉

**Files:**
- Modify: `src/modules/14-renderer-entities.js`

**Step 1: 调整手臂宽度与高光**

近侧手臂略加宽并加高光，远侧略收窄并加暗部。

**Step 2: 调整腿部宽度与阴影**

近侧腿略加宽，远侧略收窄；阴影位置与近/远侧保持一致。

**Step 3: 本地目测验证**

检查四肢是否保持 26x52 轮廓不变，武器与护甲显示是否自然。

---

### Task 3: 提交变更

**Files:**
- Stage: `src/modules/14-renderer-entities.js`
- Stage: `docs/plans/2026-03-10-steve-45deg-design.md`
- Stage: `docs/plans/2026-03-10-steve-45deg-implementation.md`

**Step 1: git add**

Run: `git add src/modules/14-renderer-entities.js docs/plans/2026-03-10-steve-45deg-design.md docs/plans/2026-03-10-steve-45deg-implementation.md`

**Step 2: git commit**

Run: `git commit -m "style: update Steve 45deg view"`
