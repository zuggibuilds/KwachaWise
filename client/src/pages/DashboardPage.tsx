import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet } from '../api/client';
import { dateToday, ngweeToZmw } from '../lib/format';
import type { AiAdvisorInsight, Goal, ReportSummary, Transaction } from '../lib/types';

const DailyTrendChart = lazy(() => import('../components/charts/DailyTrendChart').then((m) => ({ default: m.DailyTrendChart })));
const CategoryPieChart = lazy(() => import('../components/charts/CategoryPieChart').then((m) => ({ default: m.CategoryPieChart })));

export function DashboardPage() {
  const navigate = useNavigate();
  const today = dateToday();
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [advisorInsights, setAdvisorInsights] = useState<AiAdvisorInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const from = today.slice(0, 8) + '01';
    void Promise.all([
      apiGet<{ report: ReportSummary }>(`/reports/summary?from=${from}&to=${today}`),
      apiGet<{ goals: Goal[] }>('/goals'),
      apiGet<{ transactions: Transaction[] }>('/transactions'),
      apiGet<{ insights: AiAdvisorInsight[] }>(`/ai/advice?from=${from}&to=${today}`)
    ])
      .then(([reportData, goalData, txData, advisorData]) => {
        setSummary(reportData.report);
        setGoals(goalData.goals);
        setTransactions(txData.transactions);
        setAdvisorInsights(advisorData.insights);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load dashboard'));
  }, [today]);

  const totalSaved = useMemo(() => goals.reduce((sum, goal) => sum + goal.current_amount_ngwee, 0), [goals]);
  const recentTransactions = transactions.slice(0, 5);
  const totalIncome = summary?.totals.income_ngwee ?? 0;
  const totalExpense = summary?.totals.expense_ngwee ?? 0;
  const net = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Income" value={summary ? ngweeToZmw(totalIncome) : '...'} tone="emerald" change="+12% vs last month" />
        <StatCard label="Expenses" value={summary ? ngweeToZmw(totalExpense) : '...'} tone="rose" change="+8% vs last month" />
        <StatCard label="Net Balance" value={summary ? ngweeToZmw(net) : '...'} tone="sky" change="+18% vs last month" />
        <StatCard label="Saved in Goals" value={ngweeToZmw(totalSaved)} tone="amber" change="K 300 this month" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Daily trend</h2>
              <p className="text-xs text-slate-500">Income vs expenses this month</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" />Income</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-400" />Expense</span>
            </div>
          </div>
          <div className="h-56">
            <Suspense fallback={<p className="text-sm text-slate-500">Loading chart...</p>}>
              <DailyTrendChart items={summary?.byDay ?? []} />
            </Suspense>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-900">AI Financial Advisor</h2>
          <p className="mt-1 text-xs text-slate-500">Actionable insights from your current month</p>
          <div className="mt-4 space-y-3">
            {advisorInsights.map((insight) => (
              <div key={insight.id} className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{insight.title}</p>
                <p className="mt-1">{insight.message}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['How can I save more?', 'Analyse my spending', 'Budget advice'].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => navigate(`/chatbot?prompt=${encodeURIComponent(chip)}`)}
                className="rounded-full border border-brand-100 bg-white px-3 py-2 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-900">Expense by category</h2>
          <div className="mt-3">
            <Suspense fallback={<p className="text-sm text-slate-500">Loading chart...</p>}>
              <CategoryPieChart items={summary?.byCategory ?? []} />
            </Suspense>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Transactions</h2>
              <p className="text-xs text-slate-500">Latest activity across the app</p>
            </div>
            <Link to="/transactions" className="text-xs font-medium text-brand-700">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recentTransactions.map((transaction) => (
              <article key={transaction.id} className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm shadow-sm">
                  {transaction.type === 'expense' ? '−' : '+'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{transaction.category_name}</p>
                  <p className="text-xs text-slate-500">{transaction.occurred_at}</p>
                </div>
                <div className={`text-sm font-semibold ${transaction.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {ngweeToZmw(transaction.amount_ngwee)}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Quick Actions</h2>
              <p className="text-xs text-slate-500">Jump straight into common tasks</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <QuickAction label="Add Transaction" onClick={() => window.dispatchEvent(new CustomEvent('open-transaction-sheet'))} />
            <QuickAction label="New Goal" onClick={() => navigate('/goals')} />
            <QuickAction label="Chilimba Group" onClick={() => navigate('/chilimba/create')} />
            <QuickAction label="PAYE Calculator" onClick={() => navigate('/paye')} />
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Savings Goals</h2>
              <p className="text-xs text-slate-500">Current progress across active goals</p>
            </div>
            <Link to="/goals" className="text-xs font-medium text-brand-700">
              Open goals
            </Link>
          </div>
          <div className="space-y-3">
            {goals.slice(0, 3).map((goal) => {
              const progress = Math.min(100, Math.round((goal.current_amount_ngwee / goal.target_amount_ngwee) * 100));
              return (
                <div key={goal.id} className="rounded-xl border border-brand-100 bg-brand-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">{goal.name}</span>
                    <span className="font-mono text-brand-700">{progress}%</span>
                  </div>
                  <progress className="mt-2 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-white/20 [&::-webkit-progress-value]:bg-[#00c896]" value={progress} max={100} />
                  <p className="mt-2 text-xs text-slate-500">
                    {ngweeToZmw(goal.current_amount_ngwee)} / {ngweeToZmw(goal.target_amount_ngwee)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone, change }: { label: string; value: string; tone: 'emerald' | 'rose' | 'sky' | 'amber'; change: string }) {
  const accents: Record<string, string> = {
    emerald: 'bg-[#00c896]',
    rose: 'bg-[#e24b4a]',
    sky: 'bg-[#378add]',
    amber: 'bg-[#f5a623]'
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
      <div className={`absolute left-0 top-0 h-1 w-full ${accents[tone]}`} />
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 font-mono text-[22px] font-semibold text-slate-900">{value}</p>
      <p className={`mt-2 text-xs ${tone === 'rose' ? 'text-rose-500' : 'text-emerald-500'}`}>{change}</p>
    </div>
  );
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-2xl border border-brand-100 bg-brand-50 px-3 py-4 text-left transition hover:bg-brand-100">
      <div className="text-lg text-brand-700">+</div>
      <div className="mt-2 text-xs font-medium text-slate-700">{label}</div>
    </button>
  );
}
