import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const inquiryStatusEnum = pgEnum("inquiry_status", ["open", "resolved"]);

export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: inquiryStatusEnum("status").notNull().default("open"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});
