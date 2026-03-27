import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { uploadAudio } from "../middleware/upload.js";
import { AudioRecord } from "../models/AudioRecord.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.post(
  "/upload",
  requireAuth,
  uploadAudio.single("audio"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    const audioRecord = await AudioRecord.create({
      user_id: req.user.id,
      file_url: `/uploads/${req.file.filename}`,
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      duration_seconds: req.body.duration_seconds ? Number(req.body.duration_seconds) : null,
    });

    return res.status(201).json({
      id: audioRecord._id,
      file_url: audioRecord.file_url,
      timestamp: audioRecord.timestamp,
    });
  })
);

export default router;