# 任务 3：词汇与音频改进 - 执行计划

> **任务ID：** TASK-3-VOCAB-AUDIO
> **优先级：** 低
> **预估工作量：** 2-3 天
> **风险等级：** 低
> **创建时间：** 2026-03-04
> **最后更新：** 2026-03-04
> **当前状态：** 待开始
> **当前阶段：** 未开始
> **依赖任务：** TASK-1-CORE（必须先完成）

---

## 📋 状态字段（必须维护）

```yaml
status: "待开始"  # 待开始 | 进行中 | 已完成 | 测试失败 | 待合并 | 已合并
current_phase: "未开始"  # Phase1 | Phase2 | Phase3 | 验证
start_time: ""
phase1_complete_time: ""
phase2_complete_time: ""
phase3_complete_time: ""
complete_time: ""
dependencies:
  task1_status: "待开始"  # 任务 1 必须完成
test_results:
  phase1: "未执行"  # 通过 | 失败 | 未执行
  phase2: "未执行"
  phase3: "未执行"
  final: "未执行"
commit_hashes:
  phase1: ""
  phase2: ""
  phase3: ""
notes: ""
```

---

## 🎯 任务目标

改进词汇学习系统和音频体验，提升教育效果。

### 涉及模块
- **词汇系统** (src/modules/04-vocab.js)
- **音频系统** (src/modules/03-audio.js)
- **UI系统** (src/modules/10-ui.js)

### 关键风险
1. TTS 在不同浏览器的兼容性问题
2. 词汇旋转算法可能影响学习效果
3. 音频加载失败影响用户体验

---

## 📂 涉及文件清单

### 主要修改文件
- `src/modules/04-vocab.js` - 词汇系统（~500行）
- `src/modules/03-audio.js` - 音频系统（~600行）
- `src/modules/10-ui.js` - UI渲染（~800行）
- `Game.html` - 设置页UI

### 可能涉及文件
- `src/modules/16-events.js` - 事件绑定
- `src/modules/12-challenges.js` - 挑战逻辑
- `words/vocabs/manifest.js` - 词汇包清单

### 测试文件
- `tests/e2e/specs/vocab-learning.spec.mjs` - 词汇学习测试
- `tests/e2e/specs/audio-playback.spec.mjs` - 音频播放测试

---

## ✅ Phase 1：音频系统增强（预估 1天）

### 目标
改进 TTS 系统，添加音效和诊断功能。

### Task 1.1：TTS 测试与诊断

#### 1.1.1 添加测试发音按钮
- [ ] 在 `Game.html` 设置页添加按钮：
  ```html
  <button id="btn-speech-test" class="game-btn">🔊 测试发音</button>
  ```
- [ ] 位置：朗读相关设置附近
- [ ] 移动端布局适配

#### 1.1.2 绑定测试逻辑
- [ ] 在 `src/modules/16-events.js` 中绑定事件
- [ ] 点击时测试发音：
  ```javascript
  if (!settings.speechEnabled) {
    showToast("请先开启朗读功能");
    return;
  }
  speakWord({ en: "hello", zh: "你好" });
  ```

#### 1.1.3 实现 TTS 诊断 API
- [ ] 在 `src/modules/03-audio.js` 中添加 `diagnoseTts()` 函数
- [ ] 返回诊断信息：
  ```javascript
  {
    hasSpeech: boolean,
    audioUnlocked: boolean,
    speechEnabled: boolean,
    providerHint: string,
    voices: number,
    error: string | null
  }
  ```
- [ ] 挂载到全局：`window.diagnoseTts = diagnoseTts`

#### 1.1.4 添加自检 UI
- [ ] 在设置页添加"语音自检"按钮
- [ ] 显示诊断结果
- [ ] 添加"复制结果"按钮方便反馈

---

### Task 1.2：挑战音效

#### 1.2.1 实现音效函数
- [ ] 在 `src/modules/03-audio.js` 中添加：
  - `playChallengeCorrectSfx()` - 答对音效
  - `playChallengeWrongSfx()` - 答错音效
- [ ] 使用 Web Audio API 或 Audio 元素
- [ ] 支持音效开关设置

#### 1.2.2 集成到挑战逻辑
- [ ] 在 `src/modules/12-challenges.js` 中触发音效：
  ```javascript
  if (correct) {
    playChallengeCorrectSfx();
  } else {
    playChallengeWrongSfx();
  }
  ```

#### 1.2.3 添加音效设置
- [ ] 在设置页添加音效开关
- [ ] 保存到 `settings.sfxEnabled`
- [ ] 音效函数检查开关状态

---

### Task 1.3：TTS Provider 抽象（可选）

#### 1.3.1 创建 TTS 抽象层
- [ ] 创建 `src/tts/` 目录
- [ ] 创建文件：
  - `src/tts/index.js` - 统一入口
  - `src/tts/provider-web.js` - Web TTS Provider
  - `src/tts/provider-apk.js` - APK TTS Provider
  - `src/tts/provider-mini.js` - 小程序 TTS Provider（占位）

#### 1.3.2 定义统一接口
- [ ] 每个 provider 实现：
  - `speak(text, lang, options)` → Promise
  - `stop()` → void
  - `diagnose()` → Object

#### 1.3.3 重构 03-audio.js
- [ ] 修改 `speakWord` 调用 TTS Provider
- [ ] 根据平台选择 provider
- [ ] 保留旧逻辑作为 fallback

---

### Phase 1 提交
```bash
git add src/modules/03-audio.js src/modules/16-events.js src/modules/12-challenges.js Game.html
git commit -m "feat(task3-phase1): enhance audio system with TTS diagnostics and sfx

Phase 1 completed:
- Add speech test button in settings
- Implement diagnoseTts() API and self-check UI
- Add challenge sound effects (correct/wrong)
- Add sfx toggle in settings
- Optional: TTS provider abstraction layer"
```

### Phase 1 验证
- [ ] 测试发音按钮可用
- [ ] 语音自检显示正确信息
- [ ] 答题有音效
- [ ] 音效开关有效
- [ ] TTS 在不同浏览器正常工作

---

## ✅ Phase 2：词汇系统改进（预估 1天）

### 目标
优化词汇旋转算法，改进学习体验。

### Task 2.1：词汇旋转算法优化

#### 2.1.1 分析当前算法
- [ ] 读取 `src/modules/04-vocab.js` 中的旋转逻辑
- [ ] 识别防重复机制
- [ ] 测试当前算法的重复率

#### 2.1.2 实现改进算法
- [ ] 使用加权随机算法：
  - 新单词权重高
  - 学过的单词权重低
  - 错误率高的单词权重中等（复习）
- [ ] 实现间隔重复（Spaced Repetition）基础版
- [ ] 记录每个单词的学习次数和正确率

#### 2.1.3 持久化学习数据
- [ ] 在 LocalStorage 中保存学习记录
- [ ] 记录字段：
  ```javascript
  {
    wordId: string,
    learnCount: number,
    correctCount: number,
    wrongCount: number,
    lastSeenAt: timestamp,
    nextReviewAt: timestamp
  }
  ```

---

### Task 2.2：词汇包管理

#### 2.2.1 词汇包切换
- [ ] 在设置页添加词汇包选择器
- [ ] 显示可用词汇包列表
- [ ] 支持运行时切换词汇包

#### 2.2.2 词汇包预加载
- [ ] 实现词汇包预加载机制
- [ ] 缓存常用词汇包到 LocalStorage
- [ ] 减少加载时间

#### 2.2.3 词汇包统计
- [ ] 显示当前词汇包信息：
  - 总单词数
  - 已学单词数
  - 掌握单词数（正确率 >80%）
- [ ] 显示学习进度条

---

### Task 2.3：学习模式

#### 2.3.1 实现学习模式选择
- [ ] 添加学习模式：
  - 顺序学习（按词汇包顺序）
  - 随机学习（完全随机）
  - 智能学习（基于学习记录）
- [ ] 在设置页添加模式选择器

#### 2.3.2 复习模式
- [ ] 实现"复习模式"
- [ ] 只显示学过但未掌握的单词
- [ ] 根据遗忘曲线安排复习

---

### Phase 2 提交
```bash
git add src/modules/04-vocab.js src/modules/10-ui.js Game.html
git commit -m "feat(task3-phase2): improve vocabulary system with smart rotation

Phase 2 completed:
- Optimize vocabulary rotation algorithm with weighted random
- Implement basic spaced repetition
- Add vocabulary pack management and switching
- Add learning statistics and progress tracking
- Add learning modes (sequential/random/smart/review)"
```

### Phase 2 验证
- [ ] 词汇旋转算法重复率降低
- [ ] 学习记录正确保存
- [ ] 词汇包切换正常
- [ ] 学习统计准确
- [ ] 学习模式切换有效

---

## ✅ Phase 3：UI 改进（预估 0.5-1天）

### 目标
改进词汇学习相关的 UI 体验。

### Task 3.1：词汇卡片优化

#### 3.1.1 改进卡片显示
- [ ] 优化词汇卡片布局
- [ ] 添加单词图片（如果有）
- [ ] 添加音标显示
- [ ] 改进字体和颜色

#### 3.1.2 添加交互反馈
- [ ] 收集单词时显示动画
- [ ] 显示学习进度提示
- [ ] 添加"已学过"标记

---

### Task 3.2：学习统计面板

#### 3.2.1 创建统计面板
- [ ] 在暂停菜单或设置页添加统计面板
- [ ] 显示学习数据：
  - 今日学习单词数
  - 累计学习单词数
  - 平均正确率
  - 学习时长

#### 3.2.2 可视化图表
- [ ] 添加简单的进度条
- [ ] 显示学习趋势（可选）
- [ ] 显示词汇包完成度

---

### Task 3.3：设置页优化

#### 3.3.1 重组设置项
- [ ] 将音频设置分组
- [ ] 将词汇设置分组
- [ ] 改进布局和间距

#### 3.3.2 添加帮助提示
- [ ] 为关键设置添加说明文本
- [ ] 添加"?"图标显示详细帮助
- [ ] 改进移动端体验

---

### Phase 3 提交
```bash
git add src/modules/10-ui.js src/modules/04-vocab.js Game.html
git commit -m "feat(task3-phase3): improve vocabulary learning UI

Phase 3 completed:
- Optimize vocabulary card display with images and phonetics
- Add learning statistics panel
- Add visual progress indicators
- Reorganize settings page with grouping
- Add help tooltips for key settings"
```

### Phase 3 验证
- [ ] 词汇卡片显示美观
- [ ] 学习统计准确
- [ ] 设置页布局合理
- [ ] 移动端体验良好

---

## 🧪 最终测试与验证

### 自动化测试
```bash
# 运行词汇学习测试
npx playwright test tests/e2e/specs/vocab-learning.spec.mjs

# 运行音频播放测试
npx playwright test tests/e2e/specs/audio-playback.spec.mjs

# 运行完整回归测试
npm run test:e2e
```

### 功能验证清单
- [ ] TTS 测试按钮可用
- [ ] 语音自检显示正确信息
- [ ] 挑战音效正常
- [ ] 音效开关有效
- [ ] 词汇旋转算法无明显重复
- [ ] 学习记录正确保存
- [ ] 词汇包切换正常
- [ ] 学习统计准确
- [ ] 学习模式切换有效
- [ ] 词汇卡片显示美观
- [ ] 设置页布局合理

### 教育效果评估
- [ ] 词汇重复率 <10%（连续 50 个单词内）
- [ ] 学习记录准确率 >95%
- [ ] 用户可以看到学习进度
- [ ] 复习模式有效帮助记忆

---

## 📦 完成定义（DoD）

任务完成必须满足以下所有条件：

- [ ] 任务 1（核心系统优化）已完成
- [ ] Phase 1 所有任务已完成并提交
- [ ] Phase 2 所有任务已完成并提交
- [ ] Phase 3 所有任务已完成并提交
- [ ] 所有自动化测试通过
- [ ] 所有功能验证清单通过
- [ ] 教育效果评估达标
- [ ] 本文档状态字段已更新为"已完成"
- [ ] 代码已 Review（如需要）

---

## 📝 操作日志

_记录关键操作和问题_

### 2026-03-04
- 创建任务 3 执行计划文档
- 标记依赖：必须等待任务 1 完成

<!-- 追加日志到此处 -->
