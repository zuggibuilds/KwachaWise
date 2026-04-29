import app from './app.js';
import { seed } from './db/seed.js';
import { runDue } from './services/recurringService.js';
import { getDueReminders } from './services/reminderService.js';
import { existsNotification, createNotification } from './services/notificationService.js';

const port = Number(process.env.SERVER_PORT ?? 4000);

async function start(): Promise<void> {
  await seed();

  // start recurring job runner (runs every minute in dev)
  setInterval(() => {
    try {
      const nowIso = new Date().toISOString().slice(0, 10);
      runDue(nowIso);
    } catch (err) {
      console.error('Error running recurring job', err);
    }
  }, 60 * 1000);

  // start reminders -> notifications runner
  setInterval(() => {
    try {
      const nowIso = new Date().toISOString().slice(0, 10);
      const due = getDueReminders(nowIso);
      for (const r of due) {
        // idempotency: don't create duplicate notification for same reminder+date
        if (existsNotification(r.user_id, 'reminder', r.id, r.due_date ?? null)) continue;
        createNotification(r.user_id, 'reminder', r.id, r.due_date ?? null, `Reminder: ${r.title}`, r.description ?? null);
      }
    } catch (err) {
      console.error('Error running reminders runner', err);
    }
  }, 60 * 1000);

  app.listen(port, () => {
    console.log(`KwachaWise API listening on http://localhost:${port}`);
  });
}

void start();
