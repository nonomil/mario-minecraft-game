# 需求文档：APK登录页面问题修复

## 问题描述
用户报告：编译的APK中，首页没有弹窗登录页面，也无法进入游戏。

## 当前代码分析

### 登录流程架构
1. **Game.html**（源码）结构：
   - `login-screen` div: 登录屏幕（默认CSS `display: none`）
   - `screen-overlay` div: 覆盖层（用于开始/暂停/游戏结束）

2. **启动流程** (`17-bootstrap.js:start()`)：
   - 第191行: 调用 `initLoginScreen()`

3. **`initLoginScreen()` 逻辑** (`08-account.js:321`)：
   - 获取 `login-screen` 元素
   - 移除 `visible` 类（隐藏登录屏幕）
   - 调用 `setOverlay(true, "start")` 显示开始覆盖层

4. **`setOverlay()` 逻辑**：
   - 添加 `visible` 类到 `screen-overlay`
   - 当 `mode === "start"` 时：
     - 设置 `startOverlayActive = true`
     - 调用 `ensureStartOverlayContent()` 渲染覆盖层内容
     - 调用 `setStartOverlayPage("intro")` 显示介绍页面

### 关键CSS
```css
.login-screen { display: none; }
.login-screen.visible { display: flex; }
.screen-overlay { display: none; }
.screen-overlay.visible { display: flex; }
```

## 根因分析（更新）

### 第一次修复后发现的问题
文件同步后，问题仍然存在。通过 Playwright 浏览器测试捕获到关键错误：

```
[PAGE ERROR] Cannot access 'optLanguageMode' before initialization
```

### 真正的根因
**`src/modules/16-events.js` 第 64-65 行在变量声明之前访问了 `optLanguageMode`**

代码结构问题：
```javascript
// 第 64-65 行：这里使用了 optLanguageMode
if (optLanguageMode) {
    optLanguageMode.addEventListener("change", () => syncBridgeGradeScopeVisibility(optLanguageMode.value));
}

// ... 其他代码 ...

// 第 77 行：这里才声明 optLanguageMode
const optLanguageMode = document.getElementById("opt-language-mode");
```

JavaScript 的暂时性死区（Temporal Dead Zone）：`const`/`let` 变量会被提升，但在声明之前访问会抛出错误，导致整个启动流程中断，`initLoginScreen()` 无法执行。

### 修复方案
将 `optLanguageMode` 的声明移到使用它的地方之前，与其他 DOM 查询放在一起（第 57 行后）。

### 修复验证
- ✓ JavaScript 错误消失
- ✓ `screen-overlay` 正确显示（visible: true）
- ✓ 登录/开始弹窗正常工作

## 状态
**已修复并验证** - 请重新构建APK。
