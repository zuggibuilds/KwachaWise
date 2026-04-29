import fs from 'node:fs';
import path from 'node:path';

// Use a disposable test database for safety
process.env.DATABASE_PATH = path.join(process.cwd(), 'data', 'kwachawise_test.sqlite');
// clean up any previous test db
try { fs.rmSync(process.env.DATABASE_PATH); } catch (e) { /* ignore */ }

import { migrate } from '../db/migrate.js';
import { db } from '../db/index.js';
import { createRecurring, runDue } from '../services/recurringService.js';
import { createId } from '../utils/ids.js';
import { nowIso } from '../utils/dates.js';

function assert(cond: boolean, msg = 'Assertion failed') {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log('Applying migrations...');
  migrate();

  // create test user and category
  const userId = createId();
  const catId = createId();
  const testEmail = `${createId()}@example.com`;
  db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(userId, testEmail, 'hash', nowIso());
  db.prepare('INSERT INTO categories (id, user_id, name, created_at) VALUES (?, ?, ?, ?)').run(catId, userId, 'Test', nowIso());

  // create recurring entry due now
  const now = nowIso().slice(0, 10); // YYYY-MM-DD expected by date utilities
  const r = createRecurring(userId, {
    type: 'expense',
    amount_ngwee: 5000,
    category_id: catId,
    frequency: 'daily',
    interval: 1,
    next_occurrence: now
  });

  console.log('Running runDue first time...');
  runDue(now);
  const rows1 = db.prepare('SELECT * FROM transactions WHERE note = ?').all(`Recurring: ${r.id}`);
  console.log('Found transactions for recurring:', rows1.length);
  assert(rows1.length === 1, 'Expected exactly 1 transaction after first run');

  console.log('Running runDue second time (should not duplicate)...');
  runDue(now);
  const rows2 = db.prepare('SELECT * FROM transactions WHERE note = ?').all(`Recurring: ${r.id}`);
  console.log('Found transactions for recurring after second run:', rows2.length);
  assert(rows2.length === 1, 'Expected still exactly 1 transaction after second run');

  console.log('Test passed: runDue is idempotent for the same occurrence.');
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
