import os
import uuid
import shutil
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.analysis import Analysis
from app.models.log import Log
from app.schemas.analysis import AnalysisResponse
from app.api.deps import get_current_active_user

router = APIRouter()

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


def _run_analysis_locally(analysis_id: str):
    """Plain callable (no Celery) used as a BackgroundTasks fallback."""
    from app.core.database import SessionLocal
    from app.services.ai_detector import detector

    db = SessionLocal()
    try:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            return
        analysis.status = "processing"
        db.commit()

        if analysis.media_type == "video":
            result = detector.analyze_video(analysis.file_path)
        else:
            result = detector.analyze_image(analysis.file_path)

        analysis.fake_probability = result["fake_probability"]
        analysis.confidence_score = result["confidence_score"]
        analysis.report = result["report_details"]
        analysis.model_version = result.get("model_version")
        analysis.confidence_metrics = result.get("confidence_metrics")
        analysis.status = "completed"
        analysis.completed_at = datetime.now(timezone.utc)
        db.commit()
    except Exception as exc:
        db.rollback()
        try:
            analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
            if analysis:
                analysis.status = "failed"
                analysis.report = {"error": str(exc)}
                analysis.completed_at = datetime.now(timezone.utc)
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


@router.post("/upload", response_model=AnalysisResponse)
def upload_media(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Upload an image or video for deepfake analysis."""
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext in IMAGE_EXTENSIONS:
        media_type = "image"
    elif file_ext in VIDEO_EXTENSIONS:
        media_type = "video"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format. Accepted: {sorted(IMAGE_EXTENSIONS | VIDEO_EXTENSIONS)}",
        )

    unique_filename = f"{uuid.uuid4()}{file_ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    try:
        with open(dest_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {exc}",
        )

    analysis = Analysis(
        user_id=current_user.id,
        media_type=media_type,
        file_name=file.filename,
        file_path=dest_path,
        status="pending",
        created_at=datetime.now(timezone.utc),
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    client_host = request.client.host if request.client else "unknown"
    db.add(Log(
        user_id=current_user.id,
        action="upload_media",
        ip_address=client_host,
        details={"analysis_id": analysis.id, "filename": file.filename, "media_type": media_type},
    ))
    db.commit()

    # Try Celery; fall back to FastAPI BackgroundTasks
    celery_queued = False
    try:
        from app.tasks.detection_tasks import process_media_detection
        process_media_detection.delay(analysis.id)
        celery_queued = True
    except Exception:
        pass

    if not celery_queued:
        background_tasks.add_task(_run_analysis_locally, analysis.id)

    return analysis


@router.get("/history", response_model=List[AnalysisResponse])
def get_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Detection history for the logged-in user."""
    return (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )


@router.get("/status/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_status(
    analysis_id: str,
    db: Session = Depends(get_db),
):
    """Poll the status and scores of a specific analysis job."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")
    return analysis

