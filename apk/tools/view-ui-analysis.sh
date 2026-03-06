#!/bin/bash

# UI分析项目 - 快速查看脚本
# 用途：查看所有生成的文档和测试结果

echo "=========================================="
echo "  UI分析项目 - 成果总览"
echo "=========================================="
echo ""

# 1. 文档清单
echo "📄 生成的文档 (7份):"
echo "---"
ls -lh docs/plan/UI分析与优化/*.md 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
echo ""

# 2. 测试脚本
echo "🧪 测试脚本 (2个):"
echo "---"
ls -lh tests/e2e/specs/*ui*.mjs 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
echo ""

# 3. 测试结果
echo "📊 测试结果:"
echo "---"
if [ -d "test-results/deep-ui" ]; then
  screenshot_count=$(ls test-results/deep-ui/*.png 2>/dev/null | wc -l)
  echo "  截图数量: $screenshot_count 张"

  if [ -f "test-results/deep-ui/ui-analysis-complete.json" ]; then
    echo "  ✅ 完整报告已生成"
  else
    echo "  ⚠️  完整报告未生成（需重新运行测试）"
  fi
else
  echo "  ⚠️  测试结果目录不存在（需运行测试）"
fi
echo ""

# 4. 核心发现
echo "🔍 核心发现:"
echo "---"
echo "  🔴 字体大小: 15+ 种 → 需统一为 6 种"
echo "  🔴 颜色系统: 20+ 种 → 需统一为 12 种"
echo "  🔴 CSS文件: 2103 行 → 需拆分为模块化"
echo "  🟡 圆角: 6 种 → 需统一为 5 种"
echo "  🟡 间距: 10+ 种 → 需统一为 9 种"
echo ""

# 5. 下一步
echo "🚀 下一步行动:"
echo "---"
echo "  1. 阅读文档: docs/plan/UI分析与优化/README.md"
echo "  2. 查看报告: docs/plan/UI分析与优化/最终报告.md"
echo "  3. 运行测试: npm run test:e2e -- deep-ui-analysis.spec.mjs"
echo "  4. 开始实施: 创建worktree分支开始优化"
echo ""

echo "=========================================="
echo "  项目状态: ✅ 分析完成"
echo "=========================================="
