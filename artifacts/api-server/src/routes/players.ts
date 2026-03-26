import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { playersTable, insertPlayerSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  CreatePlayerBody,
  DeletePlayerParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/players", async (req, res) => {
  const players = await db.select().from(playersTable).orderBy(playersTable.name);
  res.json(players);
});

router.post("/players", async (req, res) => {
  const body = CreatePlayerBody.parse(req.body);
  const [player] = await db.insert(playersTable).values({ name: body.name }).returning();
  res.status(201).json(player);
});

router.delete("/players/:id", async (req, res) => {
  const { id } = DeletePlayerParams.parse({ id: Number(req.params.id) });
  await db.delete(playersTable).where(eq(playersTable.id, id));
  res.status(204).send();
});

export default router;
