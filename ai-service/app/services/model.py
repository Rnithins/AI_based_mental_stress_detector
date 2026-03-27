from __future__ import annotations

from pathlib import Path
import numpy as np
import pandas as pd


class MockStressModel:
    def __init__(self) -> None:
        self.weights = {
            "pitch_std": 0.32,
            "energy_std": 0.26,
            "zcr_mean": 0.2,
            "pitch_mean": 0.12,
            "energy_mean": 0.1,
        }
        self.baseline = self._load_baseline()

    @staticmethod
    def _sigmoid(value: float) -> float:
        return 1.0 / (1.0 + np.exp(-value))

    def _load_baseline(self) -> dict[str, tuple[float, float]]:
        dataset_path = Path(__file__).resolve().parents[2] / "data" / "sample_voice_features.csv"

        if not dataset_path.exists():
            return {
                "pitch_mean": (180.0, 45.0),
                "pitch_std": (38.0, 15.0),
                "energy_mean": (0.21, 0.09),
                "energy_std": (0.08, 0.03),
                "zcr_mean": (0.07, 0.03),
            }

        frame = pd.read_csv(dataset_path)
        baseline: dict[str, tuple[float, float]] = {}

        for feature in ["pitch_mean", "pitch_std", "energy_mean", "energy_std", "zcr_mean"]:
            mean = float(frame[feature].mean())
            std = float(frame[feature].std()) or 1.0
            baseline[feature] = (mean, std)

        return baseline

    def predict(self, vector: dict[str, float]) -> dict:
        zscores: dict[str, float] = {}
        for feature, value in vector.items():
            mean, std = self.baseline.get(feature, (0.0, 1.0))
            zscores[feature] = (value - mean) / std

        raw_score = sum(zscores[key] * weight for key, weight in self.weights.items())
        score = float(self._sigmoid(raw_score))

        if score < 0.4:
            level = "low"
            margin = 0.4 - score
        elif score < 0.7:
            level = "medium"
            margin = min(score - 0.4, 0.7 - score)
        else:
            level = "high"
            margin = score - 0.7

        confidence = round(float(min(0.97, max(0.62, 0.68 + margin * 0.85))), 3)

        contribution_values = {
            "Pitch Variability": abs(zscores["pitch_std"] * self.weights["pitch_std"]),
            "Energy Variability": abs(zscores["energy_std"] * self.weights["energy_std"]),
            "Zero Crossing Rate": abs(zscores["zcr_mean"] * self.weights["zcr_mean"]),
            "Mean Pitch": abs(zscores["pitch_mean"] * self.weights["pitch_mean"]),
            "Mean Energy": abs(zscores["energy_mean"] * self.weights["energy_mean"]),
        }

        total = sum(contribution_values.values()) or 1.0
        feature_importance = [
            {
                "feature": key,
                "importance": round(float(value / total), 4),
            }
            for key, value in contribution_values.items()
        ]
        feature_importance.sort(key=lambda item: item["importance"], reverse=True)

        return {
            "stress_level": level,
            "confidence": confidence,
            "score": score,
            "feature_importance": feature_importance,
        }