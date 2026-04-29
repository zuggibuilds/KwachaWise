import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { getSummaryReport } from '../services/reportService.js';
import { isIsoDate } from '../utils/dates.js';

const querySchema = z.object({
  from: z.string().refine(isIsoDate, 'Expected YYYY-MM-DD'),
  to: z.string().refine(isIsoDate, 'Expected YYYY-MM-DD')
});

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid report range', parsed.error.flatten());
  }

  res.json({ report: getSummaryReport(req.user.id, parsed.data.from, parsed.data.to) });
});
