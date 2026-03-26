import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { fixturesTable, playersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import {
  ListFixturesQueryParams,
  SubmitResultParams,
  SubmitResultBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/fixtures", async (req, res) => {
  const query = ListFixturesQueryParams.parse({
    tournamentId: Number(req.query.tournamentId),
    round: req.query.round !== undefined ? Number(req.query.round) : undefined,
  });

  const whereConditions = [eq(fixturesTable.tournamentId, query.tournamentId)];
  if (query.round !== undefined) {
    whereConditions.push(eq(fixturesTable.round, query.round));
  }

  const fixtures = await db
    .select({
      id: fixturesTable.id,
      tournamentId: fixturesTable.tournamentId,
      round: fixturesTable.round,
      homePlayerId: fixturesTable.homePlayerId,
      awayPlayerId: fixturesTable.awayPlayerId,
      homeScore: fixturesTable.homeScore,
      awayScore: fixturesTable.awayScore,
      played: fixturesTable.played,
      knockoutPhase: fixturesTable.knockoutPhase,
    })
    .from(fixturesTable)
    .where(and(...whereConditions))
    .orderBy(fixturesTable.round, fixturesTable.id);

  const homeAliasTable = db.$with("home_players").as(
    db.select().from(playersTable)
  );

  const allPlayerIds = [...new Set(fixtures.flatMap((f) => [f.homePlayerId, f.awayPlayerId]))];
  const players = allPlayerIds.length > 0
    ? await db.select().from(playersTable)
    : [];

  const playerMap: Record<number, string> = {};
  for (const p of players) {
    playerMap[p.id] = p.name;
  }

  const enriched = fixtures.map((f) => ({
    ...f,
    homePlayerName: playerMap[f.homePlayerId] ?? "Unknown",
    awayPlayerName: playerMap[f.awayPlayerId] ?? "Unknown",
  }));

  res.json(enriched);
});

router.put("/fixtures/:id/result", async (req, res) => {
  const { id } = SubmitResultParams.parse({ id: Number(req.params.id) });
  const body = SubmitResultBody.parse(req.body);

  const [fixture] = await db
    .update(fixturesTable)
    .set({
      homeScore: body.homeScore,
      awayScore: body.awayScore,
      played: true,
      playedAt: new Date(),
    })
    .where(eq(fixturesTable.id, id))
    .returning();

  if (!fixture) {
    res.status(404).json({ error: "Fixture not found" });
    return;
  }

  const players = await db
    .select()
    .from(playersTable)
    .where(
      eq(playersTable.id, fixture.homePlayerId)
    );

  const awayPlayers = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, fixture.awayPlayerId));

  const homePlayerName = players[0]?.name ?? "Unknown";
  const awayPlayerName = awayPlayers[0]?.name ?? "Unknown";

  res.json({
    ...fixture,
    homePlayerName,
    awayPlayerName,
  });
});

export default router;
