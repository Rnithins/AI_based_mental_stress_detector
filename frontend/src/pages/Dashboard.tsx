import { useEffect, useMemo, useState } from "react";
import { Activity, ChartLine, Clock3, Flame, Loader2, UserRound } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { HistoryItem, StressLevel } from "@/types/api";

const levelScore: Record<StressLevel, number> = {
  low: 30,
  medium: 60,
  high: 85,
};

const normalizeConfidence = (value: number) => Math.round(value <= 1 ? value * 100 : value);

export default function Dashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const response = await api.getHistory(token);
        setHistory(response.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load history");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [token]);

  const stats = useMemo(() => {
    if (!history.length) {
      return {
        total: 0,
        avgStress: 0,
        lastLevel: "-",
      };
    }

    const avgStress = Math.round(
      history.reduce((sum, item) => sum + levelScore[item.stress_level], 0) / history.length,
    );

    return {
      total: history.length,
      avgStress,
      lastLevel: history[0].stress_level,
    };
  }, [history]);

  const trendData = useMemo(
    () =>
      history
        .slice(0, 12)
        .reverse()
        .map((item) => ({
          date: format(new Date(item.createdAt), "MMM d"),
          stress: levelScore[item.stress_level],
          confidence: normalizeConfidence(item.confidence),
        })),
    [history],
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_2fr]">
          <article className="glass-panel rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Profile</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-400/25">
                <UserRound className="h-6 w-6 text-sky-600 dark:text-sky-300" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{user?.name}</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-secondary/70 px-4 py-2.5">
                <span className="text-muted-foreground">Total analyses</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-secondary/70 px-4 py-2.5">
                <span className="text-muted-foreground">Average stress score</span>
                <span className="font-semibold">{stats.avgStress}/100</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-secondary/70 px-4 py-2.5">
                <span className="text-muted-foreground">Recent level</span>
                <span className="font-semibold capitalize">{stats.lastLevel}</span>
              </div>
            </div>
          </article>

          <article className="glass-panel rounded-3xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Analytics</p>
                <h2 className="mt-1 text-2xl font-semibold">Stress Trends</h2>
              </div>
              <Button variant="glass" size="sm" onClick={() => navigate("/analysis")}>New Analysis</Button>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading data
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300">
                {error}
              </div>
            ) : trendData.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trendData} margin={{ left: -10, right: 8 }}>
                  <defs>
                    <linearGradient id="stressArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                    }}
                  />
                  <Area type="monotone" dataKey="stress" stroke="#0284c7" strokeWidth={2.5} fill="url(#stressArea)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
                <ChartLine className="h-5 w-5 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">No analyses yet. Record your first voice sample.</p>
                <Button className="mt-4" variant="hero" onClick={() => navigate("/analysis")}>Analyze Voice</Button>
              </div>
            )}
          </article>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-sky-500" />
            <h3 className="text-lg font-semibold">Past Stress Results</h3>
          </div>

          <div className="space-y-3">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate("/results", { state: { prediction: item } })}
                className="glass-panel flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition hover:shadow-xl"
              >
                <div>
                  <p className="font-medium">{format(new Date(item.createdAt), "PPP p")}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    Confidence {normalizeConfidence(item.confidence)}%
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-2 text-sm font-semibold capitalize">
                  <Flame className="h-4 w-4 text-amber-500" />
                  {item.stress_level}
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}