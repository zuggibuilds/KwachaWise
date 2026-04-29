import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './index.js';
import { nowIso } from '../utils/dates.js';

const currentFile = fileURLToPath(import.meta.url);
const migrationsDir = path.join(path.dirname(currentFile), 'migrations');

function ensureTable(): void {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `).run();
}

function appliedMigrations(): Set<string> {
  const rows = db.prepare('SELECT name FROM schema_migrations').all() as Array<{ name: string }>;
  return new Set(rows.map((row) => row.name));
}

function migrate(): void {
  ensureTable();
  const done = appliedMigrations();
  const files = fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();

  for (const fileName of files) {
    if (done.has(fileName)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, fileName), 'utf8');
    db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)').run(fileName, nowIso());
    });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
  console.log('Migrations applied');
}

export { migrate };
