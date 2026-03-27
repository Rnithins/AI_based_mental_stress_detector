import mongoose from "mongoose";

const audioRecordSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    file_url: { type: String, required: true },
    original_name: { type: String, required: true },
    mime_type: { type: String, required: true },
    duration_seconds: { type: Number, default: null },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const AudioRecord = mongoose.model("AudioRecord", audioRecordSchema);