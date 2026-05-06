import React, { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '../api/client';
import Card from '../components/ui/Card';
import { Briefcase, Home, Smartphone, Tv, Dumbbell, Repeat } from 'lucide-react';

type Recurring = {
  id: string;
  description: string;
  amount: number;
  frequency: string;
  interval: number;
  next_occurrence: string | null;
  enabled: number;
};

function getRecurringIcon(description: string) {
  const name = description.toLowerCase();
  if (name.includes('salary') || name.includes('income') || name.includes('freelance')) return Briefcase;
  if (name.includes('rent') || name.includes('house')) return Home;
  if (name.includes('airtel') || name.includes('phone') || name.includes('data')) return Smartphone;
  if (name.includes('dstv') || name.includes('tv')) return Tv;
  if (name.includes('gym') || name.includes('fitness')) return Dumbbell;
  return Repeat;
}

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
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                {React.createElement(getRecurringIcon(it.description || ''), { size: 18, strokeWidth: 2.4 })}
              </div>
              <div>
                <div className="font-medium">{it.description || 'Untitled'}</div>
                <div className="text-sm text-slate-500">{it.frequency} • every {it.interval}</div>
                <div className="text-xs text-slate-400">Next: {it.next_occurrence ?? '—'}</div>
              </div>
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
