"""威胁检测 API"""
from fastapi import APIRouter, HTTPException
from typing import Optional
from collections import Counter

from app.api.logs import _sessions

router = APIRouter()


@router.get("/summary")
async def threat_summary(session_id: Optional[str] = None):
    """威胁摘要统计"""
    if session_id and session_id not in _sessions:
        raise HTTPException(404, "会话未找到")

    sessions = [_sessions[session_id]] if session_id else list(_sessions.values())

    total = 0
    by_type: Counter = Counter()
    by_level: Counter = Counter()

    for s in sessions:
        for e in s.get("entries", []):
            if e.get("threat_level"):
                total += 1
                by_type[e.get("threat_type", "unknown")] += 1
                by_level[e.get("threat_level", "unknown")] += 1

    return {
        "total_threats": total,
        "by_type": dict(by_type),
        "by_level": dict(by_level),
        "critical": by_level.get("critical", 0),
        "high": by_level.get("high", 0),
        "medium": by_level.get("medium", 0),
        "low": by_level.get("low", 0),
    }


@router.get("/list")
async def threat_list(
    session_id: str,
    page: int = 1,
    page_size: int = 50,
    level: Optional[str] = None,
    category: Optional[str] = None,
):
    """威胁列表"""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(404, "会话未找到")

    threats = []
    for e in session.get("entries", []):
        if not e.get("threat_level"):
            continue
        for t in e.get("threats", []):
            if level and t.get("level") != level:
                continue
            if category and t.get("category") != category:
                continue
            threats.append({**t, "ip": e["ip"], "path": e["path"], "timestamp": e["timestamp"]})

    total = len(threats)
    start = (page - 1) * page_size
    return {"total": total, "page": page, "page_size": page_size, "threats": threats[start:start + page_size]}


@router.get("/{session_id}/detail")
async def threat_detail(session_id: str):
    """会话威胁详细分析"""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(404, "会话未找到")

    entries = session.get("entries", [])
    threat_entries = [e for e in entries if e.get("threat_level")]

    # 攻击源 IP 统计
    ip_counter = Counter(e["ip"] for e in threat_entries)

    # 被攻击路径统计
    path_counter = Counter(e["path"] for e in threat_entries)

    return {
        "session_id": session_id,
        "total_entries": len(entries),
        "threat_entries": len(threat_entries),
        "top_attack_ips": ip_counter.most_common(20),
        "top_attacked_paths": path_counter.most_common(20),
    }
