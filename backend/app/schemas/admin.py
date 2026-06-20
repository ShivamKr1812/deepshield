from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class SystemHealth(BaseModel):
    cpu_usage: float
    memory_usage: float
    active_users_count: int
    total_analyses_count: int
    worker_status: str
    timestamp: datetime

class AdminUserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AdminLogResponse(BaseModel):
    id: str
    user_email: Optional[str]
    action: str
    ip_address: Optional[str]
    details: Optional[Any]
    created_at: datetime
