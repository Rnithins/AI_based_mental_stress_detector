import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { PredictionResult } from "../models/PredictionResult.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const history = await PredictionResult.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate({ path: "audio_record_id", select: "file_url timestamp original_name duration_seconds" });

    return res.json({ items: history });
  })
);

export default router;