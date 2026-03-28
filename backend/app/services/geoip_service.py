"""IP 地理定位服务（离线 / 在线 API）"""
import httpx
from typing import Optional
from loguru import logger

# 免费 GeoIP API
GEOIP_APIS = [
    "http://ip-api.com/json/{ip}?fields=status,country,regionName,city,lat,lon",
    "https://ipwhois.app/json/{ip}",
]

_geo_cache: dict[str, dict] = {}


async def lookup_ip(ip: str) -> Optional[dict]:
    """查询 IP 地理位置"""
    if ip in ("127.0.0.1", "localhost", "::1", ""):
        return {"country": "本地", "city": "本地", "lat": 0, "lon": 0}

    if ip.startswith("10.") or ip.startswith("172.") or ip.startswith("192.168."):
        return {"country": "内网", "city": "内网", "lat": 0, "lon": 0}

    if ip in _geo_cache:
        return _geo_cache[ip]

    async with httpx.AsyncClient(timeout=5.0) as client:
        for api_url in GEOIP_APIS:
            try:
                resp = await client.get(api_url.format(ip=ip))
                data = resp.json()
                if data.get("status") == "success" or "country" in data:
                    result = {
                        "country": data.get("country", ""),
                        "city": data.get("city", ""),
                        "region": data.get("regionName", ""),
                        "lat": data.get("lat", 0),
                        "lon": data.get("lon", 0),
                        "isp": data.get("isp", ""),
                    }
                    _geo_cache[ip] = result
                    return result
            except Exception as e:
                logger.debug(f"GeoIP API {api_url} 失败: {e}")
                continue

    return None


def batch_lookup(ips: list[str]) -> dict[str, Optional[dict]]:
    """批量查询（从缓存返回，异步查询在外部调用）"""
    return {ip: _geo_cache.get(ip) for ip in ips}
