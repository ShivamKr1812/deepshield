from datetime import datetime, timezone
import logging
from app.core.cel import celery_app
from app.core.database import SessionLocal
from app.models.analysis import Analysis
from app.services.ai_detector import detector

logger = logging.getLogger("tasks")

@celery_app.task(name="tasks.process_media_detection")
def process_media_detection(analysis_id: str):
    """
    Background worker task to load an uploaded media file, 
    run PyTorch deepfake model inference, and record scores in DB.
    """
    db = SessionLocal()
    try:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            logger.error(f"Analysis job {analysis_id} not found in database.")
            return False

        # Transition status to processing
        analysis.status = "processing"
        db.commit()
        
        logger.info(f"Starting analysis for file: {analysis.file_name} ({analysis.media_type})")
        
        # Run inference
        if analysis.media_type == "video":
            result = detector.analyze_video(analysis.file_path)
        else:
            result = detector.analyze_image(analysis.file_path)
            
        # Update database fields
        analysis.fake_probability = result["fake_probability"]
        analysis.confidence_score = result["confidence_score"]
        analysis.report = result["report_details"]
        analysis.model_version = result.get("model_version")
        analysis.confidence_metrics = result.get("confidence_metrics")
        analysis.status = "completed"
        analysis.completed_at = datetime.now(timezone.utc)
        
        db.commit()
        logger.info(f"Analysis job {analysis_id} completed. Fake Prob: {analysis.fake_probability}%")
        return True

    except Exception as e:
        logger.exception(f"Error executing analysis job {analysis_id}")
        # Try to rollback and flag failure
        try:
            db.rollback()
            analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
            if analysis:
                analysis.status = "failed"
                analysis.report = {"error": str(e)}
                analysis.completed_at = datetime.now(timezone.utc)
                db.commit()
        except Exception:
            pass
        return False
    finally:
        db.close()
