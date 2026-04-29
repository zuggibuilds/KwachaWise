import { db } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { createId } from '../utils/ids.js';
import { nowIso } from '../utils/dates.js';
import { assertCategoryAccessible } from './categoryService.js';

export interface TransactionRow {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount_ngwee: number;
  category_id: string;
  category_name: string;
  occurred_at: string;
  note: string | null;
  created_at: string;
}

export function listTransactions(userId: string, filters: { from?: string; to?: string; type?: string; categoryId?: string }): TransactionRow[] {
  const where: string[] = ['t.user_id = ?'];
  const params: Array<string> = [userId];

  if (filters.from) {
    where.push('t.occurred_at >= ?');
    params.push(filters.from);
  }

  if (filters.to) {
    where.push('t.occurred_at <= ?');
    params.push(filters.to);
  }

  if (filters.type) {
    where.push('t.type = ?');
    params.push(filters.type);
  }

  if (filters.categoryId) {
    where.push('t.category_id = ?');
    params.push(filters.categoryId);
  }

  return db
    .prepare(
      `SELECT t.id, t.user_id, t.type, t.amount_ngwee, t.category_id, c.name AS category_name, t.occurred_at, t.note, t.created_at
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE ${where.join(' AND ')}
       ORDER BY t.occurred_at DESC, t.created_at DESC`
    )
    .all(...params) as unknown as TransactionRow[];
}

export function createTransaction(
  userId: string,
  input: { type: 'income' | 'expense'; amountNgwee: number; categoryId: string; occurredAt: string; note?: string | null }
): TransactionRow {
  assertCategoryAccessible(userId, input.categoryId);
  const row = {
    id: createId(),
    user_id: userId,
    type: input.type,
    amount_ngwee: input.amountNgwee,
    category_id: input.categoryId,
    occurred_at: input.occurredAt,
    note: input.note ?? null,
    created_at: nowIso()
  };

  db.prepare(
    'INSERT INTO transactions (id, user_id, type, amount_ngwee, category_id, occurred_at, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(row.id, row.user_id, row.type, row.amount_ngwee, row.category_id, row.occurred_at, row.note, row.created_at);

  return getTransactionById(userId, row.id);
}

export function getTransactionById(userId: string, transactionId: string): TransactionRow {
  const row = db
    .prepare(
      `SELECT t.id, t.user_id, t.type, t.amount_ngwee, t.category_id, c.name AS category_name, t.occurred_at, t.note, t.created_at
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.id = ? AND t.user_id = ?`
    )
    .get(transactionId, userId) as TransactionRow | undefined;

  if (!row) {
    throw new AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
  }

  return row;
}

export function updateTransaction(
  userId: string,
  transactionId: string,
  input: Partial<{ type: 'income' | 'expense'; amountNgwee: number; categoryId: string; occurredAt: string; note: string | null }>
): TransactionRow {
  const existing = getTransactionById(userId, transactionId);
  const nextCategoryId = input.categoryId ?? existing.category_id;
  assertCategoryAccessible(userId, nextCategoryId);

  const type = input.type ?? existing.type;
  const amountNgwee = input.amountNgwee ?? existing.amount_ngwee;
  const occurredAt = input.occurredAt ?? existing.occurred_at;
  const note = input.note !== undefined ? input.note : existing.note;

  db.prepare(
    'UPDATE transactions SET type = ?, amount_ngwee = ?, category_id = ?, occurred_at = ?, note = ? WHERE id = ? AND user_id = ?'
  ).run(type, amountNgwee, nextCategoryId, occurredAt, note, transactionId, userId);

  return getTransactionById(userId, transactionId);
}

export function deleteTransaction(userId: string, transactionId: string): void {
  const result = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(transactionId, userId);
  if (result.changes === 0) {
    throw new AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
  }
}
