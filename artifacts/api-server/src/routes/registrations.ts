import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  tournamentRegistrationsTable,
  tournamentsTable,
  playersTable,
  tournamentPlayersTable,
  fixturesTable,
} from "@workspace/db/schema";
import { eq, and, count } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";
import { z } from "zod";
import { buildFixturesData, type TournamentFormat } from "../lib/generateFixtures";

const router: IRouter = Router();

const RegisterBody = z.object({
  efootballUsername: z.string().min(2).max(60),
  whatsappNumber: z.string().min(7).max(20).regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number"),
  inviteCode: z.string().trim().max(24).optional(),
});

const UpdateStatusBody = z.object({
  status: z.enum(["approved", "rejected", "pending"]),
});

router.post("/tournaments/:id/register", async (req, res) => {
  const tournamentId = parseInt(req.params.id, 10);
  if (isNaN(tournamentId)) {
    res.status(400).json({ error: "Invalid tournament id" });
    return;
  }

  const [tournament] = await db
    .select()
    .from(tournamentsTable)
    .where(eq(tournamentsTable.id, tournamentId))
    .limit(1);

  if (!tournament) {
    res.status(404).json({ error: "Tournament not found" });
    return;
  }

  // Block registrations for finished tournaments
  if (tournament.status === "completed") {
    res.status(409).json({ error: "This tournament has finished. Registration is closed." });
    return;
  }

  // Block registrations once fixtures are generated (tournament is active)
  if (tournament.status === "active") {
    res.status(409).json({ error: "This tournament has already started. Registration is closed." });
    return;
  }

  // Block if the spot cap has been reached (count pending + approved)
  if (tournament.maxPlayers) {
    const [{ total: registeredCount }] = await db
      .select({ total: count() })
      .from(tournamentRegistrationsTable)
      .where(
        and(
          eq(tournamentRegistrationsTable.tournamentId, tournamentId),
          eq(tournamentRegistrationsTable.status, "pending"),
        ),
      );
    const approvedCount = await db
      .select({ playerId: tournamentPlayersTable.playerId })
      .from(tournamentPlayersTable)
      .where(eq(tournamentPlayersTable.tournamentId, tournamentId))
      .then((r) => r.length);

    if (registeredCount + approvedCount >= tournament.maxPlayers) {
      res.status(409).json({ error: "This tournament is full. No more spots are available." });
      return;
    }
  }

  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid data" });
    return;
  }

  const { efootballUsername, whatsappNumber, inviteCode } = parsed.data;

  if (tournament.visibility === "private") {
    const providedCode = (inviteCode ?? "").trim();
    if (!tournament.inviteCode || providedCode !== tournament.inviteCode) {
      res.status(403).json({ error: "This tournament is private. Use the invite link provided by the creator." });
      return;
    }
  }

  const existing = await db
    .select()
    .from(tournamentRegistrationsTable)
    .where(
      and(
        eq(tournamentRegistrationsTable.tournamentId, tournamentId),
        eq(tournamentRegistrationsTable.whatsappNumber, whatsappNumber),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "This WhatsApp number is already registered for this tournament." });
    return;
  }

  const [registration] = await db
    .insert(tournamentRegistrationsTable)
    .values({ tournamentId, efootballUsername, whatsappNumber })
    .returning();

  res.status(201).json(registration);
});

router.get("/tournaments/:id/registrations", requireAdmin, async (req, res) => {
  const tournamentId = parseInt(req.params.id as string, 10);
  if (isNaN(tournamentId)) {
    res.status(400).json({ error: "Invalid tournament id" });
    return;
  }

  const registrations = await db
    .select()
    .from(tournamentRegistrationsTable)
    .where(eq(tournamentRegistrationsTable.tournamentId, tournamentId))
    .orderBy(tournamentRegistrationsTable.createdAt);

  res.json(registrations);
});

router.patch("/registrations/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  // Fetch the registration first so we have username + tournamentId
  const [registration] = await db
    .select()
    .from(tournamentRegistrationsTable)
    .where(eq(tournamentRegistrationsTable.id, id))
    .limit(1);

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  // Update the status
  const [updated] = await db
    .update(tournamentRegistrationsTable)
    .set({ status: parsed.data.status })
    .where(eq(tournamentRegistrationsTable.id, id))
    .returning();

  // When approving: find-or-create the player and add them to the tournament
  if (parsed.data.status === "approved") {
    const playerName = registration.efootballUsername;
    const { tournamentId } = registration;

    // Find existing player with this name (exact match)
    let [player] = await db
      .select()
      .from(playersTable)
      .where(eq(playersTable.name, playerName))
      .limit(1);

    // Create the player if they don't exist yet
    if (!player) {
      [player] = await db
        .insert(playersTable)
        .values({ name: playerName })
        .returning();
    }

    // Only add to tournament if not already a participant
    const [alreadyIn] = await db
      .select()
      .from(tournamentPlayersTable)
      .where(
        and(
          eq(tournamentPlayersTable.tournamentId, tournamentId),
          eq(tournamentPlayersTable.playerId, player.id),
        ),
      )
      .limit(1);

    if (!alreadyIn) {
      await db
        .insert(tournamentPlayersTable)
        .values({ tournamentId, playerId: player.id });
    }

    // Check if the tournament has a player cap and is now full
    const [tournament] = await db
      .select()
      .from(tournamentsTable)
      .where(eq(tournamentsTable.id, tournamentId))
      .limit(1);

    if (tournament?.maxPlayers) {
      const currentPlayers = await db
        .select({ playerId: tournamentPlayersTable.playerId })
        .from(tournamentPlayersTable)
        .where(eq(tournamentPlayersTable.tournamentId, tournamentId));

      if (currentPlayers.length >= tournament.maxPlayers) {
        // Only generate if fixtures don't already exist
        const existingFixtures = await db
          .select({ id: fixturesTable.id })
          .from(fixturesTable)
          .where(eq(fixturesTable.tournamentId, tournamentId))
          .limit(1);

        if (existingFixtures.length === 0) {
          const playerIds = currentPlayers.map((p) => p.playerId);
          const fixturesData = buildFixturesData(tournamentId, tournament.type as TournamentFormat, playerIds);
          if (fixturesData.length > 0) {
            await db.insert(fixturesTable).values(fixturesData);
          }
          // Promote tournament to active
          await db
            .update(tournamentsTable)
            .set({ status: "active" })
            .where(eq(tournamentsTable.id, tournamentId));
        }
      }
    }
  }

  res.json(updated);
});

export default router;
