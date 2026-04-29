import { useEffect, useState } from 'react';
import { apiGet, apiPatch, apiPost } from '../api/client';
import { ngweeToZmw, zmwToNgwee } from '../lib/format';
import type { Goal } from '../lib/types';

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', target: '', current: '', deadline: '' });

  async function load(): Promise<void> {
    const data = await apiGet<{ goals: Goal[] }>('/goals');
    setGoals(data.goals);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load goals'));
  }, []);

  async function saveGoal(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    const payload = {
      name: form.name,
      targetAmountNgwee: zmwToNgwee(form.target),
      currentAmountNgwee: zmwToNgwee(form.current),
      deadline: form.deadline || null
    };

    try {
      if (editingId) {
        await apiPatch(`/goals/${editingId}`, payload);
      } else {
        await apiPost('/goals', payload);
      }
      setEditingId(null);
      setForm({ name: '', target: '', current: '', deadline: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save goal');
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <StatCard label="Active goals" value={String(goals.length)} tone="emerald" />
        <StatCard label="Current saved" value={ngweeToZmw(goals.reduce((sum, goal) => sum + goal.current_amount_ngwee, 0))} tone="sky" />
        <StatCard label="Target total" value={ngweeToZmw(goals.reduce((sum, goal) => sum + goal.target_amount_ngwee, 0))} tone="amber" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">New savings goal</h2>
          <p className="mb-3 text-xs text-slate-500">Set a target and track your progress</p>
          <form className="space-y-2" onSubmit={saveGoal}>
            <input
              className="w-full rounded-xl border border-brand-100 px-3 py-3 text-sm"
              placeholder="Goal name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="rounded-xl border border-brand-100 px-3 py-3 text-sm"
                placeholder="Target ZMW"
                value={form.target}
                onChange={(event) => setForm((prev) => ({ ...prev, target: event.target.value }))}
                required
              />
              <input
                className="rounded-xl border border-brand-100 px-3 py-3 text-sm"
                placeholder="Current ZMW"
                value={form.current}
                onChange={(event) => setForm((prev) => ({ ...prev, current: event.target.value }))}
              />
            </div>
            <input
              className="w-full rounded-xl border border-brand-100 px-3 py-3 text-sm"
              type="date"
              aria-label="Goal deadline"
              value={form.deadline}
              onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white" type="submit">
              {editingId ? 'Update goal' : 'Save goal'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-900">Savings goals</h2>
          <div className="mt-3 space-y-3">
            {goals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.current_amount_ngwee / goal.target_amount_ngwee) * 100));
              return (
                <article key={goal.id} className="rounded-xl border border-brand-100 bg-brand-50 p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{goal.name}</p>
                    <p className="text-xs text-slate-600">{progress}%</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {ngweeToZmw(goal.current_amount_ngwee)} / {ngweeToZmw(goal.target_amount_ngwee)}
                  </p>
                  <progress className="mt-2 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-brand-50 [&::-webkit-progress-value]:bg-brand-500" value={progress} max={100} />
                  <button
                    className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700"
                    onClick={() => {
                      setEditingId(goal.id);
                      setForm({
                        name: goal.name,
                        target: String(goal.target_amount_ngwee / 100),
                        current: String(goal.current_amount_ngwee / 100),
                        deadline: goal.deadline ?? ''
                      });
                    }}
                  >
                    Edit
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'sky' | 'amber' }) {
  const colors: Record<typeof tone, string> = {
    emerald: 'bg-emerald-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500'
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
      <div className={`absolute left-0 top-0 h-1 w-full ${colors[tone]}`} />
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 font-mono text-[22px] font-semibold text-slate-900">{value}</p>
    </div>
  );
}
