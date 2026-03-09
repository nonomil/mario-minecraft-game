# 字体大小审查报告

## 审查日期
2026-03-06

## 审查范围
- 首页进入游戏弹窗（开始界面）
- 设置说明弹窗
- 商人村庄弹窗
- 单词测验弹窗
- 其他游戏内弹窗

## 当前字体大小分析

### 1. 开始界面弹窗 (overlay-start)
**文件**: `src/styles/00-base-and-layout.css`

| 元素 | 当前字体大小 | 问题 |
|------|------------|------|
| `.overlay-title` | `clamp(12px, 2vw, 16px)` | 标题偏小 |
| `.overlay-text` | `clamp(8px, 1.35vw, 10px)` | **严重偏小，最小8px难以阅读** |
| `.overlay-intro-title` | `clamp(13px, 2.6vw, 19px)` | 可接受 |
| `.overlay-intro-hero` | `clamp(15px, 3vw, 21px)` | 可接受 |
| `.overlay-intro-sub` | `clamp(9px, 2vw, 12px)` | 偏小 |
| `.overlay-key-row` | `clamp(8px, 1.45vw, 11px)` | **严重偏小** |
| `.overlay-account-hint` | `9px` | **固定9px太小** |
| `.overlay-input` | `10px` | 偏小 |
| `.overlay-hints-text` | `clamp(9px, 2vw, 12px)` | 偏小 |
| `.overlay-btn` | `clamp(8px, 1.45vw, 10px)` | **按钮文字太小** |

### 2. 单词测验弹窗 (learning-modal)
**文件**: `src/styles/00-base-and-layout.css`

| 元素 | 当前字体大小 | 问题 |
|------|------------|------|
| `.learning-modal-header` | `clamp(18px, 2.5vw, 24px)` | 合适 |
| `.learning-modal-question` | `clamp(15px, 2.2vw, 20px)` | 合适 |
| `.challenge-fill-word` | `clamp(22px, 4vw, 34px)` | 合适 |
| `.challenge-fill-word.phrase` | `clamp(16px, 2.8vw, 24px)` | 合适 |
| `.challenge-fill-hint` | `14px` | 合适 |
| `.challenge-fill-zh` | `15px` | 合适 |
| `.learning-modal-options button` | `clamp(13px, 2.2vw, 16px)` | 合适 |
| `.learning-modal-input input` | `20px` | 合适 |
| `.learning-modal-timer` | `24px` | 合适 |
| `.challenge-hint-btn` | `11px` | 偏小 |

### 3. 村庄挑战弹窗 (village-challenge)
**文件**: `src/styles/40-leaderboard-village-and-mobile.css`

| 元素 | 当前字体大小 | 问题 |
|------|------------|------|
| `.village-challenge-emoji` | `34px` | 合适 |
| `.village-challenge-title` | `clamp(20px, 3vw, 28px)` | 合适 |
| `.village-challenge-subtitle` | `14px` | 合适 |
| `.village-challenge-tip` | `13px` | 合适 |
| `.village-question-progress` | `13px` | 合适 |
| `.village-question-word` | `clamp(28px, 4.6vw, 42px)` | 合适 |
| `.village-question-hint` | `15px` | 合适 |
| `.village-opt-btn` | `16px` | 合适 |

### 4. 排行榜弹窗 (leaderboard)
**文件**: `src/styles/40-leaderboard-village-and-mobile.css`

| 元素 | 当前字体大小 | 问题 |
|------|------------|------|
| `.leaderboard-input-group input` | `16px` | 合适 |
| `.leaderboard-rank` | `20px` | 合适 |
| `.leaderboard-stats` | `14px` | 合适 |
| `.leaderboard-date` | `12px` | 合适 |

### 5. 其他弹窗元素

| 元素 | 当前字体大小 | 问题 |
|------|------------|------|
| `.session-words-title` | `12px` | 合适 |
| `.session-word` | `12px` (移动端 `11px`) | 合适 |
| `.session-words-hint` | `10px` | 偏小 |
| `.game-btn-small` | `14px` | 合适 |

## 主要问题总结

### 🔴 严重问题（需立即修复）
1. **开始界面正文** (`.overlay-text`): `clamp(8px, 1.35vw, 10px)` → 最小8px几乎无法阅读
2. **操作说明行** (`.overlay-key-row`): `clamp(8px, 1.45vw, 11px)` → 最大11px仍然太小
3. **按钮文字** (`.overlay-btn`): `clamp(8px, 1.45vw, 10px)` → 按钮文字应该更大
4. **账户提示** (`.overlay-account-hint`): `9px` → 固定9px太小

### 🟡 次要问题（建议优化）
1. **开始界面标题** (`.overlay-title`): `clamp(12px, 2vw, 16px)` → 标题应该更突出
2. **副标题** (`.overlay-intro-sub`): `clamp(9px, 2vw, 12px)` → 最小值偏小
3. **输入框** (`.overlay-input`): `10px` → 应该至少12px
4. **提示文字** (`.overlay-hints-text`): `clamp(9px, 2vw, 12px)` → 最小值偏小
5. **挑战提示按钮** (`.challenge-hint-btn`): `11px` → 偏小

## 优化建议

### 字体大小标准（建议）

#### 移动端最小字体标准
- **正文**: 最小 12px
- **次要文字**: 最小 11px
- **标题**: 最小 16px
- **按钮**: 最小 12px
- **输入框**: 最小 14px

#### 桌面端推荐字体
- **正文**: 14-16px
- **次要文字**: 12-13px
- **标题**: 18-24px
- **按钮**: 14-16px
- **输入框**: 14-16px

### 具体修改建议

```css
/* 开始界面 - 需要大幅调整 */
.overlay-title {
    font-size: clamp(16px, 2.5vw, 20px);  /* 从 12-16 → 16-20 */
}

.overlay-text {
    font-size: clamp(12px, 1.8vw, 14px);  /* 从 8-10 → 12-14 */
}

.overlay-intro-sub {
    font-size: clamp(12px, 2vw, 14px);  /* 从 9-12 → 12-14 */
}

.overlay-key-row {
    font-size: clamp(12px, 1.8vw, 14px);  /* 从 8-11 → 12-14 */
}

.overlay-account-hint {
    font-size: 11px;  /* 从 9px → 11px */
}

.overlay-input {
    font-size: 14px;  /* 从 10px → 14px */
}

.overlay-hints-text {
    font-size: clamp(12px, 2vw, 14px);  /* 从 9-12 → 12-14 */
}

.overlay-btn {
    font-size: clamp(12px, 1.8vw, 14px);  /* 从 8-10 → 12-14 */
}

/* 单词测验 - 小幅调整 */
.challenge-hint-btn {
    font-size: 12px;  /* 从 11px → 12px */
}

/* 其他 */
.session-words-hint {
    font-size: 11px;  /* 从 10px → 11px */
}
```

## 优先级

### P0 - 立即修复（影响可用性）
- `.overlay-text`: 8-10px → 12-14px
- `.overlay-key-row`: 8-11px → 12-14px
- `.overlay-btn`: 8-10px → 12-14px

### P1 - 高优先级（影响体验）
- `.overlay-title`: 12-16px → 16-20px
- `.overlay-input`: 10px → 14px
- `.overlay-account-hint`: 9px → 11px

### P2 - 中优先级（优化体验）
- `.overlay-intro-sub`: 9-12px → 12-14px
- `.overlay-hints-text`: 9-12px → 12-14px
- `.challenge-hint-btn`: 11px → 12px
- `.session-words-hint`: 10px → 11px

## 实施计划

1. **Phase 1**: 修复 P0 问题（开始界面核心文字）
2. **Phase 2**: 修复 P1 问题（输入框和提示）
3. **Phase 3**: 修复 P2 问题（细节优化）
4. **Phase 4**: 全面测试（桌面端、移动端、平板）

## 测试检查清单

- [ ] 桌面端 1920x1080 显示正常
- [ ] 桌面端 1366x768 显示正常
- [ ] 平板端 768x1024 显示正常
- [ ] 手机端 375x667 (iPhone SE) 显示正常
- [ ] 手机端 414x896 (iPhone 11) 显示正常
- [ ] 手机端 360x640 (Android) 显示正常
- [ ] 所有文字清晰可读
- [ ] 按钮文字不拥挤
- [ ] 输入框文字舒适
