"""规则管理 API"""
from fastapi import APIRouter, HTTPException
from typing import Optional

router = APIRouter()

# 内存存储
_rules: list[dict] = [
    {"id": 1, "name": "SQL 注入 - OR 1=1", "category": "sql_injection", "level": "critical",
     "pattern": "' OR 1=1--", "description": "经典 SQL 注入", "enabled": True},
    {"id": 2, "name": "XSS - Script 标签", "category": "xss", "level": "critical",
     "pattern": "<script>", "description": "Script 标签注入", "enabled": True},
    {"id": 3, "name": "RCE - 命令执行", "category": "rce", "level": "critical",
     "pattern": "; ls", "description": "分号后接系统命令", "enabled": True},
]

_next_id = 4


@router.get("")
async def list_rules(category: Optional[str] = None, enabled_only: bool = False):
    """规则列表"""
    rules = _rules
    if category:
        rules = [r for r in rules if r["category"] == category]
    if enabled_only:
        rules = [r for r in rules if r["enabled"]]
    return {"rules": rules, "total": len(rules)}


@router.post("")
async def add_rule(name: str, category: str, level: str, pattern: str, description: str = ""):
    """添加规则"""
    global _next_id
    rule = {"id": _next_id, "name": name, "category": category, "level": level,
            "pattern": pattern, "description": description, "enabled": True}
    _next_id += 1
    _rules.append(rule)
    return {"message": "规则已添加", "rule": rule}


@router.put("/{rule_id}")
async def update_rule(rule_id: int, name: Optional[str] = None, pattern: Optional[str] = None,
                      level: Optional[str] = None, enabled: Optional[bool] = None):
    """更新规则"""
    for rule in _rules:
        if rule["id"] == rule_id:
            if name is not None:
                rule["name"] = name
            if pattern is not None:
                rule["pattern"] = pattern
            if level is not None:
                rule["level"] = level
            if enabled is not None:
                rule["enabled"] = enabled
            return {"message": "规则已更新", "rule": rule}
    raise HTTPException(404, "规则未找到")


@router.delete("/{rule_id}")
async def delete_rule(rule_id: int):
    """删除规则"""
    global _rules
    original_len = len(_rules)
    _rules = [r for r in _rules if r["id"] != rule_id]
    if len(_rules) == original_len:
        raise HTTPException(404, "规则未找到")
    return {"message": "规则已删除"}
