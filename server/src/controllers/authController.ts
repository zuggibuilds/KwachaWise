import type { Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { loginUser, registerUser, getOrCreateGoogleUser } from '../services/authService.js';
import { getUserById } from '../services/shared.js';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const googleAuthSchema = z.object({
  credential: z.string()
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid registration payload', parsed.error.flatten());
  }

  const result = await registerUser(parsed.data.email, parsed.data.password);
  res.status(201).json({ token: result.token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid login payload', parsed.error.flatten());
  }

  const result = await loginUser(parsed.data.email, parsed.data.password);
  res.json({ token: result.token });
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const parsed = googleAuthSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid Google auth payload', parsed.error.flatten());
  }

  try {
    // Decode the Google ID token (without verification for now)
    // In production, you should verify the token signature using Google's public keys
    const decoded = jwt.decode(parsed.data.credential) as any;
    
    if (!decoded || !decoded.email) {
      throw new AppError(401, 'INVALID_TOKEN', 'Invalid Google token');
    }

    // Get or create user
    const result = await getOrCreateGoogleUser(decoded.email, decoded.name || decoded.email);
    res.json({ token: result.token });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(401, 'INVALID_TOKEN', 'Failed to process Google token');
  }
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const user = getUserById(req.user.id);
  res.json({ user: { id: user.id, email: user.email, created_at: user.created_at } });
});
