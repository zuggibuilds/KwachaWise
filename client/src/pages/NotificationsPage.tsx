import React, { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../api/client';
import Card from '../components/ui/Card';

type Notification = { id: string; title: string; body?: string | null; occurrence_date?: string | null };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  async function load() {
    const res = await apiGet('/notifications');
    const payload = res as any;
    setItems(payload.notifications || []);
  }

  useEffect(() => { load(); }, []);

  async function markRead(id: string) {
    await apiPatch(`/notifications/${id}/read`, {});
    setItems(items.filter(i => i.id !== id));
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-semibold">Notifications</h2>
      <div className="space-y-3">
        {items.map(it => (
          <Card key={it.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{it.title}</div>
              <div className="text-sm text-slate-500">{it.occurrence_date ?? ''}</div>
            </div>
            <div>
              <button onClick={() => markRead(it.id)} className="text-sm text-slate-600">Mark read</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
