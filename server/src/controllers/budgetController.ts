import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { createBudget, deleteBudget, listBudgets, updateBudget } from '../services/budgetService.js';
import { isIsoMonth } from '../utils/dates.js';

const budgetSchema = z.object({
  month: z.string().refine(isIsoMonth, 'Expected YYYY-MM'),
  categoryId: z.string().min(1),
  amountNgwee: z.number().int().min(0)
});

const patchSchema = budgetSchema.partial();

export const getBudgets = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const month = typeof req.query.month === 'string' && isIsoMonth(req.query.month) ? req.query.month : new Date().toISOString().slice(0, 7);
  res.json({ budgets: listBudgets(req.user.id, month) });
});

export const postBudget = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = budgetSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid budget payload', parsed.error.flatten());
  }

  res.status(201).json({ budget: createBudget(req.user.id, parsed.data) });
});

export const patchBudget = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid budget payload', parsed.error.flatten());
  }

  const budgetId = String(req.params.id);
  res.json({ budget: updateBudget(req.user.id, budgetId, parsed.data) });
});

export const removeBudget = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  deleteBudget(req.user.id, String(req.params.id));
  res.status(204).send();
});
