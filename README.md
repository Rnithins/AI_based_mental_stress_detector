# VoiceStress AI

Production-ready full-stack AI system for intelligent voice-based stress detection and wellness recommendations.

## Architecture

Frontend (React + Vite + TypeScript + Tailwind) -> Backend (Node.js + Express + JWT + MongoDB) -> AI Service (FastAPI + audio features + mock stress model) -> Backend -> Frontend

## Final Project Structure

```text
root/
  frontend/
  backend/
  ai-service/
  docker-compose.yml
  README.md
```

## Core Features

- Voice stress detection from 10-20 second audio samples
- Explainable AI output (feature importance + textual explanation)
- Adaptive AI quiz with personalized recommendations
- Wellness module with breathing exercise and quote generation
- Stress trend dashboard with historical analytics
- JWT authentication and protected APIs
- MongoDB persistence for users, audio records, predictions, and quiz responses
- Docker-ready multi-service deployment

## Frontend Pages

- `/` Home page
- `/auth` Login/Register
- `/analysis` Voice Analysis page
- `/dashboard` User profile + stress history + trends
- `/results` Stress level + confidence + feature graphs + explainability
- `/quiz` Adaptive AI stress-relief quiz
- `/wellness` Quotes + breathing + stress tips

## Backend API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /audio/upload`
- `POST /predict`
- `GET /history`
- `POST /quiz`
- `GET /quotes`

Compatibility namespace is also available under `/api/*`.

## Database Schemas

### User
- `name`
- `email`
- `password` (hashed)

### AudioRecord
- `user_id`
- `file_url`
- `timestamp`
- `original_name`
- `mime_type`

### PredictionResult
- `user_id`
- `audio_record_id`
- `stress_level`
- `confidence`
- `features` (MFCC, pitch, energy, ZCR)
- `feature_importance`
- `explanation`
- `suggestions`

### QuizResponse
- `user_id`
- `stress_level`
- `answers`
- `suggestions`

## AI Service Details

- Audio preprocessing: noise reduction + normalization
- Feature extraction: MFCC, pitch, energy, ZCR
- Inference: mock production-style stress estimator (calibrated from sample dataset)
- Endpoint: `POST /predict`
- Response: stress level, confidence score, features, explanation, suggestions

## Sample Dataset Handling

Sample data is included at:

- `ai-service/data/sample_voice_features.csv`

You can inspect summary stats with:

```bash
cd ai-service
python scripts/summarize_dataset.py
```

## Local Development Setup

### 1. Start MongoDB

Use local MongoDB or Docker:

```bash
docker run -d --name voicestress-mongo -p 27017:27017 mongo:7
```

### 2. Run AI service

```bash
cd ai-service
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Or from project root:

```bash
npm run setup:ai
npm run dev:ai
```

### 3. Run backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

### 4. Run frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

### One-command local startup

After installing frontend/backend npm deps once, run from root:

```bash
npm run setup:ai
npm run dev
```

This starts AI service (8000), backend (5000), and frontend (5173) together.

## Docker Deployment

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost`
- Backend: `http://localhost:5000`
- AI service: `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017`

## Environment Files

- `frontend/.env.example`
- `backend/.env.example`
- `backend/.env.docker` (Docker Compose)
- `ai-service/.env.example`

Create `.env` files from these templates for non-Docker local runs.

## Production Notes

- Replace JWT secret with strong value
- Restrict CORS origin in backend
- Add TLS termination (Nginx/Cloud LB)
- Add CI checks for lint/test/build
- Replace mock AI estimator with trained CNN+LSTM pipeline
