from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel

class AnalysisBase(BaseModel):
    media_type: str
    file_name: str

class AnalysisCreate(AnalysisBase):
    file_path: str
    user_id: Optional[str] = None
    status: str = "pending"

class AnalysisResponse(AnalysisBase):
    id: str
    user_id: Optional[str]
    fake_probability: Optional[float]
    confidence_score: Optional[float]
    status: str
    report: Optional[Any]
    model_version: Optional[str] = None
    confidence_metrics: Optional[Any] = None
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = {
        "from_attributes": True,
        "protected_namespaces": ()
    }
