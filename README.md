# DeepShield AI

DeepShield AI is a production-grade Deepfake Detection Platform developed to identify manipulated and AI-generated images and videos using advanced Deep Learning and Computer Vision techniques. The system analyzes facial features, visual artifacts, and media inconsistencies to determine content authenticity and generate detailed forensic reports.

## Overview

The rapid advancement of generative AI technologies has increased the prevalence of synthetic and manipulated media, creating significant challenges in digital trust, cybersecurity, and information integrity. DeepShield AI addresses these challenges by providing an intelligent platform capable of detecting deepfakes and verifying the authenticity of digital content.

The platform supports both image and video analysis through automated face extraction, media preprocessing, deep learning-based classification, and authenticity scoring. It is designed with a scalable architecture suitable for real-world deployment and large-scale media verification workflows.

## Key Features

* Deepfake Image Detection
* Deepfake Video Detection
* AI-Powered Authenticity Verification
* Confidence Score and Fake Probability Analysis
* Face Detection and Feature Extraction
* Detection History Management
* User Authentication and Authorization
* Administrative Analytics Dashboard
* Automated Report Generation
* Background Processing for Large Media Files
* Scalable Containerized Deployment

## Technology Stack

### Frontend

* React.js (Vite)
* JavaScript
* Vanilla CSS
* Axios
* Chart.js

### Backend

* FastAPI
* SQLAlchemy
* JWT Authentication
* Celery
* Redis

### Artificial Intelligence

* PyTorch
* OpenCV
* EfficientNet / XceptionNet
* RetinaFace

### Database

* PostgreSQL

### DevOps and Deployment

* Docker
* Docker Compose
* Nginx

## System Architecture

```text
Client Application
        │
        ▼
React Frontend
        │
        ▼
FastAPI Backend
        │
 ┌──────┼──────┐
 │      │      │
 ▼      ▼      ▼
PostgreSQL Redis Celery
                │
                ▼
      Deep Learning Engine
                │
                ▼
       Deepfake Detection
```

## Workflow

1. A user uploads an image or video for analysis.
2. The system extracts and preprocesses facial regions.
3. Deep learning models analyze visual and temporal inconsistencies.
4. Detection results are generated with confidence metrics.
5. A detailed authenticity report is produced.
6. Analysis records are securely stored for future reference.

## Project Structure

```text
deepdetection/
├── backend/
├── frontend/
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Objectives

DeepShield AI is designed to support media verification, cybersecurity investigations, digital forensics, and misinformation prevention. The project demonstrates the practical application of Artificial Intelligence, Machine Learning, Computer Vision, and distributed system design in addressing modern challenges related to synthetic media.

## Future Enhancements

* Explainable AI using Grad-CAM visualizations
* Real-time webcam deepfake detection
* Cloud-based media storage
* Multi-language support
* Third-party API integration
* Model versioning and retraining pipeline
* Enterprise monitoring and observability

## License

This project is licensed under the MIT License.

## Author

Shivam Kumar

Bachelor of Technology in Artificial Intelligence and Machine Learning

---

# DeepShield AI - Deployment Guide

This repository contains the codebase for **DeepShield AI**, structured as a React + Vite frontend and a FastAPI backend with PyTorch/Celery.

Below is a detailed guide on how to deploy this project.

## Architecture & Deployment Strategy

DeepShield AI is split into two main components:
1. **Frontend (`/frontend`)**: A React + Vite single-page application (SPA). This is lightweight and can be deployed directly to **Vercel** with automatic builds and client-side routing.
2. **Backend (`/backend`)**: A FastAPI Python service that runs AI model predictions (using PyTorch and OpenCV) and handles background tasks via Celery.
   - **Important**: The backend is **NOT** suitable for serverless platforms like Vercel because of large package sizes (PyTorch/OpenCV), stateful database storage (PostgreSQL/SQLite), and long-running Celery worker daemons.
   - The backend should be deployed to container-based platforms (Render, Railway, Fly.io) or a VPS/dedicated server using the provided **Docker Compose** configurations.

---

## 1. Deploying Frontend to Vercel

The frontend is fully configured for Vercel deployment, including support for clean URLs and SPA client-side routing rewrites (`vercel.json`).

### Step-by-Step Vercel Deployment:

1. **Import the repository**:
   Log in to Vercel and import your DeepShield AI repository.
2. **Configure Settings**:
   - **Framework Preset**: Select `Vite` (Vercel should auto-detect this).
   - **Root Directory**: Set this to `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Set Environment Variables**:
   In the "Environment Variables" section, add:
   - `VITE_API_URL`: The URL of your deployed FastAPI backend (e.g., `https://api.yourdomain.com/api/v1`).
4. **Deploy**:
   Click **Deploy**. Vercel will build the frontend and serve it at a public URL.

---

## 2. Deploying Backend

The backend can be run in production in several ways:

### Option A: Using Docker Compose (Recommended)
If you are deploying to a Virtual Private Server (VPS) or cloud VM (AWS EC2, DigitalOcean Droplet, Linode, etc.):
1. Install Docker and Docker Compose on your server.
2. Clone the repository to the server.
3. Run the services in the background:
   ```bash
   docker compose up -d --build
   ```
4. Configure a reverse proxy (like Nginx, Caddy, or Traefik) to route traffic to the backend on port `8000`.

### Option B: Deploying to Managed Platforms (Render / Railway)
You can deploy the components individually to Render or Railway:
1. **Database**: Spin up a managed PostgreSQL database.
2. **Redis**: Spin up a managed Redis instance.
3. **Web Service (FastAPI Backend)**:
   - Source: `/backend` folder.
   - Build command/Dockerfile: Use `/backend/Dockerfile`.
   - Port: `8000`.
   - Env variables: Set `POSTGRES_SERVER`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (matching your PostgreSQL database), `REDIS_HOST`, `REDIS_PORT` (matching your Redis service), and a production `SECRET_KEY`.
4. **Worker Service (Celery Worker)**:
   - Source: `/backend` folder.
   - Deploy as a **Background Worker** (no public HTTP port).
   - Custom command: `celery -A app.core.cel.celery_app worker --loglevel=info`
   - Env variables: Same as the backend service.

---

## Local Development

If you want to run the entire stack locally for testing:
```bash
docker compose up --build
```
The frontend will be available at `http://localhost:5173` and the backend api docs at `http://localhost:8000/docs`.
