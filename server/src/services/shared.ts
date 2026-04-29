import { db } from '../db/index.js';
import { AppError } from '../utils/errors.js';

export function getUserById(userId: string): { id: string; email: string; password_hash: string; created_at: string } {
  const user = db.prepare('SELECT id, email, password_hash, created_at FROM users WHERE id = ?').get(userId) as
    | { id: string; email: string; password_hash: string; created_at: string }
    | undefined;

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  return user;
}

export function requireOwnership(ownerId: string, currentUserId: string, code: string, message: string): void {
  if (ownerId !== currentUserId) {
    throw new AppError(403, code, message);
  }
}

export function ensureArrayLength<T>(items: T[], expected: number, code: string, message: string): void {
  if (items.length !== expected) {
    throw new AppError(400, code, message);
  }
}
