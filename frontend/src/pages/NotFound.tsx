import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
        <p className="rounded-full bg-secondary px-4 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you requested does not exist in VoiceStress AI.
        </p>
        <Button className="mt-8" variant="hero" onClick={() => navigate("/")}>Return Home</Button>
      </main>
    </div>
  );
}