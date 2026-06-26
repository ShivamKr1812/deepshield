import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base

# Import db.base so all model classes are registered on Base.metadata
import app.db.base  # noqa: F401

from app.api.v1 import auth, detection, dashboard, profile, admin

# Auto-create tables on startup
try:
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created/verified.")
    
    # Ensure new columns exist on existing databases
    from sqlalchemy import text
    with engine.begin() as conn:
        if engine.name == "sqlite":
            try:
                conn.execute(text("ALTER TABLE analyses ADD COLUMN model_version VARCHAR(50)"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE analyses ADD COLUMN confidence_metrics JSON"))
            except Exception:
                pass
        else:
            try:
                conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS model_version VARCHAR(50)"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS confidence_metrics JSON"))
            except Exception:
                pass
except Exception as e:
    print(f"[WARN] Error initializing DB tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
origins = []
if isinstance(settings.BACKEND_CORS_ORIGINS, str):
    import json
    try:
        if settings.BACKEND_CORS_ORIGINS.strip().startswith("["):
            origins = json.loads(settings.BACKEND_CORS_ORIGINS)
        else:
            origins = [x.strip() for x in settings.BACKEND_CORS_ORIGINS.split(",") if x.strip()]
    except Exception:
        origins = [x.strip() for x in settings.BACKEND_CORS_ORIGINS.split(",") if x.strip()]
else:
    origins = list(settings.BACKEND_CORS_ORIGINS)

allow_origin_regex = None
# If wildcard is requested, use regex to support credentials safely
if "*" in origins:
    origins.remove("*")
    allow_origin_regex = r"https?://.*"
else:
    # Automatically allow Vercel previews and localhost to make developer experience smooth
    allow_origin_regex = r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded media files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# API routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(detection.router, prefix=f"{settings.API_V1_STR}/detection", tags=["Deepfake Detection"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard"])
app.include_router(profile.router, prefix=f"{settings.API_V1_STR}/profile", tags=["User Profile"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin Panel"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "api_documentation": "/docs"
    }
