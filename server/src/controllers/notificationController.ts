import { Request, Response } from 'express';
import { listUnread, markRead } from '../services/notificationService.js';
import { addClient } from '../utils/notificationBroadcaster.js';

export async function list(req: Request, res: Response) {
  const userId = (req as any).auth.userId as string;
  const rows = listUnread(userId);
  res.json({ notifications: rows });
}

export async function markAsRead(req: Request, res: Response) {
  const userId = (req as any).auth.userId as string;
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  markRead(userId, id);
  res.status(204).end();
}

export async function stream(req: Request, res: Response) {
  const userId = (req as any).auth.userId as string;
  // set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write(': connected\n\n');
  addClient(userId, res as unknown as import('http').ServerResponse);
}
