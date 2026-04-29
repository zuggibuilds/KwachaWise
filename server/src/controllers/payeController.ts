import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { calculatePaye } from '../services/payeService.js';

const payeSchema = z.object({
  gross_monthly_ngwee: z.number().int().positive(),
  effective_date: z.string().optional()
});

export const calculate = asyncHandler(async (req: Request, res: Response) => {
  const parsed = payeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid PAYE payload', parsed.error.flatten());
  }

  const result = calculatePaye(parsed.data.gross_monthly_ngwee, parsed.data.effective_date);
  res.json({ paye_ngwee: result.payeNgwee, net_pay_ngwee: result.netPayNgwee, breakdown: result.breakdown });
});
