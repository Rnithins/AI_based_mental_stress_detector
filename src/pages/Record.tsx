import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Square, Upload, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import WaveformVisualizer from "@/components/WaveformVisualizer";

export default function Record() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        setAudioStream(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      setRecordedBlob(null);

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      alert("Microphone access is required for voice analysis.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecordedBlob(file);
      setDuration(0);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleAnalyze = () => {
    // In a real app, we'd upload the blob. For now, navigate with mock data.
    navigate("/results", { state: { hasRecording: true } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Voice Recording
            </h1>
            <p className="text-muted-foreground text-lg">
              Record 10–20 seconds of natural speech for optimal analysis
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card-elevated p-8"
          >
            {/* Waveform */}
            <WaveformVisualizer isRecording={isRecording} audioStream={audioStream} />

            {/* Timer */}
            <div className="text-center my-6">
              <p className="text-4xl font-bold text-foreground font-mono tracking-wider">
                {formatTime(duration)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isRecording
                  ? "Recording..."
                  : recordedBlob
                  ? "Recording complete"
                  : "Ready to record"}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-4">
              {!isRecording ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={recordedBlob ? handleAnalyze : startRecording}
                  className="w-20 h-20 rounded-full gradient-calm flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                >
                  {recordedBlob ? (
                    <ArrowRight className="w-8 h-8 text-primary-foreground" />
                  ) : (
                    <Mic className="w-8 h-8 text-primary-foreground" />
                  )}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center shadow-lg"
                >
                  <Square className="w-7 h-7 text-destructive-foreground" />
                </motion.button>
              )}

              <p className="text-sm text-muted-foreground">
                {isRecording
                  ? "Tap to stop"
                  : recordedBlob
                  ? "Tap to analyze"
                  : "Tap to start recording"}
              </p>

              {!isRecording && !recordedBlob && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}

              {!isRecording && !recordedBlob && (
                <label>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button variant="glass" className="cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Upload Audio File
                  </Button>
                </label>
              )}

              {recordedBlob && !isRecording && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRecordedBlob(null);
                    setDuration(0);
                  }}
                >
                  Record Again
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
