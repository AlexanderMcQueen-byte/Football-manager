import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
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
      <section className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.12)] sm:p-6">
        <div className="h-4 w-48 rounded bg-slate-200" />
        <div className="mt-5 h-48 rounded-xl bg-slate-100" />
      </section>
    );
  }

  if (error || !data || !pack || !player) {
    return (
      <section className="rounded-2xl border border-pink-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.12)] sm:p-6">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">eFootball Pack Watch</h2>
            <p className="text-sm text-slate-500">{error || "No pack updates are available right now."}</p>
          </div>
        </div>
        <button
          onClick={() => void loadUpdates()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-pink-100"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] sm:p-6">
      <img
        src={`${BASE}/images/stadium-hero.png`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-[0.18]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/95 via-white/88 to-pink-50/80" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-pink-100 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="font-gaming text-xs font-bold uppercase tracking-[0.25em]">Pack intelligence</span>
          </div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-slate-950 sm:text-3xl">
            Upcoming eFootball Packs
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Browse the latest EFHub pack watch and rotate through the featured players to see the strongest role-based training focus.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
          <span className={cn("h-2 w-2 rounded-full", data.sourceStatus === "live-index" ? "bg-emerald-400" : "bg-amber-400")} />
          {data.sourceStatus === "live-index" ? "Index checked live" : "Verified snapshot"}
          <span>·</span>
          {new Date(data.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <div className="relative mt-5 flex gap-2 overflow-x-auto pb-1">
        {data.packs.map((item, index) => (
          <button
            key={item.packUrl}
            onClick={() => setSelectedPack(index)}
            className={cn(
              "shrink-0 border px-3 py-2 text-left transition-all",
              selectedPack === index
                 ? "border-primary/60 bg-pink-50 text-primary shadow-sm"
                 : "border-slate-200 bg-slate-50 text-slate-500 hover:border-pink-200 hover:bg-pink-50 hover:text-primary",
            )}
          >
            <span className="block max-w-[170px] truncate text-xs font-bold uppercase tracking-wide">{item.name}</span>
            <span className="mt-1 block text-[10px] text-current/60">{item.date} · {item.playerCount} players</span>
          </button>
        ))}
      </div>

      <div className="relative mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="relative flex min-h-[245px] overflow-hidden border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-pink-50/60">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-100/60 via-transparent to-transparent" />
          <div className="relative flex w-full items-center justify-between gap-4 p-5 sm:p-7">
            <div className="max-w-[58%] sm:max-w-[52%]">
              <div className="flex items-center gap-2">
                <span className="border border-pink-200 bg-pink-50 px-2 py-1 font-gaming text-xs font-bold text-primary">
                  {player.position}
                </span>
                <span className="text-xs uppercase tracking-widest text-slate-500">{pack.name}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-black text-slate-950 sm:text-3xl">{player.name}</h3>
              <p className="mt-1 text-sm text-slate-500">EFHub rating <strong className="text-slate-950">{player.rating}</strong></p>
              <a
                href={player.playerUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-pink-700"
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

        <div className="border border-pink-200 bg-pink-50/70 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-primary">
            <Target className="h-4 w-4" />
            <span className="font-gaming text-xs font-bold uppercase tracking-[0.2em]">Recommended training</span>
          </div>
          <h3 className="mt-3 font-display text-xl font-black uppercase text-slate-950">{player.training.focus}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{player.training.details}</p>
          <div className="mt-4 border-l-2 border-primary/50 pl-3 text-xs leading-relaxed text-slate-600">
            <strong className="text-slate-900">Why this build:</strong> {player.training.reason}
          </div>
          <div className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Role-based priority · verify in-game progression preview
          </div>
        </div>
      </div>

      {playerCount > 1 && (
        <div className="relative mt-4 flex items-center gap-3">
          <button
            onClick={() => setPlayerIndex((current) => (current - 1 + playerCount) % playerCount)}
            className="border border-slate-200 bg-white p-2 text-slate-500 hover:border-pink-300 hover:text-primary"
            aria-label="Previous player"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="h-1 flex-1 bg-slate-200">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="min-w-12 text-center font-gaming text-xs text-slate-500">{playerIndex + 1}/{playerCount}</span>
          <button
            onClick={() => setPlayerIndex((current) => (current + 1) % playerCount)}
            className="border border-slate-200 bg-white p-2 text-slate-500 hover:border-pink-300 hover:text-primary"
            aria-label="Next player"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-[10px] text-slate-500">
        <span>{data.source.note}</span>
        <span className="flex items-center gap-3">
          <a href={pack.packUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:text-pink-700">
            EFHub pack <ExternalLink className="h-3 w-3" />
          </a>
          <a href={data.source.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900">
            Konami official <ExternalLink className="h-3 w-3" />
          </a>
        </span>
      </div>
    </section>
  );
}