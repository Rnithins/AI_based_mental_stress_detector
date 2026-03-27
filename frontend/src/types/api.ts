export type StressLevel = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface SummaryStats {
  mean: number;
  std: number;
  min: number;
  max: number;
  series: number[];
}

export interface PredictionFeatures {
  mfcc: number[];
  pitch: SummaryStats;
  energy: SummaryStats;
  zcr: SummaryStats;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface PredictionResult {
  id: string;
  audio_record_id: string;
  stress_level: StressLevel;
  confidence: number;
  features: PredictionFeatures;
  feature_importance: FeatureImportance[];
  explanation: string;
  suggestions: string[];
  createdAt: string;
}

export interface AudioUploadResponse {
  id: string;
  file_url: string;
  timestamp: string;
}

export interface HistoryItem extends PredictionResult {
  audio_record_id:
    | string
    | {
        _id: string;
        file_url: string;
        timestamp: string;
        original_name?: string;
        duration_seconds?: number | null;
      };
}

export interface QuizAnswer {
  id: string;
  label: string;
  value: number;
}

export interface QuoteItem {
  id: string;
  text: string;
  tone: StressLevel;
}

export interface AuthResponse {
  token: string;
  user: User;
}