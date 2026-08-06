import { pgEnum, pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "success", "failed"]);

export const paymentTransactionsTable = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reference: text("reference").notNull().unique(),
  plan: text("plan").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export type PaymentTransaction = typeof paymentTransactionsTable.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactionsTable.$inferInsert;