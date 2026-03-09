#!/bin/bash

# Mario Minecraft Debug Server Launcher
# 适用于 Git Bash / WSL / Linux / macOS

cd "$(dirname "$0")/../.."

echo "========================================"
echo "  Mario Minecraft 调试服务器"
echo "========================================"
echo ""

echo "[1/3] 检查环境..."
USE_NODE=0
USE_PYTHON=0

if command -v node &> /dev/null; then
    echo "✓ 找到 Node.js"
    USE_NODE=1
else
    echo "✗ 未找到 Node.js"
fi

if command -v python3 &> /dev/null; then
    echo "✓ 找到 Python3"
    USE_PYTHON=1
elif command -v python &> /dev/null; then
    echo "✓ 找到 Python"
    USE_PYTHON=1
else
    echo "✗ 未找到 Python"
fi

echo ""

if [ $USE_NODE -eq 1 ] && [ -f "tools/serve-apk.mjs" ]; then
    echo "[2/3] 使用 Node.js 服务器 (tools/serve-apk.mjs)"
    echo "[3/3] 启动服务器: http://localhost:4173"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "========================================"
    echo ""
    sleep 1

    # 尝试打开浏览器
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:4173/tests/debug-pages/GameDebug.html" &> /dev/null &
    elif command -v open &> /dev/null; then
        open "http://localhost:4173/tests/debug-pages/GameDebug.html" &> /dev/null &
    elif command -v start &> /dev/null; then
        start "http://localhost:4173/tests/debug-pages/GameDebug.html" &> /dev/null &
    fi

    node tools/serve-apk.mjs --port 4173
    exit 0
fi

if [ $USE_PYTHON -eq 1 ]; then
    echo "[2/3] 使用 Python 简易服务器"
    echo "[3/3] 启动服务器: http://localhost:4173"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "========================================"
    echo ""
    sleep 1

    # 尝试打开浏览器
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:4173/tests/debug-pages/GameDebug.html" &> /dev/null &
    elif command -v open &> /dev/null; then
        open "http://localhost:4173/tests/debug-pages/GameDebug.html" &> /dev/null &
    elif command -v start &> /dev/null; then
        start "http://localhost:4173/tests/debug-pages/GameDebug.html" &> /dev/null &
    fi

    if command -v python3 &> /dev/null; then
        python3 -m http.server 4173
    else
        python -m http.server 4173
    fi
    exit 0
fi

echo "[错误] 未找到 Python 或 Node.js"
echo ""
echo "请安装以下任一工具:"
echo "  - Python 3.x: https://www.python.org/downloads/"
echo "  - Node.js: https://nodejs.org/"
echo ""
read -p "按 Enter 键退出..."
