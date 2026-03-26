import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { tournamentRegistrationsTable, tournamentsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";
import { z } from "zod";

const router: IRouter = Router();

const RegisterBody = z.object({
  efootballUsername: z.string().min(2).max(60),
  whatsappNumber: z.string().min(7).max(20).regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number"),
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

  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid data" });
    return;
  }

  const { efootballUsername, whatsappNumber } = parsed.data;

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
  const tournamentId = parseInt(req.params.id, 10);
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
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [updated] = await db
    .update(tournamentRegistrationsTable)
    .set({ status: parsed.data.status })
    .where(eq(tournamentRegistrationsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  res.json(updated);
});

export default router;
