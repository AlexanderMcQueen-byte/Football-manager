import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Users, ShieldCheck, Search, ArrowLeft, Loader2,
  CheckCircle2, AlertCircle, Zap, Crown, Infinity, User,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Plan = "free" | "monthly" | "yearly" | "lifetime";

interface AppUser {
  id: number;
  email: string;
  displayName: string;
  plan: Plan;
  planActivatedAt: string | null;
  createdAt: string;
}

const PLAN_OPTIONS: { value: Plan; label: string; color: string }[] = [
  { value: "free",     label: "Free",     color: "text-zinc-400" },
  { value: "monthly",  label: "Monthly",  color: "text-blue-400" },
  { value: "yearly",   label: "Yearly",   color: "text-primary" },
  { value: "lifetime", label: "Lifetime", color: "text-amber-400" },
];

function planIcon(plan: Plan) {
  if (plan === "monthly")  return <Zap className="w-3.5 h-3.5 text-blue-400" />;
  if (plan === "yearly")   return <Crown className="w-3.5 h-3.5 text-primary" />;
  if (plan === "lifetime") return <Infinity className="w-3.5 h-3.5 text-amber-400" />;
  return <User className="w-3.5 h-3.5 text-zinc-500" />;
}

function planBadgeClass(plan: Plan) {
  if (plan === "monthly")  return "bg-blue-900/20 border-blue-500/20 text-blue-400";
  if (plan === "yearly")   return "bg-primary/10 border-primary/20 text-primary";
  if (plan === "lifetime") return "bg-amber-900/20 border-amber-500/20 text-amber-400";
  return "bg-zinc-800/40 border-zinc-700/30 text-zinc-500";
}

export default function AdminUsers() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [upgrading, setUpgrading] = useState<number | null>(null);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/");
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [isAdmin]);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/api/admin/users`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load users");
      setUsers(await res.json());
    } catch {
      setError("Could not load users. Make sure you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  }

  async function changePlan(userId: number, plan: Plan) {
    setUpgrading(userId);
    try {
      const res = await fetch(`${BASE}/api/admin/users/${userId}/plan`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated: AppUser = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast({ title: "Plan updated", description: `${updated.displayName} → ${plan}` });
    } catch {
      toast({ title: "Error", description: "Could not update plan.", variant: "destructive" });
    } finally {
      setUpgrading(null);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.plan.toLowerCase().includes(q)
    );
  });

  // Stats
  const counts = {
    total: users.length,
    free: users.filter((u) => u.plan === "free").length,
    paid: users.filter((u) => u.plan !== "free").length,
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">User Management</h1>
            <p className="text-zinc-500 text-sm">View and upgrade user plans</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-gaming font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Only
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Users", value: counts.total, icon: <Users className="w-4 h-4" />, color: "text-zinc-300" },
          { label: "Free Plan",   value: counts.free,  icon: <User className="w-4 h-4" />, color: "text-zinc-400" },
          { label: "Paid Plans",  value: counts.paid,  icon: <CheckCircle2 className="w-4 h-4" />, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4 border border-white/8">
            <div className={cn("flex items-center gap-2 text-sm mb-1", s.color)}>
              {s.icon}
              <span>{s.label}</span>
            </div>
            <p className={cn("font-display font-bold text-2xl", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          placeholder="Search by name, email or plan…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-600"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-500 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading users…</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={fetchUsers} className="ml-auto text-destructive hover:text-destructive">
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          {search ? "No users match your search." : "No registered users yet."}
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-4 px-5 py-3 border-b border-white/5 text-zinc-600 text-xs font-gaming tracking-wider uppercase">
            <span>Name</span>
            <span>Email</span>
            <span>Plan</span>
            <span className="text-right">Change Plan</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                {/* Name */}
                <div>
                  <p className="font-medium text-sm text-white truncate">{u.displayName}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Email */}
                <p className="text-zinc-400 text-sm truncate">{u.email}</p>

                {/* Plan badge */}
                <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", planBadgeClass(u.plan))}>
                  {planIcon(u.plan)}
                  {u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                </div>

                {/* Change plan dropdown */}
                <div className="flex items-center gap-2 justify-end">
                  {upgrading === u.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <select
                      value={u.plan}
                      onChange={(e) => changePlan(u.id, e.target.value as Plan)}
                      className="bg-zinc-900 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                    >
                      {PLAN_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
