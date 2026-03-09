/**
 * split-main.js - 将 main.js 拆分为模块化文件
 *
 * 用法: node tools/split-main.js
 *
 * 将 src/main.js 按逻辑模块拆分到 src/modules/ 目录下。
 * 所有模块通过 <script> 标签按顺序加载，共享全局作用域。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MAIN_JS = path.join(ROOT, 'src', 'main.js');
const MODULES_DIR = path.join(ROOT, 'src', 'modules');

// 模块定义: [文件名, 起始行(1-based), 结束行(1-based), 描述]
const MODULES = [
    ['01-config.js',      1,    578,  '全局状态、常量、模板定义'],
    ['02-utils.js',       580,  597,  '通用工具函数'],
    ['03-audio.js',       599,  824,  '音频系统 (BGM、TTS、音效)'],
    ['04-weapons.js',     826,  965,  '武器与战斗系统'],
    ['05-difficulty.js',  967,  1100, '难度系统与动态调整'],
    ['06-biome.js',       1102, 1243, '生物群系与天气系统'],
    ['07-viewport.js',    1245, 1620, '视口缩放与配置应用'],
    ['08-account.js',     1621, 2101, '账号系统、登录、成就'],
    ['09-vocab.js',       2103, 2495, '词汇系统与词库管理'],
    ['10-ui.js',          2497, 2836, 'UI覆盖层、游戏结束、复活'],
    ['11-game-init.js',   2837, 3400, '游戏初始化、关卡生成'],
    ['12-challenges.js',  3401, 3817, '单词收集与学习挑战'],
    ['13-game-loop.js',   3818, 4571, '游戏主循环、背包、装备'],
    ['14-renderer.js',    4573, 5753, '渲染系统 (绘制函数)'],
    ['15-entities.js',    5754, 7075, '碰撞检测与实体类'],
    ['16-events.js',      7076, 7401, '事件绑定与输入处理'],
    ['17-bootstrap.js',   7402, 7663, '启动入口与测试API'],
];

// 读取 main.js
let content = fs.readFileSync(MAIN_JS, 'utf8');
// 去除 BOM
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
}
const lines = content.split('\n');

console.log(`main.js 共 ${lines.length} 行`);

// 创建 modules 目录
if (!fs.existsSync(MODULES_DIR)) {
    fs.mkdirSync(MODULES_DIR, { recursive: true });
}

// 验证覆盖范围
let covered = new Set();
for (const [name, start, end] of MODULES) {
    for (let i = start; i <= end; i++) {
        if (covered.has(i)) {
            console.error(`错误: 第 ${i} 行在 ${name} 中重复覆盖`);
            process.exit(1);
        }
        covered.add(i);
    }
}

// 检查遗漏的非空行
for (let i = 1; i <= lines.length; i++) {
    if (!covered.has(i) && lines[i - 1].trim() !== '') {
        console.warn(`警告: 第 ${i} 行未被覆盖: "${lines[i - 1].trim().substring(0, 60)}"`);
    }
}

// 拆分并写入文件
for (const [name, start, end, desc] of MODULES) {
    const moduleLines = lines.slice(start - 1, end);

    // 去除首尾空行
    while (moduleLines.length > 0 && moduleLines[0].trim() === '') moduleLines.shift();
    while (moduleLines.length > 0 && moduleLines[moduleLines.length - 1].trim() === '') moduleLines.pop();

    const header = `/**\n * ${name} - ${desc}\n * 从 main.js 拆分 (原始行 ${start}-${end})\n */\n`;
    const output = header + moduleLines.join('\n') + '\n';

    const filePath = path.join(MODULES_DIR, name);
    fs.writeFileSync(filePath, output, 'utf8');
    console.log(`✓ ${name} (${moduleLines.length} 行)`);
}

console.log(`\n拆分完成! ${MODULES.length} 个模块已写入 src/modules/`);
