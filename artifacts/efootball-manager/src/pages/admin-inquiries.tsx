import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  MessageSquare, ArrowLeft, ShieldCheck, Loader2,
  AlertCircle, CheckCircle2, Clock, Search, ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Status = "open" | "resolved";

interface Inquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: Status;
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
      status === "open"
        ? "bg-amber-900/20 border-amber-500/20 text-amber-400"
        : "bg-primary/10 border-primary/20 text-primary"
    )}>
      {status === "open"
        ? <Clock className="w-3 h-3" />
        : <CheckCircle2 className="w-3 h-3" />}
      {status === "open" ? "Open" : "Resolved"}
    </span>
  );
}

function InquiryRow({ inquiry, onUpdate }: { inquiry: Inquiry; onUpdate: (updated: Inquiry) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(inquiry.adminNote ?? "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleResolve() {
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/admin/inquiries/${inquiry.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved", adminNote: note }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        toast({ title: "Marked as resolved" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleReopen() {
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/admin/inquiries/${inquiry.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "open" }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        toast({ title: "Reopened" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/admin/inquiries/${inquiry.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: note }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        toast({ title: "Note saved" });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cn("border-b border-white/5 last:border-0 transition-colors", expanded ? "bg-white/[0.02]" : "")}>
      {/* Summary row */}
      <button className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-0.5">
            <p className="font-medium text-sm text-white truncate">{inquiry.subject}</p>
            <StatusBadge status={inquiry.status} />
          </div>
          <p className="text-zinc-500 text-xs">
            {inquiry.name} · {inquiry.email} · {new Date(inquiry.createdAt).toLocaleDateString()}
          </p>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {/* Message */}
          <div className="rounded-xl bg-zinc-900/50 border border-white/8 p-4">
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Message</p>
            <p className="text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed">{inquiry.message}</p>
          </div>

          {/* Admin note */}
          <div className="space-y-2">
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Admin Note (internal)</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              placeholder="Add a private note…"
              className="w-full rounded-xl bg-zinc-900/60 border border-white/10 text-white text-sm placeholder:text-zinc-600 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50" />
            <Button size="sm" variant="outline" onClick={saveNote} disabled={saving}
              className="border-white/10 text-zinc-400 bg-transparent hover:text-white text-xs">
              Save note
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {inquiry.status === "open" ? (
              <Button size="sm" onClick={handleResolve} disabled={saving}
                className="bg-primary/90 hover:bg-primary text-primary-foreground text-xs">
                {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                Mark Resolved
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handleReopen} disabled={saving}
                className="border-amber-500/30 text-amber-400 bg-transparent hover:bg-amber-900/20 text-xs">
                Reopen
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminInquiries() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/");
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    async function fetchInquiries() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BASE}/api/admin/inquiries`, { credentials: "include" });
        const payload = await response.json().catch(() => null) as unknown;

        if (!response.ok) {
          const message =
            typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string"
              ? payload.error
              : "Could not load inquiries.";
          throw new Error(message);
        }

        if (!Array.isArray(payload)) {
          throw new Error("The inquiries response was not a list.");
        }

        if (!cancelled) setInquiries(payload as Inquiry[]);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load inquiries.");
          setInquiries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchInquiries();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  function handleUpdate(updated: Inquiry) {
    setInquiries((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  const filtered = inquiries.filter((i) => {
    if (filter !== "all" && i.status !== filter) return false;
    const q = search.toLowerCase();
    return !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q)
      || i.subject.toLowerCase().includes(q) || i.message.toLowerCase().includes(q);
  });

  const openCount = inquiries.filter((i) => i.status === "open").length;
  const resolvedCount = inquiries.filter((i) => i.status === "resolved").length;

  if (authLoading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Inquiries</h1>
            <p className="text-zinc-500 text-sm">Messages submitted by users</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-gaming font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Only
          </div>
        </div>
      </div>

      {/* Stats + filters */}
      <div className="flex flex-wrap items-center gap-3">
        {(["all", "open", "resolved"] as const).map((f) => {
          const count = f === "all" ? inquiries.length : f === "open" ? openCount : resolvedCount;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm border transition-all font-medium",
                filter === f
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-zinc-900/40 border-white/8 text-zinc-400 hover:text-white"
              )}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={cn("ml-2 text-xs px-1.5 py-0.5 rounded-full",
                filter === f ? "bg-primary/20 text-primary" : "bg-zinc-800 text-zinc-500")}>
                {count}
              </span>
            </button>
          );
        })}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-52 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-600 text-sm" />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-500 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" /><span>Loading inquiries…</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          {inquiries.length === 0 ? "No inquiries yet." : "No inquiries match your filter."}
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5">
          {filtered.map((inq) => (
            <InquiryRow key={inq.id} inquiry={inq} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
