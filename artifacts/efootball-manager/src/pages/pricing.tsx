import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  CheckCircle2, Zap, Crown, Infinity, ArrowLeft, Loader2,
  AlertCircle, Lock, ExternalLink, X, ShieldCheck,
} from "lucide-react";
import { useAuth, type Plan } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ─── PayPal config ────────────────────────────────────────────────────────────
const PAYPAL_EMAIL = "alexanderwachira136@gmail.com";

function paypalUrl(amount: string, itemName: string) {
  const params = new URLSearchParams({
    cmd: "_xclick",
    business: PAYPAL_EMAIL,
    amount,
    currency_code: "USD",
    item_name: itemName,
    no_shipping: "1",
  });
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
}

// ─── Plan definitions ─────────────────────────────────────────────────────────
interface PricingTier {
  id: Plan;
  label: string;
  price: string;
  amount: string;
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
    amount: "0",
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
    amount: "2.00",
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
    amount: "7.00",
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
    amount: "15.00",
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

// ─── Payment modal ────────────────────────────────────────────────────────────
function PaymentModal({
  tier,
  onClose,
  onConfirm,
  confirming,
}: {
  tier: PricingTier;
  onClose: () => void;
  onConfirm: () => void;
  confirming: boolean;
}) {
  const [hasPaid, setHasPaid] = useState(false);
  const ppUrl = paypalUrl(tier.amount, `Football Manager – ${tier.label} Plan`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-card rounded-2xl p-7 border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-gaming font-bold tracking-wider uppercase mb-4", tier.bgColor, `border ${tier.borderColor}`, tier.color)}>
          {tier.icon}
          {tier.label} Plan — {tier.price}{tier.id !== "lifetime" ? tier.period : " one-time"}
        </div>

        <h2 className="font-display font-bold text-xl text-white mb-1">Complete Your Upgrade</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Follow the two steps below to activate your plan instantly.
        </p>

        {/* Step 1 */}
        <div className={cn(
          "rounded-xl border p-4 mb-3 transition-all",
          hasPaid ? "border-primary/20 bg-primary/5 opacity-60" : "border-white/10 bg-white/[0.03]"
        )}>
          <div className="flex items-center gap-3 mb-3">
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0", hasPaid ? "bg-primary/20 text-primary" : "bg-zinc-700 text-white")}>
              {hasPaid ? <CheckCircle2 className="w-4 h-4" /> : "1"}
            </div>
            <p className="font-semibold text-white text-sm">Pay via PayPal</p>
          </div>
          <a
            href={ppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setTimeout(() => setHasPaid(true), 2000)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-sm transition-all shadow-lg"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.379 5.007-1.868 8.468-7.25 8.468h-1.9l-1.24 7.868h3.17c.46 0 .85-.331.92-.786l.038-.196 1.45-9.21.093-.508a.93.93 0 0 1 .92-.786h.58c3.74 0 6.67-1.52 7.52-5.913.357-1.83.172-3.355-.694-4.4z"/>
            </svg>
            Pay {tier.price} on PayPal
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
          <p className="text-zinc-600 text-xs text-center mt-2">Opens PayPal in a new tab — payment goes to the host</p>
        </div>

        {/* Step 2 */}
        <div className={cn(
          "rounded-xl border p-4 mb-5 transition-all",
          !hasPaid ? "border-white/5 bg-white/[0.02] opacity-50" : "border-white/10 bg-white/[0.03]"
        )}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-zinc-700 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
            <p className="font-semibold text-white text-sm">Confirm your payment</p>
          </div>
          <p className="text-zinc-500 text-xs mb-3">After your PayPal payment is complete, click below to activate your plan.</p>
          <Button
            onClick={onConfirm}
            disabled={!hasPaid || confirming}
            className={cn("w-full font-semibold", tier.btnClass, (!hasPaid || confirming) && "opacity-50 cursor-not-allowed")}
          >
            {confirming ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Activating…</>
            ) : (
              <><ShieldCheck className="w-4 h-4 mr-2" />I've Completed My Payment</>
            )}
          </Button>
        </div>

        <p className="text-zinc-700 text-xs text-center">
          Having trouble? Contact support with your PayPal receipt.
        </p>
      </div>
    </div>
  );
}

// ─── Pricing page ─────────────────────────────────────────────────────────────
export default function Pricing() {
  const { user, plan, isLoggedIn, refreshUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = plan ?? "free";

  function handleSelect(tier: PricingTier) {
    if (!isLoggedIn) { navigate("/login"); return; }
    if (tier.id === "free" || tier.id === currentPlan) return;
    setSelectedTier(tier);
    setError(null);
  }

  async function handleConfirm() {
    if (!selectedTier) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/api/users/upgrade`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedTier.id }),
      });

      if (res.ok) {
        await refreshUser();
        setSelectedTier(null);
        toast({
          title: "Plan activated! 🎉",
          description: `Welcome to the ${selectedTier.label} plan. You can now create tournaments.`,
        });
        navigate("/");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Activation failed. Please try again.");
        setSelectedTier(null);
      }
    } catch {
      setError("Could not reach server. Please try again.");
      setSelectedTier(null);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/4 rounded-full blur-[140px]" />
      </div>

      {/* Payment modal */}
      {selectedTier && (
        <PaymentModal
          tier={selectedTier}
          onClose={() => setSelectedTier(null)}
          onConfirm={handleConfirm}
          confirming={confirming}
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
              <Link href="/signup" className="text-primary hover:underline">Create a free account</Link>{" "}to get started.
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6 max-w-xl mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => {
            const isCurrent = tier.id === currentPlan;

            return (
              <div
                key={tier.id}
                className={cn(
                  "relative rounded-2xl p-6 border transition-all flex flex-col",
                  tier.bgColor,
                  tier.borderColor,
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
                  <Button variant="outline" disabled className="w-full border-zinc-700 text-zinc-500 bg-transparent">
                    {isCurrent ? "Your Current Plan" : "Free Plan"}
                  </Button>
                ) : isCurrent ? (
                  <Button variant="outline" disabled className="w-full border-primary/30 text-primary/60 bg-transparent">
                    Active Plan ✓
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSelect(tier)}
                    className={cn("w-full font-semibold", tier.btnClass)}
                  >
                    {!isLoggedIn ? (
                      <><Lock className="w-4 h-4 mr-2" />Sign In to Upgrade</>
                    ) : (
                      `Get ${tier.label}`
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-zinc-600 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Payments processed securely via PayPal — paid directly to the tournament host</span>
          </div>
        </div>
      </div>
    </div>
  );
}
