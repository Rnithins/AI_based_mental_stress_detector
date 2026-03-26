import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Mic, BarChart3, Shield, Brain, Zap } from "lucide-react";
import Header from "@/components/Header";

const features = [
  {
    icon: Mic,
    title: "Voice Recording",
    description: "Record or upload audio for instant stress analysis with real-time waveform visualization.",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Advanced AI examines pitch, energy, and vocal patterns to determine stress levels.",
  },
  {
    icon: BarChart3,
    title: "Detailed Insights",
    description: "View comprehensive graphs, feature importance, and explainable AI results.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your voice data is processed securely and never shared with third parties.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-breathe" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-breathe" style={{ animationDelay: "4s" }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Stress Detection
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-6">
              Understand your
              <br />
              <span className="text-gradient">stress through voice</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              VoiceStress AI uses advanced machine learning to analyze vocal patterns
              and detect stress levels in real-time. Simple. Private. Accurate.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate("/record")}
              >
                <Mic className="w-5 h-5" />
                Start Analysis
              </Button>
              <Button
                variant="glass"
                size="xl"
                onClick={() => navigate("/dashboard")}
              >
                <BarChart3 className="w-5 h-5" />
                View Dashboard
              </Button>
            </div>
          </motion.div>

          {/* Waveform preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 glass-card-elevated p-8 max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-[2px] h-20">
              {Array.from({ length: 60 }, (_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full gradient-calm"
                  animate={{
                    height: [4, 12 + Math.sin(i * 0.3) * 28 + Math.random() * 16, 4],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    delay: i * 0.04,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">Real-time voice waveform analysis</p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three simple steps to understand your stress levels
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                className="glass-card p-8 hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl gradient-calm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto glass-card-elevated p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-calm opacity-5" />
          <div className="relative z-10">
            <Activity className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to analyze your stress?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Start a voice recording now and get instant AI-powered insights about your mental well-being.
            </p>
            <Button variant="hero" size="xl" onClick={() => navigate("/record")}>
              <Mic className="w-5 h-5" />
              Get Started Free
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-calm flex items-center justify-center">
              <Activity className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">VoiceStress AI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 VoiceStress AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
