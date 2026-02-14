# 调试和测试页面

这个文件夹包含用于调试和测试的 HTML 页面。

## 调试页面

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

## 注意事项

- 这些页面仅用于开发和调试
- 不应该包含在生产构建中
- 修改游戏代码后，这些页面可能需要更新
