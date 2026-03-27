import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getQuotesByStressLevel } from "../services/quoteService.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const stressLevel = `${req.query.stressLevel ?? "medium"}`;
    const limit = Number(req.query.limit ?? 3);

    const quotes = getQuotesByStressLevel(stressLevel, limit);
    return res.json({ items: quotes });
  })
);

export default router;