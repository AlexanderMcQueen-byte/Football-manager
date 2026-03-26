import { pgTable, serial, integer, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { tournamentsTable } from "./tournaments";
import { playersTable } from "./players";

export const fixturesTable = pgTable("fixtures", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournamentsTable.id, { onDelete: "cascade" }),
  round: integer("round").notNull(),
  homePlayerId: integer("home_player_id").notNull().references(() => playersTable.id),
  awayPlayerId: integer("away_player_id").notNull().references(() => playersTable.id),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  played: boolean("played").notNull().default(false),
  knockoutPhase: text("knockout_phase"),
  playedAt: timestamp("played_at"),
});

export type Fixture = typeof fixturesTable.$inferSelect;
