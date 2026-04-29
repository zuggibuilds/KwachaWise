import { useState } from 'react';
import { apiPost } from '../api/client';
import { dateToday, ngweeToZmw, zmwToNgwee } from '../lib/format';

interface PayeResult {
  paye_ngwee: number;
  net_pay_ngwee: number;
  breakdown: Array<{ bandOrder: number; taxableNgwee: number; ratePercent: number; taxNgwee: number }>;
}

export function PayePage() {
  const [gross, setGross] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(dateToday());
  const [result, setResult] = useState<PayeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function calculate(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      const data = await apiPost<PayeResult>('/paye/calculate', {
        gross_monthly_ngwee: zmwToNgwee(gross),
        effective_date: effectiveDate
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate PAYE');
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <form className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft" onSubmit={calculate}>
        <h2 className="mb-1 text-sm font-semibold text-slate-900">Monthly PAYE estimate</h2>
        <p className="mb-3 text-xs text-slate-500">Zambia Revenue Authority tax bands and deductions</p>
        <input
          className="mb-2 w-full rounded-xl border border-brand-100 px-3 py-3 text-sm"
          placeholder="Gross monthly income in ZMW"
          value={gross}
          onChange={(event) => setGross(event.target.value)}
          required
        />
        <input
          className="w-full rounded-xl border border-brand-100 px-3 py-3 text-sm"
          type="date"
          title="PAYE effective date"
          aria-label="PAYE effective date"
          value={effectiveDate}
          onChange={(event) => setEffectiveDate(event.target.value)}
        />
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <button className="mt-2 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white" type="submit">
          Calculate PAYE
        </button>
        {result ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MiniStat label="PAYE" value={ngweeToZmw(result.paye_ngwee)} tone="rose" />
            <MiniStat label="Net pay" value={ngweeToZmw(result.net_pay_ngwee)} tone="emerald" />
          </div>
        ) : null}
      </form>

      <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Tax breakdown</h2>
            <p className="text-xs text-slate-500">How your salary is taxed</p>
          </div>
          <div className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {result ? `${Math.round((result.paye_ngwee / (result.net_pay_ngwee + result.paye_ngwee)) * 100)}% effective` : 'Ready'}
          </div>
        </div>

        {result ? (
          <div className="space-y-2">
            {result.breakdown.map((item) => (
              <div key={item.bandOrder} className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-3 text-sm">
                Band {item.bandOrder}: {item.ratePercent}% on {ngweeToZmw(item.taxableNgwee)} = {ngweeToZmw(item.taxNgwee)}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-brand-100 bg-brand-50 text-sm text-slate-500">
            Enter a gross salary to view PAYE breakdown
          </div>
        )}
      </section>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'rose' }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50 p-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className={`mt-2 font-mono text-[20px] font-semibold ${tone === 'rose' ? 'text-rose-500' : 'text-emerald-500'}`}>{value}</p>
    </div>
  );
}
