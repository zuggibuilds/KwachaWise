import { db } from '../db/index.js';
import { createId } from '../utils/ids.js';
import { nowIso, addDays, addMonths } from '../utils/dates.js';
import { AppError } from '../utils/errors.js';

export interface RecurringRow {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount_ngwee: number;
  category_id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  day_of_month: number | null;
  weekday: number | null;
  next_occurrence: string | null;
  enabled: number;
  created_at: string;
  updated_at: string | null;
}

export function createRecurring(userId: string, input: Partial<RecurringRow>): RecurringRow {
  const id = createId();
  const now = nowIso();
  const row = {
    id,
    user_id: userId,
    type: input.type ?? 'expense',
    amount_ngwee: input.amount_ngwee ?? 0,
    category_id: input.category_id ?? '',
    frequency: (input.frequency as any) ?? 'monthly',
    interval: input.interval ?? 1,
    day_of_month: input.day_of_month ?? null,
    weekday: input.weekday ?? null,
    next_occurrence: input.next_occurrence ?? null,
    enabled: input.enabled ?? 1,
    created_at: now,
    updated_at: null
  } as RecurringRow;

  db.prepare(
    `INSERT INTO recurring_transactions (id, user_id, type, amount_ngwee, category_id, frequency, interval, day_of_month, weekday, next_occurrence, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(row.id, row.user_id, row.type, row.amount_ngwee, row.category_id, row.frequency, row.interval, row.day_of_month, row.weekday, row.next_occurrence, row.enabled, row.created_at, row.updated_at);

  return row;
}

export function listDue(nowDateIso: string): RecurringRow[] {
  return db
    .prepare('SELECT * FROM recurring_transactions WHERE enabled = 1 AND next_occurrence IS NOT NULL AND next_occurrence <= ?')
    .all(nowDateIso) as unknown as RecurringRow[];
}

export function updateNextOccurrence(id: string, nextIso: string | null): void {
  db.prepare('UPDATE recurring_transactions SET next_occurrence = ?, updated_at = ? WHERE id = ?').run(nextIso, nowIso(), id);
}

export function runDue(nowDateIso: string): void {
  const due = listDue(nowDateIso);
  if (!due.length) return;

  // Prepare statements
  const insertTx = db.prepare('INSERT INTO transactions (id, user_id, type, amount_ngwee, category_id, occurred_at, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const findTx = db.prepare('SELECT id FROM transactions WHERE user_id = ? AND date(occurred_at) = date(?) AND note = ? LIMIT 1');

  // Run all changes in a transaction to avoid partial state if something fails
  db.transaction(() => {
    for (const r of due) {
      const occurredAt = r.next_occurrence ?? nowDateIso;
      const note = `Recurring: ${r.id}`;

      // If we've already created a transaction for this recurring id and occurrence date, skip insertion.
      const existing = findTx.get(r.user_id, occurredAt, note) as { id?: string } | undefined;
      if (!existing) {
        const txId = createId();
        insertTx.run(txId, r.user_id, r.type, r.amount_ngwee, r.category_id, occurredAt, note, nowIso());
      }

      // compute next occurrence
      let next: string | null = null;
      if (r.frequency === 'daily') {
        next = addDays(occurredAt, r.interval ?? 1);
      } else if (r.frequency === 'weekly') {
        next = addDays(occurredAt, (r.interval ?? 1) * 7);
      } else if (r.frequency === 'monthly') {
        next = addMonths(occurredAt, r.interval ?? 1);
      }

      updateNextOccurrence(r.id, next);
    }
  });
}

export function getById(userId: string, id: string): RecurringRow | null {
  const row = db.prepare('SELECT * FROM recurring_transactions WHERE id = ? AND user_id = ?').get(id, userId) as RecurringRow | undefined;
  return row ?? null;
}

export function listByUser(userId: string): RecurringRow[] {
  return db.prepare('SELECT * FROM recurring_transactions WHERE user_id = ?').all(userId) as unknown as RecurringRow[];
}

export function deleteById(userId: string, id: string): void {
  const res = db.prepare('DELETE FROM recurring_transactions WHERE id = ? AND user_id = ?').run(id, userId);
  if (res.changes === 0) {
    throw new AppError(404, 'RECURRING_NOT_FOUND', 'Recurring schedule not found');
  }
}
