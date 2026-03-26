import { Link } from "wouter";
import { useListTournaments } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Trophy, Plus, Calendar, Activity, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: tournaments, isLoading } = useListTournaments();

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <header className="relative rounded-3xl overflow-hidden min-h-[220px] flex items-end">
        <img
          src={`${import.meta.env.BASE_URL}images/stadium-hero.png`}
          alt="eFootball Stadium"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 w-full p-8">
          <div>
            <p className="text-primary font-gaming font-bold text-xs tracking-[0.3em] uppercase mb-2">⚽ eFootball Manager</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white drop-shadow-lg">Dashboard</h1>
            <p className="text-zinc-300 mt-1 text-sm">Manage your active tournaments and leagues.</p>
          </div>
          <Link href="/tournaments/new">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.4)] shrink-0">
              <Plus className="w-5 h-5" />
              Create Tournament
            </button>
          </Link>
        </div>
      </header>

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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tournaments.map((tournament, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={tournament.id}
            >
              <Link href={`/tournaments/${tournament.id}`}>
                <div className="glass-card rounded-2xl p-6 group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider",
                      tournament.type === 'league' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    )}>
                      {tournament.type}
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md",
                      tournament.status === 'active' ? "bg-green-500/10 text-green-400" :
                      tournament.status === 'completed' ? "bg-zinc-500/10 text-zinc-400" :
                      "bg-yellow-500/10 text-yellow-400"
                    )}>
                      <Activity className="w-3 h-3" />
                      {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                    </div>
                  </div>

                  <h3 className="text-xl font-display font-bold text-white mb-4 line-clamp-1 relative z-10">
                    {tournament.name}
                  </h3>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(tournament.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
