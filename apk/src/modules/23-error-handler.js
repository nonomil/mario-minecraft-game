/**
 * 23-error-handler.js - 错误处理与状态验证
 * Task 1 Phase 3: 错误处理增强
 */

const errorHandler = {
    enabled: true,
    errorCount: 0,
    maxConsecutiveErrors: 3,
    lastValidState: null,
    stateBackupInterval: 60, // 每60帧备份一次状态
    framesSinceBackup: 0
};

/**
 * 验证游戏状态
 * @param {Object} state - 游戏状态对象
 * @returns {Object} 验证结果 {valid: boolean, errors: string[]}
 */
function validateGameState(state) {
    const errors = [];

    // 检查玩家对象
    if (!state.player) {
        errors.push('Player object is missing');
    } else {
        if (typeof state.player.x !== 'number' || isNaN(state.player.x)) {
            errors.push('Player x position is invalid');
        }
        if (typeof state.player.y !== 'number' || isNaN(state.player.y)) {
            errors.push('Player y position is invalid');
        }
        if (typeof state.player.hp !== 'number' || state.player.hp < 0) {
            errors.push('Player HP is invalid');
        }
    }

    // 检查关键数组
    if (!Array.isArray(state.platforms)) {
        errors.push('Platforms array is missing or invalid');
    }
    if (!Array.isArray(state.enemies)) {
        errors.push('Enemies array is missing or invalid');
    }
    if (!Array.isArray(state.items)) {
        errors.push('Items array is missing or invalid');
    }

    // 检查分数
    if (typeof state.score !== 'number' || isNaN(state.score) || state.score < 0) {
        errors.push('Score is invalid');
    }

    // 检查相机位置
    if (typeof state.cameraX !== 'number' || isNaN(state.cameraX)) {
        errors.push('Camera X position is invalid');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * 备份当前游戏状态
 */
function backupGameState() {
    if (!errorHandler.enabled) return;

    try {
        // 只备份关键状态，避免深拷贝大对象
        errorHandler.lastValidState = {
            playerX: player.x,
            playerY: player.y,
            playerVelX: player.velX,
            playerVelY: player.velY,
            playerHp: playerHp,
            score: score,
            cameraX: cameraX,
            gameFrame: gameFrame,
            timestamp: Date.now()
        };
        errorHandler.framesSinceBackup = 0;
    } catch (e) {
        console.warn('[ErrorHandler] Failed to backup state:', e);
    }
}

/**
 * 从备份恢复游戏状态
 * @returns {boolean} 是否成功恢复
 */
function restoreGameState() {
    if (!errorHandler.lastValidState) {
        console.error('[ErrorHandler] No valid state backup available');
        return false;
    }

    try {
        const backup = errorHandler.lastValidState;

        // 恢复玩家状态
        if (typeof player !== 'undefined') {
            player.x = backup.playerX;
            player.y = backup.playerY;
            player.velX = backup.playerVelX || 0;
            player.velY = backup.playerVelY || 0;
        }

        if (typeof playerHp !== 'undefined') {
            playerHp = backup.playerHp;
        }

        if (typeof score !== 'undefined') {
            score = backup.score;
        }

        if (typeof cameraX !== 'undefined') {
            cameraX = backup.cameraX;
        }

        console.log('[ErrorHandler] State restored from backup');
        return true;
    } catch (e) {
        console.error('[ErrorHandler] Failed to restore state:', e);
        return false;
    }
}

/**
 * 处理游戏循环错误
 * @param {Error} error - 错误对象
 * @param {string} phase - 错误发生的阶段 ('update' 或 'render')
 * @returns {boolean} 是否应该继续游戏循环
 */
function handleGameLoopError(error, phase) {
    if (!errorHandler.enabled) {
        throw error; // 如果禁用错误处理，直接抛出
    }

    errorHandler.errorCount++;

    console.error(`[ErrorHandler] Error in ${phase} phase:`, error);
    console.error('Stack trace:', error.stack);

    // 记录错误到全局
    if (typeof window !== 'undefined') {
        if (!window.__MMWG_ERROR_LOG) {
            window.__MMWG_ERROR_LOG = [];
        }
        window.__MMWG_ERROR_LOG.push({
            phase: phase,
            message: error.message,
            stack: error.stack,
            timestamp: Date.now(),
            frame: typeof gameFrame !== 'undefined' ? gameFrame : -1
        });

        // 只保留最近50个错误
        if (window.__MMWG_ERROR_LOG.length > 50) {
            window.__MMWG_ERROR_LOG.shift();
        }
    }

    // 连续错误过多，暂停游戏
    if (errorHandler.errorCount >= errorHandler.maxConsecutiveErrors) {
        console.error('[ErrorHandler] Too many consecutive errors, pausing game');

        if (typeof pushPause === 'function') {
            pushPause();
        } else if (typeof paused !== 'undefined') {
            paused = true;
        }

        // 尝试恢复状态
        restoreGameState();

        return false; // 停止游戏循环
    }

    // 尝试恢复并继续
    if (phase === 'update') {
        // 更新阶段出错，尝试恢复状态
        restoreGameState();
    }

    return true; // 继续游戏循环
}

/**
 * 重置错误计数器（在成功的帧后调用）
 */
function resetErrorCount() {
    if (errorHandler.errorCount > 0) {
        errorHandler.errorCount = 0;
    }
}

/**
 * 获取错误统计
 * @returns {Object} 错误统计信息
 */
function getErrorStats() {
    return {
        enabled: errorHandler.enabled,
        errorCount: errorHandler.errorCount,
        hasBackup: errorHandler.lastValidState !== null,
        backupAge: errorHandler.lastValidState
            ? Date.now() - errorHandler.lastValidState.timestamp
            : null,
        errorLog: typeof window !== 'undefined' && window.__MMWG_ERROR_LOG
            ? window.__MMWG_ERROR_LOG.length
            : 0
    };
}

/**
 * 启用错误处理
 */
function enableErrorHandler() {
    errorHandler.enabled = true;
}

/**
 * 禁用错误处理
 */
function disableErrorHandler() {
    errorHandler.enabled = false;
}

// 导出到全局（开发模式）
if (typeof window !== 'undefined') {
    window.validateGameState = validateGameState;
    window.getErrorStats = getErrorStats;
    window.enableErrorHandler = enableErrorHandler;
    window.disableErrorHandler = disableErrorHandler;
}
