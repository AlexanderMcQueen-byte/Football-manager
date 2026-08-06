import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { adminSession, hasCookie, userSession } from "../lib/sessions";

/**
 * Allows tournament creation if:
 *   - The request is an admin session, OR
 *   - The request belongs to a paid user account (monthly, yearly, or lifetime plan)
 *
 * Attaches req.creatorPlan = "admin" | "monthly" | "yearly" | "lifetime" for downstream use.
 */
export async function requireCreator(req: Request, res: Response, next: NextFunction) {
  const loadSession = hasCookie(req, "efm.admin.sid") ? adminSession : userSession;

  loadSession(req, res, async (sessionError) => {
    if (sessionError) {
      next(sessionError);
      return;
    }

    // Admin and user sessions are separate. An admin cookie is authoritative
    // for this request; otherwise evaluate the user account session.
    if (hasCookie(req, "efm.admin.sid") && req.session?.role === "admin") {
      (req as any).creatorPlan = "admin";
      next();
      return;
    }

    if (req.session?.userId) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
      if (user && user.plan !== "free") {
        (req as any).creatorPlan = user.plan;
        (req as any).creatorUser = user;
        next();
        return;
      }
      if (user) {
        res.status(403).json({ error: "Upgrade required", code: "UPGRADE_REQUIRED" });
        return;
      }
    }

    res.status(403).json({ error: "You must be logged in with a paid plan to create tournaments", code: "UPGRADE_REQUIRED" });
  });
}
