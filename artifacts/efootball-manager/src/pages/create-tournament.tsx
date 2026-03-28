import { useState } from "react";
import { useLocation } from "wouter";
import { useListPlayers, useCreateTournament } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Trophy, Swords, Users, Info, Lock, ClipboardList, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

export default function CreateTournament() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin, isPaid } = useAuth();

  const [name, setName] = useState("");
  const [type, setType] = useState<"league" | "knockout">("league");
  const [mode, setMode] = useState<"registration" | "manual">("registration");
  const [maxPlayers, setMaxPlayers] = useState<number>(8);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());

  const { data: players, isLoading: playersLoading } = useListPlayers();

  const { mutate: create, isPending } = useCreateTournament({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
        toast({ title: "Tournament created!" });
        setLocation(`/tournaments/${data.id}`);
      },
      onError: (err: any) => {
        toast({
          title: "Failed to create tournament",
          description: err.message || "Please check your inputs",
          variant: "destructive",
        });
      },
    },
  });

  if (!isPaid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
          <Lock className="w-8 h-8 text-zinc-500" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-white">Paid Plan Required</h2>
          <p className="text-zinc-500 text-sm mt-1 max-w-xs">You need a paid plan to create and manage tournaments. Upgrade from just $2/month.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setLocation("/pricing")}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            View Pricing
          </button>
          <button
            onClick={() => setLocation("/login")}
            className="px-5 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl font-semibold text-sm hover:bg-zinc-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const togglePlayer = (id: number) => {
    const newSet = new Set(selectedPlayers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedPlayers(newSet);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast({ title: "Name is required", variant: "destructive" });

    if (mode === "registration") {
      if (maxPlayers < 2) return toast({ title: "Player cap must be at least 2", variant: "destructive" });
      if (type === "knockout" && ![2, 4, 8, 16].includes(maxPlayers)) {
        return toast({
          title: "Invalid player cap for knockout",
          description: "Knockout requires exactly 2, 4, 8, or 16 players.",
          variant: "destructive",
        });
      }
      create({ data: { name, type, maxPlayers, playerIds: [] } });
    } else {
      if (selectedPlayers.size < 2) return toast({ title: "Select at least 2 players", variant: "destructive" });
      if (type === "knockout" && ![2, 4, 8, 16].includes(selectedPlayers.size)) {
        return toast({
          title: "Invalid player count",
          description: "Knockout tournaments require exactly 2, 4, 8, or 16 players.",
          variant: "destructive",
        });
      }
      create({ data: { name, type, playerIds: Array.from(selectedPlayers) } });
    }
  };

  const knockoutSizes = [2, 4, 8, 16];
  const isKnockoutSizeValid = type !== "knockout" || knockoutSizes.includes(maxPlayers);

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <header className="relative rounded-3xl overflow-hidden min-h-[160px] flex items-end mb-8">
        <img
          src={`${import.meta.env.BASE_URL}images/trophy-bg.png`}
          alt="Trophy background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20" />
        <div className="relative z-10 p-8 w-full">
          <p className="text-primary font-gaming font-bold text-xs tracking-[0.3em] uppercase mb-1">Create New</p>
          <h1 className="text-4xl font-display font-bold text-white drop-shadow-lg">New Tournament</h1>
          <p className="text-zinc-300 mt-1 text-sm">Set up the format and open registration or add players directly.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="glass-card rounded-2xl p-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Tournament Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Champions Cup 2025"
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white text-lg placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Format */}
        <div className="glass-card rounded-2xl p-6">
          <label className="block text-sm font-medium text-zinc-300 mb-4">Tournament Format</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType("league")}
              className={cn(
                "flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all",
                type === "league" ? "border-primary bg-primary/10" : "border-white/5 bg-black/20 hover:border-white/20"
              )}
            >
              <Trophy className={cn("w-12 h-12 mb-3", type === "league" ? "text-primary" : "text-zinc-500")} />
              <h3 className="text-lg font-bold text-white mb-1">League</h3>
              <p className="text-sm text-zinc-400">Round-robin. Everyone plays everyone. Points decide the winner.</p>
            </button>
            <button
              type="button"
              onClick={() => setType("knockout")}
              className={cn(
                "flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all",
                type === "knockout" ? "border-purple-500 bg-purple-500/10" : "border-white/5 bg-black/20 hover:border-white/20"
              )}
            >
              <Swords className={cn("w-12 h-12 mb-3", type === "knockout" ? "text-purple-500" : "text-zinc-500")} />
              <h3 className="text-lg font-bold text-white mb-1">Knockout</h3>
              <p className="text-sm text-zinc-400">Single elimination bracket. Lose and you're out. (2, 4, 8, or 16 players).</p>
            </button>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-white text-base">Player Setup Mode</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Choose how players join this tournament</p>
            </div>
            <button
              type="button"
              onClick={() => setMode(m => m === "registration" ? "manual" : "registration")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-all text-sm font-medium text-zinc-300"
            >
              {mode === "registration"
                ? <><ToggleRight className="w-5 h-5 text-primary" /> Registration</>
                : <><ToggleLeft className="w-5 h-5 text-zinc-500" /> Manual</>}
            </button>
          </div>

          {mode === "registration" ? (
            /* Registration mode */
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
                <ClipboardList className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-300">
                  The tournament will open for public registration. Once <span className="text-primary font-semibold">all spots are filled</span> and approved, fixtures are generated automatically.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Player Cap <span className="text-zinc-500 font-normal">(total players required)</span>
                </label>
                {type === "knockout" ? (
                  <div className="flex gap-3 flex-wrap">
                    {knockoutSizes.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setMaxPlayers(n)}
                        className={cn(
                          "w-16 h-16 rounded-xl border-2 font-gaming font-bold text-xl transition-all",
                          maxPlayers === n
                            ? "border-purple-500 bg-purple-500/15 text-white"
                            : "border-white/10 bg-black/20 text-zinc-500 hover:border-white/20"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min={2}
                      max={64}
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Math.max(2, parseInt(e.target.value) || 2))}
                      className="w-28 bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-lg font-gaming font-bold text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <span className="text-zinc-400 text-sm">players needed to start</span>
                  </div>
                )}
                {type === "knockout" && !isKnockoutSizeValid && (
                  <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
                    <Info className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-200">Knockout requires exactly 2, 4, 8, or 16 players.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Manual mode */
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Users className="w-4 h-4" /> Select Participants
                </label>
                <span className="text-sm font-gaming text-primary">{selectedPlayers.size} Selected</span>
              </div>

              {type === "knockout" && ![2, 4, 8, 16].includes(selectedPlayers.size) && selectedPlayers.size > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-200">
                    Knockout requires exactly 2, 4, 8, or 16 players. Currently: {selectedPlayers.size}.
                  </p>
                </div>
              )}

              {playersLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !players?.length ? (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  No players yet. Go to the Players page to add some first.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {players.map((player) => (
                    <button
                      type="button"
                      key={player.id}
                      onClick={() => togglePlayer(player.id)}
                      className={cn(
                        "px-4 py-3 rounded-xl border text-left transition-all",
                        selectedPlayers.has(player.id)
                          ? "bg-white/10 border-white/20 text-white shadow-inner"
                          : "bg-black/20 border-transparent text-zinc-400 hover:bg-white/5"
                      )}
                    >
                      <div className="font-semibold truncate">{player.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="px-6 py-3 rounded-xl font-medium text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || (mode === "manual" && selectedPlayers.size < 2) || (mode === "registration" && type === "knockout" && !isKnockoutSizeValid)}
            className="px-8 py-3 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary hover:to-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending
              ? "Creating..."
              : mode === "registration"
              ? `Create & Open Registration (${maxPlayers} players)`
              : "Create & Generate Fixtures"}
          </button>
        </div>
      </form>
    </div>
  );
}
