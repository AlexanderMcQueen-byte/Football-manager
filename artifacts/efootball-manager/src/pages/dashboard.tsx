import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListTournaments } from "@workspace/api-client-react";
import { format } from "date-fns";
import {
  Trophy, Plus, Calendar, Activity, ChevronRight,
  CheckCircle2, Crown, Search, X, SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { Input } from "@/components/ui/input";

type TypeFilter   = "all" | "league" | "knockout" | "cup" | "groups_knockout" | "double_elimination" | "swiss";
type StatusFilter = "all" | "active" | "setup" | "completed";

export default function Dashboard() {
  const { data: tournaments, isLoading } = useListTournaments();
  const { isPaid } = useAuth();

  const [query, setQuery]           = useState("");
  const [typeF, setTypeF]           = useState<TypeFilter>("all");
  const [statusF, setStatusF]       = useState<StatusFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    if (!tournaments) return [];
    const q = query.toLowerCase().trim();
    return tournaments.filter((t) => {
      if (q && !t.name.toLowerCase().includes(q)) return false;
      if (typeF   !== "all" && t.type   !== typeF)   return false;
      if (statusF !== "all" && t.status !== statusF) return false;
      return true;
    });
  }, [tournaments, query, typeF, statusF]);

  const active   = filtered.filter((t) => t.status !== "completed");
  const finished = filtered.filter((t) => t.status === "completed");

  const hasFilter = query || typeF !== "all" || statusF !== "all";

  function clearAll() {
    setQuery("");
    setTypeF("all");
    setStatusF("all");
  }

  return (
    <div className="space-y-8 pb-12">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <header className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 rounded-none overflow-visible min-h-[510px] flex items-center">
        <img
          src={`${import.meta.env.BASE_URL}images/soccer-theme/bg_3.jpg`}
          alt="Football match ball in the net"
          className="absolute inset-0 w-full h-full object-cover object-[35%_center]"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 pt-24 md:pt-32">
          <div className="max-w-xl ml-auto text-left">
            <p className="text-primary font-gaming font-bold text-xs tracking-[0.35em] uppercase mb-4">⚽ Football Manager · Live Event</p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-black text-white leading-[0.95] drop-shadow-lg soccer-theme-heading">
              Match Day<br />Control Room
            </h1>
            <p className="text-white/75 mt-5 text-sm sm:text-base max-w-md leading-relaxed">
              Organize your next tournament, follow every fixture, and keep your league moving from kickoff to final whistle.
            </p>

            <div className="flex items-start gap-5 sm:gap-8 mt-7 mb-7">
              <div>
                <span className="block text-3xl sm:text-4xl font-display font-bold text-white">06</span>
                <span className="text-[10px] text-white/60 uppercase tracking-widest">Active</span>
              </div>
              <div>
                <span className="block text-3xl sm:text-4xl font-display font-bold text-white">03</span>
                <span className="text-[10px] text-white/60 uppercase tracking-widest">Finished</span>
              </div>
              <div>
                <span className="block text-3xl sm:text-4xl font-display font-bold text-white">LIVE</span>
                <span className="text-[10px] text-white/60 uppercase tracking-widest">Season</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isPaid ? (
                <Link href="/tournaments/new">
                  <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-none transition-all hover:translate-y-[-2px] shadow-[0_0_20px_hsl(var(--primary)/0.35)]">
                    <Plus className="w-5 h-5" />
                    Create Tournament
                  </button>
                </Link>
              ) : (
                <Link href="/pricing">
                  <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-none transition-all hover:translate-y-[-2px] shadow-[0_0_20px_hsl(var(--primary)/0.35)]">
                    <Crown className="w-4 h-4" />
                    Upgrade to Create
                  </button>
                </Link>
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-white border border-white/60 px-4 py-2.5">
                Explore fixtures
              </span>
            </div>
          </div>
        </div>

        <div className="soccer-matchup absolute z-20 -bottom-14 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-6rem)] max-w-4xl">
          <div className="soccer-matchup-team soccer-matchup-dark">
            <img src={`${import.meta.env.BASE_URL}images/soccer-theme/logo_1.png`} alt="" />
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/50">Next tournament</span>
              <strong>Football League</strong>
            </div>
          </div>
          <div className="soccer-matchup-vs">
            <span>VS</span>
            <small>WORLD CUP EVENT</small>
          </div>
          <div className="soccer-matchup-team soccer-matchup-pink">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-[0.25em] text-black/50">Match day</span>
              <strong>Soccer Manager</strong>
            </div>
            <img src={`${import.meta.env.BASE_URL}images/soccer-theme/logo_2.png`} alt="" />
          </div>
        </div>
      </header>

      {/* ── Search & Filters ─────────────────────────────────────────────── */}
      <div className="pt-16">
      {!isLoading && !!tournaments?.length && (
        <div className="space-y-3">
          {/* Search row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tournaments…"
                className="pl-10 pr-10 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-600 h-11"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 h-11 rounded-xl border text-sm font-medium transition-all",
                showFilters || (typeF !== "all" || statusF !== "all")
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {(typeF !== "all" || statusF !== "all") && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {(typeF !== "all" ? 1 : 0) + (statusF !== "all" ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filter pills */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-card rounded-xl border border-white/8 p-4 space-y-3">
                  {/* Type */}
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider w-14 shrink-0">Type</span>
                    <div className="flex gap-2 flex-wrap">
                      {(["all", "league", "knockout", "cup", "groups_knockout", "double_elimination", "swiss"] as TypeFilter[]).map((f) => (
                        <button key={f} onClick={() => setTypeF(f)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs border font-medium capitalize transition-all",
                            typeF === f
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-zinc-900/40 border-white/8 text-zinc-400 hover:text-white hover:border-white/20"
                          )}>
                          {f === "all" ? "All Types" : f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider w-14 shrink-0">Status</span>
                    <div className="flex gap-2 flex-wrap">
                      {(["all", "active", "setup", "completed"] as StatusFilter[]).map((f) => (
                        <button key={f} onClick={() => setStatusF(f)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs border font-medium capitalize transition-all",
                            statusF === f
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-zinc-900/40 border-white/8 text-zinc-400 hover:text-white hover:border-white/20"
                          )}>
                          {f === "all" ? "All Statuses" : f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter summary + clear */}
          {hasFilter && (
            <div className="flex items-center justify-between">
              <p className="text-zinc-500 text-sm">
                Showing <span className="text-white font-semibold">{filtered.length}</span> of{" "}
                <span className="text-white font-semibold">{tournaments?.length ?? 0}</span> tournaments
              </p>
              <button onClick={clearAll} className="text-xs text-zinc-500 hover:text-primary transition-colors flex items-center gap-1">
                <X className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-48 rounded-2xl animate-pulse bg-white/5" />
          ))}
        </div>
      ) : !tournaments?.length ? (
        <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-white/10">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-zinc-500" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white mb-2">No Tournaments Yet</h3>
          <p className="text-zinc-400 max-w-md mx-auto mb-8">
            Create your first league or knockout tournament to start tracking matches and standings.
          </p>
          <Link href="/tournaments/new">
            <button className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-colors border border-white/10">
              Get Started
            </button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        /* No search results */
        <div className="glass-card rounded-2xl p-12 text-center border border-white/8">
          <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="font-display font-bold text-white text-lg mb-1">No tournaments found</h3>
          <p className="text-zinc-500 text-sm mb-4">Try a different name or adjust your filters.</p>
          <button onClick={clearAll} className="text-sm text-primary hover:underline">Clear search & filters</button>
        </div>
      ) : (
        <>
          {/* Active / Setup */}
          {active.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-white text-lg">Active Tournaments</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-gaming font-bold border border-primary/20">
                  {active.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {active.map((t, idx) => <TournamentCard key={t.id} tournament={t} idx={idx} />)}
              </div>
            </section>
          )}

          {/* Finished */}
          {finished.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                <h2 className="font-display font-bold text-white text-lg">Finished Tournaments</h2>
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-gaming font-bold border border-yellow-500/20">
                  {finished.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {finished.map((t, idx) => <TournamentCard key={t.id} tournament={t} idx={idx} finished />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function TournamentCard({ tournament, idx, finished = false }: {
  tournament: { id: number; name: string; type: string; status: string; createdAt: Date | string; scheduledAt?: Date | string | null };
  idx: number;
  finished?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
    >
      <Link href={`/tournaments/${tournament.id}`}>
        <div className={cn(
          "glass-card rounded-2xl p-6 group cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden",
          finished
            ? "hover:border-yellow-500/30 hover:shadow-[0_8px_30px_rgba(234,179,8,0.08)] opacity-80 hover:opacity-100"
            : "hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(238,30,70,0.16)]"
        )}>
          <div className={cn(
            "absolute -right-12 -top-12 w-32 h-32 rounded-full blur-2xl transition-colors",
            finished ? "bg-yellow-500/5 group-hover:bg-yellow-500/10" : "bg-primary/5 group-hover:bg-primary/10"
          )} />

          {finished && <div className="absolute top-3 right-3 text-lg">🏆</div>}

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={cn(
              "px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider whitespace-nowrap",
              tournament.type === "league"            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
              tournament.type === "knockout"          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
              tournament.type === "cup"               ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
              tournament.type === "groups_knockout"   ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
              tournament.type === "double_elimination"? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
              tournament.type === "swiss"             ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" :
                                                        "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
            )}>
              {tournament.type === "groups_knockout"    ? "Groups+KO"
               : tournament.type === "double_elimination" ? "Double Elim"
               : tournament.type === "swiss"              ? "Swiss"
               : tournament.type}
            </div>
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md",
              tournament.status === "active"    ? "bg-green-500/10 text-green-400" :
              tournament.status === "completed" ? "bg-yellow-500/10 text-yellow-400" :
                                                  "bg-zinc-500/10 text-zinc-400"
            )}>
              <Activity className="w-3 h-3" />
              {tournament.status === "completed" ? "Finished" : tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
            </div>
          </div>

          <h3 className="text-xl font-display font-bold text-white mb-4 line-clamp-1 relative z-10">
            {tournament.name}
          </h3>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 relative z-10">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>
                {tournament.scheduledAt
                  ? format(new Date(tournament.scheduledAt), "MMM d, yyyy")
                  : format(new Date(tournament.createdAt), "MMM d, yyyy")}
              </span>
            </div>
            <div className={cn(
              "w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-colors",
              finished
                ? "group-hover:bg-yellow-500 group-hover:text-black"
                : "group-hover:bg-primary group-hover:text-primary-foreground"
            )}>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
