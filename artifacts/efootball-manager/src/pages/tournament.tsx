import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { 
  useGetTournament, 
  useGetStandings, 
  useListFixtures, 
  useSubmitResult 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getFormBadgeColor, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { Trophy, CalendarDays, GitMerge, Loader2, Save, UserPlus, Phone, Gamepad2, CheckCircle, XCircle, Clock, ClipboardList, AlertCircle, Users } from "lucide-react";

export default function TournamentDetail() {
  const [, params] = useRoute("/tournaments/:id");
  const tournamentId = parseInt(params?.id || "0", 10);
  
  const [activeTab, setActiveTab] = useState<"standings" | "fixtures" | "bracket" | "registrations">("standings");
  const { isAdmin } = useAuth();

  const { data: tournament, isLoading: isTourneyLoading } = useGetTournament(tournamentId, {
    query: { enabled: !!tournamentId }
  });

  if (isTourneyLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!tournament) {
    return <div className="text-center py-20 text-white">Tournament not found</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="rounded-3xl relative overflow-hidden min-h-[200px] flex items-end">
        <img
          src={`${import.meta.env.BASE_URL}images/pitch-closeup.png`}
          alt="Football pitch"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 w-full p-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-300 border border-white/5">
                {tournament.type}
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                tournament.status === 'active' ? "bg-primary/20 text-primary border border-primary/20" : 
                "bg-zinc-800 text-zinc-400 border border-zinc-700"
              )}>
                {tournament.status}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 text-glow">
              {tournament.name}
            </h1>
            <p className="text-zinc-400 text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" /> {tournament.players.length} Players Competing
            </p>
          </div>

          <div className="bg-black/40 rounded-2xl p-4 border border-white/5 min-w-[200px]">
            <div className="text-sm text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Progress</div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-gaming font-bold text-white leading-none">{tournament.completedFixtures}</span>
              <span className="text-zinc-500 font-medium mb-1">/ {tournament.totalFixtures} matches</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full progress-fill rounded-full transition-all duration-700" 
                style={{ width: `${(tournament.completedFixtures / (tournament.totalFixtures || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Register to Play — shown to viewers */}
      {!isAdmin && <RegisterCard tournamentId={tournamentId} tournamentName={tournament.name} />}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10 overflow-x-auto">
        {[
          ...(tournament.type === 'league' ? ['standings', 'fixtures'] : ['bracket', 'fixtures']),
          ...(isAdmin ? ['registrations'] : []),
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-5 py-4 font-semibold capitalize tracking-wider text-sm transition-all relative whitespace-nowrap shrink-0",
              activeTab === tab
                ? "text-primary"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <div className="flex items-center gap-2">
              {tab === 'standings' && <Trophy className="w-4 h-4" />}
              {tab === 'fixtures' && <CalendarDays className="w-4 h-4" />}
              {tab === 'bracket' && <GitMerge className="w-4 h-4 rotate-90" />}
              {tab === 'registrations' && <ClipboardList className="w-4 h-4" />}
              {tab}
            </div>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {/* Show waiting state for fixtures/bracket/standings while tournament is in setup */}
        {tournament.status === "setup" && activeTab !== "registrations"
          ? <SetupWaitingTab
              currentPlayers={tournament.players.length}
              maxPlayers={tournament.maxPlayers ?? 0}
              isAdmin={isAdmin}
              onSwitchToRegistrations={() => setActiveTab("registrations")}
            />
          : <>
              {activeTab === "standings" && <StandingsTab tournamentId={tournamentId} />}
              {activeTab === "fixtures" && <FixturesTab tournamentId={tournamentId} isAdmin={isAdmin} />}
              {activeTab === "bracket" && <BracketTab tournamentId={tournamentId} />}
              {activeTab === "registrations" && isAdmin && <RegistrationsTab tournamentId={tournamentId} />}
            </>
        }
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StandingsTab({ tournamentId }: { tournamentId: number }) {
  const { data: standings, isLoading } = useGetStandings(tournamentId);

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!standings?.length) return <div className="text-zinc-500 py-12 text-center">No standings available.</div>;

  return (
    <div className="glass-card rounded-2xl overflow-hidden overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-black/40 text-xs uppercase font-gaming text-zinc-500 border-b border-white/10">
          <tr>
            <th className="px-6 py-4 font-bold">#</th>
            <th className="px-6 py-4 font-bold">Player</th>
            <th className="px-4 py-4 text-center font-bold">P</th>
            <th className="px-4 py-4 text-center font-bold">W</th>
            <th className="px-4 py-4 text-center font-bold">D</th>
            <th className="px-4 py-4 text-center font-bold">L</th>
            <th className="px-4 py-4 text-center font-bold hidden sm:table-cell">GF</th>
            <th className="px-4 py-4 text-center font-bold hidden sm:table-cell">GA</th>
            <th className="px-4 py-4 text-center font-bold">GD</th>
            <th className="px-6 py-4 text-center font-bold text-white text-base">Pts</th>
            <th className="px-6 py-4 text-center font-bold hidden md:table-cell">Form</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {standings.map((row, index) => (
            <tr key={row.playerId} className="hover:bg-white/[0.02] transition-colors group">
              <td className="px-6 py-4">
                <span className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs",
                  index === 0 ? "bg-yellow-500 text-black" :
                  index === 1 ? "bg-zinc-300 text-black" :
                  index === 2 ? "bg-amber-700 text-white" : "text-zinc-500"
                )}>
                  {index + 1}
                </span>
              </td>
              <td className="px-6 py-4 font-bold text-white text-base">{row.playerName}</td>
              <td className="px-4 py-4 text-center text-zinc-400">{row.played}</td>
              <td className="px-4 py-4 text-center text-zinc-300">{row.won}</td>
              <td className="px-4 py-4 text-center text-zinc-300">{row.drawn}</td>
              <td className="px-4 py-4 text-center text-zinc-300">{row.lost}</td>
              <td className="px-4 py-4 text-center text-zinc-400 hidden sm:table-cell">{row.goalsFor}</td>
              <td className="px-4 py-4 text-center text-zinc-400 hidden sm:table-cell">{row.goalsAgainst}</td>
              <td className="px-4 py-4 text-center font-bold text-zinc-300">
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </td>
              <td className="px-6 py-4 text-center font-gaming text-xl font-bold text-primary">{row.points}</td>
              <td className="px-6 py-4 hidden md:table-cell">
                <div className="flex items-center justify-center gap-1">
                  {row.form.map((f, i) => (
                    <div key={i} className={cn("w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold", getFormBadgeColor(f as any))}>
                      {f}
                    </div>
                  ))}
                  {row.form.length === 0 && <span className="text-zinc-600">-</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FixturesTab({ tournamentId, isAdmin }: { tournamentId: number; isAdmin: boolean }) {
  const { data: fixtures, isLoading } = useListFixtures({ tournamentId });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: saveResult } = useSubmitResult({
    mutation: {
      onSuccess: () => {
        toast({ title: "Result saved" });
        queryClient.invalidateQueries({ queryKey: ["/api/fixtures"] });
        queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/standings`] });
      },
      onError: () => toast({ title: "Failed to save result", variant: "destructive" })
    }
  });

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!fixtures?.length) return <div className="text-zinc-500 py-12 text-center">No fixtures generated.</div>;

  // Group by round
  const byRound = fixtures.reduce((acc, fix) => {
    const key = fix.knockoutPhase || `Matchday ${fix.round}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(fix);
    return acc;
  }, {} as Record<string, typeof fixtures>);

  return (
    <div className="space-y-8">
      {Object.entries(byRound).map(([roundName, roundFixtures]) => (
        <div key={roundName} className="space-y-4">
          <h3 className="font-gaming font-bold text-xl text-white tracking-wider flex items-center gap-3">
            <span className="w-8 h-[2px] bg-primary/50 block"></span>
            {roundName}
            <span className="flex-1 h-[1px] bg-white/5 block"></span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {roundFixtures.map(fixture => (
              <FixtureCard key={fixture.id} fixture={fixture} isAdmin={isAdmin} onSave={(h, a) => saveResult({ id: fixture.id, data: { homeScore: h, awayScore: a } })} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FixtureCard({ fixture, isAdmin, onSave }: { fixture: any, isAdmin: boolean, onSave: (h: number, a: number) => void }) {
  const [hScore, setHScore] = useState(fixture.homeScore?.toString() || "");
  const [aScore, setAScore] = useState(fixture.awayScore?.toString() || "");
  const isChanged = hScore !== (fixture.homeScore?.toString() || "") || aScore !== (fixture.awayScore?.toString() || "");
  const canSave = hScore !== "" && aScore !== "" && !isNaN(parseInt(hScore)) && !isNaN(parseInt(aScore));

  const tbd = fixture.homePlayerName === "TBD" || fixture.awayPlayerName === "TBD";

  return (
    <div className={cn(
      "glass-card rounded-2xl p-4 transition-all duration-300",
      fixture.played ? "border-primary/20 bg-primary/5" : "hover:border-white/20",
      tbd && "opacity-50 grayscale"
    )}>
      <div className="flex items-center justify-between gap-4">
        {/* Home */}
        <div className="flex-1 text-right">
          <span className="font-bold text-white sm:text-lg block truncate">{fixture.homePlayerName}</span>
        </div>

        {/* Score — editable for admin, read-only for viewers */}
        <div className="flex items-center gap-2 shrink-0 bg-black/50 p-2 rounded-xl border border-white/5">
          {isAdmin ? (
            <>
              <input
                type="number"
                min="0"
                disabled={tbd}
                value={hScore}
                onChange={e => setHScore(e.target.value)}
                className="w-12 h-12 bg-transparent text-center font-gaming text-2xl font-bold text-white focus:outline-none focus:bg-white/10 rounded-lg hide-arrows"
                placeholder="-"
              />
              <span className="text-zinc-600 font-bold text-sm">VS</span>
              <input
                type="number"
                min="0"
                disabled={tbd}
                value={aScore}
                onChange={e => setAScore(e.target.value)}
                className="w-12 h-12 bg-transparent text-center font-gaming text-2xl font-bold text-white focus:outline-none focus:bg-white/10 rounded-lg hide-arrows"
                placeholder="-"
              />
            </>
          ) : (
            <>
              <span className="w-12 h-12 flex items-center justify-center font-gaming text-2xl font-bold text-white">
                {fixture.played ? fixture.homeScore : <span className="text-zinc-600 text-lg">-</span>}
              </span>
              <span className="text-zinc-600 font-bold text-sm">VS</span>
              <span className="w-12 h-12 flex items-center justify-center font-gaming text-2xl font-bold text-white">
                {fixture.played ? fixture.awayScore : <span className="text-zinc-600 text-lg">-</span>}
              </span>
            </>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 text-left">
          <span className="font-bold text-white sm:text-lg block truncate">{fixture.awayPlayerName}</span>
        </div>

        {/* Action — only for admin */}
        {isAdmin && (
          <div className="w-10 flex justify-end shrink-0">
            {!tbd && (
              <button
                onClick={() => canSave && onSave(parseInt(hScore), parseInt(aScore))}
                disabled={!canSave || !isChanged}
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  canSave && isChanged
                    ? "bg-primary text-primary-foreground hover:scale-110 shadow-lg shadow-primary/20"
                    : "bg-white/5 text-zinc-500 opacity-50 cursor-not-allowed"
                )}
              >
                <Save className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <style>{`
        .hide-arrows::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

function BracketTab({ tournamentId }: { tournamentId: number }) {
  const { data: fixtures, isLoading } = useListFixtures({ tournamentId });

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!fixtures?.length) return <div className="text-zinc-500 py-12 text-center">Bracket data not available.</div>;

  const qf = fixtures.filter(f => f.knockoutPhase === 'QF');
  const sf = fixtures.filter(f => f.knockoutPhase === 'SF');
  const f = fixtures.filter(f => f.knockoutPhase === 'F');

  // Simple 3-column bracket layout for an 8-player tourney
  return (
    <div className="overflow-x-auto pb-8">
      <div className="min-w-[800px] flex justify-between gap-12 relative py-8 px-4">
        
        {/* Quarter Finals */}
        {qf.length > 0 && (
          <div className="flex flex-col justify-around gap-8 flex-1 relative z-10">
            <h4 className="text-center font-gaming text-zinc-500 tracking-widest absolute -top-8 w-full">QUARTER-FINALS</h4>
            {qf.map((match, i) => (
              <BracketNode key={match.id} match={match} hasConnector />
            ))}
          </div>
        )}

        {/* Semi Finals */}
        {sf.length > 0 && (
          <div className="flex flex-col justify-around gap-20 flex-1 relative z-10">
             <h4 className="text-center font-gaming text-zinc-500 tracking-widest absolute -top-8 w-full">SEMI-FINALS</h4>
            {sf.map((match, i) => (
              <BracketNode key={match.id} match={match} hasConnector />
            ))}
          </div>
        )}

        {/* Final */}
        {f.length > 0 && (
          <div className="flex flex-col justify-center flex-1 relative z-10">
             <h4 className="text-center font-gaming text-primary font-bold tracking-widest absolute -top-8 w-full text-glow">FINAL</h4>
            {f.map((match) => (
              <BracketNode key={match.id} match={match} isFinal />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BracketNode({ match, hasConnector = false, isFinal = false }: { match: any, hasConnector?: boolean, isFinal?: boolean }) {
  const isTbd = match.homePlayerName === "TBD" || match.awayPlayerName === "TBD";
  const homeWon = match.played && match.homeScore > match.awayScore;
  const awayWon = match.played && match.awayScore > match.homeScore;

  return (
    <div className={cn(
      "w-full glass-card rounded-lg overflow-hidden border transition-all",
      isFinal ? "border-primary/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-110 mx-4" : "border-white/10",
      hasConnector && "bracket-connector"
    )}>
      <div className="flex flex-col">
        {/* Home */}
        <div className={cn(
          "flex justify-between items-center p-3 border-b border-white/5",
          homeWon ? "bg-primary/10 text-white" : "bg-black/20 text-zinc-300",
          isTbd && "opacity-50"
        )}>
          <span className="font-semibold text-sm truncate pr-2">{match.homePlayerName}</span>
          <span className="font-gaming font-bold">{match.homeScore !== null ? match.homeScore : '-'}</span>
        </div>
        {/* Away */}
        <div className={cn(
          "flex justify-between items-center p-3",
          awayWon ? "bg-primary/10 text-white" : "bg-black/20 text-zinc-300",
          isTbd && "opacity-50"
        )}>
          <span className="font-semibold text-sm truncate pr-2">{match.awayPlayerName}</span>
          <span className="font-gaming font-bold">{match.awayScore !== null ? match.awayScore : '-'}</span>
        </div>
      </div>
    </div>
  );
}

// ── Register to Play card (shown to viewers) ─────────────────────────────────

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function RegisterCard({ tournamentId, tournamentName }: { tournamentId: number; tournamentName: string }) {
  const { toast } = useToast();
  const [efootballUsername, setEfootballUsername] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/tournaments/${tournamentId}/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ efootballUsername: efootballUsername.trim(), whatsappNumber: whatsappNumber.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error ?? "Registration failed", variant: "destructive" });
      } else {
        setDone(true);
        toast({ title: "Registration submitted!", description: "The admin will review your entry." });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-primary/20 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <CheckCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-lg">Registration Submitted!</h3>
          <p className="text-zinc-400 text-sm mt-0.5">Your entry for <span className="text-primary font-semibold">{tournamentName}</span> is pending review. The admin will confirm via WhatsApp.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
          <UserPlus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-lg leading-tight">Register to Play</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Submit your details to join <span className="text-zinc-300">{tournamentName}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={efootballUsername}
            onChange={e => setEfootballUsername(e.target.value)}
            placeholder="eFootball username"
            required
            minLength={2}
            className="w-full bg-input border border-border text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <div className="flex-1 relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="tel"
            value={whatsappNumber}
            onChange={e => setWhatsappNumber(e.target.value)}
            placeholder="WhatsApp number (e.g. +1234567890)"
            required
            className="w-full bg-input border border-border text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all text-sm btn-primary-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Register"}
        </button>
      </form>
    </div>
  );
}

// ── Registrations tab (admin only) ───────────────────────────────────────────

type Registration = {
  id: number;
  tournamentId: number;
  efootballUsername: string;
  whatsappNumber: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

function RegistrationsTab({ tournamentId }: { tournamentId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/tournaments/${tournamentId}/registrations`, { credentials: "include" });
      const data = await res.json();
      setRegistrations(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Failed to load registrations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // load on mount
  useEffect(() => { load(); }, [tournamentId]);

  async function updateStatus(id: number, status: "approved" | "rejected") {
    setUpdating(id);
    try {
      const res = await fetch(`${BASE}/api/registrations/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        toast({ title: status === "approved" ? "Registration approved ✓" : "Registration rejected" });
        // If approved, the player was added to the tournament — refresh tournament data
        if (status === "approved") {
          queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}`] });
          queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/standings`] });
        }
      }
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <ClipboardList className="w-10 h-10 text-zinc-700" />
        <p className="text-zinc-500 text-sm">No registrations yet. Share the tournament link so players can register.</p>
      </div>
    );
  }

  const counts = {
    pending:  registrations.filter(r => r.status === "pending").length,
    approved: registrations.filter(r => r.status === "approved").length,
    rejected: registrations.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="space-y-4">
      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap">
        {([
          { label: "Pending",  count: counts.pending,  cls: "badge-draw", Icon: Clock },
          { label: "Approved", count: counts.approved, cls: "badge-win",  Icon: CheckCircle },
          { label: "Rejected", count: counts.rejected, cls: "badge-loss", Icon: XCircle },
        ] as const).map(({ label, count, cls, Icon }) => (
          <div key={label} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold", cls)}>
            <Icon className="w-3.5 h-3.5" />
            {count} {label}
          </div>
        ))}
      </div>

      {/* Registration list */}
      <div className="space-y-3">
        {registrations.map(reg => (
          <div key={reg.id} className={cn(
            "glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-opacity",
            reg.status === "approved" && "border-primary/20",
            reg.status === "rejected" && "opacity-50",
          )}>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Gamepad2 className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-white truncate">{reg.efootballUsername}</span>
                <StatusBadge status={reg.status} />
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Phone className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                <span>{reg.whatsappNumber}</span>
              </div>
            </div>

            {reg.status === "pending" && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateStatus(reg.id, "approved")}
                  disabled={updating === reg.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg badge-win text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-40 cursor-pointer"
                >
                  {updating === reg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(reg.id, "rejected")}
                  disabled={updating === reg.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg badge-loss text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-40 cursor-pointer"
                >
                  {updating === reg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return (
    <span className="badge-win text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
      <CheckCircle className="w-3 h-3" /> Approved
    </span>
  );
  if (status === "rejected") return (
    <span className="badge-loss text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
      <XCircle className="w-3 h-3" /> Rejected
    </span>
  );
  return (
    <span className="badge-draw text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

// ── Setup / Waiting for players ───────────────────────────────────────────────

function SetupWaitingTab({
  currentPlayers,
  maxPlayers,
  isAdmin,
  onSwitchToRegistrations,
}: {
  currentPlayers: number;
  maxPlayers: number;
  isAdmin: boolean;
  onSwitchToRegistrations: () => void;
}) {
  const pct = maxPlayers > 0 ? Math.round((currentPlayers / maxPlayers) * 100) : 0;
  const remaining = Math.max(0, maxPlayers - currentPlayers);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-6">
      {/* Animated waiting icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Clock className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-zinc-400" />
        </div>
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="font-display font-bold text-white text-xl">Waiting for Players</h3>
        <p className="text-zinc-400 text-sm">
          Fixtures will be generated automatically once all <span className="text-primary font-semibold">{maxPlayers} spots</span> are filled.
        </p>
      </div>

      {/* Progress */}
      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-xs text-zinc-500 font-semibold">
          <span>{currentPlayers} approved</span>
          <span>{remaining} remaining</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full progress-fill rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-center text-xs text-zinc-600 font-gaming">{pct}% filled</div>
      </div>

      {/* Slots grid */}
      {maxPlayers <= 16 && (
        <div className="flex flex-wrap justify-center gap-2 max-w-xs">
          {Array.from({ length: maxPlayers }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-gaming font-bold transition-all",
                i < currentPlayers
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-white/3 border-white/8 text-zinc-700"
              )}
            >
              {i < currentPlayers ? "✓" : i + 1}
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <button
          onClick={onSwitchToRegistrations}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold text-sm hover:bg-primary/15 transition-all"
        >
          <ClipboardList className="w-4 h-4" />
          Manage Registrations
        </button>
      )}
    </div>
  );
}
