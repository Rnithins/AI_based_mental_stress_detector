import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, BrainCircuit, Download, Flame, Sparkles } from "lucide-react";
import { jsPDF } from "jspdf";
import Header from "@/components/Header";
import StressGauge from "@/components/StressGauge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import type { HistoryItem, PredictionResult } from "@/types/api";

const normalizePrediction = (value: PredictionResult | HistoryItem | null): PredictionResult | null => {
  if (!value) return null;

  const confidence = value.confidence > 1 ? value.confidence / 100 : value.confidence;

  return {
    ...(value as PredictionResult),
    confidence,
    audio_record_id:
      typeof value.audio_record_id === "string" ? value.audio_record_id : value.audio_record_id?._id ?? "",
  };
};

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const prediction = useMemo(() => {
    const fromState = normalizePrediction(location.state?.prediction ?? null);
    if (fromState) return fromState;

    const cached = localStorage.getItem("vs_latest_prediction");
    if (!cached) return null;

    try {
      return normalizePrediction(JSON.parse(cached));
    } catch {
      return null;
    }
  }, [location.state]);

  if (!prediction) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="text-3xl font-semibold">No analysis result available</h1>
          <p className="mt-3 text-muted-foreground">Run a voice analysis first to view stress predictions and explanations.</p>
          <Button className="mt-8" variant="hero" onClick={() => navigate("/analysis")}>Start Analysis</Button>
        </main>
      </div>
    );
  }

  const pitchData = prediction.features.pitch.series.map((value, index) => ({ t: index + 1, value }));
  const energyData = prediction.features.energy.series.map((value, index) => ({ t: index + 1, value }));
  const mfccData = prediction.features.mfcc.map((value, index) => ({ feature: `M${index + 1}`, value }));
  const confidencePercent = Math.round(prediction.confidence * 100);
  const createdAt = prediction.createdAt ? new Date(prediction.createdAt) : new Date();

  const buildProbabilityDistribution = () => {
    const levels: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];
    const selected = prediction.stress_level;
    const selectedScore = confidencePercent;
    const remainder = Math.max(0, 100 - selectedScore);
    const perOther = Math.round((remainder / 2) * 10) / 10;

    return levels.map((level) => ({
      level,
      value: level === selected ? selectedScore : perOther,
    }));
  };

  const buildStressScore = () => {
    const base = {
      low: 22,
      medium: 48,
      high: 65,
    }[prediction.stress_level];

    const multiplier = {
      low: 0.18,
      medium: 0.2,
      high: 0.16,
    }[prediction.stress_level];

    return Math.min(100, Math.round((base + confidencePercent * multiplier) * 10) / 10);
  };

  const exportReport = () => {
    const pdf = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    const probabilities = buildProbabilityDistribution();
    const stressScore = buildStressScore();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 36;
    let y = 36;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("VoiceStress AI Report", margin, y);

    y += 26;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(70, 70, 70);
    pdf.text(`Generated: ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`, margin, y);

    y += 14;
    pdf.text(`User: ${user?.name ?? "User"}${user?.email ? ` (${user.email})` : ""}`, margin, y);

    y += 24;
    pdf.setDrawColor(200, 212, 240);
    pdf.setFillColor(238, 243, 255);
    pdf.roundedRect(margin, y, pageWidth - margin * 2, 78, 12, 12, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(24, 24, 24);
    pdf.text(`Stress Level: ${prediction.stress_level[0].toUpperCase()}${prediction.stress_level.slice(1)}`, margin + 16, y + 24);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Confidence: ${confidencePercent}%`, margin + 16, y + 44);
    pdf.text(`Stress Score: ${stressScore} / 100`, margin + 16, y + 64);

    y += 118;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Feature Probabilities", margin, y);

    y += 18;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    probabilities.forEach(({ level, value }) => {
      pdf.text(`${level[0].toUpperCase()}${level.slice(1)}: ${value.toFixed(1)}%`, margin, y);
      y += 14;
    });

    y += 10;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Explainable Summary", margin, y);

    y += 18;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const explanationLines = pdf.splitTextToSize(prediction.explanation, pageWidth - margin * 2);
    pdf.text(explanationLines, margin, y);
    y += explanationLines.length * 14 + 8;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("Contributors:", margin, y);
    y += 18;

    pdf.setFont("helvetica", "normal");
    prediction.feature_importance.slice(0, 3).forEach((item) => {
      pdf.text(`- ${item.feature}: ${Math.round(item.importance * 100)}%`, margin, y);
      y += 14;
    });

    y += 10;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("Personalized Suggestions:", margin, y);
    y += 18;

    pdf.setFont("helvetica", "normal");
    prediction.suggestions.forEach((suggestion) => {
      const lines = pdf.splitTextToSize(`- ${suggestion}`, pageWidth - margin * 2);
      pdf.text(lines, margin, y);
      y += lines.length * 14;
    });

    pdf.save(`voice-stress-report-${createdAt.toISOString().slice(0, 19).replace(/[:T]/g, "-")}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="glass" size="sm" onClick={() => navigate("/analysis")}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button variant="glass" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
          <article className="glass-panel rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Stress Result</p>
            <div className="mt-5">
              <StressGauge level={prediction.stress_level} confidence={prediction.confidence} />
            </div>

            <div className="mt-6 rounded-2xl bg-secondary/60 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <BrainCircuit className="h-4 w-4 text-sky-500" />
                Explainable AI insight
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{prediction.explanation}</p>
            </div>

            <div className="mt-6 rounded-2xl bg-secondary/60 p-4">
              <p className="text-sm font-semibold">Confidence score</p>
              <p className="mt-1 text-4xl font-semibold">{confidencePercent}%</p>
            </div>
          </article>

          <div className="space-y-6">
            <article className="glass-panel rounded-3xl p-6">
              <h2 className="text-lg font-semibold">Feature Graphs</h2>
              <p className="text-sm text-muted-foreground">Pitch and energy trajectories during the recording window.</p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium">Pitch</p>
                  <ResponsiveContainer width="100%" height={190}>
                    <LineChart data={pitchData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="t" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Energy</p>
                  <ResponsiveContainer width="100%" height={190}>
                    <LineChart data={energyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="t" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </article>

            <article className="glass-panel rounded-3xl p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium">MFCC Vector</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={mfccData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="feature" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Feature Importance</p>
                  <div className="space-y-3">
                    {prediction.feature_importance.map((item) => (
                      <div key={item.feature}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>{item.feature}</span>
                          <span>{Math.round(item.importance * 100)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                            style={{ width: `${Math.round(item.importance * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <article className="glass-panel rounded-3xl p-6">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-sky-500" />
              Suggestions
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {prediction.suggestions.map((tip, index) => (
                <div key={tip} className="rounded-2xl bg-secondary/60 p-4 text-sm">
                  <p className="mb-1 font-medium">Tip {index + 1}</p>
                  <p className="text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Next</p>
            <h3 className="mt-2 text-xl font-semibold">Improve Your Score</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Continue with adaptive quiz and wellness exercises tailored to this result.
            </p>
            <div className="mt-5 space-y-2">
              <Button className="w-full" variant="hero" onClick={() => navigate("/quiz")}>Take AI Quiz</Button>
              <Button className="w-full" variant="glass" onClick={() => navigate("/wellness")}>
                <Flame className="h-4 w-4" /> Wellness Module
              </Button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
