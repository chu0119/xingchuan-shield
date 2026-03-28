"""FastAPI 入口"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.core.database import init_db
from app.api import logs, threats, dashboard, geo, rules, ai

app = FastAPI(
    title=settings.APP_NAME,
    description="AI 驱动的日志分析与威胁检测系统",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(logs.router, prefix="/api/v1/logs", tags=["日志管理"])
app.include_router(threats.router, prefix="/api/v1/threats", tags=["威胁检测"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["仪表盘"])
app.include_router(geo.router, prefix="/api/v1/geo", tags=["地理定位"])
app.include_router(rules.router, prefix="/api/v1/rules", tags=["规则管理"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI 分析"])


@app.on_event("startup")
async def startup():
    logger.info(f"🛡️ {settings.APP_NAME} 启动中...")
    await init_db()
    logger.info("✅ 数据库初始化完成")


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": "1.0.0"}
