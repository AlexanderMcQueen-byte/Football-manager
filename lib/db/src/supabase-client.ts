/**
 * Supabase Database Client
 * Provides database connection using Supabase PostgreSQL backend
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Ensure you have configured Supabase credentials.",
  );
}

// Create PostgreSQL connection pool
// Supabase provides a PostgreSQL-compatible connection string
const client = postgres(process.env.DATABASE_URL, {
  // Connection pooling options
  max: 20, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
});

// Initialize Drizzle ORM with schema
export const db = drizzle(client, { schema });

// Health check function
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await client`SELECT 1 as status`;
    return result.length > 0;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  await client.end();
}

export * from "./schema";
