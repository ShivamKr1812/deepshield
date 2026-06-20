from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from app.core.database import get_db
from app.models.analysis import Analysis
from app.schemas.dashboard import DashboardStats, StatHistoryItem
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_user_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: any = Depends(get_current_active_user)
):
    """
    Get user-specific dashboard analytical data.
    """
    # Total Analyses
    total_analyses = db.query(Analysis).filter(
        Analysis.user_id == current_user.id
    ).count()

    # Fake Media Detected
    fake_media_detected = db.query(Analysis).filter(
        Analysis.user_id == current_user.id,
        Analysis.fake_probability > 50.0,
        Analysis.status == "completed"
    ).count()

    # Calculate Fake Ratio
    fake_ratio_percent = 0.0
    if total_analyses > 0:
        fake_ratio_percent = round((fake_media_detected / total_analyses) * 100, 1)

    # Recent Uploads (limit 5)
    recent = db.query(Analysis).filter(
        Analysis.user_id == current_user.id
    ).order_by(Analysis.created_at.desc()).limit(5).all()

    recent_uploads = []
    for item in recent:
        recent_uploads.append({
            "id": item.id,
            "file_name": item.file_name,
            "media_type": item.media_type,
            "fake_probability": item.fake_probability,
            "status": item.status,
            "created_at": item.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    # Group Analyses by Day for past 7 days to draw chart
    today = datetime.now(timezone.utc).date()
    history_items = []
    
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        date_str = target_date.strftime("%b %d")
        
        # Count Real & Fake on this day
        start_datetime = datetime.combine(target_date, datetime.min.time(), tzinfo=timezone.utc)
        end_datetime = datetime.combine(target_date, datetime.max.time(), tzinfo=timezone.utc)
        
        real_day_count = db.query(Analysis).filter(
            Analysis.user_id == current_user.id,
            Analysis.created_at >= start_datetime,
            Analysis.created_at <= end_datetime,
            Analysis.fake_probability <= 50.0,
            Analysis.status == "completed"
        ).count()
        
        fake_day_count = db.query(Analysis).filter(
            Analysis.user_id == current_user.id,
            Analysis.created_at >= start_datetime,
            Analysis.created_at <= end_datetime,
            Analysis.fake_probability > 50.0,
            Analysis.status == "completed"
        ).count()
        
        history_items.append(
            StatHistoryItem(
                date=date_str,
                real_count=real_day_count,
                fake_count=fake_day_count
            )
        )

    return DashboardStats(
        total_analyses=total_analyses,
        fake_media_detected=fake_media_detected,
        fake_ratio_percent=fake_ratio_percent,
        recent_uploads=recent_uploads,
        detection_history_chart=history_items
    )
