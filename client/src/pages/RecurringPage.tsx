import React, { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '../api/client';
import Card from '../components/ui/Card';

type Recurring = {
  id: string;
  description: string;
  amount: number;
  frequency: string;
  interval: number;
  next_occurrence: string | null;
  enabled: number;
};

export default function RecurringPage() {
  const [items, setItems] = useState<Recurring[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await apiGet('/recurring');
    const payload = res as any;
    setItems(payload.recurring || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this recurring schedule?')) return;
    await apiDelete(`/recurring/${id}`);
    setItems(items.filter(i => i.id !== id));
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-semibold">Recurring Schedules</h2>
      {loading && <div>Loading…</div>}
      {!loading && items.length === 0 && <div>No recurring schedules found.</div>}
      <div className="space-y-3">
        {items.map(it => (
          <Card key={it.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{it.description || 'Untitled'}</div>
              <div className="text-sm text-slate-500">{it.frequency} • every {it.interval}</div>
              <div className="text-xs text-slate-400">Next: {it.next_occurrence ?? '—'}</div>
            </div>
            <div>
              <button onClick={() => handleDelete(it.id)} className="text-red-500">Delete</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
