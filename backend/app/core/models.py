"""SQLAlchemy 数据模型"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class ParseSession(Base):
    """日志解析会话"""
    __tablename__ = "parse_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    total_lines = Column(Integer, default=0)
    parsed_lines = Column(Integer, default=0)
    failed_lines = Column(Integer, default=0)
    threat_count = Column(Integer, default=0)
    parse_time_ms = Column(Integer, default=0)
    log_format = Column(String, default="unknown")
    file_size = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    entries = relationship("LogEntry", back_populates="session", cascade="all, delete-orphan")
    threats = relationship("ThreatRecord", back_populates="session", cascade="all, delete-orphan")


class LogEntry(Base):
    """日志条目"""
    __tablename__ = "log_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("parse_sessions.id"), nullable=False)
    timestamp = Column(DateTime)
    ip = Column(String, index=True)
    method = Column(String)
    path = Column(String, index=True)
    protocol = Column(String)
    status_code = Column(Integer)
    response_size = Column(Integer)
    user_agent = Column(String)
    referer = Column(String)
    raw_line = Column(Text)
    geo_country = Column(String)
    geo_city = Column(String)
    geo_lat = Column(Float)
    geo_lon = Column(Float)

    session = relationship("ParseSession", back_populates="entries")


class ThreatRecord(Base):
    """威胁记录"""
    __tablename__ = "threat_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("parse_sessions.id"), nullable=False)
    log_entry_id = Column(Integer, ForeignKey("log_entries.id"))
    rule_id = Column(String)
    rule_name = Column(String)
    category = Column(String, index=True)  # sql_injection/xss/rce/...
    level = Column(String, index=True)     # low/medium/high/critical
    pattern = Column(String)
    description = Column(String)
    ip = Column(String, index=True)
    path = Column(String)
    timestamp = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ParseSession", back_populates="threats")


class CustomRule(Base):
    """自定义规则"""
    __tablename__ = "custom_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    level = Column(String, default="medium")
    pattern = Column(String, nullable=False)
    description = Column(String, default="")
    enabled = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
