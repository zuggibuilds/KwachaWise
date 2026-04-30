import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { createId } from '../utils/ids.js';
import { nowIso } from '../utils/dates.js';
import { signToken } from '../utils/auth.js';

export interface PublicUser {
  id: string;
  email: string;
  created_at: string;
}

function toPublicUser(user: { id: string; email: string; created_at: string }): PublicUser {
  return user;
}

export async function registerUser(email: string, password: string): Promise<{ token: string; user: PublicUser }> {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = db.prepare('SELECT id FROM users WHERE lower(email) = lower(?)').get(normalizedEmail) as { id: string } | undefined;
  if (existing) {
    throw new AppError(409, 'EMAIL_IN_USE', 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = { id: createId(), email: normalizedEmail, password_hash: passwordHash, created_at: nowIso() };
  db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
    user.id,
    user.email,
    user.password_hash,
    user.created_at
  );

  const token = signToken({ id: user.id, email: user.email });
  return { token, user: toPublicUser(user) };
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: PublicUser }> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.prepare('SELECT id, email, password_hash, created_at FROM users WHERE lower(email) = lower(?)').get(normalizedEmail) as
    | { id: string; email: string; password_hash: string; created_at: string }
    | undefined;

  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const token = signToken({ id: user.id, email: user.email });
  return { token, user: toPublicUser(user) };
}

export async function getOrCreateGoogleUser(email: string, name: string): Promise<{ token: string; user: PublicUser }> {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = db.prepare('SELECT id, email, created_at FROM users WHERE lower(email) = lower(?)').get(normalizedEmail) as
    | { id: string; email: string; created_at: string }
    | undefined;

  if (existing) {
    const token = signToken({ id: existing.id, email: existing.email });
    return { token, user: toPublicUser(existing) };
  }

  // Create new user from Google
  const user = { id: createId(), email: normalizedEmail, password_hash: '', created_at: nowIso() };
  db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
    user.id,
    user.email,
    user.password_hash,
    user.created_at
  );

  const token = signToken({ id: user.id, email: user.email });
  return { token, user: toPublicUser(user) };
}
