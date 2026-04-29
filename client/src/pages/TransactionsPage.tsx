import { useEffect, useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client';
// import TransactionSheet from '../components/domain/TransactionSheet';
import { dateToday, ngweeToZmw, zmwToNgwee } from '../lib/format';
import type { Category, Transaction } from '../lib/types';
import { trackEvent } from '../lib/analytics';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    categoryId: '',
    occurredAt: dateToday(),
    note: ''
  });

  async function load(): Promise<void> {
    const [txData, catData] = await Promise.all([
      apiGet<{ transactions: Transaction[] }>('/transactions'),
      apiGet<{ categories: Category[] }>('/categories')
    ]);
    setTransactions(txData.transactions);
    setCategories(catData.categories);
    setForm((prev) => ({ ...prev, categoryId: prev.categoryId || catData.categories[0]?.id || '' }));
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load transactions'));
  }, []);

  // Listen for optimistic transaction events from global sheet
  useEffect(() => {
    const onCreated = (e: Event) => {
      // @ts-ignore
      const tx = e.detail;
      setTransactions((prev) => [tx, ...prev]);
    };
    const onConfirmed = (e: Event) => {
      // @ts-ignore
      const { tempId, transaction } = e.detail;
      setTransactions((prev) => prev.map((t) => (t.id === tempId ? transaction : t)));
    };
    const onFailed = (e: Event) => {
      // @ts-ignore
      const { tempId, error } = e.detail;
      setTransactions((prev) => prev.filter((t) => t.id !== tempId));
      setError(error || 'Failed to save transaction');
    };

    window.addEventListener('transaction:created', onCreated as EventListener);
    window.addEventListener('transaction:confirmed', onConfirmed as EventListener);
    window.addEventListener('transaction:create_failed', onFailed as EventListener);
    return () => {
      window.removeEventListener('transaction:created', onCreated as EventListener);
      window.removeEventListener('transaction:confirmed', onConfirmed as EventListener);
      window.removeEventListener('transaction:create_failed', onFailed as EventListener);
    };
  }, []);

  const totalExpense = useMemo(
    () => transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount_ngwee, 0),
    [transactions]
  );

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    trackEvent('add_transaction', {
      source: 'quick_form',
      type: form.type,
      amountNgwee: zmwToNgwee(form.amount),
      categoryId: form.categoryId
    });
    const payload = {
      type: form.type,
      amountNgwee: zmwToNgwee(form.amount),
      categoryId: form.categoryId,
      occurredAt: form.occurredAt,
      note: form.note || null
    };

    try {
      if (editingId) {
        await apiPatch(`/transactions/${editingId}`, payload);
      } else {
        await apiPost('/transactions', payload);
      }
      setEditingId(null);
      setForm({ type: 'expense', amount: '', categoryId: categories[0]?.id || '', occurredAt: dateToday(), note: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save transaction');
    }
  }

  // no local sheet; global sheet will dispatch events handled above

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <CardStat label="Transactions" value={String(transactions.length)} tone="sky" />
        <CardStat label="Expenses" value={ngweeToZmw(totalExpense)} tone="rose" />
        <CardStat label="Edit mode" value={editingId ? 'Active' : 'Idle'} tone="emerald" />
      </section>

      {/* add button moved to bottom nav FAB */}
      <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Quick transaction</h2>
          <span className="text-xs text-slate-600">Expense total: {ngweeToZmw(totalExpense)}</span>
        </div>
        <form className="space-y-2" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="rounded-xl border border-brand-100 px-3 py-3 text-sm"
              aria-label="Transaction type"
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as 'income' | 'expense' }))}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              className="rounded-xl border border-brand-100 px-3 py-3 text-sm"
              placeholder="Amount ZMW"
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
          </div>
          <select
            className="w-full rounded-xl border border-brand-100 px-3 py-3 text-sm"
            aria-label="Transaction category"
            value={form.categoryId}
            onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-xl border border-brand-100 px-3 py-3 text-sm"
            type="date"
            aria-label="Transaction date"
            value={form.occurredAt}
            onChange={(event) => setForm((prev) => ({ ...prev, occurredAt: event.target.value }))}
            required
          />
          <input
            className="w-full rounded-xl border border-brand-100 px-3 py-3 text-sm"
            placeholder="Note"
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white" type="submit">
            {editingId ? 'Update transaction' : 'Add transaction'}
          </button>
        </form>
      </section>

      {/* sheet is global in Shell */}

      <section className="space-y-2">
        {transactions.map((transaction) => {
          const isPending = String(transaction.id).startsWith('temp-');
          return (
            <article key={transaction.id} className={`rounded-xl border border-brand-100 bg-white p-3 shadow-soft ${isPending ? 'opacity-75' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{transaction.category_name}</p>
                  <p className="text-xs text-slate-500">{transaction.occurred_at}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-semibold ${transaction.type === 'expense' ? 'text-red-600' : 'text-brand-700'}`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {ngweeToZmw(transaction.amount_ngwee)}
                  </p>
                  {isPending ? (
                    <span className="flex items-center gap-2 text-xs text-slate-500">
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
                        <path d="M22 12a10 10 0 00-10-10" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Pending
                      <button
                        className="ml-2 rounded bg-white border px-2 py-1 text-xs"
                        onClick={() => window.dispatchEvent(new CustomEvent('retry-transaction', { detail: { tempId: transaction.id, source: 'inline' } }))}
                      >
                        Retry
                      </button>
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-600">{transaction.note ?? 'No note'}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700"
                  onClick={() => {
                    setEditingId(transaction.id);
                    setForm({
                      type: transaction.type,
                      amount: String(transaction.amount_ngwee / 100),
                      categoryId: transaction.category_id,
                      occurredAt: transaction.occurred_at,
                      note: transaction.note ?? ''
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                  onClick={() => {
                    void apiDelete(`/transactions/${transaction.id}`)
                      .then(load)
                      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to delete transaction'));
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function CardStat({ label, value, tone }: { label: string; value: string; tone: 'sky' | 'rose' | 'emerald' }) {
  const colors: Record<typeof tone, string> = {
    sky: 'bg-sky-500',
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
      <div className={`absolute left-0 top-0 h-1 w-full ${colors[tone]}`} />
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 font-mono text-[22px] font-semibold text-slate-900">{value}</p>
    </div>
  );
}
