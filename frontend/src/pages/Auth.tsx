import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname ?? "/analysis";

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      if (isRegister) {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto flex max-w-7xl items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="glass-panel w-full max-w-md rounded-3xl p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Secure Access</p>
          <h1 className="mt-2 text-3xl font-semibold">{isRegister ? "Create account" : "Welcome back"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegister
              ? "Sign up to track stress trends and wellness progress."
              : "Login to analyze voice stress and view historical insights."}
          </p>

          <div className="mt-6 flex gap-2 rounded-full bg-secondary/80 p-1">
            <button
              className={`flex-1 rounded-full px-4 py-2 text-sm ${
                !isRegister ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
              onClick={() => setIsRegister(false)}
              type="button"
            >
              Login
            </button>
            <button
              className={`flex-1 rounded-full px-4 py-2 text-sm ${
                isRegister ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
              onClick={() => setIsRegister(true)}
              type="button"
            >
              Register
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {isRegister && (
              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">Full name</span>
                <input
                  className="w-full rounded-2xl border border-border bg-background/80 px-4 py-2.5"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
            )}

            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Email</span>
              <input
                type="email"
                className="w-full rounded-2xl border border-border bg-background/80 px-4 py-2.5"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Password</span>
              <input
                type="password"
                className="w-full rounded-2xl border border-border bg-background/80 px-4 py-2.5"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button className="w-full" size="lg" variant="hero" disabled={busy}>
              {busy ? "Please wait..." : isRegister ? "Create account" : "Login"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}