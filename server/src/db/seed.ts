import { db } from './index.js';
import { migrate } from './migrate.js';
import { nowIso } from '../utils/dates.js';
import bcrypt from 'bcryptjs';
import { createId } from '../utils/ids.js';

const demoUserEmail = 'demo@kwachawise.app';
const demoUserPassword = 'KwachaWise2026!';

const defaultCategories = [
  { id: 'global_food', name: 'Food' },
  { id: 'global_transport', name: 'Transport' },
  { id: 'global_rent', name: 'Rent' },
  { id: 'global_utilities', name: 'Utilities' },
  { id: 'global_airtime', name: 'Airtime' },
  { id: 'global_data', name: 'Data' },
  { id: 'global_health', name: 'Health' },
  { id: 'global_education', name: 'Education' },
  { id: 'global_entertainment', name: 'Entertainment' },
  { id: 'global_other', name: 'Other' }
];

const defaultPayeBands = [
  { effective_from: '2026-01-01', band_order: 1, lower_bound_ngwee: 0, upper_bound_ngwee: 500000, rate_percent: 0, quick_deduction_ngwee: 0 },
  { effective_from: '2026-01-01', band_order: 2, lower_bound_ngwee: 500000, upper_bound_ngwee: 1000000, rate_percent: 20, quick_deduction_ngwee: 0 },
  { effective_from: '2026-01-01', band_order: 3, lower_bound_ngwee: 1000000, upper_bound_ngwee: 3000000, rate_percent: 30, quick_deduction_ngwee: 0 },
  { effective_from: '2026-01-01', band_order: 4, lower_bound_ngwee: 3000000, upper_bound_ngwee: null, rate_percent: 37.5, quick_deduction_ngwee: 0 }
];

function seedCategories(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO categories (id, user_id, name, created_at)
    VALUES (@id, NULL, @name, @created_at)
  `);

  db.transaction(() => {
    for (const category of defaultCategories) {
      insert.run({ ...category, created_at: nowIso() });
    }
  });
}

function seedPayeBands(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO tax_bands (
      effective_from, band_order, lower_bound_ngwee, upper_bound_ngwee, rate_percent, quick_deduction_ngwee
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    for (const band of defaultPayeBands) {
      insert.run(
        band.effective_from,
        band.band_order,
        band.lower_bound_ngwee,
        band.upper_bound_ngwee,
        band.rate_percent,
        band.quick_deduction_ngwee
      );
    }
  });
}

async function seedDemoUser(): Promise<void> {
  const existing = db.prepare('SELECT id FROM users WHERE lower(email) = lower(?)').get(demoUserEmail) as { id: string } | undefined;
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(demoUserPassword, 12);
  db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
    createId(),
    demoUserEmail,
    passwordHash,
    nowIso()
  );
}

async function seed(): Promise<void> {
  migrate();
  seedCategories();
  seedPayeBands();
  await seedDemoUser();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void seed().then(() => {
    console.log('Seed data applied');
  });
}

export { seed };
