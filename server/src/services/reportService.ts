import { db } from '../db/index.js';

export interface SummaryReport {
  totals: { income_ngwee: number; expense_ngwee: number };
  byCategory: Array<{ categoryId: string; categoryName: string; expense_ngwee: number }>;
  byDay: Array<{ date: string; income_ngwee: number; expense_ngwee: number }>;
}

export function getSummaryReport(userId: string, from: string, to: string): SummaryReport {
  const totals = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount_ngwee ELSE 0 END), 0) AS income_ngwee,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_ngwee ELSE 0 END), 0) AS expense_ngwee
       FROM transactions
       WHERE user_id = ? AND occurred_at BETWEEN ? AND ?`
    )
    .get(userId, from, to) as { income_ngwee: number; expense_ngwee: number };

  const byCategory = db
    .prepare(
      `SELECT t.category_id AS categoryId, c.name AS categoryName, COALESCE(SUM(t.amount_ngwee), 0) AS expense_ngwee
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = ? AND t.type = 'expense' AND t.occurred_at BETWEEN ? AND ?
       GROUP BY t.category_id, c.name
       ORDER BY expense_ngwee DESC, c.name COLLATE NOCASE`
    )
    .all(userId, from, to) as Array<{ categoryId: string; categoryName: string; expense_ngwee: number }>;

  const byDay = db
    .prepare(
      `SELECT occurred_at AS date,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount_ngwee ELSE 0 END), 0) AS income_ngwee,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_ngwee ELSE 0 END), 0) AS expense_ngwee
       FROM transactions
       WHERE user_id = ? AND occurred_at BETWEEN ? AND ?
       GROUP BY occurred_at
       ORDER BY occurred_at ASC`
    )
    .all(userId, from, to) as Array<{ date: string; income_ngwee: number; expense_ngwee: number }>;

  return { totals, byCategory, byDay };
}
