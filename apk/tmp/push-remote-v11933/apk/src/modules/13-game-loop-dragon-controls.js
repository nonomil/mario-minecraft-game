/**
 * 13-game-loop-dragon-controls.js - 末影龙骑乘时的触摸控制更新
 * 根据骑龙状态动态显示/隐藏上下飞行按键
 */

/**
 * 更新触摸控制按键的显示状态
 * 地面状态：只显示左右按键
 * 骑龙状态：显示上下左右四个按键
 */
function updateDragonTouchControls() {
    const touchControls = document.getElementById('touch-controls');
    
    if (!touchControls) return;

    // 检查是否正在骑龙
    const isRiding = typeof ridingDragon !== 'undefined' && ridingDragon !== null;

    if (isRiding) {
        // 骑龙时添加 class，CSS 会显示上下按键
        touchControls.classList.add('riding-dragon');
    } else {
        // 地面时移除 class，CSS 会隐藏上下按键
        touchControls.classList.remove('riding-dragon');
    }
}

// 导出函数供游戏循环调用
if (typeof window !== 'undefined') {
    window.updateDragonTouchControls = updateDragonTouchControls;
}
