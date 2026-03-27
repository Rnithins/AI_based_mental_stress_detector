import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { PredictionResult, QuizAnswer, StressLevel } from "@/types/api";

interface QuestionOption {
  label: string;
  value: number;
}

interface Question {
  id: string;
  prompt: string;
  options: QuestionOption[];
}

const questions: Record<string, Question> = {
  sleep_quality: {
    id: "sleep_quality",
    prompt: "How would you rate your sleep quality in the last 3 nights?",
    options: [
      { label: "Very poor", value: 1 },
      { label: "Somewhat poor", value: 2 },
      { label: "Average", value: 3 },
      { label: "Good", value: 4 },
      { label: "Excellent", value: 5 },
    ],
  },
  daily_energy: {
    id: "daily_energy",
    prompt: "What was your average daytime energy this week?",
    options: [
      { label: "Very low", value: 1 },
      { label: "Low", value: 2 },
      { label: "Moderate", value: 3 },
      { label: "High", value: 4 },
      { label: "Very high", value: 5 },
    ],
  },
  focus_level: {
    id: "focus_level",
    prompt: "How easy is it to stay focused when tasks become demanding?",
    options: [
      { label: "Very hard", value: 1 },
      { label: "Hard", value: 2 },
      { label: "Manageable", value: 3 },
      { label: "Easy", value: 4 },
      { label: "Very easy", value: 5 },
    ],
  },
  stress_trigger: {
    id: "stress_trigger",
    prompt: "How often do sudden stress spikes interrupt your routine?",
    options: [
      { label: "Very often", value: 5 },
      { label: "Often", value: 4 },
      { label: "Sometimes", value: 3 },
      { label: "Rarely", value: 2 },
      { label: "Almost never", value: 1 },
    ],
  },
  social_support: {
    id: "social_support",
    prompt: "How supported do you feel by friends or family right now?",
    options: [
      { label: "Not supported", value: 1 },
      { label: "Slightly supported", value: 2 },
      { label: "Moderately supported", value: 3 },
      { label: "Well supported", value: 4 },
      { label: "Strongly supported", value: 5 },
    ],
  },
  mindfulness_minutes: {
    id: "mindfulness_minutes",
    prompt: "How many minutes did you spend on calming routines today?",
    options: [
      { label: "0 minutes", value: 1 },
      { label: "1-5 minutes", value: 2 },
      { label: "6-10 minutes", value: 3 },
      { label: "11-20 minutes", value: 4 },
      { label: "20+ minutes", value: 5 },
    ],
  },
};

const getStressLevel = (): StressLevel => {
  const cached = localStorage.getItem("vs_latest_prediction");
  if (!cached) return "medium";

  try {
    const parsed = JSON.parse(cached) as PredictionResult;
    return parsed.stress_level;
  } catch {
    return "medium";
  }
};

export default function Quiz() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const dynamicOrder = useMemo(() => {
    const sleepAnswer = answers.find((item) => item.id === "sleep_quality")?.value;
    const focusAnswer = answers.find((item) => item.id === "focus_level")?.value;

    const order = ["sleep_quality", "daily_energy", "focus_level"];

    if (typeof sleepAnswer === "number" && sleepAnswer <= 2) {
      order.push("stress_trigger");
    }

    if (typeof focusAnswer === "number" && focusAnswer <= 2) {
      order.push("social_support");
    }

    order.push("mindfulness_minutes");
    return order;
  }, [answers]);

  const currentQuestionId = dynamicOrder[answers.length];
  const currentQuestion = currentQuestionId ? questions[currentQuestionId] : null;
  const completed = !currentQuestion;

  const answerQuestion = (option: QuestionOption) => {
    if (!currentQuestion) return;

    setAnswers((previous) => [
      ...previous,
      {
        id: currentQuestion.id,
        label: option.label,
        value: option.value,
      },
    ]);
  };

  const submitQuiz = async () => {
    if (!token || !answers.length) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await api.submitQuiz(answers, getStressLevel(), token);
      setSuggestions(response.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="glass-panel rounded-3xl p-7">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Adaptive Quiz</p>
          <h1 className="mt-2 text-3xl font-semibold">AI Stress-Relief Quiz</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Questions adapt based on your answers and latest stress prediction.
          </p>

          {!completed && (
            <div className="mt-7">
              <p className="text-sm text-muted-foreground">
                Question {answers.length + 1} of {dynamicOrder.length}
              </p>
              <h2 className="mt-2 text-xl font-medium">{currentQuestion?.prompt}</h2>

              <div className="mt-5 grid gap-3">
                {currentQuestion?.options.map((option) => (
                  <button
                    key={option.label}
                    className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-left text-sm transition hover:border-sky-400/60 hover:bg-sky-50 dark:hover:bg-sky-950/20"
                    onClick={() => answerQuestion(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {completed && !suggestions.length && (
            <div className="mt-8">
              <p className="text-sm text-muted-foreground">Quiz completed. Generate personalized recommendations.</p>
              <Button className="mt-4" variant="hero" onClick={submitQuiz} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Get AI Recommendations
              </Button>
            </div>
          )}

          {!!suggestions.length && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold">Personalized Suggestions</h3>
              <div className="mt-4 grid gap-3">
                {suggestions.map((suggestion) => (
                  <div key={suggestion} className="rounded-2xl bg-secondary/70 p-4 text-sm">
                    {suggestion}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button variant="hero" onClick={() => navigate("/wellness")}>Open Wellness</Button>
                <Button variant="glass" onClick={() => navigate("/analysis")}>New Voice Check</Button>
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </section>
      </main>
    </div>
  );
}