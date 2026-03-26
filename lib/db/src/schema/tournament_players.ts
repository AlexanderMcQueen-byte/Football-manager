import { pgTable, serial, integer } from "drizzle-orm/pg-core";
import { tournamentsTable } from "./tournaments";
import { playersTable } from "./players";

export const tournamentPlayersTable = pgTable("tournament_players", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournamentsTable.id, { onDelete: "cascade" }),
  playerId: integer("player_id").notNull().references(() => playersTable.id, { onDelete: "cascade" }),
});

export type TournamentPlayer = typeof tournamentPlayersTable.$inferSelect;
