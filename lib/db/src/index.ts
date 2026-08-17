/**
 * Database Connection Module
 * Supports both Supabase and local PostgreSQL databases
 * 
 * Uses postgres-js for better performance and connection pooling
 * compared to the older pg driver
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database or configure Supabase credentials?"
  );
}

/**
 * Create PostgreSQL connection
 * 
 * For Supabase:
 * - Use the connection pooler for better performance (pgBouncer)
 * - CONNECTION_STRING format: postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 * 
 * For local development:
 * - Direct connection to PostgreSQL
 * - CONNECTION_STRING format: postgresql://postgres:password@localhost:5432/postgres
 */
const client = postgres(process.env.DATABASE_URL, {
  // Connection pooling configuration
  max: process.env.NODE_ENV === "production" ? 20 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
  
  // SSL configuration for Supabase (required for production)
  ssl: process.env.DATABASE_URL?.includes("supabase") 
    ? "require" 
    : process.env.DATABASE_URL?.includes("localhost")
    ? false
    : "require",

  // Prepare statements
  prepare: process.env.NODE_ENV === "production",
});

export const db = drizzle(client, { schema });

/**
 * Health check to verify database connectivity
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await client`SELECT 1 as status`;
    return result.length > 0;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

/**
 * Gracefully close database connection
 * Call this when shutting down the application
 */
export async function closeDatabase(): Promise<void> {
  try {
    await client.end();
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
}

export * from "./schema";
