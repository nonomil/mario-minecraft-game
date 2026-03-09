# 提示按钮延迟显示需求

## 需求描述
所有单词测验环节的提示按钮不应该一开始就显示，而是在10秒后才出现。

## 涉及场景
1. 游戏中的单词测验（learning challenge）
2. 复活测验（revive challenge）
3. 村庄单词测验（village challenge）

## 当前实现分析

### 1. 游戏中单词测验
**文件**: `src/modules/12-challenges.js`
**函数**: `showLearningChallenge()` (line 598-645)

当前逻辑：
```javascript
if (challengeHintBtn) {
    challengeHintBtn.style.display = "inline-flex";
    challengeHintBtn.disabled = false;
}
```

问题：提示按钮立即显示

### 2. 村庄单词测验
**文件**: `src/modules/12-village-challenges.js`
**函数**: `showVillageQuestion()` (line 306-387)

当前逻辑：
```html
<button id="btn-village-question-hint" class="game-btn game-btn-small">提示</button>
```

问题：提示按钮在HTML中直接渲染，立即可见

### 3. 复活测验
复活测验使用的是同一个 `startLearningChallenge()` 函数，通过 `origin` 参数区分。

## 修改方案

### 方案1：CSS + JavaScript 延迟显示

**优点**：
- 简单直接
- 不影响现有逻辑
- 易于维护

**实现**：
1. 初始隐藏提示按钮
2. 启动10秒定时器
3. 10秒后显示按钮

### 方案2：完全禁用10秒内的提示功能

**优点**：
- 更严格的控制
- 防止用户通过其他方式触发

**缺点**：
- 实现复杂
- 可能影响现有逻辑

## 选择方案1

### 修改点

#### 1. 游戏中单词测验 (12-challenges.js)

在 `showLearningChallenge()` 函数中：
```javascript
// 初始隐藏提示按钮
if (challengeHintBtn) {
    challengeHintBtn.style.display = "none";
    challengeHintBtn.disabled = false;
}

// 10秒后显示
setTimeout(() => {
    if (challengeHintBtn && currentLearningChallenge) {
        challengeHintBtn.style.display = "inline-flex";
    }
}, 10000);
```

需要清理定时器：在 `hideLearningChallenge()` 中清理

#### 2. 村庄单词测验 (12-village-challenges.js)

在 `showVillageQuestion()` 函数中：
```javascript
const btnHint = modal.querySelector("#btn-village-question-hint");

// 初始隐藏
if (btnHint) {
    btnHint.style.display = "none";
}

// 10秒后显示
setTimeout(() => {
    if (btnHint && isVillageChallengeActive(session)) {
        btnHint.style.display = "inline-block";
    }
}, 10000);
```

## 实现细节

### 定时器管理
需要添加变量来跟踪提示按钮的定时器：
- `challengeHintTimerId` - 游戏测验提示定时器
- `villageHintTimerId` - 村庄测验提示定时器

### 清理时机
- 测验完成时清理定时器
- 测验取消时清理定时器
- 新测验开始时清理旧定时器

## 测试检查清单
- [ ] 游戏中单词测验：提示按钮10秒后出现
- [ ] 复活测验：提示按钮10秒后出现
- [ ] 村庄测验：提示按钮10秒后出现
- [ ] 测验完成前退出：定时器正确清理
- [ ] 快速连续测验：定时器不冲突
- [ ] 10秒内答题：提示按钮不出现
- [ ] 10秒后答题：提示按钮正常工作
