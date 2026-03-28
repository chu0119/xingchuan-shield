"""日志管理 API"""
import uuid
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from loguru import logger

from app.core.config import settings
from app.services.log_parser import parse_log_content
from app.services.threat_detector import detect_batch
from app.services.geoip_service import lookup_ip

router = APIRouter()

# 内存存储（后续接入数据库）
_sessions: dict[str, dict] = {}


@router.post("/upload")
async def upload_logs(files: list[UploadFile] = File(...)):
    """上传日志文件"""
    results = []
    for file in files:
        session_id = str(uuid.uuid4())
        save_path = settings.upload_path / f"{session_id}_{file.filename}"

        content = await file.read()
        save_path.parent.mkdir(parents=True, exist_ok=True)
        save_path.write_bytes(content)

        results.append({
            "session_id": session_id,
            "filename": file.filename,
            "size": len(content),
            "saved_path": str(save_path),
        })
        logger.info(f"文件已保存: {file.filename} ({len(content)} bytes)")

    return {"message": f"上传 {len(files)} 个文件", "sessions": results}


@router.post("/parse")
async def parse_logs(session_id: str, filename: str = ""):
    """解析已上传的日志文件"""
    save_path = None
    for f in settings.upload_path.iterdir():
        if f.name.startswith(session_id):
            save_path = f
            break

    if not save_path or not save_path.exists():
        raise HTTPException(404, "文件未找到")

    content = save_path.read_text(encoding="utf-8", errors="ignore")
    return await _do_parse(session_id, save_path.name, content)


@router.post("/paste")
async def paste_logs(content: str = Form(...), filename: str = Form(default="pasted.log")):
    """粘贴日志内容解析"""
    session_id = str(uuid.uuid4())
    return await _do_parse(session_id, filename, content)


@router.get("/stats")
async def get_stats():
    """获取所有解析会话统计"""
    return {"sessions": list(_sessions.values())}


@router.get("/entries")
async def get_entries(
    session_id: str,
    page: int = 1,
    page_size: int = 50,
    threat_only: bool = False,
    level: Optional[str] = None,
):
    """分页查询日志条目"""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(404, "会话未找到")

    entries = session.get("entries", [])
    if threat_only:
        entries = [e for e in entries if e.get("threat_level")]
    if level:
        entries = [e for e in entries if e.get("threat_level") == level]

    total = len(entries)
    start = (page - 1) * page_size
    page_entries = entries[start:start + page_size]

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "entries": page_entries,
    }


@router.delete("/{session_id}")
async def delete_session(session_id: str):
    """删除解析会话"""
    if session_id in _sessions:
        del _sessions[session_id]
        return {"message": "已删除"}
    raise HTTPException(404, "会话未找到")


async def _do_parse(session_id: str, filename: str, content: str) -> dict:
    """执行解析+检测"""
    result = await parse_log_content(content)

    # 批量威胁检测
    batch_results = detect_batch(result.entries)

    # 构建 entries 数据（序列化为 dict）
    entries_data = []
    for entry, threats in batch_results:
        e = {
            "ip": entry.ip,
            "method": entry.method,
            "path": entry.path,
            "status_code": entry.status_code,
            "user_agent": entry.user_agent,
            "timestamp": entry.timestamp.isoformat() if entry.timestamp else None,
            "threat_level": entry.threat_level,
            "threat_type": entry.threat_type,
            "threat_detail": entry.threat_detail,
        }
        if threats:
            e["threats"] = [
                {"rule_id": t.rule_id, "name": t.rule_name, "level": t.level,
                 "category": t.category, "pattern": t.pattern, "description": t.description}
                for t in threats
            ]
        entries_data.append(e)

    threat_count = sum(1 for e in entries_data if e.get("threat_level"))

    session_data = {
        "session_id": session_id,
        "filename": filename,
        "total_lines": result.total_lines,
        "parsed_lines": result.parsed_lines,
        "failed_lines": result.failed_lines,
        "threat_count": threat_count,
        "parse_time_ms": result.parse_time_ms,
        "log_format": result.format_name,
        "entries": entries_data,
    }
    _sessions[session_id] = session_data

    return session_data
