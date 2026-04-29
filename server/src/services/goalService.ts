import { db } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { createId } from '../utils/ids.js';
import { nowIso } from '../utils/dates.js';

export interface GoalRow {
  id: string;
  user_id: string;
  name: string;
  target_amount_ngwee: number;
  current_amount_ngwee: number;
  deadline: string | null;
  created_at: string;
}

export function listGoals(userId: string): GoalRow[] {
  return db.prepare('SELECT id, user_id, name, target_amount_ngwee, current_amount_ngwee, deadline, created_at FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(userId) as unknown as GoalRow[];
}

export function createGoal(
  userId: string,
  input: { name: string; targetAmountNgwee: number; currentAmountNgwee?: number; deadline?: string | null }
): GoalRow {
  const goal = {
    id: createId(),
    user_id: userId,
    name: input.name.trim(),
    target_amount_ngwee: input.targetAmountNgwee,
    current_amount_ngwee: input.currentAmountNgwee ?? 0,
    deadline: input.deadline ?? null,
    created_at: nowIso()
  };

  db.prepare('INSERT INTO goals (id, user_id, name, target_amount_ngwee, current_amount_ngwee, deadline, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    goal.id,
    goal.user_id,
    goal.name,
    goal.target_amount_ngwee,
    goal.current_amount_ngwee,
    goal.deadline,
    goal.created_at
  );

  return getGoalById(userId, goal.id);
}

export function getGoalById(userId: string, goalId: string): GoalRow {
  const goal = db.prepare('SELECT id, user_id, name, target_amount_ngwee, current_amount_ngwee, deadline, created_at FROM goals WHERE id = ? AND user_id = ?').get(goalId, userId) as GoalRow | undefined;
  if (!goal) {
    throw new AppError(404, 'GOAL_NOT_FOUND', 'Goal not found');
  }

  return goal;
}

export function updateGoal(
  userId: string,
  goalId: string,
  input: Partial<{ name: string; targetAmountNgwee: number; currentAmountNgwee: number; deadline: string | null }>
): GoalRow {
  const existing = getGoalById(userId, goalId);
  const name = input.name ?? existing.name;
  const targetAmountNgwee = input.targetAmountNgwee ?? existing.target_amount_ngwee;
  const currentAmountNgwee = input.currentAmountNgwee ?? existing.current_amount_ngwee;
  const deadline = input.deadline !== undefined ? input.deadline : existing.deadline;

  db.prepare('UPDATE goals SET name = ?, target_amount_ngwee = ?, current_amount_ngwee = ?, deadline = ? WHERE id = ? AND user_id = ?').run(
    name,
    targetAmountNgwee,
    currentAmountNgwee,
    deadline,
    goalId,
    userId
  );

  return getGoalById(userId, goalId);
}
