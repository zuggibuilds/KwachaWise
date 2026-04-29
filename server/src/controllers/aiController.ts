import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { getAdvisorInsights, getChatResponse } from '../services/aiService.js';
import { isIsoDate } from '../utils/dates.js';

const adviceQuerySchema = z.object({
  from: z.string().refine(isIsoDate, 'Expected YYYY-MM-DD').optional(),
  to: z.string().refine(isIsoDate, 'Expected YYYY-MM-DD').optional()
});

const chatBodySchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(1000)
      })
    )
    .max(20)
    .optional()
});

export const getAdvice = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = adviceQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid AI advisor query', parsed.error.flatten());
  }

  const insights = getAdvisorInsights(req.user.id, parsed.data.from, parsed.data.to);
  res.json({ insights });
});

export const chat = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = chatBodySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid chat message', parsed.error.flatten());
  }

  const response = getChatResponse(req.user.id, parsed.data.message, parsed.data.history ?? []);
  res.json(response);
});
