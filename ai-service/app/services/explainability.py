from __future__ import annotations


def explain_prediction(level: str, feature_importance: list[dict], features: dict) -> tuple[str, list[str]]:
    top_features = ", ".join(item["feature"] for item in feature_importance[:2])
    pitch_mean = features["pitch"]["mean"]
    pitch_std = features["pitch"]["std"]
    energy_std = features["energy"]["std"]
    zcr_mean = features["zcr"]["mean"]

    explanation = (
        f"Stress level is estimated as {level.upper()} based on vocal dynamics. "
        f"Top drivers were {top_features}. "
        f"Observed pitch mean {pitch_mean:.2f} Hz, pitch variability {pitch_std:.2f}, "
        f"energy variability {energy_std:.3f}, and ZCR mean {zcr_mean:.3f}."
    )

    if level == "high":
        suggestions = [
            "Run 6 cycles of 4-4-6 breathing before your next conversation.",
            "Reduce speaking pace and pause 2 seconds between responses.",
            "Take a 10-minute walk without phone notifications.",
        ]
    elif level == "medium":
        suggestions = [
            "Take three slow diaphragmatic breaths every 30 minutes.",
            "Use a 25/5 focus cycle for your next work block.",
            "Hydrate and release neck/shoulder tension with light stretches.",
        ]
    else:
        suggestions = [
            "Keep your current routine and maintain consistent sleep timing.",
            "Add a short evening reflection to preserve low stress baseline.",
            "Use 2-minute breath resets before high-stakes meetings.",
        ]

    return explanation, suggestions