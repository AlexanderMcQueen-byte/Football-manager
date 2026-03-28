import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const emailVerificationsTable = pgTable("email_verifications", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
