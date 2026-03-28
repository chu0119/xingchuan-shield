"""会话追踪服务"""
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional
from app.parsers.base import LogEntry


class SessionTracker:
    """基于 IP + User-Agent 的会话追踪"""

    def __init__(self, timeout_minutes: int = 30):
        self.timeout = timedelta(minutes=timeout_minutes)
        self.sessions: dict[str, list[LogEntry]] = defaultdict(list)

    def track(self, entry: LogEntry) -> str:
        """追踪日志条目，返回会话 ID"""
        session_key = f"{entry.ip}|{entry.user_agent[:50]}"
        self.sessions[session_key].append(entry)
        return session_key

    def get_session(self, session_key: str) -> list[LogEntry]:
        return self.sessions.get(session_key, [])

    def get_active_sessions(self) -> dict[str, list[LogEntry]]:
        """获取活跃会话"""
        return dict(self.sessions)

    def get_suspicious_sessions(self) -> list[dict]:
        """获取可疑会话（包含威胁的）"""
        results = []
        for key, entries in self.sessions.items():
            threats = [e for e in entries if e.threat_level]
            if threats:
                results.append({
                    "session_key": key,
                    "ip": entries[0].ip,
                    "user_agent": entries[0].user_agent,
                    "entry_count": len(entries),
                    "threat_count": len(threats),
                    "start_time": entries[0].timestamp,
                    "end_time": entries[-1].timestamp,
                    "threats": [
                        {"level": e.threat_level, "type": e.threat_type, "path": e.path}
                        for e in threats
                    ],
                })
        results.sort(key=lambda x: x["threat_count"], reverse=True)
        return results

    def clear(self):
        self.sessions.clear()
