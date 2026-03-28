"""解析器基类"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


@dataclass
class LogEntry:
    timestamp: Optional[datetime] = None
    ip: str = ""
    method: str = ""
    path: str = ""
    protocol: str = ""
    status_code: int = 0
    response_size: int = 0
    user_agent: str = ""
    referer: str = ""
    raw_line: str = ""
    # 检测结果
    threat_type: Optional[str] = None
    threat_level: Optional[str] = None
    threat_detail: Optional[str] = None
    # 地理位置
    geo_country: Optional[str] = None
    geo_city: Optional[str] = None
    geo_lat: Optional[float] = None
    geo_lon: Optional[float] = None


class BaseParser(ABC):
    @abstractmethod
    def parse_line(self, line: str) -> Optional[LogEntry]:
        ...

    @abstractmethod
    def detect_format(self, sample_lines: list[str]) -> bool:
        ...
