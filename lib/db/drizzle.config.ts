import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Configure your Supabase credentials or local database URL."
  );
}

// Determine if using local or remote Supabase
const isLocal = process.env.DATABASE_URL?.includes("localhost");
const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Configuration for Supabase/local development
  out: isLocal && isDev ? "./drizzle/local" : "./drizzle",
  migrations: {
    schema: "drizzle_migrations",
    table: "__drizzle_migrations__",
  },
});
