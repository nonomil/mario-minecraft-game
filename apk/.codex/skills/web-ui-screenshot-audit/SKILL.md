---
name: web-ui-screenshot-audit
description: Use when a localhost web app needs screenshot-based UI review, flow verification, and a local Markdown report with capture_manifest.json evidence
---

# Web UI Screenshot Audit

## 概述

这是一个面向 Web/Next.js/React 本地项目的截图审查技能，用来把“页面能跑”升级成“页面有证据地被审过”。  
目标交付不是一句口头评价，而是一份本地 Markdown 报告，外加截图清单、关键流程状态和自动化验证结果。

## 何时使用

- 需要重新截图并输出前端界面审查报告
- 需要验证一个本地 `localhost` 页面在桌面端和移动端的真实表现
- 需要沿着一条关键流程抓取多个状态，例如：首页、弹层、表单完成态、任务完成态、总结页
- 需要把截图、按钮状态、页面文案、测试结果一起固化到本地文档

## 必交付物

- `docs/analysis/<date>-<topic>.md`
- `docs/analysis/img/<report>.assets/*.png`
- `docs/analysis/img/<report>.assets/capture_manifest.json`
- 至少一条自动化验证记录

## 推荐流程

### 1. 先确认运行实例

- 优先避免干扰用户正在使用的开发实例
- 如果 `3000` 已被占用，优先选择独立端口，例如 `3001`
- 报告里必须写清楚审查实例地址和启动方式

### 2. 先修数据，再截图

- 如果页面内容来自固定 fixture，先确认 fixture 没有乱码或脏数据
- Windows 下如果中文可疑，先做 UTF-8 回读和 `unicode_escape` 抽查
- 不要在污染数据上继续修补，直接整体重写干净样例

### 3. 采集截图

- 最少覆盖：
  - 首页或入口页
  - 一个弹层/设置态
  - 一个移动端视口
  - 一个流程初始态
  - 一个流程完成态
  - 一个最终总结页
- 截图同时写 `capture_manifest.json`
- `manifest` 里至少记录：
  - 文件名
  - URL
  - 视口尺寸
  - 简短状态说明
  - 关键标题或按钮状态

### 4. 采集验证证据

- 至少跑一组与页面相关的测试
- 如果要交付“当前版本可构建”，再补一次 `build`
- 报告中不要只写“通过”，要写命令、通过数、是否有警告

### 5. 输出审查报告

- 先写范围、环境、测试结果
- 再贴截图并按页面/流程分析
- 最后给出 `P1/P2` 优化建议和下一步迭代顺序

## Windows / Chrome 捕获建议

- 如果 Playwright 持久化上下文因为本机已有 Chrome 会话而失败，优先改走 Chrome CDP
- 用独立的 `--user-data-dir`
- 用独立的 `--remote-debugging-port`
- 截图后把流程状态写进 `capture_manifest.json`，不要只留裸图片

## 报告重点

- 不只看“好不好看”，还要看：
  - 入口可发现性
  - CTA 是否可理解
  - 奖励和反馈是否及时
  - 页面是否适合目标年龄段
  - 流程收口是否完整

## 常见坑

- 只截首页，不截流程中间状态
- 只给主观建议，不给测试结果
- 只存图片，不写 `manifest`
- 看到乱码后继续补丁，而不是先重写 fixture
- 只审桌面，不看移动端

## 报告模板

可直接参考同目录的 `report-template.md`。
