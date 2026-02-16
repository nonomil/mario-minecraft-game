问题分析：V1 (1.8.10) APK 卡死 + 地面消失 + 无法控制
我对比了 1.8.10 和 1.6.5 的所有关键文件，发现 1.8.10 新增了 5 个模块，其中包含多个致命 bug，同时触控处理发生了退化。

一、症状与根因对应关系
症状1：前进一段就卡住 → 游戏循环崩溃（JS 报错导致 requestAnimationFrame 停止）

症状2：重新进入后地面出现1秒就消失 → 初始帧渲染了一次，然后游戏循环在第一次 update 时就崩溃了

症状3：无法控制 → 游戏循环已死，所有输入无响应；同时触控事件绑定也有退化

二、致命 Bug 清单（会导致游戏崩溃的）
Bug 1（最可能的元凶）：VexEnemy 无限递归 → 栈溢出
文件：20-enemies-new.js:624-683

VexEnemy 类定义了两个 update() 方法，第二个覆盖了第一个。第二个方法里调用了 this.update(playerRef)，即调用自己 → 无限递归 → 栈溢出 → 游戏崩溃。只要 Vex 敌人一刷新，游戏就死。

Bug 2：ctx.ellipse() 参数不足 → TypeError
文件：19-biome-visuals.js:147


ctx.ellipse(dx, this.y, this.size, this.size / 2, 0, Math.PI * 2);
// 需要 7 个参数，只传了 6 个，缺少 endAngle
进入森林群系时，叶子粒子渲染直接抛 TypeError → 游戏循环崩溃。

Bug 3：villageConfig 异步竞态 → TypeError
文件：18-village.js:80-94

loadVillageConfig() 用 fetch().then() 异步加载，但游戏循环立即启动。当 maybeSpawnVillage() 在 fetch 完成前被调用时：


if (!settings.villageEnabled || !villageConfig.enabled) return;
// villageConfig 还是 undefined → TypeError
Bug 4：村庄挑战卡死
文件：12-village-challenges.js:76

第二题开始传 null 作为回调 → 答题后无法继续 → 挑战永远卡住。

三、触控退化（导致"无法控制"）
文件：16-events.js:239-265

1.6.5（正常）	1.8.10（异常）
PointerEvent 检测	有 "PointerEvent" in window 检测	无，直接用 pointer 事件
触摸回退	有 touchstart/touchend/mousedown 回退	无回退
setPointerCapture	try {} catch {} 包裹	裸调用，可能抛异常
在不支持 PointerEvent 的旧版 Android WebView 上，1.8.10 的所有触控按钮（左右移动、跳跃、攻击）完全无响应。即使支持 PointerEvent，setPointerCapture 抛异常时也会导致 onDown() 不执行。

四、其他高危 Bug
Bug	文件	说明
MagmaCubeEnemy 用全局 player 而非参数 playerRef	20-enemies-new.js:379	可能 ReferenceError
villageSpawnedForScore / activeVillages 未声明	18-village.js:99,103	ReferenceError
createVillage() return 后有死代码	18-village.js:114-143	NPC 系统完全不工作
CloudPlatform 推入 platforms 但不渲染	21-decorations-new.js:504	隐形碰撞面
蘑菇岛惩罚永不重置	18-interaction-chains.js:640-658	逻辑错误
Math.random() 在渲染函数中	21-decorations-new.js, 18-village-render.js	每帧闪烁
五、崩溃时序推演

游戏启动 → 初始帧渲染（地面正常显示）
    ↓
玩家前进 → 触发敌人/粒子/村庄生成
    ↓
命中以下任一 bug：
  • Vex 敌人刷新 → 无限递归 → 栈溢出
  • 森林群系 → ellipse() 参数错 → TypeError  
  • 村庄生成 → villageConfig undefined → TypeError
    ↓
游戏循环崩溃（requestAnimationFrame 停止）
    ↓
画面冻结 + 控制无响应
重新进入时同样的崩溃在前几帧就发生，所以地面闪一下就消失。

六、建议修复优先级
最优先：修复 VexEnemy 重复 update() 方法（删除第二个，合并逻辑到第一个）
最优先：修复 ctx.ellipse() 补上第7个参数 0
最优先：修复 villageConfig 竞态（同步初始化默认值，或在 maybeSpawnVillage 加 typeof 守卫）
最优先：恢复 16-events.js 的 PointerEvent 检测和触摸回退
高优先：修复其他 ReferenceError 风险（未声明的全局变量）
中优先：修复村庄挑战 null 回调、死代码等
要我开始修复这些 bug 吗？可以按优先级并行处理。