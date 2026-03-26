import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  tournamentsTable,
  tournamentPlayersTable,
  playersTable,
  fixturesTable,
} from "@workspace/db/schema";
import { requireAdmin } from "../middlewares/requireAdmin";
import { eq, and, inArray, sql } from "drizzle-orm";
import {
  CreateTournamentBody,
  GetTournamentParams,
  DeleteTournamentParams,
  GetStandingsParams,
  PatchTournamentParams,
  PatchTournamentBody,
} from "@workspace/api-zod";
import { buildFixturesData } from "../lib/generateFixtures";

const router: IRouter = Router();

router.get("/tournaments", async (req, res) => {
  const tournaments = await db.select().from(tournamentsTable).orderBy(tournamentsTable.createdAt);
  res.json(tournaments);
});

router.post("/tournaments", requireAdmin, async (req, res) => {
  const body = CreateTournamentBody.parse(req.body);
  const { name, type, playerIds = [], maxPlayers } = body;

  // Registration mode: maxPlayers set, no pre-selected players → wait for registrations
  const isRegistrationMode = !!maxPlayers && playerIds.length === 0;

  const [tournament] = await db
    .insert(tournamentsTable)
    .values({
      name,
      type,
      maxPlayers: maxPlayers ?? null,
      status: isRegistrationMode ? "setup" : "active",
    })
    .returning();

  if (playerIds.length > 0) {
    await db.insert(tournamentPlayersTable).values(
      playerIds.map((playerId) => ({ tournamentId: tournament.id, playerId }))
    );

    const fixturesData = buildFixturesData(tournament.id, type, playerIds);
    if (fixturesData.length > 0) {
      await db.insert(fixturesTable).values(fixturesData);
    }
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

router.patch("/tournaments/:id", requireAdmin, async (req, res) => {
  const { id } = PatchTournamentParams.parse({ id: Number(req.params.id) });
  const body = PatchTournamentBody.parse(req.body);

  const [tournament] = await db.select().from(tournamentsTable).where(eq(tournamentsTable.id, id));
  if (!tournament) {
    res.status(404).json({ error: "Tournament not found" });
    return;
  }

  // Only allow edits while still in setup (or scheduling date on any non-completed)
  const updates: Record<string, unknown> = {};

  if (body.scheduledAt !== undefined) {
    updates.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
  }

  if (tournament.status === "setup") {
    if (body.name !== undefined) updates.name = body.name;
    if (body.maxPlayers !== undefined) {
      // Don't allow reducing below already-approved count
      const approvedCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tournamentPlayersTable)
        .where(eq(tournamentPlayersTable.tournamentId, id))
        .then((r) => r[0]?.count ?? 0);
      if (body.maxPlayers !== null && body.maxPlayers < approvedCount) {
        res.status(400).json({ error: `Cannot set maxPlayers below current approved player count (${approvedCount})` });
        return;
      }
      updates.maxPlayers = body.maxPlayers;
    }
  }

  if (Object.keys(updates).length === 0) {
    res.json(tournament);
    return;
  }

  const [updated] = await db.update(tournamentsTable).set(updates).where(eq(tournamentsTable.id, id)).returning();
  res.json(updated);
});

router.delete("/tournaments/:id", requireAdmin, async (req, res) => {
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
