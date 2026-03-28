import { pgTable, serial, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan_type", ["free", "monthly", "yearly", "lifetime"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  plan: planEnum("plan").notNull().default("free"),
  tournamentsCreated: integer("tournaments_created").notNull().default(0),
  planActivatedAt: timestamp("plan_activated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
