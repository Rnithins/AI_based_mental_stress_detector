import path from "path";
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { AudioRecord } from "../models/AudioRecord.js";
import { PredictionResult } from "../models/PredictionResult.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requestPrediction } from "../services/aiService.js";
import { env } from "../config/env.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { audioRecordId } = req.body;

    if (!audioRecordId) {
      return res.status(400).json({ message: "audioRecordId is required" });
    }

    const audioRecord = await AudioRecord.findOne({ _id: audioRecordId, user_id: req.user.id });
    if (!audioRecord) {
      return res.status(404).json({ message: "Audio record not found" });
    }

    const absoluteFilePath = path.join(env.uploadDir, path.basename(audioRecord.file_url));
    const aiResult = await requestPrediction(absoluteFilePath, audioRecord.mime_type);

    const prediction = await PredictionResult.create({
      user_id: req.user.id,
      audio_record_id: audioRecord._id,
      stress_level: aiResult.stress_level,
      confidence: aiResult.confidence,
      features: aiResult.features,
      feature_importance: aiResult.feature_importance,
      explanation: aiResult.explanation,
      suggestions: aiResult.suggestions,
    });

    return res.status(201).json({
      id: prediction._id,
      audio_record_id: prediction.audio_record_id,
      stress_level: prediction.stress_level,
      confidence: prediction.confidence,
      features: prediction.features,
      feature_importance: prediction.feature_importance,
      explanation: prediction.explanation,
      suggestions: prediction.suggestions,
      createdAt: prediction.createdAt,
    });
  })
);

export default router;
