CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
  amount_ngwee INTEGER NOT NULL CHECK(amount_ngwee > 0),
  category_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  note TEXT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  month TEXT NOT NULL,
  category_id TEXT NOT NULL,
  amount_ngwee INTEGER NOT NULL CHECK(amount_ngwee >= 0),
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  UNIQUE(user_id, month, category_id)
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount_ngwee INTEGER NOT NULL CHECK(target_amount_ngwee > 0),
  current_amount_ngwee INTEGER NOT NULL CHECK(current_amount_ngwee >= 0),
  deadline TEXT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tax_bands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  effective_from TEXT NOT NULL,
  band_order INTEGER NOT NULL,
  lower_bound_ngwee INTEGER NOT NULL,
  upper_bound_ngwee INTEGER NULL,
  rate_percent REAL NOT NULL,
  quick_deduction_ngwee INTEGER NOT NULL DEFAULT 0,
  UNIQUE(effective_from, band_order)
);

CREATE TABLE IF NOT EXISTS chilimba_groups (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  contribution_amount_ngwee INTEGER NOT NULL CHECK(contribution_amount_ngwee > 0),
  frequency TEXT CHECK(frequency IN ('weekly', 'monthly')) NOT NULL,
  start_date TEXT NOT NULL,
  status TEXT CHECK(status IN ('draft', 'active')) NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chilimba_members (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  phone TEXT NULL,
  payout_position INTEGER NOT NULL CHECK(payout_position >= 1),
  created_at TEXT NOT NULL,
  FOREIGN KEY (group_id) REFERENCES chilimba_groups(id) ON DELETE CASCADE,
  UNIQUE(group_id, payout_position)
);

CREATE TABLE IF NOT EXISTS chilimba_rounds (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  round_number INTEGER NOT NULL CHECK(round_number >= 1),
  recipient_member_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('open', 'completed')) NOT NULL,
  due_date TEXT NULL,
  completed_at TEXT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (group_id) REFERENCES chilimba_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_member_id) REFERENCES chilimba_members(id) ON DELETE RESTRICT,
  UNIQUE(group_id, round_number)
);

CREATE TABLE IF NOT EXISTS chilimba_payments (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  paid INTEGER NOT NULL CHECK(paid IN (0, 1)),
  paid_at TEXT NULL,
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (round_id) REFERENCES chilimba_rounds(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES chilimba_members(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(round_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_chilimba_groups_user ON chilimba_groups(user_id);
