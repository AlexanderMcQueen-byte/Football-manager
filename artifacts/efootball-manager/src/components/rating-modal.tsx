import { useState } from "react";
import { Star, X, Send, Loader2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface RatingModalProps {
  onDone: () => void;
}

export function RatingModal({ onDone }: RatingModalProps) {
  const [phase, setPhase] = useState<"ask" | "rating" | "thanks">("ask");
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await fetch(`${BASE}/api/ratings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: selected, comment: comment.trim() || undefined }),
      });
    } catch {
      // silent — rating is best-effort
    } finally {
      setSubmitting(false);
      setPhase("thanks");
    }
  }

  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-sm glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

        {/* ─── Ask phase ─── */}
        {phase === "ask" && (
          <div className="p-7 text-center">
            <button onClick={onDone} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Star className="w-7 h-7 text-primary fill-primary/30" />
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-2">Welcome aboard! 🎉</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Your account is ready. Would you like to rate your experience so far?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onDone}
                className="flex-1 border-white/10 text-zinc-400 bg-transparent hover:text-white hover:bg-white/5"
              >
                Later
              </Button>
              <Button
                onClick={() => setPhase("rating")}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-primary-glow"
              >
                Rate Now
              </Button>
            </div>
          </div>
        )}

        {/* ─── Rating phase ─── */}
        {phase === "rating" && (
          <div className="p-7">
            <button onClick={onDone} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-display font-bold text-xl text-white mb-1 text-center">Rate your experience</h2>
            <p className="text-zinc-500 text-sm text-center mb-6">How would you rate Football Manager?</p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(n)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={cn(
                      "w-9 h-9 transition-colors",
                      n <= (hovered || selected)
                        ? "text-amber-400 fill-amber-400"
                        : "text-zinc-700 fill-zinc-800"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Label */}
            <p className={cn(
              "text-center text-sm font-semibold mb-5 h-5 transition-colors",
              selected ? "text-amber-400" : "text-zinc-600"
            )}>
              {labels[hovered || selected]}
            </p>

            {/* Optional comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any feedback? (optional)"
              rows={3}
              className="w-full rounded-xl bg-zinc-900/60 border border-white/10 text-white text-sm placeholder:text-zinc-600 px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 mb-4"
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onDone}
                className="flex-1 border-white/10 text-zinc-400 bg-transparent hover:text-white hover:bg-white/5"
              >
                Skip
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selected || submitting}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-primary-glow"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending…</>
                  : <><Send className="w-4 h-4 mr-2" />Submit</>
                }
              </Button>
            </div>
          </div>
        )}

        {/* ─── Thanks phase ─── */}
        {phase === "thanks" && (
          <div className="p-7 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-2">Thanks for your feedback!</h2>
            <p className="text-zinc-400 text-sm mb-6">Your rating helps us improve Football Manager.</p>
            <Button
              onClick={onDone}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-primary-glow"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
