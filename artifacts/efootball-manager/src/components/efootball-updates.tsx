import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BrainCircuit,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PackPlayer = {
  name: string;
  position: string;
  rating: number;
  imageUrl: string;
  playerUrl: string;
  training: {
    focus: string;
    details: string;
    reason: string;
  };
};

type PackUpdate = {
  name: string;
  shortName: string;
  edition: string;
  category: "Featured selection";
  date: string;
  playerCount: number;
  packUrl: string;
  source: "EFHub";
  players: PackPlayer[];
};

type UpdatesResponse = {
  packs: PackUpdate[];
  checkedAt: string;
  sourceStatus: "live-index" | "verified-snapshot";
  source: {
    name: string;
    url: string;
    officialUrl: string;
    note: string;
  };
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function EFootballUpdates() {
  const [data, setData] = useState<UpdatesResponse | null>(null);
  const [selectedPack, setSelectedPack] = useState(0);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUpdates() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${BASE}/api/efootball-updates`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("The update source is unavailable.");
      const result = (await response.json()) as UpdatesResponse;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pack updates.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUpdates();
  }, []);

  const pack = data?.packs[selectedPack];
  const player = pack?.players[playerIndex];
  const playerCount = pack?.players.length ?? 0;

  useEffect(() => {
    setPlayerIndex(0);
  }, [selectedPack]);

  useEffect(() => {
    if (playerCount < 2) return;
    const timer = window.setInterval(() => {
      setPlayerIndex((current) => (current + 1) % playerCount);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [playerCount, selectedPack]);

  const progress = useMemo(() => {
    if (!playerCount) return 0;
    return ((playerIndex + 1) / playerCount) * 100;
  }, [playerCount, playerIndex]);

  if (isLoading) {
    return (
      <section className="animate-pulse rounded-2xl border border-white/10 bg-[#191d23] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-6">
        <div className="h-4 w-48 rounded bg-white/10" />
        <div className="mt-5 h-48 rounded-xl bg-white/[0.06]" />
      </section>
    );
  }

  if (error || !data || !pack || !player) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#191d23] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-6">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-display text-lg font-bold text-white">eFootball Pack Watch</h2>
            <p className="text-sm text-zinc-400">{error || "No pack updates are available right now."}</p>
          </div>
        </div>
        <button
          onClick={() => void loadUpdates()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#191d23] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.32)] sm:p-6">
      <img
        src={`${BASE}/images/stadium-hero.png`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-[0.24]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#191d23]/96 via-[#191d23]/90 to-[#3b202f]/88" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            Featured eFootball Packs
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Scan the latest EFHub player packs, compare their featured squads, and open a player to see the strongest role-based training focus.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
          <span className={cn("h-2 w-2 rounded-full", data.sourceStatus === "live-index" ? "bg-emerald-400" : "bg-primary")} />
          {data.sourceStatus === "live-index" ? "Index checked live" : "Verified snapshot"}
          <span>·</span>
          {new Date(data.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <div className="relative mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-gaming text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
              Pack directory
            </p>
            <p className="mt-1 text-xs text-zinc-400">Select a campaign to inspect its featured players.</p>
          </div>
          <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-gaming text-[10px] uppercase tracking-wider text-zinc-500 sm:inline-flex">
            {data.packs.length} active listings
          </span>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
        {data.packs.map((item, index) => (
          <button
            key={item.packUrl}
            onClick={() => setSelectedPack(index)}
            className={cn(
              "group relative overflow-hidden rounded-xl border p-4 text-left transition-all",
              selectedPack === index
                 ? "border-primary/70 bg-primary/15 shadow-[0_0_22px_rgba(219,92,145,0.12)]"
                 : "border-white/10 bg-[#252a31]/90 hover:border-primary/50 hover:bg-primary/[0.08]",
            )}
          >
            <span className="absolute right-4 top-4 font-gaming text-[10px] font-bold text-zinc-600">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex items-center gap-2 font-gaming text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {item.category}
            </span>
            <span className="mt-2 block pr-8 font-display text-lg font-black uppercase tracking-tight text-white">
              {item.shortName}
            </span>
            <span className="mt-0.5 block font-gaming text-xs uppercase tracking-[0.12em] text-zinc-400">
              {item.edition}
            </span>
            <span className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-wider text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-zinc-600" />
                {item.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-zinc-600" />
                {item.playerCount} featured players
              </span>
            </span>
            <span className="mt-4 flex flex-wrap gap-1.5">
              {item.players.slice(0, 3).map((featuredPlayer) => (
                <span
                  key={featuredPlayer.playerUrl}
                  className={cn(
                    "rounded-full border px-2 py-1 text-[10px] font-semibold",
                    selectedPack === index
                      ? "border-primary/30 bg-primary/10 text-pink-100"
                      : "border-white/10 bg-black/10 text-zinc-400",
                  )}
                >
                  {featuredPlayer.name}
                </span>
              ))}
              {item.playerCount > 3 && (
                <span className="rounded-full border border-white/10 bg-black/10 px-2 py-1 text-[10px] font-semibold text-zinc-600">
                  +{item.playerCount - 3} more
                </span>
              )}
            </span>
          </button>
        ))}
        </div>
      </div>

       <div className="relative mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
         <div className="relative flex min-h-[245px] overflow-hidden border border-white/10 bg-gradient-to-br from-[#232831] via-[#1d2229] to-[#3b202f]/80">
           <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-transparent" />
          <div className="relative flex w-full items-center justify-between gap-4 p-5 sm:p-7">
            <div className="max-w-[58%] sm:max-w-[52%]">
              <div className="flex items-center gap-2">
                   <span className="border border-primary/40 bg-primary/10 px-2 py-1 font-gaming text-xs font-bold text-primary">
                  {player.position}
                </span>
                  <span className="text-xs uppercase tracking-widest text-zinc-400">
                    {pack.shortName} · {pack.edition}
                  </span>
              </div>
               <h3 className="mt-4 font-display text-2xl font-black text-white sm:text-3xl">{player.name}</h3>
               <p className="mt-1 text-sm text-zinc-400">EFHub rating <strong className="text-white">{player.rating}</strong></p>
              <a
                href={player.playerUrl}
                target="_blank"
                rel="noreferrer"
                 className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-pink-300"
              >
                View player data <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <img
              src={player.imageUrl}
              alt={`${player.name} eFootball card`}
              className="absolute bottom-0 right-2 h-[190px] w-auto object-contain drop-shadow-[0_15px_20px_rgba(15,23,42,0.28)] sm:right-10 sm:h-[230px]"
            />
          </div>
        </div>

         <div className="border border-primary/30 bg-[#2a2029]/85 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-primary">
            <Target className="h-4 w-4" />
            <span className="font-gaming text-xs font-bold uppercase tracking-[0.2em]">Recommended training</span>
          </div>
           <h3 className="mt-3 font-display text-xl font-black uppercase text-white">{player.training.focus}</h3>
           <p className="mt-3 text-sm leading-relaxed text-zinc-300">{player.training.details}</p>
           <div className="mt-4 border-l-2 border-primary/70 pl-3 text-xs leading-relaxed text-zinc-400">
             <strong className="text-white">Why this build:</strong> {player.training.reason}
          </div>
           <div className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Role-based priority · verify in-game progression preview
          </div>
        </div>
      </div>

      {playerCount > 1 && (
        <div className="relative mt-4 flex items-center gap-3">
          <button
            onClick={() => setPlayerIndex((current) => (current - 1 + playerCount) % playerCount)}
             className="border border-white/10 bg-[#252a31] p-2 text-zinc-400 hover:border-primary/50 hover:text-primary"
            aria-label="Previous player"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
           <div className="h-1 flex-1 bg-white/10">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
           <span className="min-w-12 text-center font-gaming text-xs text-zinc-500">{playerIndex + 1}/{playerCount}</span>
          <button
            onClick={() => setPlayerIndex((current) => (current + 1) % playerCount)}
             className="border border-white/10 bg-[#252a31] p-2 text-zinc-400 hover:border-primary/50 hover:text-primary"
            aria-label="Next player"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

       <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-[10px] text-zinc-500">
        <span>{data.source.note}</span>
        <span className="flex items-center gap-3">
           <a href={pack.packUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:text-pink-300">
            EFHub pack <ExternalLink className="h-3 w-3" />
          </a>
           <a href={data.source.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-zinc-500 hover:text-white">
            Konami official <ExternalLink className="h-3 w-3" />
          </a>
        </span>
      </div>
    </section>
  );
}