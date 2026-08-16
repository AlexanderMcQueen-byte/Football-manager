import { pgTable, serial, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const tournamentTypeEnum = pgEnum("tournament_type", [
  "league",
  "knockout",
  "cup",
  "groups_knockout",
  "double_elimination",
  "swiss",
]);
export const tournamentStatusEnum = pgEnum("tournament_status", ["setup", "active", "completed"]);
export const tournamentVisibilityEnum = pgEnum("tournament_visibility", ["public", "private"]);

export const tournamentsTable = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: tournamentTypeEnum("type").notNull(),
  status: tournamentStatusEnum("status").notNull().default("active"),
  visibility: tournamentVisibilityEnum("visibility").notNull().default("public"),
  inviteCode: text("invite_code"),
  createdByUserId: integer("created_by_user_id").references(() => usersTable.id),
  maxPlayers: integer("max_players"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTournamentSchema = createInsertSchema(tournamentsTable).omit({ id: true, createdAt: true, status: true });
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournamentsTable.$inferSelect;
