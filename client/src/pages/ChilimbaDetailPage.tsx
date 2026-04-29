import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiPatch, apiPost } from '../api/client';
import { ngweeToZmw } from '../lib/format';

interface Member {
  id: string;
  display_name: string;
  payout_position: number;
}

interface Payment {
  member_id: string;
  memberName: string;
  paid: 0 | 1;
}

interface Round {
  id: string;
  round_number: number;
  due_date: string | null;
  recipientName: string;
  payments: Payment[];
}

interface Detail {
  group: {
    id: string;
    name: string;
    status: 'draft' | 'active';
    contribution_amount_ngwee: number;
    frequency: 'weekly' | 'monthly';
    start_date: string;
  };
  members: Member[];
  currentRound: Round | null;
  history: Array<{
    id: string;
    round_number: number;
    recipientName: string;
    status: 'open' | 'completed';
    paidCount: number;
    paymentCount: number;
    completed_at: string | null;
  }>;
}

export function ChilimbaDetailPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(): Promise<void> {
    if (!id) return;
    const data = await apiGet<{ chilimba: Detail }>(`/chilimba/${id}`);
    setDetail(data.chilimba);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load group'));
  }, [id]);

  const allPaid = useMemo(() => {
    if (!detail?.currentRound) return false;
    return detail.currentRound.payments.every((payment) => payment.paid === 1);
  }, [detail]);

  if (!detail) {
    return <p className="text-sm text-slate-600">Loading chilimba...</p>;
  }

  return (
    <div className="space-y-4">
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{detail.group.name}</h2>
            <p className="mt-1 text-sm text-slate-600">Contribution: {ngweeToZmw(detail.group.contribution_amount_ngwee)}</p>
            <p className="text-xs text-slate-500">
              {detail.group.frequency} cycle, start {detail.group.start_date}
            </p>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${detail.group.status === 'active' ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'}`}>
            {detail.group.status}
          </span>
        </div>
        {detail.group.status === 'draft' ? (
          <button
            className="mt-3 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
            onClick={() => {
              void apiPost(`/chilimba/${detail.group.id}/start`, {})
                .then(load)
                .catch((err) => setError(err instanceof Error ? err.message : 'Unable to start group'));
            }}
          >
            Start and lock payout order
          </button>
        ) : null}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <h3 className="text-sm font-semibold text-slate-900">Members and payout order</h3>
          <ol className="mt-3 space-y-2 text-sm text-slate-700">
            {detail.members.map((member) => (
              <li key={member.id} className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-3">
                <span className="font-semibold text-slate-900">{member.payout_position}.</span> {member.display_name}
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-4">
          {detail.currentRound ? (
            <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Open round #{detail.currentRound.round_number}</h3>
                <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">{detail.currentRound.payments.length} payments</span>
              </div>
              <p className="text-sm text-slate-600">Recipient: {detail.currentRound.recipientName}</p>
              <p className="text-xs text-slate-500">Due date: {detail.currentRound.due_date ?? '-'}</p>
              <div className="mt-3 space-y-2">
                {detail.currentRound.payments.map((payment) => (
                  <label key={payment.member_id} className="flex items-center justify-between rounded-xl border border-brand-100 px-3 py-3">
                    <span className="text-sm text-slate-900">{payment.memberName}</span>
                    <input
                      type="checkbox"
                      checked={payment.paid === 1}
                      onChange={(event) => {
                        void apiPatch(`/chilimba/${detail.group.id}/rounds/${detail.currentRound?.id}/payments/${payment.member_id}`, {
                          paid: event.target.checked
                        })
                          .then(load)
                          .catch((err) => setError(err instanceof Error ? err.message : 'Unable to update payment'));
                      }}
                    />
                  </label>
                ))}
              </div>
              <button
                className="mt-3 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                disabled={!allPaid}
                onClick={() => {
                  void apiPost(`/chilimba/${detail.group.id}/rounds/${detail.currentRound?.id}/complete`, {})
                    .then(load)
                    .catch((err) => setError(err instanceof Error ? err.message : 'Unable to complete round'));
                }}
              >
                Complete round and open next
              </button>
            </section>
          ) : null}

          <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
            <h3 className="text-sm font-semibold text-slate-900">Round history</h3>
            <div className="mt-3 space-y-2">
              {detail.history.map((round) => (
                <div key={round.id} className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-3 text-sm text-slate-700">
                  Round {round.round_number}: {round.recipientName} ({round.paidCount}/{round.paymentCount} paid) - {round.status}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
