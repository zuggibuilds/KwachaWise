import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { createCategory, listCategories } from '../services/categoryService.js';

const categorySchema = z.object({ name: z.string().min(1).max(80) });

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  res.json({ categories: listCategories(req.user.id) });
});

export const postCategory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid category payload', parsed.error.flatten());
  }

  res.status(201).json({ category: createCategory(req.user.id, parsed.data.name) });
});
