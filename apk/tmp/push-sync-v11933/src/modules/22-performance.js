/**
 * 22-performance.js - 性能监控模块
 * Task 1 Phase 1: 游戏循环解耦
 */

const performanceMetrics = {
    enabled: false,
    measurements: {},
    history: {},
    maxHistorySize: 60, // 保留最近60帧的数据
    frameCount: 0
};

/**
 * 开始性能测量
 * @param {string} label - 测量标签
 */
function startMeasure(label) {
    if (!performanceMetrics.enabled) return;

    if (!performanceMetrics.measurements[label]) {
        performanceMetrics.measurements[label] = {
            startTime: 0,
            totalTime: 0,
            count: 0
        };
    }

    performanceMetrics.measurements[label].startTime = performance.now();
}

/**
 * 结束性能测量
 * @param {string} label - 测量标签
 */
function endMeasure(label) {
    if (!performanceMetrics.enabled) return;

    const measurement = performanceMetrics.measurements[label];
    if (!measurement || !measurement.startTime) return;

    const duration = performance.now() - measurement.startTime;
    measurement.totalTime += duration;
    measurement.count++;

    // 记录到历史
    if (!performanceMetrics.history[label]) {
        performanceMetrics.history[label] = [];
    }
    performanceMetrics.history[label].push(duration);

    // 限制历史大小
    if (performanceMetrics.history[label].length > performanceMetrics.maxHistorySize) {
        performanceMetrics.history[label].shift();
    }

    measurement.startTime = 0;
}

/**
 * 获取性能指标
 * @returns {Object} 性能指标对象
 */
function getMetrics() {
    const metrics = {};

    for (const label in performanceMetrics.measurements) {
        const m = performanceMetrics.measurements[label];
        const history = performanceMetrics.history[label] || [];

        metrics[label] = {
            avgTime: m.count > 0 ? (m.totalTime / m.count).toFixed(2) : 0,
            totalTime: m.totalTime.toFixed(2),
            count: m.count,
            lastTime: history.length > 0 ? history[history.length - 1].toFixed(2) : 0,
            minTime: history.length > 0 ? Math.min(...history).toFixed(2) : 0,
            maxTime: history.length > 0 ? Math.max(...history).toFixed(2) : 0
        };
    }

    return metrics;
}

/**
 * 重置性能指标
 */
function resetMetrics() {
    performanceMetrics.measurements = {};
    performanceMetrics.history = {};
    performanceMetrics.frameCount = 0;
}

/**
 * 启用性能监控
 */
function enablePerformanceMonitoring() {
    performanceMetrics.enabled = true;
    resetMetrics();
}

/**
 * 禁用性能监控
 */
function disablePerformanceMonitoring() {
    performanceMetrics.enabled = false;
}

/**
 * 获取性能监控状态
 * @returns {boolean}
 */
function isPerformanceMonitoringEnabled() {
    return performanceMetrics.enabled;
}

/**
 * 记录帧
 */
function recordFrame() {
    if (!performanceMetrics.enabled) return;
    performanceMetrics.frameCount++;
}

/**
 * 获取帧数
 * @returns {number}
 */
function getFrameCount() {
    return performanceMetrics.frameCount;
}

/**
 * 打印性能报告到控制台
 */
function printPerformanceReport() {
    if (!performanceMetrics.enabled) {
        console.log('[Performance] Monitoring is disabled');
        return;
    }

    const metrics = getMetrics();
    console.log('=== Performance Report ===');
    console.log(`Total Frames: ${performanceMetrics.frameCount}`);
    console.log('');

    for (const label in metrics) {
        const m = metrics[label];
        console.log(`${label}:`);
        console.log(`  Avg: ${m.avgTime}ms | Last: ${m.lastTime}ms`);
        console.log(`  Min: ${m.minTime}ms | Max: ${m.maxTime}ms`);
        console.log(`  Total: ${m.totalTime}ms | Count: ${m.count}`);
        console.log('');
    }
}

// 导出到全局（开发模式）
if (typeof window !== 'undefined') {
    window.enablePerformanceMonitoring = enablePerformanceMonitoring;
    window.disablePerformanceMonitoring = disablePerformanceMonitoring;
    window.getPerformanceMetrics = getMetrics;
    window.printPerformanceReport = printPerformanceReport;
    window.resetPerformanceMetrics = resetMetrics;
}
