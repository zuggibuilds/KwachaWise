import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { loginUser, registerUser } from '../services/authService.js';
import { getUserById } from '../services/shared.js';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
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

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const user = getUserById(req.user.id);
  res.json({ user: { id: user.id, email: user.email, created_at: user.created_at } });
});
