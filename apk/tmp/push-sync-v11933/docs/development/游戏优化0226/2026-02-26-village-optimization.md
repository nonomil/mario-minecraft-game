# 村庄系统优化 实施计划

> **给 Claude:** 必需子技能：使用 superpowers:executing-plans 来逐任务实施此计划。

**目标：** 修复单词屋宝箱短按 Bug，优化三个房间提示文字，调整单词测试数量，商人屋自动进入，扩展商人可购买材料。

**架构：** 所有改动集中在 `src/modules/18-village.js`、`src/modules/12-village-challenges.js`、`src/modules/16-events.js` 和 `config/village.json`。不涉及新文件，只修改现有逻辑。

**技术栈：** 纯 JS ES6，Canvas 2D，HTML DOM 模态框，LocalStorage

---

## 任务 1：修复单词屋宝箱按钮 — 短按触发测试（不退出）

**问题根因：** 在村庄内部模式下，`interact` 按钮绑定了 `bindTap`（短按），调用 `handleInteraction("tap")`，最终到达 `triggerVillageInteriorChestAction`。但 `interior-exit` 按钮也是短按，两者可能在 UI 层叠导致短按先触发退出。需确认 HTML 中按钮布局，并将宝箱动作改为短按优先、退出改为独立按钮。

**文件：**
- 检查：`src/modules/16-events.js:432-493`
- 修改：`src/modules/18-village.js:737-745`（interior 提示文字）

**步骤 1：确认 interact 按钮绑定方式**

打开 `src/modules/16-events.js`，确认第 485 行：
```js
bindTap("interact", () => { handleInteraction("tap"); });
```
确认第 486-490 行 `interior-exit` 是独立按钮。如果 `interact` 被 `bindLongPress` 覆盖，改回 `bindTap`。

**步骤 2：在 `triggerVillageInteriorChestAction` 移除 interactMode 限制**

打开 `src/modules/18-village.js`，找到第 778 行 `triggerVillageInteriorChestAction`。确认函数签名接受 `interactMode = "tap"`，且 word_house 分支（802-813 行）不检查 interactMode，直接执行。如有 `if (interactMode !== "long")` 类似判断，删除它。

**步骤 3：更新 interior 底部提示文字（trader_house 改为短按）**

在 `src/modules/18-village.js` 第 741 行，将 trader_house 的提示从"长按"改为"短按"：
```js
// 原来（约第 741 行）
ctx.fillText("按宝箱键触发", actionPx, floorY - 8);

// 改为（trader_house 分支单独处理）
const actionHint = buildingType === "trader_house" ? "短按宝箱键" : "按宝箱键触发";
ctx.fillText(actionHint, actionPx, floorY - 8);
```

**步骤 4：运行游戏，进入单词屋，短按 interact 按钮**

预期：直接弹出单词测试，不退出房间。

**步骤 5：提交**
```bash
git add src/modules/16-events.js src/modules/18-village.js
git commit -m "fix: 单词屋宝箱短按触发测试，不退出房间"
```

---

## 任务 2：修改床屋(bed_house)室内提示文字

**文件：**
- 修改：`src/modules/18-village.js:681-685`

**步骤 1：找到床屋文字渲染代码**

在 `src/modules/18-village.js` 第 681-685 行：
```js
if (buildingType === "bed_house") {
  drawVillageBed(ctx, panelX + 80, panelY + panelH - 110, colors);
  ctx.fillText("", panelX + 28, panelY + 96);
  ctx.fillText("", panelX + 28, panelY + 128);
}
```

**步骤 2：替换为三行提示文字**

```js
if (buildingType === "bed_house") {
  drawVillageBed(ctx, panelX + 80, panelY + panelH - 110, colors);
  ctx.fillStyle = "#1E1E1E";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("点击 🗃️ 宝箱按钮", panelX + 28, panelY + 96);
  ctx.fillText("上床睡觉", panelX + 28, panelY + 120);
  ctx.fillText("恢复满血 ❤️", panelX + 28, panelY + 144);
}
```

**步骤 3：运行游戏，进入床屋**

预期：看到三行提示文字，无旧内容。

**步骤 4：提交**
```bash
git add src/modules/18-village.js
git commit -m "feat: 床屋室内显示三行操作提示"
```

---

## 任务 3：修改单词屋(word_house)室内提示文字

**文件：**
- 修改：`src/modules/18-village.js:704-717`

**步骤 1：找到单词屋内容渲染代码**

在 `src/modules/18-village.js` 第 704-717 行：
```js
if (buildingType === "word_house") {
  ctx.fillStyle = colors.plank || "#B8945A";
  ctx.fillRect(actionPx - 56, floorY - 62, 112, 62);
  // ... 绘制书本图形
}
```

**步骤 2：在书本图形下方添加提示文字**

在 `ctx.fillRect(bookX + 23, bookY + 2, 2, 28);` 之后添加：
```js
  ctx.fillStyle = "#1E1E1E";
  ctx.font = "15px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("点击 🗃️ 宝箱", actionPx, floorY - 68);
  ctx.fillText("开始单词测试", actionPx, floorY - 50);
  ctx.fillText("答对获取 💎 钻石", actionPx, floorY - 32);
```

**步骤 3：运行游戏，进入单词屋**

预期：书本旁显示三行提示，无旧内容。

**步骤 4：提交**
```bash
git add src/modules/18-village.js
git commit -m "feat: 单词屋室内显示宝箱测试提示"
```

---

## 任务 4：单词测试题目数量从 10 改为 5

**文件：**
- 修改：`config/village.json:7`
- 修改：`src/modules/12-village-challenges.js:134,136`

**步骤 1：修改 config/village.json**

```json
// 原来
"challengeQuestionCount": 10,

// 改为
"challengeQuestionCount": 5,
```

**步骤 2：修改 JS 默认值兜底**

在 `src/modules/12-village-challenges.js` 第 134 行和 136 行，将 `|| 10` 改为 `|| 5`：
```js
// 原来（第 134 行）
return Math.max(1, Number(cfg?.challengeQuestionCount) || 10);
// 改为
return Math.max(1, Number(cfg?.challengeQuestionCount) || 5);

// 原来（第 136 行）
return Math.max(1, Number(villageConfig?.challengeQuestionCount) || 10);
// 改为
return Math.max(1, Number(villageConfig?.challengeQuestionCount) || 5);
```

**步骤 3：确认钻石奖励逻辑**

在 `src/modules/12-village-challenges.js` 第 253-258 行，确认每答对一题 +1 钻石：
```js
if (isCorrect) {
  progress.correctCount++;
  inventory.diamond = (Number(inventory?.diamond) || 0) + 1;
  // ...
}
```
这段逻辑已正确，无需修改。答对几题得几颗钻石。

**步骤 4：运行游戏，进入单词屋测试**

预期：只出现 5 道题，答对 N 题得 N 颗钻石。

**步骤 5：提交**
```bash
git add config/village.json src/modules/12-village-challenges.js
git commit -m "feat: 单词测试题目数量改为5题，答对几题得几颗钻石"
```

---

## 任务 5：商人屋改为自动进入

**文件：**
- 修改：`src/modules/18-village.js:878`

**步骤 1：找到阻止商人屋自动进入的代码**

在 `src/modules/18-village.js` 第 878 行：
```js
if (nearby.type === "trader_house") return false;
```

**步骤 2：删除这一行**

删除第 878 行，让 `tryAutoEnterVillageInterior` 对 `trader_house` 也生效。

**步骤 3：确认 `enterVillageInterior` 支持 trader_house**

在 `src/modules/18-village.js` 第 511-539 行，确认 `enterVillageInterior` 函数对 `trader_house` 类型没有额外限制。如有，移除。

**步骤 4：运行游戏，走近商人屋**

预期：靠近商人屋门口自动进入商人屋内部，不需要按宝箱键。

**步骤 5：提交**
```bash
git add src/modules/18-village.js
git commit -m "feat: 商人屋改为自动进入"
```

---

## 任务 6：商人屋内短按宝箱键开启交易，更新提示文字

**文件：**
- 修改：`src/modules/18-village.js:655-658,737-745`

**步骤 1：更新 actionHeader 提示（第 655-658 行）**

```js
// 原来
const actionHeader = buildingType === "bed_house"
  ? "床（按宝箱键）"
  : (buildingType === "word_house" ? "单词书（按宝箱键）" : "商人（按宝箱键）");

// 改为
const actionHeader = buildingType === "bed_house"
  ? "🛏️ 床（按宝箱键）"
  : (buildingType === "word_house" ? "📘 单词书（按宝箱键）" : "🧑‍🌾 商人（短按宝箱键）");
```

**步骤 2：更新底部 actionDesc 提示（第 742-745 行）**

```js
// 原来
const actionDesc = buildingType === "bed_house"
  ? "休息回血"
  : (buildingType === "word_house" ? "开始单词测验" : "开启交易对话");

// 改为
const actionDesc = buildingType === "bed_house"
  ? "休息回血 ❤️"
  : (buildingType === "word_house" ? "开始单词测验 💎" : "短按 🗃️ 开启交易");
```

**步骤 3：确认 triggerVillageInteriorChestAction 的 trader_house 分支（第 815-817 行）**

```js
if (type === "trader_house") {
  return !!openVillageTrader(village);
}
```
这段已是 tap 触发，无需修改。

**步骤 4：运行游戏，进入商人屋，短按 interact 按钮**

预期：直接弹出商人交易界面。

**步骤 5：提交**
```bash
git add src/modules/18-village.js
git commit -m "feat: 商人屋短按宝箱键开启交易，更新提示文字"
```

---

## 任务 7：更新商人交易界面主菜单按钮文字

**文件：**
- 修改：`src/modules/18-village.js:1110-1127`

**步骤 1：找到 renderVillageTraderMain 函数（第 1106 行）**

当前按钮：
```html
<button id="trader-btn-sell">卖材料换钻石</button>
<button id="trader-btn-armor">买盔甲</button>
<button id="trader-btn-sunscreen">买防晒霜（5💎）</button>
<button id="trader-btn-close">关闭</button>
```

**步骤 2：更新按钮文字**

```js
body.innerHTML = `
  <h3 style="margin:0 0 12px;color:#FFD54F;">🧑‍🌾 商人交易</h3>
  <p style="margin:0 0 12px;color:#E0E0E0;">当前钻石：<b>${diamondCount}</b> 💎</p>
  <div style="display:flex;flex-direction:column;gap:10px;">
    <button id="trader-btn-sell" class="game-btn">卖材料换钻石 💎</button>
    <button id="trader-btn-armor" class="game-btn">用钻石买盔甲 🛡️</button>
    <button id="trader-btn-materials" class="game-btn">用钻石买材料和武器 ⚔️</button>
    <button id="trader-btn-close" class="game-btn">关闭</button>
  </div>
`;
```

注意：原来的 `trader-btn-sunscreen` 改为 `trader-btn-materials`，绑定新的 `renderTraderBuyMaterials` 函数（任务 8 实现）。

**步骤 3：更新按钮绑定**

```js
bindTraderTap(body.querySelector("#trader-btn-sell"), () => renderTraderSellMaterials(modal, village));
bindTraderTap(body.querySelector("#trader-btn-armor"), () => renderTraderBuyArmor(modal, village));
bindTraderTap(body.querySelector("#trader-btn-materials"), () => renderTraderBuyMaterials(modal, village));
bindTraderTap(body.querySelector("#trader-btn-close"), closeVillageTrader);
```

**步骤 4：运行游戏，打开商人界面**

预期：看到三行按钮，文字正确，无防晒霜单独按钮。

**步骤 5：提交**
```bash
git add src/modules/18-village.js
git commit -m "feat: 更新商人交易主菜单按钮文字"
```

---

## 任务 8：新增商人"买材料和武器"界面（含防晒霜、箭、剑等）

**文件：**
- 修改：`src/modules/18-village.js`（在 `handleTraderBuySunscreen` 之后，约第 1275 行前插入）

**步骤 1：定义可购买材料/武器价格表**

在 `TRADER_ARMOR_PRICES` 常量（第 1032 行）之后添加：
```js
const TRADER_BUY_ITEMS = [
  { id: "sunscreen",   label: "防晒霜 🧴",      cost: 5,  type: "buff"  },
  { id: "arrow",       label: "箭 ×10 🏹",       cost: 3,  type: "item", amount: 10 },
  { id: "stone_sword", label: "石剑 ⚔️",          cost: 8,  type: "item", amount: 1  },
  { id: "iron_sword",  label: "铁剑 🗡️",          cost: 15, type: "item", amount: 1  },
  { id: "bow",         label: "弓 🏹",            cost: 12, type: "item", amount: 1  },
  { id: "gunpowder",   label: "火药 ×5 💥",       cost: 4,  type: "item", amount: 5  },
  { id: "ender_pearl", label: "末影珍珠 ×3 🟣",   cost: 10, type: "item", amount: 3  },
];
```

**步骤 2：实现 renderTraderBuyMaterials 函数**

在 `handleTraderBuySunscreen` 函数（第 1262 行）之后插入：
```js
function renderTraderBuyMaterials(modal, village) {
  const body = modal.querySelector("#village-trader-body");
  if (!body) return;
  const diamondCount = Number(inventory?.diamond) || 0;
  body.innerHTML = `
    <h3 style="margin:0 0 12px;color:#FFD54F;">用钻石买材料和武器 ⚔️</h3>
    <p style="margin:0 0 8px;color:#E0E0E0;">当前钻石：<b>${diamondCount}</b> 💎</p>
    <div id="trader-buy-list" style="display:flex;flex-direction:column;gap:8px;"></div>
    <div style="margin-top:12px;">
      <button id="trader-btn-back-main" class="game-btn">返回</button>
    </div>
  `;
  const list = body.querySelector("#trader-buy-list");
  TRADER_BUY_ITEMS.forEach(({ id, label, cost, type, amount }) => {
    const btn = document.createElement("button");
    btn.className = "game-btn";
    btn.textContent = `${label}（${cost}💎）`;
    bindTraderTap(btn, () => {
      handleTraderBuyMaterialItem(id, cost, type, amount);
      renderTraderBuyMaterials(modal, village);
    });
    list?.appendChild(btn);
  });
  bindTraderTap(body.querySelector("#trader-btn-back-main"), () => renderVillageTraderMain(modal, village));
}

function handleTraderBuyMaterialItem(id, cost, type, amount = 1) {
  const diamonds = Number(inventory?.diamond) || 0;
  if (diamonds < cost) { showToast("💎 钻石不足"); return false; }
  inventory.diamond -= cost;
  if (type === "buff" && id === "sunscreen") {
    setVillageBuff("sunscreen", 420000);
    showToast("🧴 防晒霜已生效（7分钟）");
    showFloatingText("🧴 防晒中", player.x, player.y - 36, "#FFD54F");
  } else {
    inventory[id] = (Number(inventory[id]) || 0) + amount;
    const label = ITEM_LABELS?.[id] || id;
    showToast(`✅ 购买成功：${label} ×${amount}`);
  }
  if (typeof updateInventoryUI === "function") updateInventoryUI();
  return true;
}
```

**步骤 3：运行游戏，打开商人 → 用钻石买材料和武器**

预期：看到防晒霜、箭、石剑、铁剑、弓、火药、末影珍珠等选项，购买后库存正确增加。

**步骤 4：提交**
```bash
git add src/modules/18-village.js
git commit -m "feat: 商人新增买材料和武器界面（箭、剑、弓、防晒霜等）"
```

---

## 验证清单

完成所有任务后，逐项验证：

- [ ] 进入单词屋，短按 interact 按钮 → 弹出单词测试（不退出）
- [ ] 床屋室内显示三行提示文字（宝箱图标、上床睡觉、恢复满血）
- [ ] 单词屋室内显示宝箱提示（点击宝箱、开始测试、获取钻石）
- [ ] 单词测试只有 5 道题，答对 N 题得 N 颗钻石
- [ ] 走近商人屋自动进入（不需要按键）
- [ ] 商人屋内短按 interact 按钮 → 弹出交易界面
- [ ] 商人主菜单三行按钮文字正确（卖材料换钻石💎、用钻石买盔甲🛡️、用钻石买材料和武器⚔️）
- [ ] 买材料和武器界面包含防晒霜、箭、石剑、铁剑、弓等选项
- [ ] 购买后库存正确，钻石正确扣除
