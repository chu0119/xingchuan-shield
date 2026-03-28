"""威胁检测服务 — 统一入口"""
from loguru import logger
from app.parsers.base import LogEntry
from app.detectors.base import ThreatMatch
from app.detectors.sql_injection import SQLInjectionDetector
from app.detectors.xss import XSSDetector
from app.detectors.rce import RCEDetector
from app.detectors.webshell import WebShellDetector
from app.detectors.scanner import ScannerDetector
from app.detectors.vuln_exploit import VulnExploitDetector
from app.detectors.path_traversal import PathTraversalDetector

DETECTORS = [
    SQLInjectionDetector(),
    XSSDetector(),
    RCEDetector(),
    WebShellDetector(),
    ScannerDetector(),
    VulnExploitDetector(),
    PathTraversalDetector(),
]


def detect_threats(entry: LogEntry) -> list[ThreatMatch]:
    """对单条日志执行所有检测器"""
    results = []
    for detector in DETECTORS:
        try:
            matches = detector.detect(entry)
            results.extend(matches)
        except Exception as e:
            logger.warning(f"检测器 {detector.category} 异常: {e}")

    # 设置日志条目的威胁信息（取最高级别）
    if results:
        level_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        worst = min(results, key=lambda m: level_order.get(m.level, 99))
        entry.threat_type = worst.category
        entry.threat_level = worst.level
        entry.threat_detail = worst.description

    return results


def detect_batch(entries: list[LogEntry]) -> list[tuple[LogEntry, list[ThreatMatch]]]:
    """批量检测"""
    return [(entry, detect_threats(entry)) for entry in entries]


def get_detector_summary() -> list[dict]:
    """获取所有检测器信息"""
    return [{"category": d.category, "class": d.__class__.__name__} for d in DETECTORS]
