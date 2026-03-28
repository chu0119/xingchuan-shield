"""AI 分析服务"""
import json
from typing import Optional
from loguru import logger
from app.core.config import settings
import httpx


async def analyze_threats(threats: list[dict], log_stats: dict) -> Optional[str]:
    """调用 AI 分析威胁数据"""
    if not settings.AI_API_KEY:
        return None

    prompt = f"""你是一名网络安全专家。请分析以下日志威胁数据，给出安全评估报告。

## 日志统计
{json.dumps(log_stats, ensure_ascii=False, indent=2)}

## 威胁详情（前50条）
{json.dumps(threats[:50], ensure_ascii=False, indent=2)}

请输出：
1. 总体风险评估（高/中/低）
2. 攻击类型分析
3. 攻击源分析
4. 建议措施
"""

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{settings.AI_API_BASE}/chat/completions",
                headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
                json={
                    "model": settings.AI_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                },
            )
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"AI 分析失败: {e}")
        return None


async def analyze_logs(entries: list[dict]) -> Optional[str]:
    """AI 分析日志内容"""
    if not settings.AI_API_KEY:
        return None

    sample = entries[:30]
    prompt = f"""分析以下 Web 服务器日志，识别异常模式和潜在攻击。

{json.dumps(sample, ensure_ascii=False, indent=2)}

请简要总结：
1. 是否存在攻击行为
2. 攻击类型和手法
3. 攻击源 IP
4. 风险等级
"""

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{settings.AI_API_BASE}/chat/completions",
                headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
                json={
                    "model": settings.AI_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                },
            )
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"AI 分析失败: {e}")
        return None
