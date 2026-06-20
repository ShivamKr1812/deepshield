import psutil
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.analysis import Analysis
from app.models.log import Log
from app.models.system import SystemMetric
from app.schemas.admin import SystemHealth, AdminUserResponse, AdminLogResponse
from app.api.deps import get_current_admin
from app.core.cel import celery_app

router = APIRouter()

@router.get("/metrics", response_model=SystemHealth)
def get_system_metrics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Fetch administrative health diagnostics including CPU, Memory, 
    and task processing status.
    """
    cpu_usage = psutil.cpu_percent(interval=None)
    memory_usage = psutil.virtual_memory().percent
    
    # Active users count (active in database)
    active_users = db.query(User).filter(User.is_active == True).count()
    total_analyses = db.query(Analysis).count()
    
    # Check Celery Worker status
    worker_status = "Offline"
    try:
        inspect = celery_app.control.inspect(timeout=0.5)
        stats = inspect.stats()
        if stats:
            worker_status = "Active"
    except Exception:
        worker_status = "Offline (Local fallback active)"

    # Log metrics to DB periodically
    metric = SystemMetric(
        cpu_usage=cpu_usage,
        memory_usage=memory_usage,
        active_users_count=active_users,
        total_analyses_count=total_analyses
    )
    db.add(metric)
    db.commit()

    return SystemHealth(
        cpu_usage=cpu_usage,
        memory_usage=memory_usage,
        active_users_count=active_users,
        total_analyses_count=total_analyses,
        worker_status=worker_status,
        timestamp=datetime.now(timezone.utc)
    )

@router.get("/users", response_model=List[AdminUserResponse])
def get_users_list(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Get lists of users in the system.
    """
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users

@router.put("/users/{user_id}/toggle", response_model=AdminUserResponse)
def toggle_user_active_state(
    user_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Toggle user activation state (suspend/activate).
    """
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot deactivate themselves."
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    # Log administrative action
    client_host = request.client.host if request.client else "unknown"
    audit_log = Log(
        user_id=current_admin.id,
        action="toggle_user_status",
        ip_address=client_host,
        details={
            "target_user_id": user.id,
            "target_email": user.email,
            "is_active_now": user.is_active
        }
    )
    db.add(audit_log)
    db.commit()

    return user

@router.get("/logs", response_model=List[AdminLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Fetch recent audit action logs."""
    rows = (
        db.query(
            Log.id,
            User.email.label("user_email"),
            Log.action,
            Log.ip_address,
            Log.details,
            Log.created_at,
        )
        .outerjoin(User, Log.user_id == User.id)
        .order_by(Log.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": r.id,
            "user_email": r.user_email,
            "action": r.action,
            "ip_address": r.ip_address,
            "details": r.details,
            "created_at": r.created_at,
        }
        for r in rows
    ]

