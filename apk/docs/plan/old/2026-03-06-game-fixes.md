# 游戏修复方案 - 2026-03-06

## 问题总结

### 1. 狐狸偷分碰撞检测问题
**位置**: `build/index.html` 第 265507 行

**当前实现**:
```javascript
if (dist < 40 && this.stealCooldown === 0) {
    if (score >= 50) {
        score = Math.max(0, score - 50);
        showFloatingText("偷走50分", playerRef.x, playerRef.y - 40, "#FF8C00");
    }
    this.stealCooldown = 300;
}
```

**问题**: 使用距离判断 `dist < 40`，只要狐狸在玩家附近40像素内就会偷分，即使玩家在空中也会被偷。

**解决方案**: 改用 AABB 碰撞检测，只有真正接触时才偷分。

---

### 2. 装饰物定位问题
**位置**: `build/index.html` 第 269195-269198 行

**当前实现**:
```javascript
case "bush":
    spawnDecoration("bush", obj => obj.reset(decorX, yPos - 20), () => new Bush(decorX, yPos - 20));
    break;
case "flower":
    spawnDecoration("flower", obj => obj.reset(decorX, yPos - 18), () => new Flower(decorX, yPos - 18));
    break;
```

**问题**: 装饰物的 Y 坐标使用固定偏移量（`yPos - 20`, `yPos - 18`），可能导致花草悬浮在空中，没有正确贴合地面。

**解决方案**:
1. 检查装饰物类的高度属性
2. 使用 `yPos - decoration.height` 确保底部贴合地面
3. 或者改为 `yPos` 直接放在地面上

---

### 3. 添加牛羊系统
**需求**:
- 添加牛（Cow）和羊（Sheep）实体
- 可以被攻击击杀
- 死亡后掉落肉类道具
- 玩家拾取肉类可以回血

**实现计划**:
1. 创建 `CowEntity` 和 `SheepEntity` 类（继承自 `Enemy` 或新的 `PassiveEntity` 类）
2. 添加肉类道具类 `MeatItem`
3. 实现拾取肉类回血逻辑
4. 在各个场景中生成牛羊

---

## 修复优先级

1. **P0 - 狐狸碰撞检测** (影响游戏公平性)
2. **P1 - 装饰物定位** (影响视觉体验)
3. **P2 - 牛羊系统** (新功能)

---

## 技术细节

### AABB 碰撞检测函数
游戏中应该已有 `colCheck` 函数用于碰撞检测，需要确认其实现。

### 装饰物类结构
需要检查 `Bush` 和 `Flower` 类的构造函数，确认它们如何处理 Y 坐标。

### 生命值系统
需要确认当前的生命值变量名（`playerHp`）和回血逻辑的实现位置。
