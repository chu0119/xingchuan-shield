"""扫描器指纹检测器 — 15+ 规则"""
import re
from app.detectors.base import BaseDetector, ThreatMatch
from app.parsers.base import LogEntry

RULES = [
    ("SCAN-001", "Nmap 扫描", "high", r"\bNmap\b", "Nmap 网络扫描器"),
    ("SCAN-002", "SQLMap 扫描", "critical", r"\bsqlmap\b", "SQLMap 自动化SQL注入工具"),
    ("SCAN-003", "DirBuster 扫描", "high", r"\bDirBuster\b", "DirBuster 目录扫描工具"),
    ("SCAN-004", "Nikto 扫描", "high", r"\bNikto\b", "Nikto Web漏洞扫描器"),
    ("SCAN-005", "Gobuster 扫描", "medium", r"\bgobuster\b", "Gobuster 目录/子域扫描"),
    ("SCAN-006", "AWVS 扫描", "high", r"\bacunetix\b", "Acunetix Web漏洞扫描"),
    ("SCAN-007", "Burp Suite", "medium", r"\bBurp\s*(?:Suite)?\b", "Burp Suite 代理/扫描"),
    ("SCAN-008", "Wfuzz 扫描", "medium", r"\bwfuzz\b", "Wfuzz Web模糊测试"),
    ("SCAN-009", "Masscan 扫描", "high", r"\bmasscan\b", "Masscan 高速端口扫描"),
    ("SCAN-010", "Nuclei 扫描", "medium", r"\bnuclei\b", "Nuclei 模板化漏洞扫描"),
    ("SCAN-011", "WhatWeb 指纹", "medium", r"\bWhatWeb\b", "WhatWeb Web指纹识别"),
    ("SCAN-012", "Wappalyzer", "low", r"\bWappalyzer\b", "Wappalyzer 技术栈检测"),
    ("SCAN-013", "Xray 扫描", "high", r"\bxray\b", "长亭 Xray 漏洞扫描"),
    ("SCAN-014", "Hydra 暴力破解", "high", r"\bHydra\b", "Hydra 密码爆破"),
    ("SCAN-015", "WFuzz 批量", "medium", r"\bFUZZ\b.*(?:wfuzz|dirb)", "Fuzz 关键字"),
    ("SCAN-016", "ffuf 扫描", "medium", r"\bffuf\b", "ffuf Web模糊测试"),
    ("SCAN-017", "httpx 扫描", "medium", r"\bhttpx\b", "httpx HTTP探测"),
    ("SCAN-018", "Subfinder 子域", "medium", r"\bsubfinder\b", "Subfinder 子域名枚举"),
]


class ScannerDetector(BaseDetector):
    @property
    def category(self) -> str:
        return "scanner"

    def detect(self, log_entry: LogEntry) -> list[ThreatMatch]:
        results = []
        text = f"{log_entry.path} {log_entry.raw_line} {log_entry.user_agent}"
        for rule_id, name, level, pattern, desc in RULES:
            matched = self._match(text, pattern)
            if matched:
                results.append(ThreatMatch(
                    rule_id=rule_id, rule_name=name, category=self.category,
                    level=level, pattern=matched, description=desc,
                ))
        return results
