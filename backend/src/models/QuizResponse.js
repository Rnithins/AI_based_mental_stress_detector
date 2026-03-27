import mongoose from "mongoose";

const quizResponseSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    stress_level: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    answers: [{ type: mongoose.Schema.Types.Mixed, required: true }],
    suggestions: [{ type: String, required: true }],
  },
  { timestamps: true }
);

export const QuizResponse = mongoose.model("QuizResponse", quizResponseSchema);