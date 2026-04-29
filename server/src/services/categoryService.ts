import { db } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { createId } from '../utils/ids.js';
import { nowIso } from '../utils/dates.js';

export interface CategoryRow {
  id: string;
  user_id: string | null;
  name: string;
  created_at: string;
}

export function listCategories(userId: string): CategoryRow[] {
  return db
    .prepare('SELECT id, user_id, name, created_at FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY user_id IS NOT NULL, name COLLATE NOCASE')
    .all(userId) as unknown as CategoryRow[];
}

export function createCategory(userId: string, name: string): CategoryRow {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new AppError(400, 'INVALID_CATEGORY', 'Category name is required');
  }

  const existing = db
    .prepare('SELECT id FROM categories WHERE user_id = ? AND lower(name) = lower(?)')
    .get(userId, trimmed) as { id: string } | undefined;

  if (existing) {
    throw new AppError(409, 'CATEGORY_EXISTS', 'Category already exists for this account');
  }

  const category: CategoryRow = { id: createId(), user_id: userId, name: trimmed, created_at: nowIso() };
  db.prepare('INSERT INTO categories (id, user_id, name, created_at) VALUES (?, ?, ?, ?)').run(
    category.id,
    category.user_id,
    category.name,
    category.created_at
  );

  return category;
}

export function assertCategoryAccessible(userId: string, categoryId: string): void {
  const category = db.prepare('SELECT id, user_id FROM categories WHERE id = ?').get(categoryId) as
    | { id: string; user_id: string | null }
    | undefined;

  if (!category || (category.user_id !== null && category.user_id !== userId)) {
    throw new AppError(400, 'CATEGORY_NOT_ALLOWED', 'Selected category is not available to this user');
  }
}
