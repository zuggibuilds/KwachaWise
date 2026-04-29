import { lazy, Suspense, useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import { dateToday, ngweeToZmw } from '../lib/format';
import type { ReportSummary } from '../lib/types';

const DailyTrendChart = lazy(() => import('../components/charts/DailyTrendChart').then((m) => ({ default: m.DailyTrendChart })));
const CategoryPieChart = lazy(() => import('../components/charts/CategoryPieChart').then((m) => ({ default: m.CategoryPieChart })));

export function ReportsPage() {
  const [from, setFrom] = useState(dateToday().slice(0, 8) + '01');
  const [to, setTo] = useState(dateToday());
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(): Promise<void> {
    const data = await apiGet<{ report: ReportSummary }>(`/reports/summary?from=${from}&to=${to}`);
    setReport(data.report);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load report'));
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <Card label="Income" value={report ? ngweeToZmw(report.totals.income_ngwee) : '...'} tone="emerald" />
        <Card label="Expenses" value={report ? ngweeToZmw(report.totals.expense_ngwee) : '...'} tone="rose" />
        <Card label="Savings rate" value={report ? `${Math.max(0, Math.round(((report.totals.income_ngwee - report.totals.expense_ngwee) / (report.totals.income_ngwee || 1)) * 100))}%` : '...'} tone="sky" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Report range</h2>
            <p className="text-xs text-slate-500">Choose dates and refresh the summary</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-xl border border-brand-100 px-3 py-3 text-sm" type="date" title="Report start date" aria-label="Report start date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <input className="rounded-xl border border-brand-100 px-3 py-3 text-sm" type="date" title="Report end date" aria-label="Report end date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button
            className="mt-2 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
            onClick={() => {
              setError(null);
              void load().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load report'));
            }}
          >
            Refresh report
          </button>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-900">Category mix</h2>
          <div className="mt-3">
            <Suspense fallback={<p className="text-sm text-slate-500">Loading chart...</p>}>
              <CategoryPieChart items={report?.byCategory ?? []} />
            </Suspense>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
        <h2 className="text-sm font-semibold text-slate-900">By day</h2>
        <div className="mt-3 h-56">
          <Suspense fallback={<p className="text-sm text-slate-500">Loading chart...</p>}>
            <DailyTrendChart items={report?.byDay ?? []} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'rose' | 'sky' }) {
  const colors: Record<typeof tone, string> = {
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500'
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-brand-100 bg-white p-4 shadow-soft">
      <div className={`absolute left-0 top-0 h-1 w-full ${colors[tone]}`} />
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 font-mono text-[22px] font-semibold text-slate-900">{value}</p>
    </div>
  );
}
