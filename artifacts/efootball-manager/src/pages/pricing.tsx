import { useState } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle2, Zap, Crown, Infinity, ArrowLeft, Loader2, AlertCircle, Lock } from "lucide-react";
import { useAuth, type Plan } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
    perks: [
      "Everything in Yearly",
      "Pay once, keep forever",
      "All future features included",
    ],
  },
];

export default function Pricing() {
  const { user, plan, isLoggedIn, refreshUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(targetPlan: Plan) {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (targetPlan === "free") return;

    setUpgrading(targetPlan);
    setError(null);

    try {
      const res = await fetch(`${BASE}/api/users/upgrade`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });

      if (res.ok) {
        await refreshUser();
        toast({
          title: "Plan upgraded!",
          description: `You are now on the ${targetPlan} plan. You can now create tournaments.`,
        });
        navigate("/");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Upgrade failed. Please try again.");
      }
    } catch {
      setError("Could not reach server. Please try again.");
    } finally {
      setUpgrading(null);
    }
  }

  const currentPlan = plan ?? "free";

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
              {" · "}Current plan: <span className={cn("font-semibold", currentPlan !== "free" ? "text-primary" : "text-zinc-500")}>
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
            const isDowngrade = tier.id === "free" && currentPlan !== "free";
            const isUpgradeTarget = tier.id !== "free" && !isCurrent;

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

                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", tier.bgColor, tier.color, "border", tier.borderColor)}>
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
                  <Button
                    variant="outline"
                    disabled
                    className="w-full border-zinc-700 text-zinc-500 bg-transparent"
                  >
                    {isCurrent ? "Your Current Plan" : "Free Plan"}
                  </Button>
                ) : isCurrent ? (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full border-primary/30 text-primary/60 bg-transparent"
                  >
                    Active Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={!!upgrading}
                    className={cn(
                      "w-full font-semibold",
                      tier.id === "yearly"
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground btn-primary-glow"
                        : tier.id === "lifetime"
                        ? "bg-amber-500 hover:bg-amber-400 text-black"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    )}
                  >
                    {upgrading === tier.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing…</>
                    ) : !isLoggedIn ? (
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

        <p className="text-center text-zinc-700 text-xs mt-8">
          Payments are handled securely. You can cancel or change your plan at any time.
        </p>
      </div>
    </div>
  );
}
