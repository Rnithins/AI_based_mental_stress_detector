import { motion } from "framer-motion";
import { BarChart3, Calendar, Clock, TrendingDown, TrendingUp, Activity } from "lucide-react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const trendData = [
  { date: "Mar 1", stress: 45 },
  { date: "Mar 5", stress: 62 },
  { date: "Mar 8", stress: 38 },
  { date: "Mar 12", stress: 55 },
  { date: "Mar 15", stress: 70 },
  { date: "Mar 18", stress: 48 },
  { date: "Mar 22", stress: 35 },
  { date: "Mar 25", stress: 42 },
];

const history = [
  { id: 1, date: "Mar 25, 2026", duration: "15s", level: "low" as const, confidence: 82 },
  { id: 2, date: "Mar 22, 2026", duration: "18s", level: "medium" as const, confidence: 74 },
  { id: 3, date: "Mar 18, 2026", duration: "12s", level: "medium" as const, confidence: 78 },
  { id: 4, date: "Mar 15, 2026", duration: "20s", level: "high" as const, confidence: 88 },
  { id: 5, date: "Mar 12, 2026", duration: "14s", level: "medium" as const, confidence: 71 },
  { id: 6, date: "Mar 8, 2026", duration: "16s", level: "low" as const, confidence: 85 },
];

const levelColors = {
  low: "stress-indicator-low",
  medium: "stress-indicator-medium",
  high: "stress-indicator-high",
};

const stats = [
  { label: "Total Recordings", value: "24", icon: Activity, change: "+3 this week" },
  { label: "Avg Stress Level", value: "Medium", icon: BarChart3, change: "Improving" },
  { label: "Current Streak", value: "5 days", icon: Calendar, change: "Keep going!" },
  { label: "Trend", value: "-12%", icon: TrendingDown, change: "vs last week" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Track your stress levels over time</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                className="glass-card p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-elevated p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-foreground">Stress Over Time</h2>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </div>
              <div className="flex items-center gap-1 text-stress-low text-sm font-medium">
                <TrendingDown className="w-4 h-4" />
                Improving
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="stress"
                  stroke="hsl(210, 100%, 50%)"
                  strokeWidth={2.5}
                  fill="url(#stressGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-foreground">Recording History</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/record")}>
                New Recording
              </Button>
            </div>

            <div className="space-y-3">
              {history.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  onClick={() => navigate("/results")}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl gradient-calm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Activity className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.date}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {item.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full border text-xs font-semibold capitalize ${levelColors[item.level]}`}>
                      {item.level}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.confidence}%</span>
                    <TrendingUp className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
