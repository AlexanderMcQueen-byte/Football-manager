import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2, Zap, Crown, Infinity, ArrowLeft,
  AlertCircle, Lock, Send,
} from "lucide-react";
import { useAuth, type Plan } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

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
    price: "₦2,000",
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
    price: "₦7,000",
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
    price: "₦15,000",
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

// ─── Pricing page ─────────────────────────────────────────────────────────────
export default function Pricing() {
  const { user, plan, isLoggedIn, refreshUser } = useAuth();
  const [isPaying, setIsPaying] = useState<Plan | null>(null);
  const [paymentMessage, setPaymentMessage] = useState("");

  const currentPlan = plan ?? "free";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) return;

    let cancelled = false;
    setPaymentMessage("Verifying your Paystack payment…");
    void fetch(`${BASE}/api/users/paystack/verify`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Payment verification failed.");
        if (!cancelled) {
          await refreshUser();
          setPaymentMessage("Payment confirmed. Your plan is now active.");
          window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.hash}`);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) setPaymentMessage(error instanceof Error ? error.message : "Payment verification failed.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSelect(tier: PricingTier) {
    if (tier.id === "free" || !isLoggedIn || isPaying) return;
    setIsPaying(tier.id);
    setPaymentMessage("");
    try {
      const callbackUrl = `${window.location.origin}${BASE}/pricing`;
      const response = await fetch(`${BASE}/api/users/paystack/initialize`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: tier.id, callbackUrl }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.authorizationUrl) {
        throw new Error(payload.error || "Could not start Paystack checkout.");
      }
      window.location.assign(payload.authorizationUrl);
    } catch (error: unknown) {
      setPaymentMessage(error instanceof Error ? error.message : "Could not start Paystack checkout.");
      setIsPaying(null);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/4 rounded-full blur-[140px]" />
      </div>

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
              <Link href="/signup" className="text-primary hover:underline">Create a free account</Link>{" "}then pay securely with Paystack.
            </p>
          )}
          {paymentMessage && (
            <p className="mt-3 text-sm text-primary">{paymentMessage}</p>
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
                    disabled={Boolean(isPaying)}
                    className={cn("w-full font-semibold", tier.btnClass)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isPaying === tier.id ? "Opening Paystack…" : "Pay with Paystack"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

         <div className="mt-8 flex flex-col items-center gap-2">
           <p className="text-zinc-600 text-xs flex items-center gap-2">
             <AlertCircle className="w-3.5 h-3.5" />
             Paystack verifies each payment before the plan is activated. Monthly and yearly plans expire automatically.
           </p>
           {user?.planExpiresAt && currentPlan !== "lifetime" && (
             <p className="text-zinc-500 text-xs">
               Current plan expires {new Date(user.planExpiresAt).toLocaleDateString()}.
             </p>
           )}
        </div>
      </div>
    </div>
  );
}
