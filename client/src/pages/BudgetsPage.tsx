import { useEffect, useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client';
import { monthToday, ngweeToZmw, zmwToNgwee } from '../lib/format';
import type { Budget, Category, Transaction } from '../lib/types';

export function BudgetsPage() {
  const [month, setMonth] = useState(monthToday());
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ categoryId: '', amount: '' });

  async function load(selectedMonth: string): Promise<void> {
    const [categoryData, budgetData, txData] = await Promise.all([
      apiGet<{ categories: Category[] }>('/categories'),
      apiGet<{ budgets: Budget[] }>(`/budgets?month=${selectedMonth}`),
      apiGet<{ transactions: Transaction[] }>(`/transactions?from=${selectedMonth}-01&to=${selectedMonth}-31&type=expense`)
    ]);

    setCategories(categoryData.categories);
    setBudgets(budgetData.budgets);
    setTransactions(txData.transactions);
    setForm((prev) => ({ ...prev, categoryId: prev.categoryId || categoryData.categories[0]?.id || '' }));
  }

  useEffect(() => {
    void load(month).catch((err) => setError(err instanceof Error ? err.message : 'Unable to load budgets'));
  }, [month]);

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((transaction) => {
      map.set(transaction.category_id, (map.get(transaction.category_id) ?? 0) + transaction.amount_ngwee);
    });
    return map;
  }, [transactions]);

  async function saveBudget(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      const payload = { month, categoryId: form.categoryId, amountNgwee: zmwToNgwee(form.amount) };
      if (editId) {
        await apiPatch(`/budgets/${editId}`, payload);
      } else {
        await apiPost('/budgets', payload);
      }
      setEditId(null);
      setForm({ categoryId: categories[0]?.id || '', amount: '' });
      await load(month);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save budget');
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <StatCard label="Total budgeted" value={ngweeToZmw(budgets.reduce((sum, budget) => sum + budget.amount_ngwee, 0))} tone="emerald" />
        <StatCard label="Spent so far" value={ngweeToZmw(transactions.reduce((sum, item) => sum + item.amount_ngwee, 0))} tone="rose" />
        <StatCard label="Remaining" value={ngweeToZmw(Math.max(0, budgets.reduce((sum, budget) => sum + budget.amount_ngwee, 0) - transactions.reduce((sum, item) => sum + item.amount_ngwee, 0)))} tone="sky" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Monthly budgets</h2>
              <p className="text-xs text-slate-500">Create and edit budget lines for the selected month</p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{4}-\d{2}"
              placeholder="YYYY-MM"
              className="w-28 rounded-xl border border-brand-100 px-3 py-2 text-sm"
              aria-label="Budget month"
              title="Budget month in YYYY-MM format"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>

          <form className="space-y-2" onSubmit={saveBudget}>
            <select
              className="w-full rounded-xl border border-brand-100 px-3 py-3 text-sm"
              aria-label="Budget category"
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-xl border border-brand-100 px-3 py-3 text-sm"
              placeholder="Budget amount in ZMW"
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white" type="submit">
              {editId ? 'Update budget' : 'Create budget'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-900">Budget utilization</h2>
          <div className="mt-3 space-y-3">
            {budgets.map((budget) => {
              const spent = spentByCategory.get(budget.category_id) ?? 0;
              const progress = budget.amount_ngwee === 0 ? 0 : Math.min(100, Math.round((spent / budget.amount_ngwee) * 100));
              return (
                <article key={budget.id} className="rounded-xl border border-brand-100 bg-brand-50 p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{budget.category_name}</p>
                    <p className="text-xs text-slate-600">{progress}% used</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {ngweeToZmw(spent)} / {ngweeToZmw(budget.amount_ngwee)}
                  </p>
                  <progress className="mt-2 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-brand-50 [&::-webkit-progress-value]:bg-brand-500" value={progress} max={100} />
                  <div className="mt-3 flex gap-2">
                    <button
                      className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700"
                      onClick={() => {
                        setEditId(budget.id);
                        setForm({ categoryId: budget.category_id, amount: String(budget.amount_ngwee / 100) });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                      onClick={() => {
                        void apiDelete(`/budgets/${budget.id}`)
                          .then(() => load(month))
                          .catch((err) => setError(err instanceof Error ? err.message : 'Unable to delete budget'));
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'rose' | 'sky' }) {
  const colors: Record<typeof tone, string> = {
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500'
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
      <div className={`absolute left-0 top-0 h-1 w-full ${colors[tone]}`} />
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 font-mono text-[22px] font-semibold text-slate-900">{value}</p>
    </div>
  );
}
