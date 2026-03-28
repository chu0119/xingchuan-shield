<div align="center">

# 🛡️ 星川智盾 | XingChuan Shield

**AI 驱动的 Web 日志威胁分析系统**

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](#english) | [中文](#中文)

</div>

---

## 中文

### 📖 简介

星川智盾是一款基于 AI 的 Web 日志安全分析系统，支持多格式日志解析、智能威胁检测、实时可视化仪表盘和地理溯源。帮助安全团队快速发现并响应 Web 攻击。

### ✨ 功能特性

| 模块 | 功能 | 描述 |
|------|------|------|
| 🔍 **日志解析** | 多格式支持 | Nginx / Apache / IIS / JSON 日志格式自动识别 |
| 🎯 **威胁检测** | 130+ 检测规则 | SQL注入、XSS、RCE、WebShell、扫描器、路径穿越、漏洞利用 |
| 📊 **实时仪表盘** | 可视化分析 | ECharts 图表、攻击趋势、威胁分布、Top 排行 |
| 🌍 **地理溯源** | IP 定位 | 全球攻击地图、攻击源地理分布 |
| 🌳 **路径分析** | 访问路径树 | URL 路径树状结构、威胁路径标注 |
| 🤖 **AI 分析** | 智能研判 | LLM 驱动的威胁深度分析（可选） |
| 🐳 **一键部署** | Docker | Docker Compose 一键启动 |

### 🛠️ 技术栈

**后端**
- Python 3.12 + FastAPI
- Loguru 日志框架
- 正则引擎 + 多格式解析器
- GeoIP 免费地理定位

**前端**
- React 19 + TypeScript
- Tailwind CSS + 赛博朋克主题
- ECharts 数据可视化
- Vite 构建工具

**部署**
- Docker + Docker Compose
- Nginx 反向代理

### 📸 截图

> 🚧 截图占位符 — 部署后替换

| 仪表盘总览 | 威胁检测 |
|:---:|:---:|
| `[截图: Dashboard]` | `[截图: Threats]` |

| 地理溯源 | 日志上传 |
|:---:|:---:|
| `[截图: GeoMap]` | `[截图: Upload]` |

### 🚀 快速开始

#### Docker 一键部署（推荐）

```bash
git clone https://github.com/chu0119/xingchuan-shield.git
cd xingchuan-shield
docker compose up -d
```

访问 `http://localhost` 即可使用。

#### 手动部署

```bash
# 后端
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 前端（新终端）
cd frontend
npm install
npm run dev
```

访问 `http://localhost:5173`，后端 API 运行在 `http://localhost:8000`。

### 📋 使用指南

1. **上传日志** → 在「日志上传」页面拖拽上传或粘贴日志内容
2. **自动解析** → 系统自动识别格式并解析（Nginx/Apache/IIS/JSON）
3. **威胁检测** → 130+ 规则自动匹配，识别 SQL 注入、XSS、RCE 等攻击
4. **查看结果** → 仪表盘查看统计概览，威胁页面查看详细事件
5. **地理溯源** → 攻击地图查看全球攻击分布
6. **AI 分析** → （可选）接入 LLM 进行深度威胁研判

### 📡 API 文档

启动后端后访问：
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

#### 核心 API

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/health` | 健康检查 |
| `POST` | `/api/v1/logs/upload` | 上传日志文件 |
| `POST` | `/api/v1/logs/paste` | 粘贴日志解析 |
| `POST` | `/api/v1/logs/parse` | 解析已上传文件 |
| `GET` | `/api/v1/threats/summary` | 威胁摘要统计 |
| `GET` | `/api/v1/threats/list` | 威胁列表 |
| `GET` | `/api/v1/dashboard/overview` | 仪表盘总览 |
| `GET` | `/api/v1/dashboard/timeline` | 时间线趋势 |
| `GET` | `/api/v1/geo/attack-map` | 攻击地图数据 |
| `GET` | `/api/v1/rules` | 检测规则管理 |

### 📁 目录结构

```
xingchuan-shield/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI 入口
│   │   ├── api/             # API 路由
│   │   ├── core/            # 配置、数据库
│   │   ├── detectors/       # 威胁检测引擎
│   │   ├── parsers/         # 日志解析器
│   │   ├── services/        # 业务服务
│   │   └── utils/           # 工具函数
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 通用组件
│   │   ├── lib/             # API、Mock 数据
│   │   └── styles/          # 全局样式
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── tests/samples/           # 测试日志样本
├── docker-compose.yml
└── README.md
```

### ❓ 常见问题

**Q: 支持哪些日志格式？**
A: 支持 Nginx combined、Apache combined、IIS W3C 和 JSON 格式，默认自动检测。

**Q: 威胁检测准确率如何？**
A: 基于 130+ 正则规则匹配，覆盖主流 Web 攻击类型。适合作为安全运营辅助工具，建议结合 WAF 使用。

**Q: AI 分析功能如何启用？**
A: 在后端 `.env` 中配置 LLM API Key 即可启用 AI 深度分析功能。

**Q: 数据是否会上传？**
A: 所有分析均在本地完成，GeoIP 查询使用免费公共 API。不会上传任何日志数据。

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 📄 许可证

[MIT License](LICENSE)

---

## English

### 📖 Overview

XingChuan Shield is an AI-powered Web log security analysis system with multi-format log parsing, intelligent threat detection, real-time dashboards, and geo-mapping.

### ✨ Features

| Module | Feature | Description |
|--------|---------|-------------|
| 🔍 **Log Parsing** | Multi-format | Nginx / Apache / IIS / JSON auto-detection |
| 🎯 **Threat Detection** | 130+ rules | SQLi, XSS, RCE, WebShell, Scanner, Path Traversal, Vuln Exploit |
| 📊 **Dashboard** | Visualization | ECharts, attack trends, threat distribution, top rankings |
| 🌍 **Geo Mapping** | IP Location | Global attack map with geo-distribution |
| 🌳 **Path Analysis** | URL Tree | Hierarchical URL path tree with threat annotations |
| 🤖 **AI Analysis** | LLM-powered | Deep threat analysis (optional) |
| 🐳 **One-click Deploy** | Docker | Docker Compose ready |

### 🚀 Quick Start

```bash
git clone https://github.com/chu0119/xingchuan-shield.git
cd xingchuan-shield
docker compose up -d
# Visit http://localhost
```

### 📄 License

[MIT License](LICENSE)
