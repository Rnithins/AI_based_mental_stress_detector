import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Activity, LogOut, Menu, Mic, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/analysis", label: "Voice Analysis" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/results", label: "Results" },
  { to: "/quiz", label: "AI Quiz" },
  { to: "/wellness", label: "Wellness" },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 text-sm transition ${
    isActive
      ? "bg-white/70 text-slate-950 shadow-sm dark:bg-slate-900/70 dark:text-slate-50"
      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
  }`;

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-teal-400 text-white shadow-lg shadow-sky-300/40 dark:shadow-sky-900/40">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">VoiceStress AI</p>
            <p className="text-xs text-muted-foreground">Voice-based wellness intelligence</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1.5 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <span className="rounded-full bg-secondary/80 px-3 py-1 text-xs text-secondary-foreground">
                {user?.name}
              </span>
              <Button
                variant="glass"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/auth");
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button size="sm" variant="hero" onClick={() => navigate("/auth")}>Sign In</Button>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Button variant="glass" size="icon" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/50 bg-background/90 px-4 py-4 backdrop-blur-2xl lg:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            {isAuthenticated ? (
              <Button
                className="w-full"
                variant="glass"
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/auth");
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button className="w-full" variant="hero" onClick={() => navigate("/auth")}>
                <Mic className="h-4 w-4" />
                Sign In to Analyze
              </Button>
            )}
            <Button className="w-full" variant="glass" onClick={() => navigate("/wellness")}>
              <Sparkles className="h-4 w-4" />
              Wellness
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}