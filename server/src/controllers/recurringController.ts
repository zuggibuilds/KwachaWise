import { Request, Response } from 'express';
import { createRecurring, getById, listByUser, deleteById } from '../services/recurringService.js';
import { AppError } from '../utils/errors.js';
import { createRecurringSchema } from '../validators/recurringValidator.js';

export async function create(req: Request, res: Response) {
  const userId = (req as any).auth.userId as string;
  const parsed = createRecurringSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid recurring payload', parsed.error.flatten());
  }

  const row = createRecurring(userId, parsed.data as any);
  res.json({ recurring: row });
}

export async function getOne(req: Request, res: Response) {
  const userId = (req as any).auth.userId as string;
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const row = getById(userId, id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ recurring: row });
}

export async function list(req: Request, res: Response) {
  const userId = (req as any).auth.userId as string;
  const rows = listByUser(userId);
  res.json({ recurring: rows });
}

export async function remove(req: Request, res: Response) {
  const userId = (req as any).auth.userId as string;
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  try {
    deleteById(userId, id);
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: 'Not found' });
  }
}
