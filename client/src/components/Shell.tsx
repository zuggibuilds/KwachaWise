import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useAuth } from '../lib/auth';
import TransactionSheet from '../components/domain/TransactionSheet';
import { useEffect, useState } from 'react';
import { apiPost } from '../api/client';
import { useRef } from 'react';
import { trackEvent } from '../lib/analytics';
import type { Transaction } from '../lib/types';

const titleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/goals': 'Savings Goals',
  '/reports': 'Reports',
  '/paye': 'PAYE Calculator',
  '/chilimba': 'Chilimba',
  '/chilimba/create': 'Create Chilimba',
  '/more': 'More'
  ,'/chatbot': 'AI Chatbot'
};

export function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const title = titleMap[location.pathname] ?? 'KwachaWise';
  const subtitleMap: Record<string, string> = {
    '/': 'Good morning, Knowledge — April 28, 2026',
    '/transactions': 'All your income and expenses',
    '/budgets': 'Track spending against your limits',
    '/goals': 'Your savings targets and progress',
    '/reports': 'Date range insights with charts',
    '/paye': 'Estimate your Zambian net pay',
    '/chilimba': 'Manage your rotating savings groups',
    '/chilimba/create': 'Create a new savings circle',
    '/more': 'Tools and shortcuts'
    ,'/chatbot': 'Ask personalized finance questions'
  };
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const pendingRef = useRef(new Map<string, any>());
  const navItems = [
    { to: '/', label: 'Dashboard', icon: '◫' },
    { to: '/transactions', label: 'Transactions', icon: '≣' },
    { to: '/budgets', label: 'Budgets', icon: '◔' },
    { to: '/goals', label: 'Goals', icon: '◎' },
    { to: '/chilimba', label: 'Chilimba', icon: '◈' },
    { to: '/paye', label: 'PAYE', icon: '≡' },
    { to: '/more', label: 'More', icon: '⋯' }
  ];

  useEffect(() => {
    const onOpen = () => setSheetOpen(true);
    window.addEventListener('open-transaction-sheet', onOpen as EventListener);
    return () => window.removeEventListener('open-transaction-sheet', onOpen as EventListener);
  }, []);

  useEffect(() => {
    const onRetry = (e: Event) => {
      const detail = (e as CustomEvent<{ tempId?: string; source?: string }>).detail || {};
      const { tempId, source = 'unknown' } = detail;
      if (!tempId) return;
      const payload = pendingRef.current.get(tempId);
      if (!payload) return;
      trackEvent('retry_transaction', { source, tempId });
      // re-send
      (async () => {
        try {
          const res = await apiPost<{ transaction: Transaction }>('/transactions', payload);
          window.dispatchEvent(new CustomEvent('transaction:confirmed', { detail: { tempId, transaction: res.transaction } }));
          pendingRef.current.delete(tempId);
          setPendingSyncCount(pendingRef.current.size);
        } catch (err) {
          window.dispatchEvent(new CustomEvent('transaction:create_failed', { detail: { tempId, error: err instanceof Error ? err.message : String(err) } }));
        }
      })();
    };
    window.addEventListener('retry-transaction', onRetry as EventListener);
    return () => window.removeEventListener('retry-transaction', onRetry as EventListener);
  }, []);

  async function handleGlobalSave(tx: { amount: number; type: 'expense' | 'income'; category: string; date: string; note?: string; recurrence?: { frequency: string; interval?: number; dayOfMonth?: number | null; weekday?: number | null } }) {
    trackEvent('add_transaction', {
      source: 'global_sheet',
      type: tx.type,
      amountNgwee: tx.amount,
      categoryId: tx.category
    });
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      amount_ngwee: tx.amount,
      type: tx.type,
      category_name: tx.category,
      category_id: tx.category,
      occurred_at: tx.date,
      note: tx.note ?? null
    };
    const payload = {
      type: tx.type,
      amountNgwee: tx.amount,
      categoryId: tx.category,
      occurredAt: tx.date,
      note: tx.note || null
    };
    // If recurrence specified, create recurring schedule server-side (non-blocking)
    if (tx.recurrence && tx.recurrence.frequency && tx.recurrence.frequency !== 'none') {
      void apiPost('/recurring', {
        type: tx.type,
        amount_ngwee: tx.amount,
        category_id: tx.category,
        frequency: tx.recurrence.frequency,
        interval: tx.recurrence.interval ?? 1,
        day_of_month: tx.recurrence.dayOfMonth ?? null,
        weekday: tx.recurrence.weekday ?? null,
        next_occurrence: tx.date
      }).catch((err) => {
        console.error('Failed to create recurring schedule', err);
        window.dispatchEvent(
          new CustomEvent('recurring:create_failed', {
            detail: { error: err instanceof Error ? err.message : String(err) }
          })
        );
      });
    }
    pendingRef.current.set(tempId, payload);
    setPendingSyncCount(pendingRef.current.size);
    // optimistic insert
    window.dispatchEvent(new CustomEvent('transaction:created', { detail: optimistic }));
    try {
      const res = await apiPost<{ transaction: Transaction }>('/transactions', {
        type: tx.type,
        amountNgwee: tx.amount,
        categoryId: tx.category,
        occurredAt: tx.date,
        note: tx.note || null
      });
      // expected server returns { transaction }
      window.dispatchEvent(new CustomEvent('transaction:confirmed', { detail: { tempId, transaction: res.transaction } }));
      pendingRef.current.delete(tempId);
      setPendingSyncCount(pendingRef.current.size);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('transaction:create_failed', { detail: { tempId, error: err instanceof Error ? err.message : String(err) } }));
      throw err;
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] md:grid md:grid-cols-[220px_1fr]">
      <aside className="hidden min-h-screen flex-col border-r border-[#30363d] bg-[#161b22] md:flex md:sticky md:top-0">
        <div className="border-b border-[#30363d] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00c896] text-sm font-semibold text-[#0d1117]">K</div>
            <div>
              <div className="text-base font-semibold text-[#e6edf3]">KwachaWise</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#8b949e]">Personal Finance</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4">
          <p className="px-2 text-[10px] uppercase tracking-[0.25em] text-[#484f58]">Main</p>
          <div className="mt-3 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                    active ? 'bg-emerald-500/12 text-[#00c896]' : 'text-[#8b949e] hover:bg-white/5 hover:text-[#e6edf3]'
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${active ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-[#30363d] bg-[#0d1117]'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        <div className="border-t border-[#30363d] p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#30363d] bg-[#0d1117] p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00c896] to-[#0088cc] text-xs font-semibold text-white">K</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[#e6edf3]">{title}</div>
              <div className="truncate text-xs text-[#8b949e]">{subtitleMap[location.pathname] ?? 'Live workspace'}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="mt-3 w-full rounded-xl border border-[#30363d] px-3 py-2 text-xs font-semibold text-[#c9d1d9] transition hover:border-[#00c896]/40 hover:text-[#e6edf3]"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 pb-20 md:pb-0">
        <Header title={title} subtitle={subtitleMap[location.pathname]} pendingSyncCount={pendingSyncCount} />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
          <Outlet />
        </main>
        <BottomNav />
        <TransactionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSave={handleGlobalSave} />
      </div>
    </div>
  );
}
