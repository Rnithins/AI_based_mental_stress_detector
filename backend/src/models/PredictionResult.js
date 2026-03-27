import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    mean: Number,
    std: Number,
    min: Number,
    max: Number,
    series: [Number],
  },
  { _id: false }
);

const featureImportanceSchema = new mongoose.Schema(
  {
    feature: { type: String, required: true },
    importance: { type: Number, required: true },
  },
  { _id: false }
);

const predictionResultSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    audio_record_id: { type: mongoose.Schema.Types.ObjectId, ref: "AudioRecord", required: true },
    stress_level: { type: String, enum: ["low", "medium", "high"], required: true, index: true },
    confidence: { type: Number, required: true },
    features: {
      mfcc: [Number],
      pitch: summarySchema,
      energy: summarySchema,
      zcr: summarySchema,
    },
    feature_importance: [featureImportanceSchema],
    explanation: { type: String, required: true },
    suggestions: [{ type: String }],
  },
  { timestamps: true }
);

export const PredictionResult = mongoose.model("PredictionResult", predictionResultSchema);