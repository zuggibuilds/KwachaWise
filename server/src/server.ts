import app from './app.js';
import { seed } from './db/seed.js';
import { runDue } from './services/recurringService.js';
import { existsNotification } from './services/notificationService.js';

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

  app.listen(port, () => {
    console.log(`KwachaWise API listening on http://localhost:${port}`);
  });
}

void start();
