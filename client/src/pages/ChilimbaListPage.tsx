import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api/client';
import { ngweeToZmw } from '../lib/format';
import type { ChilimbaListItem } from '../lib/types';

export function ChilimbaListPage() {
  const [groups, setGroups] = useState<ChilimbaListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<{ groups: ChilimbaListItem[] }>('/chilimba')
      .then((data) => setGroups(data.groups))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load groups'));
  }, []);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Chilimba Tracker</h2>
            <p className="text-xs text-slate-500">Manage rotating savings groups and payout order</p>
          </div>
          <Link to="/chilimba/create" className="rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white">
            Create draft
          </Link>
        </div>
      </section>
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <section className="grid gap-3 xl:grid-cols-2">
        {groups.map((group) => (
          <Link key={group.id} to={`/chilimba/${group.id}`} className="block rounded-2xl border border-brand-100 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{group.name}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${group.status === 'active' ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'}`}>
                {group.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">Contribution: {ngweeToZmw(group.contribution_amount_ngwee)}</p>
            <p className="text-xs text-slate-500">
              Members: {group.member_count} | Frequency: {group.frequency} | Current round: {group.current_round_number ?? '-'}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
