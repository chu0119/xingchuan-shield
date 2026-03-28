"""应用配置管理"""
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    APP_NAME: str = "星川智盾"
    APP_PORT: int = 8001
    DATABASE_URL: str = "sqlite+aiosqlite:///./shield.db"
    MAX_UPLOAD_SIZE: int = 500 * 1024 * 1024  # 500MB
    UPLOAD_DIR: str = "./uploads"
    AI_API_KEY: str = ""
    AI_API_BASE: str = "https://api.openai.com/v1"
    AI_MODEL: str = "gpt-4o-mini"
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000", "http://localhost:80"]

    @property
    def upload_path(self) -> Path:
        return Path(self.UPLOAD_DIR)

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
