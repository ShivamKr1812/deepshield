#!/bin/bash

# Start Celery worker in the background
celery -A app.core.cel.celery_app worker --loglevel=info &

# Start Uvicorn FastAPI server in the foreground
uvicorn app.main:app --host 0.0.0.0 --port 8000
