import { db } from '../db/index.js';
import { randomUUID } from 'node:crypto';
import { AppError } from '../utils/errors.js';

export type ReminderRow = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  amount_ngwee?: number | null;
  due_date?: string | null; // ISO date
  remind_before_days: number;
  enabled: number;
  created_at: string;
  updated_at?: string | null;
};

export function createReminder(userId: string, payload: Partial<ReminderRow>): ReminderRow {
  const id = randomUUID();
  const now = new Date().toISOString();
  const row: ReminderRow = {
    id,
    user_id: userId,
    title: payload.title ?? 'Untitled reminder',
    description: payload.description ?? null,
    amount_ngwee: payload.amount_ngwee ?? null,
    due_date: payload.due_date ?? null,
    remind_before_days: payload.remind_before_days ?? 0,
    enabled: 1,
    created_at: now,
    updated_at: null
  };

  db.prepare(
    `INSERT INTO reminders (id, user_id, title, description, amount_ngwee, due_date, remind_before_days, enabled, created_at, updated_at)
     VALUES (@id,@user_id,@title,@description,@amount_ngwee,@due_date,@remind_before_days,@enabled,@created_at,@updated_at)`
  ).run(row);

  return row;
}

export function listReminders(userId: string): ReminderRow[] {
  return db.prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY due_date IS NULL, due_date ASC').all(userId) as ReminderRow[];
}

export function deleteReminder(userId: string, id: string): void {
  const res = db.prepare('DELETE FROM reminders WHERE id = ? AND user_id = ?').run(id, userId);
  if (res.changes === 0) throw new AppError(404, 'REMINDER_NOT_FOUND', 'Reminder not found');
}

export function getDueReminders(nowIso: string): ReminderRow[] {
  // Return reminders that are enabled and whose due_date minus remind_before_days <= now
  return db.prepare(
    `SELECT * FROM reminders WHERE enabled = 1 AND due_date IS NOT NULL AND date(due_date, '-' || remind_before_days || ' days') <= date(?)`
  ).all(nowIso) as ReminderRow[];
}

export function updateReminder(userId: string, id: string, patch: Partial<ReminderRow>): ReminderRow {
  const existing = db.prepare('SELECT * FROM reminders WHERE id = ? AND user_id = ?').get(id, userId) as ReminderRow | undefined;
  if (!existing) throw new AppError(404, 'REMINDER_NOT_FOUND', 'Reminder not found');
  const updated = { ...existing, ...patch, updated_at: new Date().toISOString() } as ReminderRow;
  db.prepare(
    `UPDATE reminders SET title = @title, description = @description, amount_ngwee = @amount_ngwee, due_date = @due_date, remind_before_days = @remind_before_days, enabled = @enabled, updated_at = @updated_at WHERE id = @id`
  ).run({
    id: updated.id,
    title: updated.title,
    description: updated.description,
    amount_ngwee: updated.amount_ngwee,
    due_date: updated.due_date,
    remind_before_days: updated.remind_before_days,
    enabled: updated.enabled,
    updated_at: updated.updated_at
  });
  return updated;
}
