#!/bin/bash

# Start Celery worker in the background (limiting memory usage with solo pool for Render Free Tier)
celery -A app.core.cel.celery_app worker --loglevel=info -P solo &

# Start Uvicorn FastAPI server in the foreground
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
