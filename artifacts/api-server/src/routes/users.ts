import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

// ─── Register ────────────────────────────────────────────────────────────────
router.post("/users/register", async (req, res) => {
  const { email, password, displayName } = req.body ?? {};

  if (!email || !password || !displayName) {
    res.status(400).json({ error: "email, password and displayName are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    email: email.toLowerCase(),
    passwordHash,
    displayName,
    plan: "free",
  }).returning();

  req.session.userId = user.id;
  req.session.save((err) => {
    if (err) { res.status(500).json({ error: "Session error" }); return; }
    res.status(201).json(safeUser(user));
  });
});

// ─── Login (user) ─────────────────────────────────────────────────────────────
router.post("/users/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  req.session.userId = user.id;
  req.session.save((err) => {
    if (err) { res.status(500).json({ error: "Session error" }); return; }
    res.json(safeUser(user));
  });
});

// ─── Me ───────────────────────────────────────────────────────────────────────
router.get("/users/me", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(safeUser(user));
});

// ─── Logout (user) ────────────────────────────────────────────────────────────
router.post("/users/logout", (req, res) => {
  req.session.userId = undefined;
  req.session.save(() => res.json({ ok: true }));
});

// ─── Upgrade plan (mock — no real payment yet) ────────────────────────────────
router.post("/users/upgrade", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { plan } = req.body ?? {};
  const validPlans = ["monthly", "yearly", "lifetime"] as const;
  if (!validPlans.includes(plan)) {
    res.status(400).json({ error: "Invalid plan. Must be monthly, yearly, or lifetime" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ plan, planActivatedAt: new Date() })
    .where(eq(usersTable.id, req.session.userId))
    .returning();

  res.json(safeUser(updated));
});

function safeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export default router;
