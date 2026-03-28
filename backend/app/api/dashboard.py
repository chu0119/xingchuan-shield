"""仪表盘 API"""
from fastapi import APIRouter, HTTPException
from collections import Counter
from typing import Optional

from app.api.logs import _sessions

router = APIRouter()


@router.get("/overview")
async def overview(session_id: Optional[str] = None):
    """总览统计"""
    sessions = [_sessions[session_id]] if session_id and session_id in _sessions else list(_sessions.values())
    if not sessions:
        return {"total_entries": 0, "total_threats": 0, "unique_ips": 0, "unique_paths": 0}

    total_entries = sum(s["parsed_lines"] for s in sessions)
    all_entries = [e for s in sessions for e in s.get("entries", [])]

    return {
        "total_entries": total_entries,
        "total_threats": sum(s["threat_count"] for s in sessions),
        "unique_ips": len(set(e["ip"] for e in all_entries if e.get("ip"))),
        "unique_paths": len(set(e["path"] for e in all_entries if e.get("path"))),
        "total_sessions": len(sessions),
    }


@router.get("/timeline")
async def timeline(session_id: str, bucket: str = "hour"):
    """时间线趋势"""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(404, "会话未找到")

    entries = session.get("entries", [])
    timeline_data = Counter()

    for e in entries:
        ts = e.get("timestamp")
        if ts:
            if bucket == "hour":
                key = ts[:13]  # YYYY-MM-DDTHH
            else:
                key = ts[:10]  # YYYY-MM-DD
            timeline_data[key] += 1

    return {"timeline": dict(sorted(timeline_data.items()))}


@router.get("/top-ips")
async def top_ips(session_id: str, limit: int = 20):
    """Top 攻击源 IP"""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(404, "会话未找到")

    entries = session.get("entries", [])
    threat_entries = [e for e in entries if e.get("threat_level")]
    ip_counter = Counter(e["ip"] for e in threat_entries if e.get("ip"))
    return {"top_ips": [{"ip": ip, "count": c} for ip, c in ip_counter.most_common(limit)]}


@router.get("/top-paths")
async def top_paths(session_id: str, limit: int = 20):
    """Top 被攻击路径"""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(404, "会话未找到")

    entries = session.get("entries", [])
    threat_entries = [e for e in entries if e.get("threat_level")]
    path_counter = Counter(e["path"] for e in threat_entries if e.get("path"))
    return {"top_paths": [{"path": p, "count": c} for p, c in path_counter.most_common(limit)]}


@router.get("/status-codes")
async def status_codes(session_id: str):
    """状态码分布"""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(404, "会话未找到")

    counter = Counter(str(e["status_code"]) for e in session.get("entries", []) if e.get("status_code"))
    return {"status_codes": dict(counter)}


@router.get("/user-agents")
async def user_agents(session_id: str, limit: int = 20):
    """UA 分布"""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(404, "会话未找到")

    counter = Counter(e["user_agent"][:80] for e in session.get("entries", []) if e.get("user_agent"))
    return {"user_agents": [{"ua": ua, "count": c} for ua, c in counter.most_common(limit)]}
