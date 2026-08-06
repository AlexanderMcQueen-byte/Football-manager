import { useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2, Zap, Crown, Infinity, ArrowLeft,
  AlertCircle, Lock, X, Send, Mail,
} from "lucide-react";
import { useAuth, type Plan } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "phinalex66@gmail.com";

interface PricingTier {
  id: Plan;
  label: string;
  price: string;
  period: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  btnClass: string;
  perks: string[];
  badge?: string;
}

const tiers: PricingTier[] = [
  {
    id: "free",
    label: "Free",
    price: "$0",
    period: "forever",
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "text-zinc-400",
    bgColor: "bg-zinc-900/40",
    borderColor: "border-zinc-700/40",
    btnClass: "",
    perks: [
      "Register for any tournament",
      "View live standings & brackets",
      "Follow match results in real time",
    ],
  },
  {
    id: "monthly",
    label: "Monthly",
    price: "$2",
    period: "/ month",
    icon: <Zap className="w-5 h-5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-900/10",
    borderColor: "border-blue-500/30",
    btnClass: "bg-blue-600 hover:bg-blue-500 text-white",
    perks: [
      "Everything in Free",
      "Create & manage tournaments",
      "Unlimited player cap",
      "Manual player entry",
      "Registration management",
    ],
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "$7",
    period: "/ year",
    badge: "Best Value",
    icon: <Crown className="w-5 h-5" />,
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/30",
    btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground btn-primary-glow",
    perks: [
      "Everything in Monthly",
      "Save 71% vs monthly",
      "Priority support",
    ],
  },
  {
    id: "lifetime",
    label: "Lifetime",
    price: "$15",
    period: "one-time",
    icon: <Infinity className="w-5 h-5" />,
    color: "text-amber-400",
    bgColor: "bg-amber-900/10",
    borderColor: "border-amber-500/30",
    btnClass: "bg-amber-500 hover:bg-amber-400 text-black font-bold",
    perks: [
      "Everything in Yearly",
      "Pay once, keep forever",
      "All future features included",
    ],
  },
];

// ─── Request modal ────────────────────────────────────────────────────────────
function RequestModal({
  tier,
  userEmail,
  userName,
  onClose,
}: {
  tier: PricingTier;
  userEmail: string;
  userName: string;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    const subject = encodeURIComponent(
      `Upgrade Request – ${tier.label} Plan (${tier.price}${tier.id !== "lifetime" ? tier.period : " one-time"})`
    );
    const body = encodeURIComponent(
      `Hi,\n\nI would like to request an upgrade to the ${tier.label} Plan (${tier.price}${tier.id !== "lifetime" ? tier.period : " one-time"}) on Football Manager.\n\nMy account details:\n- Name: ${userName}\n- Email: ${userEmail}\n\n${note ? `Additional notes:\n${note}\n\n` : ""}Please activate my plan at your earliest convenience.\n\nThank you,\n${userName}`
    );
    window.open(`mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md glass-card rounded-2xl p-7 border border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        {!sent ? (
          <>
            {/* Header */}
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-gaming font-bold tracking-wider uppercase mb-4 border",
              tier.bgColor, tier.borderColor, tier.color
            )}>
              {tier.icon}
              {tier.label} — {tier.price} {tier.period}
            </div>

            <h2 className="font-display font-bold text-xl text-white mb-1">Request Upgrade</h2>
            <p className="text-zinc-400 text-sm mb-5">
              Send a request to the admin. Your plan will be activated once approved.
            </p>

            {/* Pre-filled info */}
            <div className="space-y-3 mb-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Your Name</Label>
                <Input value={userName} disabled className="bg-zinc-900/60 border-white/10 text-zinc-400 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Your Email</Label>
                <Input value={userEmail} disabled className="bg-zinc-900/60 border-white/10 text-zinc-400 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Additional note (optional)</Label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any extra info for the admin..."
                  rows={3}
                  className="w-full rounded-lg bg-zinc-900/60 border border-white/10 text-white text-sm placeholder:text-zinc-600 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>

            <Button
              onClick={handleSend}
              className={cn("w-full font-semibold", tier.btnClass)}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Request to Admin
            </Button>

            <p className="text-zinc-700 text-xs text-center mt-3">
              Opens your email app pre-filled and ready to send
            </p>
          </>
        ) : (
          /* Sent confirmation */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-2">Request Sent!</h2>
            <p className="text-zinc-400 text-sm mb-1">
              Your upgrade request for the <span className={cn("font-semibold", tier.color)}>{tier.label} plan</span> has been sent to the admin.
            </p>
            <p className="text-zinc-600 text-xs mb-6">
              The admin will activate your plan and notify you at <span className="text-zinc-400">{userEmail}</span>.
            </p>
            <Button variant="outline" onClick={onClose} className="border-white/10 text-zinc-400 hover:text-white bg-transparent">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pricing page ─────────────────────────────────────────────────────────────
export default function Pricing() {
  const { user, plan, isLoggedIn } = useAuth();
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

  const currentPlan = plan ?? "free";

  function handleSelect(tier: PricingTier) {
    if (tier.id === "free" || tier.id === currentPlan) return;
    setSelectedTier(tier);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/4 rounded-full blur-[140px]" />
      </div>

      {selectedTier && user && (
        <RequestModal
          tier={selectedTier}
          userEmail={user.email}
          userName={user.displayName}
          onClose={() => setSelectedTier(null)}
        />
      )}

      <div className="relative max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-gaming font-semibold tracking-wider uppercase mb-4">
            <Crown className="w-3.5 h-3.5" />
            Upgrade Your Plan
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Create Tournaments.<br />Manage Your League.
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Free accounts can register for tournaments. Upgrade to create and manage your own.
          </p>
          {user && (
            <p className="mt-3 text-sm text-zinc-600">
              Signed in as <span className="text-zinc-400 font-medium">{user.displayName}</span>
              {" · "}Current plan:{" "}
              <span className={cn("font-semibold", currentPlan !== "free" ? "text-primary" : "text-zinc-500")}>
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </span>
            </p>
          )}
          {!isLoggedIn && (
            <p className="mt-3 text-sm text-zinc-500">
              <Link href="/signup" className="text-primary hover:underline">Create a free account</Link>{" "}then request an upgrade.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => {
            const isCurrent = tier.id === currentPlan;

            return (
              <div
                key={tier.id}
                className={cn(
                  "relative rounded-2xl p-6 border transition-all flex flex-col",
                  tier.bgColor, tier.borderColor,
                  isCurrent && "ring-1 ring-primary/40 shadow-lg shadow-primary/10",
                  tier.id === "yearly" && "lg:scale-105 z-10"
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold font-gaming tracking-wider shadow-lg shadow-primary/30">
                    {tier.badge}
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-zinc-700 text-zinc-300 text-xs font-semibold">
                    Current
                  </div>
                )}

                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 border", tier.bgColor, tier.color, tier.borderColor)}>
                  {tier.icon}
                </div>

                <div className="mb-1">
                  <span className={cn("font-display font-bold text-2xl", tier.color)}>{tier.price}</span>
                  <span className="text-zinc-500 text-sm ml-1">{tier.period}</span>
                </div>
                <p className="font-gaming font-bold text-white tracking-wide mb-4">{tier.label}</p>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <CheckCircle2 className={cn("w-4 h-4 shrink-0 mt-0.5", tier.color)} />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                {tier.id === "free" ? (
                  !isLoggedIn ? (
                    <Link href="/login">
                      <Button variant="outline" className="w-full border-white/10 text-zinc-400 bg-transparent hover:text-white">
                        Sign In
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" disabled className="w-full border-zinc-700 text-zinc-500 bg-transparent">
                      {isCurrent ? "Your Current Plan" : "Free Plan"}
                    </Button>
                  )
                ) : isCurrent ? (
                  <Button variant="outline" disabled className="w-full border-primary/30 text-primary/60 bg-transparent">
                    Active Plan ✓
                  </Button>
                ) : !isLoggedIn ? (
                  <Link href="/login">
                    <Button variant="outline" className="w-full border-white/10 text-zinc-400 bg-transparent hover:text-white">
                      <Lock className="w-4 h-4 mr-2" />Sign In First
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => handleSelect(tier)}
                    className={cn("w-full font-semibold", tier.btnClass)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Request Upgrade
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-zinc-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Upgrades are activated manually by the admin after your request is received.
          </p>
        </div>
      </div>
    </div>
  );
}
