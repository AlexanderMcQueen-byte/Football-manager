import { useState } from "react";
import { useListPlayers, useCreatePlayer, useDeletePlayer } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Trash2, Shield } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Players() {
  const [newPlayerName, setNewPlayerName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: players, isLoading } = useListPlayers();
  const { mutate: createPlayer, isPending: isCreating } = useCreatePlayer({
    mutation: {
      onSuccess: () => {
        setNewPlayerName("");
        queryClient.invalidateQueries({ queryKey: ["/api/players"] });
        toast({ title: "Player added successfully" });
      },
      onError: () => {
        toast({ title: "Failed to add player", variant: "destructive" });
      }
    }
  });

  const { mutate: deletePlayer, isPending: isDeleting } = useDeletePlayer({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/players"] });
        toast({ title: "Player removed" });
      }
    }
  });

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    createPlayer({ data: { name: newPlayerName.trim() } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-4xl font-display font-bold text-white">Player Roster</h1>
        <p className="text-zinc-400 mt-1">Manage the pool of players available for tournaments.</p>
      </header>

      <div className="glass-card rounded-2xl p-6 mb-8">
        <form onSubmit={handleAddPlayer} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <UserPlus className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Enter player name..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              disabled={isCreating}
            />
          </div>
          <button
            type="submit"
            disabled={!newPlayerName.trim() || isCreating}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isCreating ? "Adding..." : "Add Player"}
          </button>
        </form>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
          <Users className="w-5 h-5 text-zinc-400" />
          <h2 className="font-semibold text-white">Registered Players ({players?.length || 0})</h2>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !players?.length ? (
          <div className="p-12 text-center text-zinc-500">
            No players added yet. Add some players to get started.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            <AnimatePresence>
              {players.map((player, idx) => (
                <motion.li
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  key={player.id}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center font-display font-bold text-white shadow-inner">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{player.name}</h3>
                      <p className="text-xs text-zinc-500">Joined {format(new Date(player.createdAt), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if(confirm(`Are you sure you want to remove ${player.name}?`)) {
                        deletePlayer({ id: player.id });
                      }
                    }}
                    disabled={isDeleting}
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
                    title="Remove Player"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
