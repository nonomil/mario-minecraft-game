# 调试和测试页面

这个文件夹包含用于调试和测试的 HTML 页面。

## 快速启动调试服务器

### Windows
双击运行 `start-debug-server.bat`

### Git Bash / WSL / Linux / macOS
```bash
bash start-debug-server.sh
```

启动脚本会自动：
1. 检测系统环境（Node.js 或 Python）
2. 启动 HTTP 服务器（端口 4173）
3. 自动打开浏览器访问 GameDebug.html

## 为什么需要 HTTP 服务器？

使用 `file://` 协议直接打开 HTML 文件时，浏览器的同源策略会阻止：
- 父页面访问 iframe 内容
- 调试面板调用游戏内部函数
- 跨文档通信

使用 HTTP 服务器可以解决这些限制。

## 调试页面

### GameDebug.html（推荐）
完整的游戏调试面板，支持：
- 切换群系（森林、雪地、沙漠、蘑菇岛等）
- 设置分数和轮次
- 生成敌人和 BOSS
- 触发学习挑战（长词、短语、双空补全）
- 给予物品
- 无敌模式
- 生成村庄
- 龙蛋装备和召唤
- 实时状态监控

**使用方法**：
```bash
# 使用启动脚本（推荐）
start-debug-server.bat

# 或手动启动
node tools/serve-apk.mjs --port 4173
# 访问: http://localhost:4173/tests/debug-pages/GameDebug.html
```

### debug-full.html
完整的游戏初始化流程测试页面。
- 检查所有模块是否正确加载
- 测试 `generatePlatform()` 函数
- 验证平台创建和渲染
- 显示详细的调试日志

**使用方法**：
```bash
# 启动开发服务器
npm run dev

# 访问
http://localhost:4173/tests/debug-pages/debug-full.html
```

### debug-platforms.html
简单的平台创建和渲染测试。
- 手动创建测试平台
- 验证 Platform 类
- 测试基础渲染功能

### diagnose.html
浏览器环境诊断页面。
- 检查 canvas 元素
- 验证全局变量
- 检查脚本加载

### minimal-test.html
最小化模块测试。
- 测试基础模块加载
- 验证 canvas 渲染
- 检查关键变量定义

## 模块加载测试

### test.html
测试模块加载顺序和依赖关系。

### test2.html
测试配置文件加载。

### test3.html
测试实体类加载。

### test4.html
测试渲染模块加载。

### test-simple2.html
简单的环境诊断测试。

## 使用建议

1. **开发新功能时**：
   - 使用 `GameDebug.html` 快速测试游戏功能
   - 使用 `debug-full.html` 验证功能是否正常工作
   - 检查控制台输出的调试信息

2. **遇到渲染问题时**：
   - 使用 `debug-platforms.html` 测试平台渲染
   - 检查 canvas 是否正常工作

3. **模块加载问题时**：
   - 使用 `test*.html` 系列页面
   - 逐步排查模块依赖问题

4. **环境问题时**：
   - 使用 `diagnose.html` 检查浏览器环境
   - 验证基础功能是否可用

## 故障排除

### 端口被占用
如果 4173 端口被占用，修改脚本中的端口号：
- `.bat` 文件：将所有 `4173` 改为其他端口（如 `8080`）
- `.sh` 文件：同样修改端口号

### 浏览器未自动打开
手动访问: http://localhost:4173/tests/debug-pages/GameDebug.html

### 调试面板显示 "iframe loaded but inaccessible"
确认使用的是 HTTP 协议（`http://localhost:4173`），而不是 `file://` 协议。

### Python 或 Node.js 未找到
安装以下任一工具：
- Python 3.x: https://www.python.org/downloads/
- Node.js: https://nodejs.org/

## 注意事项

- 这些页面仅用于开发和调试
- 不应该包含在生产构建中
- 修改游戏代码后，这些页面可能需要更新
