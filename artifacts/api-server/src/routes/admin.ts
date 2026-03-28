import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (req.session?.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

// ─── List all users ───────────────────────────────────────────────────────────
router.get("/admin/users", requireAdmin, async (_req, res) => {
  const users = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      displayName: usersTable.displayName,
      plan: usersTable.plan,
      planActivatedAt: usersTable.planActivatedAt,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(usersTable.createdAt);

  res.json(users);
});

// ─── Update a user's plan ─────────────────────────────────────────────────────
router.patch("/admin/users/:id/plan", requireAdmin, async (req, res) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  const { plan } = req.body ?? {};
  const validPlans = ["free", "monthly", "yearly", "lifetime"] as const;
  if (!validPlans.includes(plan)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({
      plan,
      planActivatedAt: plan === "free" ? null : new Date(),
    })
    .where(eq(usersTable.id, userId))
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      displayName: usersTable.displayName,
      plan: usersTable.plan,
      planActivatedAt: usersTable.planActivatedAt,
      createdAt: usersTable.createdAt,
    });

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(updated);
});

export default router;
