"""SQL 注入检测器 — 30+ 规则"""
import re
from app.detectors.base import BaseDetector, ThreatMatch
from app.parsers.base import LogEntry

RULES = [
    # critical
    ("SQLI-001", "OR 1=1 注入", "critical", r"(?:'|\%27)\s*(?:OR|AND)\s+1\s*=\s*1", "经典 OR 1=1 注入绕过"),
    ("SQLI-002", "UNION SELECT 注入", "critical", r"UNION\s+(?:ALL\s+)?SELECT", "UNION 注入攻击"),
    ("SQLI-003", "information_schema 探测", "critical", r"information_schema", "数据库元数据探测"),
    ("SQLI-004", "extractvalue 注入", "high", r"extractvalue\s*\(", "MySQL XML 函数注入"),
    ("SQLI-005", "updatexml 注入", "high", r"updatexml\s*\(", "MySQL XML 函数注入"),
    ("SQLI-006", "sleep 注入", "medium", r"(?:sleep\s*\(|benchmark\s*\()", "时间盲注"),
    ("SQLI-007", "WAITFOR DELAY 注入", "high", r"WAITFOR\s+DELAY", "MSSQL 时间盲注"),
    ("SQLI-008", "URL编码单引号", "medium", r"\%27", "URL编码的单引号"),
    ("SQLI-009", "双写绕过", "high", r"SELESELECTCT|UNIUNIONON|INSINSERTERT", "双写关键字绕过"),
    ("SQLI-010", "hex编码注入", "high", r"0x[0-9a-fA-F]{6,}", "十六进制编码注入"),
    ("SQLI-011", "LOAD_FILE 读取", "critical", r"LOAD_FILE\s*\(", "MySQL 文件读取"),
    ("SQLI-012", "INTO OUTFILE", "critical", r"INTO\s+(?:OUT|DUMP)FILE", "MySQL 文件写入"),
    ("SQLI-013", "DROP TABLE", "critical", r"(?:DROP|DELETE|TRUNCATE)\s+(?:TABLE|DATABASE)", "破坏性 SQL"),
    ("SQLI-014", "ORDER BY 注入", "medium", r"ORDER\s+BY\s+\d+", "ORDER BY 列数探测"),
    ("SQLI-015", "GROUP BY 注入", "medium", r"GROUP\s+BY\s+\d+", "GROUP BY 注入探测"),
    ("SQLI-016", "HAVING 注入", "medium", r"HAVING\s+\d+", "HAVING 注入探测"),
    ("SQLI-017", "注释符+SQL", "medium", r"--\s+(?:SELECT|INSERT|UPDATE|DELETE|DROP|UNION)", "注释符后接SQL"),
    ("SQLI-018", "#注释+SQL", "medium", r"#\s*(?:SELECT|INSERT|UPDATE|DELETE)", "#注释符后接SQL"),
    ("SQLI-019", "堆叠注入", "high", r";\s*(?:SELECT|INSERT|UPDATE|DELETE|DROP|EXEC)", "堆叠查询注入"),
    ("SQLI-020", "EXEC/EXECUTE", "critical", r"(?:EXEC|EXECUTE)\s*\(", "MSSQL 存储过程执行"),
    ("SQLI-021", "xp_cmdshell", "critical", r"xp_cmdshell", "MSSQL 命令执行"),
    ("SQLI-022", "CONCAT 注入", "medium", r"CONCAT\s*\(\s*0x", "MySQL CONCAT 字符串拼接注入"),
    ("SQLI-023", "IF 注入", "medium", r"IF\s*\(\d+\s*=", "MySQL IF 条件注入"),
    ("SQLI-024", "CASE WHEN 注入", "medium", r"CASE\s+WHEN\s+\d+\s*=", "MySQL CASE 条件注入"),
    ("SQLI-025", "宽字节注入", "high", r"\%bf\%27|\%df\%27", "GBK宽字节注入"),
    ("SQLI-026", "LIKE 通配符注入", "low", r"LIKE\s+['\"]?\%", "LIKE通配符枚举"),
    ("SQLI-027", "char()编码注入", "medium", r"char\s*\(\s*\d+", "char()函数编码绕过"),
    ("SQLI-028", "CONVERT 注入", "medium", r"CONVERT\s*\(", "MSSQL CONVERT 函数注入"),
    ("SQLI-029", "CAST 注入", "medium", r"CAST\s*\(", "CAST 类型转换注入"),
    ("SQLI-030", "COALESCE 注入", "low", r"COALESCE\s*\(", "COALESCE 函数注入"),
    ("SQLI-031", "NULL 注入", "low", r"'\s*OR\s+NULL\s*=\s*NULL", "NULL 值注入"),
    ("SQLI-032", "闭合引号", "medium", r"'\s*(?:OR|AND)\s+'", "引号闭合注入"),
]


class SQLInjectionDetector(BaseDetector):
    @property
    def category(self) -> str:
        return "sql_injection"

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
