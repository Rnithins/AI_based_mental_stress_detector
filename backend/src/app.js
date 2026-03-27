import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import audioRoutes from "./routes/audioRoutes.js";
import predictRoutes from "./routes/predictRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import quotesRoutes from "./routes/quotesRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(env.uploadDir)));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/audio", audioRoutes);
app.use("/predict", predictRoutes);
app.use("/history", historyRoutes);
app.use("/quiz", quizRoutes);
app.use("/quotes", quotesRoutes);

// Backward-compatible API namespace for clients preferring /api/*
app.use("/api/auth", authRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/quotes", quotesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
