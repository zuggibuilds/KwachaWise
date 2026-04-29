-- Create notifications table for reminders and other system notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  source_id TEXT NULL, -- e.g., reminder id
  occurrence_date TEXT NULL, -- date the notification is for (YYYY-MM-DD)
  title TEXT NOT NULL,
  body TEXT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
