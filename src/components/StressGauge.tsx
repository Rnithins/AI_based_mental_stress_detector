import { motion } from "framer-motion";

interface StressGaugeProps {
  level: "low" | "medium" | "high";
  confidence: number;
}

export default function StressGauge({ level, confidence }: StressGaugeProps) {
  const levelConfig = {
    low: { label: "Low Stress", rotation: -60, color: "text-stress-low", bg: "stress-indicator-low" },
    medium: { label: "Medium Stress", rotation: 0, color: "text-stress-medium", bg: "stress-indicator-medium" },
    high: { label: "High Stress", rotation: 60, color: "text-stress-high", bg: "stress-indicator-high" },
  };

  const config = levelConfig[level];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Gauge arc */}
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(150, 60%, 45%)" />
              <stop offset="50%" stopColor="hsl(40, 90%, 55%)" />
              <stop offset="100%" stopColor="hsl(0, 72%, 55%)" />
            </linearGradient>
          </defs>
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251"
            strokeDashoffset="0"
          />
        </svg>
        {/* Needle */}
        <motion.div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{ width: 3, height: 60, marginLeft: -1.5 }}
          initial={{ rotate: -90 }}
          animate={{ rotate: config.rotation }}
          transition={{ type: "spring", stiffness: 60, damping: 12 }}
        >
          <div className="w-full h-full bg-foreground rounded-full" />
        </motion.div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-foreground" />
      </div>

      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`inline-block px-4 py-1.5 rounded-full border text-sm font-semibold ${config.bg}`}
        >
          {config.label}
        </motion.div>
        <p className="mt-2 text-sm text-muted-foreground">
          Confidence: <span className="font-semibold text-foreground">{confidence}%</span>
        </p>
      </div>
    </div>
  );
}
