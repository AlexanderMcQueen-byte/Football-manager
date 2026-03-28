import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { inquiriesTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

// ─── Submit inquiry (anyone) ──────────────────────────────────────────────────
router.post("/inquiries", async (req, res) => {
  const { name, email, subject, message } = req.body ?? {};

  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: "name, email, subject and message are required" });
    return;
  }
  if (message.trim().length < 10) {
    res.status(400).json({ error: "Message must be at least 10 characters" });
    return;
  }

  const [row] = await db
    .insert(inquiriesTable)
    .values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    })
    .returning();

  res.status(201).json(row);
});

// ─── List all inquiries (admin) ───────────────────────────────────────────────
router.get("/admin/inquiries", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(inquiriesTable)
    .orderBy(desc(inquiriesTable.createdAt));
  res.json(rows);
});

// ─── Update inquiry status (admin) ───────────────────────────────────────────
router.patch("/admin/inquiries/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { status, adminNote } = req.body ?? {};
  const validStatuses = ["open", "resolved"] as const;
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" }); return;
  }

  const [updated] = await db
    .update(inquiriesTable)
    .set({
      ...(status ? { status } : {}),
      ...(status === "resolved" ? { resolvedAt: new Date() } : {}),
      ...(adminNote !== undefined ? { adminNote: adminNote.trim() } : {}),
    })
    .where(eq(inquiriesTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Inquiry not found" }); return; }
  res.json(updated);
});

export default router;
