import { db } from '../db/index.js';
import { v4 as uuid } from 'uuid';
import { broadcastToUser } from '../utils/notificationBroadcaster.js';

export type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  source_id?: string | null;
  occurrence_date?: string | null;
  title: string;
  body?: string | null;
  read: number;
  created_at: string;
};

export function createNotification(userId: string, type: string, sourceId: string | null, occurrenceDate: string | null, title: string, body?: string | null): NotificationRow {
  const id = uuid();
  const now = new Date().toISOString();
  const row: NotificationRow = { id, user_id: userId, type, source_id: sourceId, occurrence_date: occurrenceDate, title, body: body ?? null, read: 0, created_at: now };
  db.prepare(
    `INSERT INTO notifications (id,user_id,type,source_id,occurrence_date,title,body,read,created_at) VALUES (@id,@user_id,@type,@source_id,@occurrence_date,@title,@body,@read,@created_at)`
  ).run(row);
  // broadcast via SSE to connected clients for this user
  try {
    broadcastToUser(userId, 'notification', row);
  } catch (err) {
    // ignore
  }
  return row;
}

export function existsNotification(userId: string, type: string, sourceId: string | null, occurrenceDate: string | null): boolean {
  const row = db.prepare('SELECT id FROM notifications WHERE user_id = ? AND type = ? AND (source_id = ? OR (source_id IS NULL AND ? IS NULL)) AND (occurrence_date = ? OR (occurrence_date IS NULL AND ? IS NULL))').get(userId, type, sourceId, sourceId, occurrenceDate, occurrenceDate);
  return !!row;
}

export function listUnread(userId: string): NotificationRow[] {
  return db.prepare('SELECT * FROM notifications WHERE user_id = ? AND read = 0 ORDER BY created_at DESC').all(userId) as NotificationRow[];
}

export function markRead(userId: string, id: string): void {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(id, userId);
}
