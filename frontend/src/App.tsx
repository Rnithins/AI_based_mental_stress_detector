import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import VoiceAnalysis from "@/pages/VoiceAnalysis";
import Results from "@/pages/Results";
import Quiz from "@/pages/Quiz";
import Wellness from "@/pages/Wellness";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: ReactNode }) => <RequireAuth>{children}</RequireAuth>;

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/analysis"
                element={
                  <Protected>
                    <VoiceAnalysis />
                  </Protected>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <Protected>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/results"
                element={
                  <Protected>
                    <Results />
                  </Protected>
                }
              />
              <Route
                path="/quiz"
                element={
                  <Protected>
                    <Quiz />
                  </Protected>
                }
              />
              <Route
                path="/wellness"
                element={
                  <Protected>
                    <Wellness />
                  </Protected>
                }
              />
              <Route path="/record" element={<Navigate to="/analysis" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
