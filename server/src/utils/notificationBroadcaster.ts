import type { ServerResponse } from 'http';

type Client = { userId: string; res: ServerResponse };

const clients: Set<Client> = new Set();

export function addClient(userId: string, res: ServerResponse) {
  const client = { userId, res };
  clients.add(client);
  res.on('close', () => {
    clients.delete(client);
  });
}

export function broadcastToUser(userId: string, event: string, data: any) {
  for (const c of Array.from(clients)) {
    if (c.userId !== userId) continue;
    try {
      c.res.write(`event: ${event}\n`);
      c.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      // ignore
    }
  }
}
