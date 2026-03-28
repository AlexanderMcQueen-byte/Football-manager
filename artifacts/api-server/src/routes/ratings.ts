import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ratingsTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.post("/ratings", async (req, res) => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const { rating, comment } = req.body ?? {};
  const r = Number(rating);
  if (!r || r < 1 || r > 5) {
    res.status(400).json({ error: "Rating must be 1–5" });
    return;
  }

  const [row] = await db
    .insert(ratingsTable)
    .values({ userId: req.session.userId, rating: r, comment: comment ?? null })
    .returning();

  res.status(201).json(row);
});

export default router;
