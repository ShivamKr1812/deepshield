#!/bin/bash

# Start Celery worker only if USE_CELERY is set to true
if [ "$USE_CELERY" = "true" ]; then
    echo "Starting Celery worker..."
    celery -A app.core.cel.celery_app worker --loglevel=info -P solo &
else
    echo "Celery worker disabled. Using FastAPI background tasks instead."
fi

# Start Uvicorn FastAPI server in the foreground
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
