import { motion } from "framer-motion";
import type { StressLevel } from "@/types/api";

interface StressGaugeProps {
  level: StressLevel;
  confidence: number;
}

const config = {
  low: { label: "Low Stress", rotate: -58, color: "text-emerald-500" },
  medium: { label: "Medium Stress", rotate: 0, color: "text-amber-500" },
  high: { label: "High Stress", rotate: 58, color: "text-rose-500" },
};

export default function StressGauge({ level, confidence }: StressGaugeProps) {
  const selected = config[level];

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-24 w-52 overflow-hidden">
        <svg viewBox="0 0 210 110" className="h-full w-full">
          <defs>
            <linearGradient id="stress-meter" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          <path
            d="M 20 92 A 86 86 0 0 1 190 92"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 20 92 A 86 86 0 0 1 190 92"
            fill="none"
            stroke="url(#stress-meter)"
            strokeWidth="14"
            strokeLinecap="round"
          />
        </svg>

        <motion.div
          className="absolute bottom-0 left-1/2 h-16 w-1 origin-bottom rounded-full bg-foreground"
          style={{ marginLeft: -2 }}
          initial={{ rotate: -90 }}
          animate={{ rotate: selected.rotate }}
          transition={{ type: "spring", damping: 16, stiffness: 90 }}
        />
        <div className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-foreground" />
      </div>

      <div className="text-center">
        <p className={`text-lg font-semibold ${selected.color}`}>{selected.label}</p>
        <p className="text-sm text-muted-foreground">
          Confidence <span className="font-semibold text-foreground">{Math.round(confidence * 100)}%</span>
        </p>
      </div>
    </div>
  );
}