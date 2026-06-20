import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    media_type = Column(String(50), nullable=False)  # 'image' or 'video'
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    fake_probability = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    status = Column(String(50), default="pending")  # 'pending', 'processing', 'completed', 'failed'
    report = Column(JSON, nullable=True)  # details, e.g. frame scores, face crop metrics
    model_version = Column(String(50), nullable=True, default="EfficientNet-B4 v1.0")
    confidence_metrics = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
