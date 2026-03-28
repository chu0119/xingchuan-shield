"""IIS 日志解析器"""
import re
from datetime import datetime
from typing import Optional
from app.parsers.base import BaseParser, LogEntry

# IIS W3C format (common fields)
IIS_W3C_RE = re.compile(
    r'(?P<date>\d{4}-\d{2}-\d{2})\s+(?P<time>\d{2}:\d{2}:\d{2})'
    r'\s+(?P<sitename>\S+)'
    r'\s+(?P<sip>[\d.]+)'
    r'\s+(?P<method>\w+)'
    r'\s+(?P<path>\S+)'
    r'\s+(?P<querystring>\S+)'
    r'\s+(?P<port>\d+)'
    r'\s+(?P<username>\S+)'
    r'\s+(?P<cip>[\d.]+)'
    r'\s+(?P<ua>[^"]*?)'
    r'\s+(?P<status>\d+)'
    r'\s+(?P<substatus>\d+)'
    r'\s+(?P<win32status>\d+)'
)

# Simpler IIS format
IIS_SIMPLE_RE = re.compile(
    r'(?P<date>\d{4}-\d{2}-\d{2})\s+(?P<time>\d{2}:\d{2}:\d{2})'
    r'.*?'
    r'(?P<cip>[\d.]+)'
    r'\s+(?P<method>\w+)'
    r'\s+(?P<path>\S+)'
    r'.*?'
    r'(?P<status>\d{3})'
)


class IISParser(BaseParser):
    @property
    def name(self) -> str:
        return "iis"

    def detect_format(self, sample_lines: list[str]) -> bool:
        # IIS logs often start with #Fields: comment
        iis_lines = [l for l in sample_lines if not l.startswith("#")]
        matches = 0
        for line in iis_lines[:10]:
            line = line.strip()
            if not line:
                continue
            if IIS_W3C_RE.match(line) or IIS_SIMPLE_RE.match(line):
                matches += 1
        return matches >= 2

    def parse_line(self, line: str) -> Optional[LogEntry]:
        line = line.strip()
        if not line or line.startswith("#"):
            return None

        m = IIS_W3C_RE.match(line) or IIS_SIMPLE_RE.match(line)
        if not m:
            return None

        ts = self._parse_time(m.group("date"), m.group("time"))
        status_str = m.group("status")
        path = m.group("path")
        qs = m.group("querystring") if "querystring" in m.groupdict() else ""
        full_path = path if not qs or qs == "-" else f"{path}?{qs}"

        return LogEntry(
            timestamp=ts,
            ip=m.group("cip"),
            method=m.group("method") or "",
            path=full_path,
            protocol="HTTP/1.1",
            status_code=int(status_str) if status_str else 0,
            response_size=0,
            user_agent=m.group("ua") or "",
            referer="",
            raw_line=line,
        )

    def _parse_time(self, date_str: str, time_str: str) -> Optional[datetime]:
        try:
            return datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S")
        except (ValueError, TypeError):
            return None
