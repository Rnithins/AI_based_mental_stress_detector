import { useCallback, useEffect, useMemo, useRef } from "react";

interface WaveformVisualizerProps {
  isRecording: boolean;
  audioStream?: MediaStream | null;
  hasAudio?: boolean;
}

const idlePattern = [16, 24, 18, 30, 22, 28, 14, 26, 20, 32, 18, 24, 16, 29, 19, 27, 23, 31, 17, 25];

export default function WaveformVisualizer({ isRecording, audioStream, hasAudio = false }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "#4F46E5");
    gradient.addColorStop(1, "#0EA5E9");

    ctx.lineWidth = 2;
    ctx.strokeStyle = gradient;
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i += 1) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animationRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    if (!isRecording || !audioStream) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.85;
    source.connect(analyser);
    analyserRef.current = analyser;

    void audioContext.resume().then(draw);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [audioStream, draw, isRecording]);

  const bars = useMemo(() => [...idlePattern, ...idlePattern.slice().reverse()], []);

  return (
    <div className="relative h-32 w-full overflow-hidden rounded-3xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/40">
      {isRecording ? (
        <canvas ref={canvasRef} width={880} height={128} className="h-full w-full" />
      ) : (
        <div className="flex h-full items-end justify-center gap-[3px]">
          {bars.map((height, index) => (
            <span
              key={`${height}-${index}`}
              className={`w-1 rounded-full bg-gradient-to-t from-sky-500/70 to-cyan-300/80 ${
                hasAudio ? "opacity-80" : "opacity-50"
              }`}
              style={{ height }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
