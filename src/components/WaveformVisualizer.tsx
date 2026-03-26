import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface WaveformVisualizerProps {
  isRecording: boolean;
  audioStream?: MediaStream | null;
}

export default function WaveformVisualizer({ isRecording, audioStream }: WaveformVisualizerProps) {
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
    gradient.addColorStop(0, "hsl(210, 100%, 50%)");
    gradient.addColorStop(1, "hsl(170, 60%, 45%)");

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = gradient;
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
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
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyserRef.current = analyser;

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [isRecording, audioStream, draw]);

  // Idle animation bars
  const idleBars = Array.from({ length: 40 }, (_, i) => i);

  return (
    <div className="w-full h-32 relative rounded-2xl overflow-hidden bg-secondary/50">
      {isRecording ? (
        <canvas
          ref={canvasRef}
          width={800}
          height={128}
          className="w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center gap-[3px] h-full px-8">
          {idleBars.map((i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full gradient-calm"
              initial={{ height: 8 }}
              animate={{
                height: [8, 16 + Math.random() * 24, 8],
              }}
              transition={{
                duration: 1.5 + Math.random(),
                repeat: Infinity,
                delay: i * 0.05,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
