export function generateLeagueFixtures(
  playerIds: number[]
): Array<{ homePlayerId: number; awayPlayerId: number; round: number }> {
  const fixtures: Array<{ homePlayerId: number; awayPlayerId: number; round: number }> = [];
  const n = playerIds.length;
  const players = [...playerIds];

  if (n % 2 !== 0) players.push(-1);

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

export function generateKnockoutFixtures(
  playerIds: number[]
): Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string }> {
  const fixtures: Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string }> = [];
  const n = playerIds.length;

  if (n === 16) {
    for (let i = 0; i < 8; i++) {
      fixtures.push({ homePlayerId: playerIds[i * 2], awayPlayerId: playerIds[i * 2 + 1], round: 1, knockoutPhase: "R16" });
    }
    for (let i = 0; i < 4; i++) {
      fixtures.push({ homePlayerId: playerIds[i * 2], awayPlayerId: playerIds[i * 2 + 2], round: 2, knockoutPhase: "QF" });
    }
    fixtures.push({ homePlayerId: playerIds[0], awayPlayerId: playerIds[4], round: 3, knockoutPhase: "SF" });
    fixtures.push({ homePlayerId: playerIds[8], awayPlayerId: playerIds[12], round: 3, knockoutPhase: "SF" });
    fixtures.push({ homePlayerId: playerIds[0], awayPlayerId: playerIds[8], round: 4, knockoutPhase: "F" });
  } else if (n === 8) {
    for (let i = 0; i < 4; i++) {
      fixtures.push({ homePlayerId: playerIds[i * 2], awayPlayerId: playerIds[i * 2 + 1], round: 1, knockoutPhase: "QF" });
    }
    fixtures.push({ homePlayerId: playerIds[0], awayPlayerId: playerIds[2], round: 2, knockoutPhase: "SF" });
    fixtures.push({ homePlayerId: playerIds[4], awayPlayerId: playerIds[6], round: 2, knockoutPhase: "SF" });
    fixtures.push({ homePlayerId: playerIds[0], awayPlayerId: playerIds[4], round: 3, knockoutPhase: "F" });
  } else if (n === 4) {
    for (let i = 0; i < 2; i++) {
      fixtures.push({ homePlayerId: playerIds[i * 2], awayPlayerId: playerIds[i * 2 + 1], round: 1, knockoutPhase: "SF" });
    }
    fixtures.push({ homePlayerId: playerIds[0], awayPlayerId: playerIds[2], round: 2, knockoutPhase: "F" });
  } else if (n === 2) {
    fixtures.push({ homePlayerId: playerIds[0], awayPlayerId: playerIds[1], round: 1, knockoutPhase: "F" });
  }

  return fixtures;
}

export function buildFixturesData(
  tournamentId: number,
  type: "league" | "knockout",
  playerIds: number[]
): Array<{
  tournamentId: number;
  homePlayerId: number;
  awayPlayerId: number;
  round: number;
  knockoutPhase?: string | null;
}> {
  if (type === "league") {
    return generateLeagueFixtures(playerIds).map((f) => ({
      tournamentId,
      homePlayerId: f.homePlayerId,
      awayPlayerId: f.awayPlayerId,
      round: f.round,
      knockoutPhase: null,
    }));
  } else {
    return generateKnockoutFixtures(playerIds).map((f) => ({
      tournamentId,
      homePlayerId: f.homePlayerId,
      awayPlayerId: f.awayPlayerId,
      round: f.round,
      knockoutPhase: f.knockoutPhase,
    }));
  }
}
