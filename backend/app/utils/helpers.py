"""工具函数"""
from datetime import datetime
from typing import Any


def format_size(size_bytes: int) -> str:
    """格式化文件大小"""
    for unit in ("B", "KB", "MB", "GB"):
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"


def format_time(dt: datetime | None) -> str:
    """格式化时间"""
    if not dt:
        return ""
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def to_dict(obj: Any) -> dict:
    """将 dataclass/对象转为字典"""
    if hasattr(obj, "__dataclass_fields__"):
        return {k: (to_dict(v) if hasattr(v, "__dataclass_fields__") else v) for k, v in obj.__dict__.items()}
    return obj


def safe_int(value: Any, default: int = 0) -> int:
    """安全转 int"""
    try:
        return int(value)
    except (ValueError, TypeError):
        return default
