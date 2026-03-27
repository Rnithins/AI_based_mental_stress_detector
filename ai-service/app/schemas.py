from pydantic import BaseModel, Field


class SummaryStats(BaseModel):
    mean: float
    std: float
    min: float
    max: float
    series: list[float] = Field(default_factory=list)


class Features(BaseModel):
    mfcc: list[float]
    pitch: SummaryStats
    energy: SummaryStats
    zcr: SummaryStats


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class PredictionResponse(BaseModel):
    stress_level: str
    confidence: float
    features: Features
    feature_importance: list[FeatureImportance]
    explanation: str
    suggestions: list[str]