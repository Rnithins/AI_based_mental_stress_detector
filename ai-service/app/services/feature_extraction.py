from __future__ import annotations

import numpy as np
import librosa


def _compress_series(values: np.ndarray, target: int = 40) -> list[float]:
    if values.size == 0:
        return []

    if values.size <= target:
        return [round(float(item), 4) for item in values]

    idx = np.linspace(0, values.size - 1, target).astype(int)
    return [round(float(values[i]), 4) for i in idx]


def _summary(values: np.ndarray) -> dict:
    values = np.asarray(values, dtype=np.float32)
    return {
        "mean": round(float(np.mean(values)), 4),
        "std": round(float(np.std(values)), 4),
        "min": round(float(np.min(values)), 4),
        "max": round(float(np.max(values)), 4),
        "series": _compress_series(values),
    }


def extract_features(signal: np.ndarray, sample_rate: int) -> tuple[dict, dict]:
    mfcc = librosa.feature.mfcc(y=signal, sr=sample_rate, n_mfcc=13)
    mfcc_mean = np.mean(mfcc, axis=1)

    pitch = librosa.yin(signal, fmin=70, fmax=450, sr=sample_rate)
    pitch = pitch[np.isfinite(pitch)]
    if pitch.size == 0:
        pitch = np.array([0.0], dtype=np.float32)

    energy = librosa.feature.rms(y=signal).flatten()
    zcr = librosa.feature.zero_crossing_rate(signal, frame_length=2048, hop_length=512).flatten()

    features = {
        "mfcc": [round(float(value), 4) for value in mfcc_mean],
        "pitch": _summary(pitch),
        "energy": _summary(energy),
        "zcr": _summary(zcr),
    }

    model_vector = {
        "pitch_mean": float(np.mean(pitch)),
        "pitch_std": float(np.std(pitch)),
        "energy_mean": float(np.mean(energy)),
        "energy_std": float(np.std(energy)),
        "zcr_mean": float(np.mean(zcr)),
    }

    return features, model_vector