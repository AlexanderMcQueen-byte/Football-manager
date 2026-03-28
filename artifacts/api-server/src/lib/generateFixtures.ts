export type TournamentFormat = "league" | "knockout" | "cup" | "groups_knockout" | "double_elimination" | "swiss";

// ─── League (Full Round Robin, home & away) ────────────────────────────────
export function generateLeagueFixtures(
  playerIds: number[]
): Array<{ homePlayerId: number; awayPlayerId: number; round: number; group?: string }> {
  const fixtures: Array<{ homePlayerId: number; awayPlayerId: number; round: number }> = [];
  const n = playerIds.length;
  const players = [...playerIds];

  if (n % 2 !== 0) players.push(-1); // bye

  const numRounds = players.length - 1;
  const half = players.length / 2;

  for (let round = 0; round < numRounds; round++) {
    for (let i = 0; i < half; i++) {
      const home = players[i];
      const away = players[players.length - 1 - i];
      if (home !== -1 && away !== -1) {
        fixtures.push({ homePlayerId: home, awayPlayerId: away, round: round + 1 });
        fixtures.push({ homePlayerId: away, awayPlayerId: home, round: round + 1 + numRounds });
      }
    }
    const rotated = [players[0], players[players.length - 1], ...players.slice(1, players.length - 1)];
    players.splice(0, players.length, ...rotated);
  }
  return fixtures;
}

// ─── Knockout (Single Elimination) ────────────────────────────────────────
export function generateKnockoutFixtures(
  playerIds: number[]
): Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string }> {
  const fixtures: Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string }> = [];
  const n = playerIds.length;

  const phaseNames: Record<number, string> = { 2: "F", 4: "SF", 8: "QF", 16: "R16" };

  // Generic bracket builder for powers-of-2
  function buildBracket(ids: number[], round: number) {
    const phase = phaseNames[ids.length] ?? `R${ids.length}`;
    for (let i = 0; i < ids.length; i += 2) {
      fixtures.push({ homePlayerId: ids[i], awayPlayerId: ids[i + 1], round, knockoutPhase: phase });
    }
    if (ids.length > 2) buildBracket(ids.slice(0, ids.length / 2), round + 1);
  }

  if ([2, 4, 8, 16].includes(n)) buildBracket(playerIds, 1);

  return fixtures;
}

// ─── Cup (Two-Legged Knockout — home & away per round) ────────────────────
export function generateCupFixtures(
  playerIds: number[]
): Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string }> {
  const fixtures: Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string }> = [];
  const n = playerIds.length;
  if (![2, 4, 8, 16].includes(n)) return [];

  const phaseNames: Record<number, string> = { 2: "F", 4: "SF", 8: "QF", 16: "R16" };
  let players = [...playerIds];
  let round = 1;

  while (players.length >= 2) {
    const phase = phaseNames[players.length] ?? `R${players.length}`;
    for (let i = 0; i < players.length; i += 2) {
      // Leg 1
      fixtures.push({ homePlayerId: players[i], awayPlayerId: players[i + 1], round, knockoutPhase: `${phase} L1` });
      // Leg 2 (reversed)
      fixtures.push({ homePlayerId: players[i + 1], awayPlayerId: players[i], round: round + 1, knockoutPhase: `${phase} L2` });
    }
    round += 2;
    // Next round: winners (placeholders using first player of each pair — results determine actual winners)
    players = players.filter((_, idx) => idx % 2 === 0);
  }

  return fixtures;
}

// ─── Groups + Knockout ─────────────────────────────────────────────────────
// Supports 8 players (2 groups of 4) or 16 players (4 groups of 4)
export function generateGroupsKnockoutFixtures(
  playerIds: number[]
): Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string; group?: string }> {
  const n = playerIds.length;
  if (![8, 16].includes(n)) return [];

  const groupSize = 4;
  const numGroups = n / groupSize;
  const fixtures: Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string; group: string }> = [];

  const groupLetters = "ABCD";
  const shuffled = [...playerIds]; // keep original order for deterministic assignment

  for (let g = 0; g < numGroups; g++) {
    const groupLabel = groupLetters[g];
    const groupPlayers = shuffled.slice(g * groupSize, (g + 1) * groupSize);
    // Round-robin within group (single round — 3 rounds for 4 players)
    const groupFixtures = generateLeagueFixtures(groupPlayers);
    for (const f of groupFixtures) {
      fixtures.push({ ...f, knockoutPhase: `Group ${groupLabel}`, group: groupLabel });
    }
  }

  // Knockout stubs — real players determined after group stage (labeled TBD)
  // We use first player of each group as placeholder; admin/system replaces after groups finish
  const kPhases = numGroups === 2 ? ["SF", "SF", "F"] : ["QF", "QF", "QF", "QF", "SF", "SF", "F"];
  const kRound = fixtures.length > 0 ? Math.max(...fixtures.map(f => f.round)) + 1 : 1;

  if (numGroups === 2) {
    // 1A vs 2B, 1B vs 2A
    fixtures.push({ homePlayerId: shuffled[0], awayPlayerId: shuffled[5], round: kRound, knockoutPhase: "SF", group: "KO" });
    fixtures.push({ homePlayerId: shuffled[4], awayPlayerId: shuffled[1], round: kRound, knockoutPhase: "SF", group: "KO" });
    fixtures.push({ homePlayerId: shuffled[0], awayPlayerId: shuffled[4], round: kRound + 1, knockoutPhase: "F", group: "KO" });
  } else {
    // 4 groups: QF, SF, F
    fixtures.push({ homePlayerId: shuffled[0],  awayPlayerId: shuffled[9],  round: kRound,     knockoutPhase: "QF", group: "KO" });
    fixtures.push({ homePlayerId: shuffled[4],  awayPlayerId: shuffled[13], round: kRound,     knockoutPhase: "QF", group: "KO" });
    fixtures.push({ homePlayerId: shuffled[8],  awayPlayerId: shuffled[1],  round: kRound,     knockoutPhase: "QF", group: "KO" });
    fixtures.push({ homePlayerId: shuffled[12], awayPlayerId: shuffled[5],  round: kRound,     knockoutPhase: "QF", group: "KO" });
    fixtures.push({ homePlayerId: shuffled[0],  awayPlayerId: shuffled[4],  round: kRound + 1, knockoutPhase: "SF", group: "KO" });
    fixtures.push({ homePlayerId: shuffled[8],  awayPlayerId: shuffled[12], round: kRound + 1, knockoutPhase: "SF", group: "KO" });
    fixtures.push({ homePlayerId: shuffled[0],  awayPlayerId: shuffled[8],  round: kRound + 2, knockoutPhase: "F",  group: "KO" });
  }

  return fixtures;
}

// ─── Double Elimination ────────────────────────────────────────────────────
// Winners bracket (same as knockout) + Losers bracket
export function generateDoubleEliminationFixtures(
  playerIds: number[]
): Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string }> {
  const n = playerIds.length;
  if (![4, 8, 16].includes(n)) return [];

  const fixtures: Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string }> = [];
  const phaseNames: Record<number, string> = { 2: "Grand Final", 4: "W-SF", 8: "W-QF", 16: "W-R16" };

  // Winners bracket
  let wb = [...playerIds];
  let wRound = 1;
  const losersByRound: number[][] = [];

  while (wb.length >= 2) {
    const phase = phaseNames[wb.length] ?? `W-R${wb.length}`;
    const losers: number[] = [];
    for (let i = 0; i < wb.length; i += 2) {
      fixtures.push({ homePlayerId: wb[i], awayPlayerId: wb[i + 1], round: wRound, knockoutPhase: phase });
      losers.push(wb[i]); // placeholder loser
    }
    if (wb.length > 2) losersByRound.push(losers);
    wb = wb.slice(0, wb.length / 2);
    wRound++;
  }

  // Losers bracket (simplified — mirrors structure of winners bracket)
  let lbRound = 1;
  let lb = losersByRound[0] ?? [];
  let lPhase = 1;
  while (lb.length >= 2) {
    for (let i = 0; i < lb.length; i += 2) {
      fixtures.push({ homePlayerId: lb[i], awayPlayerId: lb[i + 1], round: wRound + lbRound - 1, knockoutPhase: `L-R${lPhase}` });
    }
    lb = lb.slice(0, lb.length / 2);
    lbRound++;
    lPhase++;
  }

  // Grand Final (WB winner vs LB winner)
  fixtures.push({
    homePlayerId: playerIds[0],
    awayPlayerId: playerIds[n / 2],
    round: wRound + lbRound,
    knockoutPhase: "Grand Final",
  });

  return fixtures;
}

// ─── Swiss System ──────────────────────────────────────────────────────────
// Round 1 is random, subsequent rounds pair players by similar record
// We generate all rounds upfront with random pairings (admin adjusts as needed)
export function generateSwissFixtures(
  playerIds: number[]
): Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string }> {
  const n = playerIds.length;
  if (n < 4) return [];

  const numRounds = Math.ceil(Math.log2(n)); // enough rounds to determine a winner
  const fixtures: Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string }> = [];

  // Generate each round with shuffled pairings (in a real swiss you'd re-pair after results)
  let players = [...playerIds];
  for (let r = 1; r <= numRounds; r++) {
    // Shuffle consistently per round (deterministic based on round)
    const rotated = r % 2 === 0
      ? [...players.slice(players.length / 2), ...players.slice(0, players.length / 2)]
      : [...players];
    for (let i = 0; i < rotated.length - 1; i += 2) {
      fixtures.push({
        homePlayerId: rotated[i],
        awayPlayerId: rotated[i + 1],
        round: r,
        knockoutPhase: `Swiss R${r}`,
      });
    }
  }

  return fixtures;
}

// ─── Main dispatcher ───────────────────────────────────────────────────────
export function buildFixturesData(
  tournamentId: number,
  type: TournamentFormat,
  playerIds: number[]
): Array<{
  tournamentId: number;
  homePlayerId: number;
  awayPlayerId: number;
  round: number;
  knockoutPhase?: string | null;
}> {
  let raw: Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase?: string; group?: string }> = [];

  switch (type) {
    case "league":          raw = generateLeagueFixtures(playerIds); break;
    case "knockout":        raw = generateKnockoutFixtures(playerIds); break;
    case "cup":             raw = generateCupFixtures(playerIds); break;
    case "groups_knockout": raw = generateGroupsKnockoutFixtures(playerIds); break;
    case "double_elimination": raw = generateDoubleEliminationFixtures(playerIds); break;
    case "swiss":           raw = generateSwissFixtures(playerIds); break;
  }

  return raw.map((f) => ({
    tournamentId,
    homePlayerId: f.homePlayerId,
    awayPlayerId: f.awayPlayerId,
    round: f.round,
    knockoutPhase: f.knockoutPhase ?? null,
  }));
}
