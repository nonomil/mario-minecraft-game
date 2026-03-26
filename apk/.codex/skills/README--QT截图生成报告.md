### 6. `qt-design-preview/SKILL.md`

**用途**：Qt 界面截图与证据采集技能

**何时使用**：需要为 `QML` 预览界面或 `PySide6/PyQt QWidget` 工作台抓真实截图，判断页面是否拥挤、是否需要拆标签页或弹窗

**功能**：

- 批量导出主窗口页面截图
- 导出中心区、参数区、状态标签截图
- 导出 `05/06` 次级弹窗与工程总览大窗口截图
- 写出 `capture_manifest.json`

**调用方式**：

```bash
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill qt-design-preview
```

**适合触发的话术**：

- “重新截图”
- “重新抓一轮主项目 UI 截图”
- “把 `main_prj` 当前页面和弹窗都截出来”

**仓库内推荐触发方式**：

- 在对话里直接说“使用 `qt-design-preview`”

### 7. `qt-widget-ui-review/SKILL.md`

**用途**：Qt 截图结构化评审技能

**何时使用**：已经有截图和 `capture_manifest.json`，需要输出逐页 UI 问题、优先级和整改建议

**功能**：

- 按页面类型分类评审
- 读取 `page_kind`、`review_focus`、`state_captures`
- 输出本地 Markdown 评审报告
- 给出标签页 / 弹窗 / 日志栏拆分建议

**调用方式**：

```bash
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill qt-widget-ui-review
```

**适合触发的话术**：

- “分析布局”
- “基于这批截图出一份 UI 评审报告”
- “只做截图评审，不用重抓图”

**仓库内推荐触发方式**：

- 在对话里直接说“使用 `qt-widget-ui-review`”

### 8. `qt-ui-audit/SKILL.md`

**用途**：Qt UI 评审协调技能

**何时使用**：需要对 `main_prj` 跑一整轮“截图采集 + 测试验证 + 截图评审 + 本地报告”闭环

**功能**：

- 固定调用顺序
- 串联 `qt-design-preview` 与 `qt-widget-ui-review`
- 要求落地本地 Markdown 报告
- 固定交付 `manifest`、截图路径、测试结果和优先级建议

**调用方式**：

```bash
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill qt-ui-audit
```

**适合触发的话术**：

- “截图并给出报告”
- “重新截图分析布局”
- “跑一轮主项目 Qt UI 体检”
- “重新截图并输出新的界面评审报告”

**仓库内推荐触发方式**：

- 在对话里直接说“使用 `qt-ui-audit`”

## Qt UI 技能链

如果任务和当前仓库的 `PySide6` 界面评审有关，优先按下面方式选 skill：

| 目标         | 推荐 skill            | 说明                           |
| ------------ | --------------------- | ------------------------------ |
| 只抓截图     | `qt-design-preview`   | 只做证据采集，不下结论         |
| 只评已有截图 | `qt-widget-ui-review` | 只做结构化评审                 |
| 跑完整闭环   | `qt-ui-audit`         | 直接串联截图、测试、评审和报告 |

推荐触发词：

- “重新截图”
- “分析布局”
- “截图并给出报告”

Qt UI 报告图片目录规则：

- Markdown：`main_prj/docs/analysis/<report>.md`
- 图片：`main_prj/docs/analysis/img/<report>.assets/`
- 引用：`![标题](img/<report>.assets/image-YYYYMMDDHHMMSSmmm.png)`