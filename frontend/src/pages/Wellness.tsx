import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Flame, Quote, Sparkles, Wind } from "lucide-react";
import Header from "@/components/Header";
import BreathingExercise from "@/components/BreathingExercise";
import { api } from "@/lib/api";
import type { PredictionResult, QuoteItem, StressLevel } from "@/types/api";

const tips: Record<StressLevel, string[]> = {
  low: [
    "Protect your low-stress baseline with consistent sleep and hydration.",
    "Add a 5-minute decompression walk after long meetings.",
    "Do one reflection prompt before bed to sustain calm momentum.",
  ],
  medium: [
    "Use 4-4-6 breathing before high-pressure calls.",
    "Schedule one short break every 60 minutes to reduce cognitive load.",
    "Keep caffeine earlier in the day and pair with hydration.",
  ],
  high: [
    "Lower external stimuli for 15 minutes and focus on deep exhalation.",
    "Defer non-urgent decisions and prioritize recovery-first tasks.",
    "Reach out to a trusted person and verbalize your top stressor.",
  ],
};

const detectStressLevel = (): StressLevel => {
  const cached = localStorage.getItem("vs_latest_prediction");
  if (!cached) return "medium";

  try {
    const parsed = JSON.parse(cached) as PredictionResult;
    return parsed.stress_level;
  } catch {
    return "medium";
  }
};

export default function Wellness() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stressLevel = useMemo(() => detectStressLevel(), []);

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const response = await api.getQuotes(stressLevel, 3);
        setQuotes(response.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load quotes");
      }
    };

    loadQuotes();
  }, [stressLevel]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="relative mx-auto max-w-7xl overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-700/20" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-800/20" />

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <article className="glass-panel rounded-3xl p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Wellness Hub</p>
            <h1 className="mt-2 text-3xl font-semibold">Calm Reset Experience</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Current voice trend indicates <span className="font-semibold capitalize">{stressLevel}</span> stress.
              Use this guided module to regulate and recover.
            </p>

            <div className="mt-7 rounded-3xl border border-white/40 bg-white/40 p-6 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/45">
              <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Wind className="h-4 w-4 text-sky-500" /> Breathing Exercise
              </p>
              <BreathingExercise />
            </div>
          </article>

          <div className="space-y-6">
            <article className="glass-panel rounded-3xl p-6">
              <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Quote className="h-4 w-4 text-amber-500" /> AI Quotes Generator
              </p>
              <div className="space-y-3">
                {quotes.map((quote) => (
                  <motion.blockquote
                    key={quote.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-secondary/60 p-4 text-sm"
                  >
                    "{quote.text}"
                  </motion.blockquote>
                ))}
              </div>
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            </article>

            <article className="glass-panel rounded-3xl p-6">
              <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Brain className="h-4 w-4 text-sky-500" /> Stress Relief Tips
              </p>
              <div className="space-y-3">
                {tips[stressLevel].map((tip) => (
                  <div key={tip} className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                    {tip}
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-panel rounded-3xl p-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-sky-500" /> Daily Recovery Score
              </p>
              <div className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3">
                <span className="text-sm text-muted-foreground">Today</span>
                <span className="text-xl font-semibold">72 / 100</span>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Flame className="h-4 w-4 text-amber-500" /> Streak
                </span>
                <span className="text-xl font-semibold">5 days</span>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}