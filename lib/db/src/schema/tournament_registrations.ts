import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { tournamentsTable } from "./tournaments";

export const registrationStatusEnum = pgEnum("registration_status", ["pending", "approved", "rejected"]);

export const tournamentRegistrationsTable = pgTable("tournament_registrations", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournamentsTable.id, { onDelete: "cascade" }),
  efootballUsername: text("efootball_username").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  status: registrationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TournamentRegistration = typeof tournamentRegistrationsTable.$inferSelect;
