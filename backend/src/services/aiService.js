import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env.js";

const inferAudioContentType = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".wav") return "audio/wav";
  if (extension === ".mp3") return "audio/mpeg";
  if (extension === ".ogg") return "audio/ogg";
  if (extension === ".flac") return "audio/flac";

  return "application/octet-stream";
};

export const requestPrediction = async (absoluteFilePath, mimeType) => {
  if (!fs.existsSync(absoluteFilePath)) {
    const error = new Error("Audio file was not found for prediction");
    error.statusCode = 400;
    throw error;
  }

  const formData = new FormData();
  formData.append("file", fs.createReadStream(absoluteFilePath), {
    filename: path.basename(absoluteFilePath),
    contentType: mimeType || inferAudioContentType(absoluteFilePath),
  });

  try {
    const response = await axios.post(`${env.aiServiceUrl}/predict`, formData, {
      headers: formData.getHeaders(),
      timeout: 60000,
    });
    return response.data;
  } catch (err) {
    let message = err.response?.data?.detail || err.message || "AI service request failed";
    const downstreamStatus = err.response?.status;

    if (err.code === "ECONNREFUSED") {
      message = `AI service is not reachable at ${env.aiServiceUrl}. Start AI service (python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir ai-service)`;
    }

    if (err.code === "ECONNABORTED") {
      message = `AI service timed out at ${env.aiServiceUrl}`;
    }

    const error = new Error(`Unable to process prediction: ${message}`);
    error.statusCode = downstreamStatus === 400 ? 400 : 502;
    throw error;
  }
};
