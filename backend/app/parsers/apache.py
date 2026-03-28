"""Apache 日志解析器"""
import re
from datetime import datetime
from typing import Optional
from app.parsers.base import BaseParser, LogEntry

# Apache Combined Log Format
APACHE_COMBINED_RE = re.compile(
    r'(?P<ip>[\d.]+|[\da-fA-F:]+)'
    r'\s+(?P<ident>\S+)'
    r'\s+(?P<user>\S+)'
    r'\s+\[(?P<time>[^\]]+)\]'
    r'\s+"(?P<method>\w+)\s+(?P<path>[^\s]*?)\s*(?P<protocol>[^"]*)?"'
    r'\s+(?P<status>\d{3})'
    r'\s+(?P<size>\d+|-)'
    r'(?:\s+"(?P<referer>[^"]*)")?'
    r'(?:\s+"(?P<ua>[^"]*)")?'
)

# Apache Common Log Format (no referer/ua)
APACHE_COMMON_RE = re.compile(
    r'(?P<ip>[\d.]+|[\da-fA-F:]+)'
    r'\s+(?P<ident>\S+)'
    r'\s+(?P<user>\S+)'
    r'\s+\[(?P<time>[^\]]+)\]'
    r'\s+"(?P<method>\w+)\s+(?P<path>[^\s]*?)\s*(?P<protocol>[^"]*)?"'
    r'\s+(?P<status>\d{3})'
    r'\s+(?P<size>\d+|-)'
)

APACHE_TIME_FORMATS = [
    "%d/%b/%Y:%H:%M:%S %z",
    "%d/%b/%Y:%H:%M:%S",
]


class ApacheParser(BaseParser):
    @property
    def name(self) -> str:
        return "apache"

    def detect_format(self, sample_lines: list[str]) -> bool:
        matches = 0
        for line in sample_lines[:10]:
            line = line.strip()
            if not line:
                continue
            if APACHE_COMBINED_RE.match(line) or APACHE_COMMON_RE.match(line):
                matches += 1
        return matches >= 2

    def parse_line(self, line: str) -> Optional[LogEntry]:
        line = line.strip()
        if not line:
            return None

        m = APACHE_COMBINED_RE.match(line) or APACHE_COMMON_RE.match(line)
        if not m:
            return None

        ts = self._parse_time(m.group("time"))
        size_str = m.group("size")
        status_str = m.group("status")

        return LogEntry(
            timestamp=ts,
            ip=m.group("ip"),
            method=m.group("method") or "",
            path=m.group("path") or "",
            protocol=m.group("protocol") or "",
            status_code=int(status_str) if status_str and status_str != "-" else 0,
            response_size=int(size_str) if size_str and size_str != "-" else 0,
            referer=m.group("referer") or "",
            user_agent=m.group("ua") or "",
            raw_line=line,
        )

    def _parse_time(self, time_str: str) -> Optional[datetime]:
        for fmt in APACHE_TIME_FORMATS:
            try:
                return datetime.strptime(time_str, fmt)
            except (ValueError, TypeError):
                continue
        return None
