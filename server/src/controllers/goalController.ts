import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { createGoal, listGoals, updateGoal } from '../services/goalService.js';
import { isIsoDate } from '../utils/dates.js';

const goalSchema = z.object({
  name: z.string().min(1).max(120),
  targetAmountNgwee: z.number().int().positive(),
  currentAmountNgwee: z.number().int().min(0).optional(),
  deadline: z.string().refine(isIsoDate, 'Expected YYYY-MM-DD').nullable().optional()
});

const patchSchema = goalSchema.partial();

export const getGoals = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  res.json({ goals: listGoals(req.user.id) });
});

export const postGoal = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = goalSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid goal payload', parsed.error.flatten());
  }

  res.status(201).json({ goal: createGoal(req.user.id, parsed.data) });
});

export const patchGoal = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid goal payload', parsed.error.flatten());
  }

  res.json({ goal: updateGoal(req.user.id, String(req.params.id), parsed.data) });
});
