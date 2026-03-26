import { useState } from "react";
import { useLocation } from "wouter";
import { useListPlayers, useCreateTournament } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Trophy, Swords, Users, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function CreateTournament() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [type, setType] = useState<"league" | "knockout">("league");
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());

  const { data: players, isLoading: playersLoading } = useListPlayers();
  
  const { mutate: create, isPending } = useCreateTournament({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
        toast({ title: "Tournament created successfully!" });
        setLocation(`/tournaments/${data.id}`);
      },
      onError: (err: any) => {
        toast({ 
          title: "Failed to create tournament", 
          description: err.message || "Please check your inputs",
          variant: "destructive" 
        });
      }
    }
  });

  const togglePlayer = (id: number) => {
    const newSet = new Set(selectedPlayers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedPlayers(newSet);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast({ title: "Name is required", variant: "destructive" });
    if (selectedPlayers.size < 2) return toast({ title: "Select at least 2 players", variant: "destructive" });
    if (type === "knockout" && ![2, 4, 8, 16].includes(selectedPlayers.size)) {
      return toast({ 
        title: "Invalid player count", 
        description: "Knockout tournaments require exactly 2, 4, 8, or 16 players.",
        variant: "destructive" 
      });
    }

    create({
      data: {
        name,
        type,
        playerIds: Array.from(selectedPlayers)
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-display font-bold text-white">New Tournament</h1>
        <p className="text-zinc-400 mt-1">Configure and generate fixtures instantly.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name Input */}
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

        {/* Type Selection */}
        <div className="glass-card rounded-2xl p-6">
          <label className="block text-sm font-medium text-zinc-300 mb-4">Tournament Format</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType("league")}
              className={cn(
                "flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all",
                type === "league" 
                  ? "border-primary bg-primary/10" 
                  : "border-white/5 bg-black/20 hover:border-white/20"
              )}
            >
              <Trophy className={cn("w-12 h-12 mb-3", type === "league" ? "text-primary" : "text-zinc-500")} />
              <h3 className="text-lg font-bold text-white mb-1">League</h3>
              <p className="text-sm text-zinc-400">Round-robin format. Everyone plays everyone. Points decide the winner.</p>
            </button>

            <button
              type="button"
              onClick={() => setType("knockout")}
              className={cn(
                "flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all",
                type === "knockout" 
                  ? "border-purple-500 bg-purple-500/10" 
                  : "border-white/5 bg-black/20 hover:border-white/20"
              )}
            >
              <Swords className={cn("w-12 h-12 mb-3", type === "knockout" ? "text-purple-500" : "text-zinc-500")} />
              <h3 className="text-lg font-bold text-white mb-1">Knockout</h3>
              <p className="text-sm text-zinc-400">Single elimination bracket. Lose and you're out. (Requires 4 or 8 players).</p>
            </button>
          </div>
        </div>

        {/* Player Selection */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Users className="w-4 h-4" />
              Select Participants
            </label>
            <span className="text-sm font-gaming text-primary">{selectedPlayers.size} Selected</span>
          </div>

          {type === "knockout" && ![2, 4, 8, 16].includes(selectedPlayers.size) && selectedPlayers.size > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">
                Knockout tournaments require exactly 2, 4, 8, or 16 players. Currently selected: {selectedPlayers.size}.
              </p>
            </div>
          )}

          {playersLoading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !players?.length ? (
            <div className="text-center py-8 text-zinc-500">
              No players available. Go to the Players page to add some first.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {players.map(player => (
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
            disabled={isPending || selectedPlayers.size < 2}
            className="px-8 py-3 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary hover:to-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? "Generating Fixtures..." : "Create & Generate Fixtures"}
          </button>
        </div>
      </form>
    </div>
  );
}
