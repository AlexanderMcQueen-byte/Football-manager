import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tournamentTypeEnum = pgEnum("tournament_type", ["league", "knockout"]);
export const tournamentStatusEnum = pgEnum("tournament_status", ["setup", "active", "completed"]);

export const tournamentsTable = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: tournamentTypeEnum("type").notNull(),
  status: tournamentStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTournamentSchema = createInsertSchema(tournamentsTable).omit({ id: true, createdAt: true, status: true });
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournamentsTable.$inferSelect;
