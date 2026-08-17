import { Router, type IRouter, type Request } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, emailVerificationsTable } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";
import dns from "dns/promises";
import { getUncachableResendClient } from "../lib/resend";
import { userSession } from "../lib/sessions";
import { getFreshUserById, getPlanExpiry, type PaidPlan } from "../lib/userPlans";
import { paymentTransactionsTable } from "@workspace/db/schema";
import crypto from "crypto";

const router: IRouter = Router();

router.use("/users", userSession);

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

router.post("/users/register", async (req, res) => {
  const { email, password, displayName } = req.body ?? {};

  if (!email || !password || !displayName) {
    res.status(400).json({ error: "email, password and displayName are required" });
    return;
  }

  const trimmedEmail = String(email).trim();
  const trimmedDisplayName = String(displayName).trim();

  if (!EMAIL_RE.test(trimmedEmail)) {
    res.status(400).json({ error: "Please enter a valid email address" });
    return;
  }

  if (String(password).length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const domainLive = await isEmailDomainLive(trimmedEmail);
  if (!domainLive) {
    res.status(400).json({ error: "That email address doesn't appear to be valid. Please use a real email." });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, trimmedEmail.toLowerCase())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const [user] = await db
    .insert(usersTable)
    .values({
      email: trimmedEmail.toLowerCase(),
      passwordHash,
      displayName: trimmedDisplayName,
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
  req.session.userId = user.id;
  req.session.save((saveError) => {
    if (saveError) { res.status(500).json({ error: "Session error" }); return; }
    getFreshUserById(user.id)
      .then((freshUser) => {
        res.json(freshUser ? safeUser(freshUser) : safeUser(user));
      })
      .catch((err) => {
        console.error("Error fetching fresh user:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Internal server error" });
        }
      });
  });
});

// ─── Me ───────────────────────────────────────────────────────────────────────
router.get("/users/me", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const user = await getFreshUserById(req.session.userId);
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

const PAYSTACK_API = "https://api.paystack.co";
const PLAN_AMOUNTS_KOBO: Record<PaidPlan, number> = {
  monthly: 200000,
  yearly: 700000,
  lifetime: 1500000,
};

function paystackHeaders() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

function isPaidPlan(value: unknown): value is PaidPlan {
  return value === "monthly" || value === "yearly" || value === "lifetime";
}

async function activateVerifiedPayment(reference: string) {
  const [transaction] = await db
    .select()
    .from(paymentTransactionsTable)
    .where(eq(paymentTransactionsTable.reference, reference))
    .limit(1);
  if (!transaction) throw new Error("Payment reference not found");
  if (transaction.status === "success") return getFreshUserById(transaction.userId);

  const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, transaction.userId)).limit(1);
  if (!currentUser) throw new Error("User not found");

  const now = new Date();
  const paidPlan = transaction.plan as PaidPlan;
  const baseDate = currentUser.planExpiresAt && currentUser.planExpiresAt > now
    ? currentUser.planExpiresAt
    : now;
  const expiresAt = paidPlan === "lifetime" ? null : getPlanExpiry(paidPlan, baseDate);

  await db.transaction(async (tx) => {
    await tx
      .update(paymentTransactionsTable)
      .set({ status: "success", paidAt: now })
      .where(eq(paymentTransactionsTable.id, transaction.id));
    await tx
      .update(usersTable)
      .set({ plan: paidPlan, planActivatedAt: now, planExpiresAt: expiresAt })
      .where(eq(usersTable.id, transaction.userId));
  });

  return getFreshUserById(transaction.userId);
}

router.post("/users/paystack/initialize", async (req, res) => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    res.status(503).json({ error: "Paystack is not configured." });
    return;
  }
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const plan = req.body?.plan;
  if (!isPaidPlan(plan)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  const user = await getFreshUserById(req.session.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const reference = `efm_${user.id}_${plan}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const amount = PLAN_AMOUNTS_KOBO[plan];
  await db.insert(paymentTransactionsTable).values({
    userId: user.id,
    reference,
    plan,
    amount,
    currency: "NGN",
  });

  const requestedCallbackUrl = typeof req.body?.callbackUrl === "string" ? req.body.callbackUrl : "";
  const callbackUrl = requestedCallbackUrl || process.env.PAYSTACK_CALLBACK_URL || `https://${req.get("host")}/pricing`;
  try {
    const parsed = new URL(callbackUrl);
    if (parsed.protocol !== "https:" || !parsed.pathname.endsWith("/pricing") || parsed.search || parsed.hash) {
      throw new Error("invalid callback");
    }
    const requestOrigin = req.get("origin");
    if (requestedCallbackUrl && requestOrigin && new URL(requestOrigin).origin !== parsed.origin) {
      throw new Error("callback origin mismatch");
    }
  } catch {
    res.status(500).json({ error: "Paystack callback URL must be an HTTPS /pricing URL." });
    return;
  }
  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: paystackHeaders(),
    body: JSON.stringify({
      email: user.email,
      amount,
      currency: "NGN",
      reference,
      callback_url: callbackUrl,
      metadata: { userId: user.id, plan },
    }),
  });
  const payload = await response.json() as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; access_code?: string; reference?: string };
  };
  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    await db.update(paymentTransactionsTable).set({ status: "failed" }).where(eq(paymentTransactionsTable.reference, reference));
    res.status(502).json({ error: payload.message || "Paystack could not initialize the payment." });
    return;
  }

  res.json({
    authorizationUrl: payload.data.authorization_url,
    reference: payload.data.reference || reference,
    amount,
    currency: "NGN",
  });
});

router.post("/users/paystack/verify", async (req, res) => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    res.status(503).json({ error: "Paystack is not configured." });
    return;
  }
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const reference = String(req.body?.reference || "");
  const [transaction] = await db
    .select()
    .from(paymentTransactionsTable)
    .where(eq(paymentTransactionsTable.reference, reference))
    .limit(1);
  if (!transaction || transaction.userId !== req.session.userId) {
    res.status(404).json({ error: "Payment reference not found." });
    return;
  }

  const response = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: paystackHeaders(),
  });
  const payload = await response.json() as {
    status?: boolean;
    message?: string;
    data?: { status?: string; amount?: number; currency?: string; reference?: string };
  };
  const paid = response.ok
    && payload.status
    && payload.data?.status === "success"
    && payload.data.reference === reference
    && payload.data.amount === transaction.amount
    && payload.data.currency === transaction.currency;
  if (!paid) {
    await db.update(paymentTransactionsTable).set({ status: "failed" }).where(eq(paymentTransactionsTable.id, transaction.id));
    res.status(402).json({ error: payload.message || "Payment was not verified." });
    return;
  }

  const user = await activateVerifiedPayment(reference);
  res.json({ ok: true, user: user ? safeUser(user) : null });
});

router.post("/users/paystack/webhook", async (req, res) => {
  const signature = req.header("x-paystack-signature");
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!signature || !rawBody || !process.env.PAYSTACK_SECRET_KEY) {
    res.sendStatus(401);
    return;
  }
  const expected = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    res.sendStatus(401);
    return;
  }

  if (req.body?.event === "charge.success" && req.body?.data?.reference) {
    try {
      const reference = String(req.body.data.reference);
      const [transaction] = await db
        .select()
        .from(paymentTransactionsTable)
        .where(eq(paymentTransactionsTable.reference, reference))
        .limit(1);
      if (transaction
        && req.body.data.status === "success"
        && Number(req.body.data.amount) === transaction.amount
        && req.body.data.currency === transaction.currency) {
        await activateVerifiedPayment(reference);
      }
    } catch (error) {
      console.error("Paystack webhook activation failed:", error);
      res.sendStatus(500);
      return;
    }
  }
  res.sendStatus(200);
});

function safeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export default router;
