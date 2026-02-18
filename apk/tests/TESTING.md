# 测试架构说明文档

## 目录结构

```
mario-minecraft-game_V1/
├── tests/                          # 根目录测试套件（运行时行为验证）
│   ├── p3-regression.spec.js       # ✨ P0/P1/P2 回归测试（本次新增）
│   ├── p0-stability.spec.js        # P0 稳定性测试
│   ├── p1-experience.spec.js       # P1 体验测试
│   ├── p2-wither-boss.spec.js      # P2 凋零BOSS测试
│   ├── p2-boss-visual.spec.js      # P2 BOSS视觉测试
│   ├── login.spec.js               # 登录系统测试
│   ├── debug-actions.spec.js       # 调试动作测试
│   ├── village-integration.spec.js # 村庄集成测试
│   ├── biomes-*.spec.js            # 群系相关测试
│   └── requirements.spec.js        # 功能需求测试
│
├── apk/tests/                      # APK 专用测试套件
│   ├── e2e/                        # ✨ E2E 静态验证（本次新增）
│   │   ├── playwright.config.mjs
│   │   ├── README.md
│   │   └── specs/
│   │       ├── helpers.mjs
│   │       ├── p0-render-path.spec.mjs      # P0 渲染路径验证
│   │       ├── p2-biome-config.spec.mjs     # P2 群系配置验证
│   │       └── boss-debug-controls.spec.mjs # BOSS调试控制验证
│   │
│   └── debug-pages/                # 调试页面
│       ├── GameDebug.html          # ✨ 增强版调试面板（新增 MMDBG API）
│       ├── debug-full.html
│       ├── minimal-test.html
│       └── ...
│
└── playwright.config.js            # 根目录 Playwright 配置
```

---

## 测试套件对比

### 1. 根目录测试套件 (`tests/`)

**特点：运行时行为验证**

| 文件 | 用途 | 测试数量 |
|------|------|---------|
| `p3-regression.spec.js` | **P0/P1/P2 完整回归** | 19 |
| `p0-stability.spec.js` | 稳定性与编码 | 3 |
| `p1-experience.spec.js` | 体验与进度 | 4 |
| `p2-wither-boss.spec.js` | 凋零BOSS机制 | 2 |
| `p2-boss-visual.spec.js` | 4个BOSS渲染 | 2 |
| `login.spec.js` | 登录系统 | 2 |
| `debug-actions.spec.js` | 调试动作 | 3 |
| `village-integration.spec.js` | 村庄系统 | 3 |
| `biomes-*.spec.js` | 群系系统 | 2 |
| `requirements.spec.js` | 功能需求 | 4 |

**运行方式：**
```bash
npm test                # 无头模式
npm run test:headed     # 有头模式
```

**配置文件：** `playwright.config.js`
- baseURL: `http://127.0.0.1:4173`
- webServer: `node tools/serve-apk.mjs --port 4173`
- 访问路径: `/apk/Game.html`

---

### 2. APK E2E 测试套件 (`apk/tests/e2e/`)

**特点：静态源码验证 + 调试控制**

| 文件 | 用途 | 验证方式 |
|------|------|---------|
| `p0-render-path.spec.mjs` | P0 渲染双重偏移修复 | 源码字符串检查 |
| `p2-biome-config.spec.mjs` | P2 群系配置平衡 | JSON + 源码检查 |
| `boss-debug-controls.spec.mjs` | BOSS调试控制 | MMDBG API 调用 |

**运行方式：**
```bash
cd apk
npm run test:e2e           # 无头模式
npm run test:e2e:headed    # 有头模式
npm run test:e2e:ui        # UI 模式
npm run test:e2e:debug     # 调试模式
```

**配置文件：** `apk/tests/e2e/playwright.config.mjs`
- baseURL: `http://localhost:4173`
- webServer: `npm run serve` (from apk/)
- 访问路径: `/Game.html`, `/config/biomes.json`, `/src/modules/*.js`

---

## 本次优化新增测试

### ✨ tests/p3-regression.spec.js

**目标：** 验证 P0/P1/P2 所有代码改动的运行时行为

**测试分组：**

#### P0: BOSS渲染可见性（3个测试）
1. `renderBossSystem 传 camX=0（无双重偏移）`
   - 检查函数源码包含 `renderBoss(ctx, 0)`
2. `四个BOSS均可见：render(ctx,0) 不产生 NaN 坐标`
   - 触发 4 个 BOSS，验证 `drawX/drawY` 不为 NaN
3. `BOSS弹幕坐标不产生 NaN`
   - 触发凋零攻击，验证弹幕坐标有效

#### P1: 飞行BOSS可打性与竞技场（6个测试）
1. `飞行BOSS开战自动补给弓箭`
   - 清空弓箭 → 触发 wither/ghast/blaze → 验证 bow≥1, arrow≥12
2. `非飞行BOSS不补给弓箭`
   - 清空弓箭 → 触发 wither_skeleton → 验证 bow=0, arrow=0
3. `竞技场视口锁定与边界墙正确设置`
   - 触发BOSS → 验证 `viewportLocked=true`, `leftWall < rightWall`
4. `竞技场退出后状态完全释放`
   - 触发BOSS → 退出 → 验证 `active=false`, `viewportLocked=false`, `boss=null`
5. `initGame 重置 bossArena 全部状态`
   - 触发BOSS → initGame() → 验证所有状态重置
6. `没有箭提示节流不刷屏`
   - 连续调用 10 次 `showNoArrowToast()` → 验证实际触发 ≤2 次

#### P2: 群系切换节奏平衡（6个测试）
1. `stepScore 已调整为 300`
   - 验证 `getBiomeSwitchConfig().stepScore === 300`
2. `火山 minStay 已拉长（score>=320, timeSec>=70）`
3. `地狱 minStay 已拉长（score>=360, timeSec>=75）`
4. `canLeaveBiome 在 minStay 未满足时阻止切换`
   - 设置 volcano 刚进入 → 验证 `canLeaveBiome() === false`
5. `biomeSwitchStepScore 设置下限为 150`
   - `normalizeSettings({biomeSwitchStepScore: 50})` → 验证结果 ≥150
6. `12个群系全部有 minStay 配置`
   - 验证所有 order 中的群系都有 minStay 配置

#### P3: BOSS全流程回归（4个测试）
对每个 BOSS (wither/ghast/blaze/wither_skeleton)：
1. 触发 → 验证 `bossArena.active === true`
2. 可见性 → 验证 `drawX/drawY` 不为 NaN
3. 可打性 → 验证 `takeDamage()` 能扣血
4. 结算 → 验证 `onVictory()` 增加分数
5. 退出 → 验证 `viewportLocked === false`

**测试结果：** 18/19 通过（1个被用户中断）

---

### ✨ apk/tests/e2e/ 套件

#### p0-render-path.spec.mjs
```javascript
// 验证源码中使用 camX=0 避免双重偏移
expect(text).toContain("bossArena.renderBoss(ctx, 0)");
expect(text).toContain("bossArena.renderProjectiles(ctx, 0)");
```

#### p2-biome-config.spec.mjs
```javascript
// 验证 JSON 配置
expect(cfg.switch.stepScore).toBe(300);
expect(cfg.switch.minStay.volcano).toEqual({ score: 320, timeSec: 70 });

// 验证 HTML 下限
expect(gameHtml).toContain('id="opt-biome-step" type="range" min="150"');

// 验证 JS 归一化
expect(vocabJs).toContain("Math.max(150, Math.min(2000, ...))");
```

#### boss-debug-controls.spec.mjs
```javascript
// 验证 MMDBG API 可用
await openDebugPage(page);
const state = await getDebugState(page);
expect(state.ready).toBeTruthy();

// 验证 4 个 BOSS 可触发
await forceBoss(page, "wither");
expect(state.bossActive).toBeTruthy();
expect(state.bossLocked).toBeTruthy();
```

---

## 调试工具增强

### GameDebug.html 新增 MMDBG API

**全局对象：** `window.MMDBG`

**方法列表：**
```javascript
MMDBG.ready()           // 检查游戏是否就绪
MMDBG.ensureRunning()   // 确保游戏循环运行
MMDBG.setBiome(id)      // 切换群系
MMDBG.setScore(score)   // 设置分数
MMDBG.spawnBoss(type)   // 触发BOSS
MMDBG.getState()        // 获取当前状态
MMDBG.setBiomeRound(n)  // 设置群系轮次
```

**使用示例：**
```javascript
// 手动触发凋零BOSS
MMDBG.setScore(2000);
MMDBG.spawnBoss("wither");

// 切换到火山群系
MMDBG.setScore(5200);
MMDBG.setBiome("volcano");
MMDBG.setBiomeRound(1);

// 获取状态
const state = MMDBG.getState();
console.log(state.bossActive, state.biome, state.stay);
```

**访问地址：**
```
http://localhost:4173/apk/tests/debug-pages/GameDebug.html
```

---

## 测试覆盖矩阵

| 改动 | 根目录测试 | APK E2E | 手动验证 |
|------|-----------|---------|---------|
| **P0: BOSS渲染双重偏移** | ✅ p3-regression | ✅ p0-render-path | ✅ GameDebug |
| **P1: 飞行BOSS补给弓箭** | ✅ p3-regression | ❌ | ✅ GameDebug |
| **P1: 竞技场锁定/重置** | ✅ p3-regression | ✅ boss-debug-controls | ✅ GameDebug |
| **P1: 箭矢提示节流** | ✅ p3-regression | ❌ | ❌ |
| **P2: stepScore=300** | ✅ p3-regression | ✅ p2-biome-config | ❌ |
| **P2: volcano/nether minStay** | ✅ p3-regression | ✅ p2-biome-config | ✅ GameDebug |
| **P2: 设置下限 150** | ✅ p3-regression | ✅ p2-biome-config | ❌ |
| **P3: 4个BOSS全流程** | ✅ p3-regression | ✅ boss-debug-controls | ✅ GameDebug |

---

## 运行测试

### 快速验证（推荐用于 CI）
```bash
# APK E2E 静态检查（快速）
cd apk
npm run test:e2e
```

### 完整回归（推荐用于发布前）
```bash
# 根目录运行时测试（全面）
npm test
```

### 调试模式
```bash
# 根目录
npm run test:headed

# APK
cd apk
npm run test:e2e:ui
```

### 单个测试文件
```bash
# 只跑 P3 回归
npx playwright test tests/p3-regression.spec.js

# 只跑 P0 渲染路径
cd apk
npx playwright test -c tests/e2e/playwright.config.mjs specs/p0-render-path.spec.mjs
```

---

## 测试维护建议

1. **新增功能** → 优先在 `tests/` 添加运行时测试
2. **配置变更** → 在 `apk/tests/e2e/` 添加静态检查
3. **调试需求** → 在 `GameDebug.html` 扩展 MMDBG API
4. **回归验证** → 运行 `tests/p3-regression.spec.js`
5. **CI 集成** → 运行 `apk/tests/e2e/` 快速检查

---

## 已知问题

1. `tests/p3-regression.spec.js` 最后 1 个测试被用户中断，需重跑确认
2. 根目录 `tests/` 和 `apk/tests/e2e/` 使用不同的 Playwright 配置，注意路径差异
3. `GameDebug.html` 的 MMDBG API 仅在调试页面可用，游戏主页面不暴露

---

生成时间：2026-02-18
版本：v1.0
