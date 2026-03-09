# UI优化 Phase 2 实施计划

**分支**: `feat/ui-phase2-token-migration`
**目标**: 将styles.css中的硬编码值替换为CSS变量

---

## 📊 替换统计

根据代码扫描结果：

| 硬编码值 | 出现次数 | 目标变量 |
|---------|---------|---------|
| `#FFD700` / `#ffd700` | 26次 | `var(--color-accent)` |
| `#4CAF50` / `#4caf50` | 10次 | `var(--color-primary)` |
| `rgba(0, 0, 0, 0.55)` | 1次 | `var(--color-bg-overlay)` |
| `rgba(20, 20, 20, 0.95)` | 1次 | `var(--color-bg-panel)` |
| `rgba(255, 255, 255, 0.4)` | 多次 | `var(--color-border-primary)` |

**预计替换总数**: 50+ 处

---

## 🎯 实施步骤

### Step 1: 补充缺失的设计令牌

需要添加到 `src/styles/01-tokens/colors.css`:
- `--color-success` / `--color-warning` / `--color-error` / `--color-info`
- `--color-text-tertiary` / `--color-text-disabled`
- `--color-border-secondary` / `--color-border-focus`
- `--color-bg-secondary`

需要添加到 `src/styles/01-tokens/spacing.css`:
- `--shadow-sm` / `--shadow-md` / `--shadow-lg` / `--shadow-xl`
- `--z-hud` / `--z-word-card` / `--z-overlay` / `--z-modal`

需要添加到 `src/styles/01-tokens/typography.css`:
- `--font-size-xs` (10px)
- `--font-size-3xl` (32px)
- `--font-weight-black` (900)
- `--line-height-tight` / `--line-height-normal`

### Step 2: 批量替换颜色值

使用sed命令批量替换：
```bash
# 金色 accent
sed -i 's/#FFD700/var(--color-accent)/gi' src/styles.css
sed -i 's/#ffd700/var(--color-accent)/gi' src/styles.css

# 绿色 primary
sed -i 's/#4CAF50/var(--color-primary)/gi' src/styles.css
sed -i 's/#4caf50/var(--color-primary)/gi' src/styles.css

# 背景色
sed -i 's/rgba(0, 0, 0, 0\.55)/var(--color-bg-overlay)/g' src/styles.css
sed -i 's/rgba(20, 20, 20, 0\.95)/var(--color-bg-panel)/g' src/styles.css
```

### Step 3: 手动替换复杂值

需要人工判断的替换：
- 不同透明度的黑色背景
- 不同透明度的白色边框
- 特殊场景的颜色（如hover状态）

### Step 4: 运行测试验证

```bash
npm run test:e2e -- deep-ui-analysis.spec.mjs
```

### Step 5: 视觉对比

对比优化前后的截图，确保无视觉回归。

---

## ✅ 验收标准

- [ ] 所有硬编码的 `#FFD700` 替换为 `var(--color-accent)`
- [ ] 所有硬编码的 `#4CAF50` 替换为 `var(--color-primary)`
- [ ] 所有硬编码的 `rgba(0,0,0,0.55)` 替换为 `var(--color-bg-overlay)`
- [ ] 所有硬编码的 `rgba(20,20,20,0.95)` 替换为 `var(--color-bg-panel)`
- [ ] Playwright测试 11/11 通过
- [ ] 无视觉回归（截图对比）
- [ ] CSS变量使用率从27处提升到50+处

---

## 📝 注意事项

1. **渐进式替换**: 每次替换一类值，立即测试
2. **保留备注**: 在复杂替换处添加注释说明
3. **避免过度替换**: 某些特殊值（如动画时间）可能不需要变量化
4. **测试优先**: 每次修改后运行测试，确保无破坏

---

**创建时间**: 2026-03-05 22:40
**预计完成**: 2026-03-05 23:30
