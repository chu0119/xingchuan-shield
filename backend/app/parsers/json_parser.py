"""JSON 日志解析器"""
import json
from datetime import datetime
from typing import Optional
from app.parsers.base import BaseParser, LogEntry


class JSONParser(BaseParser):
    @property
    def name(self) -> str:
        return "json"

    def detect_format(self, sample_lines: list[str]) -> bool:
        matches = 0
        for line in sample_lines[:10]:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                if isinstance(data, dict):
                    # 至少有 ip 或 timestamp 字段
                    if any(k in data for k in ("ip", "timestamp", "path", "method", "status", "url", "uri")):
                        matches += 1
            except (json.JSONDecodeError, ValueError):
                continue
        return matches >= 2

    def parse_line(self, line: str) -> Optional[LogEntry]:
        line = line.strip()
        if not line:
            return None

        try:
            data = json.loads(line)
        except (json.JSONDecodeError, ValueError):
            return None

        if not isinstance(data, dict):
            return None

        ts = self._parse_time(
            data.get("timestamp") or data.get("time") or data.get("@timestamp") or data.get("datetime")
        )

        return LogEntry(
            timestamp=ts,
            ip=str(data.get("ip") or data.get("client_ip") or data.get("remote_addr") or data.get("source_ip") or ""),
            method=str(data.get("method") or data.get("request_method") or ""),
            path=str(data.get("path") or data.get("url") or data.get("uri") or data.get("request_uri") or ""),
            protocol=str(data.get("protocol") or data.get("http_version") or ""),
            status_code=int(data.get("status") or data.get("status_code") or data.get("response_code") or 0),
            response_size=int(data.get("size") or data.get("body_bytes_sent") or data.get("response_size") or 0),
            user_agent=str(data.get("user_agent") or data.get("ua") or data.get("http_user_agent") or ""),
            referer=str(data.get("referer") or data.get("referrer") or data.get("http_referer") or ""),
            raw_line=line,
        )

    def _parse_time(self, time_str) -> Optional[datetime]:
        if not time_str:
            return None
        time_str = str(time_str)
        # ISO 8601 variants
        for fmt in [
            "%Y-%m-%dT%H:%M:%S%z",
            "%Y-%m-%dT%H:%M:%S.%f%z",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%S.%f",
            "%Y-%m-%d %H:%M:%S",
            "%Y/%m/%d %H:%M:%S",
            "%d/%b/%Y:%H:%M:%S %z",
        ]:
            try:
                return datetime.strptime(time_str, fmt)
            except (ValueError, TypeError):
                continue
        # Fallback: fromisoformat
        try:
            return datetime.fromisoformat(time_str)
        except (ValueError, TypeError):
            return None
