"""XSS 检测器 — 20+ 规则"""
import re
from app.detectors.base import BaseDetector, ThreatMatch
from app.parsers.base import LogEntry

RULES = [
    ("XSS-001", "Script 标签", "critical", r"<\s*script", "Script 标签注入"),
    ("XSS-002", "javascript: 协议", "high", r"javascript\s*:", "JavaScript 伪协议"),
    ("XSS-003", "onerror 事件", "high", r"onerror\s*=", "onerror 事件处理器"),
    ("XSS-004", "onload 事件", "high", r"onload\s*=", "onload 事件处理器"),
    ("XSS-005", "alert() 调用", "medium", r"alert\s*\(", "alert 弹窗测试"),
    ("XSS-006", "document.cookie", "medium", r"document\.cookie", "Cookie 窃取"),
    ("XSS-007", "eval() 调用", "high", r"eval\s*\(", "eval 动态执行"),
    ("XSS-008", "expression() CSS", "high", r"expression\s*\(", "CSS expression 注入"),
    ("XSS-009", "URL编码 <", "medium", r"\%3[cC]", "URL编码的 <"),
    ("XSS-010", "URL编码 >", "medium", r"\%3[eE]", "URL编码的 >"),
    ("XSS-011", "URL编码 引号", "medium", r"\%22|\%27", "URL编码的引号"),
    ("XSS-012", "img onerror", "critical", r"<\s*img[^>]+onerror", "img 标签事件注入"),
    ("XSS-013", "svg onload", "critical", r"<\s*svg[^>]+onload", "svg 标签事件注入"),
    ("XSS-014", "body onload", "high", r"<\s*body[^>]+onload", "body 标签事件注入"),
    ("XSS-015", "iframe src", "high", r"<\s*iframe", "iframe 嵌入注入"),
    ("XSS-016", "fromCharCode", "medium", r"fromCharCode\s*\(", "fromCharCode 编码绕过"),
    ("XSS-017", "atob/btoa 编码", "medium", r"(?:atob|btoa)\s*\(", "Base64编码绕过"),
    ("XSS-018", "innerHTML", "medium", r"innerHTML\s*=", "DOM innerHTML 注入"),
    ("XSS-019", "document.write", "high", r"document\.write", "document.write 注入"),
    ("XSS-020", "window.location", "medium", r"window\.(?:location|open)\s*\(", "window 操作"),
    ("XSS-021", "onclick 事件", "medium", r"onclick\s*=", "onclick 事件处理器"),
    ("XSS-022", "onmouseover 事件", "medium", r"onmouseover\s*=", "onmouseover 事件"),
    ("XSS-023", "onfocus 事件", "medium", r"onfocus\s*=", "onfocus 事件处理器"),
    ("XSS-024", "XMLHttpRequest", "low", r"XMLHttpRequest", "XHR 请求（可能是XSS利用）"),
]


class XSSDetector(BaseDetector):
    @property
    def category(self) -> str:
        return "xss"

    def detect(self, log_entry: LogEntry) -> list[ThreatMatch]:
        results = []
        text = f"{log_entry.path} {log_entry.raw_line}"
        for rule_id, name, level, pattern, desc in RULES:
            matched = self._match(text, pattern)
            if matched:
                results.append(ThreatMatch(
                    rule_id=rule_id, rule_name=name, category=self.category,
                    level=level, pattern=matched, description=desc,
                ))
        return results
