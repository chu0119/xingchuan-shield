"""地理定位 API"""
from fastapi import APIRouter, HTTPException
from collections import Counter
from app.api.logs import _sessions
from app.services.geoip_service import lookup_ip

router = APIRouter()


@router.get("/attack-map")
async def attack_map(session_id: str):
    """攻击地图数据"""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(404, "会话未找到")

    entries = session.get("entries", [])
    threat_entries = [e for e in entries if e.get("threat_level")]

    # 聚合 IP + 次数
    ip_counter = Counter(e["ip"] for e in threat_entries if e.get("ip"))

    attack_points = []
    for ip, count in ip_counter.most_common(50):
        geo = await lookup_ip(ip)
        if geo and geo.get("lat") and geo.get("lon"):
            attack_points.append({
                "ip": ip,
                "lat": geo["lat"],
                "lon": geo["lon"],
                "country": geo.get("country", ""),
                "city": geo.get("city", ""),
                "count": count,
            })

    return {"attack_points": attack_points}


@router.get("/ip/{ip}")
async def ip_detail(ip: str):
    """单个 IP 详情"""
    geo = await lookup_ip(ip)
    if not geo:
        return {"ip": ip, "geo": None}

    # 统计该 IP 在所有会话中的威胁
    total_threats = 0
    for session in _sessions.values():
        for e in session.get("entries", []):
            if e.get("ip") == ip and e.get("threat_level"):
                total_threats += 1

    return {"ip": ip, "geo": geo, "total_threats": total_threats}
