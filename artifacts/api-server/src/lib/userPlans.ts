import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";

export type PaidPlan = "monthly" | "yearly" | "lifetime";

export function planDurationDays(plan: PaidPlan): number | null {
  if (plan === "monthly") return 30;
  if (plan === "yearly") return 365;
  return null;
}

export function getPlanExpiry(plan: PaidPlan, activatedAt = new Date()): Date | null {
  const days = planDurationDays(plan);
  if (!days) return null;
  return new Date(activatedAt.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function getFreshUserById(userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return null;

  const now = new Date();
  const inferredExpiry = user.plan !== "free" && user.plan !== "lifetime" && !user.planExpiresAt && user.planActivatedAt
    ? getPlanExpiry(user.plan, user.planActivatedAt)
    : user.planExpiresAt;

  if (inferredExpiry && inferredExpiry > now && inferredExpiry !== user.planExpiresAt) {
    const [backfilled] = await db
      .update(usersTable)
      .set({ planExpiresAt: inferredExpiry })
      .where(eq(usersTable.id, userId))
      .returning();
    return backfilled ?? { ...user, planExpiresAt: inferredExpiry };
  }

  const isExpired = user.plan !== "free" && user.plan !== "lifetime" && inferredExpiry && inferredExpiry <= now;
  if (!isExpired) return user;

  const [downgraded] = await db
    .update(usersTable)
    .set({
      plan: "free",
      planActivatedAt: null,
      planExpiresAt: null,
    })
    .where(eq(usersTable.id, userId))
    .returning();

  return downgraded ?? {
    ...user,
    plan: "free" as const,
    planActivatedAt: null,
    planExpiresAt: null,
  };
}