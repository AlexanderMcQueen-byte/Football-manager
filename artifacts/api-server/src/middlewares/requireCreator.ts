import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

/**
 * Allows tournament creation if:
 *   - The request is an admin session, OR
 *   - The request belongs to a paid user account (monthly, yearly, or lifetime plan)
 *
 * Attaches req.creatorPlan = "admin" | "monthly" | "yearly" | "lifetime" for downstream use.
 */
export async function requireCreator(req: Request, res: Response, next: NextFunction) {
  // Admin session always allowed
  if (req.session?.role === "admin") {
    (req as any).creatorPlan = "admin";
    next();
    return;
  }

  // Paid user account
  if (req.session?.userId) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (user && user.plan !== "free") {
      (req as any).creatorPlan = user.plan;
      (req as any).creatorUser = user;
      next();
      return;
    }
    // Free user — reject
    if (user) {
      res.status(403).json({ error: "Upgrade required", code: "UPGRADE_REQUIRED" });
      return;
    }
  }

  res.status(403).json({ error: "You must be logged in with a paid plan to create tournaments", code: "UPGRADE_REQUIRED" });
}
