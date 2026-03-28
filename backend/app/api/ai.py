"""AI 分析 API"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_service import analyze_threats, analyze_logs
from app.api.logs import _sessions

router = APIRouter()


class AnalyzeRequest(BaseModel):
    session_id: str
    analysis_type: str = "threats"  # threats / logs


@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    """AI 分析"""
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(404, "会话未找到")

    if req.analysis_type == "threats":
        threat_entries = [e for e in session.get("entries", []) if e.get("threat_level")]
        threats_data = [{"path": e["path"], "ip": e["ip"], "threats": e.get("threats", [])}
                       for e in threat_entries[:50]]
        stats = {"total": session["threat_count"], "entries": len(session["entries"]),
                 "format": session["log_format"]}
        result = await analyze_threats(threats_data, stats)
    else:
        entries_data = [{"path": e["path"], "ip": e["ip"], "method": e["method"]}
                       for e in session.get("entries", [])[:30]]
        result = await analyze_logs(entries_data)

    if result:
        return {"analysis": result, "session_id": req.session_id}
    return {"analysis": None, "message": "AI 分析不可用（未配置 API Key）"}
