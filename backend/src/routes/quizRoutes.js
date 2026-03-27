import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { QuizResponse } from "../models/QuizResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateQuizSuggestions } from "../services/quizService.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { answers = [], stress_level = "medium" } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "answers must be a non-empty array" });
    }

    const suggestions = generateQuizSuggestions(answers, stress_level);

    const saved = await QuizResponse.create({
      user_id: req.user.id,
      stress_level,
      answers,
      suggestions,
    });

    return res.status(201).json({
      id: saved._id,
      suggestions,
      createdAt: saved.createdAt,
    });
  })
);

export default router;