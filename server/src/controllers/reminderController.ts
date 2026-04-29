import { Request, Response } from 'express';
import { createReminder, listReminders, deleteReminder, getDueReminders, updateReminder } from '../services/reminderService.js';
import { createReminderSchema, updateReminderSchema } from '../validators/reminderValidator.js';

export async function create(req: Request, res: Response) {
  const userId = (req as any).auth.userId as string;
  try {
    const input = createReminderSchema.parse(req.body);
    const row = createReminder(userId, input as any);
    res.status(201).json({ reminder: row });
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Invalid payload' });
  }
}

export async function list(req: Request, res: Response) {
  const userId = (req as any).auth.userId as string;
  const rows = listReminders(userId);
  res.json({ reminders: rows });
}

export async function update(req: Request, res: Response) {
  const userId = (req as any).auth.userId as string;
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const patch = req.body;
  try {
    const input = updateReminderSchema.parse(patch);
    const row = updateReminder(userId, id, input as any);
    res.json({ reminder: row });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    res.status(404).json({ error: 'Not found' });
  }
}

export async function remove(req: Request, res: Response) {
  const userId = (req as any).auth.userId as string;
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  try {
    deleteReminder(userId, id);
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: 'Not found' });
  }
}

export async function due(req: Request, res: Response) {
  const nowIso = new Date().toISOString().slice(0, 10);
  const rows = getDueReminders(nowIso);
  res.json({ reminders: rows });
}
