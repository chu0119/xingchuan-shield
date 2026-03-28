"""WebShell 检测器 — 15+ 规则"""
import re
from app.detectors.base import BaseDetector, ThreatMatch
from app.parsers.base import LogEntry

RULES = [
    ("WS-001", "菜刀特征 z0", "critical", r"\bz0\b", "中国菜刀(Caidao)特征参数"),
    ("WS-002", "eval+POST", "critical", r"eval\s*\(\s*\$_POST", "eval + $_POST 典型一句话木马"),
    ("WS-003", "eval+GET", "critical", r"eval\s*\(\s*\$_GET", "eval + $_GET 一句话木马"),
    ("WS-004", "eval+REQUEST", "critical", r"eval\s*\(\s*\$_REQUEST", "eval + $_REQUEST 一句话木马"),
    ("WS-005", "蚁剑 @eval", "critical", r"@\s*eval\s*\(", "蚁剑(AntSword)特征 @eval"),
    ("WS-006", "base64_decode 执行", "high", r"(?:base64_decode|gzinflate|gzuncompress|str_rot13)\s*\(\s*\$_(?:POST|GET|REQUEST|COOKIE)", "编码解码+参数传递"),
    ("WS-007", "冰蝎 AES", "critical", r"(?:AES|SecretKey|encrypt\s*\(|decrypt\s*\().*(?:POST|secret)", "冰蝎(Behinder)加密通信特征"),
    ("WS-008", "Godzilla pass", "critical", r"pass\s*=\s*['\"]?\w+", "Godzilla(哥斯拉)通信特征"),
    ("WS-009", "java.lang.Runtime", "critical", r"java\.lang\.Runtime", "Java Runtime 命令执行(WebShell)"),
    ("WS-010", "ProcessBuilder", "high", r"ProcessBuilder", "Java ProcessBuilder 执行"),
    ("WS-011", "assert+POST", "high", r"assert\s*\(\s*\$_POST", "PHP assert 一句话木马"),
    ("WS-012", "file_put_contents", "high", r"file_put_contents\s*\(", "文件写入(可能是WebShell植入)"),
    ("WS-013", "fopen+fwrite", "high", r"fopen\s*\(.+fwrite\s*\(", "文件写入组合"),
    ("WS-014", "shell_exec", "critical", r"shell_exec\s*\(", "PHP shell_exec 命令执行"),
    ("WS-015", "system+参数", "critical", r"(?:system|exec|passthru|popen)\s*\(\s*\$_(?:POST|GET|REQUEST)", "PHP 系统命令执行"),
    ("WS-016", "WScript.Shell", "critical", r"WScript\.Shell", "ASP WebShell WScript.Shell"),
    ("WS-017", "Scripting.FileSystemObject", "high", r"Scripting\.FileSystemObject", "ASP 文件操作对象"),
    ("WS-018", "JSPWebShell cmd", "critical", r"Runtime.*getRuntime.*exec", "JSP Runtime 命令执行"),
]


class WebShellDetector(BaseDetector):
    @property
    def category(self) -> str:
        return "webshell"

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
