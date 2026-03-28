import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Gamepad2, Lock, User, Eye, EyeOff, AlertCircle, Mail, Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LoginMode = "user" | "admin";

export default function Login() {
  const { loginAdmin, loginUser } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<LoginMode>("user");

  const [email, setEmail] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "admin") {
        const ok = await loginAdmin(adminUsername.trim(), password);
        if (ok) { navigate("/"); } else { setError("Invalid admin credentials."); }
      } else {
        const result = await loginUser(email.trim(), password);
        if (result.ok) { navigate("/"); } else { setError(result.error ?? "Login failed."); }
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-xl shadow-primary/30 mb-4">
            <Gamepad2 className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">FOOTBALL</h1>
          <span className="font-gaming text-primary font-semibold tracking-widest text-sm mt-0.5">MANAGER</span>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {/* Mode tabs */}
          <div className="flex rounded-xl bg-zinc-900/60 border border-white/5 p-1 mb-6 gap-1">
            {(["user", "admin"] as LoginMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all",
                  mode === m ? "bg-primary text-primary-foreground shadow" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {m === "user" ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                {m === "user" ? "Player" : "Admin"}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <h2 className="font-display font-bold text-xl text-white mb-1">
              {mode === "user" ? "Welcome Back" : "Admin Login"}
            </h2>
            <p className="text-zinc-400 text-sm">
              {mode === "user" ? "Sign in to your player account." : "Sign in to manage tournaments."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "user" ? (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 bg-input border-border text-white placeholder:text-zinc-600"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-zinc-300 text-sm font-medium">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="username"
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    className="pl-10 bg-input border-border text-white placeholder:text-zinc-600"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-input border-border text-white placeholder:text-zinc-600"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-primary-glow mt-2"
            >
              {isLoading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          {mode === "user" && (
            <div className="mt-6 pt-5 border-t border-white/5 text-center space-y-2">
              <p className="text-zinc-500 text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">Sign up free</Link>
              </p>
              <p className="text-zinc-700 text-xs">
                <a href="/" className="hover:text-zinc-500 transition-colors">Browse as viewer</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
