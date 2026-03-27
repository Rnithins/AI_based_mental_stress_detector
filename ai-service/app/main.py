from __future__ import annotations

import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import PredictionResponse
from .services.audio_processing import preprocess_audio
from .services.feature_extraction import extract_features
from .services.model import MockStressModel
from .services.explainability import explain_prediction

app = FastAPI(title="VoiceStress AI Service", version="1.0.0")
model = MockStressModel()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "ai-service",
        "model_mode": os.getenv("MODEL_MODE", "mock"),
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)) -> PredictionResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is required")

    if file.content_type and file.content_type not in {"application/octet-stream"} and not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    suffix = Path(file.filename).suffix or ".wav"
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            temp_path = tmp.name
            tmp.write(await file.read())

        signal, sample_rate = preprocess_audio(temp_path)
        features, vector = extract_features(signal, sample_rate)
        prediction = model.predict(vector)
        explanation, suggestions = explain_prediction(
            prediction["stress_level"], prediction["feature_importance"], features
        )

        return PredictionResponse(
            stress_level=prediction["stress_level"],
            confidence=prediction["confidence"],
            features=features,
            feature_importance=prediction["feature_importance"],
            explanation=explanation,
            suggestions=suggestions,
        )
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err)) from err
    except HTTPException:
        raise
    except Exception as err:  # pragma: no cover - defensive production path
        raise HTTPException(status_code=500, detail=f"Prediction failed: {err}") from err
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
