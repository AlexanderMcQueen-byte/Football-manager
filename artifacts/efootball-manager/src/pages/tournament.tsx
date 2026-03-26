import { useState } from "react";
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
import { Trophy, CalendarDays, GitMerge, Loader2, Save } from "lucide-react";

export default function TournamentDetail() {
  const [, params] = useRoute("/tournaments/:id");
  const tournamentId = parseInt(params?.id || "0", 10);
  
  const [activeTab, setActiveTab] = useState<"standings" | "fixtures" | "bracket">("standings");
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

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10">
        {(tournament.type === 'league' ? ['standings', 'fixtures'] : ['bracket', 'fixtures']).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-6 py-4 font-semibold capitalize tracking-wider text-sm transition-all relative",
              activeTab === tab 
                ? "text-primary" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <div className="flex items-center gap-2">
              {tab === 'standings' && <Trophy className="w-4 h-4" />}
              {tab === 'fixtures' && <CalendarDays className="w-4 h-4" />}
              {tab === 'bracket' && <GitMerge className="w-4 h-4 rotate-90" />}
              {tab}
            </div>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === "standings" && <StandingsTab tournamentId={tournamentId} />}
        {activeTab === "fixtures" && <FixturesTab tournamentId={tournamentId} />}
        {activeTab === "bracket" && <BracketTab tournamentId={tournamentId} />}
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

function FixturesTab({ tournamentId }: { tournamentId: number }) {
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
