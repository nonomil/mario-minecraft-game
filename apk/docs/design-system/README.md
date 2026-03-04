# UI 设计令牌规范（v1）

本文档定义 `feat/ui-foundation-v2` 分支的令牌冻结清单，供并行分支消费。

## 冻结范围

1. 颜色：`--color-*`
2. 字体：`--font-*`
3. 间距：`--space-*`
4. 圆角：`--radius-*`
5. 层级：`--z-*`

## 使用约束

1. 组件分支（B/C）不得自行新增同义令牌。
2. 旧硬编码值迁移时，优先查 `token-mapping.md`。
3. 若需要新增令牌，必须先在本分支更新并同步变更日志。

## 关联文件

1. `src/design-tokens.css`
2. `docs/design-system/token-mapping.md`
