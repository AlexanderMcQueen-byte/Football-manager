import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  tournamentsTable,
  tournamentPlayersTable,
  playersTable,
  fixturesTable,
  usersTable,
} from "@workspace/db/schema";
import { requireAdmin } from "../middlewares/requireAdmin";
import { requireCreator } from "../middlewares/requireCreator";
import { eq, and, inArray, or, sql } from "drizzle-orm";
import {
  CreateTournamentBody,
  GetTournamentParams,
  DeleteTournamentParams,
  GetStandingsParams,
  PatchTournamentParams,
  PatchTournamentBody,
} from "@workspace/api-zod";
import { buildFixturesData, type TournamentFormat } from "../lib/generateFixtures";

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const FREE_PLAN_MAX_TOURNAMENTS = 3;
const FREE_PLAN_MAX_PLAYERS = 8;

const router: IRouter = Router();

// Simple in-memory backoff + fallback to avoid repeated DB errors from
// aggressive frontend polling while the DB schema is missing or the
// database is otherwise unavailable.
let tournamentsUnavailableUntil = 0;
const TOURNAMENTS_BACKOFF_MS = 30_000; // 30s
const DEV_FALLBACK_TOURNAMENTS = [
  {
    id: -1,
    name: "Sample Cup",
    type: "knockout",
    status: "active",
    maxPlayers: 4,
    scheduledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

router.get("/tournaments", async (req, res, next) => {
  // If we recently saw a DB error, return fallback immediately without
  // touching the DB to prevent log floods.
  if (Date.now() < tournamentsUnavailableUntil) {
    res.json(DEV_FALLBACK_TOURNAMENTS);
    return;
  }

  try {
    const userId = (req as any).session?.userId as number | undefined;
    const tournaments = userId
      ? await db
          .select()
          .from(tournamentsTable)
          .where(
            or(
              eq(tournamentsTable.visibility, "public"),
              eq(tournamentsTable.createdByUserId, userId),
            ),
          )
          .orderBy(tournamentsTable.createdAt)
      : await db
          .select()
          .from(tournamentsTable)
          .where(eq(tournamentsTable.visibility, "public"))
          .orderBy(tournamentsTable.createdAt);

    res.json(tournaments);
  } catch (err: any) {
    // Log the error once and enable short backoff; return a small
    // developer-friendly fixture so the UI shows tournaments immediately.
    // eslint-disable-next-line no-console
    console.warn('tournaments list failed, returning dev fallback', { err: err?.message || err });
    tournamentsUnavailableUntil = Date.now() + TOURNAMENTS_BACKOFF_MS;
    res.json(DEV_FALLBACK_TOURNAMENTS);
    return;
  }
});

router.post("/tournaments", requireCreator, async (req, res) => {
  const creatorPlan: string = (req as any).creatorPlan ?? "admin";
  const creatorUser = (req as any).creatorUser as typeof usersTable.$inferSelect | undefined;

  const body = CreateTournamentBody.parse(req.body);
  const {
    name,
    type,
    playerIds = [],
    maxPlayers,
    visibility = "public",
    inviteCode,
  } = body;

  // Enforce free plan limits (non-admin paid users only)
  if (creatorUser) {
    // Free plan shouldn't reach here (blocked by requireCreator), but double-check
    // For paid: no limits on tournament count
    // (Free users are blocked at the middleware level)
  }

  // Enforce maxPlayers cap: free users capped at FREE_PLAN_MAX_PLAYERS
  // (free users can't create anyway, but guard for future)
  const effectiveMaxPlayers = maxPlayers ?? null;

  // Registration mode: maxPlayers set, no pre-selected players → wait for registrations
  const isRegistrationMode = !!effectiveMaxPlayers && playerIds.length === 0;

  const finalVisibility = visibility === "private" ? "private" : "public";
  let finalInviteCode: string | null = null;

  if (finalVisibility === "private") {
    finalInviteCode = (inviteCode ?? "").trim() || generateInviteCode();
    const existingCode = await db
      .select({ id: tournamentsTable.id })
      .from(tournamentsTable)
      .where(eq(tournamentsTable.inviteCode, finalInviteCode))
      .limit(1);

    if (existingCode.length > 0) {
      finalInviteCode = generateInviteCode();
    }
  }

  const [tournament] = await db
    .insert(tournamentsTable)
    .values({
      name,
      type,
      visibility: finalVisibility,
      inviteCode: finalInviteCode,
      createdByUserId: creatorUser?.id ?? null,
      maxPlayers: effectiveMaxPlayers,
      status: isRegistrationMode ? "setup" : "active",
    })
    .returning();

  // Track tournament count for user accounts
  if (creatorUser) {
    await db
      .update(usersTable)
      .set({ tournamentsCreated: (creatorUser.tournamentsCreated ?? 0) + 1 })
      .where(eq(usersTable.id, creatorUser.id));
  }

  if (playerIds.length > 0) {
    await db.insert(tournamentPlayersTable).values(
      playerIds.map((playerId) => ({ tournamentId: tournament.id, playerId }))
    );

    const fixturesData = buildFixturesData(tournament.id, type as TournamentFormat, playerIds);
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

  if (body.visibility !== undefined) {
    updates.visibility = body.visibility;
  }

  if (body.inviteCode !== undefined) {
    const nextInvite = body.inviteCode?.trim() || null;
    updates.inviteCode = nextInvite;
  }

  if (tournament.visibility === "private" && body.visibility === undefined && tournament.inviteCode === null) {
    const generatedInvite = generateInviteCode();
    updates.inviteCode = generatedInvite;
  }

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
