import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  tournamentsTable,
  tournamentPlayersTable,
  playersTable,
  fixturesTable,
} from "@workspace/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import {
  CreateTournamentBody,
  GetTournamentParams,
  DeleteTournamentParams,
  GetStandingsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateLeagueFixtures(playerIds: number[]): Array<{ homePlayerId: number; awayPlayerId: number; round: number }> {
  const fixtures: Array<{ homePlayerId: number; awayPlayerId: number; round: number }> = [];
  const n = playerIds.length;
  const players = [...playerIds];

  if (n % 2 !== 0) {
    players.push(-1);
  }

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

function generateKnockoutFixtures(playerIds: number[]): Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string }> {
  const fixtures: Array<{ homePlayerId: number; awayPlayerId: number; round: number; knockoutPhase: string }> = [];
  const n = playerIds.length;

  if (n === 8) {
    for (let i = 0; i < 4; i++) {
      fixtures.push({
        homePlayerId: playerIds[i * 2],
        awayPlayerId: playerIds[i * 2 + 1],
        round: 1,
        knockoutPhase: "QF",
      });
    }
    fixtures.push({ homePlayerId: playerIds[0], awayPlayerId: playerIds[2], round: 2, knockoutPhase: "SF" });
    fixtures.push({ homePlayerId: playerIds[4], awayPlayerId: playerIds[6], round: 2, knockoutPhase: "SF" });
    fixtures.push({ homePlayerId: playerIds[0], awayPlayerId: playerIds[4], round: 3, knockoutPhase: "F" });
  } else if (n === 4) {
    for (let i = 0; i < 2; i++) {
      fixtures.push({
        homePlayerId: playerIds[i * 2],
        awayPlayerId: playerIds[i * 2 + 1],
        round: 1,
        knockoutPhase: "SF",
      });
    }
    fixtures.push({ homePlayerId: playerIds[0], awayPlayerId: playerIds[2], round: 2, knockoutPhase: "F" });
  } else if (n === 2) {
    fixtures.push({
      homePlayerId: playerIds[0],
      awayPlayerId: playerIds[1],
      round: 1,
      knockoutPhase: "F",
    });
  }

  return fixtures;
}

router.get("/tournaments", async (req, res) => {
  const tournaments = await db.select().from(tournamentsTable).orderBy(tournamentsTable.createdAt);
  res.json(tournaments);
});

router.post("/tournaments", async (req, res) => {
  const body = CreateTournamentBody.parse(req.body);
  const { name, type, playerIds } = body;

  const [tournament] = await db.insert(tournamentsTable).values({ name, type }).returning();

  await db.insert(tournamentPlayersTable).values(
    playerIds.map((playerId) => ({ tournamentId: tournament.id, playerId }))
  );

  let fixturesData: Array<{
    tournamentId: number;
    homePlayerId: number;
    awayPlayerId: number;
    round: number;
    knockoutPhase?: string | null;
  }> = [];

  if (type === "league") {
    const leagueFixtures = generateLeagueFixtures(playerIds);
    fixturesData = leagueFixtures.map((f) => ({
      tournamentId: tournament.id,
      homePlayerId: f.homePlayerId,
      awayPlayerId: f.awayPlayerId,
      round: f.round,
      knockoutPhase: null,
    }));
  } else {
    const koFixtures = generateKnockoutFixtures(playerIds);
    fixturesData = koFixtures.map((f) => ({
      tournamentId: tournament.id,
      homePlayerId: f.homePlayerId,
      awayPlayerId: f.awayPlayerId,
      round: f.round,
      knockoutPhase: f.knockoutPhase,
    }));
  }

  if (fixturesData.length > 0) {
    await db.insert(fixturesTable).values(fixturesData);
  }

  res.status(201).json(tournament);
});

router.get("/tournaments/:id", async (req, res) => {
  const { id } = GetTournamentParams.parse({ id: Number(req.params.id) });

  const [tournament] = await db.select().from(tournamentsTable).where(eq(tournamentsTable.id, id));
  if (!tournament) {
    res.status(404).json({ error: "Tournament not found" });
    return;
  }

  const tp = await db
    .select({ player: playersTable })
    .from(tournamentPlayersTable)
    .innerJoin(playersTable, eq(tournamentPlayersTable.playerId, playersTable.id))
    .where(eq(tournamentPlayersTable.tournamentId, id));

  const players = tp.map((r) => r.player);

  const allFixtures = await db.select().from(fixturesTable).where(eq(fixturesTable.tournamentId, id));
  const totalFixtures = allFixtures.length;
  const completedFixtures = allFixtures.filter((f) => f.played).length;

  res.json({ ...tournament, players, totalFixtures, completedFixtures });
});

router.delete("/tournaments/:id", async (req, res) => {
  const { id } = DeleteTournamentParams.parse({ id: Number(req.params.id) });
  await db.delete(tournamentsTable).where(eq(tournamentsTable.id, id));
  res.status(204).send();
});

router.get("/tournaments/:id/standings", async (req, res) => {
  const { id } = GetStandingsParams.parse({ id: Number(req.params.id) });

  const tp = await db
    .select({ player: playersTable })
    .from(tournamentPlayersTable)
    .innerJoin(playersTable, eq(tournamentPlayersTable.playerId, playersTable.id))
    .where(eq(tournamentPlayersTable.tournamentId, id));

  const players = tp.map((r) => r.player);

  const fixtures = await db
    .select()
    .from(fixturesTable)
    .where(and(eq(fixturesTable.tournamentId, id), eq(fixturesTable.played, true)));

  const statsMap: Record<number, {
    played: number; won: number; drawn: number; lost: number;
    goalsFor: number; goalsAgainst: number; points: number;
    results: string[];
  }> = {};

  for (const p of players) {
    statsMap[p.id] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, results: [] };
  }

  const playedFixturesSorted = [...fixtures].sort((a, b) => a.id - b.id);

  for (const f of playedFixturesSorted) {
    if (f.homeScore === null || f.awayScore === null) continue;

    const home = statsMap[f.homePlayerId];
    const away = statsMap[f.awayPlayerId];
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.goalsFor += f.homeScore;
    home.goalsAgainst += f.awayScore;
    away.goalsFor += f.awayScore;
    away.goalsAgainst += f.homeScore;

    if (f.homeScore > f.awayScore) {
      home.won++; home.points += 3; home.results.push("W");
      away.lost++; away.results.push("L");
    } else if (f.homeScore < f.awayScore) {
      away.won++; away.points += 3; away.results.push("W");
      home.lost++; home.results.push("L");
    } else {
      home.drawn++; home.points += 1; home.results.push("D");
      away.drawn++; away.points += 1; away.results.push("D");
    }
  }

  const standings = players.map((p) => {
    const s = statsMap[p.id];
    return {
      playerId: p.id,
      playerName: p.name,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalsFor - s.goalsAgainst,
      points: s.points,
      form: s.results.slice(-5),
    };
  });

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.playerName.localeCompare(b.playerName);
  });

  res.json(standings);
});

export default router;
