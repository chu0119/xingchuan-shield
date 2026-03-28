#!/bin/bash
set -e

echo "🛡️ 星川智盾 — 一键安装脚本"
echo "============================"

# Check Python
echo ""
echo "📌 检查 Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    echo "✅ Python: $PYTHON_VERSION"
else
    echo "❌ 未找到 Python3，请安装 Python 3.10+"
    exit 1
fi

# Check Node.js
echo "📌 检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version 2>&1)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ 未找到 Node.js，请安装 Node.js 18+"
    exit 1
fi

# Install backend deps
echo ""
echo "📦 安装后端依赖..."
cd backend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ 已创建 .env 配置文件"
fi
echo "⏳ pip install -r requirements.txt"
pip install -r requirements.txt
echo "✅ 后端依赖安装完成"

# Install frontend deps
echo ""
echo "📦 安装前端依赖..."
cd ../frontend
echo "⏳ npm install"
npm install
echo "✅ 前端依赖安装完成"

echo ""
echo "============================"
echo "🎉 安装完成！"
echo ""
echo "启动后端: cd backend && uvicorn app.main:app --reload"
echo "启动前端: cd frontend && npm run dev"
echo "访问地址: http://localhost:5173"
echo ""
