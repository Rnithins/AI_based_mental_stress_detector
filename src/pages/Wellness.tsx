import { motion } from "framer-motion";
import { Heart, Wind, Music, Sparkles, Flame, Brain, Quote } from "lucide-react";
import Header from "@/components/Header";
import BreathingExercise from "@/components/BreathingExercise";
import { useState } from "react";

const moodEmojis = [
  { emoji: "😊", label: "Great", value: 5 },
  { emoji: "🙂", label: "Good", value: 4 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "😔", label: "Low", value: 2 },
  { emoji: "😰", label: "Stressed", value: 1 },
];

const wellnessCards = [
  {
    icon: Wind,
    title: "Breathing Exercise",
    description: "4-4-6 technique for immediate calm",
    color: "from-blue-500/10 to-cyan-500/10",
  },
  {
    icon: Music,
    title: "Music Therapy",
    description: "Curated playlists for relaxation",
    color: "from-purple-500/10 to-pink-500/10",
  },
  {
    icon: Brain,
    title: "Guided Meditation",
    description: "5-minute mindfulness sessions",
    color: "from-emerald-500/10 to-teal-500/10",
  },
];

const quotes = [
  "The greatest weapon against stress is our ability to choose one thought over another. — William James",
  "Almost everything will work again if you unplug it for a few minutes, including you. — Anne Lamott",
  "You don't have to control your thoughts. You just have to stop letting them control you. — Dan Millman",
];

const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Wellness() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [quoteIndex] = useState(Math.floor(Math.random() * quotes.length));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2">Wellness Hub</h1>
            <p className="text-muted-foreground text-lg">Your daily companion for mental well-being</p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="space-y-6"
          >
            {/* Daily Quote */}
            <motion.div variants={cardAnim} className="glass-card-elevated p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="w-16 h-16 text-primary" />
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary mb-2">Daily Inspiration</p>
                  <p className="text-foreground text-lg leading-relaxed italic">
                    "{quotes[quoteIndex]}"
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Mood Tracker */}
            <motion.div variants={cardAnim} className="glass-card p-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                How are you feeling today?
              </h2>
              <div className="flex justify-center gap-4">
                {moodEmojis.map((mood) => (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-colors ${
                      selectedMood === mood.value
                        ? "bg-primary/10 ring-2 ring-primary/30"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <span className="text-3xl">{mood.emoji}</span>
                    <span className="text-xs text-muted-foreground font-medium">{mood.label}</span>
                  </motion.button>
                ))}
              </div>
              {selectedMood && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-muted-foreground mt-4"
                >
                  Mood logged! Keep tracking daily to see your trends.
                </motion.p>
              )}
            </motion.div>

            {/* Streak */}
            <motion.div variants={cardAnim} className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">5 Day Streak!</p>
                    <p className="text-sm text-muted-foreground">Keep going for a new record</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <div
                      key={d}
                      className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center font-medium ${
                        d <= 5
                          ? "gradient-calm text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {d <= 5 ? "✓" : d}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Wellness Activities */}
            <div className="grid md:grid-cols-3 gap-4">
              {wellnessCards.map((card) => (
                <motion.div
                  key={card.title}
                  variants={cardAnim}
                  className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <card.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Breathing Exercise */}
            <motion.div variants={cardAnim} className="glass-card-elevated p-8">
              <h2 className="font-semibold text-foreground mb-6 text-center text-lg">
                Breathing Exercise
              </h2>
              <BreathingExercise />
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
