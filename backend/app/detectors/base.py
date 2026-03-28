"""检测器基类"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from app.parsers.base import LogEntry


@dataclass
class ThreatMatch:
    rule_id: str
    rule_name: str
    category: str          # sql_injection/xss/rce/webshell/scanner/vuln/path_traversal
    level: str             # low/medium/high/critical
    pattern: str           # 匹配到的内容
    description: str


class BaseDetector(ABC):
    @property
    @abstractmethod
    def category(self) -> str: ...

    @abstractmethod
    def detect(self, log_entry: LogEntry) -> list[ThreatMatch]: ...

    def _match(self, text: str, pattern: str) -> str | None:
        """返回匹配到的子串，未匹配返回 None"""
        import re
        m = re.search(pattern, text, re.IGNORECASE)
        return m.group(0) if m else None
