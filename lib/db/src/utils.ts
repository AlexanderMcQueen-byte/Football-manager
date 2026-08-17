/**
 * Database Utilities
 * Helper functions for common database operations
 */

import { db, usersTable, emailVerificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { User } from "@workspace/db";

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  
  return users[0];
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | undefined> {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
  
  return users[0];
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  passwordHash: string;
  displayName: string;
}): Promise<User> {
  const result = await db
    .insert(usersTable)
    .values(data)
    .returning();

  if (!result[0]) {
    throw new Error("Failed to create user");
  }

  return result[0];
}

/**
 * Update user
 */
export async function updateUser(
  id: number,
  data: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User> {
  const result = await db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, id))
    .returning();

  if (!result[0]) {
    throw new Error("User not found");
  }

  return result[0];
}

/**
 * Delete user by ID
 */
export async function deleteUser(id: number): Promise<boolean> {
  const result = await db
    .delete(usersTable)
    .where(eq(usersTable.id, id));

  return result.rowCount ? result.rowCount > 0 : false;
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(limit = 100, offset = 0): Promise<User[]> {
  return await db
    .select()
    .from(usersTable)
    .limit(limit)
    .offset(offset);
}
