import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mic, Square, Upload, WandSparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const MAX_RECORD_SECONDS = 20;
const MIN_RECORDING_MS = 800;
const SUPPORTED_AUDIO_EXTENSIONS = [".wav", ".mp3", ".ogg", ".flac"];
const SUPPORTED_AUDIO_TYPES = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/flac",
]);

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const mergeAudioChunks = (chunks: Float32Array[]) => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });

  return merged;
};

const writeString = (view: DataView, offset: number, value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
};

const encodeWav = (samples: Float32Array, sampleRate: number) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
};

const getPreferredRecorderMimeType = () => {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
};

const mixToMono = (audioBuffer: AudioBuffer) => {
  if (audioBuffer.numberOfChannels === 1) {
    return audioBuffer.getChannelData(0);
  }

  const mono = new Float32Array(audioBuffer.length);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let index = 0; index < channelData.length; index += 1) {
      mono[index] += channelData[index] / audioBuffer.numberOfChannels;
    }
  }

  return mono;
};

const convertRecordingToWavFile = async (blob: Blob) => {
  const context = new window.AudioContext();

  try {
    const arrayBuffer = await blob.arrayBuffer();
    const decoded = await context.decodeAudioData(arrayBuffer.slice(0));
    const wavBlob = encodeWav(mixToMono(decoded), decoded.sampleRate);

    return {
      file: new File([wavBlob], `voice-${Date.now()}.wav`, { type: "audio/wav" }),
      url: URL.createObjectURL(wavBlob),
    };
  } finally {
    await context.close();
  }
};

const isSupportedAudioFile = (file: File) => {
  if (SUPPORTED_AUDIO_TYPES.has(file.type)) {
    return true;
  }

  const lowerName = file.name.toLowerCase();
  return SUPPORTED_AUDIO_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
};

export default function VoiceAnalysis() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const pcmSampleRateRef = useRef<number>(44100);
  const captureContextRef = useRef<AudioContext | null>(null);
  const captureSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const captureProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const captureGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cleanupPreviousAudio = useCallback(() => {
    setAudioFile(null);
    setDuration(0);
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioUrl(null);
  }, [audioUrl]);

  const teardownPcmCapture = useCallback(async () => {
    captureProcessorRef.current?.disconnect();
    captureSourceRef.current?.disconnect();
    captureGainRef.current?.disconnect();

    captureProcessorRef.current = null;
    captureSourceRef.current = null;
    captureGainRef.current = null;

    if (captureContextRef.current) {
      await captureContextRef.current.close();
      captureContextRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") {
      return;
    }

    const elapsed = recordingStartedAtRef.current ? Date.now() - recordingStartedAtRef.current : 0;
    if (elapsed < MIN_RECORDING_MS) {
      setError("Record for at least 1 second before stopping.");
      return;
    }

    stopTimer();
    try {
      recorder.requestData();
    } catch {
      // Some browsers do not implement requestData reliably.
    }
    recorder.stop();
  }, [stopTimer]);

  const startRecording = useCallback(async () => {
    try {
      cleanupPreviousAudio();
      setError(null);

      if (typeof MediaRecorder === "undefined" || !window.AudioContext) {
        setError("This browser does not support in-app audio recording.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getPreferredRecorderMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const captureContext = new window.AudioContext();
      const captureSource = captureContext.createMediaStreamSource(stream);
      const captureProcessor = captureContext.createScriptProcessor(4096, 1, 1);
      const captureGain = captureContext.createGain();
      captureGain.gain.value = 0;

      chunksRef.current = [];
      pcmChunksRef.current = [];
      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recordingStartedAtRef.current = Date.now();
      pcmSampleRateRef.current = captureContext.sampleRate;
      captureContextRef.current = captureContext;
      captureSourceRef.current = captureSource;
      captureProcessorRef.current = captureProcessor;
      captureGainRef.current = captureGain;
      setAudioStream(stream);

      captureProcessor.onaudioprocess = (event) => {
        const channelData = event.inputBuffer.getChannelData(0);
        pcmChunksRef.current.push(new Float32Array(channelData));
      };

      captureSource.connect(captureProcessor);
      captureProcessor.connect(captureGain);
      captureGain.connect(captureContext.destination);
      await captureContext.resume();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setIsRecording(false);
        setError("Browser recording failed. Try Upload Audio instead.");
      };

      recorder.onstop = async () => {
        await new Promise((resolve) => window.setTimeout(resolve, 150));

        const nextStream = streamRef.current;
        nextStream?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        recordingStartedAtRef.current = null;
        setAudioStream(null);
        setIsRecording(false);

        try {
          if (chunksRef.current.length) {
            const recordedBlob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
            chunksRef.current = [];

            try {
              const wavAudio = await convertRecordingToWavFile(recordedBlob);
              if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
              }
              audioUrlRef.current = wavAudio.url;
              setError(null);
              setAudioFile(wavAudio.file);
              setAudioUrl(wavAudio.url);
              pcmChunksRef.current = [];
              await teardownPcmCapture();
              return;
            } catch {
              // Fall back to raw PCM capture below.
            }
          }

          if (pcmChunksRef.current.length) {
            const wavBlob = encodeWav(mergeAudioChunks(pcmChunksRef.current), pcmSampleRateRef.current);
            const file = new File([wavBlob], `voice-${Date.now()}.wav`, { type: "audio/wav" });
            const url = URL.createObjectURL(wavBlob);

            if (audioUrlRef.current) {
              URL.revokeObjectURL(audioUrlRef.current);
            }
            audioUrlRef.current = url;
            setError(null);
            setAudioFile(file);
            setAudioUrl(url);
            pcmChunksRef.current = [];
            chunksRef.current = [];
            await teardownPcmCapture();
            return;
          }

          setError("No audio data was captured. Try Upload Audio or record for longer.");
        } catch {
          setError("Recorded audio could not be prepared for analysis. Try uploading a WAV file.");
        } finally {
          pcmChunksRef.current = [];
          chunksRef.current = [];
          await teardownPcmCapture();
        }
      };

      recorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration((current) => {
          const next = current + 1;
          if (next >= MAX_RECORD_SECONDS) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch {
      setError("Microphone permission is required to record audio.");
    }
  }, [cleanupPreviousAudio, stopRecording, teardownPcmCapture]);

  const uploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isSupportedAudioFile(file)) {
      setError("Unsupported format. Use WAV, MP3, OGG, or FLAC.");
      event.target.value = "";
      return;
    }

    cleanupPreviousAudio();
    setError(null);
    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
  };

  const analyzeAudio = async () => {
    if (!token || !audioFile) return;

    setProcessing(true);
    setError(null);

    try {
      const upload = await api.uploadAudio(audioFile, token, duration || undefined);
      const prediction = await api.predict(upload.id, token);

      localStorage.setItem("vs_latest_prediction", JSON.stringify(prediction));
      navigate("/results", { state: { prediction } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze audio");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      stopTimer();
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      recordingStartedAtRef.current = null;
      pcmChunksRef.current = [];
      chunksRef.current = [];
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      void teardownPcmCapture();
    };
  }, [stopTimer, teardownPcmCapture]);

  const recordingHint = useMemo(() => {
    if (isRecording) return "Recording in progress...";
    if (audioFile) return "Audio ready. Run AI analysis.";
    return "Record 10-20 seconds of natural speech for best results.";
  }, [audioFile, isRecording]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight">Voice Analysis</h1>
          <p className="mt-2 text-muted-foreground">{recordingHint}</p>

          <div className="mt-7">
            <WaveformVisualizer isRecording={isRecording} audioStream={audioStream} hasAudio={Boolean(audioFile)} />
          </div>

          <div className="mt-6 text-center">
            <p className="text-5xl font-semibold tracking-tight">{formatDuration(duration)}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">10 to 20 seconds recommended</p>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {!isRecording ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.04 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-xl shadow-sky-400/40"
                onClick={audioFile ? analyzeAudio : startRecording}
                disabled={processing}
                type="button"
              >
                {audioFile ? (
                  processing ? <Loader2 className="h-7 w-7 animate-spin" /> : <WandSparkles className="h-7 w-7" />
                ) : (
                  <Mic className="h-7 w-7" />
                )}
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.04 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-xl shadow-rose-400/40"
                onClick={stopRecording}
                type="button"
              >
                <Square className="h-6 w-6" />
              </motion.button>
            )}

            {!isRecording && (
              <>
                <input
                  ref={fileInputRef}
                  className="hidden"
                  type="file"
                  accept=".wav,.mp3,.ogg,.flac,audio/wav,audio/mpeg,audio/ogg,audio/flac"
                  onChange={uploadFile}
                />
                <Button variant="glass" type="button" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  Upload Audio
                </Button>
              </>
            )}

            {audioFile && !isRecording && (
              <Button variant="ghost" type="button" onClick={cleanupPreviousAudio}>
                Clear
              </Button>
            )}
          </div>

          {!isRecording && !audioFile && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Supported upload formats: WAV, MP3, OGG, FLAC.
            </p>
          )}

          {audioUrl && (
            <div className="mt-6 rounded-2xl border border-border/60 bg-secondary/60 p-4">
              <p className="mb-2 text-sm font-medium">Audio Playback</p>
              <audio className="w-full" controls src={audioUrl} />
            </div>
          )}

          {error && <p className="mt-5 text-sm text-red-500">{error}</p>}
        </section>
      </main>
    </div>
  );
}
