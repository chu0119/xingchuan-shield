"""命令执行检测器 — 20+ 规则"""
import re
from app.detectors.base import BaseDetector, ThreatMatch
from app.parsers.base import LogEntry

RULES = [
    ("RCE-001", "分号+命令", "critical", r";\s*(?:ls|cat|id|whoami|uname|pwd|ifconfig|ip|netstat|ps|wget|curl)", "分号后接系统命令"),
    ("RCE-002", "管道命令", "critical", r"\|\s*(?:cat|id|whoami|ls|bash|sh|nc|ncat|wget|curl)\b", "管道命令注入"),
    ("RCE-003", "反引号命令", "critical", r"`[^`]+`", "反引号命令执行"),
    ("RCE-004", "$() 命令替换", "high", r"\$\([^)]+\)", "$() 命令替换"),
    ("RCE-005", "cmd.exe", "critical", r"cmd\.exe", "Windows cmd 执行"),
    ("RCE-006", "powershell", "high", r"(?:powershell|pwsh)\b", "PowerShell 执行"),
    ("RCE-007", "/bin/sh", "critical", r"/bin/(?:sh|bash|dash|zsh|csh)", "Shell 直接调用"),
    ("RCE-008", "wget 下载", "high", r"\bwget\s+\S+", "wget 远程下载"),
    ("RCE-009", "curl 下载", "high", r"\bcurl\s+(?:-[oOsS]\s+)?https?://", "curl 远程请求"),
    ("RCE-010", "bash -i 反弹", "critical", r"bash\s+-i\s*>", "Bash 反弹 Shell"),
    ("RCE-011", "nc 反弹", "critical", r"\bnc\s+(?:-[eElnv]+\s+)?\d+\.\d+", "Netcat 反弹 Shell"),
    ("RCE-012", "python 命令执行", "high", r"(?:python|python3)\s+-c\s+['\"]", "Python 命令执行"),
    ("RCE-013", "perl 命令执行", "high", r"\bperl\s+-e\s+['\"]", "Perl 命令执行"),
    ("RCE-014", "ruby 命令执行", "high", r"\bruby\s+-e\s+['\"]", "Ruby 命令执行"),
    ("RCE-015", "php 命令执行", "high", r"\bphp\s+-r\s+['\"]", "PHP 命令执行"),
    ("RCE-016", "/etc/passwd", "high", r"/etc/(?:passwd|shadow|hosts)", "系统敏感文件读取"),
    ("RCE-017", "chmod/chown", "high", r"\b(?:chmod|chown|chgrp)\s+\d+", "文件权限修改"),
    ("RCE-018", "rm -rf", "critical", r"\brm\s+(?:-[rRf]+\s+)?/", "删除命令执行"),
    ("RCE-019", "mkfifo", "critical", r"\bmkfifo\b", "命名管道创建（反弹Shell）"),
    ("RCE-020", "socat", "critical", r"\bsocat\b", "socat 端口转发/反弹Shell"),
    ("RCE-021", "xterm 反弹", "critical", r"xterm\s+-display", "X11 反弹 Shell"),
]


class RCEDetector(BaseDetector):
    @property
    def category(self) -> str:
        return "rce"

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
