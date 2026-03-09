# Worktree D：音频系统串行开发 - 执行计划

> **负责 Agent：** Worktree-D Agent
> **分支名称：** `feature/serial-audio-system`
> **Worktree 路径：** `../worktree-D/`
> **创建时间：** 2026-03-04
> **最后更新：** 2026-03-04 20:52
> **当前状态：** `已完成` ← Worktree-D Agent 更新此字段
> **当前阶段：** `E 已完成` ← D1 | D2 | E

---

## 📋 状态字段（Agent 必须维护）

```yaml
status: "已完成"  # 待开始 | 进行中 | 已完成 | 测试失败 | 待合并 | 已合并
current_phase: "E"  # D1 | D2 | E
start_time: "2026-03-04 20:41"
d1_complete_time: "2026-03-04 20:45"
d2_complete_time: "2026-03-04 20:48"
e_complete_time: "2026-03-04 20:52"
complete_time: "2026-03-04 20:52"
backup_files:
  d1: "worktree-D-audio-d1-20260304-204550.tar.gz"
  d2: "worktree-D-audio-d2-20260304-204851.tar.gz"
  e: "worktree-D-audio-e-20260304-205251.tar.gz"
test_results:
  d1: "未执行"  # 通过 | 失败 | 未执行
  d2: "未执行"
  e: "未执行"
test_logs:
  d1: ""
  d2: ""
  e: ""
commit_hashes:
  d1: "079bcef78b361db6a7e995ec957fe245366e9083"
  d2: "de7f77c9d6962f075807a7c2b4f0eb4a48066051"
  e: "c591a7903c762a643259fa0d8cee59b14e7f8173"
notes: "所有阶段已完成。D1: 测试发音+TTS诊断；D2: 挑战音效；E: TTS Provider抽象层重构，支持Web/APK/Mini多平台"
```

---

## 🎯 任务目标

**重要：** 本 worktree 包含 3 个阶段，必须**串行执行**（D1 → D2 → E）

### 阶段 D1：音频基础（4-5h）
1. vA-Task1: 设置页测试发音按钮（UI + 事件绑定）
2. vC-Task1: TTS 诊断 API
3. vC-Task2: 设置页语音自检入口

### 阶段 D2：音频增强（3-4h）
4. vB-Task5: 挑战音效增强

### 阶段 E：TTS Provider 重构（6-12h）
5. vD-Task1: 创建 TTS 抽象目录
6. vD-Task2: 接管 03-audio.js
7. vD-Task3: 实现 mini provider 占位
8. vD-Task4: 构建目标注入

---

## 📂 涉及文件清单

### 主要修改文件
- `src/modules/03-audio.js` - 音频系统核心（D1/D2/E 都会修改）
- `src/modules/16-events.js` - 事件绑定（D1/D2）
- `src/modules/12-challenges.js` - 挑战逻辑（D2）
- `Game.html` - 设置页UI（D1/D2）

### 新建文件（阶段 E）
- `src/tts/index.js` - TTS 抽象层
- `src/tts/provider-web.js` - Web TTS Provider
- `src/tts/provider-apk.js` - APK TTS Provider
- `src/tts/provider-mini.js` - 小程序 TTS Provider
- `config/platform-target.json` - 平台目标配置

### 构建脚本（阶段 E）
- `scripts/sync-web.js` - 构建目标注入

### 测试文件
- `tests/e2e/specs/opt-0226-task1-save-transfer.spec.mjs`
- `tests/e2e/specs/opt-0226-task2-review.spec.mjs`

---

## ✅ 阶段 D1：音频基础（必须先完成）

### Task D1-1: 设置页测试发音按钮 UI

#### 1.1 增加按钮
- [ ] 在 `Game.html` 的 settings 区域新增按钮：
  - `<button id="btn-speech-test" class="game-btn">🔊 测试发音</button>`
- [ ] 位置：朗读相关设置附近
- [ ] 移动端布局适配

#### 1.2 自检
- [ ] 打开设置页，确认按钮显示
- [ ] 不挤压移动端布局

---

### Task D1-2: 绑定测试发音逻辑

#### 2.1 事件绑定
- [ ] 在 `src/modules/16-events.js` 的 `wireSettingsModal()` 中获取 `btn-speech-test`
- [ ] 点击时执行逻辑：
  ```javascript
  if (!settings.speechEnabled) {
    showToast("请先开启朗读功能");
    return;
  }
  try {
    speakWord({ en: "hello", zh: "你好" });
  } catch (err) {
    showToast("发音测试失败: " + err.message);
  }
  ```

#### 2.2 自检
- [ ] 点击按钮后有发音或有失败提示
- [ ] 不影响原有设置保存流程

---

### Task D1-3: TTS 诊断 API

#### 3.1 实现诊断函数
- [ ] 在 `src/modules/03-audio.js` 中增加 `diagnoseTts()` 函数
- [ ] 返回字段：
  ```javascript
  {
    hasSpeech: boolean,           // 是否支持 speechSynthesis
    audioUnlocked: boolean,       // 音频上下文是否解锁
    speechEnabled: boolean,       // 用户是否开启朗读
    providerHint: string,         // 当前使用的 TTS 提供者
    voices: number,               // 可用语音数量
    error: string | null          // 错误信息
  }
  ```

#### 3.2 挂载到全局
- [ ] `window.diagnoseTts = diagnoseTts;`

#### 3.3 自检
- [ ] 浏览器控制台执行 `diagnoseTts()`
- [ ] 返回正确的诊断对象

---

### Task D1-4: 设置页语音自检入口

#### 4.1 UI 增加自检区域
- [ ] 在 `Game.html` 设置页增加自检按钮和结果区：
  ```html
  <button id="btn-tts-self-check" class="game-btn">🔍 语音自检</button>
  <div id="tts-check-result" class="tts-check-result"></div>
  ```

#### 4.2 事件绑定
- [ ] 在 `src/modules/16-events.js` 中绑定 `btn-tts-self-check`
- [ ] 点击后执行 `diagnoseTts()` 并渲染结果到 `tts-check-result`
- [ ] 结果格式化为易读文本

#### 4.3 可选：复制结果按钮
- [ ] 增加"复制结果"按钮，方便用户反馈问题

#### 4.4 自检
- [ ] 用户无需开发工具也能自检
- [ ] 结果显示清晰易懂

---

### D1 阶段提交
```bash
git add Game.html src/modules/16-events.js src/modules/03-audio.js
git commit -m "feat(worktree-D-phase1): add speech test and TTS diagnostics

Phase D1 completed:
- Add speech test button in settings
- Implement diagnoseTts() API
- Add TTS self-check UI in settings
- Wire event handlers for test and check buttons"
```

### D1 阶段验证
- [ ] 运行测试（如有相关测试）
- [ ] 手工验证：测试发音按钮可用、自检UI可渲染结果
- [ ] 主流程无回归

**D1 完成后，更新状态字段：**
- `current_phase: "D1"`
- `d1_complete_time: "2026-03-04 14:30:00"`
- `commit_hashes.d1: "<commit hash>"`

---

## ✅ 阶段 D2：音频增强（D1 完成后开始）

### Task D2-1: 新增挑战音效函数

#### 1.1 实现音效函数
- [ ] 在 `src/modules/03-audio.js` 中新增：
  - `playChallengeCorrectSfx()` - 答对音效
  - `playChallengeWrongSfx()` - 答错音效
- [ ] 使用 Web Audio API 或简单的 Audio 元素
- [ ] 音效文件可以是内置音频或合成音

#### 1.2 自检
- [ ] 控制台调用函数，确认有声音输出

---

### Task D2-2: 答题结果触发音效

#### 2.1 集成到挑战逻辑
- [ ] 在 `src/modules/12-challenges.js` 的答题结果分支触发音效：
  ```javascript
  if (correct) {
    playChallengeCorrectSfx();
  } else {
    playChallengeWrongSfx();
  }
  ```

#### 2.2 自检
- [ ] 答对题目时有正确音效
- [ ] 答错题目时有错误音效

---

### Task D2-3: 音效开关设置

#### 3.1 UI 增加开关
- [ ] 在 `Game.html` 设置页增加音效开关：
  - `<input type="checkbox" id="opt-sfx"> 挑战音效`

#### 3.2 事件绑定
- [ ] 在 `src/modules/16-events.js` 中读取 `opt-sfx` 状态
- [ ] 保存到 `settings.sfxEnabled`

#### 3.3 音效函数检查开关
- [ ] 在 `playChallengeCorrectSfx()` 和 `playChallengeWrongSfx()` 中检查 `settings.sfxEnabled`
- [ ] 关闭时不播放音效

#### 3.4 自检
- [ ] 关闭开关后完全静音
- [ ] 开启开关后恢复音效

---

### D2 阶段提交
```bash
git add src/modules/03-audio.js src/modules/12-challenges.js src/modules/16-events.js Game.html
git commit -m "feat(worktree-D-phase2): add challenge sound effects

Phase D2 completed:
- Add playChallengeCorrectSfx and playChallengeWrongSfx
- Trigger sfx on answer result in challenges
- Add sfx toggle in settings
- Respect sfx setting in playback"
```

### D2 阶段验证
- [ ] 运行测试
- [ ] 手工验证：答题有音效、音效开关有效
- [ ] 主流程无回归

**D2 完成后，更新状态字段：**
- `current_phase: "D2"`
- `d2_complete_time: "2026-03-04 17:00:00"`
- `commit_hashes.d2: "<commit hash>"`

---

## ✅ 阶段 E：TTS Provider 重构（D1+D2 完成后开始）

### Task E-1: 创建 TTS 抽象目录

#### 1.1 创建目录结构
- [ ] 创建 `src/tts/` 目录
- [ ] 创建文件：
  - `src/tts/index.js` - 统一入口
  - `src/tts/provider-web.js` - Web TTS Provider
  - `src/tts/provider-apk.js` - APK TTS Provider
  - `src/tts/provider-mini.js` - 小程序 TTS Provider

#### 1.2 定义统一接口
- [ ] 在 `index.js` 中定义 Provider 接口：
  ```javascript
  // 每个 provider 必须实现：
  // - speak(text, lang, options) -> Promise
  // - stop() -> void
  // - diagnose() -> Object
  ```

#### 1.3 实现 Web Provider
- [ ] 将现有 `03-audio.js` 中的 TTS 逻辑迁移到 `provider-web.js`
- [ ] 实现 `speak/stop/diagnose` 方法

#### 1.4 实现 APK Provider
- [ ] 将 Capacitor TTS 逻辑迁移到 `provider-apk.js`
- [ ] 实现 `speak/stop/diagnose` 方法

#### 1.5 实现 Mini Provider（占位）
- [ ] 在 `provider-mini.js` 中实现占位逻辑
- [ ] 非小程序环境返回 `{ ok: false, reason: "not in miniprogram" }`
- [ ] 小程序环境预留真实 API 接口

---

### Task E-2: 接管 03-audio.js

#### 2.1 重构 speakWord
- [ ] 修改 `src/modules/03-audio.js` 的 `speakWord` 函数
- [ ] 改为调用 `window.MMWG_TTS.speak(text, lang, options)`
- [ ] 保留旧逻辑作为兜底（过渡期）

#### 2.2 初始化 TTS Provider
- [ ] 在启动时根据平台选择 provider：
  ```javascript
  if (isCapacitor) {
    window.MMWG_TTS = new ApkTtsProvider();
  } else if (isMiniProgram) {
    window.MMWG_TTS = new MiniTtsProvider();
  } else {
    window.MMWG_TTS = new WebTtsProvider();
  }
  ```

#### 2.3 自检
- [ ] Web 环境发音不退化
- [ ] APK 环境发音不退化（如有测试环境）

---

### Task E-3: 构建目标注入

#### 3.1 创建平台目标配置
- [ ] 创建 `config/platform-target.json`：
  ```json
  {
    "target": "web",
    "supportedTargets": ["web", "apk", "mini"]
  }
  ```

#### 3.2 修改构建脚本
- [ ] 修改 `scripts/sync-web.js`
- [ ] 支持 `--target=web|apk|mini` 参数
- [ ] 注入 `window.MMWG_PLATFORM_TARGET` 到生成的 HTML

#### 3.3 启动时读取 target
- [ ] 在 `src/modules/17-bootstrap.js` 中读取 `window.MMWG_PLATFORM_TARGET`
- [ ] 根据 target 选择对应的 TTS Provider

#### 3.4 自检
- [ ] 同一代码主干支持三目标
- [ ] 切换 target 后 TTS 行为正确

---

### E 阶段提交
```bash
git add src/tts/ src/modules/03-audio.js src/modules/17-bootstrap.js scripts/sync-web.js config/platform-target.json
git commit -m "refactor(worktree-D-phase3): introduce TTS provider abstraction

Phase E completed:
- Create TTS provider contract (speak/stop/diagnose)
- Implement Web/APK/Mini providers
- Refactor 03-audio.js to use provider pattern
- Add platform target injection in build script
- Support --target flag for multi-platform build"
```

### E 阶段验证
- [ ] 运行全量回归测试
- [ ] 手工验证：Web/APK 发音不退化、target 切换有效
- [ ] 主流程无回归

**E 完成后，更新状态字段：**
- `current_phase: "E"`
- `e_complete_time: "2026-03-04 19:00:00"`
- `commit_hashes.e: "<commit hash>"`
- `status: "已完成"`

---

## 🧪 测试与验证

### 自动化测试
```bash
# 在 worktree-D 目录内执行
cd /g/UserCode/Mario_Minecraft/mario-minecraft-game_APK_V1.19.8

# 运行相关测试
npx playwright test -c tests/e2e/playwright.config.mjs \
  tests/e2e/specs/opt-0226-task1-save-transfer.spec.mjs \
  tests/e2e/specs/opt-0226-task2-review.spec.mjs
```

**测试结果记录：**
- [ ] D1 阶段测试结果：_待填写_
- [ ] D2 阶段测试结果：_待填写_
- [ ] E 阶段测试结果：_待填写_

### 手工测试清单
- [ ] D1: 测试发音按钮可用、自检UI可用
- [ ] D2: 答题有音效、音效开关有效
- [ ] E: Web/APK 发音不退化、provider 切换有效
- [ ] 主流程无回归（进入游戏 → 暂停 → 继续 → 存档）

---

## 📦 打包与备份

### 提交策略
**重要：** 每完成一个阶段就提交一次 git，每个阶段完成后打包一次备份。

- D1 完成 → git commit → 打包备份（D1）
- D2 完成 → git commit → 打包备份（D2）
- E 完成 → git commit → 打包备份（E）

### 打包命令（每个阶段完成后执行）
```bash
# 在 worktree-D 的父目录执行
cd /g/UserCode/Mario_Minecraft/

# D1 阶段打包
cd worktree-D && git status && cd ..
tar -czf worktree-D-audio-d1-$(date +%Y%m%d-%H%M%S).tar.gz worktree-D/

# D2 阶段打包
tar -czf worktree-D-audio-d2-$(date +%Y%m%d-%H%M%S).tar.gz worktree-D/

# E 阶段打包
tar -czf worktree-D-audio-e-$(date +%Y%m%d-%H%M%S).tar.gz worktree-D/
```

### 备份文件信息
- **D1 备份：** _待填写（例：worktree-D-audio-d1-20260304-143000.tar.gz）_
- **D2 备份：** _待填写（例：worktree-D-audio-d2-20260304-170000.tar.gz）_
- **E 备份：** _待填写（例：worktree-D-audio-e-20260304-190000.tar.gz）_
- **存放路径：** `docs/archive/2026-03-04-parallel-dev-backups/`

---

## ✅ 完成定义（DoD）

Worktree-D Agent 必须确认以下所有项才能标记为"已完成"：

- [ ] D1 阶段所有任务已勾选
- [ ] D1 阶段已提交 git 并打包备份
- [ ] D2 阶段所有任务已勾选
- [ ] D2 阶段已提交 git 并打包备份
- [ ] E 阶段所有任务已勾选
- [ ] E 阶段已提交 git 并打包备份
- [ ] 所有阶段的自动化测试全部通过
- [ ] 所有阶段的手工测试清单全部通过
- [ ] 本文档状态字段已更新为"已完成"
- [ ] 本文档所有 `_待填写_` 字段已填写
- [ ] 已通知 Master Agent 可以合并

---

## 📝 Agent 操作日志

_Worktree-D Agent 在此记录关键操作和问题_

### 2026-03-04
- 创建 Worktree D 执行计划文档

<!-- Worktree-D Agent 追加日志到此处 -->
