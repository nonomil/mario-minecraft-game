/**
 * 02-utils.js - 通用工具函数
 * 从 main.js 拆分 (原始行 580-597)
 */
function mergeDeep(target, source) {
    const output = Array.isArray(target) ? [...target] : { ...target };
    if (source && typeof source === "object" && !Array.isArray(source)) {
        Object.keys(source).forEach(key => {
            const srcValue = source[key];
            if (srcValue && typeof srcValue === "object" && !Array.isArray(srcValue)) {
                output[key] = mergeDeep(output[key] || {}, srcValue);
            } else {
                output[key] = srcValue;
            }
        });
    }
    return output;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function parseKeyCodes(raw) {
    if (!raw) return null;
    const parts = String(raw).split(",").map(s => s.trim()).filter(Boolean);
    if (parts.length !== 5) return null;
    return parts;
}
