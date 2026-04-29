import { db } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { createId } from '../utils/ids.js';
import { nowIso } from '../utils/dates.js';
import { assertCategoryAccessible } from './categoryService.js';

export interface BudgetRow {
  id: string;
  user_id: string;
  month: string;
  category_id: string;
  category_name: string;
  amount_ngwee: number;
  created_at: string;
}

export function listBudgets(userId: string, month: string): BudgetRow[] {
  return db
    .prepare(
      `SELECT b.id, b.user_id, b.month, b.category_id, c.name AS category_name, b.amount_ngwee, b.created_at
       FROM budgets b
       JOIN categories c ON c.id = b.category_id
       WHERE b.user_id = ? AND b.month = ?
       ORDER BY c.name COLLATE NOCASE`
    )
    .all(userId, month) as unknown as BudgetRow[];
}

export function createBudget(userId: string, input: { month: string; categoryId: string; amountNgwee: number }): BudgetRow {
  assertCategoryAccessible(userId, input.categoryId);
  const budget = {
    id: createId(),
    user_id: userId,
    month: input.month,
    category_id: input.categoryId,
    amount_ngwee: input.amountNgwee,
    created_at: nowIso()
  };

  try {
    db.prepare('INSERT INTO budgets (id, user_id, month, category_id, amount_ngwee, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      budget.id,
      budget.user_id,
      budget.month,
      budget.category_id,
      budget.amount_ngwee,
      budget.created_at
    );
  } catch {
    throw new AppError(409, 'BUDGET_EXISTS', 'A budget already exists for that month and category');
  }

  return getBudgetById(userId, budget.id);
}

export function getBudgetById(userId: string, budgetId: string): BudgetRow {
  const row = db
    .prepare(
      `SELECT b.id, b.user_id, b.month, b.category_id, c.name AS category_name, b.amount_ngwee, b.created_at
       FROM budgets b
       JOIN categories c ON c.id = b.category_id
       WHERE b.id = ? AND b.user_id = ?`
    )
    .get(budgetId, userId) as BudgetRow | undefined;

  if (!row) {
    throw new AppError(404, 'BUDGET_NOT_FOUND', 'Budget not found');
  }

  return row;
}

export function updateBudget(
  userId: string,
  budgetId: string,
  input: Partial<{ month: string; categoryId: string; amountNgwee: number }>
): BudgetRow {
  const existing = getBudgetById(userId, budgetId);
  const month = input.month ?? existing.month;
  const categoryId = input.categoryId ?? existing.category_id;
  const amountNgwee = input.amountNgwee ?? existing.amount_ngwee;

  assertCategoryAccessible(userId, categoryId);
  try {
    db.prepare('UPDATE budgets SET month = ?, category_id = ?, amount_ngwee = ? WHERE id = ? AND user_id = ?').run(
      month,
      categoryId,
      amountNgwee,
      budgetId,
      userId
    );
  } catch {
    throw new AppError(409, 'BUDGET_EXISTS', 'A budget already exists for that month and category');
  }

  return getBudgetById(userId, budgetId);
}

export function deleteBudget(userId: string, budgetId: string): void {
  const result = db.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?').run(budgetId, userId);
  if (result.changes === 0) {
    throw new AppError(404, 'BUDGET_NOT_FOUND', 'Budget not found');
  }
}
