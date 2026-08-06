import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, emailVerificationsTable } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";
import dns from "dns/promises";
import { getUncachableResendClient } from "../lib/resend";

const router: IRouter = Router();

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function isEmailDomainLive(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    const records = await dns.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── Step 1: Send verification code ──────────────────────────────────────────
router.post("/users/send-verification", async (req, res) => {
  const { email, password, displayName } = req.body ?? {};

  if (!email || !password || !displayName) {
    res.status(400).json({ error: "email, password and displayName are required" });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: "Please enter a valid email address" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  // Check the email domain can actually receive mail
  const domainLive = await isEmailDomainLive(email.trim());
  if (!domainLive) {
    res.status(400).json({ error: "That email address doesn't appear to be valid. Please use a real email." });
    return;
  }

  // Check not already registered
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  // Hash password now so we store it safely during the verification window
  const passwordHash = await bcrypt.hash(password, 10);
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete any existing pending verifications for this email
  await db.delete(emailVerificationsTable).where(eq(emailVerificationsTable.email, email.toLowerCase()));

  // Store pending verification
  await db.insert(emailVerificationsTable).values({
    email: email.toLowerCase(),
    code,
    displayName,
    passwordHash,
    expiresAt,
  });

  // Send code via Resend
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    await client.emails.send({
      from: fromEmail || "Football Manager <onboarding@resend.dev>",
      to: [email.toLowerCase()],
      subject: "Your Football Manager verification code",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0d1117;color:#e6edf3;padding:32px;border-radius:12px">
          <h1 style="font-size:24px;font-weight:700;margin:0 0 8px">Football Manager</h1>
          <p style="color:#8b949e;margin:0 0 24px">Your verification code</p>
          <div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#3fb950">${code}</span>
          </div>
          <p style="color:#8b949e;font-size:14px">This code expires in <strong style="color:#e6edf3">10 minutes</strong>. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ error: "Failed to send verification email. Please try again." });
    return;
  }

  res.json({ ok: true, message: "Verification code sent" });
});

// ─── Step 2: Verify code & create account ────────────────────────────────────
router.post("/users/verify-email", async (req, res) => {
  const { email, code } = req.body ?? {};

  if (!email || !code) {
    res.status(400).json({ error: "email and code are required" });
    return;
  }

  const now = new Date();
  const [pending] = await db
    .select()
    .from(emailVerificationsTable)
    .where(
      and(
        eq(emailVerificationsTable.email, email.toLowerCase()),
        eq(emailVerificationsTable.used, false),
        gt(emailVerificationsTable.expiresAt, now)
      )
    )
    .limit(1);

  if (!pending) {
    res.status(400).json({ error: "Invalid or expired code. Please request a new one." });
    return;
  }

  if (pending.code !== String(code).trim()) {
    res.status(400).json({ error: "Incorrect code. Please check your email and try again." });
    return;
  }

  // Mark as used
  await db
    .update(emailVerificationsTable)
    .set({ used: true })
    .where(eq(emailVerificationsTable.id, pending.id));

  // Check email not already taken (race condition guard)
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  // Create the account
  const [user] = await db
    .insert(usersTable)
    .values({
      email: email.toLowerCase(),
      passwordHash: pending.passwordHash,
      displayName: pending.displayName,
      plan: "free",
    })
    .returning();

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

  // Replace any admin identity on the existing session before saving the
  // authenticated user. This keeps the two login modes mutually exclusive.
  req.session.role = "viewer";
  req.session.userId = user.id;
  req.session.save((saveError) => {
    if (saveError) { res.status(500).json({ error: "Session error" }); return; }
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

// ─── Upgrade plan ─────────────────────────────────────────────────────────────
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
