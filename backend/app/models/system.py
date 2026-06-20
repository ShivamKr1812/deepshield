import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class SystemMetric(Base):
    __tablename__ = "system_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cpu_usage = Column(Float, nullable=False)
    memory_usage = Column(Float, nullable=False)
    active_users_count = Column(Integer, default=0)
    total_analyses_count = Column(Integer, default=0)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
