"""日志解析服务 — 统一入口"""
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Optional
from loguru import logger

from app.parsers.base import LogEntry
from app.parsers.nginx import NginxParser
from app.parsers.apache import ApacheParser
from app.parsers.iis import IISParser
from app.parsers.json_parser import JSONParser

PARSERS = [NginxParser(), ApacheParser(), IISParser(), JSONParser()]


class ParseResult:
    def __init__(self):
        self.entries: list[LogEntry] = []
        self.total_lines: int = 0
        self.parsed_lines: int = 0
        self.failed_lines: int = 0
        self.format_name: str = "unknown"
        self.parse_time_ms: int = 0


def _detect_format(lines: list[str]) -> Optional[type]:
    """同步检测日志格式"""
    sample = [l for l in lines[:20] if l.strip()]
    if not sample:
        return None
    for parser in PARSERS:
        if parser.detect_format(sample):
            return parser.__class__
    return None


def _parse_lines(parser, lines: list[str]) -> tuple[list[LogEntry], int, int]:
    """同步解析一批行"""
    entries = []
    parsed = 0
    failed = 0
    for line in lines:
        if not line.strip():
            continue
        entry = parser.parse_line(line)
        if entry:
            entries.append(entry)
            parsed += 1
        else:
            failed += 1
    return entries, parsed, failed


async def parse_log_content(content: str) -> ParseResult:
    """解析日志文本内容"""
    result = ParseResult()
    lines = content.splitlines()
    result.total_lines = len([l for l in lines if l.strip()])

    if not lines:
        return result

    start = time.perf_counter()

    # 检测格式
    loop = asyncio.get_event_loop()
    parser_cls = await loop.run_in_executor(None, _detect_format, lines)

    if not parser_cls:
        logger.warning("无法自动检测日志格式，尝试所有解析器")
        result.failed_lines = result.total_lines
        result.parse_time_ms = int((time.perf_counter() - start) * 1000)
        return result

    parser = parser_cls()
    result.format_name = parser.name
    logger.info(f"检测到日志格式: {parser.name}")

    # 并发解析（线程池）
    batch_size = 500
    batches = [lines[i:i+batch_size] for i in range(0, len(lines), batch_size)]

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [loop.run_in_executor(executor, _parse_lines, parser, batch) for batch in batches]
        batch_results = await asyncio.gather(*futures)

    for entries, parsed, failed in batch_results:
        result.entries.extend(entries)
        result.parsed_lines += parsed
        result.failed_lines += failed

    result.parse_time_ms = int((time.perf_counter() - start) * 1000)
    logger.info(f"解析完成: 总{result.total_lines}行, 成功{result.parsed_lines}, 失败{result.failed_lines}, 耗时{result.parse_time_ms}ms")
    return result
