import { motion } from "framer-motion";
import { ArrowLeft, Download, Lightbulb, TrendingUp, Volume2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import StressGauge from "@/components/StressGauge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// Mock data
const pitchData = Array.from({ length: 30 }, (_, i) => ({
  time: `${i * 0.5}s`,
  pitch: 120 + Math.sin(i * 0.4) * 40 + Math.random() * 20,
}));

const energyData = Array.from({ length: 30 }, (_, i) => ({
  time: `${i * 0.5}s`,
  energy: 0.3 + Math.sin(i * 0.3) * 0.25 + Math.random() * 0.15,
}));

const featureImportance = [
  { feature: "Pitch Variation", importance: 0.32 },
  { feature: "MFCC", importance: 0.28 },
  { feature: "Energy Level", importance: 0.18 },
  { feature: "Zero Crossing", importance: 0.12 },
  { feature: "Spectral Roll", importance: 0.10 },
];

const radarData = [
  { subject: "Pitch", A: 72 },
  { subject: "Energy", A: 58 },
  { subject: "MFCC", A: 85 },
  { subject: "ZCR", A: 40 },
  { subject: "Jitter", A: 65 },
  { subject: "Shimmer", A: 52 },
];

const suggestions = [
  "Take 5 deep breaths using the 4-4-6 breathing technique",
  "Try a 10-minute guided meditation",
  "Take a short walk in nature",
  "Listen to calming music for 15 minutes",
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Results() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/record")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analysis Results</h1>
              <p className="text-muted-foreground text-sm">Recorded just now · 15 seconds</p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Stress Level */}
            <motion.div variants={cardVariants} className="glass-card-elevated p-8 md:col-span-2 flex flex-col items-center">
              <StressGauge level="medium" confidence={78} />
            </motion.div>

            {/* Pitch Variation */}
            <motion.div variants={cardVariants} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Volume2 className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Pitch Variation</h3>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={pitchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="pitch" stroke="hsl(210, 100%, 50%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Energy Levels */}
            <motion.div variants={cardVariants} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-foreground">Energy Levels</h3>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="energy" stroke="hsl(170, 60%, 45%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Feature Importance */}
            <motion.div variants={cardVariants} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Feature Importance</h3>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={featureImportance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="feature" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={100} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="importance" fill="hsl(210, 100%, 50%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Voice Profile Radar */}
            <motion.div variants={cardVariants} className="glass-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Voice Profile</h3>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar dataKey="A" stroke="hsl(210, 100%, 50%)" fill="hsl(210, 100%, 50%)" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Explanation */}
            <motion.div variants={cardVariants} className="glass-card p-6 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-stress-medium" />
                <h3 className="font-semibold text-foreground">AI Explanation</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Your voice shows moderate stress indicators. Elevated pitch variation (±40Hz) and
                increased energy fluctuations suggest some tension. The MFCC analysis shows patterns
                consistent with mild anxiety. However, your zero crossing rate remains stable,
                indicating controlled speech patterns overall.
              </p>

              <h4 className="font-semibold text-foreground mb-3">Personalized Suggestions</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className="w-6 h-6 rounded-full gradient-calm flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{s}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div variants={cardVariants} className="md:col-span-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="hero" size="lg" onClick={() => navigate("/record")}>
                New Recording
              </Button>
              <Button variant="glass" size="lg">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
              <Button variant="glass" size="lg" onClick={() => navigate("/wellness")}>
                Wellness Tips
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
