/**
 * API Server Initialization Module
 * Handles database setup and health checks on startup
 */

import { db, healthCheck } from "@workspace/db";
import type { Express } from "express";
import { logger } from "./logger";

export async function initializeDatabase(): Promise<boolean> {
  try {
    logger.info("Checking database connection...");
    const isHealthy = await healthCheck();
    
    if (!isHealthy) {
      logger.error("Database health check failed");
      return false;
    }

    logger.info("✅ Database connection successful");
    return true;
  } catch (error) {
    logger.error("Failed to initialize database:", error);
    return false;
  }
}

/**
 * Setup database routes for health checks
 */
export function setupDatabaseRoutes(app: Express): void {
  // Health check endpoint
  app.get("/health", async (_req, res) => {
    try {
      const isHealthy = await healthCheck();
      
      if (isHealthy) {
        res.status(200).json({
          status: "healthy",
          timestamp: new Date().toISOString(),
          database: "connected",
        });
      } else {
        res.status(503).json({
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          database: "disconnected",
        });
      }
    } catch (error) {
      res.status(503).json({
        status: "error",
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Info endpoint
  app.get("/api/info", async (_req, res) => {
    res.json({
      name: "eFootball Organizer API",
      version: "1.0.0",
      database: process.env.DATABASE_URL?.includes("supabase") 
        ? "Supabase Cloud" 
        : "Local PostgreSQL",
      environment: process.env.NODE_ENV || "development",
    });
  });
}
