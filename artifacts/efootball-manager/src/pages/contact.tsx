import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, MessageSquare, Send, Loader2,
  CheckCircle2, AlertCircle, User, Mail, FileText, AlignLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const SUBJECTS = [
  "Account & Billing",
  "Tournament Help",
  "Technical Issue",
  "Feature Request",
  "Other",
];

export default function Contact() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const finalSubject = subject === "Other" ? customSubject.trim() : subject;
    if (!finalSubject) { setError("Please choose or enter a subject."); return; }
    if (message.trim().length < 10) { setError("Message must be at least 10 characters."); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/inquiries`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: finalSubject,
          message: message.trim(),
        }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Failed to send. Please try again.");
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Submit an Inquiry</h1>
          <p className="text-zinc-500 text-sm">We'll get back to you as soon as possible.</p>
        </div>
      </div>

      {sent ? (
        /* ─── Success state ─── */
        <div className="glass-card rounded-2xl border border-white/8 p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display font-bold text-xl text-white mb-2">Inquiry Sent!</h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
            Your message has been received. The admin will review it and get back to you at <span className="text-white">{email}</span>.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setSent(false); setMessage(""); setSubject(""); setCustomSubject(""); }}
              className="border-white/10 text-zinc-400 bg-transparent hover:text-white">
              Send another
            </Button>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-primary-glow">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* ─── Form ─── */
        <div className="glass-card rounded-2xl border border-white/8 p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm font-medium">Your Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your name" required
                    className="pl-10 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="pl-10 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-600" />
                </div>
              </div>
            </div>

            {/* Subject pills */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm font-medium">Subject</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <button key={s} type="button" onClick={() => setSubject(s)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm border transition-all font-medium",
                      subject === s
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-zinc-900/40 border-white/8 text-zinc-400 hover:text-white hover:border-white/20"
                    )}>
                    {s}
                  </button>
                ))}
              </div>
              {subject === "Other" && (
                <div className="relative mt-2">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input value={customSubject} onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Describe your subject…"
                    className="pl-10 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-600" />
                </div>
              )}
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm font-medium flex items-center justify-between">
                <span>Message</span>
                <span className={cn("text-xs", message.length >= 10 ? "text-zinc-600" : "text-zinc-700")}>
                  {message.length} chars
                </span>
              </Label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5}
                  placeholder="Describe your inquiry in detail…" required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/60 border border-white/10 text-white text-sm placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-primary-glow">
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending…</>
                : <><Send className="w-4 h-4 mr-2" />Send Inquiry</>
              }
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
