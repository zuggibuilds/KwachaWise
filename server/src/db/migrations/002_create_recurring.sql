-- Create recurring transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount_ngwee INTEGER NOT NULL,
  category_id TEXT NOT NULL,
  frequency TEXT NOT NULL, -- daily, weekly, monthly
  interval INTEGER NOT NULL DEFAULT 1,
  day_of_month INTEGER NULL,
  weekday INTEGER NULL, -- 0=Sunday..6=Saturday for weekly
  next_occurrence TEXT NULL, -- ISO date YYYY-MM-DD
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_recurring_next_occurrence ON recurring_transactions(next_occurrence);
