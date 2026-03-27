import type {
  AuthResponse,
  AudioUploadResponse,
  HistoryItem,
  PredictionResult,
  QuizAnswer,
  QuoteItem,
  StressLevel,
} from "@/types/api";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
const BACKEND_ORIGIN = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;

const buildUrl = (path: string) => `${API_BASE}${path}`;

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.message ?? payload?.detail ?? "Request failed";
    throw new Error(message);
  }

  return payload as T;
};

const request = async <T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> => {
  const headers = new Headers(options.headers ?? {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  return parseResponse<T>(response);
};

export const resolveAssetUrl = (fileUrl: string): string => {
  if (fileUrl.startsWith("http")) return fileUrl;
  return `${BACKEND_ORIGIN}${fileUrl}`;
};

export const api = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  uploadAudio: (file: File, token: string, durationSeconds?: number) => {
    const form = new FormData();
    form.append("audio", file);
    if (durationSeconds) {
      form.append("duration_seconds", `${durationSeconds}`);
    }

    return request<AudioUploadResponse>(
      "/audio/upload",
      {
        method: "POST",
        body: form,
      },
      token,
    );
  },

  predict: (audioRecordId: string, token: string) =>
    request<PredictionResult>(
      "/predict",
      {
        method: "POST",
        body: JSON.stringify({ audioRecordId }),
      },
      token,
    ),

  getHistory: (token: string) => request<{ items: HistoryItem[] }>("/history", {}, token),

  submitQuiz: (answers: QuizAnswer[], stressLevel: StressLevel, token: string) =>
    request<{ id: string; suggestions: string[]; createdAt: string }>(
      "/quiz",
      {
        method: "POST",
        body: JSON.stringify({ answers, stress_level: stressLevel }),
      },
      token,
    ),

  getQuotes: (stressLevel: StressLevel, limit = 3) =>
    request<{ items: QuoteItem[] }>(
      `/quotes?stressLevel=${stressLevel}&limit=${limit}`,
      { method: "GET" },
    ),
};
