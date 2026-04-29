import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { createTransaction, deleteTransaction, listTransactions, updateTransaction } from '../services/transactionService.js';
import { isIsoDate } from '../utils/dates.js';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amountNgwee: z.number().int().positive(),
  categoryId: z.string().min(1),
  occurredAt: z.string().refine(isIsoDate, 'Expected YYYY-MM-DD'),
  note: z.string().max(280).nullable().optional()
});

const patchSchema = transactionSchema.partial().extend({ note: z.string().max(280).nullable().optional() });

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const querySchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    type: z.enum(['income', 'expense']).optional(),
    categoryId: z.string().optional()
  });

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid query parameters', parsed.error.flatten());
  }

  res.json({ transactions: listTransactions(req.user.id, parsed.data) });
});

export const postTransaction = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid transaction payload', parsed.error.flatten());
  }

  res.status(201).json({ transaction: createTransaction(req.user.id, { ...parsed.data, amountNgwee: parsed.data.amountNgwee, note: parsed.data.note ?? null }) });
});

export const patchTransaction = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid transaction payload', parsed.error.flatten());
  }

  res.json({ transaction: updateTransaction(req.user.id, String(req.params.id), parsed.data) });
});

export const removeTransaction = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  deleteTransaction(req.user.id, String(req.params.id));
  res.status(204).send();
});
