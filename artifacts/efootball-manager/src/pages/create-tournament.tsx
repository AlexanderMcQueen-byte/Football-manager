import { useState } from "react";
import { useLocation } from "wouter";
import { useListPlayers, useCreateTournament } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Trophy, Swords, Users, Info, Lock, ClipboardList,
  ToggleLeft, ToggleRight, GitBranch, Layers, RefreshCw, Globe2, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

type TournamentFormat = "league" | "knockout" | "cup" | "groups_knockout" | "double_elimination" | "swiss";

interface FormatDef {
  id: TournamentFormat;
  label: string;
  icon: React.ElementType;
  color: string;             // active border/text colour
  activeBg: string;          // active bg tint
  description: string;
  detail: string;
  playerNote?: string;
  sizes?: number[];          // valid sizes for registration mode
  minPlayers?: number;       // min for manual mode
}

const FORMATS: FormatDef[] = [
  {
    id: "league",
    label: "League",
    icon: Trophy,
    color: "text-primary border-primary",
    activeBg: "bg-primary/10",
    description: "Round Robin",
    detail: "Everyone plays against everyone else, home and away. Points decide the champion.",
    playerNote: "2–64 players",
  },
  {
    id: "knockout",
    label: "Knockout",
    icon: Swords,
    color: "text-purple-400 border-purple-500",
    activeBg: "bg-purple-500/10",
    description: "Single Elimination",
    detail: "Lose once and you're out. A clean bracket determines the winner.",
    playerNote: "2, 4, 8 or 16 players",
    sizes: [2, 4, 8, 16],
  },
  {
    id: "cup",
    label: "Cup",
    icon: Globe2,
    color: "text-amber-400 border-amber-500",
    activeBg: "bg-amber-500/10",
    description: "Two-Legged Ties",
    detail: "Each knockout tie is played home and away. Aggregate score over both legs decides who advances.",
    playerNote: "2, 4, 8 or 16 players",
    sizes: [2, 4, 8, 16],
  },
  {
    id: "groups_knockout",
    label: "Groups + Knockout",
    icon: Layers,
    color: "text-blue-400 border-blue-500",
    activeBg: "bg-blue-500/10",
    description: "World Cup Style",
    detail: "Group stage: teams play each other within their group. Top finishers advance to knockout rounds.",
    playerNote: "8 or 16 players",
    sizes: [8, 16],
    minPlayers: 8,
  },
  {
    id: "double_elimination",
    label: "Double Elim.",
    icon: GitBranch,
    color: "text-rose-400 border-rose-500",
    activeBg: "bg-rose-500/10",
    description: "Double Elimination",
    detail: "Two losses to be knocked out. Losers drop into a second chance bracket, keeping the competition alive.",
    playerNote: "4, 8 or 16 players",
    sizes: [4, 8, 16],
    minPlayers: 4,
  },
  {
    id: "swiss",
    label: "Swiss System",
    icon: RefreshCw,
    color: "text-teal-400 border-teal-500",
    activeBg: "bg-teal-500/10",
    description: "Swiss Pairing",
    detail: "No elimination. Players are paired with opponents of similar record each round. Points determine the overall winner.",
    playerNote: "4+ players",
    minPlayers: 4,
  },
];

const KNOCKOUT_SIZES = [2, 4, 8, 16];

export default function CreateTournament() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isPaid } = useAuth();

  const [name, setName]     = useState("");
  const [format, setFormat] = useState<TournamentFormat>("league");
  const [mode, setMode]     = useState<"registration" | "manual">("registration");
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
        toast({ title: "Failed to create tournament", description: err.message || "Please check your inputs", variant: "destructive" });
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
          <button onClick={() => setLocation("/pricing")} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">View Pricing</button>
          <button onClick={() => setLocation("/login")} className="px-5 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl font-semibold text-sm hover:bg-zinc-700 transition-colors">Sign In</button>
        </div>
      </div>
    );
  }

  const def = FORMATS.find(f => f.id === format) ?? FORMATS[0];
  const validSizes = def.sizes ?? null;
  const isKnockoutStyle = !!validSizes;
  const isSizeValid = !isKnockoutStyle || validSizes!.includes(maxPlayers);
  const minPlayers = def.minPlayers ?? 2;

  const togglePlayer = (id: number) => {
    const s = new Set(selectedPlayers);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelectedPlayers(s);
  };

  const handleFormatChange = (f: TournamentFormat) => {
    setFormat(f);
    const d = FORMATS.find(x => x.id === f)!;
    if (d.sizes) setMaxPlayers(d.sizes[1] ?? d.sizes[0]);
    else setMaxPlayers(8);
    setSelectedPlayers(new Set());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast({ title: "Name is required", variant: "destructive" });

    if (mode === "registration") {
      if (maxPlayers < minPlayers) return toast({ title: `This format needs at least ${minPlayers} players`, variant: "destructive" });
      if (isKnockoutStyle && !isSizeValid) {
        return toast({ title: "Invalid player count", description: `${def.label} requires ${validSizes!.join(", ")} players.`, variant: "destructive" });
      }
      create({ data: { name, type: format as any, maxPlayers, playerIds: [] } });
    } else {
      const count = selectedPlayers.size;
      if (count < minPlayers) return toast({ title: `Select at least ${minPlayers} players`, variant: "destructive" });
      if (isKnockoutStyle && !validSizes!.includes(count)) {
        return toast({ title: "Invalid player count", description: `${def.label} requires ${validSizes!.join(", ")} players.`, variant: "destructive" });
      }
      create({ data: { name, type: format as any, playerIds: Array.from(selectedPlayers) } });
    }
  };

  const submitLabel = isPending
    ? "Creating…"
    : mode === "registration"
    ? `Create & Open Registration (${maxPlayers} spots)`
    : "Create & Generate Fixtures";

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <header className="relative rounded-3xl overflow-hidden min-h-[160px] flex items-end mb-8">
        <img src={`${import.meta.env.BASE_URL}images/trophy-bg.png`} alt="Trophy" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20" />
        <div className="relative z-10 p-8 w-full">
          <p className="text-primary font-gaming font-bold text-xs tracking-[0.3em] uppercase mb-1">Create New</p>
          <h1 className="text-4xl font-display font-bold text-white drop-shadow-lg">New Tournament</h1>
          <p className="text-zinc-300 mt-1 text-sm">Choose a format, set the roster and launch.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="glass-card rounded-2xl p-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Tournament Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Champions Cup 2025"
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white text-lg placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Format selector */}
        <div className="glass-card rounded-2xl p-6">
          <label className="block text-sm font-medium text-zinc-300 mb-4">Tournament Format</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              const active = format === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFormatChange(f.id)}
                  className={cn(
                    "flex flex-col items-start text-left p-4 rounded-xl border-2 transition-all duration-200 group",
                    active
                      ? `${f.activeBg} ${f.color}`
                      : "border-white/5 bg-black/20 hover:border-white/20 hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-8 h-8 mb-2", active ? f.color.split(" ")[0] : "text-zinc-500 group-hover:text-zinc-300")} />
                  <span className={cn("font-display font-bold text-sm", active ? "text-white" : "text-zinc-300")}>
                    {f.label}
                  </span>
                  <span className={cn("text-[11px] mt-0.5", active ? "text-zinc-300" : "text-zinc-600")}>
                    {f.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected format detail */}
          <div className={cn("mt-4 p-4 rounded-xl border flex items-start gap-3 transition-all", `${def.activeBg} border-white/10`)}>
            <Info className={cn("w-4 h-4 shrink-0 mt-0.5", def.color.split(" ")[0])} />
            <div>
              <p className="text-sm text-zinc-200 font-medium">{def.label} — {def.description}</p>
              <p className="text-xs text-zinc-400 mt-1">{def.detail}</p>
              {def.playerNote && (
                <p className="text-xs mt-1.5 font-semibold" style={{ color: "inherit" }}>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", def.activeBg, def.color)}>
                    {def.playerNote}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Player setup mode */}
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
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
                <ClipboardList className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-300">
                  The tournament opens for public registration. Once{" "}
                  <span className="text-primary font-semibold">all spots are filled</span> and approved, fixtures are generated automatically.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Player Cap <span className="text-zinc-500 font-normal">(total spots)</span>
                </label>
                {validSizes ? (
                  <div className="flex gap-3 flex-wrap">
                    {validSizes.map(n => (
                      <button key={n} type="button" onClick={() => setMaxPlayers(n)}
                        className={cn(
                          "w-16 h-16 rounded-xl border-2 font-gaming font-bold text-xl transition-all",
                          maxPlayers === n ? `${def.activeBg} ${def.color}` : "border-white/10 bg-black/20 text-zinc-500 hover:border-white/20"
                        )}>
                        {n}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <input
                      type="number" min={minPlayers} max={64} value={maxPlayers}
                      onChange={e => setMaxPlayers(Math.max(minPlayers, parseInt(e.target.value) || minPlayers))}
                      className="w-28 bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-lg font-gaming font-bold text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <span className="text-zinc-400 text-sm">players needed to start</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Users className="w-4 h-4" /> Select Participants
                </label>
                <span className="text-sm font-gaming text-primary">{selectedPlayers.size} Selected</span>
              </div>

              {isKnockoutStyle && !validSizes!.includes(selectedPlayers.size) && selectedPlayers.size > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-200">
                    {def.label} requires {validSizes!.join(", ")} players. Currently: {selectedPlayers.size}.
                  </p>
                </div>
              )}

              {selectedPlayers.size >= minPlayers && (!isKnockoutStyle || validSizes!.includes(selectedPlayers.size)) && (
                <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/15 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <p className="text-sm text-zinc-300">Ready — {selectedPlayers.size} players selected</p>
                </div>
              )}

              {playersLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !players?.length ? (
                <div className="text-center py-10 space-y-3">
                  <p className="text-zinc-500 text-sm">No players yet — add some before using Manual mode.</p>
                  <button
                    type="button"
                    onClick={() => setLocation("/players")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/15 transition-colors"
                  >
                    <Users className="w-4 h-4" /> Go to Players page
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {players.map(player => (
                    <button key={player.id} type="button" onClick={() => togglePlayer(player.id)}
                      className={cn(
                        "px-4 py-3 rounded-xl border text-left transition-all",
                        selectedPlayers.has(player.id)
                          ? "bg-white/10 border-white/20 text-white shadow-inner"
                          : "bg-black/20 border-transparent text-zinc-400 hover:bg-white/5"
                      )}>
                      <div className="font-semibold truncate">{player.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => setLocation("/")}
            className="px-6 py-3 rounded-xl font-medium text-white hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button type="submit"
            disabled={
              isPending ||
              (mode === "manual" && selectedPlayers.size < minPlayers) ||
              (mode === "manual" && isKnockoutStyle && !validSizes!.includes(selectedPlayers.size)) ||
              (mode === "registration" && isKnockoutStyle && !isSizeValid)
            }
            className="px-8 py-3 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary hover:to-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
