"""路径穿越检测器 — 10+ 规则"""
import re
from app.detectors.base import BaseDetector, ThreatMatch
from app.parsers.base import LogEntry

RULES = [
    ("PATH-001", "目录遍历 ../", "medium", r"\.\./", "目录遍历 ../"),
    ("PATH-002", "/etc/passwd", "high", r"/etc/passwd", "/etc/passwd 敏感文件"),
    ("PATH-003", "/proc/self", "high", r"/proc/self", "/proc/self 进程信息"),
    ("PATH-004", "Windows 目录穿越 ..\\", "medium", r"\.\.\\\\", "Windows 目录穿越"),
    ("PATH-005", "/etc/shadow", "critical", r"/etc/shadow", "/etc/shadow 密码文件"),
    ("PATH-006", "Web 目录穿越", "high", r"\.\./(?:WEB-INF|META-INF|web\.xml)", "Java Web 目录穿越"),
    ("PATH-007", "Git 文件泄露", "medium", r"/\.git/(?:config|HEAD|objects|refs)", "Git 源码泄露"),
    ("PATH-008", "SVN 文件泄露", "medium", r"/\.svn/(?:entries|wc\.db)", "SVN 源码泄露"),
    ("PATH-009", "备份文件探测", "low", r"\.(?:bak|old|orig|backup|swp|zip|tar\.gz|sql|log)\s*$", "备份文件探测"),
    ("PATH-010", ".env 文件泄露", "high", r"/\.env\b", ".env 环境变量泄露"),
    ("PATH-011", "Docker socket", "critical", r"/var/run/docker\.sock", "Docker Socket 暴露"),
    ("PATH-012", "Kubeconfig 泄露", "critical", r"kubeconfig|\.kube/config", "Kubernetes 配置泄露"),
]


class PathTraversalDetector(BaseDetector):
    @property
    def category(self) -> str:
        return "path_traversal"

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
