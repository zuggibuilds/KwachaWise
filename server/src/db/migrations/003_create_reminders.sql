-- Create reminders table for bill reminders and alerts
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NULL,
  amount_ngwee INTEGER NULL,
  due_date TEXT NULL,
  remind_before_days INTEGER DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
