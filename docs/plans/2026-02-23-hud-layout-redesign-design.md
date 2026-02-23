# HUD 布局重构设计

日期：2026-02-23
范围：仅 `apk/` 目录，首页与游戏内 HUD 一致改造。

## 目标
- 将 HUD 改为三列两行布局：左 25% / 中 50% / 右 25%。
- 左侧放核心状态与主要操作；右侧放装备生态与次要操作。
- 中央为单词展示区，不遮挡交互按钮。

## 需求摘要
- 左侧 Row1：hp（爱心）+ score（金币）
- 左侧 Row2：inventory-status（背包）+ save（存档）
- 右侧 Row1：weapon（武器）+ level（生态/关卡）
- 右侧 Row2：settings（设置）+ pause（暂停）
- 单词展示区：只显示英文与中文（或短语与中文），不显示音标与词性。

## 方案
- 重构 HUD DOM 结构为 `hud-grid` 容器，三列两行。
- 中央列跨两行，承载单词展示区。

## 结构设计
```
<div class="hud-grid">
  <div class="hud-left">
    <div class="hud-row">hp + score</div>
    <div class="hud-row">inventory + save</div>
  </div>

  <div class="hud-center">
    <div id="word-display" class="word-display-title">Word</div>
    <div class="word-display-sub">中文</div>
  </div>

  <div class="hud-right">
    <div class="hud-row">weapon + level</div>
    <div class="hud-row">settings + pause</div>
  </div>
</div>
```

## 样式与动画
- HUD 保持现有半透明卡片风格与描边。
- 左/右按钮与状态统一高度和内边距，行内对齐。
- 中央单词区：英文大字居中，字母间距略增；中文在下方。
- 新单词出现：滑入 + 渐显（200–250ms），动画只在中央区域内。

## 数据与交互
- 沿用现有 `updateWordUI` 机制，只调整展示文案格式为：
  - 上行英文（或短语）
  - 下行中文
- 不新增词性/音标字段依赖。

## 风险与约束
- 需确保 `--ui-scale` 缩放与小屏设备下布局不溢出。
- HUD 层级保持 `pointer-events` 行为不变，避免遮挡游戏内点击。

## 测试要点
- 首页与游戏内 HUD 展示一致。
- 小屏设备下左右按钮不被中央区遮挡。
- 新词更新时动画正常且不影响按钮点击。
