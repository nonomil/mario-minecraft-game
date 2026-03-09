# 模块化迁移说明（C 分支）

## 本次提交范围

1. 创建 `src/styles/index.css` 作为模块化入口。
2. 创建 tokens 与 components 最小可用骨架。
3. 保留 `@import "../styles.css"` 作为迁移过渡 fallback。

## 迁移策略

1. 先建立目录和导入顺序，再迁移具体样式。
2. 每次迁移一个组件簇（按钮/弹窗/表单/HUD），避免超大 diff。
3. 迁移完成后再移除 legacy fallback。
