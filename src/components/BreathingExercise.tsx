import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function BreathingExercise() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [seconds, setSeconds] = useState(4);
  const [isActive, setIsActive] = useState(false);

  const phases = { inhale: 4, hold: 4, exhale: 6 };
  const nextPhase = { inhale: "hold" as const, hold: "exhale" as const, exhale: "inhale" as const };

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setPhase((p) => {
            const next = nextPhase[p];
            setSeconds(phases[next]);
            return next;
          });
          return phases[nextPhase[phase]];
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const phaseLabels = { inhale: "Breathe In", hold: "Hold", exhale: "Breathe Out" };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full gradient-calm opacity-20"
          animate={
            isActive
              ? {
                  scale: phase === "inhale" ? [1, 1.3] : phase === "exhale" ? [1.3, 1] : 1.3,
                }
              : { scale: 1 }
          }
          transition={{ duration: phases[phase], ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-4 rounded-full gradient-calm opacity-30"
          animate={
            isActive
              ? {
                  scale: phase === "inhale" ? [1, 1.2] : phase === "exhale" ? [1.2, 1] : 1.2,
                }
              : { scale: 1 }
          }
          transition={{ duration: phases[phase], ease: "easeInOut" }}
        />
        <div className="z-10 text-center">
          <p className="text-3xl font-bold text-foreground">{isActive ? seconds : "—"}</p>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            {isActive ? phaseLabels[phase] : "Ready"}
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          setIsActive(!isActive);
          if (!isActive) {
            setPhase("inhale");
            setSeconds(4);
          }
        }}
        className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:brightness-110 active:scale-95"
      >
        {isActive ? "Stop" : "Start Breathing"}
      </button>
    </div>
  );
}
