import { motion } from "framer-motion";
import { Brain, ChartLine, Mic, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const cards = [
  {
    icon: Mic,
    title: "Fast Voice Capture",
    body: "Record 10-20 seconds or upload an audio clip for immediate stress inference.",
  },
  {
    icon: Brain,
    title: "Explainable AI",
    body: "MFCC, pitch, energy, and ZCR signals are surfaced so every result is understandable.",
  },
  {
    icon: ChartLine,
    title: "Stress Tracking",
    body: "Track history trends, confidence movement, and day-over-day wellness improvements.",
  },
  {
    icon: ShieldCheck,
    title: "Private by Design",
    body: "JWT-protected sessions and secure API flow from frontend to backend to AI service.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-700/20" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-600/20" />
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/50 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 backdrop-blur-xl dark:border-sky-800/50 dark:bg-slate-900/60 dark:text-sky-300">
              <Sparkles className="h-3.5 w-3.5" />
              VoiceStress AI
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Intelligent voice-based stress detection with wellness guidance.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              No wearables. No lengthy forms. Just your voice, analyzed through explainable audio intelligence,
              delivered in a premium and calming experience.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="xl" variant="hero" onClick={() => navigate("/analysis")}>
                <Mic className="h-5 w-5" />
                Start Voice Analysis
              </Button>
              <Button size="xl" variant="glass" onClick={() => navigate("/dashboard")}>
                <ChartLine className="h-5 w-5" />
                Open Dashboard
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-16 grid gap-4 md:grid-cols-2"
          >
            {cards.map((card) => (
              <article key={card.title} className="glass-panel rounded-3xl p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-cyan-400/20">
                  <card.icon className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                </div>
                <h2 className="text-lg font-semibold">{card.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
              </article>
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  );
}