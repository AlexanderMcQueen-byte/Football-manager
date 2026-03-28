import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Gamepad2, Lock, Eye, EyeOff, AlertCircle, Mail,
  User, CheckCircle2, KeyRound, RefreshCw, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RatingModal } from "@/components/rating-modal";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Signup() {
  const { loginUser } = useAuth();
  const [, navigate] = useLocation();

  // Step 1 fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2
  const [code, setCode] = useState("");

  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRating, setShowRating] = useState(false);

  // ─── Step 1: send verification code ───────────────────────────────────────
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/users/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, displayName: displayName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        setError(data.error ?? "Failed to send verification code.");
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Step 2: verify code & create account ─────────────────────────────────
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.trim().length !== 6) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/users/verify-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowRating(true);
      } else {
        setError(data.error ?? "Verification failed.");
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Resend code
  async function handleResend() {
    setError(null);
    setCode("");
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/users/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, displayName: displayName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Failed to resend code.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setIsLoading(false);
    }
  }

  if (showRating) {
    return <RatingModal onDone={() => navigate("/")} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-xl shadow-primary/30 mb-4">
            <Gamepad2 className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">FOOTBALL</h1>
          <span className="font-gaming text-primary font-semibold tracking-widest text-sm mt-0.5">MANAGER</span>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-5">
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${step === 1 ? "bg-primary/10 border-primary/20 text-primary" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}>
              <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-bold">{step > 1 ? "✓" : "1"}</span>
              Your Info
            </div>
            <div className="flex-1 h-px bg-zinc-800" />
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${step === 2 ? "bg-primary/10 border-primary/20 text-primary" : "bg-zinc-800 border-zinc-700 text-zinc-500"}`}>
              <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-bold">2</span>
              Verify Email
            </div>
          </div>

          {/* ─── Step 1 ─── */}
          {step === 1 && (
            <>
              <div className="mb-5">
                <h2 className="font-display font-bold text-xl text-white mb-1">Create Account</h2>
                <p className="text-zinc-400 text-sm">Join for free — upgrade anytime to create tournaments.</p>
              </div>

              <div className="mb-5 p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-2">
                {[
                  "Register for any public tournament",
                  "View live standings & brackets",
                  "Follow match results in real time",
                ].map((perk) => (
                  <div key={perk} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="displayName" className="text-zinc-300 text-sm font-medium">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name" className="pl-10 bg-input border-border text-white placeholder:text-zinc-600" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" className="pl-10 bg-input border-border text-white placeholder:text-zinc-600"
                      autoComplete="email" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input id="password" type={showPassword ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                      className="pl-10 pr-10 bg-input border-border text-white placeholder:text-zinc-600"
                      autoComplete="new-password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors" tabIndex={-1}>
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

                <Button type="submit" disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-primary-glow mt-2">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending code…</> : "Continue →"}
                </Button>
              </form>
            </>
          )}

          {/* ─── Step 2 ─── */}
          {step === 2 && (
            <>
              <div className="mb-5">
                <h2 className="font-display font-bold text-xl text-white mb-1">Check your email</h2>
                <p className="text-zinc-400 text-sm">
                  We sent a 6-digit code to <span className="text-white font-medium">{email}</span>. Enter it below to confirm your account.
                </p>
              </div>

              <div className="mb-5 p-4 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-zinc-300">The code expires in <strong className="text-white">10 minutes</strong>. Check your spam folder if you don't see it.</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-zinc-300 text-sm font-medium">6-digit code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="pl-10 bg-input border-border text-white placeholder:text-zinc-600 text-center text-2xl tracking-[0.5em] font-bold"
                      autoComplete="one-time-code"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" disabled={isLoading || code.length !== 6}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-primary-glow">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying…</> : "Verify & Create Account"}
                </Button>

                <div className="flex items-center justify-between pt-1">
                  <button type="button" onClick={() => { setStep(1); setError(null); setCode(""); }}
                    className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
                    ← Change email
                  </button>
                  <button type="button" onClick={handleResend} disabled={isLoading}
                    className="flex items-center gap-1.5 text-primary hover:text-primary/80 text-xs transition-colors disabled:opacity-50">
                    <RefreshCw className="w-3 h-3" />
                    Resend code
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-zinc-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
