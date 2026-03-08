# 词库显示问题修复

## 问题描述
用户反馈：设置界面的词库下拉框中看不到"小学"词库选项。

## 根本原因
**Stage 分类不匹配**：

1. **manifest.js** 中定义的 stage：
   - 幼儿园：`kindergarten`
   - 小学：`elementary` ✅
   - 初中：`junior_high`
   - Minecraft：`minecraft`

2. **09-vocab.js** 中的 stageOrder：
   - 使用的是旧分类：`elementary_lower`, `elementary_upper` ❌
   - 导致 `elementary` stage 的词库无法匹配，不显示

## 修复方案

### 修改文件
`src/modules/09-vocab.js` (行 341-349)

### 修改内容
```javascript
// 修改前
const stageOrder = ["kindergarten", "elementary_lower", "elementary_upper", "junior_high", "minecraft", "custom"];
const stageLabels = {
    "kindergarten": "幼儿园",
    "elementary_lower": "小学低年级",
    "elementary_upper": "小学高年级",
    "junior_high": "初中",
    "minecraft": "我的世界",
    "custom": "自定义"
};

// 修改后
const stageOrder = ["kindergarten", "elementary", "junior_high", "minecraft", "custom"];
const stageLabels = {
    "kindergarten": "幼儿园",
    "elementary": "小学",
    "junior_high": "初中",
    "minecraft": "我的世界",
    "custom": "自定义"
};
```

## 修复效果

### 修复前
```
词库下拉框显示：
├─ 随机词库（按类别轮换）
├─ 幼儿园
│  └─ 幼儿园
├─ 初中
│  ├─ 初级
│  ├─ 中级
│  └─ 完整
└─ 我的世界
   ├─ 初级
   ├─ 中级
   └─ 完整

❌ 缺少"小学"分组
```

### 修复后
```
词库下拉框显示：
├─ 随机词库（按类别轮换）
├─ 幼儿园
│  └─ 幼儿园
├─ 小学 ✅
│  ├─ 初级
│  ├─ 中级
│  └─ 完整
├─ 初中
│  ├─ 初级
│  ├─ 中级
│  └─ 完整
└─ 我的世界
   ├─ 初级
   ├─ 中级
   └─ 完整
```

## Git 提交
- **Commit**: aed5efd
- **Message**: "fix: update vocab select stage labels to match simplified classification"

## 相关修复
这是词库简化工作的后续修复：
1. ✅ manifest.js 简化分类（commit 7967c9f, 30c5c5b）
2. ✅ 修复全局变量名（commit e2773e7）
3. ✅ 修复 stage 标签匹配（commit aed5efd）← 本次修复

## 测试方法
1. 刷新浏览器（Ctrl+F5）
2. 打开游戏设置
3. 查看"词库"下拉框
4. 应该可以看到"小学"分组，包含初级/中级/完整三个选项
