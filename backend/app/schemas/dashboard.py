from pydantic import BaseModel
from typing import List, Dict, Any

class StatHistoryItem(BaseModel):
    date: str
    real_count: int
    fake_count: int

class DashboardStats(BaseModel):
    total_analyses: int
    fake_media_detected: int
    fake_ratio_percent: float
    recent_uploads: List[Dict[str, Any]]
    detection_history_chart: List[StatHistoryItem]
