# P3 逐BOSS回归与发布 - 执行清单

## 执行状态总览

| 阶段 | 状态 | 完成度 |
|------|------|--------|
| Step 1: 逐BOSS回归矩阵 | ✅ 自动化测试通过 | 3/4 (75%) |
| Step 2: 群系回归矩阵 | ⚠️ 需手动验证 | 0/4 (0%) |
| Step 3: 异常路径回归 | ⚠️ 需手动验证 | 0/4 (0%) |
| Step 4: 发布记录 | ✅ 已完成 | 4/4 (100%) |

---

## Step 1: 逐BOSS回归矩阵

### Wither (凋零) - 2000分 ✅

| 检查项 | 自动化测试 | 手动验证 | 状态 |
|--------|-----------|---------|------|
| 触发 | ✅ p3-regression | ⚠️ 待验证 | ✅ |
| 可见 | ✅ p3-regression | ⚠️ 待验证 | ✅ |
| 可打 | ✅ p3-regression | ⚠️ 待验证 | ✅ |
| 边界 | ✅ p3-regression | ⚠️ 待验证 | ✅ |
| 结算 | ✅ p3-regression | ⚠️ 待验证 | ✅ |

**自动化测试结果：** ✅ PASS
- `bossArena.enter("wither")` 成功
- `drawX/drawY` 不为 NaN
- `takeDamage()` 能扣血
- `onVictory()` 增加分数
- `exit()` 后 `viewportLocked=false`

**手动验证步骤：**
```javascript
// 访问 http://localhost:4173/apk/tests/debug-pages/GameDebug.html
MMDBG.setScore(2000);
MMDBG.spawnBoss("wither");
// 观察：BOSS可见、弹幕可见、可用弓箭攻击、击杀后有奖励
```

---

### Ghast (恶魂) - 4000分 ✅

| 检查项 | 自动化测试 | 手动验证 | 状态 |
|--------|-----------|---------|------|
| 触发 | ✅ p3-regression | ⚠️ 待验证 | ✅ |
| 可见 | ✅ p3-regression | ⚠️ 待验证 | ✅ |
| 可打 | ✅ p3-regression | ⚠️ 待验证 | ✅ |
| 边界 | ✅ p3-regression | ⚠️ 待验证 | ✅ |
| 结算 | ✅ p3-regression | ⚠️ 待验证 | ✅ |

**自动化测试结果：** ✅ PASS

**手动验证步骤：**
```javascript
MMDBG.setScore(4000);
MMDBG.spawnBoss("ghast");
```

---

### Blaze (烈焰人) - 6000分 ✅

| 检查项 | 自动化测试 | 手动验证 | 状态 |
|--------|-----------|---------|------|
| 触发 | ✅ p3-regression | ⚠️ 待验证 | ✅ |
| 可见 | ✅ p3-regression | ⚠️ 待验证 | ✅ |
| 可打 | ✅ p3-regression | ⚠️ 待验证 | ✅ |
| 边界 | ✅ p3-regression | ⚠️ 待验证 | ✅ |
| 结算 | ✅ p3-regression | ⚠️ 待验证 | ✅ |

**自动化测试结果：** ✅ PASS

**手动验证步骤：**
```javascript
MMDBG.setScore(6000);
MMDBG.spawnBoss("blaze");
```

---

### Wither Skeleton (凋零骷髅) - 8000分 ⚠️

| 检查项 | 自动化测试 | 手动验证 | 状态 |
|--------|-----------|---------|------|
| 触发 | ⚠️ 测试中断 | ⚠️ 待验证 | ⚠️ |
| 可见 | ⚠️ 测试中断 | ⚠️ 待验证 | ⚠️ |
| 可打 | ⚠️ 测试中断 | ⚠️ 待验证 | ⚠️ |
| 边界 | ⚠️ 测试中断 | ⚠️ 待验证 | ⚠️ |
| 结算 | ⚠️ 测试中断 | ⚠️ 待验证 | ⚠️ |

**自动化测试结果：** ⚠️ INTERRUPTED (用户中断)

**补测命令：**
```bash
npx playwright test tests/p3-regression.spec.js -g "凋零骷髅"
```

**手动验证步骤：**
```javascript
MMDBG.setScore(8000);
MMDBG.spawnBoss("wither_skeleton");
```

---

## Step 2: 群系回归矩阵 ⚠️

### 2.1 群系切换链路 ⚠️ 需手动验证

**验证方法：** 实机游玩或使用 GameDebug

**检查点：**
- [ ] 森林 (0分) → 樱花 (100分) 切换正常
- [ ] 樱花 → 雪地 (250分) 切换正常
- [ ] 雪地 → 沙漠 (400分) 切换正常
- [ ] 沙漠 → 蘑菇岛 (550分) 切换正常
- [ ] 蘑菇岛 → 山地 (800分) 切换正常
- [ ] 山地 → 海洋 (1100分) 切换正常
- [ ] 海洋 → 火山 (1500分) 切换正常
- [ ] 火山 → 地狱 (2100分) 切换正常

**快速验证脚本：**
```javascript
// 在 GameDebug.html 中执行
const biomes = ["forest", "cherry_grove", "snow", "desert", "mushroom_island", "mountain", "ocean", "volcano", "nether"];
const scores = [0, 100, 250, 400, 550, 800, 1100, 1500, 2100];

for (let i = 0; i < biomes.length; i++) {
  MMDBG.setScore(scores[i] + 50);
  MMDBG.setBiome(biomes[i]);
  console.log(`${biomes[i]}: ${MMDBG.getState().biome}`);
}
```

### 2.2 minStay 生效检查 ⚠️ 需手动验证

**验证方法：** 观察火山/地狱停留时间

**检查点：**
- [ ] 进入火山后，至少停留 70 秒或 320 分
- [ ] 进入地狱后，至少停留 75 秒或 360 分
- [ ] 不会出现"刚进入就切走"的情况

**自动化测试：** ✅ 已通过 `p3-regression` 中的 `canLeaveBiome` 测试

### 2.3 stepScore 调整验证 ✅

**自动化测试：** ✅ 已通过
- `getBiomeSwitchConfig().stepScore === 300`

**预期效果：**
- 每个群系持续 300 分（比之前 200 分长 50%）

### 2.4 高温环境伤害 ⚠️ 需手动验证

**验证方法：** 进入火山/地狱群系

**检查点：**
- [ ] 火山/地狱环境有持续伤害
- [ ] 伤害节奏正常（不会突然大量扣血）
- [ ] 不会因为伤害导致游戏卡死

---

## Step 3: 异常路径回归 ⚠️

### 3.1 BOSS战中暂停/恢复 ⚠️

**验证步骤：**
1. 触发任意 BOSS
2. 按 ESC 暂停游戏
3. 恢复游戏
4. 检查：BOSS 仍可见、可攻击、竞技场锁定正常

**检查点：**
- [ ] 暂停后 BOSS 不消失
- [ ] 恢复后战斗继续
- [ ] 竞技场锁定不丢失

### 3.2 BOSS战中死亡/复活 ⚠️

**验证步骤：**
1. 触发任意 BOSS
2. 让玩家血量降到 0
3. 选择复活或重新开始
4. 检查：竞技场锁定已释放，BOSS 已清除

**检查点：**
- [ ] 死亡后 `viewportLocked` 释放
- [ ] 复活后可以正常移动
- [ ] BOSS 状态已清除

### 3.3 低箭矢开战 ✅

**自动化测试：** ✅ 已通过
- 飞行 BOSS 自动补给弓箭
- 非飞行 BOSS 不补给

**手动验证：**
- [ ] 箭矢为 0 时触发 wither，自动补给到 12
- [ ] 箭矢为 0 时触发 wither_skeleton，不补给

### 3.4 长时间游玩稳定性 ⚠️

**验证方法：** 实机游玩 10-15 分钟

**检查点：**
- [ ] 相机移动正常，无卡顿
- [ ] BOSS 渲染正常，无闪烁
- [ ] 内存占用稳定，无泄漏
- [ ] 帧率稳定（目测 30-60 FPS）

---

## Step 4: 发布记录 ✅

### 4.1 变更文件列表 ✅

已记录在 `docs/COMPLETION-SUMMARY-0218.md`

**10 个文件：**
1. `apk/src/modules/14-renderer-entities.js`
2. `apk/src/modules/15-entities-boss.js`
3. `apk/src/modules/04-weapons.js`
4. `apk/src/modules/11-game-init.js`
5. `apk/config/biomes.json`
6. `apk/Game.html`
7. `apk/src/modules/06-biome.js`
8. `apk/src/defaults.js`
9. `apk/src/modules/09-vocab.js`
10. `apk/src/modules/16-events.js`

### 4.2 验收日志 ✅

已记录在 `docs/TEST-RESULTS-0218.md`

**测试结果：**
- 根目录：18/19 通过
- APK E2E：9/9 通过

### 4.3 已知遗留问题 ✅

已记录在 `docs/TEST-RESULTS-0218.md`

**遗留问题：**
1. 凋零骷髅全流程测试未完成（被中断）
2. 实机体验未验证
3. 性能影响未测

### 4.4 回滚策略 ✅

**按模块回滚：**
- P0 渲染修复：回退 `14-renderer-entities.js`
- P1 补给逻辑：回退 `15-entities-boss.js`, `04-weapons.js`, `11-game-init.js`
- P2 群系平衡：回退 `config/biomes.json` + 5 个 JS 文件

**完整回滚：**
```bash
git checkout HEAD -- apk/src/modules/14-renderer-entities.js
git checkout HEAD -- apk/src/modules/15-entities-boss.js
git checkout HEAD -- apk/src/modules/04-weapons.js
git checkout HEAD -- apk/src/modules/11-game-init.js
git checkout HEAD -- apk/config/biomes.json
git checkout HEAD -- apk/Game.html
git checkout HEAD -- apk/src/modules/06-biome.js
git checkout HEAD -- apk/src/defaults.js
git checkout HEAD -- apk/src/modules/09-vocab.js
git checkout HEAD -- apk/src/modules/16-events.js
```

---

## P3 DoD 检查

### 1. 四个BOSS全部通过"可见+可打+可结算" ⚠️

- ✅ Wither: 自动化测试通过
- ✅ Ghast: 自动化测试通过
- ✅ Blaze: 自动化测试通过
- ⚠️ Wither Skeleton: 测试中断，需补测

**状态：** 75% 完成，需补测凋零骷髅

### 2. 群系节奏通过"不短不长"主观验收 ⚠️

- ✅ 配置已调整（stepScore=300, minStay 拉长）
- ⚠️ 实机体验未验证

**状态：** 需手动游玩验证

### 3. 无新增致命Bug ⚠️

- ✅ 自动化测试未发现致命 Bug
- ⚠️ 长时间游玩稳定性未验证

**状态：** 需 10 分钟实机验证

---

## 发布前必做清单

### 必须完成（阻塞发布）

- [ ] **补跑凋零骷髅测试**
  ```bash
  npx playwright test tests/p3-regression.spec.js -g "凋零骷髅"
  ```

- [ ] **实机验证 4 个 BOSS**
  - 使用 GameDebug.html 快速触发
  - 确认可见、可打、可结算

### 强烈建议（降低风险）

- [ ] **实机游玩 10 分钟**
  - 观察群系切换节奏
  - 触发至少 2 个 BOSS
  - 检查帧率和稳定性

- [ ] **异常路径测试**
  - BOSS 战中暂停/恢复
  - BOSS 战中死亡/复活

### 可选（锦上添花）

- [ ] 性能监控（帧率、内存）
- [ ] 长时间游玩（30 分钟）
- [ ] 多设备测试（不同分辨率）

---

## 快速验证脚本

访问 `http://localhost:4173/apk/tests/debug-pages/GameDebug.html`

```javascript
// 快速验证 4 个 BOSS
const bosses = ["wither", "ghast", "blaze", "wither_skeleton"];
const scores = [2000, 4000, 6000, 8000];

for (let i = 0; i < bosses.length; i++) {
  console.log(`Testing ${bosses[i]}...`);
  MMDBG.setScore(scores[i]);
  MMDBG.spawnBoss(bosses[i]);
  // 手动观察：可见、可打、击杀后有奖励
  // 按任意键继续下一个
}
```

---

**文档生成时间：** 2026-02-18
**状态：** ⚠️ 待完成手动验证
**预计完成时间：** 30 分钟（补测 + 实机验证）
