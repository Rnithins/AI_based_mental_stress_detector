import dotenv from "dotenv";
import path from "path";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017/voicestress",
  jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  aiServiceUrl: process.env.AI_SERVICE_URL ?? "http://localhost:8000",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  uploadDir: process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), "uploads"),
};

if (!env.jwtSecret || env.jwtSecret === "change-me-in-production") {
  console.warn("[warn] JWT_SECRET is using a default value. Set a secure value in production.");
}