import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const phases = {
  inhale: { label: "Inhale", seconds: 4, scale: 1.25 },
  hold: { label: "Hold", seconds: 4, scale: 1.25 },
  exhale: { label: "Exhale", seconds: 6, scale: 1 },
} as const;

type BreathPhase = keyof typeof phases;

export default function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [secondsLeft, setSecondsLeft] = useState(phases.inhale.seconds);

  useEffect(() => {
    if (!active) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) return current - 1;

        setPhase((prev) => {
          const next: BreathPhase = prev === "inhale" ? "hold" : prev === "hold" ? "exhale" : "inhale";
          return next;
        });

        const nextPhase: BreathPhase = phase === "inhale" ? "hold" : phase === "hold" ? "exhale" : "inhale";
        return phases[nextPhase].seconds;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [active, phase]);

  const instruction = useMemo(() => (active ? phases[phase].label : "Ready"), [active, phase]);

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        className="relative flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/20 via-white/40 to-teal-400/20 shadow-inner dark:from-sky-600/20 dark:via-slate-900/40 dark:to-teal-500/20"
        animate={{ scale: active ? phases[phase].scale : 1 }}
        transition={{ duration: phases[phase].seconds, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-5 rounded-full border border-white/50 dark:border-slate-700/70"
          animate={{ scale: active ? phases[phase].scale - 0.15 : 1 }}
          transition={{ duration: phases[phase].seconds, ease: "easeInOut" }}
        />
        <div className="text-center">
          <p className="text-5xl font-semibold tracking-tight">{active ? secondsLeft : "-"}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">{instruction}</p>
        </div>
      </motion.div>

      <button
        className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background transition hover:opacity-90"
        onClick={() => {
          if (!active) {
            setPhase("inhale");
            setSecondsLeft(phases.inhale.seconds);
          }
          setActive((v) => !v);
        }}
      >
        {active ? "Stop Exercise" : "Start 4-4-6 Exercise"}
      </button>
    </div>
  );
}