# 实施计划 - 2026-03-08

## 总体策略

采用并行开发模式，分为两个工作组：
- **组A（worktree-vocab-boss）**：任务1（词库记忆曲线）+ 任务2（BOSS视觉）
- **组B（worktree-village-dragon）**：任务3（村庄UI）+ 任务4（龙蛋获取）

## 组A：词库记忆曲线 + BOSS视觉优化

### 任务1：词库切换与记忆曲线

#### Step 1.1：分析现有词库系统
**目标**：理解当前词库加载和单词选择逻辑

**操作**：
```bash
# 读取相关文件
- src/modules/09-vocab.js
- src/modules/01-config.js
- src/storage.js
```

**输出**：当前词库系统架构文档

---

#### Step 1.2：设计记忆曲线算法
**目标**：设计符合艾宾浩斯遗忘曲线的单词复习机制

**算法设计**：
```javascript
// 单词状态
const WordState = {
  NEW: 'new',           // 新词
  LEARNING: 'learning', // 学习中
  REVIEW: 'review',     // 复习
  MASTERED: 'mastered'  // 已掌握
};

// 复习间隔（分钟）
const ReviewIntervals = {
  NEW: 0,           // 立即学习
  LEARNING: 5,      // 5分钟后复习
  REVIEW_1: 30,     // 30分钟后
  REVIEW_2: 180,    // 3小时后
  REVIEW_3: 1440,   // 1天后
  REVIEW_4: 10080,  // 7天后
  MASTERED: 43200   // 30天后
};

// 单词记录结构
{
  word: "hello",
  state: "learning",
  lastReview: timestamp,
  nextReview: timestamp,
  reviewCount: 2,
  correctCount: 1,
  wrongCount: 1
}
```

**输出**：记忆曲线算法设计文档

---

#### Step 1.3：实现单词学习记录系统
**目标**：在storage中存储每个单词的学习状态

**实现**：
```javascript
// storage.js 新增方法
function getWordProgress(packId) {
  // 获取指定词库包的所有单词学习记录
}

function updateWordProgress(packId, word, result) {
  // 更新单词学习记录（正确/错误）
}

function getNextWords(packId, count) {
  // 根据记忆曲线获取下一批要学习的单词
}
```

**涉及文件**：
- `src/storage.js`

**验收**：
- [ ] 可以存储单词学习记录
- [ ] 可以查询单词复习时间
- [ ] 可以更新单词状态

---

#### Step 1.4：修改词库选择逻辑
**目标**：集成记忆曲线算法到单词选择流程

**实现**：
```javascript
// 09-vocab.js 修改 pickWord() 方法
function pickWord() {
  // 1. 获取当前词库包ID
  // 2. 从storage获取需要复习的单词
  // 3. 如果没有需要复习的，获取新词
  // 4. 避免短时间内重复（最近10个单词不重复）
  // 5. 返回选中的单词
}
```

**涉及文件**：
- `src/modules/09-vocab.js`

**验收**：
- [ ] 单词按记忆曲线出现
- [ ] 不会短时间内重复
- [ ] 新词和复习词合理分配

---

#### Step 1.5：添加词库切换UI
**目标**：确保设置界面可以切换词库

**检查**：
- 设置界面是否已有词库选择下拉框
- 是否支持英语和汉语模式的词库切换

**如需修改**：
- `src/modules/16-events.js` - 设置事件处理
- `Game.html` - 设置界面HTML

**验收**：
- [ ] 可以在设置中看到所有词库
- [ ] 切换词库后立即生效
- [ ] 英语和汉语模式都支持

---

### 任务2：烈焰人BOSS援军视觉优化

#### Step 2.1：分析当前援军实现
**目标**：理解烈焰人召唤援军的代码逻辑

**操作**：
```bash
# 读取BOSS系统文件
- src/modules/15-entities-boss.js
- src/modules/14-renderer-entities.js
```

**输出**：当前援军召唤机制文档

---

#### Step 2.2：设计援军视觉形象
**目标**：设计小型烈焰人或火焰元素的视觉效果

**设计方案**：
```javascript
// 援军类型
const BlazeMinion = {
  type: 'blaze_minion',
  width: 16,
  height: 24,
  color: '#FF6600',  // 橙红色
  effects: {
    flame: true,      // 火焰粒子效果
    glow: true        // 发光效果
  }
};

// 渲染方式
// 1. 小型烈焰人：缩小版的烈焰人sprite
// 2. 火焰元素：火焰形状 + 粒子效果
```

**输出**：援军视觉设计文档

---

#### Step 2.3：实现援军渲染
**目标**：实现新的援军视觉效果

**实现**：
```javascript
// 14-renderer-entities.js
function renderBlazeMinion(ctx, minion) {
  // 1. 绘制小型烈焰人body
  // 2. 添加火焰粒子效果
  // 3. 添加发光效果
}
```

**涉及文件**：
- `src/modules/15-entities-boss.js` - 援军实体定义
- `src/modules/14-renderer-entities.js` - 援军渲染

**验收**：
- [ ] 援军有独特的视觉形象
- [ ] 有火焰粒子效果
- [ ] 视觉效果美观

---

#### Step 2.4：添加召唤动画
**目标**：烈焰人召唤援军时有动画效果

**实现**：
```javascript
// 召唤动画
function summonMinionAnimation(x, y) {
  // 1. 火焰从地面升起
  // 2. 援军从火焰中出现
  // 3. 持续时间：0.5秒
}
```

**涉及文件**：
- `src/modules/15-entities-boss.js`

**验收**：
- [ ] 召唤时有动画
- [ ] 动画流畅自然

---

## 组B：村庄UI优化 + 龙蛋获取

### 任务3：村庄建筑UI优化

#### Step 3.1：分析当前村庄UI实现
**目标**：理解床屋、单词屋、商人屋的UI渲染逻辑

**操作**：
```bash
# 读取村庄系统文件
- src/modules/18-village.js
- src/modules/14-renderer-main.js
```

**输出**：当前村庄UI架构文档

---

#### Step 3.2：添加床屋的床
**目标**：在床屋内部渲染床的sprite

**实现**：
```javascript
// 18-village.js - renderBedHouseInterior()
function renderBedHouseInterior(ctx) {
  // 1. 绘制背景
  // 2. 绘制床sprite（底部中央）
  // 3. 绘制角色（床旁边）
  // 4. 绘制操作提示（角色上方）
}
```

**涉及文件**：
- `src/modules/18-village.js`

**验收**：
- [ ] 床屋可以看到床
- [ ] 床的位置合理

---

#### Step 3.3：统一村庄建筑UI布局
**目标**：统一床屋、单词屋、商人屋的UI布局规范

**布局规范**：
```javascript
// 统一布局结构
const VillageInteriorLayout = {
  // 底部：角色sprite
  character: {
    y: canvas.height - 100,
    height: 80
  },

  // 中部：操作说明（角色上方留出间距）
  hint: {
    y: canvas.height - 180,
    marginTop: 20,  // 距离角色的间距
    height: 60
  },

  // 顶部：标题/提示
  title: {
    y: 50,
    height: 40
  }
};
```

**实现**：
```javascript
// 18-village.js
// 重构三个建筑的渲染函数，使用统一布局
function renderBedHouseInterior(ctx) { /* 使用统一布局 */ }
function renderWordHouseInterior(ctx) { /* 使用统一布局 */ }
function renderTraderInterior(ctx) { /* 使用统一布局 */ }
```

**涉及文件**：
- `src/modules/18-village.js`

**验收**：
- [ ] 三个建筑UI布局一致
- [ ] 角色在下，说明在上
- [ ] 间距合理，不重叠

---

#### Step 3.4：优化商人屋对话框
**目标**：增加商人屋卖材料对话框的高度

**实现**：
```javascript
// 18-village.js - renderTraderSellDialog()
function renderTraderSellDialog(ctx) {
  // 增加对话框高度：从 300px 增加到 400px
  // 增加每个材料项的高度：从 40px 增加到 50px
  // 优化列表布局，增加padding
}
```

**涉及文件**：
- `src/modules/18-village.js`

**验收**：
- [ ] 对话框高度增加
- [ ] 材料列表不拥挤
- [ ] 易于点击

---

#### Step 3.5：单词屋立即显示读音
**目标**：单词/汉字出现时立即播放读音

**实现**：
```javascript
// 18-village.js - showWordQuiz()
function showWordQuiz(word) {
  // 1. 显示单词/汉字
  // 2. 立即调用 speakWord(word) 播放读音
  // 3. 不等待用户点击
}
```

**涉及文件**：
- `src/modules/18-village.js`
- `src/modules/03-audio.js` - 语音合成

**验收**：
- [ ] 单词出现立即播放读音
- [ ] 不需要点击
- [ ] 读音清晰

---

### 任务4：龙蛋获取机制

#### Step 4.1：检查宝箱掉落表
**目标**：确认当前宝箱是否可以掉落龙蛋

**操作**：
```bash
# 读取游戏配置
- config/game.json
```

**检查**：
- 查看 lootTables 中是否包含龙蛋
- 查看各级宝箱的掉落物列表

**输出**：当前掉落表分析文档

---

#### Step 4.2：添加龙蛋到宝箱掉落表
**目标**：在高级宝箱中添加龙蛋掉落

**实现**：
```json
// config/game.json
{
  "lootTables": {
    "chest_epic": {
      "items": [
        // ... 现有物品
        {
          "type": "dragon_egg",
          "weight": 1,
          "minCount": 1,
          "maxCount": 1
        }
      ]
    }
  }
}
```

**涉及文件**：
- `config/game.json`

**验收**：
- [ ] 史诗宝箱可以掉落龙蛋
- [ ] 掉落概率合理（低概率）

---

#### Step 4.3：商人屋添加龙蛋商品
**目标**：在商人屋添加购买龙蛋的选项

**实现**：
```javascript
// 18-village.js - traderInventory
const traderInventory = [
  // ... 现有商品
  {
    id: 'dragon_egg',
    name: '龙蛋',
    nameEn: 'Dragon Egg',
    price: 5000,  // 高价
    icon: '🥚',
    description: '孵化后可以骑乘的龙'
  }
];
```

**涉及文件**：
- `src/modules/18-village.js`

**验收**：
- [ ] 商人屋可以看到龙蛋商品
- [ ] 价格显示正确
- [ ] 可以购买

---

## 测试计划

### 组A测试

#### 任务1测试
```bash
# E2E测试
tests/e2e/specs/p0-vocab-memory-curve.spec.mjs
- 测试单词不重复
- 测试记忆曲线
- 测试词库切换
```

#### 任务2测试
```bash
# E2E测试
tests/e2e/specs/p0-boss-blaze-minions.spec.mjs
- 测试援军视觉效果
- 测试召唤动画
```

### 组B测试

#### 任务3测试
```bash
# E2E测试
tests/e2e/specs/p0-village-ui-layout.spec.mjs
- 测试床屋有床
- 测试UI布局统一
- 测试商人屋对话框
- 测试单词屋读音
```

#### 任务4测试
```bash
# E2E测试
tests/e2e/specs/p0-dragon-egg-acquisition.spec.mjs
- 测试宝箱掉落龙蛋
- 测试商人屋购买龙蛋
```

---

## 时间估算

### 组A
- 任务1：4-6小时
- 任务2：2-3小时
- **总计**：6-9小时

### 组B
- 任务3：3-4小时
- 任务4：1-2小时
- **总计**：4-6小时

---

## 风险与依赖

### 风险
1. 记忆曲线算法可能需要多次调优
2. 村庄UI改动可能影响现有交互

### 依赖
- 组A和组B可以完全并行开发
- 无跨组依赖

---

## 交付物

### 组A
- [ ] 记忆曲线算法实现
- [ ] 单词学习记录系统
- [ ] 词库切换功能
- [ ] 烈焰人援军新视觉
- [ ] 召唤动画
- [ ] E2E测试

### 组B
- [ ] 床屋添加床
- [ ] 统一村庄UI布局
- [ ] 商人屋对话框优化
- [ ] 单词屋读音优化
- [ ] 龙蛋掉落表
- [ ] 龙蛋商品
- [ ] E2E测试
